const VERIFIED_PROJECT_DESCRIPTIONS = {
  'resume-coach': 'An AI-driven resume review and career coaching platform tailored for software engineers and designers.',
};

function normalizedProjectKey(project = {}) {
  return String(project.slug || project.id || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export function projectSeoDescription(project = {}) {
  const description = [
    project.seoDescription,
    project.shortDescription,
    project.description,
    project.fullDescription,
    project.subtitle,
  ].find((value) => String(value || '').replace(/<[^>]*>/g, '').trim().length >= 40);

  if (description) return String(description);

  const projectKey = normalizedProjectKey(project);
  return Object.entries(VERIFIED_PROJECT_DESCRIPTIONS).find(([key]) => key.replace(/[^a-z0-9]/g, '') === projectKey)?.[1] || '';
}
