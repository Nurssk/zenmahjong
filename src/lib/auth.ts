import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, googleProvider, isFirebaseConfigured } from "@/src/lib/firebase";
import { resolvePostAuthRedirectPath } from "@/src/lib/progress/tutorial-progress-service";

export type AuthProviderId = "email" | "google";
export type FocusGoal = "relax" | "attention" | "daily_challenges" | "leaderboard";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type PreferredSessionLength = 3 | 5 | 10;

export type FirestoreUser = {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  city?: string;
  onboardingCompleted: boolean;
  focusGoal?: FocusGoal;
  preferredSessionLength?: PreferredSessionLength;
  experienceLevel?: ExperienceLevel;
  createdAt?: unknown;
  updatedAt?: unknown;
  provider: AuthProviderId;
};

export type OnboardingProfileInput = {
  focusGoal: FocusGoal;
  experienceLevel: ExperienceLevel;
  city: string;
  preferredSessionLength: PreferredSessionLength;
};

export class AuthConfigurationError extends Error {
  constructor() {
    super("Firebase не настроен. Добавьте переменные окружения в .env.local.");
    this.name = "AuthConfigurationError";
  }
}

function assertFirebaseReady() {
  if (!isFirebaseConfigured || !auth || !db) {
    throw new AuthConfigurationError();
  }

  return { auth, db };
}

export function mapFirebaseAuthError(error: unknown) {
  if (error instanceof AuthConfigurationError) {
    return error.message;
  }

  const code = error instanceof FirebaseError ? error.code : "";

  const messages: Record<string, string> = {
    "auth/user-not-found": "Пользователь не найден",
    "auth/wrong-password": "Неверный пароль",
    "auth/invalid-credential": "Неверная почта или пароль",
    "auth/email-already-in-use": "Этот email уже используется",
    "auth/invalid-email": "Некорректный email",
    "auth/weak-password": "Пароль должен содержать минимум 6 символов",
    "auth/popup-closed-by-user": "Окно входа было закрыто",
    "auth/cancelled-popup-request": "Запрос входа был отменен",
    "auth/network-request-failed": "Проверьте подключение к интернету",
    "auth/too-many-requests": "Слишком много попыток. Попробуйте позже",
  };

  return messages[code] ?? "Не удалось выполнить вход. Попробуйте еще раз.";
}

export async function saveUserToFirestore(
  user: User,
  extraData?: Partial<Pick<FirestoreUser, "name" | "city" | "provider">>,
) {
  const { db } = assertFirebaseReady();
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);
  const provider = extraData?.provider ?? (user.providerData[0]?.providerId === "google.com" ? "google" : "email");

  const payload: FirestoreUser = {
    uid: user.uid,
    name: extraData?.name ?? user.displayName ?? "Игрок Zen Mahjong",
    email: user.email ?? "",
    provider,
    onboardingCompleted: snapshot.exists()
      ? Boolean(snapshot.data().onboardingCompleted)
      : false,
    updatedAt: serverTimestamp(),
  };

  if (user.photoURL) {
    payload.photoURL = user.photoURL;
  }

  if (extraData?.city) {
    payload.city = extraData.city;
  }

  if (!snapshot.exists()) {
    payload.createdAt = serverTimestamp();
  } else if (!("onboardingCompleted" in snapshot.data())) {
    payload.onboardingCompleted = false;
  }

  await setDoc(userRef, payload, { merge: true });
  return payload;
}

async function syncUserProfileInBackground(
  user: User,
  extraData?: Partial<Pick<FirestoreUser, "name" | "city" | "provider">>,
) {
  try {
    await saveUserToFirestore(user, extraData);
  } catch (error) {
    console.warn("Firestore profile sync failed:", error);
  }
}

export async function getUserProfile(uid: string) {
  const { db } = assertFirebaseReady();
  const snapshot = await getDoc(doc(db, "users", uid));

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as FirestoreUser;
}

export async function getPostAuthRedirectPath(user: User) {
  return resolvePostAuthRedirectPath(user.uid);
}

export async function completeOnboarding(uid: string, data: OnboardingProfileInput) {
  const { db } = assertFirebaseReady();
  const payload = {
    onboardingCompleted: true,
    focusGoal: data.focusGoal,
    experienceLevel: data.experienceLevel,
    city: data.city.trim(),
    preferredSessionLength: data.preferredSessionLength,
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, "users", uid), payload, { merge: true });

  return payload;
}

export async function registerWithEmail(email: string, password: string, name: string) {
  const { auth } = assertFirebaseReady();
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(credential.user, {
    displayName: name,
  });

  void syncUserProfileInBackground(credential.user, {
    name,
    provider: "email",
  });

  return credential.user;
}

export async function loginWithEmail(email: string, password: string) {
  const { auth } = assertFirebaseReady();
  const credential = await signInWithEmailAndPassword(auth, email, password);

  void syncUserProfileInBackground(credential.user, {
    provider: "email",
  });

  return credential.user;
}

export async function loginWithGoogle() {
  const { auth } = assertFirebaseReady();
  const credential = await signInWithPopup(auth, googleProvider);

  void syncUserProfileInBackground(credential.user, {
    provider: "google",
  });

  return credential.user;
}

export async function logout() {
  const { auth } = assertFirebaseReady();
  await signOut(auth);
}
