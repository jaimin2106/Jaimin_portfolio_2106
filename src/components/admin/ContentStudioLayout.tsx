import React, { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Eye, Save, Sparkles, Loader2, MoreVertical, Layout, Settings, Monitor, Tablet, Smartphone, CheckCircle2, ChevronDown } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";

interface ContentStudioLayoutProps {
  title: string;
  isNew: boolean;
  status: string;
  setStatus: (status: string) => void;
  saving: boolean;
  onSave: () => void;
  onBack: () => void;
  leftPanelContent: React.ReactNode;
  mainContent: React.ReactNode;
  rightPanelContent: React.ReactNode;
  lastSaved?: string;
  previewUrl?: string;
}

export function ContentStudioLayout({
  title,
  isNew,
  status,
  setStatus,
  saving,
  onSave,
  onBack,
  leftPanelContent,
  mainContent,
  rightPanelContent,
  lastSaved = "Saved just now",
  previewUrl
}: ContentStudioLayoutProps) {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [showMobileSettings, setShowMobileSettings] = useState(false);

  return (
    <div className="flex flex-col md:flex-row w-full h-[100dvh] bg-[#FAFAFA] overflow-hidden fixed inset-0 z-50">
      {/* Mobile Header (Hidden on Desktop) */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-black/5 shrink-0">
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" onClick={onBack} className="shrink-0 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="font-display font-bold text-base truncate max-w-[120px]">{title || "Untitled"}</h1>
            <div className="flex items-center gap-1.5">
               <span className={`w-1.5 h-1.5 rounded-full ${status === "Published" ? "bg-green-500" : "bg-amber-500"}`} />
               <span className="text-[10px] font-medium text-gray-500">{status}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center h-8 w-8 text-gray-500 hover:bg-gray-100 rounded-md">
              <MoreVertical className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
               <DropdownMenuItem onClick={() => setShowMobileSettings(true)}>Settings & SEO</DropdownMenuItem>
               <DropdownMenuItem onClick={() => setShowMobilePreview(!showMobilePreview)}>Preview</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button type="button" disabled={saving} onClick={() => { setStatus("Published"); setTimeout(onSave, 100); }} size="sm" className="bg-[#E85D04] hover:bg-[#d04d00] h-8 px-3 ml-1 text-xs">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Publish"}
          </Button>
        </div>
      </div>

      {/* Left Sidebar - Metadata & Controls */}
      <aside 
        className={`hidden md:flex flex-col bg-white border-r border-black/5 transition-all duration-300 shrink-0 ${leftCollapsed ? 'w-16' : 'w-64 xl:w-72'}`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-black/5 shrink-0">
          {!leftCollapsed && (
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon" onClick={onBack} className="shrink-0 -ml-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h2 className="font-display font-semibold text-sm truncate">Settings</h2>
            </div>
          )}
          <Button type="button" variant="ghost" size="icon" onClick={() => setLeftCollapsed(!leftCollapsed)} className={leftCollapsed ? "mx-auto" : ""}>
            {leftCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
        
        <div className={`flex-1 overflow-y-auto ${leftCollapsed ? 'hidden' : 'block'}`}>
          <div className="p-4 space-y-6 pb-24">
            {leftPanelContent}
             <div className="mt-6 border-t border-black/10 pt-6">
               {rightPanelContent}
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content - Editor Canvas */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#FAFAFA]">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between h-16 px-6 bg-white border-b border-black/5 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="font-display font-bold text-xl truncate max-w-[400px]">{title || (isNew ? "New Entry" : "Edit Entry")}</h1>
            <div className="flex items-center gap-2 px-2.5 py-1 bg-gray-50 rounded-full border border-black/5">
              <span className={`w-2 h-2 rounded-full ${status === "Published" ? "bg-green-500" : "bg-amber-500"}`} />
              <span className="text-xs font-medium text-gray-700">{status}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <CheckCircle2 className="w-4 h-4" />
              {lastSaved}
            </div>
            
            <div className="flex items-center rounded-xl overflow-hidden shadow-sm border border-black/10">
              <Button type="button" onClick={() => { if (status !== "Draft") setStatus("Draft"); else onSave(); }} disabled={saving} variant="ghost" className="h-9 px-4 text-sm font-medium border-r border-black/10 rounded-none hover:bg-gray-50">
                {status === "Draft" ? "Save Draft" : "Revert to Draft"}
              </Button>
              <Button type="button" onClick={() => { setStatus("Published"); setTimeout(onSave, 100); }} disabled={saving} className="rounded-none bg-[#E85D04] hover:bg-[#d04d00] h-9 px-6 text-sm text-white shadow-none">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {status === "Published" ? "Update" : "Publish"}
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-3xl mx-auto w-full pb-24 md:pb-8">
          {mainContent}
        </div>
      </main>

      {/* Right Sidebar - Preview (Desktop/Tablet) */}
      <aside className={`hidden lg:flex flex-col bg-white border-l border-black/5 shrink-0 transition-all duration-300 ${rightCollapsed ? 'w-16' : 'w-[320px] xl:w-[380px]'}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-black/5 shrink-0">
          {!rightCollapsed && (
             <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon" onClick={() => setRightCollapsed(true)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <h2 className="font-display font-semibold text-sm">Preview</h2>
             </div>
          )}
          {rightCollapsed && (
             <Button type="button" variant="ghost" size="icon" onClick={() => setRightCollapsed(false)} className="mx-auto">
                <ChevronLeft className="w-4 h-4" />
             </Button>
          )}
          {!rightCollapsed && (
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button type="button" onClick={() => setDevice("desktop")} className={`p-1.5 rounded-md transition-colors ${device === "desktop" ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"}`}>
              <Monitor className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => setDevice("tablet")} className={`p-1.5 rounded-md transition-colors ${device === "tablet" ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"}`}>
              <Tablet className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => setDevice("mobile")} className={`p-1.5 rounded-md transition-colors ${device === "mobile" ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"}`}>
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
          )}
        </div>
        
        <div className={`flex-1 overflow-y-auto bg-gray-50/50 p-4 ${rightCollapsed ? 'hidden' : 'block'}`}>
          <div className="flex flex-col gap-6">
            {/* Preview Iframe Container */}
            <div className="flex justify-center w-full">
              <div className={`transition-all duration-300 bg-white shadow-lg border border-black/5 overflow-hidden origin-top ${
                device === "desktop" ? "w-full aspect-[4/3] rounded-xl" : 
                device === "tablet" ? "w-[320px] aspect-[3/4] rounded-2xl" : 
                "w-[260px] aspect-[9/19] rounded-[2rem]"
              }`}>
                {previewUrl ? (
                  <iframe src={previewUrl} className="w-full h-full pointer-events-none" title="Live Preview" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Save to preview</div>
                )}
              </div>
            </div>

            {rightPanelContent}
          </div>
        </div>
      </aside>

      {/* Mobile Preview Modal */}
      {showMobilePreview && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-white flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-black/5">
            <h2 className="font-display font-bold">Preview</h2>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowMobilePreview(false)}>Close</Button>
          </div>
          <div className="flex-1 bg-gray-100 p-4 overflow-hidden">
             {previewUrl ? (
                <iframe src={previewUrl} className="w-full h-full rounded-2xl shadow-lg border border-black/10 bg-white" title="Mobile Preview" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Save to preview</div>
              )}
          </div>
        </div>
      )}

      {/* Mobile Settings Modal */}
      {showMobileSettings && (
        <div className="md:hidden fixed inset-0 z-[70] bg-white flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-300">
          <div className="flex items-center justify-between p-4 border-b border-black/5 bg-white shrink-0 sticky top-0 z-10">
            <h2 className="font-display font-bold">Settings & SEO</h2>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowMobileSettings(false)}>Done</Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
             {leftPanelContent}
          </div>
        </div>
      )}
    </div>

  );
}
