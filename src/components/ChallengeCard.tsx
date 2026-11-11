import { Badge, Button, Card, Group, Progress, Stack, Text, Title } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

import type { ChallengeSummary } from '../api/queries';
import { CategoryBadge, DifficultyBadge } from './Badges';

/** A challenge in the catalog grid. */
export function ChallengeCard({ challenge }: { challenge: ChallengeSummary }) {
  const progress = challenge.points > 0 ? (100 * challenge.solvedPoints) / challenge.points : 0;
  const done = challenge.tasks > 0 && challenge.solvedTasks === challenge.tasks;

  return (
    <Card withBorder padding="lg">
      <Stack gap="sm" h="100%">
        <Group justify="space-between" wrap="nowrap" align="flex-start">
          <Title order={4}>{challenge.title}</Title>
          {done && <Badge color="teal">Solved</Badge>}
        </Group>
        <Group gap="xs">
          <CategoryBadge category={challenge.category} />
          <DifficultyBadge difficulty={challenge.difficulty} />
          {challenge.estimatedMinutes != null && (
            <Badge variant="default" leftSection={<IconClock size={12} />}>
              {challenge.estimatedMinutes} min
            </Badge>
          )}
        </Group>
        <Text size="sm" c="dimmed" flex={1}>
          {challenge.summary}
        </Text>
        <Stack gap={4}>
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              {challenge.solvedTasks}/{challenge.tasks} tasks
            </Text>
            <Text size="xs" c="dimmed">
              {challenge.solvedPoints}/{challenge.points} pts
            </Text>
          </Group>
          <Progress value={progress} size="sm" />
        </Stack>
        {challenge.runnable ? (
          <Button
            renderRoot={(props) => (
              <Link {...props} to="/challenges/$name" params={{ name: challenge.name }} />
            )}
          >
            Open
          </Button>
        ) : (
          <Text size="xs" c="red">
            Not runnable here: {challenge.unrunnableReason}
          </Text>
        )}
      </Stack>
    </Card>
  );
}
