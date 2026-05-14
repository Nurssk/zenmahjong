# Firebase Firestore Notes

## Account Economy

Zen Mahjong stores logged-in player economy balances in this document:

```txt
users/{uid}/economy/current
```

Expected fields:

```ts
{
  userId: string;
  coins: number;
  gems: number;
  hints: number;
  undos: number;
  createdAt?: string;
  updatedAt: string;
}
```

Suggested security rule:

```txt
match /users/{userId}/economy/{docId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

Guest economy remains local-only under `zen-mahjong:economy` and should not be merged into an account automatically unless a one-time migration flow is explicitly implemented.
