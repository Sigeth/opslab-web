import {
  AppShell,
  Badge,
  Button,
  Center,
  Group,
  Loader,
  NavLink,
  Text,
  Title,
} from '@mantine/core';
import { IconLogout, IconTargetArrow } from '@tabler/icons-react';
import { Link, Navigate, Outlet, useRouterState } from '@tanstack/react-router';

import { useEvents, useLogout, useMe, useVersion } from '../api/queries';
import { PROJECT_NAME } from '../project';
import { ColorSchemeToggle } from './ColorSchemeToggle';

const navigation = [{ to: '/', label: 'Challenges', icon: IconTargetArrow }] as const;

/** The frame of every page: header, navigation and content. Signed-out users only see the login page. */
export function AppLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const me = useMe();
  const logout = useLogout();
  const version = useVersion();
  const signedIn = !!me.data;
  useEvents(signedIn);

  const onLogin = pathname === '/login';
  let content = <Outlet />;
  if (me.isPending) {
    content = (
      <Center h={200}>
        <Loader />
      </Center>
    );
  } else if (!signedIn && !onLogin) {
    content = <Navigate to="/login" />;
  }

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{
        width: 220,
        breakpoint: 'sm',
        collapsed: { mobile: !signedIn, desktop: !signedIn },
      }}
      padding="lg"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Title order={3}>{PROJECT_NAME}</Title>
          <Group gap="sm">
            {me.data && (
              <>
                <Badge size="lg" variant="light">
                  {me.data.score} pts
                </Badge>
                <Text size="sm">{me.data.displayName}</Text>
                <Button
                  variant="subtle"
                  size="xs"
                  leftSection={<IconLogout size={14} />}
                  onClick={() => logout.mutate()}
                >
                  Sign out
                </Button>
              </>
            )}
            <ColorSchemeToggle />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm">
        <AppShell.Section grow>
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              component={Link}
              to={to}
              label={label}
              leftSection={<Icon size={18} stroke={1.5} />}
              active={pathname === to || pathname.startsWith('/challenges/')}
            />
          ))}
        </AppShell.Section>
        <AppShell.Section>
          <Text size="xs" c="dimmed">
            {version.data ? `${version.data.name} ${version.data.version}` : ''}
          </Text>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{content}</AppShell.Main>
    </AppShell>
  );
}
