import AppShellWrapper from '@/components/AppShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShellWrapper>{children}</AppShellWrapper>;
}
