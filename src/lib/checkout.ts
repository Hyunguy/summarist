import { addDoc, collection, onSnapshot } from "firebase/firestore";
import { firebaseServices } from "./firebase";
export async function startCheckout(
  uid: string,
  yearly: boolean,
): Promise<string> {
  const price = yearly
    ? process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID
    : process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID;
  if (!price)
    throw new Error(
      "Subscriptions are temporarily unavailable. Please try again later.",
    );
  const session = await addDoc(
    collection(firebaseServices().db, "customers", uid, "checkout_sessions"),
    {
      price,
      success_url: location.origin + "/settings?checkout=success",
      cancel_url: location.origin + "/choose-plan",
      ...(yearly ? { trial_period_days: 7 } : {}),
    },
  );
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      stop();
      reject(new Error("Checkout took too long to respond. Please try again."));
    }, 30000);
    const stop = onSnapshot(
      session,
      (snapshot) => {
        const data = snapshot.data();
        if (data?.error) {
          clearTimeout(timer);
          stop();
          reject(new Error("Unable to open checkout. Please try again."));
        }
        if (data?.url) {
          clearTimeout(timer);
          stop();
          const url = new URL(data.url);
          url.hostname === "checkout.stripe.com" && url.protocol === "https:"
            ? resolve(url.href)
            : reject(new Error("Invalid checkout response."));
        }
      },
      () => {
        clearTimeout(timer);
        stop();
        reject(new Error("Unable to connect to checkout. Please try again."));
      },
    );
  });
}
