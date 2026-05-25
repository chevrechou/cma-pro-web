'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Anchor, Badge, Box, Button, Card, Center, Container,
  Divider, Group, NumberInput, Overlay, Select, SimpleGrid,
  Stack, Text, TextInput, Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconAdjustments, IconArrowRight, IconBolt, IconCalculator,
  IconChartBar, IconCheck, IconClipboardList, IconFileText,
  IconHome, IconLock, IconSearch, IconShare, IconUsers,
} from '@tabler/icons-react';

const MOCK_COMPS = [
  { address: '1234 Oak Street',  city: 'Sample City, CA', price: 485000, sqft: 1820, dom: 14 },
  { address: '5678 Maple Ave',   city: 'Sample City, CA', price: 472000, sqft: 1750, dom: 21 },
  { address: '9012 Pine Blvd',   city: 'Sample City, CA', price: 498500, sqft: 1890, dom: 9  },
];

const FEATURES = [
  {
    icon: IconChartBar,
    title: 'Live Market Data',
    description:
      'Pull up to 15 recently sold comparable properties by ZIP, bedrooms, and square footage — data from Rentcast, updated daily.',
  },
  {
    icon: IconAdjustments,
    title: 'Smart Adjustments',
    description:
      'Add dollar adjustments for pools, condition differences, square footage gaps, and anything else that moves value.',
  },
  {
    icon: IconFileText,
    title: 'Client-Ready Reports',
    description:
      'Save polished CMA reports tied to your client. Suggested price range calculated from your adjusted comps.',
  },
];

const STEPS = [
  { num: '01', icon: IconClipboardList, title: 'Enter Subject Property',   desc: 'Address, beds, baths, sqft, year built, and condition.' },
  { num: '02', icon: IconSearch,        title: 'Pull Live Comps',          desc: 'Fetch recently sold comparables within ±25% sqft of your subject.' },
  { num: '03', icon: IconCalculator,    title: 'Apply Adjustments',        desc: 'Add dollar adjustments per comp and see the average price update live.' },
  { num: '04', icon: IconShare,         title: 'Save & Share',             desc: 'Save the report, share it with your client, and come back any time.' },
];

