import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  Firestore
} from "firebase/firestore";
import fs from "fs";
import path from "path";

let dbInstance: Firestore | null = null;

export function getDb(): Firestore | null {
  if (dbInstance) return dbInstance;

  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      const configRaw = fs.readFileSync(configPath, "utf8");
      const firebaseConfig = JSON.parse(configRaw);

      const app = initializeApp(firebaseConfig);
      dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
      console.log("[Firebase] Firestore database initialized successfully!");
      return dbInstance;
    }
  } catch (err) {
    console.error("[Firebase Initialization Error]:", err);
  }

  return null;
}

// User Persistence Helpers
export async function saveUserToFirestore(user: { email: string; name: string; passwordHash: string; createdAt: number }) {
  const db = getDb();
  if (!db) return false;
  try {
    const userRef = doc(db, "users", user.email.toLowerCase());
    await setDoc(userRef, {
      email: user.email.toLowerCase(),
      name: user.name,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
      updatedAt: Date.now()
    }, { merge: true });
    console.log(`[Firestore] User saved: ${user.email}`);
    return true;
  } catch (err) {
    console.error(`[Firestore Save User Error]:`, err);
    return false;
  }
}

export async function getUserFromFirestore(email: string) {
  const db = getDb();
  if (!db) return null;
  try {
    const userRef = doc(db, "users", email.toLowerCase());
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as { email: string; name: string; passwordHash: string; createdAt: number };
    }
  } catch (err) {
    console.error(`[Firestore Get User Error]:`, err);
  }
  return null;
}

// Verification Code Persistence Helpers
export async function saveVerificationToFirestore(record: {
  email: string;
  code: string;
  expires: number;
  fullName?: string;
  type: 'register' | 'forgot_password';
}) {
  const db = getDb();
  if (!db) return false;
  try {
    const vRef = doc(db, "verifications", record.email.toLowerCase());
    await setDoc(vRef, {
      ...record,
      email: record.email.toLowerCase(),
      createdAt: Date.now()
    });
    console.log(`[Firestore] Verification record saved for ${record.email}`);
    return true;
  } catch (err) {
    console.error(`[Firestore Save Verification Error]:`, err);
    return false;
  }
}

export async function getVerificationFromFirestore(email: string) {
  const db = getDb();
  if (!db) return null;
  try {
    const vRef = doc(db, "verifications", email.toLowerCase());
    const snap = await getDoc(vRef);
    if (snap.exists()) {
      return snap.data() as {
        email: string;
        code: string;
        expires: number;
        fullName?: string;
        type: 'register' | 'forgot_password';
      };
    }
  } catch (err) {
    console.error(`[Firestore Get Verification Error]:`, err);
  }
  return null;
}

export async function deleteVerificationFromFirestore(email: string) {
  const db = getDb();
  if (!db) return;
  try {
    const vRef = doc(db, "verifications", email.toLowerCase());
    await deleteDoc(vRef);
  } catch (err) {
    console.error(`[Firestore Delete Verification Error]:`, err);
  }
}

// Radio Shows Persistence
export async function saveShowToFirestore(show: any, userEmail?: string) {
  const db = getDb();
  if (!db) return false;
  try {
    const showRef = doc(db, "radio_shows", show.id);
    await setDoc(showRef, {
      ...show,
      userEmail: userEmail || "anonymous",
      savedAt: Date.now()
    }, { merge: true });
    console.log(`[Firestore] Radio show saved: ${show.title}`);
    return true;
  } catch (err) {
    console.error(`[Firestore Save Show Error]:`, err);
    return false;
  }
}

export async function getShowsFromFirestore() {
  const db = getDb();
  if (!db) return [];
  try {
    const colRef = collection(db, "radio_shows");
    const snap = await getDocs(colRef);
    return snap.docs.map(doc => doc.data());
  } catch (err) {
    console.error(`[Firestore Get Shows Error]:`, err);
    return [];
  }
}
