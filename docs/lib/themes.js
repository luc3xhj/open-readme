import { designFor } from './designs.js?v=0.5.0';
export const themes = {
  terminal: {
    name: 'Terminal',
    description: 'Precise type. Compact rhythm. A quiet command-line feel.',
    font: 'mono',
    radius: 8,
    accent: '#3e8061',
    light: {
      bg: '#f4f5f2',
      surface: '#ffffff',
      fg: '#202622',
      muted: '#626e65',
      border: '#d4dad4',
    },
    dark: { bg: '#111713', surface: '#17201a', fg: '#edf4ee', muted: '#a2b3a5', border: '#344638' },
  },
  minimal: {
    name: 'Minimal',
    description: 'Clear hierarchy. Fine rules. Just enough color.',
    font: 'sans',
    radius: 14,
    accent: '#4767cf',
    light: {
      bg: '#fafafa',
      surface: '#ffffff',
      fg: '#202126',
      muted: '#666b76',
      border: '#dedfe5',
    },
    dark: { bg: '#13141a', surface: '#1b1d25', fg: '#f1f2f7', muted: '#adb1bf', border: '#343745' },
  },
  editorial: {
    name: 'Editorial',
    description: 'Warm paper. Strong typography. Room for the work.',
    font: 'serif',
    radius: 0,
    accent: '#b75d3a',
    light: {
      bg: '#f1ede5',
      surface: '#f8f5ef',
      fg: '#302b24',
      muted: '#756e63',
      border: '#cfc7b8',
    },
    dark: { bg: '#211e19', surface: '#2a261f', fg: '#f4edde', muted: '#bdb2a0', border: '#514a3c' },
  },
};

export const fonts = {
  mono: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
};

export function tokens(config, mode = 'light') {
  const theme = themes[config.theme],
    design = designFor(config);
  return {
    ...theme[mode],
    designId: config.design,
    surface: mode === 'dark' ? '#161b22' : '#f6f8fa',
    accent: config.style?.accent || (mode === 'dark' ? design.darkAccent : design.accent),
    radius: config.style?.radius ?? design.radius ?? theme.radius,
    font: config.style?.font || design.font,
    customFont: config.style?.font,
    customRadius: config.style?.radius,
    width: config.style?.width || 960,
    pad: config.style?.density === 'comfortable' ? 40 : 28,
  };
}
