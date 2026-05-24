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

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: { fullName: '', email: '', password: '', confirmPassword: '', brokerage: '' },
    validate: {
      fullName: (v) => (v.trim().length > 0 ? null : 'Required'),
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Invalid email'),
      password: (v) => (v.length >= 8 ? null : 'Minimum 8 characters'),
      confirmPassword: (v, values) => (v === values.password ? null : 'Passwords do not match'),
    },
  });

  async function handleSubmit(values: typeof form.values) {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { full_name: values.fullName, brokerage: values.brokerage } },
    });
    setLoading(false);
    if (error) {
      notifications.show({ color: 'red', title: 'Registration failed', message: error.message });
      return;
    }
    if (data.session) {
      router.push('/dashboard');
      router.refresh();
    } else {
      notifications.show({ color: 'blue', title: 'Check your email', message: 'Confirm your account then sign in.' });
    }
  }

  return (
    <Box bg="var(--mantine-color-gray-0)" mih="100vh">
      <Center h="100vh">
        <Stack w={420} px="md" gap="lg">
          <Stack gap={4} align="center">
            <Box c="navy.8" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconTrendingUp size={32} />
              <Title order={1} fw={900} style={{ letterSpacing: -1 }}>CMA Pro</Title>
            </Box>
            <Text c="dimmed" size="sm">Create your agent account</Text>
          </Stack>

          <Paper p="xl" shadow="xs">
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <Title order={3} fw={800}>Create Account</Title>
                <TextInput label="Full Name" placeholder="Jane Smith" {...form.getInputProps('fullName')} />
                <TextInput label="Email" placeholder="you@example.com" type="email" {...form.getInputProps('email')} />
                <PasswordInput label="Password" placeholder="Min. 8 characters" {...form.getInputProps('password')} />
                <PasswordInput label="Confirm Password" placeholder="Repeat password" {...form.getInputProps('confirmPassword')} />
                <TextInput label="Brokerage" placeholder="Optional" {...form.getInputProps('brokerage')} />
                <Button type="submit" loading={loading} color="navy" fullWidth mt="xs">
                  Create Account
                </Button>
                <Text size="sm" ta="center" c="dimmed">
                  Already have an account?{' '}
                  <Anchor href="/login" c="navy">Sign in</Anchor>
                </Text>
              </Stack>
            </form>
          </Paper>
        </Stack>
      </Center>
    </Box>
  );
}
