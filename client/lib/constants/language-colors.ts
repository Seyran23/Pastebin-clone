export const LANGUAGE_COLORS: Record<string, string> = {
  typescript: '#3178c6',
  javascript: '#f1e05a',
  python: '#3572a5',
  java: '#b07219',
  'c#': '#178600',
  'c++': '#f34b7d',
  go: '#00add8',
  rust: '#dea584',
  ruby: '#701516',
  php: '#4f5d95',
  swift: '#f05138',
  kotlin: '#a97bff',
  html: '#e34c26',
  css: '#563d7c',
  sql: '#e38c00',
  json: '#292929',
  yaml: '#cb171e',
  bash: '#89e051',
  shell: '#89e051',
  markdown: '#083fa1',
};

export const getLangColor = (lang?: string | null): string =>
  LANGUAGE_COLORS[lang?.toLowerCase() ?? ''] ?? '#52525b';
