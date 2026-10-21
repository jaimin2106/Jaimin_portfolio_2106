import { useEditor, EditorContent} from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Youtube from '@tiptap/extension-youtube';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Typography } from '@tiptap/extension-typography';
import { CharacterCount } from '@tiptap/extension-character-count';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Dropcursor } from '@tiptap/extension-dropcursor';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextAlign } from '@tiptap/extension-text-align';
import { common, createLowlight } from 'lowlight';
import { Bold, Italic, Link as LinkIcon, Image as ImageIcon, List, ListOrdered, Quote, Heading1, Heading2, Heading3, Code, Undo, Redo, Video, Code2, Plus, Sparkles, ChevronDown, Loader2, GripVertical, CheckSquare, AlignLeft, AlignCenter, AlignRight, Table as TableIcon } from 'lucide-react';
import { Button } from './ui/button';
import { useCallback, useState, useEffect, useRef } from 'react';
import { FileUpload } from './ui/file-upload';
import { toast } from 'sonner';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const uploadWithTimeout = (storageRef: any, file: Blob, metadata?: any): Promise<any> => {
  return Promise.race([
    uploadBytes(storageRef, file, metadata),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Upload timeout - check Firebase Storage rules and configuration.")), 8000))
  ]);
};

import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { storage, db } from '../lib/firebase';

const lowlight = createLowlight(common);

