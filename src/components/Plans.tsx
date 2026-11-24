"use client";
import { useState } from "react";
import { FiFileText, FiUsers, FiHeart, FiChevronDown } from "react-icons/fi";
import Footer from "./Footer";
import { useAppStore } from "@/lib/store";
import { startCheckout } from "@/lib/checkout";
const faqs = [
  [
    "How does the free 7-day trial work?",
    "Begin your complimentary 7-day trial with a Summarist annual membership. You are under no obligation to continue your subscription, and you will only be billed when the trial period expires. With Premium access, you can learn at your own pace and as frequently as you desire, and you may terminate your subscription prior to the conclusion of the 7-day free trial.",
  ],
  [
    "Can I switch subscriptions from monthly to yearly, or yearly to monthly?",
    "While an annual plan is active, it is not feasible to switch to a monthly plan. However, once the current month ends, transitioning from a monthly plan to an annual plan is an option.",
  ],
  [
    "What's included in the Premium plan?",
    "Premium membership provides you with the ultimate Summarist experience, including unrestricted entry to many best-selling books and high-quality audio.",
  ],
  [
    "Can I cancel during my trial or subscription?",
    "You will not be charged if you cancel your trial before its conclusion. While you will not have complete access to the entire Summarist library, you can still expand your knowledge with one curated book per day.",
  ],
];
export default function Plans() {
  const [yearly, setYearly] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const { user, openAuth, ready, plan, subscriptionReady } = useAppStore();
  async function checkout() {
    if (!user) {
      openAuth();
      return;
    }
    if (user.isAnonymous) {
      openAuth("register");
      return;
    }
    setBusy(true);
    setError("");
    try {
      location.assign(await startCheckout(user.uid, yearly));
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <>
      <main className="plans-page">
        <section className="plans-top">
          <h1>Get unlimited access to many amazing books to read</h1>
          <p>Turn ordinary moments into amazing learning opportunities</p>
          <img src="/assets/pricing-top.png" alt="Reading with Summarist" />
        </section>
        <div className="plan-benefits">
          <div>
            <FiFileText />
            <p>Key ideas in few min with many books to read</p>
          </div>
          <div>
            <FiUsers />
            <p>3 million people growing with Summarist everyday</p>
          </div>
          <div>
            <FiHeart />
            <p>Precise recommendations collections curated by experts</p>
          </div>
        </div>
        <section className="plan-options">
          <h2>Choose the plan that fits you</h2>
          <label className={"plan-option " + (yearly ? "chosen" : "")}>
            <input
              type="radio"
              name="plan"
              checked={yearly}
              onChange={() => setYearly(true)}
            />
            <div>
              <h3>Premium Plus Yearly</h3>
              <strong>$99.99/year</strong>
              <p>7-day free trial included</p>
            </div>
          </label>
          <div className="plan-or">or</div>
          <label className={"plan-option " + (!yearly ? "chosen" : "")}>
            <input
              type="radio"
              name="plan"
              checked={!yearly}
              onChange={() => setYearly(false)}
            />
            <div>
              <h3>Premium Monthly</h3>
              <strong>$9.99/month</strong>
              <p>No trial included</p>
            </div>
          </label>
        </section>
        <div className="plan-cta">
          <button
            className="btn"
            disabled={
              busy ||
              !ready ||
              (!!user && !subscriptionReady) ||
              plan !== "basic"
            }
            onClick={checkout}
          >
            {busy
              ? "Opening checkout…"
              : plan !== "basic"
                ? "You have an active subscription"
                : yearly
                  ? "Start your free 7-day trial"
                  : "Start your monthly subscription"}
          </button>
          <p>
            {yearly
              ? "Cancel your trial at any time before it ends, and you won’t be charged."
              : "Cancel your subscription at any time."}
          </p>
          {user?.isAnonymous && (
            <p>Create an account to start your subscription.</p>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </div>
        <section className="plan-faq" aria-label="Frequently asked questions">
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <FiChevronDown />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
