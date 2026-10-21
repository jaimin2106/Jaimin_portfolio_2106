import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import fs from 'fs';

const firebaseConfig = {
  projectId: "astute-abbey-p1wkv",
  appId: "1:509171019192:web:4aba69e3e6ad580df2334d",
  apiKey: "AIzaSyAPch8N_4oxiFv8iKhIJ2zTVgbTGt32nHI",
  authDomain: "astute-abbey-p1wkv.firebaseapp.com",
  storageBucket: "astute-abbey-p1wkv.firebasestorage.app",
  messagingSenderId: "509171019192"
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
}, "ai-studio-72db9056-9c78-47ef-8e14-18be539b546c");

async function check() {
  const snap = await getDocs(collection(db, "projects"));
  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    console.log(`Project: ${data.title}`);
    console.log(` - Thumbnail: ${data.thumbnail}`);
    
    // Attempt to resolve
    let val = data.thumbnail;
    if (val && !val.startsWith("http")) {
       const mSnap = await getDoc(doc(db, "media", val));
       if (mSnap.exists()) {
           console.log(`   -> Resolved: ${mSnap.data().url}`);
       } else {
           console.log(`   -> Failed to resolve in media collection!`);
       }
    }
  }
  process.exit(0);
}
check();
