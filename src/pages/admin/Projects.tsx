import { QUERY_KEYS, STALE_TIMES } from "../../lib/queryKeys";
import { Skeleton } from "../../components/ui/skeleton";
import { useState } from "react";

import { collection, getDocs, query } from "firebase/firestore";

import { Link } from "react-router-dom";
import { format } from "date-fns";

import { motion } from "motion/react";
import { Plus, Search, MoreVertical, Edit2, Trash2, Eye, FolderKanban, Loader2, Heart } from "lucide-react";

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


interface Project {
  views?: number;
  likes?: number;
  id: string;
  title: string;
  description?: string;
  slug: string;
  status: "Draft" | "Published" | "Scheduled" | "Hidden" | "Archived";
  createdAt?: any;
  thumbnail?: string;
  featured?: boolean;
}

export default function ProjectsList() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: projects = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['admin_projects'],
    queryFn: async () => {
      const q = query(collection(db, "projects"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];
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
    collectionName: "projects",
    entityName: "project",
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects });
    }
  });

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">Manage your portfolio projects and case studies.</p>
        </div>
        <Link to="/admin/projects/new">
          <Button className="rounded-full bg-[#E85D04] hover:bg-[#d04d00]">
            <Plus className="w-4 h-4 mr-2" /> New Project
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2 bg-white border border-black/5 rounded-2xl px-4 py-2 shadow-sm">
        <Search className="w-5 h-5 text-gray-400" />
        <Input 
          type="text" 
          placeholder="Search projects..." 
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
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/4" />
                      <div className="flex gap-4 pt-2">
                         <Skeleton className="h-5 w-20 rounded-full" />
                         <Skeleton className="h-4 w-24" />
                      </div>
                   </div>
                </div>
             ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <FolderKanban className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-display font-medium text-lg mb-1">No projects found</h3>
            <p className="text-gray-500 mb-6 max-w-sm">You haven't created any projects yet, or no projects match your search.</p>
            <Link to="/admin/projects/new">
              <Button variant="outline" className="rounded-full">Create your first project</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-black/5">
            {filteredProjects.map((project) => (
              <div key={project.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center hover:bg-gray-50/50 transition-colors group">
                <div className="w-full sm:w-32 h-40 sm:h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-black/5">
                  {project.thumbnail || (project as any).featuredImage || (project as any).heroImage || (project as any).image ? (
                    <img src={project.thumbnail || (project as any).featuredImage || (project as any).heroImage || (project as any).image || undefined} alt={project.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-mono text-xs">No img</div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-bold text-lg text-gray-900 truncate">{project.title}</h3>
                    {project.featured && <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 text-[10px] uppercase">Featured</Badge>}
                  </div>
                  <p className="text-gray-500 text-sm mb-1">{project.description || (project as any).shortDescription || (project as any).subtitle || ""}</p>
                  <p className="text-gray-400 text-xs font-mono mb-3">/{project.slug}</p>
                  
                  <div className="flex items-center gap-4">
                    <Badge variant={project.status === "Published" ? "default" : "secondary"} className={project.status === "Published" ? "bg-green-500 hover:bg-green-600 border-0" : "bg-gray-100 hover:bg-gray-200 text-gray-600 border-0"}>
                      {project.status}
                    </Badge>
                    
                    <span className="text-xs font-mono text-gray-400">
                      {project.createdAt?.seconds ? format(new Date(project.createdAt.seconds * 1000), 'MMM d, yyyy') : 'Recently'}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {project.views || 0}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {project.likes || 0}</span>
                    </div>

                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 sm:mt-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to={`/admin/projects/`}>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5">
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-50 hover:text-red-600 text-gray-600" onClick={(e) => handleDelete(project.id, e)} disabled={isDeleting === project.id}>
                    {isDeleting === project.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5" />}>
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-black/5 shadow-xl">
                      <DropdownMenuItem className="cursor-pointer" onClick={() => window.open(`/projects/${project.slug}`, '_blank')}>
                        <Eye className="w-4 h-4 mr-2" /> View Live
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-700" onClick={(e) => handleDelete(project.id, e)}>
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


