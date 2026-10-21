import { useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { toast } from "sonner";
import { triggerBuildHook } from "../lib/buildHook";

interface UseDeleteEntityProps {
  collectionName: string;
  entityName?: string;
  onSuccess?: (id: string) => void;
}

export function useDeleteEntity({ collectionName, entityName = "item", onSuccess }: UseDeleteEntityProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    toast(`Delete this ${entityName}?`, {
      action: {
        label: 'Confirm Delete',
        onClick: async () => {
          setIsDeleting(id);
          const toastId = toast.loading(`Deleting ${entityName}...`);

          try {
            await deleteDoc(doc(db, collectionName, id));
            toast.success(`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} deleted successfully.`, { id: toastId });
            
            // Trigger rebuild if a major content entity is deleted
            if (collectionName === "blogs" || collectionName === "projects") {
              triggerBuildHook(`${entityName} deleted`);
            }
            
            if (onSuccess) onSuccess(id);
          } catch (error) {
            /* error suppressed */
            toast.error(`Failed to delete ${entityName}.`, { id: toastId });
          } finally {
            setIsDeleting(null);
          }
        }
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {}
      }
    });
  };

  return {
    handleDelete,
    isDeleting
  };
}
