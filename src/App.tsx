import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { Toaster } from "sonner";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider, useSettings } from "./contexts/SettingsContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import CacheMonitor from "./components/CacheMonitor";
import { PageSkeleton } from "./components/ui/skeletons";

import Home from "./pages/Home";
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const StyleGuide = lazy(() => import("./pages/StyleGuide"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const Seed = lazy(() => import("./pages/Seed"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin Routes
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProjects = lazy(() => import("./pages/admin/Projects"));
const ProjectEditor = lazy(() => import("./pages/admin/ProjectEditor"));
const AdminBlogs = lazy(() => import("./pages/admin/AdminBlogs"));
const BlogEditor = lazy(() => import("./pages/admin/BlogEditor"));
const HeroEditor = lazy(() => import("./pages/admin/HeroEditor"));
const FeaturedProjectEditor = lazy(() => import("./pages/admin/FeaturedProjectEditor"));
const StatsEditor = lazy(() => import("./pages/admin/StatsEditor"));
const CapabilitiesManager = lazy(() => import("./pages/admin/CapabilitiesManager"));
const TestimonialsManager = lazy(() => import("./pages/admin/TestimonialsManager"));
const AdminMedia = lazy(() => import("./pages/admin/Media"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminMessages = lazy(() => import("./pages/admin/Messages"));
const AdminLogin = lazy(() => import("./pages/admin/Login"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default fallback stale time if not specifically defined in useQuery
      staleTime: 1000 * 60 * 60 * 12, 
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days cache max for garbage collection
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Setup the persister targeting localStorage
const persister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
});

function AppContent() {
  const { settings } = useSettings();
  return (
    <MotionConfig reducedMotion={settings.features.animations ? "user" : "always"}>
      <Toaster position="bottom-right" richColors />
      <BrowserRouter>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="blog" element={<Blog />} />
              <Route path="blog/:id" element={<BlogDetail />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="style-guide" element={<StyleGuide />} />
              <Route path="privacy-policy" element={<PrivacyPolicy />} />
              <Route path="refund-policy" element={<RefundPolicy />} />
              <Route path="seed" element={<Seed />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="hero" element={<HeroEditor />} />
              <Route path="featured-project" element={<FeaturedProjectEditor />} />
              <Route path="stats" element={<StatsEditor />} />
              <Route path="capabilities" element={<CapabilitiesManager />} />
              <Route path="testimonials" element={<TestimonialsManager />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="projects/:id" element={<ProjectEditor />} />
              <Route path="blogs" element={<AdminBlogs />} />
              <Route path="blogs/:id" element={<BlogEditor />} />
              <Route path="media" element={<AdminMedia />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="*" element={<div className="flex items-center justify-center min-h-[400px] text-gray-500 font-medium">Module coming soon...</div>} />
            </Route>
          </Routes>
        </Suspense>
        <CacheMonitor />
      </BrowserRouter>
    </MotionConfig>
  );
}

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days max age for the persisted cache
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            // Only persist successful queries (never cache errors)
            if (query.state.status !== "success") return false;
            
            // Only persist public queries (queryKey starts with "portfolio")
            const isPublic = Array.isArray(query.queryKey) && query.queryKey[0] === "portfolio";
            
            // Do NOT persist engagement/dynamic queries
            const isEngagement = Array.isArray(query.queryKey) && query.queryKey[1] === "engagement";
            
            return isPublic && !isEngagement;
          },
        },
      }}
    >
      <HelmetProvider>
        <AuthProvider>
          <SettingsProvider>
            <AppContent />
          </SettingsProvider>
        </AuthProvider>
      </HelmetProvider>
    </PersistQueryClientProvider>
  );
}
