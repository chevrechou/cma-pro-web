import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/cma';
import { CMAReport } from '@/types';
import {
  Anchor, Badge, Button, Card, Group, SimpleGrid, Stack,
  Text, Title,
} from '@mantine/core';
import { IconPlus, IconTrendingUp } from '@tabler/icons-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from('cma_reports')
    .select('*')
    .order('created_at', { ascending: false });

  const list = (reports ?? []) as CMAReport[];

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <div>
          <Title order={2} fw={900} c="navy.8">Reports</Title>
          <Text c="dimmed" size="sm">{list.length} CMA {list.length === 1 ? 'report' : 'reports'}</Text>
        </div>
        <Button
          component="a"
          href="/new-cma"
          leftSection={<IconPlus size={16} />}
          color="gold"
          c="dark"
          fw={700}
        >
          New CMA
        </Button>
      </Group>

      {list.length === 0 ? (
        <Card p="xl" ta="center">
          <Stack align="center" gap="md" py="xl">
            <IconTrendingUp size={48} color="var(--mantine-color-gray-4)" />
            <Text fw={600} size="lg" c="dimmed">No reports yet</Text>
            <Text c="dimmed" size="sm">Create your first CMA to get started.</Text>
            <Button component="a" href="/new-cma" color="navy" leftSection={<IconPlus size={16} />}>
              Create CMA
            </Button>
          </Stack>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {list.map((r) => (
            <Anchor key={r.id} href={`/reports/${r.id}`} underline="never">
              <Card h="100%" style={{ cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                styles={{ root: { ':hover': { boxShadow: 'var(--mantine-shadow-md)' } } }}>
                <Stack gap="sm">
                  <Group justify="space-between" align="flex-start">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text fw={700} size="md" c="navy.8" truncate>{r.subject?.address}</Text>
                      <Text size="xs" c="dimmed">{r.subject?.city}, {r.subject?.state} {r.subject?.zip}</Text>
                    </div>
                    <Stack gap={0} align="flex-end">
                      <Text fw={900} size="xl" c="gold.6" style={{ letterSpacing: -0.5 }}>
                        {formatCurrency(r.suggested_price)}
                      </Text>
                      <Text size="xs" c="dimmed">Suggested</Text>
                    </Stack>
                  </Group>

                  <Group gap="xs">
                    <Badge variant="light" color="navy" size="sm">{r.subject?.beds}bd</Badge>
                    <Badge variant="light" color="navy" size="sm">{r.subject?.baths}ba</Badge>
                    <Badge variant="light" color="navy" size="sm">{r.subject?.sqft?.toLocaleString()} sqft</Badge>
                    <Badge variant="light" color="gray" size="sm">
                      {r.comps?.filter((c) => c.included).length ?? 0} comps
                    </Badge>
                  </Group>

                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">{r.created_at ? formatDate(r.created_at) : ''}</Text>
                    {r.client_name && <Text size="xs" c="navy.5" fw={600}>{r.client_name}</Text>}
                  </Group>
                </Stack>
              </Card>
            </Anchor>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
