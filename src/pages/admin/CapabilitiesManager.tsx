import { QUERY_KEYS, STALE_TIMES } from "../../lib/queryKeys";
import { useState, useEffect } from "react";

import { collection, getDocs, doc, setDoc, query, orderBy, writeBatch } from "firebase/firestore";

import { useForm, Controller } from "react-hook-form";
import { Plus, Search, MoreVertical, Edit2, Trash2, Save, Loader2, ArrowLeft, GripVertical } from "lucide-react";

import { motion } from "motion/react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import { toast } from "sonner";

import { db } from "../../lib/firebase";

import { Button } from "../../components/ui/button";
import { Input } from "../../lib/input";

import { Label } from "../../components/ui/label";
import { FileUpload } from "../../components/ui/file-upload";
import { useDeleteEntity } from "../../hooks/useDeleteEntity";

import { useQueryClient } from "@tanstack/react-query";


import { AIAssistantPanel } from "../../components/admin/AIAssistantPanel";

interface Capability {
  id: string;
  title: string;
  tech: string;
  desc: string;
  iconName: string;
  order?: number;
}

const DEFAULT_CAPABILITIES = [
  {
    title: "Frontend Engineering",
    iconName: "Code2",
    tech: "React, Next.js, Tailwind CSS",
    desc: "Building highly interactive, accessible, and performant web applications with modern React ecosystems."
  },
  {
    title: "Backend Core",
    iconName: "Database",
    tech: "Node.js, PostgreSQL, Supabase",
    desc: "Architecting secure, scalable APIs and robust database schemas that power complex SaaS platforms."
  },
  {
    title: "Cloud Integrations",
    iconName: "Sparkles",
    tech: "AWS, Docker, LLMs",
    desc: "Deploying containerized infrastructure and integrating LLMs to build intelligent, context-aware products."
  }
];

