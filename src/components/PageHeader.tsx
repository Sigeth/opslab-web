import { Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
}

/** Title block at the top of every page. */
export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <Stack gap={4} mb="lg">
      <Title order={2}>{title}</Title>
      {description && <Text c="dimmed">{description}</Text>}
    </Stack>
  );
}
