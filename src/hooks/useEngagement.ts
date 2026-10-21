import { useState, useEffect, useRef } from 'react';
import { doc, increment, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS, STALE_TIMES } from '../lib/queryKeys';

export function useEngagement(collectionName: string, docId: string | undefined) {
  const [isLiked, setIsLiked] = useState(false);
  const viewLogged = useRef(false);
  const queryClient = useQueryClient();

  const queryKey = docId ? QUERY_KEYS.engagement(collectionName, docId) : [];

  const { data } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!docId) return { likes: 0, views: 0 };
      const docRef = doc(db, collectionName, docId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const docData = snap.data();
        return { likes: docData.likes || 0, views: docData.views || 0 };
      }
      return { likes: 0, views: 0 };
    },
    enabled: !!docId,
    staleTime: STALE_TIMES.engagement,
  });

  const likes = data?.likes || 0;
  const views = data?.views || 0;

  useEffect(() => {
    if (!docId) return;
    
    // Check local storage for like status
    const likedKey = "liked__";
    setIsLiked(localStorage.getItem(likedKey) === 'true');

    // Increment view counter (only once per session)
    if (!viewLogged.current) {
      viewLogged.current = true;
      const viewedKey = "viewed__";
      const hasViewed = sessionStorage.getItem(viewedKey);
      
      if (!hasViewed) {
        sessionStorage.setItem(viewedKey, 'true');
        const docRef = doc(db, collectionName, docId);
        
        // Background view increment
        getDoc(docRef).then((snap) => {
          if (snap.exists()) {
             updateDoc(docRef, { views: increment(1) }).catch(console.error);
          }
        });
      }
    }
  }, [docId, collectionName]);

  const toggleLike = async () => {
    if (!docId) return;
    
    const docRef = doc(db, collectionName, docId);
    const likedKey = "liked__";
    
    try {
      if (isLiked) {
        setIsLiked(false);
        localStorage.removeItem(likedKey);
        // Optimistic update
        queryClient.setQueryData(queryKey, (old: any) => ({
          ...old,
          likes: Math.max(0, (old?.likes || 0) - 1)
        }));
        await updateDoc(docRef, { likes: increment(-1) });
      } else {
        setIsLiked(true);
        localStorage.setItem(likedKey, 'true');
        // Optimistic update
        queryClient.setQueryData(queryKey, (old: any) => ({
          ...old,
          likes: (old?.likes || 0) + 1
        }));
        await updateDoc(docRef, { likes: increment(1) });
      }
    } catch (error) {
      console.error("Error updating likes:", error);
      // Revert optimistic update on error
      setIsLiked(!isLiked);
      queryClient.invalidateQueries({ queryKey });
    }
  };

  return { likes, views, isLiked, toggleLike };
}
