const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/BlogEditor.tsx', 'utf8');

if (!code.includes('import { useAutosave }')) {
  code = code.replace(
    'import { Accordion',
    'import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";\nimport { useAutosave } from "../../lib/useAutosave";\n'
  );
  
  // replace the onSubmit to extract saveLogic
  const onSubmitIndex = code.indexOf('const onSubmit = async (data: any) => {');
  
  const newSaveLogic = `
  const saveLogic = async (data: any) => {
    try {
      const blogId = isNew ? data.slug || Date.now().toString() : id;
      const docRef = doc(db, "blogs", blogId);

      let payload = { ...data };
      if (typeof data.tags === "string" && data.tags.trim() !== "") {
        payload.tags = data.tags.split(",").map((t: string) => t.trim());
      } else if (Array.isArray(data.tags)) {
        payload.tags = data.tags;
      } else {
        payload.tags = [];
      }

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key];
      });

      await setDoc(
        docRef,
        {
          ...payload,
          updatedAt: serverTimestamp(),
          ...(isNew ? { createdAt: serverTimestamp() } : {}),
        },
        { merge: true },
      );

      queryClient.invalidateQueries({ queryKey: ["public_blogs"] });
      setLastSaved(new Date().toLocaleTimeString());
      if (isNew) {
        navigate(\`/admin/blogs/\${blogId}\`, { replace: true });
      }
    } catch (error: any) {
      toast.error("Error saving blog: " + error.message);
      throw error;
    }
  };

  const { saving: autoSaving } = useAutosave(formValues, async (data) => {
    if (isNew) return; // Don't autosave entirely new drafts until initial save
    if (!data.title) return;
    try {
      await saveLogic(data);
    } catch(e) {}
  }, 5000);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      await saveLogic(data);
      toast.success("Blog saved successfully.");
    } finally {
      setSaving(false);
    }
  };
`;

  const onSubmitRegex = /const onSubmit = async \(data: any\) => \{[\s\S]*?setSaving\(false\);\n    \}\n  \};/;
  code = code.replace(onSubmitRegex, newSaveLogic);
  
  // replace <ContentStudioLayout
  const layoutRegex = /saving={saving}/;
  code = code.replace(layoutRegex, 'saving={saving || autoSaving}');
  
  // remove duplicate imports of Accordion if any
  
  fs.writeFileSync('src/pages/admin/BlogEditor.tsx', code);
}
