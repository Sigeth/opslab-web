import { AppShell, Group, NavLink, Title } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';
import { Link, Outlet, useRouterState } from '@tanstack/react-router';

import { PROJECT_NAME } from '../project';
import { ColorSchemeToggle } from './ColorSchemeToggle';

const navigation = [{ to: '/', label: 'Home', icon: IconHome }] as const;

/** The frame of every page: header, navigation and content. */
export function AppLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <AppShell header={{ height: 56 }} navbar={{ width: 220, breakpoint: 'sm' }} padding="lg">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Title order={3}>{PROJECT_NAME}</Title>
          <ColorSchemeToggle />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm">
        {navigation.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            component={Link}
            to={to}
            label={label}
            leftSection={<Icon size={18} stroke={1.5} />}
            active={pathname === to}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
