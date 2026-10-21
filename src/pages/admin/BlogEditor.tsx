import { QUERY_KEYS, STALE_TIMES } from "../../lib/queryKeys";
import { Skeleton } from "../../components/ui/skeleton";
import { useState, useEffect, useRef } from "react";

import { useParams, useNavigate } from "react-router-dom";
import { Controller, useForm as useRHForm } from "react-hook-form";
import { getDoc, setDoc, doc, onSnapshot, serverTimestamp } from "firebase/firestore";

import { triggerBuildHook } from "../../lib/buildHook";

import { db } from "../../lib/firebase";

import { Button } from "../../components/ui/button";
import { Input } from "../../lib/input";

import { Label } from "../../components/ui/label";
import { AIAssistantPanel } from "../../components/admin/AIAssistantPanel";
import { RichTextEditor } from "../../components/RichTextEditor";
import { FaqEditor } from "../../components/admin/FaqEditor";
import { FileUpload } from "../../components/ui/file-upload";
import { toast } from "sonner";

import { useQueryClient } from "@tanstack/react-query";

import { ContentStudioLayout } from "../../components/admin/ContentStudioLayout";
import { Loader2, Sparkles, CheckCircle2, Image as ImageIcon, Eye } from "lucide-react";

import OGImageGenerator from "../../components/admin/OGImageGenerator";
import { MediaLibrary } from "../../components/admin/MediaLibrary";
import { marked } from "marked";
import { useAutosave } from "../../lib/useAutosave";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";