export function RichTextEditor({ value, onChange, focusMode = false }: { value: string, onChange: (val: string) => void, focusMode?: boolean }) {
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);

  const handleAiAction = async (action: string) => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, ' ');
    if (!text) return;

    setAiLoading(true);
    setShowAiMenu(false);
    const toastId = toast.loading("AI is working...");

    try {
      let openRouterApiKey = "";
      try {
        const docSnap = await getDoc(doc(db, "settings", "global"));
        if (docSnap.exists()) {
          openRouterApiKey = docSnap.data().openRouterApiKey || "";
        }
      } catch (e) {}

      if (!openRouterApiKey) {
        toast.error("OpenRouter API key is missing in settings.", { id: toastId });
        setAiLoading(false);
        return;
      }

      const response = await fetch("/api/ai-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action, 
          text, 
          context: editor.getText().substring(0, 500), 
          openRouterApiKey 
        }),
      });

      if (!response.ok) {
        let errText = "Failed to process AI action";
        try { 
          const errObj = await response.json(); 
          errText = errObj.error || errText; 
        } catch(e) {}
        throw new Error(errText);
      }

      const data = await response.json();
      if (data.content) {
        editor.chain().focus().deleteSelection().insertContent(data.content).run();
        toast.success("AI applied successfully", { id: toastId });
      }
    } catch (e: any) {
      toast.error("AI action failed: " + e.message, { id: toastId });
    } finally {
      setAiLoading(false);
    }
  };

  const handleImageUpload = async (file: File, view: any, event: any, insertCoordinates?: any) => {
    if (!file.type.startsWith('image/')) {
        toast.error('Only image files are supported');
        return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is too large (max 5MB)');
      return false;
    }

    const toastId = toast.loading('Uploading image...');
    try {
      const fullPath = `editor-images/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fullPath);
      const snapshot = await uploadWithTimeout(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      await addDoc(collection(db, "media"), {
        name: file.name,
        fullPath: fullPath,
        url: downloadURL,
        contentType: file.type,
        size: file.size,
        timeCreated: Date.now()
      });
      
      const { schema } = view.state;
      const node = schema.nodes.image.create({ src: downloadURL });
      
      const transaction = view.state.tr;
      if (insertCoordinates) {
        transaction.insert(insertCoordinates.pos, node);
      } else {
        transaction.replaceSelectionWith(node);
      }
      
      view.dispatch(transaction);
      toast.success('Image uploaded successfully', { id: toastId });
      return true;
    } catch (e) {
      toast.error('Failed to upload image', { id: toastId });
      return false;
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Typography,
      CharacterCount,
      Dropcursor.configure({
        color: '#E85D04',
        width: 2,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
      }),
      Link.configure({ 
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#E85D04] cursor-pointer hover:underline',
        }
      }),
      Placeholder.configure({ placeholder: "Type '/' for commands or start writing..." }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg focus:outline-none min-h-[600px] max-w-[800px] mx-auto px-4 py-8 sm:px-8 sm:py-12 md:px-12 md:py-16 prose-img:rounded-2xl prose-img:shadow-lg prose-pre:bg-[#111] prose-pre:text-white leading-relaxed md:leading-loose tracking-tight prose-headings:font-display prose-headings:font-bold prose-a:text-[#E85D04] prose-blockquote:border-l-4 prose-blockquote:border-[#E85D04] prose-blockquote:bg-orange-50/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-p:text-gray-700 bg-transparent',
        style: ''
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          const file = event.dataTransfer.files[0];
          const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
          handleImageUpload(file, view, event, coordinates);
          return true;
        }
        return false;
      },
      handlePaste: (view, event, slice) => {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files.length > 0) {
          const file = event.clipboardData.files[0];
          handleImageUpload(file, view, event, null);
          return true;
        }
        return false;
      }
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML() && value !== '<p></p>') {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addYoutubeVideo = useCallback(() => {
    if (!editor) return;
    const url = prompt('Enter YouTube URL');
    if (url) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className={`rounded-2xl overflow-hidden bg-white flex flex-col group relative transition-all duration-300 ${focusMode ? 'shadow-none' : 'border border-gray-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] focus-within:border-[#E85D04]/30 focus-within:ring-4 focus-within:ring-[#E85D04]/5'}`}>
      
      {!focusMode && (
        <div className="flex flex-nowrap md:flex-wrap items-center gap-1 border-b border-gray-100 bg-white/80 backdrop-blur-xl p-2 sticky top-0 z-20 overflow-x-auto overflow-y-hidden hide-scrollbar [&_button]:shrink-0">
          <Button size="sm" variant="ghost" className={`h-8 w-8 px-0 rounded-md ${editor.isActive('bold') ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`} onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}>
            <Bold className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className={`h-8 w-8 px-0 rounded-md ${editor.isActive('italic') ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`} onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}>
            <Italic className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className={`h-8 w-8 px-0 rounded-md ${editor.isActive('link') ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`} onClick={(e) => { e.preventDefault(); setLink(); }}>
            <LinkIcon className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-4 bg-gray-200 mx-1" />
          
          <Button size="sm" variant="ghost" className={`h-8 px-2 rounded-md font-mono text-xs ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`} onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}>
            H2
          </Button>
          <Button size="sm" variant="ghost" className={`h-8 px-2 rounded-md font-mono text-xs ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`} onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 3 }).run(); }}>
            H3
          </Button>
          <Button size="sm" variant="ghost" className={`h-8 w-8 px-0 rounded-md ${editor.isActive('blockquote') ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`} onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }}>
            <Quote className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-4 bg-gray-200 mx-1" />
          
          <Button size="sm" variant="ghost" className={`h-8 w-8 px-0 rounded-md ${editor.isActive('bulletList') ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`} onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}>
            <List className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className={`h-8 w-8 px-0 rounded-md ${editor.isActive('orderedList') ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`} onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}>
            <ListOrdered className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className={`h-8 w-8 px-0 rounded-md ${editor.isActive('taskList') ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`} onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleTaskList().run(); }}>
            <CheckSquare className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className={`h-8 w-8 px-0 rounded-md ${editor.isActive('code') ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`} onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleCode().run(); }}>
            <Code className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className={`h-8 w-8 px-0 rounded-md ${editor.isActive('codeBlock') ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`} onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleCodeBlock().run(); }}>
            <Code2 className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className={`h-8 w-8 px-0 rounded-md ${editor.isActive('table') ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`} onClick={(e) => { e.preventDefault(); editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); }}>
            <TableIcon className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-4 bg-gray-200 mx-1" />
          
          <Button size="sm" variant="ghost" className={`h-8 w-8 px-0 rounded-md ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`} onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('left').run(); }}>
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className={`h-8 w-8 px-0 rounded-md ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`} onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('center').run(); }}>
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className={`h-8 w-8 px-0 rounded-md ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`} onClick={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign('right').run(); }}>
            <AlignRight className="w-4 h-4" />
          </Button>

          <div className="w-px h-4 bg-gray-200 mx-1" />

          <Button size="sm" variant="ghost" className="h-8 w-8 px-0 rounded-md text-gray-500 hover:text-black hover:bg-gray-50" onClick={(e) => { e.preventDefault(); setShowImageUpload(!showImageUpload); }}>
            <ImageIcon className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 px-0 rounded-md text-gray-500 hover:text-black hover:bg-gray-50" onClick={(e) => { e.preventDefault(); addYoutubeVideo(); }}>
            <Video className="w-4 h-4" />
          </Button>

          <div className="flex-1" />

          <Button size="sm" variant="ghost" className="h-8 w-8 px-0 rounded-md text-gray-500 hover:text-black hover:bg-gray-50" onClick={(e) => { e.preventDefault(); editor.chain().focus().undo().run(); }} disabled={!editor.can().undo()}>
            <Undo className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 px-0 rounded-md text-gray-500 hover:text-black hover:bg-gray-50" onClick={(e) => { e.preventDefault(); editor.chain().focus().redo().run(); }} disabled={!editor.can().redo()}>
            <Redo className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Bubble Menu for quick formatting selection */}
      <BubbleMenu editor={editor}  className="flex items-center gap-1 bg-white/90 backdrop-blur-xl border border-gray-200/60 shadow-xl rounded-xl p-1.5 z-50">
        <Button size="sm" variant="ghost" className={`h-8 w-8 px-0 rounded-md ${editor.isActive('bold') ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black'}`} onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}>
          <Bold className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" className={`h-8 w-8 px-0 rounded-md ${editor.isActive('italic') ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black'}`} onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}>
          <Italic className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" className={`h-8 w-8 px-0 rounded-md ${editor.isActive('link') ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black'}`} onClick={(e) => { e.preventDefault(); setLink(); }}>
          <LinkIcon className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-4 bg-gray-200 mx-1" />
        
        <Button size="sm" variant="ghost" className={`h-8 px-2 rounded-md font-mono text-xs ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black'}`} onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}>
          H2
        </Button>
        <Button size="sm" variant="ghost" className={`h-8 px-2 rounded-md font-mono text-xs ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black'}`} onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 3 }).run(); }}>
          H3
        </Button>
        <Button size="sm" variant="ghost" className={`h-8 w-8 px-0 rounded-md ${editor.isActive('blockquote') ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black'}`} onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }}>
          <Quote className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-4 bg-gray-200 mx-1" />
        
        <div className="relative">
          <Button 
            size="sm" 
            variant="ghost" 
            className={`h-8 px-3 rounded-md ${showAiMenu ? 'bg-orange-50 text-[#E85D04]' : 'text-gray-600 hover:bg-orange-50 hover:text-[#E85D04]'} font-medium flex items-center gap-1.5 transition-colors`}
            onClick={(e) => { e.preventDefault(); setShowAiMenu(!showAiMenu); }}
            disabled={aiLoading}
          >
            {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E85D04]" /> : <Sparkles className="w-3.5 h-3.5 text-[#E85D04]" />}
            Ask AI <ChevronDown className="w-3 h-3 opacity-50" />
          </Button>
          
          {showAiMenu && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 shadow-2xl rounded-xl overflow-hidden py-1.5 z-50 animate-in fade-in zoom-in-95 duration-200">
              <button onClick={() => handleAiAction("improve")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 transition-colors">Improve writing</button>
              <button onClick={() => handleAiAction("expand")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 transition-colors">Expand section</button>
              <button onClick={() => handleAiAction("shorten")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 transition-colors">Make it shorter</button>
              <button onClick={() => handleAiAction("simplify")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 transition-colors">Simplify language</button>
              <div className="h-px bg-gray-100 my-1"></div>
              <button onClick={() => handleAiAction("rewrite")} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-[#E85D04] font-medium transition-colors flex items-center justify-between group">
                Rewrite entirely
                <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          )}
        </div>
      </BubbleMenu>

      {/* Notion-style Floating Menu for inserting blocks */}
      <FloatingMenu editor={editor}  className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-center h-8 w-8 rounded-full bg-white shadow-sm border border-gray-200 hover:bg-gray-50 hover:scale-105 transition-all text-gray-400 hover:text-black">
              <Plus className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right" className="w-56 p-1 z-50">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-1.5 mb-1">Basic Blocks</div>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="gap-2 cursor-pointer rounded-md">
              <Heading2 className="w-4 h-4 text-gray-500" />
              <div className="flex flex-col"><span>Heading 2</span><span className="text-xs text-gray-400">Medium section heading</span></div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="gap-2 cursor-pointer rounded-md">
              <Heading3 className="w-4 h-4 text-gray-500" />
              <div className="flex flex-col"><span>Heading 3</span><span className="text-xs text-gray-400">Small section heading</span></div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleBulletList().run()} className="gap-2 cursor-pointer rounded-md">
              <List className="w-4 h-4 text-gray-500" />
              <div className="flex flex-col"><span>Bulleted List</span><span className="text-xs text-gray-400">Create a simple list</span></div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleOrderedList().run()} className="gap-2 cursor-pointer rounded-md">
              <ListOrdered className="w-4 h-4 text-gray-500" />
              <div className="flex flex-col"><span>Numbered List</span><span className="text-xs text-gray-400">Create a list with numbering</span></div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleTaskList().run()} className="gap-2 cursor-pointer rounded-md">
              <CheckSquare className="w-4 h-4 text-gray-500" />
              <div className="flex flex-col"><span>To-do List</span><span className="text-xs text-gray-400">Track tasks with a to-do list</span></div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleBlockquote().run()} className="gap-2 cursor-pointer rounded-md">
              <Quote className="w-4 h-4 text-gray-500" />
              <div className="flex flex-col"><span>Quote</span><span className="text-xs text-gray-400">Capture a quote</span></div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleCodeBlock().run()} className="gap-2 cursor-pointer rounded-md">
              <Code2 className="w-4 h-4 text-gray-500" />
              <div className="flex flex-col"><span>Code Block</span><span className="text-xs text-gray-400">Capture a code snippet</span></div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="gap-2 cursor-pointer rounded-md">
              <TableIcon className="w-4 h-4 text-gray-500" />
              <div className="flex flex-col"><span>Table</span><span className="text-xs text-gray-400">Add simple tabular content</span></div>
            </DropdownMenuItem>
            
            <div className="h-px bg-gray-100 my-1" />
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-1.5 mb-1">Media</div>
            
            <DropdownMenuItem onClick={() => setShowImageUpload(!showImageUpload)} className="gap-2 cursor-pointer rounded-md">
              <ImageIcon className="w-4 h-4 text-gray-500" />
              <div className="flex flex-col"><span>Image</span><span className="text-xs text-gray-400">Upload or embed with a link</span></div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addYoutubeVideo()} className="gap-2 cursor-pointer rounded-md">
              <Video className="w-4 h-4 text-gray-500" />
              <div className="flex flex-col"><span>Video</span><span className="text-xs text-gray-400">Embed a YouTube video</span></div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </FloatingMenu>

      {showImageUpload && (
        <div className="p-4 border-b border-gray-100 bg-gray-50/80 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-4 max-w-[800px] mx-auto">
            <span className="text-sm font-semibold text-gray-700">Upload Image</span>
            <Button variant="ghost" size="sm" className="h-8 w-8 px-0 rounded-full text-gray-500 hover:text-black hover:bg-gray-200" onClick={(e) => { e.preventDefault(); setShowImageUpload(false); }}>
              <Plus className="w-4 h-4 rotate-45" />
            </Button>
          </div>
          <div className="max-w-[800px] mx-auto">
            <FileUpload 
              path="editor-images"
              onChange={(url) => {
                if (url) {
                  editor.chain().focus().setImage({ src: url }).run();
                  setShowImageUpload(false);
                  toast.success("Image inserted.");
                }
              }}
            />
          </div>
        </div>
      )}

      <div className={`flex-1 cursor-text bg-white min-h-[500px] transition-all duration-300 ${focusMode ? 'pb-[50vh]' : 'py-8'}`} onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} />
      </div>

      <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-2 text-xs font-mono text-gray-400 flex items-center justify-end gap-4 rounded-b-2xl">
        <span>{editor.storage.characterCount.words()} words</span>
        <span>{editor.storage.characterCount.characters()} characters</span>
      </div>
  
    </div>
  );
}
