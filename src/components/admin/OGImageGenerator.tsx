import { useState, useRef } from "react";
import { toBlob } from "html-to-image";
import { Button } from "../ui/button";
import { Loader2, Image as ImageIcon, Download } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const uploadWithTimeout = (storageRef: any, file: Blob, metadata?: any): Promise<any> => {
  return Promise.race([
    uploadBytes(storageRef, file, metadata),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Upload timeout - check Firebase Storage rules and configuration.")), 15000))
  ]);
};

import { storage } from "../../lib/firebase";
import { toast } from "sonner";

interface OGImageGeneratorProps {
  title: string;
  subtitle?: string;
  type?: "og" | "favicon";
  onGenerated: (url: string) => void;
}

export default function OGImageGenerator({ title, subtitle, type = "og", onGenerated }: OGImageGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const generateAndUpload = async () => {
    if (!containerRef.current) return;
    setGenerating(true);
    toast.loading("Generating and uploading image...", { id: "og-gen" });
    
    let blob: Blob | null = null;
    try {
      // Ensure fonts are loaded before generating
      await document.fonts.ready;
      blob = await toBlob(containerRef.current, {
        quality: 1,
        pixelRatio: 2,
        width: type === "og" ? 1200 : 512,
        height: type === "og" ? 630 : 512,
        style: { transform: 'none' }
      });
      
      if (!blob) throw new Error("Failed to generate image blob");
      
      const fileName = `generated/${type}-${Date.now()}.png`;
      const storageRef = ref(storage, fileName);
      
      await uploadWithTimeout(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      
      onGenerated(url);
      toast.success("Image generated and saved successfully!", { id: "og-gen" });

    } catch (error: any) {
      console.warn("Storage upload failed, falling back to base64", error);
      try {
        const reader = new FileReader();
        if (blob) reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          if (base64data.length > 1048487) {
             toast.error('Image too large without Firebase Storage enabled', { id: "og-gen" });
             setGenerating(false);
             return;
          }
          onGenerated(base64data);
          toast.success("Image generated (via base64 fallback)!", { id: "og-gen" });
          setGenerating(false);
        };
      } catch (err) {
        toast.error("Error generating image: " + error.message, { id: "og-gen" });
        setGenerating(false);
      }
    }

  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">
          Generate {type === "favicon" ? "Favicon" : "Open Graph Image"}
        </span>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={generateAndUpload} 
          disabled={generating}
        >
          {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />}
          Generate & Save
        </Button>
      </div>
      
      {/* Hidden container for rendering */}
      <div className="overflow-hidden border border-gray-200 rounded-lg max-h-[300px] relative">
        <div className="transform scale-[0.4] origin-top-left pointer-events-none">
          {type === "og" ? (
            <div 
              ref={containerRef}
              style={{ width: '1200px', height: '630px' }} 
              className="bg-gradient-to-br from-gray-900 to-black p-20 flex flex-col justify-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#E85D04]/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
              <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
              
              <div className="relative z-10">
                <div className="w-20 h-2 bg-[#E85D04] mb-12"></div>
                <h1 className="text-white font-display text-[80px] leading-[1.1] font-bold mb-8 max-w-[900px]">
                  {title || "Dynamic Title"}
                </h1>
                {subtitle && (
                  <p className="text-gray-300 font-sans text-3xl max-w-[800px] leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div 
              ref={containerRef}
              style={{ width: '512px', height: '512px' }} 
              className="bg-black flex items-center justify-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#E85D04]/20 to-transparent"></div>
              <h1 className="text-white font-display text-[250px] font-bold z-10 uppercase tracking-tighter">
                {(title || "A").substring(0, 1)}
              </h1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
