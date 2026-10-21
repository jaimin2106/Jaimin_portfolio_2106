import { useEffect, useState, useRef } from "react";

export function useAutosave<T>(
  data: T,
  onSave: (data: T) => Promise<void>,
  delay: number = 3000
) {
  const [saving, setSaving] = useState(false);
  const dataRef = useRef(data);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (JSON.stringify(dataRef.current) === JSON.stringify(data)) {
      return;
    }
    
    dataRef.current = data;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await onSave(data);
      } finally {
        setSaving(false);
      }
    }, delay);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, onSave, delay]);

  return { saving };
}
