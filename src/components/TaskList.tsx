import { Badge, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconCheck, IconCircleDashed, IconX } from '@tabler/icons-react';

import type { ChallengeDetail, CheckRun } from '../api/queries';

interface TaskListProps {
  tasks: ChallengeDetail['taskList'];
  /** Results of the latest check, shown under each task. */
  check?: CheckRun | null;
}

/** The tasks of a challenge with their points and status. */
export function TaskList({ tasks, check }: TaskListProps) {
  return (
    <Stack gap="sm">
      {tasks.map((task) => {
        const result = check?.results.find((r) => r.task === task.id);
        const icon = task.solved ? (
          <ThemeIcon color="teal" radius="xl" size="sm">
            <IconCheck size={14} />
          </ThemeIcon>
        ) : result && !result.passed ? (
          <ThemeIcon color="red" radius="xl" size="sm" variant="light">
            <IconX size={14} />
          </ThemeIcon>
        ) : (
          <ThemeIcon color="gray" radius="xl" size="sm" variant="light">
            <IconCircleDashed size={14} />
          </ThemeIcon>
        );
        return (
          <Group key={task.id} wrap="nowrap" align="flex-start" gap="sm">
            {icon}
            <Stack gap={2} flex={1}>
              <Group justify="space-between" wrap="nowrap">
                <Text size="sm" fw={500}>
                  {task.title}
                </Text>
                <Badge variant="default">{task.points} pts</Badge>
              </Group>
              {result?.message && (
                <Text size="xs" c={result.passed ? 'teal' : 'dimmed'}>
                  {result.message}
                </Text>
              )}
            </Stack>
          </Group>
        );
      })}
    </Stack>
  );
}
