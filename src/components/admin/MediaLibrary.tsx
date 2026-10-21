import { Skeleton } from "../../components/ui/skeleton";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Copy,
  Trash2,
  Search,
  Loader2,
  Image as ImageIcon,
  Download,
  SearchIcon,
  Folder,
  AlertCircle,
  Plus,
  X,
  UploadCloud,
  FileImage,
  LayoutGrid,
  List,
  MoreVertical,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  Check,
  Maximize2,
  FileType,
  Calendar,
  HardDrive,
  Edit2,
  Link,
  ListFilter,
  ArrowDownUp,
} from "lucide-react";
import {
  ref,
  deleteObject,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { storage, db } from "../../lib/firebase";

const uploadWithTimeout = (storageRef: any, file: Blob, metadata: any): Promise<any> => {
  return Promise.race([
    uploadBytes(storageRef, file, metadata),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Upload timeout - check Firebase Storage rules and configuration.")), 15000))
  ]);
};
import { Button } from "../ui/button";
import { Input } from "../../lib/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../../services/api";

// Types
export interface MediaAsset {
  id: string;
  name: string;
  fullPath: string;
  url: string;
  contentType: string;
  size: number;
  timeCreated: number;
  width?: number;
  height?: number;
}

type UploadStatus =
  | "waiting"
  | "compressing"
  | "uploading"
  | "optimizing"
  | "complete"
  | "failed";

interface UploadItem {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: UploadStatus;
  error?: string;
  task?: any; // UploadTask
}

export function MediaLibrary({
  onSelect,
  isModal = false,
}: {
  onSelect?: (id: string, url: string) => void;
  isModal?: boolean;
}) {
  // STATE
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "images" | "documents" | "pdfs" | "recent">("all");
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [selectedAssetUsage, setSelectedAssetUsage] = useState<string[]>([]);
  const [loadingUsage, setLoadingUsage] = useState(false);

  // When selectedAsset changes, fetch usage
  useEffect(() => {
    if (selectedAsset) {
      setLoadingUsage(true);
      api.checkAssetUsage(selectedAsset.id).then((usages) => {
        setSelectedAssetUsage(usages);
        setLoadingUsage(false);
      });
    } else {
      setSelectedAssetUsage([]);
    }
  }, [selectedAsset]);

  // UPLOADS
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const [showManager, setShowManager] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input (except body)
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        if (e.key === "Escape") {
          e.target.blur();
        }
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "Escape") {
        if (selectedAsset) setSelectedAsset(null);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedAsset) {
          // handleDelete logic would go here
        }
      } else if (e.key === "Enter") {
        if (selectedAsset && onSelect && isModal) {
          onSelect(selectedAsset.id, selectedAsset.url);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedAsset, onSelect, isModal]);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "media"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MediaAsset[];
        fetched.sort((a, b) => (b.timeCreated || 0) - (a.timeCreated || 0));
        setAssets(fetched);
        setLoading(false);

        // Update selected asset if it changes
        if (selectedAsset) {
          const updated = fetched.find((a) => a.id === selectedAsset.id);
          if (updated) setSelectedAsset(updated);
          else setSelectedAsset(null);
        }
      },
      (error) => {
        /* error suppressed */
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const compressImage = (file: File, targetSizeKB = 750): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          let quality = 0.85;
          const attemptCompress = (q: number) => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;
            const maxSize = 1920;

            if (width > height && width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            } else if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject("No canvas context");
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                if (!blob) return reject("Blob conversion failed");
                if (blob.size > targetSizeKB * 1024 && q > 0.3) {
                  // Reduce quality and try again
                  attemptCompress(q - 0.15);
                } else {
                  resolve(blob);
                }
              },
              "image/webp",
              q,
            );
          };

          attemptCompress(quality);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const getImageDimensions = (
    url: string,
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = url;
    });
  };

  const updateUploadItem = useCallback(
    (id: string, updates: Partial<UploadItem>) => {
      setUploadQueue((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...updates } : i)),
      );
    },
    [],
  );

  const uploadSingleFile = useCallback(
    async (item: UploadItem) => {
      updateUploadItem(item.id, { status: "compressing" });

      try {
        let finalBlob: Blob = item.file;
        let fileExt = item.file.name.split(".").pop() || "file";
        let contentType = item.file.type;

        if (item.file.type.startsWith("image/")) {
          finalBlob = await compressImage(item.file);
          fileExt = "webp";
          contentType = "image/webp";
        }

        const baseName = item.file.name.replace(
          `.${item.file.name.split(".").pop()}`,
          "",
        );
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${baseName}.${fileExt}`;
        const targetPath = `media/${uniqueName}`;

        console.log(`Starting upload for ${item.file.name}...`);
        updateUploadItem(item.id, { status: "uploading", progress: 30 });

        try {
          // Attempt Firebase Storage Upload first
          const storageRef = ref(storage, targetPath);
          
          const snapshot = await uploadWithTimeout(storageRef, finalBlob, { contentType });
          const downloadURL = await getDownloadURL(snapshot.ref);
          let dimensions = { width: 0, height: 0 };
          if (contentType.startsWith("image/")) {
            dimensions = await getImageDimensions(downloadURL);
          }
          await addDoc(collection(db, "media"), {
            name: `${baseName}.${fileExt}`,
            fullPath: targetPath,
            url: downloadURL,
            contentType: contentType,
            size: finalBlob.size,
            timeCreated: Date.now(),
            width: dimensions.width,
            height: dimensions.height,
          });
          updateUploadItem(item.id, { status: "complete", progress: 100 });
          toast.success(`${item.file.name} uploaded successfully`);
        } catch (e) {

          console.warn("Storage init failed, falling back to base64", e);
          await fallbackToBase64();
        }

        async function fallbackToBase64() {
          const reader = new FileReader();
          reader.readAsDataURL(finalBlob);
          reader.onloadend = async () => {
            try {
              const base64data = reader.result as string;
              if (base64data.length > 1048487) {
                 updateUploadItem(item.id, { status: "failed", error: "File too large for database storage. Please enable Firebase Storage." });
                 toast.error(`File too large without Firebase Storage enabled: ${item.file.name}`);
                 return;
              }
              updateUploadItem(item.id, { status: "uploading", progress: 80 });
              let dimensions = { width: 0, height: 0 };
              if (contentType.startsWith("image/")) {
                dimensions = await getImageDimensions(base64data);
              }
              await addDoc(collection(db, "media"), {
                name: `${baseName}.${fileExt}`,
                fullPath: `base64/${uniqueName}`,
                url: base64data,
                contentType: contentType,
                size: finalBlob.size,
                timeCreated: Date.now(),
                width: dimensions.width,
                height: dimensions.height,
              });
              updateUploadItem(item.id, { status: "complete", progress: 100 });
              toast.success(`${item.file.name} uploaded (via DB fallback)`);
            } catch (err: any) {
              updateUploadItem(item.id, { status: "failed", error: err.message });
              toast.error(`Failed to save ${item.file.name}`);
            }
          };
          reader.onerror = () => {
             updateUploadItem(item.id, { status: "failed", error: "Failed to read file" });
             toast.error(`Failed to read ${item.file.name}`);
          };
        }
      } catch (error: any) {
        console.error(`Pre-upload error for ${item.file.name}:`, error);
        updateUploadItem(item.id, { status: "failed", error: error.message });
        toast.error(`Failed to upload ${item.file.name}`);
      }
    },
    [updateUploadItem],
  );

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const newItems: UploadItem[] = [];

      for (const file of Array.from(files)) {
        if (
          !file.type.startsWith("image/") &&
          file.type !== "application/pdf" &&
          !file.name.endsWith(".doc") &&
          !file.name.endsWith(".docx") &&
          !file.type.includes("msword") &&
          !file.type.includes("wordprocessingml")
        ) {
          toast.error(`${file.name} is not an image or document`);
          continue;
        }
        const id = Math.random().toString(36).substring(7);

        let previewUrl = "";
        if (file.type.startsWith("image/")) {
          previewUrl = URL.createObjectURL(file);
        }

        newItems.push({ id, file, previewUrl, progress: 0, status: "waiting" });
      }

      if (newItems.length === 0) return;

      setUploadQueue((prev) => [...prev, ...newItems]);
      setShowManager(true);
      if (activeTab === "upload") setActiveTab("library");

      for (const item of newItems) {
        uploadSingleFile(item);
      }
    },
    [activeTab, uploadSingleFile],
  );

  // DRAG & DROP
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) await processFiles(e.dataTransfer.files);
  };
  const handleUploadClick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(e.target.files);
      e.target.value = "";
    }
  };

  // ACTIONS
  const handleDelete = async (asset: MediaAsset, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    // Check usage
    const usages = await api.checkAssetUsage(asset.id);
    if (usages.length > 0) {
      toast.error(`Cannot delete ${asset.name}`, {
        description: `This asset is currently in use by:\n${usages.join(", ")}\nPlease replace these references first.`,
        duration: 5000,
      });
      return;
    }

    toast(`Delete ${asset.name}?`, {
      description: "Are you sure you want to delete this asset?",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deleteDoc(doc(db, "media", asset.id));
            if (asset.fullPath && !asset.fullPath.startsWith("base64/")) {
              await deleteObject(ref(storage, asset.fullPath)).catch(
                () => null,
              );
            }
            if (selectedAsset?.id === asset.id) setSelectedAsset(null);
            toast.success("Image deleted");
          } catch (error) {
            toast.error("Failed to delete image");
          }
        },
      },
      cancel: { label: "Cancel", onClick: () => {} },
    });
  };

  const handleCopy = (asset: MediaAsset, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(asset.url);
    toast.success("URL copied to clipboard");
  };

  const handleReplaceAsset = (asset: MediaAsset) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      if (
        !file.type.startsWith("image/") &&
        file.type !== "application/pdf" &&
        !file.name.endsWith(".doc") &&
        !file.name.endsWith(".docx") &&
        !file.type.includes("msword") &&
        !file.type.includes("wordprocessingml")
      ) {
        toast.error(`${file.name} is not an image or document`);
        return;
      }

      const toastId = toast.loading(`Replacing ${asset.name}...`);
      try {
        let finalBlob: Blob = file;
        let fileExt = file.name.split(".").pop() || "file";
        let contentType = file.type;

        if (file.type.startsWith("image/")) {
          finalBlob = await compressImage(file);
          fileExt = "webp";
          contentType = "image/webp";
        }

        const baseName = file.name.replace(`.${file.name.split(".").pop()}`, "");
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${baseName}.${fileExt}`;
        const targetPath = `media/${uniqueName}`;

        console.log(`Starting replacement upload for ${asset.name}...`);
        
        try {
          // Attempt Firebase Storage Upload first
          const storageRef = ref(storage, targetPath);
          
          const snapshot = await uploadWithTimeout(storageRef, finalBlob, { contentType });
          const downloadURL = await getDownloadURL(snapshot.ref);
          let dimensions = { width: 0, height: 0 };
          if (contentType.startsWith("image/")) {
            dimensions = await getImageDimensions(downloadURL);
          }
          await updateDoc(doc(db, "media", asset.id), {
            url: downloadURL,
            fullPath: targetPath,
            size: finalBlob.size,
            contentType: contentType,
            width: dimensions.width,
            height: dimensions.height,
            updatedAt: Date.now(),
            name: `${baseName}.${fileExt}`,
          });
          if (asset.fullPath && !asset.fullPath.startsWith("base64/")) {
             deleteObject(ref(storage, asset.fullPath)).catch(() => null);
          }
          toast.success("Asset replaced successfully", { id: toastId });
        } catch (e) {

          console.warn("Storage init failed, falling back to base64", e);
          await fallbackToBase64();
        }

        async function fallbackToBase64() {
          const reader = new FileReader();
          reader.readAsDataURL(finalBlob);
          reader.onloadend = async () => {
            try {
              const base64data = reader.result as string;
              if (base64data.length > 1048487) {
                toast.error("File is too large for database storage. Please enable Firebase Storage.", {
                  id: toastId,
                });
                return;
              }

              let dimensions = { width: 0, height: 0 };
              if (contentType.startsWith("image/")) {
                dimensions = await getImageDimensions(base64data);
              }

              await updateDoc(doc(db, "media", asset.id), {
                url: base64data,
                fullPath: `base64/${uniqueName}`,
                size: finalBlob.size,
                contentType: contentType,
                width: dimensions.width,
                height: dimensions.height,
                updatedAt: Date.now(),
                name: `${baseName}.${fileExt}`, // Update name if it changed
              });

              toast.success("Asset replaced (via DB fallback)", { id: toastId });
            } catch (error: any) {
              console.error(`Post-replacement processing failed:`, error);
              toast.error(`Failed to replace asset: ${error.message}`, {
                id: toastId,
              });
            }
          };
          reader.onerror = () =>
            toast.error("Failed to read file", { id: toastId });
        }
      } catch (error: any) {
        toast.error(`Failed to replace asset: ${error.message}`, {
          id: toastId,
        });
      }
    };
    input.click();
  };

  const filteredAssets = assets.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    
    const isDoc = a.contentType === "application/pdf" || a.name?.endsWith(".pdf") || a.name?.endsWith(".doc") || a.name?.endsWith(".docx") || a.contentType?.includes("msword") || a.contentType?.includes("wordprocessingml");
    const isPdf = a.contentType === "application/pdf" || a.name?.endsWith(".pdf");
    
    if (filterType === "images") return !isDoc;
    if (filterType === "documents") return isDoc;
    if (filterType === "pdfs") return isPdf;
    if (filterType === "recent") return (Date.now() - a.timeCreated) < 7 * 24 * 60 * 60 * 1000; // last 7 days
    
    return true;
  });

  // RENDER
  return (
    <div
      className={`flex flex-col w-full bg-white transition-colors duration-200 ${isModal ? "h-full" : "h-[calc(100vh-8rem)] rounded-3xl border border-black/5 shadow-sm"} overflow-hidden relative`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 rounded-inherit border-2 border-[#E85D04] bg-[#E85D04]/5 flex flex-col items-center justify-center backdrop-blur-[2px]"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl mb-6 text-[#E85D04]"
            >
              <UploadCloud className="w-12 h-12" />
            </motion.div>
            <h3 className="text-3xl font-display font-medium text-[#E85D04]">
              Drop files to upload
            </h3>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div
        className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black/5 bg-white z-10 px-4 sm:px-6 py-4`}
      >
        <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6">
          {!isModal && (
            <h2 className="text-xl sm:text-2xl font-display font-medium tracking-tight">
              Media Library
            </h2>
          )}
          <div className="flex bg-gray-100/80 p-1 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("library")}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === "library" ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"}`}
            >
              Library
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === "upload" ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"}`}
            >
              Upload
            </button>
          </div>
        </div>

        {activeTab === "library" && (
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
            <div className="relative flex-1 sm:w-64 min-w-[140px]">
              <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 h-10 bg-gray-50 border border-black/5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D04]/20 transition-all"
              />
            </div>

            <button className="h-10 px-3 bg-gray-50 border border-black/5 rounded-lg text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-100 transition-colors hidden md:flex items-center gap-2 shrink-0">
              <ListFilter className="w-4 h-4" /> Filter
            </button>
            <button className="h-10 px-3 bg-gray-50 border border-black/5 rounded-lg text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-100 transition-colors hidden lg:flex items-center gap-2 shrink-0">
              <ArrowDownUp className="w-4 h-4" /> Sort
            </button>

            <div className="flex bg-gray-50 border border-black/5 rounded-lg p-1 shrink-0">
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value as any)}
                className="bg-transparent text-sm font-medium text-gray-600 focus:outline-none px-2"
              >
                <option value="all">All Files</option>
                <option value="images">Images</option>
                <option value="documents">Documents</option>
                <option value="pdfs">PDFs</option>
                <option value="recent">Recently Uploaded</option>
              </select>
            </div>

            <div className="flex bg-gray-50 border border-black/5 rounded-lg p-1 shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-black hover:bg-gray-100"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-black hover:bg-gray-100"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <div className="relative shrink-0">
              <Button className="bg-[#E85D04] hover:bg-[#E85D04]/90 text-white rounded-lg shadow-sm font-medium whitespace-nowrap">
                <Plus className="w-4 h-4 sm:mr-1.5" />{" "}
                <span className="hidden sm:inline">Upload</span>
              </Button>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleUploadClick}
              />
            </div>
          </div>
        )}
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden bg-gray-50/30 relative">
        {/* LEFT COLUMN: Library or Upload Zone */}
        <div
          className={`flex-1 flex flex-col min-w-0 overflow-y-auto ${selectedAsset ? "lg:pr-0" : ""}`}
        >
          {activeTab === "upload" ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-12 lg:p-20 bg-gray-50/50">
              <div className="max-w-2xl w-full flex flex-col items-center text-center p-8 sm:p-12 md:p-16 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-black/5 border-dashed relative min-h-[400px] justify-center transition-all hover:border-[#E85D04]/30 hover:bg-[#E85D04]/5 group">
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  onChange={handleUploadClick}
                />
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-orange-50 text-[#E85D04] rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-[#E85D04]/20 rotate-3 transition-transform group-hover:rotate-6 group-hover:scale-110 duration-300">
                  <UploadCloud className="w-10 h-10 sm:w-12 sm:h-12 -rotate-3" />
                </div>
                <h3 className="text-xl sm:text-3xl font-display font-medium text-gray-900 mb-3 sm:mb-4">
                  Drag & drop files here
                </h3>
                <p className="text-sm sm:text-base text-gray-500 mb-8 max-w-md px-4">
                  Support for high-res images. Everything is automatically
                  optimized and compressed to WebP upon upload.
                </p>
                <div className="flex gap-4 w-full justify-center relative z-20 pointer-events-none">
                  <Button
                    className="h-12 px-8 text-base rounded-xl bg-black hover:bg-gray-800 text-white shadow-md pointer-events-auto cursor-pointer"
                    onClick={() =>
                      document
                        .querySelector<HTMLInputElement>(".upload-input-main")
                        ?.click()
                    }
                  >
                    Browse Files
                  </Button>
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="upload-input-main hidden"
                    onChange={handleUploadClick}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 animate-in fade-in duration-500">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="aspect-square bg-white rounded-xl border border-black/5 p-2 flex flex-col">
                      <Skeleton className="flex-1 rounded-lg" />
                      <Skeleton className="h-4 w-3/4 mt-3 mb-1 mx-2" />
                      <Skeleton className="h-3 w-1/2 mx-2 mb-2" />
                    </div>
                  ))}
                </div>
              ) : filteredAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                  <ImageIcon className="w-12 h-12 mb-4 text-gray-300" />
                  <p className="text-gray-500 font-medium">No assets found</p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className={`group relative rounded-xl overflow-hidden aspect-square bg-white border cursor-pointer transition-all duration-200 ${selectedAsset?.id === asset.id ? "border-[#E85D04] ring-2 ring-[#E85D04]/20 shadow-md" : "border-black/5 hover:border-black/20 hover:shadow-sm"}`}
                      onClick={() => setSelectedAsset(asset)}
                      onDoubleClick={() => {
                        setSelectedAsset(asset);
                        if (onSelect && isModal) onSelect(asset.id, asset.url);
                      }}
                    >
                      <div className="absolute inset-0 bg-gray-100/50 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
                      </div>
                      {asset.contentType === "application/pdf" || asset.name?.endsWith(".pdf") || asset.name?.endsWith(".doc") || asset.name?.endsWith(".docx") ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                          <FileType className="w-8 h-8 text-gray-400" />
                        </div>
                      ) : (
                        <img
                          src={asset.url || undefined}
                          alt={asset.name}
                          className="w-full h-full object-cover relative z-10 group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      )}

                      {/* Check mark for selection */}
                      {selectedAsset?.id === asset.id && (
                        <div className="absolute top-2 left-2 z-20 bg-[#E85D04] text-white rounded-full p-1 shadow-sm">
                          <Check className="w-3 h-3" />
                        </div>
                      )}

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex flex-col justify-end p-3">
                        <p className="text-white text-xs truncate font-medium drop-shadow-md mb-0.5">
                          {asset.name}
                        </p>
                        <p className="text-white/80 text-[10px] drop-shadow-md">
                          {formatSize(asset.size)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {filteredAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className={`flex items-center justify-between p-3 rounded-xl bg-white border transition-all cursor-pointer ${selectedAsset?.id === asset.id ? "border-[#E85D04] bg-orange-50/30 shadow-sm" : "border-black/5 hover:border-black/10 hover:shadow-sm"}`}
                      onClick={() => setSelectedAsset(asset)}
                      onDoubleClick={() => {
                        setSelectedAsset(asset);
                        if (onSelect && isModal) onSelect(asset.id, asset.url);
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-3 h-3 animate-spin text-gray-300" />
                          </div>
                          {asset.contentType === "application/pdf" || asset.name?.endsWith(".pdf") || asset.name?.endsWith(".doc") || asset.name?.endsWith(".docx") ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                              <FileType className="w-8 h-8 text-gray-400" />
                            </div>
                          ) : (
                            <img
                              src={asset.url || undefined}
                              className="w-full h-full object-cover relative z-10"
                              loading="lazy"
                            />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate max-w-[200px] sm:max-w-xs">
                            {asset.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatSize(asset.size)} •{" "}
                            {formatDate(asset.timeCreated)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Details Panel */}
        <AnimatePresence>
          {selectedAsset && activeTab === "library" && (
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`w-full sm:w-[340px] lg:w-[400px] bg-white border-l border-black/5 shadow-2xl sm:shadow-none flex flex-col flex-shrink-0 overflow-y-auto absolute inset-y-0 right-0 z-30 lg:relative lg:inset-auto lg:z-auto`}
            >
              <div className="p-5 sm:p-7 flex flex-col gap-6 pb-24">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-medium text-lg">
                    Asset Details
                  </h3>
                  <button
                    onClick={() => setSelectedAsset(null)}
                    className="p-1.5 text-gray-400 hover:text-black rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="w-full aspect-square bg-gray-50/50 rounded-2xl overflow-hidden border border-black/5 relative group flex items-center justify-center p-2 shadow-inner">
                  {selectedAsset.contentType === "application/pdf" || selectedAsset.name?.endsWith(".pdf") || selectedAsset.name?.endsWith(".doc") || selectedAsset.name?.endsWith(".docx") ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                      <FileType className="w-16 h-16 text-gray-400 mb-2" />
                      <span className="text-sm font-medium text-gray-500">
                        Document
                      </span>
                    </div>
                  ) : (
                    <img
                      src={selectedAsset.url || undefined}
                      className="w-full h-full object-contain drop-shadow-sm"
                    />
                  )}
                  <a
                    href={selectedAsset.url}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </a>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono font-medium">
                      Filename
                    </p>
                    <p className="text-sm font-medium text-gray-900 break-all bg-gray-50 p-2.5 rounded-lg border border-black/5">
                      {selectedAsset.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono font-medium flex items-center gap-1.5">
                        <HardDrive className="w-3 h-3" /> Size
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatSize(selectedAsset.size)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono font-medium flex items-center gap-1.5">
                        <FileType className="w-3 h-3" /> Type
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedAsset.contentType
                          ?.split("/")[1]
                          ?.toUpperCase() || "IMAGE"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono font-medium flex items-center gap-1.5">
                        <LayoutGrid className="w-3 h-3" /> Dimensions
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedAsset.width && selectedAsset.height
                          ? `${selectedAsset.width} × ${selectedAsset.height}`
                          : "Unknown"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono font-medium flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> Uploaded
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(selectedAsset.timeCreated)}
                      </p>
                    </div>
                  </div>

                  <div className="w-full h-px bg-black/5 my-1" />

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono font-medium">
                        Usage & Metadata
                      </p>
                      <div className="flex items-center gap-2 p-2.5 bg-gray-50 border border-black/5 rounded-lg flex-col items-start">
                        <div className="flex items-center gap-2 w-full">
                          <div className={`w-2 h-2 rounded-full ${selectedAssetUsage.length > 0 ? "bg-green-500" : "bg-gray-300"}`}></div>
                          <p className="text-xs font-medium text-gray-700">
                            {loadingUsage ? "Checking usage..." : `Used in ${selectedAssetUsage.length} places`}
                          </p>
                        </div>
                        {selectedAssetUsage.length > 0 && (
                          <div className="flex flex-col gap-1 mt-1 pl-4 w-full">
                            {selectedAssetUsage.map((usage, idx) => (
                              <span key={idx} className="text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded w-fit max-w-full truncate">{usage}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono font-medium">
                        Alt Text
                      </p>
                      <input
                        type="text"
                        placeholder="Describe the image for SEO..."
                        className="w-full h-9 bg-gray-50 border border-black/5 rounded-md text-xs px-3 focus:outline-none focus:ring-2 focus:ring-[#E85D04]/20 transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono font-medium">
                        Caption
                      </p>
                      <input
                        type="text"
                        placeholder="Add a visual caption..."
                        className="w-full h-9 bg-gray-50 border border-black/5 rounded-md text-xs px-3 focus:outline-none focus:ring-2 focus:ring-[#E85D04]/20 transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono font-medium">
                        Storage Path
                      </p>
                      <div className="flex items-center gap-2">
                        <p
                          className="text-xs text-gray-500 font-mono truncate flex-1"
                          title={selectedAsset.fullPath}
                        >
                          {selectedAsset.fullPath}
                        </p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              selectedAsset.fullPath,
                            );
                            toast.success("Path copied");
                          }}
                          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-black"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-px bg-black/5 my-1" />

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => handleCopy(selectedAsset)}
                      variant="outline"
                      className="w-full justify-start h-10 shadow-sm border-black/10 hover:bg-gray-50"
                    >
                      <Link className="w-4 h-4 mr-2 text-gray-500" /> Copy
                      Public URL
                    </Button>
                    <Button
                      onClick={() => handleReplaceAsset(selectedAsset)}
                      variant="outline"
                      className="w-full justify-start h-10 shadow-sm border-black/10 hover:bg-gray-50"
                    >
                      <RefreshCw className="w-4 h-4 mr-2 text-[#E85D04]" />{" "}
                      Replace Image
                    </Button>
                    <Button
                      onClick={() => handleDelete(selectedAsset)}
                      variant="outline"
                      className="w-full justify-start h-10 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 shadow-sm"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Asset
                    </Button>
                  </div>

                  {isModal && onSelect && (
                    <Button
                      onClick={() => onSelect(selectedAsset.id, selectedAsset.url)}
                      className="w-full mt-4 h-12 text-base font-medium bg-[#E85D04] hover:bg-[#E85D04]/90 text-white rounded-xl shadow-lg shadow-[#E85D04]/20 ring-1 ring-black/5 hover:-translate-y-0.5 transition-all active:translate-y-0"
                    >
                      Insert Asset
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FLOATING UPLOAD MANAGER */}
      <AnimatePresence>
        {showManager && uploadQueue.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-6 right-6 w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-black/10 overflow-hidden z-50 flex flex-col"
          >
            <div
              className="px-4 py-3 bg-gray-50 border-b border-black/5 flex items-center justify-between cursor-pointer"
              onClick={() => setShowManager(!showManager)}
            >
              <div className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-sm text-gray-900">
                  Uploads (
                  {uploadQueue.filter((u) => u.status === "complete").length}/
                  {uploadQueue.length})
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowManager(false);
                }}
                className="text-gray-400 hover:text-black transition-colors bg-white hover:bg-gray-100 rounded-md p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-3 flex flex-col gap-2">
              {uploadQueue.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-black/5"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative border border-black/5">
                    {item.previewUrl && (
                      <img
                        src={item.previewUrl}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {item.status !== "complete" && item.status !== "failed" && (
                      <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-[#E85D04]" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-gray-900 truncate pr-2">
                        {item.file.name}
                      </p>
                      {item.status === "complete" && (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                      {item.status === "failed" && (
                        <button
                          onClick={() => uploadSingleFile(item)}
                          className="p-1 hover:bg-red-50 rounded text-red-500 transition-colors"
                          title="Retry"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      )}
                      {item.status !== "complete" &&
                        item.status !== "failed" && (
                          <button
                            onClick={() =>
                              updateUploadItem(item.id, {
                                status: "failed",
                                error: "Cancelled by user",
                              })
                            }
                            className="p-1 hover:bg-gray-100 rounded text-gray-400 transition-colors"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                    </div>

                    {item.status === "failed" ? (
                      <p className="text-[10px] text-red-500 truncate">
                        {item.error || "Failed"}
                      </p>
                    ) : item.status === "complete" ? (
                      <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] text-green-600 font-medium"
                      >
                        Complete
                      </motion.p>
                    ) : (
                      <div className="flex flex-col gap-1.5 mt-0.5">
                        <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                          <span className="capitalize">{item.status}...</span>
                          <span>{Math.round(item.progress)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#E85D04] transition-all duration-300 rounded-full relative overflow-hidden"
                            style={{ width: `${item.progress}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_1s_infinite] -translate-x-full" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
