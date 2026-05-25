'use client';

export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/client';
import {
  Button, Card, Divider, Group, PasswordInput,
  Stack, Text, TextInput, Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy, IconKey, IconUser } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm({
    initialValues: {
      fullName: '', brokerage: '', licenseNumber: '', phone: '', rentcastKey: '',
    },
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const m = data.user?.user_metadata ?? {};
      form.setValues({
        fullName: m.full_name ?? '',
        brokerage: m.brokerage ?? '',
        licenseNumber: m.license_number ?? '',
        phone: m.phone ?? '',
        rentcastKey: m.rentcast_key ?? '',
      });
      setLoading(false);
    });
  }, []);

  async function handleSave(values: typeof form.values) {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: values.fullName,
        brokerage: values.brokerage,
        license_number: values.licenseNumber,
        phone: values.phone,
        rentcast_key: values.rentcastKey,
      },
    });
    setSaving(false);
    if (error) {
      notifications.show({ color: 'red', title: 'Save failed', message: error.message });
      return;
    }
    notifications.show({ color: 'green', title: 'Saved', message: 'Your profile has been updated.' });
  }

  if (loading) return null;

  return (
    <Stack gap="lg" maw={640} mx="auto">
      <div>
        <Title order={2} fw={900} c="navy.8">Settings</Title>
        <Text c="dimmed" size="sm">Manage your agent profile and API keys</Text>
      </div>

      <form onSubmit={form.onSubmit(handleSave)}>
        <Stack gap="lg">
          <Card>
            <Stack gap="md">
              <Group gap="sm">
                <IconUser size={18} color="var(--mantine-color-navy-8)" />
                <Text fw={700} c="navy.8">Agent Profile</Text>
              </Group>
              <Divider />
              <TextInput label="Full Name" placeholder="Your full name" {...form.getInputProps('fullName')} />
              <TextInput label="Brokerage" placeholder="Your brokerage" {...form.getInputProps('brokerage')} />
              <TextInput label="License Number" placeholder="DRE / License #" {...form.getInputProps('licenseNumber')} />
              <TextInput label="Phone" placeholder="(555) 000-0000" type="tel" {...form.getInputProps('phone')} />
            </Stack>
          </Card>

          <Card>
            <Stack gap="md">
              <Group gap="sm">
                <IconKey size={18} color="var(--mantine-color-navy-8)" />
                <Text fw={700} c="navy.8">API Keys</Text>
              </Group>
              <Divider />
              <PasswordInput
                label="Rentcast API Key"
                placeholder="Your Rentcast API key"
                description="Get a free key at rentcast.io — used to fetch recently sold comparable properties."
                {...form.getInputProps('rentcastKey')}
              />
            </Stack>
          </Card>

          <Group justify="flex-end">
            <Button
              type="submit" color="navy" loading={saving}
              leftSection={<IconDeviceFloppy size={16} />}
            >
              Save Changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Stack>
  );
}
