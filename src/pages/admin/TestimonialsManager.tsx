import { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc, query } from "firebase/firestore";
import { useForm, Controller } from "react-hook-form";
import { Plus, Edit2, Trash2, Save, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { db } from "../../lib/firebase";
import { Button } from "../../components/ui/button";
import { Input } from "../../lib/input";
import { Label } from "../../components/ui/label";
import { FileUpload } from "../../components/ui/file-upload";
import { toast } from "sonner";
import { useDeleteEntity } from "../../hooks/useDeleteEntity";
import { AIAssistantPanel } from "../../components/admin/AIAssistantPanel";
import { api } from "../../services/api";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  img: string;
}

const DEFAULT_TESTIMONIALS = [
  { 
    name: "Daniel Carter", 
    role: "Founder of Flowbit",
    quote: "Jaimin transformed our concept into a platform that's scalable and visually striking. His attention to backend architecture is unmatched.",
    img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=256&auto=format&fit=crop"
  },
  { 
    name: "Michael Reeves", 
    role: "PM at NexaLabs",
    quote: "A rare mix of strong design sensibility and extremely robust engineering. Delivering faster than we could spec it out.",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop"
  }
];

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, control } = useForm<Testimonial>();
  const [saving, setSaving] = useState(false);

  const [generating, setGenerating] = useState(false);

  const handleGenerate = async (params: any) => {
    setGenerating(true);
    toast.loading("Generating Testimonial...", { id: "test-gen" });
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
          contentType: "testimonial",
          ...params,
          openRouterApiKey,
          model,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate testimonial");
      }

      const data = await response.json();
      let generatedContent = data.result
        .replace(/```json\s*[\s\S]*?\s*```$/, "")
        .replace(/```\s*[\s\S]*?\s*```$/, "")
        .trim();

      try {
        const parsed = JSON.parse(generatedContent);
        if (parsed.author) reset({ ...control._defaultValues, name: parsed.author, role: parsed.role, quote: parsed.content });
        toast.success("Testimonial generated!", { id: "test-gen" });
      } catch (err) {
        const parsed = JSON.parse(data.result.match(/\{[\s\S]*\}/)?.[0] || "{}");
        if (parsed.author) reset({ ...control._defaultValues, name: parsed.author, role: parsed.role, quote: parsed.content });
        toast.success("Testimonial generated!", { id: "test-gen" });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate", { id: "test-gen" });
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const data = await api.getTestimonials();
      
      if (data.length === 0) {
        // Initialize default testimonials
        const newTestimonials: Testimonial[] = [];
        for (let i = 0; i < DEFAULT_TESTIMONIALS.length; i++) {
          const tId = Date.now().toString() + i;
          const newT: Testimonial = { ...DEFAULT_TESTIMONIALS[i], id: tId };
          await setDoc(doc(db, "testimonials", tId), newT);
          newTestimonials.push(newT);
        }
        setTestimonials(newTestimonials);
      } else {
        setTestimonials(data as Testimonial[]);
      }
    } catch (error) {
      /* error suppressed */
    } finally {
      setLoading(false);
    }
  };

  const { handleDelete, isDeleting } = useDeleteEntity({
    collectionName: "testimonials",
    entityName: "testimonial",
    onSuccess: (id) => {
      setTestimonials(prev => prev.filter(c => c.id !== id));
    }
  });

  const startEdit = (testimonial?: Testimonial) => {
    if (testimonial) {
      reset(testimonial);
      setEditingId(testimonial.id);
    } else {
      reset({ name: "", role: "", quote: "", img: "" });
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
      const tId = editingId === "new" ? Date.now().toString() : data.id;
      const docRef = doc(db, "testimonials", tId);

      // Remove undefined values
      Object.keys(data).forEach(key => {
        if (data[key] === undefined) delete data[key];
      });

      await setDoc(docRef, data, { merge: true });
      
      if (editingId === "new") {
        setTestimonials([...testimonials, { ...data, id: tId }]);
      } else {
        setTestimonials(testimonials.map(c => c.id === tId ? { ...data, id: tId } : c));
      }
      setEditingId(null);
      toast.success("Testimonial saved successfully");
    } catch (error) {
      /* error suppressed */
      toast.error("Error saving testimonial.");
    } finally {
      setSaving(false);
    }
  };

  if (editingId) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={(e) => { e.preventDefault(); cancelEdit(); }}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-display font-bold text-2xl">{editingId === "new" ? "New Testimonial" : "Edit Testimonial"}</h1>
          </div>
          <Button type="submit" disabled={saving} className="rounded-full bg-[#E85D04] hover:bg-[#d04d00]">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            Save changes
          </Button>
        </div>

        <AIAssistantPanel
          contentType="testimonial"
          generating={generating}
          onGenerate={handleGenerate}
        />

        <div className="bg-white p-6 md:p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-500 font-mono text-xs uppercase">Client Name</Label>
            <Input {...register("name", { required: true })} placeholder="e.g. Daniel Carter" />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-500 font-mono text-xs uppercase">Role & Company</Label>
            <Input {...register("role")} placeholder="e.g. Founder of Flowbit" />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-500 font-mono text-xs uppercase">Quote</Label>
            <textarea
              {...register("quote", { required: true })}
              rows={4}
              className="w-full resize-none p-4 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#E85D04]/20 focus:border-[#E85D04]/50"
              placeholder="Jaimin transformed our concept into a platform..."
            />
          </div>

          <div className="space-y-4">
             <Label className="text-gray-500 font-mono text-xs uppercase">Avatar Image</Label>
             <Controller
               control={control}
               name="img"
               render={({ field }) => (
                 <FileUpload 
                   value={field.value} 
                   onChange={field.onChange} 
                   path="testimonials"
                 />
               )}
             />
          </div>
        </div>
      </form>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900">Testimonials</h1>
          <p className="text-gray-500 mt-1">Manage client testimonials on the homepage.</p>
        </div>
        <Button onClick={() => startEdit()} className="rounded-full bg-[#E85D04] hover:bg-[#d04d00]">
          <Plus className="w-4 h-4 mr-2" /> New Testimonial
        </Button>
      </div>

      <div className="bg-white border border-black/5 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : testimonials.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No testimonials found.</div>
        ) : (
          <div className="divide-y divide-black/5">
            {testimonials.map((t) => (
              <div key={t.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden shrink-0">
                     {t.img ? <img src={t.img || undefined} alt={t.name} className="w-full h-full object-cover" /> : null}
                   </div>
                   <div>
                     <h3 className="font-display font-bold text-lg text-gray-900">{t.name}</h3>
                     <p className="text-gray-500 text-sm mt-1">{t.role}</p>
                   </div>
                </div>
                <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5" onClick={() => startEdit(t)}>
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-50 hover:text-red-600 text-gray-600" onClick={(e) => handleDelete(t.id, e)} disabled={isDeleting === t.id}>
                    {isDeleting === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
