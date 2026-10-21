import { Mail,  LayoutDashboard, FileText, Briefcase, Image as ImageIcon, Settings, LogOut, PanelLeftClose, PanelLeft, Plus, Type, Star, BarChart3, Settings2, Users, MessageSquare, View, BarChart, Pencil, FolderKanban, MessageSquareQuote, ChevronLeft, ChevronRight, Home } from "lucide-react";
import {  Link, useLocation, Outlet } from "react-router-dom";
import {  motion, AnimatePresence } from "motion/react";
import {  Button } from "../../components/ui/button";
import {  Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet";
import {  useAuth } from "../../contexts/AuthContext";
import {  createContext, useContext, useState, ReactNode } from "react";
import SEO from "../../components/SEO";

export const AdminContext = createContext({
  focusMode: false,
  setFocusMode: (val: boolean) => {},
});

const SIDEBAR_ITEMS = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Hero Section", href: "/admin/hero", icon: View },
  { name: "Featured Project", href: "/admin/featured-project", icon: Star },
  { name: "Stats", href: "/admin/stats", icon: BarChart },
  { name: "Capabilities", href: "/admin/capabilities", icon: Pencil },
  { name: "Projects", href: "/admin/projects", icon: FolderKanban },
  { name: "Blog Posts", href: "/admin/blogs", icon: FileText },
  { name: "Messages", href: "/admin/messages", icon: Mail },
  { name: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
  { name: "Media", href: "/admin/media", icon: ImageIcon },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const { logOut } = useAuth();
  const [focusMode, setFocusMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <AdminContext.Provider value={{ focusMode, setFocusMode }}>
      <SEO title="Admin CMS" noindex={true} />
      <div className={`min-h-screen flex w-full transition-colors duration-500 ${focusMode ? 'bg-white' : 'bg-gray-50/50'}`}>
        {/* Desktop Sidebar */}
        {!focusMode && (
          <AnimatePresence initial={false}>
            {isSidebarOpen ? (
              <motion.aside 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 256, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="hidden md:flex flex-col border-r border-[#111]/10 bg-white px-4 py-6 h-screen sticky top-0 overflow-y-auto shrink-0 custom-scrollbar overflow-hidden"
              >
                <div className="flex items-center justify-between px-2 mb-8 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">
                      JM
                    </div>
                    <span className="font-display font-bold text-xl tracking-tight whitespace-nowrap">Admin CMS</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="shrink-0 -mr-2 text-gray-500 hover:text-black transition-colors duration-300">
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                </div>

                <nav className="flex-1 space-y-1 mb-8 w-full relative">
                  {SIDEBAR_ITEMS.map((item, index) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Link
                        to={item.href}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 active:scale-[0.97] whitespace-nowrap relative z-10 ${
                          isActive
                            ? "text-white font-medium"
                            : "text-gray-500 hover:text-black font-medium"
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active-indicator"
                            className="absolute inset-0 bg-black rounded-xl shadow-md shadow-black/10 -z-10"
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        )}
                        {!isActive && (
                          <div className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-200 -z-10" />
                        )}
                        <item.icon className={`w-5 h-5 shrink-0 transition-colors duration-200 relative z-10 ${isActive ? "text-white" : "text-gray-400 group-hover:text-black"}`} />
                        <span className="relative z-10">{item.name}</span>
                      </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                <div className="pt-8 border-t border-[#111]/10 space-y-1 w-full">
                  <Link to="/">
                    <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-gray-100 font-medium text-gray-500 hover:text-black h-11 px-3 whitespace-nowrap transition-colors duration-200">
                      <Home className="w-5 h-5 text-gray-400 shrink-0 group-hover:text-black" />
                      View Site
                    </Button>
                  </Link>
                  <Button variant="ghost" onClick={logOut} className="w-full justify-start gap-3 rounded-xl hover:bg-red-50 hover:text-red-600 font-medium text-gray-500 h-11 px-3 whitespace-nowrap transition-colors duration-200">
                    <LogOut className="w-5 h-5 shrink-0 group-hover:text-red-600" />
                    Logout
                  </Button>
                </div>
              </motion.aside>
            ) : (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 80, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="hidden md:flex flex-col items-center border-r border-[#111]/10 bg-white py-6 h-screen sticky top-0 shrink-0"
              >
                 <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="mb-8 text-gray-500 hover:text-black transition-colors duration-300">
                   <ChevronRight className="w-5 h-5" />
                 </Button>

                 <nav className="flex-1 space-y-2 w-full px-3 relative">
                  {SIDEBAR_ITEMS.map((item, index) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Link
                        to={item.href}
                        title={item.name}
                        className={`group flex items-center justify-center w-full h-11 rounded-xl transition-all duration-200 active:scale-[0.97] relative z-10 ${
                          isActive
                            ? "text-white font-medium"
                            : "text-gray-500 hover:text-black font-medium"
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-collapsed-indicator"
                            className="absolute inset-0 bg-black rounded-xl shadow-md shadow-black/10 -z-10"
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        )}
                        {!isActive && (
                          <div className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-200 -z-10" />
                        )}
                        <item.icon className={`w-5 h-5 shrink-0 transition-colors duration-200 relative z-10 ${isActive ? "text-white" : "text-gray-400 group-hover:text-black"}`} />
                        </Link>
                      </motion.div>
                    );
                  })}
                 </nav>

                 <div className="pt-8 border-t border-[#111]/10 space-y-2 w-full px-3">
                    <Link to="/" title="View Site">
                      <Button variant="ghost" className="w-full justify-center rounded-xl hover:bg-gray-100 text-gray-500 hover:text-black h-11 px-0 transition-colors duration-200">
                        <Home className="w-5 h-5 text-gray-400 shrink-0" />
                      </Button>
                    </Link>
                    <Button variant="ghost" onClick={logOut} title="Logout" className="w-full justify-center rounded-xl hover:bg-red-50 hover:text-red-600 text-gray-500 h-11 px-0 transition-colors duration-200">
                      <LogOut className="w-5 h-5 shrink-0" />
                    </Button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Main Content */}
        <main className={`flex-1 flex flex-col min-h-screen max-w-full min-w-0 ${focusMode ? 'max-w-[100vw]' : ''}`}>
          {/* Mobile Header */}
          {!focusMode && (
            <div className="md:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#111]/10 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center text-white font-bold text-sm">
                  JM
                </div>
                <span className="font-display font-bold text-lg tracking-tight">Admin CMS</span>
              </div>
              <Sheet>
                <SheetTrigger render={<Button variant="ghost" size="icon" className="-mr-2"><PanelLeft className="w-5 h-5" /></Button>} />
                <SheetContent side="left" className="w-64 p-0 pt-16 flex flex-col border-r-[#111]/10">
                   <nav className="flex-1 space-y-1 px-4 py-8 relative">
                    {SIDEBAR_ITEMS.map((item, index) => {
                      const isActive = location.pathname === item.href;
                      return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Link
                          to={item.href}
                          className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 active:scale-[0.97] relative z-10 ${
                            isActive
                              ? "text-white font-medium"
                              : "text-gray-500 hover:text-black font-medium"
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="sidebar-mobile-indicator"
                              className="absolute inset-0 bg-black rounded-xl shadow-md shadow-black/10 -z-10"
                              transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            />
                          )}
                          {!isActive && (
                            <div className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-200 -z-10" />
                          )}
                          <item.icon className={`w-5 h-5 relative z-10 ${isActive ? "text-white" : "text-gray-400 group-hover:text-black"}`} />
                          <span className="relative z-10">{item.name}</span>
                        </Link>
                      </motion.div>
                    );
                    })}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          )}

          {/* Dynamic Content */}
          <div className={`flex-1 relative ${focusMode ? 'w-full' : 'p-4 sm:p-6 md:p-8 lg:p-10 w-full max-w-7xl mx-auto'}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </AdminContext.Provider>
  );
}
