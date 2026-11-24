"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  sendPasswordResetEmail,
  linkWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { FiX, FiUser } from "react-icons/fi";
import { firebaseServices } from "@/lib/firebase";
import { useAppStore } from "@/lib/store";
export default function AuthModal() {
  const { authOpen, authMode, openAuth, closeAuth } = useAppStore();
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const router = useRouter();
  useEffect(() => {
    setError("");
    setNotice("");
  }, [authMode, authOpen]);
  useEffect(() => {
    if (!authOpen) return;
    const previous = document.activeElement as HTMLElement;
    dialog.current?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [authOpen]);
  if (!authOpen) return null;
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim(),
      password = String(form.get("password") || "");
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { auth } = firebaseServices();
      if (authMode === "register") {
        if (auth.currentUser?.isAnonymous)
          await linkWithCredential(
            auth.currentUser,
            EmailAuthProvider.credential(email, password),
          );
        else await createUserWithEmailAndPassword(auth, email, password);
      } else if (authMode === "reset") {
        await sendPasswordResetEmail(auth, email);
        setNotice(
          "If an account exists, a password reset email has been sent.",
        );
        return;
      } else await signInWithEmailAndPassword(auth, email, password);
      closeAuth();
      router.push("/for-you");
    } catch (e) {
      const code = (e as { code?: string }).code;
      setError(
        code === "auth/email-already-in-use"
          ? "An account already uses this email."
          : code === "auth/weak-password"
            ? "Use at least 6 characters for your password."
            : code === "auth/invalid-email"
              ? "Enter a valid email address."
              : code === "auth/invalid-credential"
                ? "The email or password is incorrect."
                : code === "auth/too-many-requests"
                  ? "Too many attempts. Please try again later."
                  : code
                    ? "Unable to sign in. Please try again."
                    : (e as Error).message,
      );
    } finally {
      setBusy(false);
    }
  }
  async function guest() {
    setBusy(true);
    setError("");
    try {
      await signInAnonymously(firebaseServices().auth);
      closeAuth();
      router.push("/for-you");
    } catch (e) {
      setError(
        (e as { code?: string }).code
          ? "Guest login is unavailable. Please try again."
          : (e as Error).message,
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="auth-modal"
      aria-label={
        authMode === "register" ? "Sign up to Summarist" : "Log in to Summarist"
      }
      onCancel={(e) => {
        e.preventDefault();
        closeAuth();
      }}
      onClick={(e) => {
        if (e.target === dialog.current) closeAuth();
      }}
    >
      <button
        className="auth-close"
        onClick={closeAuth}
        aria-label="Close login"
      >
        <FiX />
      </button>
      <div className="auth-content">
        <h2>
          {authMode === "register"
            ? "Sign up to Summarist"
            : authMode === "reset"
              ? "Reset your password"
              : "Log in to Summarist"}
        </h2>
        {authMode === "login" && (
          <>
            <button className="guest-btn" disabled={busy} onClick={guest}>
              <FiUser />
              Login as a Guest
            </button>
            <div className="auth-divider">or</div>
          </>
        )}
        <form onSubmit={submit}>
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            aria-label="Email Address"
            autoComplete="email"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            aria-label="Password"
            autoComplete={
              authMode === "register" ? "new-password" : "current-password"
            }
            minLength={authMode === "register" ? 6 : undefined}
            required={authMode !== "reset"}
            hidden={authMode === "reset"}
          />
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {notice && <p role="status">{notice}</p>}
          <button className="btn" disabled={busy}>
            {busy
              ? "Please wait…"
              : authMode === "register"
                ? "Sign up"
                : authMode === "reset"
                  ? "Send reset link"
                  : "Login"}
          </button>
        </form>
        {authMode === "login" && (
          <button className="auth-text" onClick={() => openAuth("reset")}>
            Forgot your password?
          </button>
        )}
      </div>
      <button
        className="auth-switch"
        onClick={() => openAuth(authMode === "login" ? "register" : "login")}
      >
        {authMode === "login"
          ? "Don't have an account?"
          : "Already have an account? Login"}
      </button>
    </dialog>
  );
}
