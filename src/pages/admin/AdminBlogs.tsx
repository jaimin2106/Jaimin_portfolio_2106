import { QUERY_KEYS, STALE_TIMES } from "../../lib/queryKeys";
import { Skeleton } from "../../components/ui/skeleton";
import { useState } from "react";

import { collection, getDocs, query } from "firebase/firestore";

import { Link } from "react-router-dom";
import { format } from "date-fns";

import { motion } from "motion/react";
import { Plus, Search, MoreVertical, Edit2, Trash2, Eye, FileText, Loader2, Heart } from "lucide-react";

import { db } from "../../lib/firebase";

import { Button } from "../../components/ui/button";
import { Input } from "../../lib/input";

import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { useDeleteEntity } from "../../hooks/useDeleteEntity";

import { useQuery, useQueryClient } from "@tanstack/react-query";


interface Blog {
  views?: number;
  likes?: number;
  id: string;
  title: string;
  slug: string;
  status: "Draft" | "Published" | "Scheduled" | "Hidden" | "Archived";
  createdAt?: any;
  image?: string;
  category?: string;
}

export default function AdminBlogs() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: blogs = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['admin_blogs'],
    queryFn: async () => {
      const q = query(collection(db, "blogs"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Blog[];
      data.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });
      return data;
    },
    staleTime: STALE_TIMES.projects, // 5 minutes stale time for admin panel
    gcTime: 1000 * 60 * 30, // 30 minutes cache time
  });

  const queryClient = useQueryClient();

  const { handleDelete, isDeleting } = useDeleteEntity({
    collectionName: "blogs",
    entityName: "blog post",
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.blogs });
    }
  });

  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900">Blog Posts</h1>
          <p className="text-gray-500 mt-1">Manage your blog articles.</p>
        </div>
        <Link to="/admin/blogs/new">
          <Button className="rounded-full bg-[#E85D04] hover:bg-[#d04d00]">
            <Plus className="w-4 h-4 mr-2" /> New Post
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2 bg-white border border-black/5 rounded-2xl px-4 py-2 shadow-sm">
        <Search className="w-5 h-5 text-gray-400" />
        <Input 
          type="text" 
          placeholder="Search blogs..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-0 shadow-none focus-visible:ring-0 px-2 text-base"
        />
      </div>

      <div className="bg-white border border-black/5 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-black/5 animate-in fade-in duration-500">
             {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
                   <Skeleton className="w-full sm:w-32 h-40 sm:h-24 rounded-xl shrink-0" />
                   <div className="flex-1 min-w-0 space-y-3 w-full">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-3 w-1/4" />
                      <div className="flex gap-4 pt-2">
                         <Skeleton className="h-5 w-20 rounded-full" />
                         <Skeleton className="h-4 w-24" />
                      </div>
                   </div>
                </div>
             ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-display font-medium text-lg mb-1">No blog posts found</h3>
            <p className="text-gray-500 mb-6 max-w-sm">You haven't added any articles yet, or none match your search.</p>
            <Link to="/admin/blogs/new">
              <Button variant="outline" className="rounded-full">Create your first post</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-black/5">
            {filteredBlogs.map((blog) => (
              <div key={blog.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center hover:bg-gray-50/50 transition-colors group">
                <div className="w-full sm:w-32 h-40 sm:h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-black/5">
                  {blog.image ? (
                    <img src={blog.image || undefined} alt={blog.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-mono text-xs">No img</div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-bold text-lg text-gray-900 truncate">{blog.title}</h3>
                    {blog.category && <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 text-[10px] uppercase">{blog.category}</Badge>}
                  </div>
                  <p className="text-gray-500 text-sm mb-3">/{blog.slug}</p>
                  
                  <div className="flex items-center gap-4">
                    <Badge variant={blog.status === "Published" ? "default" : "secondary"} className={blog.status === "Published" ? "bg-green-500 hover:bg-green-600 border-0" : "bg-gray-100 hover:bg-gray-200 text-gray-600 border-0"}>
                      {blog.status}
                    </Badge>
                    
                    <span className="text-xs font-mono text-gray-400">
                      {blog.createdAt?.seconds ? format(new Date(blog.createdAt.seconds * 1000), 'MMM d, yyyy') : 'Recently'}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {blog.views || 0}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {blog.likes || 0}</span>
                    </div>

                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 sm:mt-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to={`/admin/blogs/${blog.id}`}>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5">
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-50 hover:text-red-600 text-gray-600" onClick={(e) => handleDelete(blog.id, e)} disabled={isDeleting === blog.id}>
                    {isDeleting === blog.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5" />}>
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-black/5 shadow-xl">
                      <DropdownMenuItem className="cursor-pointer" onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}>
                        <Eye className="w-4 h-4 mr-2" /> View Live
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-700" onClick={(e) => handleDelete(blog.id, e)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}


