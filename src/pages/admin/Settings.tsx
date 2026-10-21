import { Skeleton } from "../../components/ui/skeleton";
import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Save, Loader2, Plus, Trash2, Layout, Image as ImageIcon, Link as LinkIcon, Settings2, Globe, Menu, X, ArrowUpCircle, RefreshCcw, Sparkles } from "lucide-react";
import OGImageGenerator from "../../components/admin/OGImageGenerator";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../../lib/firebase";
import { Button } from "../../components/ui/button";
import { Input } from "../../lib/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { toast } from "sonner";
import { FileUpload } from "../../components/ui/file-upload";
import { AIAssistantPanel } from "../../components/admin/AIAssistantPanel";

export default function Settings() {
  const { register, handleSubmit, reset, control, watch, setValue, getValues, formState: { isDirty } } = useForm({
    defaultValues: {
      siteName: "JM.",
      seoTitle: "Jaimin Umaraniya | Full Stack Developer",
      seoDescription: "Portfolio of Jaimin Umaraniya, Full Stack Developer and Designer.",
      seoKeywords: "",
      gscVerification: "",
      favicon: "",
      ogImage: "",
      twitterImage: "",
      email: "umaraniyajaimin5@gmail.com",
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
      },
      netlifyBuildHook: "",
      openRouterApiKey: "",
      aiModel: "meta-llama/llama-3.3-70b-instruct:free",
      aiTemperature: 0.7,
      aiMaxTokens: 2000,
      aiSystemPrompt: "You are an expert SEO content writer and technical blogger.\nWrite a high-quality, comprehensive blog post.\nIt must be well-structured with Markdown headings (H2, H3), bold annotations for key terms, bullet points where appropriate, and SEO-friendly.\nThe response must be purely the markdown content of the blog, without any surrounding conversational text.",
      aiTone: "Professional",
      aiStyle: "Technical"
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "socialLinks"
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingSeo, setGeneratingSeo] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGenerateSeo = async (params: any) => {
    setGeneratingSeo(true);
    toast.loading("Generating Global SEO...", { id: "seo-gen" });
    try {
      const docSnap = await getDoc(doc(db, "settings", "global"));
      let openRouterApiKey = "";
      if (docSnap.exists()) {
        openRouterApiKey = docSnap.data().openRouterApiKey || "";
      }

      const response = await fetch("/api/generate-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Global Portfolio SEO",
          description: params.topic,
          content: params.keywords,
          openRouterApiKey,
          model: getValues("aiModel"),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate SEO");
      }

      const data = await response.json();
      const result = JSON.parse(data.result);

      if (result.seoTitle) setValue("seoTitle", result.seoTitle, { shouldDirty: true });
      if (result.seoDescription) setValue("seoDescription", result.seoDescription, { shouldDirty: true });
      if (result.seoKeywords) setValue("seoKeywords", result.seoKeywords, { shouldDirty: true });

      toast.success("SEO generated successfully!", { id: "seo-gen" });
    } catch (error: any) {
      toast.error(error.message || "Failed to generate SEO", { id: "seo-gen" });
    } finally {
      setGeneratingSeo(false);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "global");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          reset(docSnap.data());
        }
      } catch (error) {
        /* error suppressed */
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [reset]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    const toastId = toast.loading("Saving settings...");
    try {
      Object.keys(data).forEach(key => {
        if (data[key] === undefined) delete data[key];
      });

      await setDoc(doc(db, "settings", "global"), data, { merge: true });
      reset(data);
      toast.success("Settings saved successfully.", { id: toastId });
    } catch (error) {
      /* error suppressed */
      toast.error("Failed to save settings.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const availabilityStatus = watch("availabilityStatus");
  const featureAnimations = watch("features.animations");
  const featureSmoothScroll = watch("features.smoothScroll");

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row gap-6 lg:gap-8 w-full max-w-7xl mx-auto h-[calc(100vh-64px)] overflow-hidden animate-in fade-in duration-500">
        <div className="w-full md:w-64 lg:w-72 shrink-0 space-y-2 mt-8">
           {[...Array(6)].map((_, i) => (
             <Skeleton key={i} className="h-11 w-full rounded-xl" />
           ))}
        </div>
        <div className="flex-1 space-y-8 mt-8 pr-4">
           <Skeleton className="h-12 w-64 rounded-xl mb-8" />
           <Skeleton className="h-32 w-full rounded-2xl" />
           <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "general", label: "General & Brand", icon: Layout },
    { id: "seo", label: "SEO Optimization", icon: Globe },
    { id: "media", label: "Media Assets", icon: ImageIcon },
    { id: "social", label: "Social Profiles", icon: LinkIcon },
    { id: "advanced", label: "Advanced Toggles", icon: Settings2 },
    { id: "deployment", label: "Deployment", icon: ArrowUpCircle },
    { id: "ai", label: "AI Configuration", icon: Sparkles },
  ];

  const activeTabConfig = tabs.find(t => t.id === activeTab);

  return (
    <div className="w-full bg-white text-gray-900 min-h-[calc(100vh-80px)] rounded-[2rem] overflow-hidden flex flex-col md:flex-row relative shadow-sm border border-black/5">
      
      {/* Mobile Tab Switcher */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-black/5 bg-gray-50/50 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          {activeTabConfig && <activeTabConfig.icon className="w-5 h-5 text-[#FF6B00]" />}
          <span className="font-display font-bold text-lg text-black">{activeTabConfig?.label}</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-500 hover:text-black">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-white border-b border-black/5 absolute w-full z-40 top-[68px]"
          >
            <nav className="flex flex-col p-4 gap-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                      isActive 
                        ? "bg-[#FF6B00]/10 text-[#FF6B00] font-semibold" 
                        : "text-gray-500 hover:text-black hover:bg-black/5 font-medium"
                    }`}
                  >
                    <tab.icon className={`w-5 h-5 ${isActive ? "text-[#FF6B00]" : "text-gray-400"}`} />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-gray-50/50 border-r border-black/5 shrink-0 sticky top-0 h-[calc(100vh-80px)] overflow-y-auto">
        <div className="p-8 pb-4">
          <h1 className="font-display font-bold text-2xl tracking-tight text-black">Settings</h1>
          <p className="text-gray-500 mt-1 text-sm font-mono">Platform Configuration</p>
        </div>
        <nav className="flex flex-col gap-1 px-4 pb-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-left ${
                  isActive 
                    ? "bg-[#FF6B00]/10 text-[#FF6B00] font-medium border border-[#FF6B00]/20 shadow-[0_0_15px_rgba(255,107,0,0.1)]" 
                    : "text-gray-500 hover:text-black hover:bg-black/5 font-medium border border-transparent"
                }`}
              >
                <tab.icon className={`w-4 h-4 ${isActive ? "text-[#FF6B00]" : "opacity-50"}`} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto h-[calc(100vh-80px)] md:h-[calc(100vh-80px)] relative bg-white">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[800px] mx-auto pb-32">
          
          {/* Sticky Action Header */}
          <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-black/5 px-6 py-5 md:px-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-xl md:text-2xl text-black">{activeTabConfig?.label}</h2>
            </div>
            <div className="flex items-center gap-3">
              {isDirty && (
                <span className="text-xs font-mono text-[#FF6B00] animate-pulse">Unsaved changes</span>
              )}
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => reset()}
                disabled={!isDirty || saving}
                className="text-gray-500 hover:text-black hover:bg-black/5 h-10 px-4 rounded-xl disabled:opacity-30"
              >
                Discard
              </Button>
              <Button 
                type="submit" 
                disabled={!isDirty || saving} 
                className="h-10 px-5 rounded-xl bg-[#FF6B00] hover:bg-[#d04d00] text-white shadow-[0_0_20px_rgba(255,107,0,0.2)] hover:shadow-[0_0_30px_rgba(255,107,0,0.4)] transition-all font-semibold disabled:opacity-50 disabled:shadow-none border-none"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>

          <div className="p-6 md:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                
                {/* General & Brand Section */}
                {activeTab === "general" && (
                  <div className="space-y-8">
                    <div className="bg-white shadow-sm rounded-2xl p-6 md:p-8 border border-black/5">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="siteName" className="text-xs font-bold font-mono tracking-wider text-gray-500 uppercase">Logo Text (Site Name)</Label>
                          <Input id="siteName" {...register("siteName")} placeholder="e.g. JM." className="bg-gray-50/50 border-black/5 focus:bg-white focus:border-black/10 h-12 transition-all text-black placeholder:text-gray-400 rounded-xl" />
                          <p className="text-xs text-gray-400">Used in the main navigation and footer.</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white shadow-sm rounded-2xl p-6 md:p-8 border border-black/5">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-xs font-bold font-mono tracking-wider text-gray-500 uppercase">Primary Contact Email</Label>
                          <Input id="email" type="email" {...register("email")} placeholder="hello@example.com" className="bg-gray-50/50 border-black/5 focus:bg-white focus:border-black/10 h-12 transition-all text-black placeholder:text-gray-400 rounded-xl" />
                          <p className="text-xs text-gray-400">Where inquiries from the site will be directed.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SEO Optimization Section */}
                {activeTab === "seo" && (
                  <div className="space-y-8">
                    <AIAssistantPanel
                      contentType="seo"
                      generating={generatingSeo}
                      onGenerate={handleGenerateSeo}
                      defaultTopic="A professional portfolio for a Full Stack Developer"
                    />
                    <div className="bg-white shadow-sm rounded-2xl p-6 md:p-8 border border-black/5 space-y-8">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="seoTitle" className="text-xs font-bold font-mono tracking-wider text-gray-500 uppercase">Meta Title</Label>
                          <span className={`text-xs font-mono ${watch("seoTitle")?.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>{watch("seoTitle")?.length || 0}/60</span>
                        </div>
                        <Input id="seoTitle" {...register("seoTitle")} placeholder="Your Name | Portfolio" className="bg-gray-50/50 border-black/5 focus:bg-white focus:border-black/10 h-12 transition-all font-medium text-black placeholder:text-gray-400 rounded-xl" />
                        <p className="text-xs text-gray-400">Optimal length: 50–60 characters.</p>
                      </div>
                      
                      <div className="space-y-2 flex flex-col">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="seoDescription" className="text-xs font-bold font-mono tracking-wider text-gray-500 uppercase">Meta Description</Label>
                          <span className={`text-xs font-mono ${watch("seoDescription")?.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>{watch("seoDescription")?.length || 0}/160</span>
                        </div>
                        <textarea
                          id="seoDescription"
                          {...register("seoDescription")}
                          className="w-full min-h-[120px] resize-none p-4 rounded-xl bg-gray-50/50 border border-black/5 focus:bg-white focus:border-black/10 focus:outline-none focus:ring-0 text-sm transition-all text-black placeholder:text-gray-400"
                          placeholder="Brief description of your portfolio..."
                        />
                        <p className="text-xs text-gray-400">Optimal length: 150–160 characters.</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="seoKeywords" className="text-xs font-bold font-mono tracking-wider text-gray-500 uppercase">Keywords</Label>
                        <Input id="seoKeywords" {...register("seoKeywords")} placeholder="e.g. Developer, Designer, React" className="bg-gray-50/50 border-black/5 focus:bg-white focus:border-black/10 h-12 transition-all text-black placeholder:text-gray-400 rounded-xl" />
                        <p className="text-xs text-gray-400">Comma-separated list of relevant keywords.</p>
                      </div>
                    </div>

                    <div className="bg-white shadow-sm rounded-2xl p-6 md:p-8 border border-black/5 space-y-4">
                      <Label htmlFor="gscVerification" className="text-xs font-bold font-mono tracking-wider text-gray-500 uppercase flex items-center gap-2">
                        <Globe className="w-4 h-4" /> GSC Verification Script
                      </Label>
                      <textarea
                        id="gscVerification"
                        {...register("gscVerification")}
                        className="w-full min-h-[100px] font-mono text-xs resize-none p-4 rounded-xl bg-gray-50/50 border border-black/5 focus:bg-white focus:border-black/10 focus:outline-none focus:ring-0 transition-all text-[#FF6B00] placeholder:text-gray-400"
                        placeholder='<meta name="google-site-verification" content="..." />'
                      />
                      <p className="text-xs text-gray-400 leading-relaxed">Paste the full meta tag provided by Google Search Console. Because this site is statically generated, you MUST trigger a new deployment/rebuild on Netlify after saving for this tag to be embedded in the raw HTML for Googlebot.</p>
                    </div>
                  </div>
                )}

                {/* Media Assets Section */}
                {activeTab === "media" && (
                  <div className="space-y-8">
                    <div className="bg-white shadow-sm rounded-2xl p-6 md:p-8 border border-black/5 space-y-4">
                      <div className="space-y-1 mb-4">
                        <Label className="text-xs font-bold font-mono tracking-wider text-gray-500 uppercase">Favicon</Label>
                        <p className="text-xs text-gray-400">Appears in browser tabs (32x32px recommended).</p>
                      </div>
                      <div className="bg-gray-50/50 p-4 rounded-xl border border-black/5">
                        <FileUpload 
                          value={watch("favicon")} 
                          onChange={(url) => setValue("favicon", url, {shouldDirty: true})} 
                          path="settings"
                        />
                      </div>
                    </div>

                    <div className="bg-white shadow-sm rounded-2xl p-6 md:p-8 border border-black/5 space-y-4">
                      <div className="space-y-1 mb-4">
                        <Label className="text-xs font-bold font-mono tracking-wider text-gray-500 uppercase">OpenGraph Image</Label>
                        <p className="text-xs text-gray-400">Preview image shown when linking on social media (1200x630px).</p>
                      </div>
                      <div className="bg-gray-50/50 p-4 rounded-xl border border-black/5">
                        <FileUpload 
                          value={watch("ogImage")} 
                          onChange={(url) => setValue("ogImage", url, {shouldDirty: true})} 
                          path="settings"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Social Profiles Section */}
                {activeTab === "social" && (
                  <div className="space-y-8">
                    <div className="flex justify-end">
                      <Button type="button" onClick={() => append({ platform: "", url: "" })} className="rounded-xl bg-black text-white hover:bg-black/80 font-medium shadow-sm">
                        <Plus className="w-4 h-4 mr-2" /> Add Profile
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                      {fields.map((field, index) => (
                        <div key={field.id} className="bg-white shadow-sm p-6 rounded-2xl border border-black/5 relative group transition-all">
                          <div className="flex flex-col sm:flex-row gap-6">
                            <div className="space-y-2 flex-1">
                              <Label className="text-[10px] font-bold font-mono tracking-wider text-gray-500 uppercase">Platform Name</Label>
                              <Input {...register(`socialLinks.${index}.platform` as const)} placeholder="e.g. GitHub" className="bg-gray-50/50 border-black/5 focus:bg-white focus:border-black/10 h-12 transition-all font-medium text-black placeholder:text-gray-400 rounded-xl" />
                            </div>
                            <div className="space-y-2 flex-[2]">
                              <Label className="text-[10px] font-bold font-mono tracking-wider text-gray-500 uppercase">Profile URL</Label>
                              <Input {...register(`socialLinks.${index}.url` as const)} placeholder="https://..." className="bg-gray-50/50 border-black/5 focus:bg-white focus:border-black/10 h-12 transition-all font-mono text-sm text-black placeholder:text-gray-400 rounded-xl" />
                            </div>
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => remove(index)} 
                            className="absolute top-4 right-4 w-8 h-8 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      {fields.length === 0 && (
                        <div className="py-16 text-center bg-white rounded-2xl border border-black/5 border-dashed">
                          <LinkIcon className="w-8 h-8 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium">No social profiles configured.</p>
                          <Button type="button" variant="link" onClick={() => append({ platform: "", url: "" })} className="text-[#FF6B00] mt-2">
                            Add your first profile
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Advanced Toggles Section */}
                {activeTab === "advanced" && (
                  <div className="bg-white shadow-sm rounded-2xl border border-black/5 overflow-hidden">
                    <div className="flex items-center justify-between p-6 md:p-8 hover:bg-gray-50/50 transition-colors border-b border-black/5">
                      <div>
                        <Label className="font-bold text-lg block cursor-pointer text-black">Available for Work</Label>
                        <p className="text-sm text-gray-500 mt-1">Shows an 'Available' badge on your public site</p>
                      </div>
                      <Switch 
                        checked={availabilityStatus} 
                        onCheckedChange={(c: boolean) => setValue('availabilityStatus', c, {shouldDirty: true})} 
                        className="data-[state=checked]:bg-[#FF6B00]"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-6 md:p-8 hover:bg-gray-50/50 transition-colors border-b border-black/5">
                      <div>
                        <Label className="font-bold text-lg block cursor-pointer text-black">Smooth Scrolling</Label>
                        <p className="text-sm text-gray-500 mt-1">Enable Lenis smooth scroll for a premium feel</p>
                      </div>
                      <Switch 
                        checked={featureSmoothScroll} 
                        onCheckedChange={(c: boolean) => setValue('features.smoothScroll', c, {shouldDirty: true})} 
                        className="data-[state=checked]:bg-[#FF6B00]"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-6 md:p-8 hover:bg-gray-50/50 transition-colors">
                      <div>
                        <Label className="font-bold text-lg block cursor-pointer text-black">UI Animations</Label>
                        <p className="text-sm text-gray-500 mt-1">Enable Framer Motion entry and scroll animations</p>
                      </div>
                      <Switch 
                        checked={featureAnimations} 
                        onCheckedChange={(c: boolean) => setValue('features.animations', c, {shouldDirty: true})} 
                        className="data-[state=checked]:bg-[#FF6B00]"
                      />
                    </div>
                  </div>
                )}

                {/* AI Configuration Section */}
                {activeTab === "ai" && (
                  <div className="space-y-8">
                    <div className="bg-white shadow-sm rounded-2xl p-6 md:p-8 border border-black/5 space-y-8">
                      <div className="space-y-2">
                        <Label htmlFor="openRouterApiKey" className="text-xs font-bold font-mono tracking-wider text-gray-500 uppercase">OpenRouter API Key</Label>
                        <Input id="openRouterApiKey" type="password" {...register("openRouterApiKey")} placeholder="sk-or-v1-..." className="bg-gray-50/50 border-black/5 focus:bg-white focus:border-black/10 h-12 transition-all text-black placeholder:text-gray-400 rounded-xl font-mono text-sm" />
                        <p className="text-xs text-gray-400">Required for the AI writing assistant.</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-black/5">
                        <div className="space-y-2">
                          <Label htmlFor="aiModel" className="text-xs font-bold font-mono tracking-wider text-gray-500 uppercase">Default Model</Label>
                          <Input 
                            id="aiModel" 
                            list="aiModelsList"
                            {...register("aiModel")} 
                            placeholder="e.g. meta-llama/llama-3.3-70b-instruct:free" 
                            className="bg-gray-50/50 border-black/5 focus:bg-white focus:border-black/10 h-12 transition-all text-black placeholder:text-gray-400 rounded-xl font-mono text-sm" 
                          />
                          <datalist id="aiModelsList">
                            <option value="meta-llama/llama-3.3-70b-instruct:free">Llama 3.3 70B Instruct (Free)</option>
                            <option value="google/gemini-2.0-pro-exp-02-05:free">Gemini 2.0 Pro Exp (Free)</option>
                            <option value="google/gemini-2.0-flash-lite-preview-02-05:free">Gemini 2.0 Flash Lite (Free)</option>
                            <option value="deepseek/deepseek-chat:free">DeepSeek V3 (Free)</option>
                            <option value="deepseek/deepseek-r1:free">DeepSeek R1 (Free)</option>
                            <option value="qwen/qwen-vl-plus:free">Qwen VL Plus (Free)</option>
                            <option value="mistralai/mistral-7b-instruct:free">Mistral 7B (Free)</option>
                            <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                            <option value="openai/gpt-4o">GPT-4o</option>
                            <option value="google/gemini-pro-1.5">Gemini 1.5 Pro</option>
                            <option value="meta-llama/llama-3-70b-instruct">Llama 3 70B</option>
                          </datalist>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="aiTemperature" className="text-xs font-bold font-mono tracking-wider text-gray-500 uppercase">Temperature (0.0 - 2.0)</Label>
                          <Input id="aiTemperature" type="number" step="0.1" min="0" max="2" {...register("aiTemperature")} className="bg-gray-50/50 border-black/5 focus:bg-white focus:border-black/10 h-12 transition-all text-black placeholder:text-gray-400 rounded-xl" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="aiTone" className="text-xs font-bold font-mono tracking-wider text-gray-500 uppercase">Default Tone</Label>
                          <Input id="aiTone" {...register("aiTone")} placeholder="e.g. Professional, Casual" className="bg-gray-50/50 border-black/5 focus:bg-white focus:border-black/10 h-12 transition-all text-black placeholder:text-gray-400 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="aiStyle" className="text-xs font-bold font-mono tracking-wider text-gray-500 uppercase">Default Style</Label>
                          <Input id="aiStyle" {...register("aiStyle")} placeholder="e.g. Technical, Storytelling" className="bg-gray-50/50 border-black/5 focus:bg-white focus:border-black/10 h-12 transition-all text-black placeholder:text-gray-400 rounded-xl" />
                        </div>
                      </div>

                      <div className="space-y-2 pt-6 border-t border-black/5">
                        <Label htmlFor="aiSystemPrompt" className="text-xs font-bold font-mono tracking-wider text-gray-500 uppercase">System Prompt</Label>
                        <textarea
                          id="aiSystemPrompt"
                          {...register("aiSystemPrompt")}
                          className="w-full min-h-[160px] resize-none p-4 rounded-xl bg-gray-50/50 border border-black/5 focus:bg-white focus:border-black/10 focus:outline-none focus:ring-0 text-sm transition-all text-black placeholder:text-gray-400"
                        />
                        <p className="text-xs text-gray-400">Instructions passed to the AI to guide its behavior.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Deployment Section */}
                {activeTab === "deployment" && (
                  <div className="space-y-8">
                    <div className="bg-white shadow-sm rounded-2xl p-6 md:p-8 border border-black/5 space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="netlifyBuildHook" className="text-xs font-bold font-mono tracking-wider text-gray-500 uppercase">Netlify Build Hook URL</Label>
                        <Input id="netlifyBuildHook" {...register("netlifyBuildHook")} placeholder="https://api.netlify.com/build_hooks/..." className="bg-gray-50/50 border-black/5 focus:bg-white focus:border-black/10 h-12 transition-all text-black placeholder:text-gray-400 rounded-xl" />
                        <p className="text-xs text-gray-400">Configure a build hook in Netlify to trigger deployments from here. Useful when you update SEO tags that require a fresh HTML build.</p>
                      </div>

                      <div className="pt-4 border-t border-black/5">
                        <Label className="text-xs font-bold font-mono tracking-wider text-gray-500 uppercase mb-4 block">Trigger Manual Build</Label>
                        <Button 
                          type="button" 
                          onClick={async () => {
                            const hookUrl = watch("netlifyBuildHook");
                            if (!hookUrl) {
                              toast.error("Please configure and save a Netlify Build Hook URL first.");
                              return;
                            }
                            const toastId = toast.loading("Triggering build...");
                            try {
                              const res = await fetch(hookUrl, { method: "POST" });
                              if (res.ok) {
                                toast.success("Build triggered successfully on Netlify!", { id: toastId });
                              } else {
                                throw new Error("Trigger failed");
                              }
                            } catch (e) {
                              toast.error("Failed to trigger build. Check URL.", { id: toastId });
                            }
                          }}
                          className="w-full sm:w-auto h-12 px-6 rounded-xl bg-black hover:bg-gray-800 text-white font-medium"
                        >
                          <RefreshCcw className="w-4 h-4 mr-2" />
                          Trigger Netlify Build Now
                        </Button>
                        <p className="text-xs text-gray-400 mt-3">Clicking this will trigger a new deployment immediately, updating the static HTML files.</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </form>
      </div>
    </div>
  );
}