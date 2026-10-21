import { Skeleton } from "../../components/ui/skeleton";
import { useState, useEffect, useCallback } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { setDoc, doc, getDoc, onSnapshot } from "firebase/firestore";
import { Save, Loader2, Link2, Briefcase, FileText, Image as ImageIcon, Sparkles } from "lucide-react";
import { db } from "../../lib/firebase";
import { Button } from "../../components/ui/button";
import { Input } from "../../lib/input";
import { Label } from "../../components/ui/label";
import { FileUpload } from "../../components/ui/file-upload";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import Hero from "../../components/Hero";
import debounce from "lodash/debounce";
import { api } from "../../services/api";
import { QUERY_KEYS, STALE_TIMES } from "../../lib/queryKeys";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { AIAssistantPanel } from "../../components/admin/AIAssistantPanel";

export default function HeroEditor() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, control, getValues, setValue } = useForm({
    defaultValues: {
      name: "",
      headline: "",
      subtitle: "",
      heroImage: "",
      experience: "",
      location: "",
      status: "",
      githubUrl: "",
      linkedinUrl: "",
      resumeUrl: "",
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [lastSaved, setLastSaved] = useState("");

  const currentValues = useWatch({ control });
  const [resolvedPreviewData, setResolvedPreviewData] = useState<any>(currentValues);

  useEffect(() => {
    let isMounted = true;
    async function resolvePreview() {
      const data = { ...currentValues };
      if (data.heroImage) data.heroImage = await api.resolveAsset(data.heroImage);
      if (data.resumeUrl) data.resumeUrl = await api.resolveAsset(data.resumeUrl);
      if (isMounted) setResolvedPreviewData(data);
    }
    resolvePreview();
    return () => { isMounted = false; };
  }, [currentValues]);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "hero", "main"), async (docSnap) => {
      if (docSnap.exists()) {
        reset(docSnap.data());
        setLoading(false);
      } else {
        const defaultHero = {
          name: "JAIMIN",
          headline: "Building AI-Powered Digital Experiences",
          subtitle: "A Visionary Full Stack Developer...",
          heroImage: "",
          experience: "5+ Years",
          location: "Remote",
          status: "Available",
          githubUrl: "https://github.com",
          linkedinUrl: "https://linkedin.com",
          resumeUrl: "",
        };
        await setDoc(doc(db, "hero", "main"), defaultHero);
        reset(defaultHero);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [reset]);

  const saveToDb = async (data: any) => {
    setSaving(true);
    try {
      Object.keys(data).forEach((key) => {
        if (data[key] === undefined) delete data[key];
      });
      await setDoc(doc(db, "hero", "main"), data, { merge: true });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.hero });
      setLastSaved(new Date().toLocaleTimeString());
    } catch (error: any) {
      toast.error("Failed to update Hero section.");
    } finally {
      setSaving(false);
    }
  };

  const debouncedSave = useCallback(
    debounce((data: any) => {
      saveToDb(data);
    }, 1500),
    []
  );

  // Autosave
  useEffect(() => {
    if (!loading) {
      debouncedSave(currentValues);
    }
  }, [currentValues, loading, debouncedSave]);

  const onSubmit = async (data: any) => {
    await saveToDb(data);
    toast.success("Hero section updated successfully.");
  };

  const handleGenerate = async (params: any) => {
    setGenerating(true);
    toast.loading("Generating Hero content...", { id: "hero-gen" });

    try {
      const docSnap = await getDoc(doc(db, "settings", "global"));
      let openRouterApiKey = "";
      let model = "google/gemini-2.5-flash";
      if (docSnap.exists()) {
        openRouterApiKey = docSnap.data().openRouterApiKey || "";
        model = docSnap.data().aiModel || "google/gemini-2.5-flash";
      }

      const response = await fetch("/api/generate-hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...params,
          openRouterApiKey,
          model
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate hero content");
      }

      const data = await response.json();
      const generatedContent = data.result
        .replace(/```json\s*[\s\S]*?\s*```$/, "")
        .replace(/```\s*[\s\S]*?\s*```$/, "")
        .trim();

      try {
        const parsed = JSON.parse(generatedContent);
        if (parsed.headline) setValue("headline", parsed.headline, { shouldDirty: true });
        if (parsed.subtitle) setValue("subtitle", parsed.subtitle, { shouldDirty: true });
        toast.success("Hero content generated!", { id: "hero-gen" });
      } catch (err) {
        // Fallback if not proper JSON
        const parsed = JSON.parse(data.result.match(/\{[\s\S]*\}/)?.[0] || "{}");
        if (parsed.headline) setValue("headline", parsed.headline, { shouldDirty: true });
        if (parsed.subtitle) setValue("subtitle", parsed.subtitle, { shouldDirty: true });
        toast.success("Hero content generated!", { id: "hero-gen" });
      }

    } catch (error: any) {
      toast.error(error.message || "Failed to generate", { id: "hero-gen" });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-16 w-3/4 rounded-xl" />
        <Skeleton className="h-16 w-2/3 rounded-xl" />
        <div className="flex gap-4">
           <Skeleton className="h-12 w-32 rounded-xl" />
           <Skeleton className="h-12 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col xl:flex-row w-full h-full xl:gap-8 items-start relative max-w-[1600px] mx-auto">
      <div className="flex-1 max-w-2xl space-y-6 w-full min-w-0 pb-24">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between relative sm:sticky sm:top-0 bg-[#FAFAFA] py-4 z-10 border-b border-black/5 mb-6 gap-4">
            <div>
              <h1 className="font-display font-bold text-3xl tracking-tight">
                Hero Section
              </h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
                {saving ? (
                  <span className="flex items-center text-orange-500"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Saving...</span>
                ) : lastSaved ? (
                  <span>Last saved at {lastSaved}</span>
                ) : (
                  <span>Manage landing area</span>
                )}
              </p>
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#E85D04] hover:bg-[#d04d00]"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>

          <AIAssistantPanel 
            contentType="hero"
            generating={generating}
            onGenerate={handleGenerate}
            defaultTopic={getValues("headline") || "I am a developer..."}
          />

          <Accordion className="w-full space-y-4 mt-6">
          
          <AccordionItem value="general" className="bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="font-display font-medium text-lg">General Information</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-500 font-mono text-xs uppercase">Display Name</Label>
                <Input id="name" {...register("name")} placeholder="e.g. JAIMIN" className="font-hero text-xl uppercase h-12" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="headline" className="text-gray-500 font-mono text-xs uppercase">Headline</Label>
                <Input id="headline" {...register("headline")} placeholder="e.g. I'm..." className="font-display font-medium text-lg text-[#E85D04] h-12" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle" className="text-gray-500 font-mono text-xs uppercase">Subtitle (Right Side)</Label>
                <textarea
                  id="subtitle"
                  {...register("subtitle")}
                  rows={4}
                  className="w-full resize-y min-h-[100px] p-4 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#E85D04]/20 focus:border-[#E85D04]/50 text-gray-800 font-display text-base leading-relaxed"
                  placeholder="A Visionary Full Stack Developer..."
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="media" className="bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <ImageIcon className="w-5 h-5 text-gray-400" />
                <span className="font-display font-medium text-lg">Media & Resume</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-gray-500 font-mono text-xs uppercase">Profile Image</Label>
                  <Controller
                    control={control}
                    name="heroImage"
                    render={({ field }) => (
                      <FileUpload value={field.value} onChange={field.onChange} path="hero" />
                    )}
                  />
                </div>
                <div className="space-y-4">
                  <Label className="text-gray-500 font-mono text-xs uppercase">Resume / CV (PDF)</Label>
                  <Controller
                    control={control}
                    name="resumeUrl"
                    render={({ field }) => (
                      <FileUpload value={field.value} onChange={field.onChange} path="resume" />
                    )}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="availability" className="bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <span className="font-display font-medium text-lg">Availability & Stats</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-gray-500 font-mono text-xs uppercase">Experience</Label>
                  <Input id="experience" {...register("experience")} placeholder="e.g. 5+ Years" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-500 font-mono text-xs uppercase">Location</Label>
                  <Input id="location" {...register("location")} placeholder="e.g. Remote" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-gray-500 font-mono text-xs uppercase">Status Badge</Label>
                  <Input id="status" {...register("status")} placeholder="e.g. Available" className="h-11" />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="social" className="bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <Link2 className="w-5 h-5 text-gray-400" />
                <span className="font-display font-medium text-lg">Social Links</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="githubUrl" className="text-gray-500 font-mono text-xs uppercase">GitHub URL</Label>
                  <Input id="githubUrl" {...register("githubUrl")} placeholder="https://github.com/..." className="font-mono text-sm h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl" className="text-gray-500 font-mono text-xs uppercase">LinkedIn URL</Label>
                  <Input id="linkedinUrl" {...register("linkedinUrl")} placeholder="https://linkedin.com/in/..." className="font-mono text-sm h-11" />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
        </Accordion>
        </form>
      </div>

      {/* Live Preview Panel */}
      <div className="hidden xl:block w-[700px] 2xl:w-[800px] shrink-0 sticky top-4 h-[calc(100vh-2rem)]">
        <div className="bg-white w-full h-full rounded-3xl border border-black/10 shadow-2xl overflow-hidden flex flex-col relative">
          <div className="h-12 bg-gray-50 border-b border-black/5 flex items-center px-4 justify-between shrink-0">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="text-xs font-mono text-gray-400 bg-white px-3 py-1 rounded-md border border-black/5">
              Live Preview
            </div>
            <div className="w-10"></div>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#FAFAFA]">
            {/* Provide mocked current values so the Hero component updates instantly */}
            <div className="origin-top transform scale-[0.65] 2xl:scale-[0.75] w-[153%] 2xl:w-[133%] h-auto -ml-[26%] 2xl:-ml-[16%]">
              <Hero previewData={resolvedPreviewData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

