import { Button } from '@mantine/core';
import { Link } from '@tanstack/react-router';

import { PageHeader } from '../components/PageHeader';

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="Page not found" description="This page does not exist." />
      <Button component={Link} to="/">
        Back home
      </Button>
    </>
  );
}
