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
        className="hero-bg"
        style={{ position: 'relative', overflow: 'hidden', padding: '108px 0 96px' }}
      >
        {/* Aurora glow — top right */}
        <Box
          style={{
            position: 'absolute', top: -140, right: -140,
            width: 720, height: 720, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(58,125,186,0.32) 0%, transparent 65%)',
            filter: 'blur(90px)', pointerEvents: 'none',
          }}
        />
        {/* Aurora glow — bottom left */}
        <Box
          style={{
            position: 'absolute', bottom: -100, left: -100,
            width: 540, height: 540, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(242,212,31,0.11) 0%, transparent 65%)',
            filter: 'blur(90px)', pointerEvents: 'none',
          }}
        />
        {/* Aurora glow — center */}
        <Box
          style={{
            position: 'absolute', top: '15%', left: '25%',
            width: 640, height: 420, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(36,87,138,0.28) 0%, transparent 70%)',
            filter: 'blur(110px)', pointerEvents: 'none',
          }}
        />

        <Container size="md" style={{ position: 'relative', zIndex: 1 }}>
          <Stack align="center" gap={28}>

            <Badge
              color="gold"
              variant="light"
              size="lg"
              radius="xl"
              className="pop-in delay-0"
              style={{ letterSpacing: '0.04em' }}
            >
              Built for real estate agents
            </Badge>

            <Stack align="center" gap={8} className="fade-up delay-1">
              <Title
                order={1}
                ta="center"
                c="white"
                style={{
                  fontSize: 'clamp(3rem, 7.5vw, 5.2rem)',
                  fontWeight: 900,
                  lineHeight: 1.05,
                  letterSpacing: '-0.02em',
                }}
              >
                Price It Right.
              </Title>
              <Title
                order={1}
                ta="center"
                style={{
                  fontSize: 'clamp(3rem, 7.5vw, 5.2rem)',
                  fontWeight: 900,
                  lineHeight: 1.05,
                  letterSpacing: '-0.02em',
                }}
              >
                <span className="gold-shimmer">Every Time.</span>
              </Title>
            </Stack>

            <Text
              ta="center"
              c="white"
              size="xl"
              maw={520}
              className="fade-up delay-2"
              style={{ opacity: 0.82, lineHeight: 1.65 }}
            >
              Pull live comparable sales, adjust for every difference, and deliver a
              client-ready pricing report — in minutes.
            </Text>

            <Group gap="md" mt={4} className="fade-up delay-3">
              <Button
                size="lg"
                color="gold"
                component={Link}
                href="/register"
                className="cta-glow"
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

            <Group
              gap="xl"
              mt={8}
              className="fade-up delay-4"
              style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 24 }}
            >
              {[
                { icon: IconBolt,  label: '15 live comps per search' },
                { icon: IconCheck, label: '4-step wizard' },
                { icon: IconUsers, label: 'Client-ready reports' },
              ].map(({ icon: Icon, label }) => (
                <Group key={label} gap={8}>
                  <Icon size={15} color="var(--mantine-color-gold-4)" />
                  <Text c="white" size="sm" style={{ opacity: 0.8 }}>{label}</Text>
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
      <Box
        py={88}
        style={{ background: 'linear-gradient(180deg, #eef4f9 0%, #f8fbfd 60%, white 100%)' }}
      >
        <Container size="lg">
          <Stack gap={56}>
            <Stack align="center" gap="sm">
              <Title order={2} ta="center" c="navy.8" fw={900}>
                From address to report in 4 steps
              </Title>
              <Text c="dimmed" ta="center" size="lg" maw={380}>
                No training needed. Fill, fetch, and deliver.
              </Text>
            </Stack>

            {/* ── Desktop: horizontal timeline ── */}
            <Box visibleFrom="md" style={{ position: 'relative' }}>
              {/* Gradient connector line */}
              <Box
                style={{
                  position: 'absolute',
                  top: 40,
                  left: 'calc(12.5% + 4px)',
                  right: 'calc(12.5% + 4px)',
                  height: 2,
                  background: 'linear-gradient(90deg, #123451 0%, #3a7dba 100%)',
                  zIndex: 0,
                }}
              />

              <Box style={{ display: 'flex' }}>
                {STEPS.map(({ num, icon: Icon, title, desc }, i) => {
                  const circleBg = ['#123451', '#1b4f72', '#24578a', '#2e6aa3'][i];
                  return (
                    <Stack key={num} align="center" gap="xl" style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                      {/* Icon circle — sits on the line */}
                      <Box
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          background: circleBg,
                          border: '5px solid white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 6px 20px rgba(18,52,81,0.22)',
                        }}
                      >
                        <Icon size={32} color="white" />
                      </Box>

                      {/* Content card */}
                      <Card
                        padding="lg"
                        radius="xl"
                        style={{
                          width: '88%',
                          background: 'white',
                          boxShadow: '0 2px 20px rgba(18,52,81,0.07)',
                          border: '1px solid rgba(18,52,81,0.06)',
                        }}
                      >
                        <Stack align="center" gap="xs" ta="center">
                          <Text
                            fw={800}
                            size="xs"
                            c="navy.5"
                            style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}
                          >
                            Step {num}
                          </Text>
                          <Title order={5} c="navy.8">{title}</Title>
                          <Text c="dimmed" size="sm" lh={1.65}>{desc}</Text>
                        </Stack>
                      </Card>
                    </Stack>
                  );
                })}
              </Box>
            </Box>

            {/* ── Mobile: vertical timeline ── */}
            <Stack hiddenFrom="md" gap={0}>
              {STEPS.map(({ num, icon: Icon, title, desc }, i) => {
                const circleBg = ['#123451', '#1b4f72', '#24578a', '#2e6aa3'][i];
                return (
                  <Box key={num} style={{ display: 'flex', gap: 20 }}>
                    {/* Left: circle + connector */}
                    <Stack align="center" gap={0} style={{ flexShrink: 0 }}>
                      <Box
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          background: circleBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(18,52,81,0.2)',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={24} color="white" />
                      </Box>
                      {i < STEPS.length - 1 && (
                        <Box
                          style={{
                            width: 2,
                            flex: 1,
                            minHeight: 40,
                            margin: '6px 0',
                            background: 'linear-gradient(180deg, #1b4f72, #5690c4)',
                          }}
                        />
                      )}
                    </Stack>

                    {/* Right: content */}
                    <Stack
                      gap={4}
                      style={{ paddingTop: 14, paddingBottom: i < STEPS.length - 1 ? 36 : 0 }}
                    >
                      <Text
                        fw={800}
                        size="xs"
                        c="navy.5"
                        style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}
                      >
                        Step {num}
                      </Text>
                      <Title order={5} c="navy.8">{title}</Title>
                      <Text c="dimmed" size="sm" lh={1.65}>{desc}</Text>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>

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
