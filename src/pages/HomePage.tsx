import { Alert, Badge, Card, Group, Skeleton, Text } from '@mantine/core';

import { useVersion } from '../api/queries';
import { PageHeader } from '../components/PageHeader';

export function HomePage() {
  const version = useVersion();

  return (
    <>
      <PageHeader
        title="Welcome to opslab"
        description="Hands-on DevOps security challenges: Linux hardening, containers and Kubernetes."
      />
      <Card withBorder maw={480}>
        <Group justify="space-between">
          <Text fw={500}>Platform</Text>
          {version.isPending && <Skeleton height={22} width={80} />}
          {version.isSuccess && (
            <Badge variant="light">
              {version.data.name} {version.data.version}
            </Badge>
          )}
        </Group>
        {version.isError && (
          <Alert color="red" mt="md" title="The api is not reachable">
            {version.error.message}
          </Alert>
        )}
      </Card>
    </>
  );
}
