import { createTheme } from '@mantine/core';

/**
 * The single source of the UI's look. Pages never set colors, fonts or
 * spacing themselves: they use Mantine components, which read this theme.
 */
export const theme = createTheme({
  primaryColor: 'teal',
  defaultRadius: 'md',
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontFamilyMonospace: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  headings: { fontWeight: '700' },
});
