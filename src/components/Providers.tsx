"use client";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { firebaseConfigured, firebaseServices } from "@/lib/firebase";
import { useAppStore } from "@/lib/store";
import { subscriptionPlan } from "@/lib/access";
import type { SavedBook } from "@/lib/types";
import AuthModal from "./AuthModal";
export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!firebaseConfigured) {
      useAppStore.setState({
        ready: true,
        subscriptionReady: true,
        libraryReady: true,
      });
      return;
    }
    const { auth, db } = firebaseServices();
    let stopSubs = () => {},
      stopLibrary = () => {};
    const stopAuth = onAuthStateChanged(auth, (user) => {
      stopSubs();
      stopLibrary();
      useAppStore.setState({
        user,
        ready: true,
        plan: "basic",
        library: [],
        libraryReady: !user,
        subscriptionReady: !user,
        serviceError: "",
      });
      if (user) {
        stopSubs = onSnapshot(
          collection(db, "customers", user.uid, "subscriptions"),
          (snapshot) => {
            useAppStore.setState({
              plan: subscriptionPlan(
                snapshot.docs.map((d) => d.data()) as Parameters<
                  typeof subscriptionPlan
                >[0],
              ),
              subscriptionReady: true,
            });
          },
          () =>
            useAppStore.setState({
              subscriptionReady: true,
              serviceError:
                "Subscription information could not be loaded. Please refresh to retry.",
            }),
        );
        stopLibrary = onSnapshot(
          collection(db, "users", user.uid, "library"),
          (snapshot) => {
            useAppStore.setState({
              library: snapshot.docs.map((d) => d.data() as SavedBook),
              libraryReady: true,
            });
          },
          () =>
            useAppStore.setState({
              serviceError:
                "Your library could not be loaded. Please refresh to retry.",
              libraryReady: true,
            }),
        );
      }
    });
    return () => {
      stopAuth();
      stopSubs();
      stopLibrary();
    };
  }, []);
  return (
    <>
      {children}
      <AuthModal />
    </>
  );
}
