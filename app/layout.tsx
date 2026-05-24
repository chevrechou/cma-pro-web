import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './globals.css';

import { ColorSchemeScript, MantineProvider, createTheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import type { Metadata } from 'next';

const theme = createTheme({
  primaryColor: 'navy',
  colors: {
    navy: [
      '#e8f0f7', '#c5d8eb', '#9fbfdd', '#78a5cf', '#5690c4',
      '#3a7dba', '#2e6aa3', '#24578a', '#1b4f72', '#123451',
    ],
    gold: [
      '#fdf8e1', '#fbf0b3', '#f8e77f', '#f5dd4c', '#f2d41f',
      '#e6c909', '#d4ac0d', '#b8930b', '#9c7a09', '#806207',
    ],
  },
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  defaultRadius: 'md',
  components: {
    Button: { defaultProps: { radius: 'md' } },
    Card: { defaultProps: { radius: 'md', withBorder: true } },
    TextInput: { defaultProps: { radius: 'md' } },
    PasswordInput: { defaultProps: { radius: 'md' } },
    Select: { defaultProps: { radius: 'md' } },
    NumberInput: { defaultProps: { radius: 'md' } },
  },
});

export const metadata: Metadata = {
  title: 'CMA Pro — Market Analysis for Agents',
  description: 'Generate accurate home pricing reports with live comparable sales.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <ModalsProvider>
            <Notifications position="top-right" />
            {children}
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
