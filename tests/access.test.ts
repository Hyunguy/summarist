import { test } from "node:test";
import assert from "node:assert/strict";
import {
  accessDestination,
  formatTime,
  subscriptionPlan,
} from "../src/lib/access";
test("signed-out visitors must authenticate even for free books", () => {
  assert.equal(accessDestination(false, "basic", false), "auth");
  assert.equal(accessDestination(false, "premium", true), "auth");
});
test("basic accounts can read free books but premium books require a plan", () => {
  assert.equal(accessDestination(true, "basic", false), "player");
  assert.equal(accessDestination(true, "basic", true), "plan");
  for (const plan of ["premium", "premium-plus"] as const)
    assert.equal(accessDestination(true, plan, true), "player");
});
test("only active or trialing subscriptions grant access", () => {
  for (const status of [
    "past_due",
    "canceled",
    "unpaid",
    "incomplete",
    "incomplete_expired",
    "paused",
  ])
    assert.equal(subscriptionPlan([{ status, role: "premium-plus" }]), "basic");
  assert.equal(subscriptionPlan([]), "basic");
  assert.equal(
    subscriptionPlan([{ status: "trialing", role: "premium-plus" }]),
    "premium-plus",
  );
  assert.equal(subscriptionPlan([{ status: "active" }]), "premium");
  assert.equal(
    subscriptionPlan([
      {
        status: "active",
        items: [{ price: { recurring: { interval: "year" } } }],
      },
    ]),
    "premium-plus",
  );
});
test("formats metadata and handles uninitialized audio duration", () => {
  assert.equal(formatTime(203.8), "03:23");
  assert.equal(formatTime(0), "00:00");
  for (const value of [NaN, Infinity, -1])
    assert.equal(formatTime(value), "00:00");
});
