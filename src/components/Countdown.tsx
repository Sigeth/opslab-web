import { Text } from '@mantine/core';
import { useInterval } from '@mantine/hooks';
import { useState } from 'react';

function format(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** Time left until `until`, refreshed every second. */
export function Countdown({ until }: { until: string }) {
  const [now, setNow] = useState(() => Date.now());
  useInterval(() => setNow(Date.now()), 1000, { autoInvoke: true });
  const left = new Date(until).getTime() - now;

  return (
    <Text size="sm" c={left < 5 * 60_000 ? 'red' : 'dimmed'} ff="monospace">
      {format(left)} left
    </Text>
  );
}
