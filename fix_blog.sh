sed -i 's/import { useState, useEffect, useRef } from "react";/import { useState, useEffect, useRef } from "react";\nimport { useEngagement } from "..\/hooks\/useEngagement";/g' src/pages/BlogDetail.tsx
sed -i '/const { likes, views, isLiked, toggleLike } = useEngagement("blogs", post?.id);/d' src/pages/BlogDetail.tsx
sed -i '/staleTime: 1000 \* 60 \* 30, \/\/ 30 minutes/a \  const { likes, views, isLiked, toggleLike } = useEngagement("blogs", post?.id);' src/pages/BlogDetail.tsx
