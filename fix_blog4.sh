sed -i '70d' src/pages/BlogDetail.tsx
sed -i '77d' src/pages/BlogDetail.tsx
sed -i '/  const loading = loadingPost;/i \  const { likes, views, isLiked, toggleLike } = useEngagement("blogs", post?.id);' src/pages/BlogDetail.tsx
