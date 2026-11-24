# Summarist

Advanced FES internship project built with Next.js App Router, TypeScript, Firebase and Zustand. The landing page uses the supplied Summarist starter; the application follows the course reference.

## Run locally

1. Install Node.js 22 or later and run `npm ci`.
2. Copy `.env.example` to `.env.local` and add the Firebase web app configuration and Stripe test price IDs.
3. Run `npm run dev`.
4. Run `npm run typecheck`, `npm test` and `npm run build` before deploying.

Book browsing uses the real course API without credentials. Authentication, saved books and subscriptions require your own Firebase project. Missing credentials show an error rather than granting demo access.

## Data and components

- `lib/books.ts` fetches the course API, aborts stale requests, handles errors and reads audio metadata.
- `Providers` observes Firebase authentication, Firestore subscriptions and each user's saved books.
- `lib/store.ts` stores shared session and interface state in Zustand.
- `Shell` supplies navigation and debounced search. Home and pricing use their own layouts.
- `BookDetails` checks sign-in and plan before navigating to `Player`. Player also checks direct route access.
- `Player` uses an HTML audio element for seeking, progress and play/pause. Completed audio updates the library.
- `Plans` creates a checkout-session request. The Firebase Stripe extension creates the actual Stripe session. Premium status comes only from the subscription documents written by the backend.
- `firestore.rules` prevents clients from assigning subscription status or arbitrary checkout prices.

The course API is public and includes book summaries and audio URLs. The app's entitlement checks demonstrate the assignment flow; protecting copyrighted content in production would also require a private, authorized content API.

## Firebase and Stripe setup

1. Create a Firebase project and register a web app. Enable Email/Password and Anonymous authentication.
2. Create Firestore. Add localhost and the production hostname to Authentication's authorized domains.
3. Install the official Run Payments with Stripe extension maintained by Invertase, using **Stripe test mode**. Firebase may require the billed Blaze plan for its backend functions.
4. Use the `customers` collection for customer/subscription data and `products` for the product catalog. Enable customer synchronization for Firebase Auth.
5. Create recurring test prices: Premium Monthly ($9.99/month) and Premium Plus Yearly ($99.99/year). Set the products' `firebaseRole` metadata to `premium` and `premium-plus`. Annual checkout includes a seven-day trial.
6. Put only public Firebase web configuration and test price IDs in the environment variables. Keep the Stripe restricted/secret key in the extension's secure configuration, never in this repository or a NEXT_PUBLIC variable.
7. Create an admin-managed Firestore document `config/billing` with `monthlyPrice`, `yearlyPrice`, and `origin` (the exact deployed origin, without a trailing slash). Clients cannot edit this document.
8. Deploy `firestore.rules` to the project.
9. Import this repository into Vercel, add the environment variables, and deploy. Rebuild after changing public environment variables.

## Verification still required against configured services

- Register, sign out, sign in, invalid credentials, guest and password reset.
- Save a book and confirm it persists after a new session.
- Complete monthly and yearly Stripe **test** checkouts; verify the annual seven-day trial and Firestore plan updates.
- Verify free/premium book access on direct player URLs.
- Verify expired/canceled subscriptions revoke access.
- Check mobile navigation, search, audio seeking and production refresh on nested routes.

Do not use a real card for this coursework test integration.
