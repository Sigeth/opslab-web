import { Alert, Card, Grid, Group, Skeleton, Stack, Tabs, Text, Title } from '@mantine/core';
import { useParams } from '@tanstack/react-router';

import { useChallenge, useInstances, useLatestCheck } from '../api/queries';
import { CategoryBadge, DifficultyBadge } from '../components/Badges';
import { CheckButton } from '../components/CheckButton';
import { InstancePanel } from '../components/InstancePanel';
import { Instructions } from '../components/Instructions';
import { PageHeader } from '../components/PageHeader';
import { TaskList } from '../components/TaskList';
import { TerminalPanel } from '../components/TerminalPanel';

export function ChallengePage() {
  const { name } = useParams({ from: '/challenges/$name' });
  const challenge = useChallenge(name);
  const instances = useInstances();
  const instance = instances.data?.find((i) => i.challenge === name);
  const other = instances.data?.find((i) => i.challenge !== name);
  const check = useLatestCheck(instance?.phase === 'Ready' ? instance.id : undefined);

  if (challenge.isPending) {
    return <Skeleton h={300} />;
  }
  if (challenge.isError) {
    return <Alert color="red">{challenge.error.message}</Alert>;
  }
  const c = challenge.data;
  const ready = instance?.phase === 'Ready';

  return (
    <>
      <PageHeader
        title={c.title}
        description={
          <Group gap="xs" component="span">
            <CategoryBadge category={c.category} />
            <DifficultyBadge difficulty={c.difficulty} />
            <Text span size="sm" c="dimmed">
              {c.solvedPoints}/{c.points} pts
            </Text>
          </Group>
        }
      />
      <Grid gap="lg">
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack>
            <Card withBorder>
              {c.instructions ? (
                <Instructions markdown={c.instructions} />
              ) : (
                <Text>{c.summary}</Text>
              )}
            </Card>
            <Card withBorder>
              <Title order={4} mb="sm">
                Tasks
              </Title>
              <TaskList tasks={c.taskList} check={check.data} />
            </Card>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack>
            <InstancePanel challenge={name} instance={instance} other={other} />
            {ready && instance && (
              <>
                <Tabs defaultValue={c.terminals[0]?.machine} keepMounted>
                  <Tabs.List>
                    {c.terminals.map((t) => (
                      <Tabs.Tab key={t.machine} value={t.machine}>
                        {t.label}
                      </Tabs.Tab>
                    ))}
                  </Tabs.List>
                  {c.terminals.map((t) => (
                    <Tabs.Panel key={t.machine} value={t.machine} pt="xs">
                      <TerminalPanel instance={instance.id} machine={t.machine} />
                    </Tabs.Panel>
                  ))}
                </Tabs>
                <CheckButton instance={instance.id} latest={check.data} />
              </>
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    </>
  );
}
