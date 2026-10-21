import { initializeApp } from "firebase/app";
import { getFirestore, collection, setDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  projectId: "astute-abbey-p1wkv",
  appId: "1:509171019192:web:4aba69e3e6ad580df2334d",
  apiKey: "AIzaSyAPch8N_4oxiFv8iKhIJ2zTVgbTGt32nHI",
  authDomain: "astute-abbey-p1wkv.firebaseapp.com",
  storageBucket: "astute-abbey-p1wkv.firebasestorage.app",
  messagingSenderId: "509171019192"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateSEO() {
  console.log("Updating hero data...");
  await setDoc(doc(db, "hero", "main"), {
    name: "JAIMIN UMARANIYA",
    headline: "Full-Stack Developer & AI Engineer",
    subtitle: "I build AI-powered web applications, scalable SaaS products, and high-performance digital experiences using React, Next.js, Node.js, and modern web architecture. My work combines full-stack engineering, AI integration, technical SEO, and performance-focused development to turn complex ideas into reliable products.",
    experience: "2+ Years",
    location: "Hybrid",
    status: "Available",
    githubUrl: "https://github.com/jaimin2106",
    linkedinUrl: "https://linkedin.com/in/jaimin2106",
    resumeUrl: ""
  }, { merge: true });

  console.log("Updating capabilities config...");
  await setDoc(doc(db, "capabilities_config", "main"), {
    title: "What I Build",
    subtitle: "Here's how I help businesses bring their ideas to life through robust engineering."
  }, { merge: true });

  console.log("Updating capabilities...");
  const capabilities = [
    {
      id: "1",
      order: 1,
      title: "Full-Stack Web Development",
      iconName: "Code2",
      tech: "React, Next.js, Node.js, TypeScript",
      desc: "Modern web applications built with React, Next.js, TypeScript, Node.js, and scalable backend architectures."
    },
    {
      id: "2",
      order: 2,
      title: "AI-Powered Applications",
      iconName: "Sparkles",
      tech: "LLMs, AI APIs, Workflows",
      desc: "AI features and intelligent workflows integrated into real products using modern APIs, LLMs, and application architecture."
    },
    {
      id: "3",
      order: 3,
      title: "SaaS & Web Architecture",
      iconName: "Database",
      tech: "PostgreSQL, Supabase, Firebase",
      desc: "Scalable application architectures designed around maintainability, performance, data management, authentication, and reliable product workflows."
    },
    {
      id: "4",
      order: 4,
      title: "Technical SEO & AI Search",
      iconName: "Search",
      tech: "Next.js, Schema, Performance",
      desc: "Technical SEO, JavaScript SEO, structured data, performance optimization, and AI search optimization for modern web applications."
    }
  ];

  for (const cap of capabilities) {
    await setDoc(doc(db, "capabilities", cap.id), cap);
  }

  console.log("Firestore SEO update complete.");
  process.exit(0);
}

updateSEO().catch(e => {
  console.error(e);
  process.exit(1);
});
