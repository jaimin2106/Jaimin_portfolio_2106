import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../../lib/input";
import { Plus, Trash2, Sparkles, Loader2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export interface Faq {
  question: string;
  answer: string;
}

interface FaqEditorProps {
  value: Faq[];
  onChange: (faqs: Faq[]) => void;
  contentToAnalyze?: string;
}

export function FaqEditor({ value = [], onChange, contentToAnalyze }: FaqEditorProps) {
  const [generating, setGenerating] = useState(false);

  const handleAddFaq = () => {
    onChange([...value, { question: "", answer: "" }]);
  };

  const handleRemoveFaq = (index: number) => {
    const newFaqs = [...value];
    newFaqs.splice(index, 1);
    onChange(newFaqs);
  };

  const handleFaqChange = (index: number, field: keyof Faq, newValue: string) => {
    const newFaqs = [...value];
    newFaqs[index] = { ...newFaqs[index], [field]: newValue };
    onChange(newFaqs);
  };

  const handleGenerateFaqs = async () => {
    if (!contentToAnalyze || contentToAnalyze.length < 50) {
      toast.error("Please add some content to the blog first so AI can generate FAQs.");
      return;
    }

    setGenerating(true);
    toast.loading("Generating FAQs...", { id: "faq-gen" });

    try {
      let openRouterApiKey = "";
      let aiModel = "";
      try {
        const docSnap = await getDoc(doc(db, "settings", "global"));
        if (docSnap.exists()) {
          const data = docSnap.data();
          openRouterApiKey = data.openRouterApiKey || "";
          aiModel = data.aiModel || "";
        }
      } catch (e) {
        // Ignore
      }

      const response = await fetch("/api/generate-faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: contentToAnalyze,
          openRouterApiKey,
          model: aiModel
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate FAQs");
      }

      const data = await response.json();
      if (data.faqs && Array.isArray(data.faqs) && data.faqs.length > 0) {
        onChange([...value, ...data.faqs]);
        toast.success("FAQs generated successfully!", { id: "faq-gen" });
      } else {
        throw new Error("No FAQs returned");
      }
    } catch (error: any) {
      toast.error(error.message || "Error generating FAQs", { id: "faq-gen" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold font-display">Frequently Asked Questions</h3>
          <p className="text-sm text-gray-500">Manage FAQs for this content</p>
        </div>
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleGenerateFaqs} 
            disabled={generating}
            className="text-[#E85D04] border-[#E85D04]/20 hover:bg-[#E85D04]/10"
          >
            {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Auto-Generate
          </Button>
          <Button type="button" onClick={handleAddFaq} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" /> Add FAQ
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {value.map((faq, index) => (
          <div key={index} className="flex gap-3 bg-white p-4 rounded-xl border border-black/5 shadow-sm">
            <div className="cursor-move text-gray-300 mt-2">
              <GripVertical className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-3">
              <Input
                placeholder="Question"
                value={faq.question}
                onChange={(e) => handleFaqChange(index, "question", e.target.value)}
                className="font-medium"
              />
              <textarea
                placeholder="Answer"
                value={faq.answer}
                onChange={(e) => handleFaqChange(index, "answer", e.target.value)}
                rows={2}
                className="w-full resize-none p-3 bg-gray-50 border border-black/10 rounded-md text-sm focus:ring-1 focus:ring-black"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveFaq(index)}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {value.length === 0 && (
          <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-gray-500 text-sm">
            No FAQs added yet. Generate with AI or add manually.
          </div>
        )}
      </div>
    </div>
  );
}
