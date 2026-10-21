import { useState, useEffect } from "react";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../services/api";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "./dialog";
import { MediaLibrary } from "../admin/MediaLibrary";

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  path: string;
}

export function FileUpload({ value, onChange, path }: FileUploadProps) {
  const [open, setOpen] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function resolve() {
      if (!value) {
        setResolvedUrl("");
        return;
      }
      if (value.startsWith("http") || value.startsWith("data:")) {
        setResolvedUrl(value);
      } else {
        setLoading(true);
        const url = await api.resolveAsset(value);
        setResolvedUrl(url);
        setLoading(false);
      }
    }
    resolve();
  }, [value]);

  const isPdf = (url: string) => {
    if (!url) return false;
    if (url.includes("application/pdf")) return true;
    if (url.endsWith(".pdf") || url.endsWith(".doc") || url.endsWith(".docx")) return true;
    // Firebase storage URL check for .pdf
    if (url.includes(".pdf?alt=media")) return true;
    return false;
  };

  const handleSelect = (assetId: string, assetUrl: string) => {
    onChange(assetId); // Store the ID instead of URL
    setOpen(false);
  };

  return (
    <div className="w-full">
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-black/10 group bg-gray-50 aspect-video flex items-center justify-center">
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          ) : isPdf(resolvedUrl) || isPdf(value) ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center border border-black/5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-8 h-8 text-gray-600"
                >
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                  <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-600">
                Document Selected
              </span>
            </div>
          ) : (
            <img
              src={resolvedUrl || undefined}
              alt="Uploaded file"
              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
            />
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-4 py-2 rounded-full font-medium transition-colors text-sm">
                Replace
              </DialogTrigger>
              <DialogContent className="max-w-6xl w-full sm:w-[95vw] h-[100dvh] sm:h-[90vh] p-0 flex flex-col overflow-hidden sm:rounded-2xl">
                <DialogTitle className="sr-only">Choose Media</DialogTitle>
                <DialogDescription className="sr-only">
                  Select an image from existing media library or upload a new
                  one.
                </DialogDescription>
                <div className="flex-1 overflow-hidden flex flex-col w-full h-full">
                  <MediaLibrary
                    isModal={true}
                    onSelect={handleSelect}
                  />
                </div>
              </DialogContent>
            </Dialog>
            <button
              type="button"
              onClick={() => onChange("")}
              className="bg-red-500/80 hover:bg-red-500 text-white backdrop-blur-md p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="w-full relative rounded-2xl border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors p-8 flex flex-col items-center justify-center cursor-pointer min-h-[200px]">
            <div className="flex flex-col items-center text-gray-400">
              <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 border border-black/5">
                <ImageIcon className="w-8 h-8 text-gray-600" />
              </div>
              <p className="font-medium text-gray-600 mb-1">
                Select from Media Library
              </p>
              <p className="text-sm">Click to choose or upload</p>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-6xl w-full sm:w-[95vw] h-[100dvh] sm:h-[90vh] p-0 flex flex-col overflow-hidden sm:rounded-2xl">
            <DialogTitle className="sr-only">Choose Media</DialogTitle>
            <DialogDescription className="sr-only">
              Select an image from existing media library or upload a new one.
            </DialogDescription>
            <div className="flex-1 overflow-hidden flex flex-col h-full w-full">
              <MediaLibrary
                isModal={true}
                onSelect={handleSelect}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
