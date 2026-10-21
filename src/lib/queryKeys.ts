export const STALE_TIMES = {
  hero: 24 * 60 * 60 * 1000,
  settings: 24 * 60 * 60 * 1000,
  projects: 12 * 60 * 60 * 1000,
  blogs: 12 * 60 * 60 * 1000,
  testimonials: 3 * 24 * 60 * 60 * 1000,
  faqs: 3 * 24 * 60 * 60 * 1000,
  capabilities: 3 * 24 * 60 * 60 * 1000,
  engagement: 5 * 60 * 1000,
  stats: 3 * 24 * 60 * 60 * 1000,
};

export const QUERY_KEYS = {
  hero: ["portfolio", "hero"],
  settings: ["portfolio", "settings"],
  projects: ["portfolio", "projects"],
  project: (idOrSlug: string) => ["portfolio", "project", idOrSlug],
  blogs: ["portfolio", "blogs"],
  blog: (idOrSlug: string) => ["portfolio", "blog", idOrSlug],
  testimonials: ["portfolio", "testimonials"],
  faqs: ["portfolio", "faqs"],
  capabilities: ["portfolio", "capabilities"],
  stats: ["portfolio", "stats"],
  engagement: (collection: string, id: string) => ["portfolio", "engagement", collection, id],
};