export default function BlogEditor() {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isNew, setIsNew] = useState(id === undefined || id === "new");

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [generatingSeo, setGeneratingSeo] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [autoGenerateSeo, setAutoGenerateSeo] = useState(true);
  const [lastSaved, setLastSaved] = useState<string>("Saved just now");
  const originalDataRef = useRef<any>(null);

  const { register, control, handleSubmit, reset, watch, setValue, getValues } = useRHForm({
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      status: "Draft",
      faqs: [],
      image: "",
      category: "",
      date: "",
      readTime: "5 min read",
      authorName: "JM",
      authorRole: "Software Engineer",
      tags: "",
      seoTitle: "",
      seoDescription: "",
      keywords: "",
      canonicalUrl: "",
      ogTitle: "",
      ogDescription: "",
      twitterTitle: "",
      twitterDescription: "",
      imageAltText: "",
      schemaType: "BlogPosting",
    }
  });

  const formValues = watch();

  const handleGenerate = async (params: any) => {
    const title = getValues("title") || params.topic;
    
    if (!title && !params.topic) {
      toast.error("Please enter a title or provide a topic.");
      return;
    }

    setGeneratingContent(true);
    toast.loading("AI is writing your blog...", { id: "content-gen" });
    
    let generatedContent = "";
    
    try {
      let openRouterApiKey = "";
      let aiModel = "";
      let aiSystemPrompt = "";
      let aiTemperature = 0.7;
      
      try {
        const docSnap = await getDoc(doc(db, "settings", "global"));
        if (docSnap.exists()) {
          const data = docSnap.data();
          openRouterApiKey = data.openRouterApiKey || "";
          aiModel = data.aiModel || "";
          aiSystemPrompt = data.aiSystemPrompt || "";
          aiTemperature = parseFloat(data.aiTemperature) || 0.7;
        }
      } catch (e) {
        /* error suppressed */
      }

      let prompt = params.topic ? `Topic: ${params.topic}` : "";
      if (params.keywords) prompt += `\nKeywords: ${params.keywords}`;
      if (params.audience) prompt += `\nTarget Audience: ${params.audience}`;
      if (params.tone) prompt += `\nTone: ${params.tone}`;

      const response = await fetch("/api/generate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          prompt, 
          openRouterApiKey,
          model: aiModel,
          systemInstruction: aiSystemPrompt,
          temperature: aiTemperature,
          ...params
        }),
      });
      
      if (!response.ok) {
        let errText = "Failed to generate content";
        try { 
          const errObj = await response.json(); 
          errText = errObj.error || errText; 
        } catch(e) {}
        throw new Error(errText);
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      if (!reader) throw new Error("No reader available from stream");
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") {
              break;
            }
            if (!dataStr) continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.content) {
                generatedContent += parsed.content;
                const htmlContent = await marked.parse(generatedContent.replace(/```json\s*[\s\S]*$/g, ''));
                setValue("content", htmlContent, { shouldDirty: true });
              }
            } catch (e: any) {
               if (e.message && e.message !== "Unexpected end of JSON input" && !e.message.includes("JSON")) {
                 throw e;
               }
            }
          }
        }
      }
      
      const jsonMatch = generatedContent.match(/```json\s*([\s\S]*?)\s*```$/);
      let finalHtml = generatedContent;
      if (jsonMatch) {
        try {
          const metadata = JSON.parse(jsonMatch[1]);
          generatedContent = generatedContent.replace(/```json\s*[\s\S]*?\s*```$/, '').trim();
          finalHtml = await marked.parse(generatedContent);
          
          setValue("content", finalHtml, { shouldDirty: true });
          if (metadata.title && !getValues("title")) setValue("title", metadata.title, { shouldDirty: true });
          if (metadata.slug && !getValues("slug")) setValue("slug", metadata.slug, { shouldDirty: true });
          if (metadata.excerpt && !getValues("excerpt")) setValue("excerpt", metadata.excerpt, { shouldDirty: true });
          if (metadata.title && !getValues("seoTitle")) setValue("seoTitle", metadata.title, { shouldDirty: true });
          if (metadata.metaDescription && !getValues("seoDescription")) setValue("seoDescription", metadata.metaDescription, { shouldDirty: true });
          if (metadata.keywords && !getValues("keywords")) setValue("keywords", metadata.keywords, { shouldDirty: true });
          if (metadata.tags && (!getValues("tags") || getValues("tags")?.length === 0)) setValue("tags", metadata.tags, { shouldDirty: true });
        } catch (e) {
          finalHtml = await marked.parse(generatedContent);
          setValue("content", finalHtml, { shouldDirty: true });
        }
      } else {
        finalHtml = await marked.parse(generatedContent);
        setValue("content", finalHtml, { shouldDirty: true });
      }

      toast.success("Blog content generated successfully!", { id: "content-gen" });

      if (autoGenerateSeo) {
        await generateSeo();
      }
    } catch (error: any) {
      toast.error("Error generating blog content: " + error.message, { id: "content-gen" });
    } finally {
      setGeneratingContent(false);
    }
  };

  useEffect(() => {
    if (!isNew && id) {
      const unsubscribe = fetchBlog(id);
      return () => unsubscribe();
    }
  }, [id]);

  const fetchBlog = (blogId: string) => {
    const docRef = doc(db, "blogs", blogId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        let data = docSnap.data();
        if (!data.status) data.status = "Published";
        if (Array.isArray(data.tags)) data.tags = data.tags.join(", ");
        originalDataRef.current = data;
        reset(data);
      } else {
        toast.error("Blog post not found.");
        navigate("/admin/blogs");
      }
      setLoading(false);
    });
    return unsubscribe;
  };

  const generateSeo = async () => {
    // Save locally first to ensure getValues gets the latest if we just generated
    // Actually getValues() gets latest.
    const currentContent = getValues("content");
    const currentTitle = getValues("title");
    if (!currentContent) {
       toast.error("Please add some content first to generate SEO.", { id: "seo-gen" });
       return;
    }
    setGeneratingSeo(true);
    toast.loading("Generating SEO metadata...", { id: "seo-gen" });
    try {
      const docSnap = await getDoc(doc(db, "settings", "global"));
      let openRouterApiKey = "";
      let aiModel = "";
      if (docSnap.exists()) {
        openRouterApiKey = docSnap.data().openRouterApiKey || "";
        aiModel = docSnap.data().aiModel || "";
      }

      const response = await fetch("/api/generate-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: getValues("title"),
          description: getValues("excerpt"),
          content: getValues("content"),
          openRouterApiKey,
          model: aiModel || undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate SEO");

      const data = await response.json();
      let rawJson = data.result;
      const jsonMatch = rawJson.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) rawJson = jsonMatch[1];
      const result = JSON.parse(rawJson.trim());

      if (result.seoTitle) setValue("seoTitle", result.seoTitle, { shouldDirty: true });
      if (result.seoDescription) setValue("seoDescription", result.seoDescription, { shouldDirty: true });
      if (result.seoKeywords) setValue("keywords", result.seoKeywords, { shouldDirty: true });
      if (result.ogTitle) setValue("ogTitle", result.ogTitle, { shouldDirty: true });
      if (result.ogDescription) setValue("ogDescription", result.ogDescription, { shouldDirty: true });
      if (result.twitterTitle) setValue("twitterTitle", result.twitterTitle, { shouldDirty: true });
      if (result.twitterDescription) setValue("twitterDescription", result.twitterDescription, { shouldDirty: true });
      if (result.canonicalUrl) setValue("canonicalUrl", result.canonicalUrl, { shouldDirty: true });
      if (result.slug && !getValues("slug")) setValue("slug", result.slug, { shouldDirty: true });
      if (result.imageAltText) setValue("imageAltText", result.imageAltText, { shouldDirty: true });
      if (result.excerpt && !getValues("excerpt")) setValue("excerpt", result.excerpt, { shouldDirty: true });
      if (result.readingTime) setValue("readTime", result.readingTime, { shouldDirty: true });
      if (result.schemaType) setValue("schemaType", result.schemaType, { shouldDirty: true });

      toast.success("SEO generated successfully!", { id: "seo-gen" });
    } catch (err: any) {
      toast.error(err.message || "Error generating SEO", { id: "seo-gen" });
    } finally {
      setGeneratingSeo(false);
    }
  };

  
  const saveLogic = async (data: any) => {
    try {
      const blogId = isNew ? data.slug || Date.now().toString() : id;
      const docRef = doc(db, "blogs", blogId);

      let payload = { ...data };
      if (typeof data.tags === "string" && data.tags.trim() !== "") {
        payload.tags = data.tags.split(",").map((t: string) => t.trim());
      } else if (Array.isArray(data.tags)) {
        payload.tags = data.tags;
      } else {
        payload.tags = [];
      }

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key];
      });

      await setDoc(
        docRef,
        {
          ...payload,
          updatedAt: serverTimestamp(),
          ...(isNew ? { createdAt: serverTimestamp() } : {}),
        },
        { merge: true },
      );

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.blogs });
      setLastSaved(new Date().toLocaleTimeString());
      
      // Trigger rebuild if status or slug changed
      const oldStatus = originalDataRef.current?.status;
      const oldSlug = originalDataRef.current?.slug;
      if (
        (!isNew && (oldStatus !== payload.status || oldSlug !== payload.slug)) ||
        (isNew && payload.status === "Published")
      ) {
        triggerBuildHook(isNew ? "New blog published" : "Blog status/slug updated");
        originalDataRef.current = { ...originalDataRef.current, status: payload.status, slug: payload.slug };
      }

      if (isNew) {
        setIsNew(false);
        navigate(`/admin/blogs/${blogId}`, { replace: true });
      }
    } catch (error: any) {
      toast.error("Error saving blog: " + error.message);
      throw error;
    }
  };

  const { saving: autoSaving } = useAutosave(formValues, async (data) => {
    if (isNew) return; // Don't autosave entirely new drafts until initial save
    if (!data.title) return;
    try {
      await saveLogic(data);
    } catch(e) {}
  }, 5000);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      await saveLogic(data);
      toast.success("Blog saved successfully.");
    } finally {
      setSaving(false);
    }
  };


  if (loading) return (
    <div className="flex h-screen overflow-hidden animate-in fade-in duration-500">
      <div className="w-80 shrink-0 border-r border-[#111]/10 bg-white p-6 space-y-3">
         <Skeleton className="h-6 w-32 mb-4" />
         <Skeleton className="h-40 w-full rounded-2xl" />
         <Skeleton className="h-10 w-full rounded-xl" />
         <Skeleton className="h-10 w-full rounded-xl" />
      </div>
      <div className="flex-1 p-8 space-y-3">
         <Skeleton className="h-12 w-2/3" />
         <Skeleton className="h-6 w-1/3 mb-8" />
         <Skeleton className="h-[60vh] w-full rounded-2xl" />
      </div>
    </div>
  );

  const leftPanelContent = (
    <div className="space-y-3">
      <div className="space-y-3">
        <h3 className="font-display font-medium text-sm text-gray-900 border-b pb-2">Cover Image</h3>
        <Controller
          control={control}
          name="image"
          render={({ field }) => (
            <FileUpload value={field.value} onChange={field.onChange} path="blogs" />
          )}
        />
      </div>

      <div className="space-y-3">
        <h3 className="font-display font-medium text-sm text-gray-900 border-b pb-2">General Info</h3>
        <div>
          <Label htmlFor="category" className="text-gray-500 text-xs mb-1 block">Category</Label>
          <Input id="category" {...register("category")} className="h-10 bg-white" placeholder="e.g. Engineering" />
        </div>
        <div>
          <Label htmlFor="date" className="text-gray-500 text-xs mb-1 block">Date</Label>
          <Input id="date" {...register("date")} className="h-10 bg-white" placeholder="e.g. Oct 24, 2023" />
        </div>
        <div>
          <Label htmlFor="readTime" className="text-gray-500 text-xs mb-1 block">Read Time</Label>
          <Input id="readTime" {...register("readTime")} className="h-10 bg-white" placeholder="e.g. 5 min read" />
        </div>
        <div>
          <Label htmlFor="tags" className="text-gray-500 text-xs mb-1 block">Tags (comma separated)</Label>
          <Input id="tags" {...register("tags")} className="h-10 bg-white" placeholder="React, UI, UX..." />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-display font-medium text-sm text-gray-900 border-b pb-2">Author Info</h3>
        <div>
          <Label htmlFor="authorName" className="text-gray-500 text-xs mb-1 block">Author Name</Label>
          <Input id="authorName" {...register("authorName")} className="h-10 bg-white" placeholder="e.g. JM" />
        </div>
        <div>
          <Label htmlFor="authorRole" className="text-gray-500 text-xs mb-1 block">Author Role</Label>
          <Input id="authorRole" {...register("authorRole")} className="h-10 bg-white" placeholder="e.g. Software Engineer" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="font-display font-medium text-sm text-gray-900">SEO & Metadata</h3>
          <Button type="button" variant="ghost" size="sm" onClick={generateSeo} disabled={generatingSeo} className="h-6 text-[10px] px-2 rounded">
            {generatingSeo ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
            Auto
          </Button>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label htmlFor="seoTitle" className="text-gray-500 text-xs block">SEO Title</Label>
            <span className={`text-[10px] ${formValues.seoTitle?.length > 60 ? "text-red-500" : "text-gray-400"}`}>{formValues.seoTitle?.length || 0}/60</span>
          </div>
          <Input id="seoTitle" {...register("seoTitle")} className="h-10 bg-white" placeholder={formValues.title || "Meta title"} />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label htmlFor="seoDescription" className="text-gray-500 text-xs block">Meta Description</Label>
            <span className={`text-[10px] ${formValues.seoDescription?.length > 160 ? "text-red-500" : "text-gray-400"}`}>{formValues.seoDescription?.length || 0}/160</span>
          </div>
          <textarea {...register("seoDescription")} id="seoDescription" rows={3} className="w-full resize-none p-3 bg-white border border-black/10 rounded-md text-sm focus:ring-1 focus:ring-black" placeholder="Description for search engines" />
        </div>
        <div>
          <Label htmlFor="keywords" className="text-gray-500 text-xs mb-1 block">Keywords</Label>
          <Input id="keywords" {...register("keywords")} className="h-10 bg-white" placeholder="react, architecture..." />
        </div>

        <Accordion className="w-full border-none pt-2">
          <AccordionItem value="advanced-seo" className="border-none">
            <AccordionTrigger className="px-0 py-2 hover:no-underline text-xs font-medium text-gray-500">
              Advanced SEO Fields
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-3">
              <div>
                <Label htmlFor="canonicalUrl" className="text-gray-500 text-xs mb-1 block">Canonical URL</Label>
                <Input id="canonicalUrl" {...register("canonicalUrl")} className="h-10 bg-white" placeholder="https://..." />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="ogTitle" className="text-gray-500 text-xs block">Open Graph Title</Label>
                  <span className={`text-[10px] ${formValues.ogTitle?.length > 60 ? "text-red-500" : "text-gray-400"}`}>{formValues.ogTitle?.length || 0}/60</span>
                </div>
                <Input id="ogTitle" {...register("ogTitle")} className="h-10 bg-white" placeholder="OG Title" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="ogDescription" className="text-gray-500 text-xs block">Open Graph Description</Label>
                  <span className={`text-[10px] ${formValues.ogDescription?.length > 160 ? "text-red-500" : "text-gray-400"}`}>{formValues.ogDescription?.length || 0}/160</span>
                </div>
                <textarea {...register("ogDescription")} id="ogDescription" rows={2} className="w-full resize-none p-3 bg-white border border-black/10 rounded-md text-sm focus:ring-1 focus:ring-black" placeholder="OG Description" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="twitterTitle" className="text-gray-500 text-xs block">Twitter Title</Label>
                  <span className={`text-[10px] ${formValues.twitterTitle?.length > 60 ? "text-red-500" : "text-gray-400"}`}>{formValues.twitterTitle?.length || 0}/60</span>
                </div>
                <Input id="twitterTitle" {...register("twitterTitle")} className="h-10 bg-white" placeholder="Twitter Title" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="twitterDescription" className="text-gray-500 text-xs block">Twitter Description</Label>
                  <span className={`text-[10px] ${formValues.twitterDescription?.length > 160 ? "text-red-500" : "text-gray-400"}`}>{formValues.twitterDescription?.length || 0}/160</span>
                </div>
                <textarea {...register("twitterDescription")} id="twitterDescription" rows={2} className="w-full resize-none p-3 bg-white border border-black/10 rounded-md text-sm focus:ring-1 focus:ring-black" placeholder="Twitter Description" />
              </div>
              <div>
                <Label htmlFor="imageAltText" className="text-gray-500 text-xs mb-1 block">Image Alt Text</Label>
                <Input id="imageAltText" {...register("imageAltText")} className="h-10 bg-white" placeholder="Describe the cover image" />
              </div>
              <div>
                <Label htmlFor="schemaType" className="text-gray-500 text-xs mb-1 block">Schema Type</Label>
                <select id="schemaType" {...register("schemaType")} className="w-full h-10 px-3 bg-white border border-black/10 rounded-md text-sm focus:ring-1 focus:ring-black">
                  <option value="BlogPosting">BlogPosting</option>
                  <option value="Article">Article</option>
                  <option value="NewsArticle">NewsArticle</option>
                  <option value="TechArticle">TechArticle</option>
                </select>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );

  const mainContent = (
    <div className="space-y-4">
      <div className="space-y-3">
        
        {/* Banner Image */}
        <div className="group relative w-full h-48 md:h-64 bg-gray-100 rounded-xl overflow-hidden mb-6 border border-gray-200 transition-all hover:bg-gray-200 flex items-center justify-center cursor-pointer" onClick={() => setShowMediaLibrary(true)}>
          {formValues.image ? (
            <>
              <img src={formValues.image} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-medium flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm"><ImageIcon className="w-4 h-4" /> Change Cover Image</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500">
              <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
              <span className="font-medium text-sm">Add Cover Image</span>
            </div>
          )}
        </div>

          <Input id="title"
          {...register("title", { required: true })}
          className="text-3xl md:text-4xl lg:text-5xl font-display font-bold px-0 border-0 border-b border-transparent hover:border-black/5 focus-visible:border-black/20 focus-visible:ring-0 rounded-none bg-transparent h-auto py-2 placeholder:text-gray-300"
          placeholder="Blog Title"
        />
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center text-sm text-gray-500">
          <div className="flex items-center gap-2 flex-1 w-full md:w-auto">
            <span className="shrink-0 bg-gray-100 px-2 py-1 rounded">/blog/</span>
            <Input id="slug" {...register("slug", { required: true })} className="h-8 bg-transparent border-0 border-b hover:border-black/10 focus-visible:ring-0 focus-visible:border-black rounded-none px-0" placeholder="blog-slug" />
          </div>
        </div>
        <div>
          <textarea
            {...register("excerpt")}
            id="excerpt"
            rows={2}
            className="w-full resize-none text-lg text-gray-600 bg-transparent border-0 border-b border-transparent hover:border-black/5 focus:outline-none focus:border-black/20 focus:ring-0 placeholder:text-gray-300 py-2"
            placeholder="A short summary of the post..."
          />
        </div>
      </div>

      <AIAssistantPanel
        contentType="blog"
        generating={generatingContent}
        onGenerate={handleGenerate}
        defaultTopic={formValues.title}
        autoGenerateSeo={autoGenerateSeo}
        onAutoGenerateSeoChange={setAutoGenerateSeo}
      />

      <div className="prose prose-lg max-w-none">
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <RichTextEditor value={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      <div className="pt-6 border-t border-black/5 mt-8">
        <Controller
          name="faqs"
          control={control}
          render={({ field }) => (
            <FaqEditor value={field.value || []} onChange={field.onChange} contentToAnalyze={formValues.content} />
          )}
        />
      </div>
    </div>
  );

  const rightPanelContent = (
    <div className="space-y-3">
      <div className="bg-white p-3 rounded-xl shadow-sm border border-black/5">
        <h3 className="font-display font-semibold text-sm mb-4">Publishing Checklist</h3>
        <ul className="space-y-3 text-sm">
          <li className="flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${formValues.title ? "text-green-500" : "text-gray-300"}`} />
            <span className={formValues.title ? "text-gray-700" : "text-gray-400"}>Blog Title</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${formValues.image ? "text-green-500" : "text-gray-300"}`} />
            <span className={formValues.image ? "text-gray-700" : "text-gray-400"}>Cover Image</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${formValues.content?.length > 50 ? "text-green-500" : "text-gray-300"}`} />
            <span className={formValues.content?.length > 50 ? "text-gray-700" : "text-gray-400"}>Blog Content</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${formValues.seoTitle && formValues.seoDescription ? "text-green-500" : "text-gray-300"}`} />
            <span className={formValues.seoTitle && formValues.seoDescription ? "text-gray-700" : "text-gray-400"}>SEO Metadata</span>
          </li>
        </ul>
      </div>

      <div className="bg-white p-3 rounded-xl shadow-sm border border-black/5">
        <h3 className="font-display font-semibold text-sm mb-4">Search Preview</h3>
        <div className="space-y-1">
          <p className="text-xs text-[#1a0dab] truncate">yoursite.com/blog/{formValues.slug || "slug"}</p>
          <h4 className="text-lg text-[#1a0dab] hover:underline cursor-pointer truncate font-medium">
            {formValues.seoTitle || formValues.title || "Blog Title"}
          </h4>
          <p className="text-sm text-[#4d5156] line-clamp-2 leading-snug">
            {formValues.seoDescription || formValues.excerpt || "Blog description will appear here in search results."}
          </p>
        </div>
      </div>
      
      <div className="bg-white p-3 rounded-xl shadow-sm border border-black/5">
        <h3 className="font-display font-semibold text-sm mb-4">Content Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-xl font-bold">{formValues.content?.split(/\s+/).filter((w: string) => w.length > 0).length || 0}</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">Words</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-xl font-bold">{formValues.content?.length || 0}</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">Characters</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <form id="blog-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit)(); }}>
      <ContentStudioLayout
        title={formValues.title}
        isNew={isNew}
        status={formValues.status}
        setStatus={(status) => setValue("status", status, { shouldDirty: true })}
        saving={saving || autoSaving}
        onSave={handleSubmit(onSubmit)}
        onBack={() => navigate("/admin/blogs")}
        leftPanelContent={leftPanelContent}
        mainContent={mainContent}
        rightPanelContent={rightPanelContent}
        lastSaved={lastSaved}
        previewUrl={!isNew ? `/blog/${id}?mode=preview` : undefined}
      />
    </form>

      {showMediaLibrary && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Select Cover Image</h2>
              <Button type="button" variant="ghost" onClick={() => setShowMediaLibrary(false)}>Close</Button>
            </div>
            <div className="h-[60vh] overflow-y-auto">
              <MediaLibrary isModal={true} onSelect={(_id, url) => { setValue("image", url, { shouldDirty: true }); setShowMediaLibrary(false); }} />
            </div>
          </div>
        </div>
      )}

      </>
  );
}


