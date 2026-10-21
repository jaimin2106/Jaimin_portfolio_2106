import React, { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS, STALE_TIMES } from "../lib/queryKeys";

export interface GlobalSettings {
  siteName: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords?: string;
  favicon: string;
  ogImage: string;
  twitterImage?: string;
  email: string;
  gscVerification?: string;
  availabilityStatus: boolean;
  socialLinks: Array<{ platform: string; url: string }>;
  features: {
    animations: boolean;
    smoothScroll: boolean;
    blog: boolean;
  };
}

const defaultSettings: GlobalSettings = {
  siteName: "JM.",
  seoTitle: "Jaimin Umaraniya | Full Stack Developer",
  seoDescription: "Portfolio of Jaimin Umaraniya, Full Stack Developer and Designer.",
  seoKeywords: "developer, designer, portfolio, react",
  favicon: "",
  ogImage: "",
  twitterImage: "",
  email: "umaraniyajaimin5@gmail.com",
  gscVerification: "",
  availabilityStatus: true,
  socialLinks: [
    { platform: "GitHub", url: "https://github.com/jaimin" },
    { platform: "LinkedIn", url: "https://linkedin.com/in/jaimin" },
    { platform: "Twitter / X", url: "https://twitter.com/jaimin" }
  ],
  features: {
    animations: true,
    smoothScroll: true,
    blog: true
  }
};

const SettingsContext = createContext<{ settings: GlobalSettings; loading: boolean }>({
  settings: defaultSettings,
  loading: true,
});

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: fetchedSettings, isLoading } = useQuery({
    queryKey: QUERY_KEYS.settings,
    queryFn: async () => {
      const docSnap = await getDoc(doc(db, "settings", "global"));
      if (docSnap.exists()) {
        return docSnap.data() as GlobalSettings;
      }
      return null;
    },
    staleTime: STALE_TIMES.settings,
  });

  const settings = { ...defaultSettings, ...(fetchedSettings || {}) };

  useEffect(() => {
    if (settings.gscVerification) {
      let content = settings.gscVerification;
      const match = settings.gscVerification.match(/content="([^"]+)"/);
      if (match) content = match[1];

      let meta = document.querySelector('meta[name="google-site-verification"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'google-site-verification');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    }
  }, [settings.gscVerification]);

  return (
    <SettingsContext.Provider value={{ settings, loading: isLoading }}>
        {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
