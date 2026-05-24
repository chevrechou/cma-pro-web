'use client';

export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/client';
import {
  Anchor, Box, Button, Center, Paper, PasswordInput,
  Stack, Text, TextInput, Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconTrendingUp } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: {
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Invalid email'),
      password: (v) => (v.length > 0 ? null : 'Required'),
    },
  });

  async function handleSubmit(values: typeof form.values) {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(values);
    setLoading(false);
    if (error) {
      notifications.show({ color: 'red', title: 'Sign in failed', message: error.message });
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <Box bg="var(--mantine-color-gray-0)" mih="100vh">
      <Center h="100vh">
        <Stack w={400} px="md" gap="lg">
          <Stack gap={4} align="center">
            <Box c="navy.8" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconTrendingUp size={32} />
              <Title order={1} fw={900} style={{ letterSpacing: -1 }}>CMA Pro</Title>
            </Box>
            <Text c="dimmed" size="sm">Comparative Market Analysis for Agents</Text>
          </Stack>

          <Paper p="xl" shadow="xs">
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <Title order={3} fw={800}>Sign in</Title>
                <TextInput
                  label="Email"
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                  {...form.getInputProps('email')}
                />
                <PasswordInput
                  label="Password"
                  placeholder="Your password"
                  autoComplete="current-password"
                  {...form.getInputProps('password')}
                />
                <Button type="submit" loading={loading} color="navy" fullWidth mt="xs">
                  Sign In
                </Button>
                <Text size="sm" ta="center" c="dimmed">
                  No account?{' '}
                  <Anchor href="/register" c="navy">Sign up</Anchor>
                </Text>
              </Stack>
            </form>
          </Paper>
        </Stack>
      </Center>
    </Box>
  );
}
