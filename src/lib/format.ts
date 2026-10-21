export function formatTechName(name: string): string {
  const map: Record<string, string> = {
    "nextjs": "Next.js",
    "next.js": "Next.js",
    "next": "Next.js",
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    "javascript": "JavaScript",
    "js": "JavaScript",
    "nodejs": "Node.js",
    "node": "Node.js",
    "node.js": "Node.js",
    "firebase": "Firebase",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "html": "HTML",
    "css": "CSS",
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "mongodb": "MongoDB",
    "graphql": "GraphQL",
    "api": "API",
    "ui/ux": "UI/UX",
    "aws": "AWS",
    "gcp": "GCP"
  };
  const lower = name.toLowerCase().trim();
  return map[lower] || name;
}

export function formatTitle(title: string): string {
  return title
    .split(' ')
    .map(word => {
      if (['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'with', 'in', 'of'].includes(word.toLowerCase()) && word !== title.split(' ')[0]) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

export function parseTags(tags: any): string[] {
  if (Array.isArray(tags)) return tags.map(t => typeof t === 'string' ? t.trim() : String(t));
  if (typeof tags === 'string') return tags.split(',').map(t => t.trim()).filter(Boolean);
  return [];
}
