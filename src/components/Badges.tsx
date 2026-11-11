import { Badge } from '@mantine/core';

import type { Instance } from '../api/queries';

const difficultyColors: Record<string, string> = {
  easy: 'teal',
  medium: 'yellow',
  hard: 'orange',
  insane: 'red',
};

const categoryLabels: Record<string, string> = {
  'linux-hardening': 'Linux hardening',
  containers: 'Containers',
  kubernetes: 'Kubernetes',
};

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return (
    <Badge variant="light" color={difficultyColors[difficulty] ?? 'gray'}>
      {difficulty}
    </Badge>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  return <Badge variant="outline">{categoryLabels[category] ?? category}</Badge>;
}

const phaseColors: Record<Instance['phase'], string> = {
  Queued: 'gray',
  Provisioning: 'blue',
  Ready: 'teal',
  Expired: 'gray',
  Failed: 'red',
  Stopping: 'orange',
};

export function PhaseBadge({ phase }: { phase: Instance['phase'] }) {
  return (
    <Badge color={phaseColors[phase]} variant="light">
      {phase}
    </Badge>
  );
}
