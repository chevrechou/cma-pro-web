import AppShellWrapper from '@/components/AppShell';
export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppShellWrapper>{children}</AppShellWrapper>;
}