export default function CapabilitiesManager() {
  const queryClient = useQueryClient();
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [config, setConfig] = useState({ title: "CAPABILITIES", subtitle: "Here's how I help businesses bring their ideas to life through robust engineering." });
  const [savingConfig, setSavingConfig] = useState(false);

  const { register, handleSubmit, reset, control } = useForm<Capability>();
  const [saving, setSaving] = useState(false);

  const [generating, setGenerating] = useState(false);

  const handleGenerate = async (params: any) => {
    setGenerating(true);
    toast.loading("Generating Capability...", { id: "cap-gen" });
    try {
      const docSnap = await getDocs(query(collection(db, "settings")));
      let openRouterApiKey = "";
      let model = "google/gemini-2.5-flash";
      docSnap.forEach(doc => {
        if (doc.id === "global") {
          openRouterApiKey = doc.data().openRouterApiKey || "";
          model = doc.data().aiModel || "google/gemini-2.5-flash";
        }
      });

      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: "capability",
          ...params,
          openRouterApiKey,
          model,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate capability");
      }

      const data = await response.json();
      let generatedContent = data.result
        .replace(/```json\s*[\s\S]*?\s*```$/, "")
        .replace(/```\s*[\s\S]*?\s*```$/, "")
        .trim();

      try {
        const parsed = JSON.parse(generatedContent);
        if (parsed.title) reset({ ...control._defaultValues, ...parsed });
        toast.success("Capability generated!", { id: "cap-gen" });
      } catch (err) {
        const parsed = JSON.parse(data.result.match(/\{[\s\S]*\}/)?.[0] || "{}");
        if (parsed.title) reset({ ...control._defaultValues, ...parsed });
        toast.success("Capability generated!", { id: "cap-gen" });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate", { id: "cap-gen" });
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchCapabilities();
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const docSnap = await getDocs(query(collection(db, "capabilities_config")));
      docSnap.forEach(doc => {
        if (doc.id === "main") {
          setConfig(doc.data() as any);
        }
      });
    } catch (e) {
      /* error suppressed */
    }
  };

  const saveConfig = async () => {
    setSavingConfig(true);
    try {
      await setDoc(doc(db, "capabilities_config", "main"), config);
      queryClient.invalidateQueries({ queryKey: ['public_capabilities_config'] });
      toast.success("Section details saved");
    } catch (error) {
      toast.error("Error saving config");
    } finally {
      setSavingConfig(false);
    }
  };

  const fetchCapabilities = async () => {
    try {
      const q = query(collection(db, "capabilities"), orderBy("order", "asc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Capability[];
      
      if (data.length === 0) {
        toast.info("Initializing default capabilities...");
        const batch = writeBatch(db);
        const newCaps: Capability[] = [];
        DEFAULT_CAPABILITIES.forEach((cap, index) => {
          const capId = Date.now().toString() + index;
          const ref = doc(db, "capabilities", capId);
          const fullCap = { id: capId, ...cap, order: index };
          batch.set(ref, fullCap);
          newCaps.push(fullCap);
        });
        await batch.commit();
        setCapabilities(newCaps);
        toast.success("Default capabilities loaded.");
      } else {
        setCapabilities(data);
      }
    } catch (error) {
      /* error suppressed */
      toast.error("Error fetching capabilities.");
    } finally {
      setLoading(false);
    }
  };

  const { handleDelete, isDeleting } = useDeleteEntity({
    collectionName: "capabilities",
    entityName: "capability",
    onSuccess: (id) => {
      setCapabilities(prev => prev.filter(c => c.id !== id));
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.capabilities });
    }
  });

  const startEdit = (capability?: Capability) => {
    if (capability) {
      reset(capability);
      setEditingId(capability.id);
    } else {
      reset({ title: "", tech: "", desc: "", iconName: "Code2", order: capabilities.length });
      setEditingId("new");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset();
  };

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      const capId = editingId === "new" ? Date.now().toString() : data.id;
      const docRef = doc(db, "capabilities", capId);

      // Remove undefined values
      Object.keys(data).forEach(key => {
        if (data[key] === undefined) delete data[key];
      });

      await setDoc(docRef, data, { merge: true });
      
      if (editingId === "new") {
        setCapabilities([...capabilities, { ...data, id: capId }].sort((a, b) => (a.order || 0) - (b.order || 0)));
      } else {
        setCapabilities(capabilities.map(c => c.id === capId ? { ...data, id: capId } : c).sort((a, b) => (a.order || 0) - (b.order || 0)));
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.capabilities });
      toast.success("Capability saved successfully.");
      setEditingId(null);
    } catch (error) {
      /* error suppressed */
      toast.error("Error saving capability.");
    } finally {
      setSaving(false);
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const items = Array.from(capabilities);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const orderedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setCapabilities(orderedItems);

    try {
      const batch = writeBatch(db);
      orderedItems.forEach((item) => {
        const ref = doc(db, "capabilities", item.id);
        batch.update(ref, { order: item.order });
      });
      await batch.commit();
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.capabilities });
      toast.success("Reordered successfully.");
    } catch (err) {
      /* error suppressed */
      toast.error("Failed to save order.");
    }
  };

  if (editingId) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6 pb-24">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={(e) => { e.preventDefault(); cancelEdit(); }}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-display font-bold text-2xl">{editingId === "new" ? "New Capability" : "Edit Capability"}</h1>
          </div>
          <Button type="submit" disabled={saving} className="rounded-full bg-[#E85D04] hover:bg-[#d04d00]">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            Save changes
          </Button>
        </div>

        <AIAssistantPanel 
          contentType="capability"
          generating={generating}
          onGenerate={handleGenerate}
        />

        <div className="bg-white p-6 md:p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-500 font-mono text-xs uppercase">Title</Label>
            <Input {...register("title", { required: true })} placeholder="e.g. Frontend Engineering" />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-500 font-mono text-xs uppercase">Technologies (Subtitle)</Label>
            <Input {...register("tech")} placeholder="e.g. React, Next.js, Tailwind CSS" />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-500 font-mono text-xs uppercase">Description</Label>
            <textarea
              {...register("desc", { required: true })}
              rows={3}
              className="w-full resize-none p-4 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#E85D04]/20 focus:border-[#E85D04]/50"
              placeholder="Brief description of the service..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-500 font-mono text-xs uppercase">Lucide Icon Name</Label>
            <Input {...register("iconName")} placeholder="e.g. Code2, Database, Sparkles" />
          </div>
        </div>
      </form>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900">Capabilities</h1>
          <p className="text-gray-500 mt-1">Manage the services and capabilities displayed on the homepage.</p>
        </div>
        <Button onClick={() => startEdit()} className="rounded-full bg-[#E85D04] hover:bg-[#d04d00]">
          <Plus className="w-4 h-4 mr-2" /> New Capability
        </Button>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
        <h2 className="font-display font-bold text-xl">Section Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-gray-500 font-mono text-xs uppercase">Section Title</Label>
            <Input 
              value={config.title} 
              onChange={e => setConfig({...config, title: e.target.value})}
              placeholder="CAPABILITIES" 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-500 font-mono text-xs uppercase">Section Subtitle</Label>
            <Input 
              value={config.subtitle} 
              onChange={e => setConfig({...config, subtitle: e.target.value})}
              placeholder="Subtitle text..." 
            />
          </div>
        </div>
        <Button onClick={saveConfig} disabled={savingConfig} className="rounded-full bg-black hover:bg-gray-800 text-white">
          {savingConfig && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <Save className="w-4 h-4 mr-2" /> Save Section Details
        </Button>
      </div>

      <div className="bg-white border border-black/5 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : capabilities.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No capabilities found. Add one to see it on the portfolio.</div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="capabilities-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="divide-y divide-black/5">
                  {capabilities.map((cap, index) => (
                    <Draggable key={cap.id} draggableId={cap.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors group ${snapshot.isDragging ? 'bg-gray-50 shadow-lg' : ''}`}
                        >
                          <div className="flex items-center gap-4">
                            <div {...provided.dragHandleProps} className="cursor-grab text-gray-400 hover:text-gray-600">
                              <GripVertical className="w-5 h-5" />
                            </div>
                            <div>
                               <h3 className="font-display font-bold text-lg text-gray-900">{cap.title}</h3>
                               <p className="text-gray-500 text-sm mt-1">{cap.tech}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5" onClick={() => startEdit(cap)}>
                              <Edit2 className="w-4 h-4 text-gray-600" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-50 hover:text-red-600 text-gray-600" onClick={(e) => handleDelete(cap.id, e)} disabled={isDeleting === cap.id}>
                              {isDeleting === cap.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </motion.div>
  );
}


