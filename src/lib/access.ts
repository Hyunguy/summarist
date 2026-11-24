import type { Plan } from "./types";
export function accessDestination(
  signedIn: boolean,
  plan: Plan,
  required: boolean,
): "auth" | "plan" | "player" {
  if (!signedIn) return "auth";
  return required && plan === "basic" ? "plan" : "player";
}
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  return (
    Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0") +
    ":" +
    Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0")
  );
}
export function subscriptionPlan(
  subscriptions: {
    status: string;
    role?: string;
    items?: { price?: { recurring?: { interval?: string } } }[];
  }[],
): Plan {
  const active = subscriptions.filter((s) =>
    ["active", "trialing"].includes(s.status),
  );
  if (
    active.some(
      (s) =>
        s.role === "premium-plus" ||
        s.items?.some((i) => i.price?.recurring?.interval === "year"),
    )
  )
    return "premium-plus";
  return active.length ? "premium" : "basic";
}
