import { useEffect, useState } from "react";
import { collection, setDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { PROJECTS } from "../data/projects";
import { BLOG_POSTS } from "../data/blog";

export default function Seed() {
  const [status, setStatus] = useState("Seeding...");

  useEffect(() => {
    const seedDB = async () => {
      try {
        console.log("Starting seed...");
        for (const project of PROJECTS) {
          await setDoc(doc(db, "projects", project.id), {
            ...project,
            status: "Published",
            createdAt: new Date(),
          });
        }
        for (const blog of BLOG_POSTS) {
          await setDoc(doc(db, "blogs", blog.id), {
            ...blog,
            slug: blog.id,
            status: "Published",
            createdAt: new Date(),
          });
        }
        setStatus("Seeding complete! You can remove this component now.");
      } catch (err: any) {
        setStatus("Error: " + err.message);
        /* error suppressed */
      }
    };
    seedDB();
  }, []);

  return <div className="p-20 text-center">{status}</div>;
}
