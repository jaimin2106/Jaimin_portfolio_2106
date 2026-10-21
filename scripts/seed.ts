import { initializeApp } from "firebase/app";
import { getFirestore, collection, setDoc, doc } from "firebase/firestore";
import { PROJECTS } from "../src/data/projects";
import { BLOG_POSTS } from "../src/data/blog";

// Use the same config as lib/firebase.ts
// Usually config is public. Let's just grab what we have in lib/firebase.ts
import { db } from "../src/lib/firebase";

async function seed() {
  console.log("Seeding projects...");
  for (const project of PROJECTS) {
    if (!project.id) continue;
    await setDoc(doc(db, "projects", project.id), {
      ...project,
      status: "Published",
      createdAt: new Date(),
    });
    console.log("Seeded project:", project.id);
  }
  
  console.log("Seeding blogs...");
  for (const blog of BLOG_POSTS) {
    if (!blog.id) continue;
    await setDoc(doc(db, "blogs", blog.id), {
      ...blog,
      slug: blog.id,
      status: "Published",
      createdAt: new Date(),
    });
    console.log("Seeded blog:", blog.id);
  }
  console.log("Done seeding.");
  process.exit(0);
}

seed().catch((e) => {
  console.error("Error seeding", e);
  process.exit(1);
});
