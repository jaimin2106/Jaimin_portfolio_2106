import { QUERY_KEYS, STALE_TIMES } from "../../lib/queryKeys";
import { Skeleton } from "../../components/ui/skeleton";
import { motion } from "motion/react";
import { Folder, FileText, Eye, TrendingUp, Plus, ArrowUpRight, Activity, Pencil, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import React, { useEffect, useState, useMemo } from "react";

import { collection, getDocs, doc, setDoc } from "firebase/firestore";

import { db } from "../../lib/firebase";

import { PROJECTS } from "../../data/projects";

import { BLOG_POSTS } from "../../data/blog";

import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";



const MOCK_CHART_DATA = [
  { name: 'Mon', views: 400, likes: 240 },
  { name: 'Tue', views: 300, likes: 139 },
  { name: 'Wed', views: 550, likes: 380 },
  { name: 'Thu', views: 450, likes: 290 },
  { name: 'Fri', views: 600, likes: 480 },
  { name: 'Sat', views: 700, likes: 580 },
  { name: 'Sun', views: 800, likes: 680 },
];

const StatCard = React.memo(({ stat, index }: { stat: any, index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ 
      duration: 0.6, 
      delay: index * 0.1, 
      ease: [0.16, 1, 0.3, 1] 
    }}
  >
    <Card className="rounded-2xl border-black/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden relative group hover:shadow-lg transition-all duration-500 hover:-translate-y-1 active:scale-[0.98] active:scale-[0.98] will-change-transform">
      <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 blur-[50px] rounded-full group-hover:bg-[#E85D04]/10 transition-colors duration-500" />
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{stat.title}</CardTitle>
        <stat.icon className="h-4 w-4 text-gray-400 group-hover:text-[#E85D04] transition-colors duration-300" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold font-display tracking-tight">{stat.value}</div>
        <p className="text-xs text-green-600 font-medium mt-1">{stat.trend}</p>
      </CardContent>
    </Card>
  </motion.div>
));

export default function Dashboard() {
  const queryClient = useQueryClient();




  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, "projects"));
      
      let pCount = 0;
      let pPubCount = 0;
      let totalViews = 0;
      let totalLikes = 0;
      let bCount = 0;
      let bPubCount = 0;
      
      const projects: any[] = [];
      snap.forEach(doc => {
        pCount++;
        const data = doc.data();
        if (data.status === "Published") pPubCount++;
        totalViews += (data.views || 0);
        totalLikes += (data.likes || 0);
        projects.push({ id: doc.id, ...data });
      });
      
      const bSnap = await getDocs(collection(db, "blogs"));
      const blogs: any[] = [];
      bSnap.forEach(doc => {
        bCount++;
        const data = doc.data();
        if (data.status === "Published") bPubCount++;
        totalViews += (data.views || 0);
        totalLikes += (data.likes || 0);
        blogs.push({ id: doc.id, ...data });
      });

      projects.sort((a, b) => new Date(b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt || 0).getTime() - new Date(a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt || 0).getTime());
      blogs.sort((a, b) => new Date(b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt || 0).getTime() - new Date(a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt || 0).getTime());

      return {
        stats: {
          projects: pCount,
          blogs: bCount,
          publishedProjects: pPubCount,
          publishedBlogs: bPubCount,
          totalViews,
          totalLikes
        },
        
        recentProjects: projects.slice(0, 3),
        recentBlogs: blogs.slice(0, 4),
        isDatabaseEmpty: snap.empty
      };
    },
    staleTime: STALE_TIMES.projects, // 5 minutes stale time
    gcTime: 1000 * 60 * 30, // 30 minutes cache time
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      console.log("Empty DB found, seeding projects and blogs...");
      for (const project of PROJECTS) {
        await setDoc(doc(db, "projects", project.id), {
          ...project,
          status: "Published",
          createdAt: new Date().toISOString(),
        });
      }
      for (const blog of BLOG_POSTS) {
        await setDoc(doc(db, "blogs", blog.id), {
          ...blog,
          slug: blog.id,
          status: "Published",
          createdAt: new Date().toISOString(),
        });
      }
      console.log("Seeding complete!");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    }
  });

  useEffect(() => {
    if (data?.isDatabaseEmpty && !seedMutation.isPending && !seedMutation.isSuccess) {
      seedMutation.mutate();
    }
  }, [data?.isDatabaseEmpty, seedMutation]);

    const chartData = useMemo(() => {
    if (!data) return MOCK_CHART_DATA;
    const allContent = [...(data.recentProjects || []), ...(data.recentBlogs || [])]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 7)
      .map(item => ({
        name: (item.title || "Untitled").substring(0, 10) + '...',
        views: item.views || Math.floor(Math.random() * 100),
        likes: item.likes || Math.floor(Math.random() * 50)
      }));
    
    // If not enough real data, pad with mock data
    if (allContent.length < 3) return MOCK_CHART_DATA;
    return allContent.reverse();
  }, [data]);

  const STATS_DATA = useMemo(() => {
    if (!data?.stats) return [];
    return [
      { title: "Total Projects", value: data.stats.projects.toString(), trend: `${data.stats.publishedProjects} Published`, icon: Folder },
      { title: "Total Blogs", value: data.stats.blogs.toString(), trend: `${data.stats.publishedBlogs} Published`, icon: FileText },
      { title: "Site Visitors", value: "12.4K", trend: "+14.2% from last month", icon: Eye },
      { title: "Engagement Rate", value: "8.2%", trend: "+1.1% from last month", icon: TrendingUp },
    ];
  }, [data?.stats]);

  if (isLoading || (data?.isDatabaseEmpty && seedMutation.isPending)) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-5 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 rounded-2xl border border-black/5 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              <Skeleton className="h-10 w-16 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl border border-black/5 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-1 p-6 rounded-2xl border border-black/5 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back. Here's what's happening today.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <Link to="/admin/stats" className="w-full sm:w-auto">
            <Button variant="outline" className="rounded-full w-full">
              View Stats <ArrowUpRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link to="/admin/projects/new" className="w-full sm:w-auto">
            <Button className="rounded-full bg-[#E85D04] hover:bg-[#d04d00] w-full">
              <Plus className="mr-2 w-4 h-4" /> New Project
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS_DATA.map((stat, i) => (
          <StatCard key={i} stat={stat} index={i} />
        ))}
      </div>

      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full h-[300px] sm:h-[400px] pt-8"
      >
        <Card className="w-full h-full rounded-3xl border-black/5 shadow-sm p-4 sm:p-6 flex flex-col relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[80px] rounded-full group-hover:bg-orange-500/10 transition-colors duration-700" />
           <h2 className="text-xl font-bold font-display tracking-tight text-gray-900 mb-6">Audience Overview</h2>
           <div className="flex-1 w-full relative z-10 min-h-0">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#E85D04" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#E85D04" stopOpacity={0}/>
                   </linearGradient>
                   <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                     <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                 <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                   itemStyle={{ fontSize: '14px', fontWeight: 500 }}
                 />
                 <Area type="monotone" dataKey="views" stroke="#E85D04" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                 <Area type="monotone" dataKey="likes" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorVisitors)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-2 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display tracking-tight text-gray-900">Recent Projects</h2>
            <Link to="/admin/projects" className="text-[#E85D04] font-medium hover:underline">View All</Link>
          </div>
          
          <Card className="rounded-2xl border-black/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="divide-y divide-black/5">
              {data?.recentProjects.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No projects found.</div>
              ) : data?.recentProjects.map((project, i) => {
                const img = project.thumbnail || project.featuredImage || project.heroImage || project.image;
                return (
                <div key={i} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:bg-gray-50/50 transition-colors">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 border border-black/5 shrink-0 overflow-hidden flex items-center justify-center">
                     {img ? (
                        <img src={img || undefined} alt="Thumbnail" className="w-full h-full object-cover" />
                     ) : (
                        <Folder className="w-6 h-6 text-gray-400" />
                     )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 font-display">{project.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">{project.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={project.status === 'Published' ? "default" : "secondary"} className="rounded-full font-medium">
                      {project.status || 'Draft'}
                    </Badge>
                    <Link to={`/admin/projects/`}>
                      <Button variant="ghost" size="icon" className="rounded-full text-gray-400 hover:text-black">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )})}
            </div>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display tracking-tight text-gray-900">Recent Blogs</h2>
            <Link to="/admin/blogs" className="text-[#E85D04] font-medium hover:underline text-sm">View All</Link>
          </div>
          <Card className="rounded-2xl border-black/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
            <CardContent className="p-0">
               <div className="divide-y divide-black/5">
                {data?.recentBlogs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No blogs found.</div>
                ) : data?.recentBlogs.map((blog, i) => (
                  <div key={i} className="p-4 flex gap-4 items-center hover:bg-gray-50/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border border-black/5">
                      {blog.image ? (
                        <img src={blog.image || undefined} className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate font-display">{blog.title}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5 truncate">{blog.status || 'Draft'}</p>
                    </div>
                    <Link to={`/admin/blogs/${blog.id}`}>
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-gray-400 hover:text-black shrink-0">
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                ))}
               </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}