export default function LandingPage() {
  const [stage, setStage] = useState<'idle' | 'previewing'>('idle');

  const form = useForm({
    initialValues: {
      address: '',
      city: '',
      state: '',
      zip: '',
      beds: '',
      baths: '',
      sqft: undefined as number | undefined,
    },
  });

  return (
    <Box>

      {/* ── Navbar ──────────────────────────────────────────────── */}
      <Box
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'white',
          borderBottom: '1px solid var(--mantine-color-gray-2)',
        }}
      >
        <Container size="lg">
          <Group justify="space-between" h={64}>
            <Group gap="xs">
              <IconHome size={22} color="var(--mantine-color-navy-8)" />
              <Text fw={900} size="xl" c="navy.8" style={{ letterSpacing: '-0.5px' }}>
                CMA Pro
              </Text>
            </Group>
            <Group gap="sm">
              <Button variant="subtle" color="navy" component={Link} href="/login">
                Sign In
              </Button>
              <Button color="navy" component={Link} href="/register">
                Get Started Free
              </Button>
            </Group>
          </Group>
        </Container>
      </Box>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <Box
        style={{
          background: 'linear-gradient(150deg, #123451 0%, #1b4f72 50%, #2e6aa3 100%)',
          padding: '96px 0 80px',
        }}
      >
        <Container size="md">
          <Stack align="center" gap="xl">
            <Badge color="gold" variant="light" size="lg" radius="xl" style={{ letterSpacing: '0.03em' }}>
              Built for real estate agents
            </Badge>
            <Title
              order={1}
              ta="center"
              c="white"
              style={{ fontSize: 'clamp(2.4rem, 6vw, 3.8rem)', fontWeight: 900, lineHeight: 1.1 }}
            >
              Price It Right.{' '}
              <Text component="span" c="gold.4" inherit>Every Time.</Text>
            </Title>
            <Text ta="center" c="white" size="xl" maw={540} style={{ opacity: 0.85, lineHeight: 1.65 }}>
              Pull live comparable sales, adjust for every difference, and deliver a
              client-ready pricing report — in minutes.
            </Text>
            <Group gap="md" mt="xs">
              <Button
                size="lg"
                color="gold"
                component={Link}
                href="/register"
                rightSection={<IconArrowRight size={18} />}
              >
                Start for Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                style={{ borderColor: 'rgba(255,255,255,0.35)', color: 'white' }}
                onClick={() =>
                  document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                See It in Action
              </Button>
            </Group>
            <Group gap="xl" mt="sm">
              {[
                { icon: IconBolt,  label: '15 live comps per search' },
                { icon: IconCheck, label: '4-step wizard' },
                { icon: IconUsers, label: 'Client-ready reports' },
              ].map(({ icon: Icon, label }) => (
                <Group key={label} gap={6}>
                  <Icon size={15} color="var(--mantine-color-gold-4)" />
                  <Text c="white" size="sm" style={{ opacity: 0.85 }}>{label}</Text>
                </Group>
              ))}
            </Group>
          </Stack>
        </Container>
      </Box>

      {/* ── Features ────────────────────────────────────────────── */}
      <Box py={80} bg="white">
        <Container size="lg">
          <Stack gap={48}>
            <Stack align="center" gap="xs">
              <Title order={2} ta="center" c="navy.8" fw={900}>
                Everything you need to price with confidence
              </Title>
              <Text c="dimmed" ta="center" size="lg" maw={480}>
                CMA Pro handles the data heavy lifting so you can focus on your clients.
              </Text>
            </Stack>
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <Card
                  key={title}
                  padding="xl"
                  radius="lg"
                  withBorder
                  style={{ borderColor: 'var(--mantine-color-gray-2)' }}
                >
                  <Stack gap="md">
                    <Box
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: 'var(--mantine-color-navy-0)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={24} color="var(--mantine-color-navy-7)" />
                    </Box>
                    <Title order={4} c="navy.8">{title}</Title>
                    <Text c="dimmed" size="sm" lh={1.65}>{description}</Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* ── How It Works ────────────────────────────────────────── */}
      <Box py={80} bg="gray.0">
        <Container size="lg">
          <Stack gap={48}>
            <Stack align="center" gap="xs">
              <Title order={2} ta="center" c="navy.8" fw={900}>
                From address to report in 4 steps
              </Title>
            </Stack>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
              {STEPS.map(({ num, icon: Icon, title, desc }) => (
                <Stack key={num} gap="md" align="flex-start">
                  <Text
                    fw={900}
                    c="navy.2"
                    style={{ fontSize: 28, fontVariantNumeric: 'tabular-nums' }}
                  >
                    {num}
                  </Text>
                  <Box
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: 'var(--mantine-color-navy-8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={26} color="white" />
                  </Box>
                  <Title order={5} c="navy.8">{title}</Title>
                  <Text c="dimmed" size="sm" lh={1.65}>{desc}</Text>
                </Stack>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* ── Simulator ───────────────────────────────────────────── */}
      <Box id="simulator" py={80} bg="white">
        <Container size="sm">
          <Stack gap={40}>
            <Stack align="center" gap="xs">
              <Badge color="navy" variant="light" size="lg" radius="xl">Interactive Demo</Badge>
              <Title order={2} ta="center" c="navy.8" fw={900}>
                Try it now — no account needed
              </Title>
              <Text c="dimmed" ta="center" size="lg" maw={420}>
                Enter a subject property to preview what your CMA report will look like.
              </Text>
            </Stack>

            <Card
              padding="xl"
              radius="xl"
              withBorder
              shadow="sm"
              style={{ borderColor: 'var(--mantine-color-gray-2)' }}
            >
              {stage === 'idle' ? (
                <form onSubmit={form.onSubmit(() => setStage('previewing'))}>
                  <Stack gap="md">
                    <Title order={4} c="navy.8">Subject Property</Title>
                    <TextInput
                      label="Street Address"
                      placeholder="123 Main Street"
                      required
                      {...form.getInputProps('address')}
                    />
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      <TextInput
                        label="City"
                        placeholder="Los Angeles"
                        required
                        {...form.getInputProps('city')}
                      />
                      <TextInput
                        label="State"
                        placeholder="CA"
                        required
                        {...form.getInputProps('state')}
                      />
                    </SimpleGrid>
                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                      <TextInput
                        label="ZIP Code"
                        placeholder="90210"
                        required
                        {...form.getInputProps('zip')}
                      />
                      <Select
                        label="Beds"
                        placeholder="3"
                        required
                        data={['1', '2', '3', '4', '5', '6+']}
                        {...form.getInputProps('beds')}
                      />
                      <Select
                        label="Baths"
                        placeholder="2"
                        required
                        data={['1', '1.5', '2', '2.5', '3', '4+']}
                        {...form.getInputProps('baths')}
                      />
                    </SimpleGrid>
                    <NumberInput
                      label="Square Footage"
                      placeholder="1500"
                      required
                      min={100}
                      max={20000}
                      {...form.getInputProps('sqft')}
                    />
                    <Button
                      type="submit"
                      color="navy"
                      size="lg"
                      mt="xs"
                      rightSection={<IconArrowRight size={18} />}
                    >
                      Preview My CMA Report
                    </Button>
                  </Stack>
                </form>
              ) : (
                <Stack gap="md">
                  <Group justify="space-between" align="center">
                    <Title order={4} c="navy.8">CMA Report Preview</Title>
                    <Anchor
                      size="sm"
                      c="dimmed"
                      onClick={() => setStage('idle')}
                      style={{ cursor: 'pointer' }}
                    >
                      Start over
                    </Anchor>
                  </Group>

                  {/* Blurred mock report + signup overlay */}
                  <Box
                    style={{
                      position: 'relative',
                      borderRadius: 12,
                      overflow: 'hidden',
                      minHeight: 360,
                    }}
                  >
                    {/* Blurred content */}
                    <Box
                      style={{ filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none' }}
                    >
                      <Stack gap="sm" p="md">
                        <Text fw={700} c="navy.8" size="sm">Comparable Sales</Text>
                        {MOCK_COMPS.map((comp) => (
                          <Card key={comp.address} withBorder padding="sm" radius="md">
                            <Group justify="space-between">
                              <Stack gap={2}>
                                <Text fw={600} size="sm">{comp.address}</Text>
                                <Text size="xs" c="dimmed">
                                  {comp.city} &bull; {comp.sqft.toLocaleString()} sqft &bull; {comp.dom} days
                                </Text>
                              </Stack>
                              <Text fw={700} c="navy.7">${comp.price.toLocaleString()}</Text>
                            </Group>
                          </Card>
                        ))}
                        <Divider my="xs" />
                        <Group justify="space-between">
                          <Text fw={700} size="sm">Average Sale Price</Text>
                          <Text fw={900} size="lg" c="navy.8">$485,167</Text>
                        </Group>
                        <Group justify="space-between">
                          <Text fw={700} size="sm">Suggested Range</Text>
                          <Text fw={700} size="sm" c="navy.6">$470,612 – $499,722</Text>
                        </Group>
                        <Group justify="space-between">
                          <Text fw={700} size="sm">Avg. Days on Market</Text>
                          <Text c="dimmed" size="sm">14.7 days</Text>
                        </Group>
                      </Stack>
                    </Box>

                    {/* Dark overlay */}
                    <Overlay
                      color="var(--mantine-color-navy-9)"
                      backgroundOpacity={0.92}
                      zIndex={5}
                      radius={12}
                    />

                    {/* Overlay content */}
                    <Center
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 10,
                        padding: '32px 16px',
                      }}
                    >
                      <Stack align="center" gap="lg">
                        <Box
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <IconLock size={32} color="white" />
                        </Box>
                        <Stack align="center" gap="xs">
                          <Title order={3} c="white" ta="center">
                            Your CMA Preview is Ready
                          </Title>
                          <Text c="white" ta="center" size="sm" maw={340} style={{ opacity: 0.8 }}>
                            Sign up free to unlock this report with live comparable data,
                            adjustments, and a suggested price range.
                          </Text>
                        </Stack>
                        <Button
                          size="lg"
                          color="gold"
                          component={Link}
                          href="/register"
                          rightSection={<IconArrowRight size={18} />}
                        >
                          Get Started Free
                        </Button>
                        <Text c="white" size="sm" style={{ opacity: 0.65 }}>
                          Already have an account?{' '}
                          <Anchor component={Link} href="/login" c="gold.4" fw={600}>
                            Sign in
                          </Anchor>
                        </Text>
                      </Stack>
                    </Center>
                  </Box>
                </Stack>
              )}
            </Card>
          </Stack>
        </Container>
      </Box>

      {/* ── CTA Banner ──────────────────────────────────────────── */}
      <Box
        py={80}
        style={{ background: 'linear-gradient(135deg, #123451 0%, #2e6aa3 100%)' }}
      >
        <Container size="sm">
          <Stack align="center" gap="xl">
            <Stack align="center" gap="sm">
              <Title order={2} ta="center" c="white" fw={900}>
                Ready to price with confidence?
              </Title>
              <Text c="white" ta="center" size="lg" maw={400} style={{ opacity: 0.8 }}>
                Join agents who close faster with data-backed pricing.
                Free to start, no credit card required.
              </Text>
            </Stack>
            <Button
              size="xl"
              color="gold"
              component={Link}
              href="/register"
              rightSection={<IconArrowRight size={20} />}
            >
              Get Started — It&apos;s Free
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <Box py={40} bg="navy.9">
        <Container size="lg">
          <Group justify="space-between" wrap="wrap" gap="md">
            <Group gap="xs">
              <IconHome size={18} color="var(--mantine-color-navy-3)" />
              <Text c="navy.3" fw={700}>CMA Pro</Text>
            </Group>
            <Text c="navy.4" size="sm">
              © {new Date().getFullYear()} CMA Pro. Built for real estate agents.
            </Text>
            <Group gap="lg">
              <Anchor component={Link} href="/login" c="navy.3" size="sm">Sign In</Anchor>
              <Anchor component={Link} href="/register" c="navy.3" size="sm">Register</Anchor>
            </Group>
          </Group>
        </Container>
      </Box>

    </Box>
  );
}
