sed -i 's/  const { likes, views, isLiked, toggleLike } = useEngagement("blogs", post?.id);//g' src/pages/BlogDetail.tsx
sed -i 's/    staleTime: 1000 \* 60 \* 30, \/\/ 30 minutes/    staleTime: 1000 \* 60 \* 30, \/\/ 30 minutes\n  });/g' src/pages/BlogDetail.tsx
sed -i '/  });\n  });/d' src/pages/BlogDetail.tsx
