// Compositions, not color skins. Native Markdown stays native on GitHub.
export const designs = {
  plain: {
    darkAccent: '#D2D8CD',
    name: 'Plain',
    description: 'A small wordmark, open space and a compact feature list.',
    for: 'Libraries · small tools',
    theme: 'minimal',
    font: 'sans',
    accent: '#202020',
    features: 'native',
    hero: 'plain',
  },
  swiss: {
    darkAccent: '#FF785A',
    name: 'Swiss',
    description: 'Oversized type, a hard accent block and a numbered feature index.',
    for: 'Developer tools · design systems',
    theme: 'minimal',
    font: 'sans',
    accent: '#EB4B28',
    features: 'index',
    hero: 'swiss',
  },
  editorial: {
    darkAccent: '#D5BA8D',
    name: 'Editorial',
    description: 'A serif masthead, fine rules and an open two-column feature spread.',
    for: 'Research · writing · collections',
    theme: 'editorial',
    font: 'serif',
    accent: '#927044',
    features: 'columns',
    hero: 'editorial',
  },
  terminal: {
    darkAccent: '#86D8AF',
    name: 'Terminal',
    description: 'A command session, compact output and a manual-like feature index.',
    for: 'CLI tools · infrastructure',
    theme: 'terminal',
    font: 'mono',
    accent: '#52B788',
    features: 'native',
    hero: 'terminal',
  },
  blueprint: {
    darkAccent: '#83A6FF',
    name: 'Blueprint',
    description: 'Measured grid lines, technical labeling and a structured feature matrix.',
    for: 'APIs · infrastructure · SDKs',
    theme: 'minimal',
    font: 'mono',
    accent: '#3568D4',
    features: 'columns',
    hero: 'blueprint',
  },
  product: {
    darkAccent: '#B49CFF',
    name: 'Product',
    description: 'A centered introduction and a wide, quiet layout for real screenshots.',
    for: 'Applications · visual products',
    theme: 'minimal',
    font: 'sans',
    accent: '#7357D9',
    features: 'rows',
    hero: 'product',
  },
  studio: {
    darkAccent: '#FF9079',
    name: 'Studio',
    description: 'An asymmetric title, a graphic monogram and an airy feature spread.',
    for: 'Creative tools · portfolios',
    theme: 'editorial',
    font: 'sans',
    accent: '#D75740',
    features: 'columns',
    hero: 'studio',
  },
  atlas: {
    darkAccent: '#78D6C8',
    name: 'Atlas',
    description: 'An index-like cover, a narrow color rail and scan-friendly numbered rows.',
    for: 'Directories · datasets',
    theme: 'minimal',
    font: 'sans',
    accent: '#17796E',
    features: 'index',
    hero: 'atlas',
  },
};
export function designFor(config) {
  return designs[
    config.design ||
      (config.theme === 'terminal'
        ? 'terminal'
        : config.theme === 'editorial'
          ? 'editorial'
          : 'plain')
  ];
}
