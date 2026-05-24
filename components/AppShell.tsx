'use client';

import { createClient } from '@/lib/supabase/client';
import {
  AppShell, Burger, Group, NavLink, Stack, Text, Title, UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconChartBar, IconLogout, IconSettings, IconTrendingUp,
} from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Reports', icon: IconChartBar },
  { href: '/settings', label: 'Settings', icon: IconSettings },
];

export default function AppShellWrapper({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 220, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Group gap={8} c="navy.8">
              <IconTrendingUp size={22} />
              <Title order={4} fw={900} style={{ letterSpacing: -0.5 }}>CMA Pro</Title>
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack h="100%" justify="space-between">
          <Stack gap={4}>
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <NavLink
                key={href}
                href={href}
                label={label}
                leftSection={<Icon size={18} />}
                active={pathname === href || pathname.startsWith(href + '/')}
                color="navy"
                variant="filled"
                onClick={toggle}
              />
            ))}
          </Stack>
          <UnstyledButton onClick={handleSignOut}>
            <Group gap="sm" c="dimmed" p="xs">
              <IconLogout size={18} />
              <Text size="sm">Sign Out</Text>
            </Group>
          </UnstyledButton>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main bg="var(--mantine-color-gray-0)">
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
