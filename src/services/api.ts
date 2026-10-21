import { collection, getDocs, query, doc, getDoc, orderBy, where } from "firebase/firestore";
import { db } from "../lib/firebase";

// Cache for resolved assets
const assetCache: Record<string, string> = {};

export const api = {
  async resolveAsset(idOrUrl: string): Promise<string> {
    if (!idOrUrl) return "";
    if (idOrUrl.startsWith("http") || idOrUrl.startsWith("data:")) return idOrUrl;
    if (assetCache[idOrUrl]) return assetCache[idOrUrl];
    try {
      const docSnap = await getDoc(doc(db, "media", idOrUrl));
      if (docSnap.exists() && docSnap.data().url) {
        assetCache[idOrUrl] = docSnap.data().url;
        return docSnap.data().url;
      }
    } catch (e) {
      console.warn("Failed to resolve asset:", idOrUrl);
    }
    return "";
  },

  async resolveObjectAssets(obj: any, keys: string[]) {
    if (!obj) return obj;
    for (const key of keys) {
      if (obj[key] && typeof obj[key] === 'string' && !obj[key].startsWith('http') && !obj[key].startsWith('data:')) {
        obj[key] = await this.resolveAsset(obj[key]);
      }
    }
    return obj;
  },

  async getProjects() {
    const q = query(
      collection(db, "projects"),
      where("status", "==", "Published"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return Promise.all(data.map(async d => await this.resolveObjectAssets(d, ["image", "seoImage", "thumbnail", "featuredImage"])));
  },
  
  async getProjectById(id: string) {
    const docSnap = await getDoc(doc(db, "projects", id));
    if (docSnap.exists()) {
      return await this.resolveObjectAssets({ id: docSnap.id, ...docSnap.data() }, ["image", "seoImage", "thumbnail", "featuredImage"]);
    }
    return null;
  },

  async getProjectBySlug(slug: string) {
    const q = query(collection(db, "projects"), where("slug", "==", slug));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return await this.resolveObjectAssets({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() }, ["image", "seoImage", "thumbnail", "featuredImage"]);
    }
    return null;
  },

  async getBlogs() {
    const q = query(
      collection(db, "blogs"),
      where("status", "==", "Published"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return Promise.all(data.map(async d => await this.resolveObjectAssets(d, ["image", "seoImage"])));
  },

  async getBlogById(id: string) {
    const docSnap = await getDoc(doc(db, "blogs", id));
    if (docSnap.exists()) {
      return await this.resolveObjectAssets({ id: docSnap.id, ...docSnap.data() }, ["image", "seoImage"]);
    }
    return null;
  },

  async getBlogBySlug(slug: string) {
    const q = query(collection(db, "blogs"), where("slug", "==", slug));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return await this.resolveObjectAssets({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() }, ["image", "seoImage"]);
    }
    return null;
  },

  async getHeroData() {
    const docSnap = await getDoc(doc(db, "hero", "main"));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return await this.resolveObjectAssets(data, ["heroImage", "resumeUrl"]);
    }
    return null;
  },

  async getSettingsData() {
    const docSnap = await getDoc(doc(db, "settings", "global"));
    if (docSnap.exists()) {
      return await this.resolveObjectAssets(docSnap.data(), ["ogImage", "favicon"]);
    }
    return null;
  },

  async checkAssetUsage(assetId: string): Promise<string[]> {
    const usages: string[] = [];
    if (!assetId) return usages;

    // Check Hero
    const heroSnap = await getDoc(doc(db, "hero", "main"));
    if (heroSnap.exists()) {
      const data = heroSnap.data();
      if (data.heroImage === assetId || data.resumeUrl === assetId) {
        usages.push("Hero Section");
      }
    }

    // Check Settings
    const settingsSnap = await getDoc(doc(db, "settings", "global"));
    if (settingsSnap.exists()) {
      const data = settingsSnap.data();
      if (data.ogImage === assetId || data.favicon === assetId) {
        usages.push("Global Settings");
      }
    }

    // Check Projects
    const projectsSnap = await getDocs(collection(db, "projects"));
    projectsSnap.forEach(doc => {
      const data = doc.data();
      if (data.image === assetId || data.seoImage === assetId || data.thumbnail === assetId || data.content?.includes(assetId)) {
        usages.push(`Project: ${data.title}`);
      }
    });

    // Check Blogs
    const blogsSnap = await getDocs(collection(db, "blogs"));
    blogsSnap.forEach(doc => {
      const data = doc.data();
      if (data.image === assetId || data.seoImage === assetId || data.content?.includes(assetId)) {
        usages.push(`Blog: ${data.title}`);
      }
    });

    // Check Testimonials
    const testimonialsSnap = await getDocs(collection(db, "testimonials"));
    testimonialsSnap.forEach(doc => {
      const data = doc.data();
      if (data.img === assetId) {
        usages.push(`Testimonial: ${data.name}`);
      }
    });

    return usages;
  },

  async getTestimonials() {
    const q = query(collection(db, "testimonials"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return Promise.all(data.map(async d => await this.resolveObjectAssets(d, ["img"])));
  },

  async getStats() {
    const docSnap = await getDoc(doc(db, "stats", "main"));
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return {
      stat1Value: "40+",
      stat1Label: "Successful Projects",
      stat2Value: "99%",
      stat2Label: "System Uptime",
      stat3Value: "05+",
      stat3Label: "Years of Experience"
    };
  },

  async getCapabilities() {
    const q = query(collection(db, "capabilities"), orderBy("order", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getFAQs() {
    const q = query(collection(db, "faqs"), orderBy("order", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
};

