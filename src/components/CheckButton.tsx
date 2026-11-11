import { Alert, Button, Group, Text } from '@mantine/core';
import { IconChecklist } from '@tabler/icons-react';

import { type CheckRun, useStartCheck } from '../api/queries';

interface CheckButtonProps {
  instance: string;
  latest?: CheckRun | null;
}

/** Asks the platform to check every task. Results arrive as events. */
export function CheckButton({ instance, latest }: CheckButtonProps) {
  const start = useStartCheck();
  const running = latest?.phase === 'Pending' || latest?.phase === 'Running';

  return (
    <>
      <Group>
        <Button
          leftSection={<IconChecklist size={16} />}
          loading={start.isPending || running}
          onClick={() => start.mutate(instance)}
        >
          Check my work
        </Button>
        {latest?.phase === 'Completed' && (
          <Text size="sm" c="dimmed">
            {latest.results.filter((r) => r.passed).length}/{latest.results.length} tasks pass
          </Text>
        )}
      </Group>
      {start.isError && (
        <Alert color="red" mt="xs">
          {start.error.message}
        </Alert>
      )}
      {latest?.phase === 'Error' && (
        <Alert color="red" mt="xs" title="The check could not run">
          {latest.message}
        </Alert>
      )}
    </>
  );
}
