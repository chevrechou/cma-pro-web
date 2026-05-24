'use client';

export const dynamic = 'force-dynamic';

import { useNewCMAStore } from '@/lib/store';
import { Comparable, PropertyCondition, PropertyStyle, SubjectProperty } from '@/types';
import {
  ActionIcon, Badge, Box, Button, Card, Divider, Group, Loader,
  Modal, NumberInput, Paper, Select, SimpleGrid, Stack, Stepper,
  Text, Textarea, TextInput, Title, Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconCheck, IconChevronRight, IconEdit, IconMinus, IconPlus,
  IconRefresh, IconTrendingUp,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { calcMarketStats, calcSuggestedRange, calcAdjustedPrice, formatCurrency } from '@/lib/cma';
import { createClient } from '@/lib/supabase/client';

/* ─── Step 1: Subject Property ─── */
function SubjectStep({ onNext }: { onNext: () => void }) {
  const { setSubject } = useNewCMAStore();
  const form = useForm<{
    address: string; city: string; state: string; zip: string;
    beds: number | ''; baths: number | ''; sqft: number | '';
    lotSqft: number | ''; yearBuilt: number | ''; garage: number | '';
    condition: PropertyCondition; style: PropertyStyle;
    clientName: string; clientEmail: string;
  }>({
    initialValues: {
      address: '', city: '', state: '', zip: '',
      beds: '', baths: '', sqft: '', lotSqft: '', yearBuilt: '', garage: '',
      condition: 'good', style: 'single_family',
      clientName: '', clientEmail: '',
    },
    validate: {
      address: (v) => (v.trim() ? null : 'Required'),
      city: (v) => (v.trim() ? null : 'Required'),
      state: (v) => (/^[A-Z]{2}$/.test(v.toUpperCase()) ? null : '2-letter state code'),
      zip: (v) => (/^\d{5}$/.test(v) ? null : '5-digit ZIP'),
      beds: (v) => (Number(v) > 0 ? null : 'Required'),
      baths: (v) => (Number(v) > 0 ? null : 'Required'),
      sqft: (v) => (Number(v) > 0 ? null : 'Required'),
    },
  });

  function handleSubmit(values: typeof form.values) {
    const subject: SubjectProperty = {
      address: values.address, city: values.city,
      state: values.state.toUpperCase(), zip: values.zip,
      beds: Number(values.beds), baths: Number(values.baths), sqft: Number(values.sqft),
      lot_sqft: values.lotSqft ? Number(values.lotSqft) : undefined,
      year_built: values.yearBuilt ? Number(values.yearBuilt) : undefined,
      garage: values.garage ? Number(values.garage) : undefined,
      condition: values.condition, style: values.style,
    };
    setSubject(subject, values.clientName, values.clientEmail);
    onNext();
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        <Paper p="lg" withBorder>
          <Stack gap="md">
            <Text fw={700} c="navy.8">Address</Text>
            <Divider />
            <TextInput label="Street Address" placeholder="123 Main St" {...form.getInputProps('address')} />
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <TextInput label="City" placeholder="Los Angeles" {...form.getInputProps('city')} />
              <TextInput label="State" placeholder="CA" maxLength={2}
                {...form.getInputProps('state')}
                onChange={(e) => form.setFieldValue('state', e.target.value.toUpperCase())}
              />
              <TextInput label="ZIP Code" placeholder="90210" {...form.getInputProps('zip')} />
            </SimpleGrid>
          </Stack>
        </Paper>

        <Paper p="lg" withBorder>
          <Stack gap="md">
            <Text fw={700} c="navy.8">Property Details</Text>
            <Divider />
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
              <NumberInput label="Bedrooms" placeholder="3" min={0} {...form.getInputProps('beds')} />
              <NumberInput label="Bathrooms" placeholder="2" min={0} decimalScale={1} step={0.5} {...form.getInputProps('baths')} />
              <NumberInput label="Garage" placeholder="2" min={0} {...form.getInputProps('garage')} />
              <NumberInput label="Year Built" placeholder="1995" min={1800} max={new Date().getFullYear() + 1} {...form.getInputProps('yearBuilt')} />
            </SimpleGrid>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <NumberInput label="Living Sqft" placeholder="1800" min={1} {...form.getInputProps('sqft')} />
              <NumberInput label="Lot Sqft" placeholder="6000" min={0} {...form.getInputProps('lotSqft')} />
            </SimpleGrid>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Select
                label="Condition"
                data={[
                  { value: 'excellent', label: 'Excellent' },
                  { value: 'good', label: 'Good' },
                  { value: 'average', label: 'Average' },
                  { value: 'fair', label: 'Fair' },
                  { value: 'poor', label: 'Poor' },
                ]}
                {...form.getInputProps('condition')}
              />
              <Select
                label="Property Type"
                data={[
                  { value: 'single_family', label: 'Single Family' },
                  { value: 'condo', label: 'Condo' },
                  { value: 'townhouse', label: 'Townhouse' },
                  { value: 'multi_family', label: 'Multi-Family' },
                ]}
                {...form.getInputProps('style')}
              />
            </SimpleGrid>
          </Stack>
        </Paper>

        <Paper p="lg" withBorder>
          <Stack gap="md">
            <Text fw={700} c="navy.8">Client Info <Text component="span" c="dimmed" fw={400}>(optional)</Text></Text>
            <Divider />
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput label="Client Name" placeholder="Jane Smith" {...form.getInputProps('clientName')} />
              <TextInput label="Client Email" placeholder="jane@email.com" type="email" {...form.getInputProps('clientEmail')} />
            </SimpleGrid>
          </Stack>
        </Paper>

        <Group justify="flex-end">
          <Button type="submit" color="navy" rightSection={<IconChevronRight size={16} />} size="md">
            Find Comparables
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

/* ─── Step 2: Comparables ─── */
function CompsStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { subject, comps, setComps, toggleComp } = useNewCMAStore();
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function fetchComps() {
    if (!subject) return;
    setLoading(true);
    try {
      const res = await fetch('/api/zillow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zip: subject.zip, beds: subject.beds, baths: subject.baths, sqft: subject.sqft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to fetch comparables');
      setComps(data.comps);
      setSearched(true);
    } catch (e: any) {
      notifications.show({ color: 'red', title: 'Comp search failed', message: e.message });
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!searched && comps.length === 0) fetchComps();
  }, []);

  const included = comps.filter((c) => c.included);

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Text c="dimmed" size="sm">{included.length} of {comps.length} comps selected</Text>
        <Button
          variant="subtle" color="navy" leftSection={<IconRefresh size={16} />}
          onClick={fetchComps} loading={loading} size="sm"
        >
          Refresh
        </Button>
      </Group>

      {loading ? (
        <Card p="xl" ta="center">
          <Stack align="center" gap="md" py="xl">
            <Loader color="navy" />
            <Text c="dimmed">Searching for comparables…</Text>
          </Stack>
        </Card>
      ) : comps.length === 0 ? (
        <Card p="xl" ta="center">
          <Stack align="center" gap="md" py="xl">
            <Text c="dimmed">No comparables found. Try searching again.</Text>
            <Button onClick={fetchComps} color="navy">Search Again</Button>
          </Stack>
        </Card>
      ) : (
        <Stack gap="sm">
          {comps.map((comp) => (
            <Card
              key={comp.id}
              style={{ cursor: 'pointer', opacity: comp.included ? 1 : 0.5, transition: 'opacity 0.15s' }}
              onClick={() => toggleComp(comp.id)}
            >
              <Group justify="space-between" align="flex-start">
                <Group gap="sm" align="flex-start">
                  <Box
                    w={26} h={26} style={{ borderRadius: '50%', flexShrink: 0, marginTop: 2,
                      background: comp.included ? 'var(--mantine-color-navy-8)' : 'var(--mantine-color-gray-3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {comp.included && <IconCheck size={14} color="white" />}
                  </Box>
                  <div>
                    <Text fw={700} size="sm" c="navy.8">{comp.address}</Text>
                    <Text size="xs" c="dimmed">{comp.city}, {comp.state}
                      {comp.distance_miles != null ? ` · ${comp.distance_miles.toFixed(1)} mi` : ''}
                    </Text>
                    <Group gap="xs" mt={4}>
                      <Badge size="xs" variant="light" color="gray">{comp.beds}bd/{comp.baths}ba</Badge>
                      <Badge size="xs" variant="light" color="gray">{comp.sqft.toLocaleString()} sqft</Badge>
                      {comp.year_built && <Badge size="xs" variant="light" color="gray">Built {comp.year_built}</Badge>}
                      <Badge size="xs" variant="light" color="gray">{comp.days_on_market} DOM</Badge>
                    </Group>
                  </div>
                </Group>
                <div style={{ textAlign: 'right' }}>
                  <Text fw={800} size="lg" c="gold.6">{formatCurrency(comp.sale_price)}</Text>
                  <Text size="xs" c="dimmed">{formatCurrency(comp.price_per_sqft)}/sqft</Text>
                </div>
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      <Group justify="space-between">
        <Button variant="default" onClick={onBack}>Back</Button>
        <Button color="navy" onClick={onNext} disabled={included.length === 0}
          rightSection={<IconChevronRight size={16} />}>
          Review ({included.length})
        </Button>
      </Group>
    </Stack>
  );
}

/* ─── Step 3: Adjustments ─── */
function AdjustStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { comps, updateCompAdjustment } = useNewCMAStore();
  const included = comps.filter((c) => c.included);
  const [editing, setEditing] = useState<Comparable | null>(null);
  const [adjAmount, setAdjAmount] = useState<number | ''>('');
  const [adjNotes, setAdjNotes] = useState('');

  const avgAdj = included.length > 0
    ? Math.round(included.reduce((s, c) => s + calcAdjustedPrice(c), 0) / included.length) : 0;

  function openEdit(comp: Comparable) {
    setEditing(comp);
    setAdjAmount(comp.adjustment ?? '');
    setAdjNotes(comp.adjustment_notes ?? '');
  }

  function saveAdj() {
    if (!editing) return;
    updateCompAdjustment(editing.id, Number(adjAmount) || 0, adjNotes);
    setEditing(null);
  }

  return (
    <Stack gap="lg">
      <Card bg="navy.8" p="lg">
        <Stack gap={4}>
          <Text size="xs" c="rgba(255,255,255,0.6)" fw={700}>AVG ADJUSTED PRICE</Text>
          <Text fw={900} size="28px" c="white" style={{ letterSpacing: -1 }}>{formatCurrency(avgAdj)}</Text>
          <Text size="xs" c="rgba(255,255,255,0.5)">{included.length} comps included</Text>
        </Stack>
      </Card>

      <Stack gap="sm">
        {included.map((comp) => (
          <Card key={comp.id}>
            <Group justify="space-between" align="flex-start">
              <div style={{ flex: 1 }}>
                <Text fw={700} size="sm" c="navy.8">{comp.address}</Text>
                <Text size="xs" c="dimmed">{comp.beds}bd/{comp.baths}ba · {comp.sqft.toLocaleString()} sqft</Text>
              </div>
              <Tooltip label="Add adjustment">
                <ActionIcon variant="subtle" color="navy" onClick={() => openEdit(comp)}>
                  <IconEdit size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
            <Divider my="sm" />
            <SimpleGrid cols={3} spacing="sm">
              <div>
                <Text size="xs" c="dimmed">Sale Price</Text>
                <Text fw={700} c="navy.8">{formatCurrency(comp.sale_price)}</Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Text size="xs" c="dimmed">Adjustment</Text>
                <Text fw={700} c={(comp.adjustment ?? 0) >= 0 ? 'green' : 'red'}>
                  {(comp.adjustment ?? 0) >= 0 ? '+' : ''}{formatCurrency(comp.adjustment ?? 0)}
                </Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text size="xs" c="dimmed">Adjusted</Text>
                <Text fw={700} c="gold.6">{formatCurrency(calcAdjustedPrice(comp))}</Text>
              </div>
            </SimpleGrid>
            {comp.adjustment_notes && (
              <Text size="xs" c="dimmed" fs="italic" mt="xs">{comp.adjustment_notes}</Text>
            )}
          </Card>
        ))}
      </Stack>

      <Group justify="space-between">
        <Button variant="default" onClick={onBack}>Back</Button>
        <Button color="navy" onClick={onNext} rightSection={<IconChevronRight size={16} />}>
          Generate Report
        </Button>
      </Group>

      <Modal opened={!!editing} onClose={() => setEditing(null)} title="Adjust Comparable" centered>
        <Stack gap="md">
          <Text size="sm" c="dimmed" truncate>{editing?.address}</Text>
          <Divider />
          <Text size="xs" fw={600} c="dimmed">ADJUSTMENT AMOUNT ($)</Text>
          <Text size="xs" c="dimmed">+ for upgrades vs. subject, − for inferior features</Text>
          <Group gap="xs">
            <ActionIcon variant="light" color="navy" size="lg"
              onClick={() => setAdjAmount((v) => (Number(v) || 0) - 1000)}>
              <IconMinus size={16} />
            </ActionIcon>
            <NumberInput
              style={{ flex: 1 }} value={adjAmount} onChange={(v) => setAdjAmount(v as number | '')}
              placeholder="0" allowDecimal={false} ta="center"
            />
            <ActionIcon variant="light" color="navy" size="lg"
              onClick={() => setAdjAmount((v) => (Number(v) || 0) + 1000)}>
              <IconPlus size={16} />
            </ActionIcon>
          </Group>
          <Textarea
            label="Notes" placeholder="e.g. Pool +$15k, smaller lot -$5k"
            value={adjNotes} onChange={(e) => setAdjNotes(e.target.value)} rows={2}
          />
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setEditing(null)}>Cancel</Button>
            <Button color="navy" onClick={saveAdj}>Save</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

/* ─── Step 4: Report ─── */
function ReportStep({ onBack }: { onBack: () => void }) {
  const { subject, comps, clientName, clientEmail, reset } = useNewCMAStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const mountedRef = useRef(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  if (!subject) return null;

  const included = comps.filter((c) => c.included);
  const stats = calcMarketStats(included);
  const { low, high, suggested } = calcSuggestedRange(subject, included);

  async function handleSave() {
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const agentId = userData.user?.id;
      if (!agentId) throw new Error('Not authenticated');
      const { error } = await supabase.from('cma_reports').insert({
        agent_id: agentId, subject, comps,
        market_stats: stats, suggested_low: low, suggested_high: high,
        suggested_price: suggested,
        client_name: clientName || null, client_email: clientEmail || null,
      });
      if (error) throw error;
      if (mountedRef.current) setSaved(true);
      setTimeout(() => {
        if (!mountedRef.current) return;
        reset();
        router.push('/dashboard');
      }, 1200);
    } catch (e: any) {
      notifications.show({ color: 'red', title: 'Save failed', message: e.message });
    }
    if (mountedRef.current) setSaving(false);
  }

  return (
    <Stack gap="lg">
      <Card bg="navy.8" p="xl" ta="center">
        <Stack gap="sm" align="center">
          <IconTrendingUp size={32} color="var(--mantine-color-gold-5)" />
          <Text size="xs" c="rgba(255,255,255,0.6)" fw={700}>SUGGESTED LIST PRICE</Text>
          <Text fw={900} size="40px" c="gold.4" style={{ letterSpacing: -2 }}>{formatCurrency(suggested)}</Text>
          <Group gap="xl">
            <div style={{ textAlign: 'center' }}>
              <Text size="xs" c="rgba(255,255,255,0.4)">LOW</Text>
              <Text fw={700} c="white" size="lg">{formatCurrency(low)}</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Text size="xs" c="rgba(255,255,255,0.4)">HIGH</Text>
              <Text fw={700} c="white" size="lg">{formatCurrency(high)}</Text>
            </div>
          </Group>
          <Text size="xs" c="rgba(255,255,255,0.4)">
            Based on {included.length} comps · Condition: {subject.condition}
          </Text>
        </Stack>
      </Card>

      <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="sm">
        {[
          { label: 'Avg Sale Price', value: formatCurrency(stats.avg_sale_price) },
          { label: 'Median Price', value: formatCurrency(stats.median_sale_price) },
          { label: 'Avg $/Sqft', value: formatCurrency(stats.avg_price_per_sqft) },
          { label: 'Avg DOM', value: `${stats.avg_days_on_market} days` },
          { label: 'List/Sale', value: `${(stats.avg_list_to_sale_ratio * 100).toFixed(1)}%` },
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
          <Group gap="md">
            <div><Text size="xs" c="dimmed">Beds</Text><Text fw={700}>{subject.beds}</Text></div>
            <div><Text size="xs" c="dimmed">Baths</Text><Text fw={700}>{subject.baths}</Text></div>
            <div><Text size="xs" c="dimmed">Sqft</Text><Text fw={700}>{subject.sqft.toLocaleString()}</Text></div>
            {subject.year_built && <div><Text size="xs" c="dimmed">Built</Text><Text fw={700}>{subject.year_built}</Text></div>}
            <div><Text size="xs" c="dimmed">Condition</Text><Text fw={700} tt="capitalize">{subject.condition}</Text></div>
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
                  <Text size="xs" c="dimmed">{comp.beds}bd/{comp.baths}ba · {comp.sqft.toLocaleString()} sqft · {comp.days_on_market} DOM</Text>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Text fw={700} c="gold.6">{formatCurrency(comp.sale_price)}</Text>
                  {(comp.adjustment ?? 0) !== 0 && (
                    <Text size="xs" c={(comp.adjustment ?? 0) > 0 ? 'green' : 'red'}>
                      Adj: {(comp.adjustment ?? 0) > 0 ? '+' : ''}{formatCurrency(comp.adjustment ?? 0)}
                    </Text>
                  )}
                </div>
              </Group>
            </div>
          ))}
        </Stack>
      </Paper>

      {clientName && (
        <Paper p="lg" withBorder>
          <Stack gap="xs">
            <Text fw={700} c="navy.8">Prepared For</Text>
            <Divider />
            <Text fw={600}>{clientName}</Text>
            {clientEmail && <Text size="sm" c="dimmed">{clientEmail}</Text>}
          </Stack>
        </Paper>
      )}

      <Group justify="space-between">
        <Button variant="default" onClick={onBack}>Back</Button>
        <Button
          color={saved ? 'green' : 'gold'} c="dark" fw={700}
          onClick={handleSave} loading={saving} disabled={saving || saved}
          leftSection={saved ? <IconCheck size={16} /> : undefined}
        >
          {saved ? 'Saved!' : 'Save Report'}
        </Button>
      </Group>
    </Stack>
  );
}

/* ─── Main Page ─── */
const STEPS = ['Subject Property', 'Comparables', 'Adjust', 'Report'];

export default function NewCMAPage() {
  const [active, setActive] = useState(0);
  const { reset } = useNewCMAStore();

  useEffect(() => { reset(); }, []);

  return (
    <Stack gap="xl" maw={840} mx="auto">
      <div>
        <Title order={2} fw={900} c="navy.8">New CMA</Title>
        <Text c="dimmed" size="sm">Comparative Market Analysis</Text>
      </div>

      <Stepper active={active} color="navy" size="sm">
        {STEPS.map((label) => (
          <Stepper.Step key={label} label={label} />
        ))}
      </Stepper>

      {active === 0 && <SubjectStep onNext={() => setActive(1)} />}
      {active === 1 && <CompsStep onNext={() => setActive(2)} onBack={() => setActive(0)} />}
      {active === 2 && <AdjustStep onNext={() => setActive(3)} onBack={() => setActive(1)} />}
      {active === 3 && <ReportStep onBack={() => setActive(2)} />}
    </Stack>
  );
}
