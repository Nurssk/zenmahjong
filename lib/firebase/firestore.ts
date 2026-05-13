import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { demoInventory, demoProfile, demoStats } from "@/constants/product";
import type { Inventory, PlayerStats, UserProfile } from "@/types";

export async function getUserProfile(uid: string): Promise<UserProfile> {
  if (!isFirebaseConfigured || !db) {
    return demoProfile;
  }

  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? (snapshot.data() as UserProfile) : demoProfile;
}

export async function saveUserProfile(profile: UserProfile) {
  if (!isFirebaseConfigured || !db) {
    return { demo: true };
  }

  return setDoc(doc(db, "users", profile.uid), profile, { merge: true });
}

export async function getUserStats(uid: string): Promise<PlayerStats> {
  if (!isFirebaseConfigured || !db) {
    return demoStats;
  }

  const snapshot = await getDoc(doc(db, "users", uid, "stats", "main"));
  return snapshot.exists() ? (snapshot.data() as PlayerStats) : demoStats;
}

export async function getUserInventory(uid: string): Promise<Inventory> {
  if (!isFirebaseConfigured || !db) {
    return demoInventory;
  }

  const snapshot = await getDoc(doc(db, "users", uid, "inventory", "main"));
  return snapshot.exists() ? (snapshot.data() as Inventory) : demoInventory;
}
