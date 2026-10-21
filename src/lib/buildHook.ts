import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { toast } from "sonner";

// Prevent spamming the build hook (e.g., during rapid changes)
let lastTriggerTime = 0;

export async function triggerBuildHook(reason: string = "Content updated") {
  const now = Date.now();
  // Throttle builds to max 1 per 60 seconds from the client side
  if (now - lastTriggerTime < 60000) {
    console.log("Build hook throttled. Will not trigger immediately.");
    return false;
  }

  try {
    const snap = await getDoc(doc(db, "settings", "global"));
    const hookUrl = snap.data()?.netlifyBuildHook;
    
    if (!hookUrl) {
      console.log("No Netlify build hook configured.");
      return false;
    }
    
    console.log(`Triggering Netlify build: ${reason}`);
    lastTriggerTime = now;
    
    // We don't await the fetch so we don't block the UI
    fetch(hookUrl, { method: "POST" })
      .then(res => {
        if (res.ok) {
          toast.success(`Netlify build triggered: ${reason}`, { id: "build-hook" });
        }
      })
      .catch(console.error);
      
    return true;
  } catch (error) {
    console.error("Failed to trigger build hook", error);
    return false;
  }
}
