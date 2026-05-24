import { createClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/cma';
import { CMAReport } from '@/types';
import DeleteReportButton from './DeleteReportButton';
import {
  Anchor, Badge, Card, Divider, Group, Paper,
  SimpleGrid, Stack, Text, Title,
} from '@mantine/core';
import { IconArrowLeft, IconTrendingUp } from '@tabler/icons-react';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('cma_reports').select('*').eq('id', id).single();

  if (!data) notFound();
  const report = data as CMAReport;
  const included = report.comps.filter((c) => c.included);

  return (
    <Stack gap="lg" maw={900} mx="auto">
      <Group justify="space-between" align="center">
        <Group gap="sm">
          <Anchor href="/dashboard" c="dimmed" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconArrowLeft size={16} /> Reports
          </Anchor>
        </Group>
        <DeleteReportButton id={id} />
      </Group>

      <div>
        <Title order={2} fw={900} c="navy.8">{report.subject.address}</Title>
        <Text c="dimmed" size="sm">
          {report.subject.city}, {report.subject.state} {report.subject.zip}
          {report.created_at ? ` · ${formatDate(report.created_at)}` : ''}
        </Text>
      </div>

      <Card bg="navy.8" p="xl" ta="center">
        <Stack gap="sm" align="center">
          <IconTrendingUp size={28} color="var(--mantine-color-gold-5)" />
          <Text size="xs" c="rgba(255,255,255,0.6)" fw={700}>SUGGESTED LIST PRICE</Text>
          <Text fw={900} size="40px" c="gold.4" style={{ letterSpacing: -2 }}>
            {formatCurrency(report.suggested_price)}
          </Text>
          <Group gap="xl">
            <div style={{ textAlign: 'center' }}>
              <Text size="xs" c="rgba(255,255,255,0.4)">LOW</Text>
              <Text fw={700} c="white" size="lg">{formatCurrency(report.suggested_low)}</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Text size="xs" c="rgba(255,255,255,0.4)">HIGH</Text>
              <Text fw={700} c="white" size="lg">{formatCurrency(report.suggested_high)}</Text>
            </div>
          </Group>
        </Stack>
      </Card>

      <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="sm">
        {[
          { label: 'Avg Sale Price', value: formatCurrency(report.market_stats.avg_sale_price) },
          { label: 'Median Price', value: formatCurrency(report.market_stats.median_sale_price) },
          { label: 'Avg $/Sqft', value: formatCurrency(report.market_stats.avg_price_per_sqft) },
          { label: 'Avg DOM', value: `${report.market_stats.avg_days_on_market} days` },
          { label: 'List/Sale', value: `${(report.market_stats.avg_list_to_sale_ratio * 100).toFixed(1)}%` },
        ].map(({ label, value }) => (
          <Card key={label} p="md" ta="center">
            <Text size="xs" c="dimmed" fw={600}>{label}</Text>
            <Text fw={800} size="lg" c="navy.8">{value}</Text>
          </Card>
        ))}
      </SimpleGrid>

      <Paper p="lg" withBorder>
        <Stack gap="sm">
          <Text fw={700} c="navy.8">Subject Property</Text>
          <Divider />
          <Group gap="md" wrap="wrap">
            <div><Text size="xs" c="dimmed">Beds</Text><Text fw={700}>{report.subject.beds}</Text></div>
            <div><Text size="xs" c="dimmed">Baths</Text><Text fw={700}>{report.subject.baths}</Text></div>
            <div><Text size="xs" c="dimmed">Sqft</Text><Text fw={700}>{report.subject.sqft.toLocaleString()}</Text></div>
            {report.subject.year_built && <div><Text size="xs" c="dimmed">Built</Text><Text fw={700}>{report.subject.year_built}</Text></div>}
            <div><Text size="xs" c="dimmed">Condition</Text><Text fw={700} tt="capitalize">{report.subject.condition}</Text></div>
          </Group>
        </Stack>
      </Paper>

      <Paper p="lg" withBorder>
        <Stack gap="sm">
          <Text fw={700} c="navy.8">Comparables ({included.length})</Text>
          <Divider />
          {included.map((comp, i) => (
            <div key={comp.id}>
              {i > 0 && <Divider my="sm" />}
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text fw={600} size="sm" c="navy.8">{comp.address}</Text>
                  <Group gap="xs" mt={4}>
                    <Badge size="xs" variant="light" color="gray">{comp.beds}bd/{comp.baths}ba</Badge>
                    <Badge size="xs" variant="light" color="gray">{comp.sqft.toLocaleString()} sqft</Badge>
                    <Badge size="xs" variant="light" color="gray">{comp.days_on_market} DOM</Badge>
                    {comp.sale_date && <Badge size="xs" variant="light" color="gray">{formatDate(comp.sale_date)}</Badge>}
                  </Group>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Text fw={700} c="gold.6">{formatCurrency(comp.sale_price)}</Text>
                  <Text size="xs" c="dimmed">{formatCurrency(comp.price_per_sqft)}/sqft</Text>
                </div>
              </Group>
            </div>
          ))}
        </Stack>
      </Paper>

      {report.client_name && (
        <Paper p="lg" withBorder>
          <Stack gap="xs">
            <Text fw={700} c="navy.8">Client</Text>
            <Divider />
            <Text fw={600}>{report.client_name}</Text>
            {report.client_email && <Text size="sm" c="dimmed">{report.client_email}</Text>}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
