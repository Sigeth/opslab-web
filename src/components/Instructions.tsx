import { Typography } from '@mantine/core';
import Markdown from 'react-markdown';

/** Challenge instructions, written by the author in markdown. Raw HTML is not rendered. */
export function Instructions({ markdown }: { markdown: string }) {
  return (
    <Typography>
      <Markdown>{markdown}</Markdown>
    </Typography>
  );
}
