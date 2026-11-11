import { Alert, SimpleGrid, Skeleton } from '@mantine/core';

import { useChallenges } from '../api/queries';
import { ChallengeCard } from '../components/ChallengeCard';
import { PageHeader } from '../components/PageHeader';

export function CatalogPage() {
  const challenges = useChallenges();

  return (
    <>
      <PageHeader
        title="Challenges"
        description="Hands-on DevOps security challenges: Linux hardening, containers and Kubernetes."
      />
      {challenges.isError && <Alert color="red">{challenges.error.message}</Alert>}
      {challenges.isSuccess && challenges.data.length === 0 && (
        <Alert color="gray" title="No challenge installed">
          Ask your administrator to install challenges.
        </Alert>
      )}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {challenges.isPending && [1, 2, 3].map((i) => <Skeleton key={i} h={240} />)}
        {challenges.data?.map((c) => (
          <ChallengeCard key={c.name} challenge={c} />
        ))}
      </SimpleGrid>
    </>
  );
}
