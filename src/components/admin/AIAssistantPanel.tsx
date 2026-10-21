import { useState, useEffect } from "react";
import { Sparkles, Loader2, Wand2, Settings2, Code, MessageSquare, Table2, MousePointerClick } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../../lib/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { Switch } from "../ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

interface AIAssistantPanelProps {
  onGenerate: (params: any) => Promise<void>;
  generating: boolean;
  contentType: "hero" | "project" | "blog" | "seo" | string;
  defaultTopic?: string;
  autoGenerateSeo?: boolean;
  onAutoGenerateSeoChange?: (val: boolean) => void;
}

export function AIAssistantPanel({
  onGenerate,
  generating,
  contentType,
  defaultTopic = "",
  autoGenerateSeo,
  onAutoGenerateSeoChange,
}: AIAssistantPanelProps) {
  const [topic, setTopic] = useState(defaultTopic);
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("Professional");
  const [style, setStyle] = useState("Narrative");
  const [length, setLength] = useState("Medium (800-1200 words)");
  const [keywords, setKeywords] = useState("");
  const [language, setLanguage] = useState("English");
  
  const [includeCode, setIncludeCode] = useState(false);
  const [includeFaqs, setIncludeFaqs] = useState(false);
  const [includeTables, setIncludeTables] = useState(false);
  const [includeCta, setIncludeCta] = useState(true);

  useEffect(() => {
    if (!topic && defaultTopic) {
      setTopic(defaultTopic);
    }
  }, [defaultTopic]);

  const handleGenerate = async () => {
    if (!topic) {
      toast.error("Please enter a topic or instruction");
      return;
    }
    await onGenerate({
      topic,
      audience,
      tone,
      style,
      length,
      keywords,
      language,
      includeCode,
      includeFaqs,
      includeTables,
      includeCta,
      contentType,
    });
  };

  return (
    <div className="bg-gradient-to-br from-[#FAFAFA] to-white p-5 rounded-2xl border border-black/10 shadow-sm space-y-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-black">
          <Wand2 className="w-5 h-5 text-[#E85D04]" />
          <h3 className="font-display font-semibold text-lg">AI Assistant</h3>
        </div>
        <p className="text-gray-500 text-sm">
          Configure the AI model prompt to generate highly optimized production-ready content.
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-gray-900 font-medium text-sm">Topic or Brief</Label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={`What is this ${contentType} about? (e.g., "A deep dive into modern React architecture for scalable applications.")`}
            className="w-full resize-y min-h-[100px] p-4 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-[#E85D04]/20 focus:border-[#E85D04]/50 text-sm leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-700 text-xs uppercase tracking-wider font-semibold">Primary Keywords</Label>
            <Input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="react, frontend, architecture"
              className="h-11 bg-white text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700 text-xs uppercase tracking-wider font-semibold">Target Audience</Label>
            <Input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. Senior Developers"
              className="h-11 bg-white text-sm"
            />
          </div>
        </div>

        <Accordion className="w-full border-none">
          <AccordionItem value="advanced" className="border-none bg-gray-50/50 rounded-xl px-4 py-1">
            <AccordionTrigger className="hover:no-underline text-sm font-medium text-gray-700 py-3">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Prompt Builder Configuration
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-gray-600 text-xs uppercase font-medium tracking-wide">Tone</Label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-black/10 focus:outline-none focus:border-black/30 text-sm bg-white"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Conversational">Conversational</option>
                    <option value="Technical">Technical</option>
                    <option value="Authoritative">Authoritative</option>
                    <option value="Creative">Creative</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-600 text-xs uppercase font-medium tracking-wide">Writing Style</Label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-black/10 focus:outline-none focus:border-black/30 text-sm bg-white"
                  >
                    <option value="Narrative">Narrative</option>
                    <option value="Analytical">Analytical</option>
                    <option value="Descriptive">Descriptive</option>
                    <option value="Journalistic">Journalistic</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-600 text-xs uppercase font-medium tracking-wide">Word Count (Target)</Label>
                  <select
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-black/10 focus:outline-none focus:border-black/30 text-sm bg-white"
                  >
                    <option value="Short (300-500 words)">Short (300-500 words)</option>
                    <option value="Medium (800-1200 words)">Medium (800-1200 words)</option>
                    <option value="Long (1500-2500 words)">Long (1500-2500 words)</option>
                    <option value="Comprehensive (3000+ words)">Comprehensive (3000+ words)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-600 text-xs uppercase font-medium tracking-wide">Language</Label>
                  <Input
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="e.g. English"
                    className="h-10 text-sm bg-white border-black/10"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label className="text-gray-600 text-xs uppercase font-medium tracking-wide">Include Blocks</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${includeCode ? 'bg-[#E85D04]/5 border-[#E85D04]/30' : 'bg-white border-black/10 hover:border-black/20'}`} onClick={() => setIncludeCode(!includeCode)}>
                    <Switch checked={includeCode} onCheckedChange={setIncludeCode} />
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Code Examples</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${includeFaqs ? 'bg-[#E85D04]/5 border-[#E85D04]/30' : 'bg-white border-black/10 hover:border-black/20'}`} onClick={() => setIncludeFaqs(!includeFaqs)}>
                    <Switch checked={includeFaqs} onCheckedChange={setIncludeFaqs} />
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">FAQs</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${includeTables ? 'bg-[#E85D04]/5 border-[#E85D04]/30' : 'bg-white border-black/10 hover:border-black/20'}`} onClick={() => setIncludeTables(!includeTables)}>
                    <Switch checked={includeTables} onCheckedChange={setIncludeTables} />
                    <div className="flex items-center gap-2">
                      <Table2 className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Tables</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${includeCta ? 'bg-[#E85D04]/5 border-[#E85D04]/30' : 'bg-white border-black/10 hover:border-black/20'}`} onClick={() => setIncludeCta(!includeCta)}>
                    <Switch checked={includeCta} onCheckedChange={setIncludeCta} />
                    <div className="flex items-center gap-2">
                      <MousePointerClick className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Call to Action</span>
                    </div>
                  </div>
                </div>
              </div>

            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {onAutoGenerateSeoChange && (
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-black/10">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium text-gray-900">Generate SEO & Metadata</Label>
              <p className="text-xs text-gray-500">Auto-fill title, slug, excerpt, tags, and meta description.</p>
            </div>
            <Switch
              checked={autoGenerateSeo}
              onCheckedChange={onAutoGenerateSeoChange}
            />
          </div>
        )}
      </div>

      <Button
        type="button"
        onClick={handleGenerate}
        disabled={generating}
        className="w-full bg-[#E85D04] hover:bg-[#d04d00] text-white rounded-xl h-12 font-medium text-base shadow-sm"
      >
        {generating ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <Sparkles className="w-5 h-5 mr-2" />
        )}
        {generating ? 'Generating Content...' : `Generate ${contentType}`}
      </Button>
    </div>
  );
}
