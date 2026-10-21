sed -i 's/  const { likes, views, isLiked, toggleLike } = useEngagement("projects", project?.id);/  });\n  const { likes, views, isLiked, toggleLike } = useEngagement("projects", project?.id);/g' src/pages/ProjectDetail.tsx
sed -i 's/          url: url/          url: url\n        });/g' src/pages/ProjectDetail.tsx
sed -i 's/          shares: increment(1)/          shares: increment(1)\n        });/g' src/pages/ProjectDetail.tsx
sed -i 's/    staleTime: 1000 \* 60 \* 30,/    staleTime: 1000 \* 60 \* 30\n  });/g' src/pages/ProjectDetail.tsx
sed -i 's/    restDelta: 0.001/    restDelta: 0.001\n  });/g' src/pages/ProjectDetail.tsx
