import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";

const firebaseConfig = {
  projectId: "astute-abbey-p1wkv",
  appId: "1:509171019192:web:4aba69e3e6ad580df2334d",
  apiKey: "AIzaSyAPch8N_4oxiFv8iKhIJ2zTVgbTGt32nHI",
  authDomain: "astute-abbey-p1wkv.firebaseapp.com"
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {}, "ai-studio-72db9056-9c78-47ef-8e14-18be539b546c");

async function run() {
  try {
    const docRef = await addDoc(collection(db, "messages"), {
      test: true,
      createdAt: serverTimestamp()
    });
    console.log("Written:", docRef.id);
    const snap = await getDocs(collection(db, "messages"));
    console.log("Docs:", snap.docs.length);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
run();
