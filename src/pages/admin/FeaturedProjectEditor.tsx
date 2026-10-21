import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { setDoc, doc, onSnapshot, collection, query, where, getDocs } from "firebase/firestore";
import { Save, Loader2 } from "lucide-react";
import { db } from "../../lib/firebase";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function FeaturedProjectEditor() {
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      projectId: ""
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState<{id: string, title: string}[]>([]);

  useEffect(() => {
    fetchProjects();
    const unsubscribe = onSnapshot(doc(db, "featuredProject", "main"), (docSnap) => {
      if (docSnap.exists()) {
        reset(docSnap.data());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [reset]);

  const fetchProjects = async () => {
    try {
      const q = query(collection(db, "projects"));
      const pSnap = await getDocs(q);
      const docs = pSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      const published = docs.filter((d: any) => d.status === "Published" || !d.status);
      setProjects(published.map((d: any) => ({ id: d.id, title: d.title })));
    } catch (error) {
      /* error suppressed */
    }
  };

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      // Remove undefined values
      Object.keys(data).forEach(key => {
        if (data[key] === undefined) delete data[key];
      });
      await setDoc(doc(db, "featuredProject", "main"), data, { merge: true });
      queryClient.invalidateQueries({ queryKey: ['public_featured_project'] });
      toast.success("Featured Project updated successfully.");
    } catch (error: any) {
      /* error suppressed */
      toast.error("Failed to update Featured Project.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl tracking-tight">Featured Project</h1>
          <p className="text-gray-500 mt-2">Select the project to highlight on your homepage.</p>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
        <div className="space-y-4">
          <Label className="text-gray-500 font-mono text-xs uppercase">Select Project</Label>
          <Controller
            name="projectId"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full p-4 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#E85D04]/20 focus:border-[#E85D04]/50 text-gray-800 font-medium"
              >
                <option value="">-- No Featured Project --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            )}
          />
        </div>
        <Button type="submit" disabled={saving} className="w-full py-6 rounded-xl bg-black hover:bg-black/90 text-white text-base">
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <Save className="w-4 h-4 mr-2" />
          Update Featured Project
        </Button>
      </div>
    </form>
  );
}
