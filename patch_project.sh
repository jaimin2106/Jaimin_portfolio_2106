sed -i "s/import { useState, useEffect } from 'react';/import { useState, useEffect } from 'react';\nimport { useEngagement } from '..\/hooks\/useEngagement';/g" src/pages/ProjectDetail.tsx

sed -i '/const \[hasLiked, setHasLiked\] = useState(false);/d' src/pages/ProjectDetail.tsx
sed -i '/const \[likeCount, setLikeCount\] = useState(0);/d' src/pages/ProjectDetail.tsx

sed -i '/useEffect(() => {/,/}, \[project\]);/d' src/pages/ProjectDetail.tsx
sed -i '/const handleLike = async () => {/,/};/d' src/pages/ProjectDetail.tsx

