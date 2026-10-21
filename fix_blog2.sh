sed -i '68d' src/pages/BlogDetail.tsx
sed -i '75d' src/pages/BlogDetail.tsx
sed -i '68i\  const { likes, views, isLiked, toggleLike } = useEngagement("blogs", post?.id);' src/pages/BlogDetail.tsx
