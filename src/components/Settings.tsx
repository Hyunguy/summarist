"use client";
import Link from "next/link";
import Shell from "./Shell";
import { Skeleton } from "./BookCard";
import { useAppStore } from "@/lib/store";
export function LoginPrompt({
  message = "Log in to your account to see your details.",
}: {
  message?: string;
}) {
  const openAuth = useAppStore((s) => s.openAuth);
  return (
    <div className="login-prompt">
      <img src="/assets/login.png" alt="Log in to continue" />
      <h2>{message}</h2>
      <button className="btn" onClick={() => openAuth()}>
        Login
      </button>
    </div>
  );
}
export default function Settings() {
  const { user, ready, plan, subscriptionReady, serviceError } = useAppStore();
  return (
    <Shell>
      <h1 className="page-heading">Settings</h1>
      {!ready ? (
        <Skeleton kind="detail" />
      ) : !user ? (
        <LoginPrompt />
      ) : (
        <>
          {serviceError && (
            <p role="alert" className="form-error">
              {serviceError}
            </p>
          )}
          <section className="settings-section">
            <h2>Your Subscription plan</h2>
            {!subscriptionReady ? (
              <Skeleton kind="line" />
            ) : (
              <>
                <p>
                  {plan === "basic"
                    ? "Basic"
                    : plan === "premium"
                      ? "Premium"
                      : "Premium Plus"}
                </p>
                {plan === "basic" && (
                  <Link className="btn upgrade-btn" href="/choose-plan">
                    Upgrade to Premium
                  </Link>
                )}
              </>
            )}
          </section>
          <section className="settings-section">
            <h2>Email</h2>
            <p>{user.email || "Guest account"}</p>
          </section>
        </>
      )}
    </Shell>
  );
}
