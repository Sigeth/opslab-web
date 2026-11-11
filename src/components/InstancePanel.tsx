import { Alert, Button, Card, Group, Loader, Modal, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlayerPlay, IconPlayerStop } from '@tabler/icons-react';

import { type Instance, useStartInstance, useStopInstance } from '../api/queries';
import { PhaseBadge } from './Badges';
import { Countdown } from './Countdown';

interface InstancePanelProps {
  challenge: string;
  /** The user's active instance of this challenge, if any. */
  instance?: Instance;
  /** The user's active instance of another challenge, if any. */
  other?: Instance;
}

/** Starts, shows and stops the environment of a challenge. */
export function InstancePanel({ challenge, instance, other }: InstancePanelProps) {
  const start = useStartInstance();
  const stop = useStopInstance();
  const [confirming, confirm] = useDisclosure(false);

  if (!instance) {
    return (
      <Card withBorder>
        <Stack gap="sm">
          <Text size="sm">
            Start an environment to work on this challenge. It is yours alone and is deleted when it
            expires or when you stop it.
          </Text>
          {other && (
            <Alert color="yellow">
              Stop your instance of {other.challenge} first: one environment runs at a time.
            </Alert>
          )}
          {start.isError && <Alert color="red">{start.error.message}</Alert>}
          <Group>
            <Button
              leftSection={<IconPlayerPlay size={16} />}
              loading={start.isPending}
              disabled={!!other}
              onClick={() => start.mutate(challenge)}
            >
              Start
            </Button>
          </Group>
        </Stack>
      </Card>
    );
  }

  const busy = instance.phase === 'Queued' || instance.phase === 'Provisioning';
  return (
    <Card withBorder>
      <Group justify="space-between">
        <Group gap="sm">
          <PhaseBadge phase={instance.phase} />
          {busy && <Loader size="xs" />}
          {instance.expiresAt && instance.phase === 'Ready' && (
            <Countdown until={instance.expiresAt} />
          )}
        </Group>
        <Button
          color="red"
          variant="light"
          leftSection={<IconPlayerStop size={16} />}
          disabled={instance.phase === 'Stopping'}
          onClick={confirm.open}
        >
          Stop
        </Button>
      </Group>
      {instance.message && (
        <Text size="sm" c="dimmed" mt="xs">
          {instance.message}
        </Text>
      )}
      <Modal opened={confirming} onClose={confirm.close} title="Stop the environment?">
        <Stack>
          <Text size="sm">
            Everything in the environment is deleted. Your solved tasks and points are kept.
          </Text>
          {stop.isError && <Alert color="red">{stop.error.message}</Alert>}
          <Group justify="flex-end">
            <Button variant="default" onClick={confirm.close}>
              Cancel
            </Button>
            <Button
              color="red"
              loading={stop.isPending}
              onClick={() => stop.mutate(instance.id, { onSuccess: confirm.close })}
            >
              Stop and delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Card>
  );
}
