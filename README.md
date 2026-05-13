# Zen Mahjong

Zen Mahjong is an investor-demo ready Next.js 15 app for an AI-powered focus Mahjong platform. It includes premium dark cinematic UI, complete routing, modular architecture, shadcn-style UI primitives, Framer Motion polish, and env-gated Firebase Auth/Firestore scaffolding.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Checks

```bash
npm run lint
npm run build
```

## Firebase

The app works without Firebase credentials by using demo data. To enable live Firebase Auth and Firestore, copy `.env.example` to `.env.local` and provide the `NEXT_PUBLIC_FIREBASE_*` values from a Firebase web app.

## Firebase Setup

1. Create a Firebase project.
2. Add a Web App in Firebase Console.
3. Enable Authentication.
4. Enable the Email/Password provider.
5. Enable the Google provider.
6. Add authorized domains:
   - `localhost`
   - `your-project.vercel.app`
7. Create a Firestore Database.
8. Add these variables to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

9. Add the same variables to Vercel Environment Variables.

Firestore users are stored at `users/{uid}` with:

```ts
{
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  city?: string;
  createdAt: serverTimestamp();
  updatedAt: serverTimestamp();
  provider: "email" | "google";
}
```

## Routes

- `/`
- `/login`
- `/register`
- `/onboarding`
- `/tutorial`
- `/dashboard`
- `/game`
- `/leaderboard`
- `/stats`
- `/shop`
- `/battle-pass`
- `/profile`
# zenmahjong
