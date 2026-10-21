import { QUERY_KEYS, STALE_TIMES } from "../../lib/queryKeys";
import { useState, useEffect } from "react";

import { useForm } from "react-hook-form";
import { setDoc, doc, onSnapshot } from "firebase/firestore";

import { Save, Loader2 } from "lucide-react";

import { db } from "../../lib/firebase";

import { Button } from "../../components/ui/button";
import { Input } from "../../lib/input";

import { Label } from "../../components/ui/label";
import { toast } from "sonner";

import { useQueryClient } from "@tanstack/react-query";


export default function StatsEditor() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      stat1Value: "40+",
      stat1Label: "Successful Projects",
      stat2Value: "99%",
      stat2Label: "System Uptime",
      stat3Value: "05+",
      stat3Label: "Years of Experience"
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "stats", "main"), (docSnap) => {
      if (docSnap.exists()) {
        reset(docSnap.data());
      }
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [reset]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      // Remove undefined values
      Object.keys(data).forEach(key => {
        if (data[key] === undefined) delete data[key];
      });
      await setDoc(doc(db, "stats", "main"), data, { merge: true });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      toast.success("Stats updated successfully.");
    } catch (error: any) {
      /* error suppressed */
      toast.error("Failed to update Stats.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl tracking-tight">Stats Manager</h1>
          <p className="text-gray-500 mt-2">Manage the 3 stats featured on your homepage.</p>
        </div>
        <Button type="submit" disabled={saving} className="rounded-full bg-[#E85D04] hover:bg-[#d04d00]">
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat 1 */}
        <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
          <h3 className="font-display font-medium text-lg">Stat 1</h3>
          <div className="space-y-2">
            <Label className="text-gray-500 font-mono text-xs uppercase">Value</Label>
            <Input {...register("stat1Value")} placeholder="e.g. 40+" className="font-hero text-xl" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-500 font-mono text-xs uppercase">Label</Label>
            <Input {...register("stat1Label")} placeholder="e.g. Successful Projects" />
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4 bg-gray-900 text-white">
          <h3 className="font-display font-medium text-lg">Stat 2</h3>
          <div className="space-y-2">
            <Label className="text-gray-400 font-mono text-xs uppercase">Value</Label>
            <Input {...register("stat2Value")} placeholder="e.g. 99%" className="font-hero text-xl bg-black/50 border-white/20 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-400 font-mono text-xs uppercase">Label</Label>
            <Input {...register("stat2Label")} placeholder="e.g. System Uptime" className="bg-black/50 border-white/20 text-white" />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-[#F7F6F2] p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
          <h3 className="font-display font-medium text-lg">Stat 3</h3>
          <div className="space-y-2">
            <Label className="text-gray-500 font-mono text-xs uppercase">Value</Label>
            <Input {...register("stat3Value")} placeholder="e.g. 05+" className="font-hero text-xl text-[#E85D04]" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-500 font-mono text-xs uppercase">Label</Label>
            <Input {...register("stat3Label")} placeholder="e.g. Years of Experience" />
          </div>
        </div>
      </div>
    </form>
  );
}


