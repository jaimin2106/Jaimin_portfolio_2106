sed -i 's/  const { likes, views, isLiked, toggleLike } = useEngagement("projects", project?.id);//g' src/pages/ProjectDetail.tsx
sed -i '/staleTime: 1000 \* 60 \* 30, \/\/ 30 minutes/a \  });\n  const { likes, views, isLiked, toggleLike } = useEngagement("projects", project?.id);' src/pages/ProjectDetail.tsx
sed -i '/});/d' src/pages/ProjectDetail.tsx
