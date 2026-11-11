import '@xterm/xterm/css/xterm.css';

import {
  Alert,
  Box,
  Button,
  Group,
  Paper,
  Text,
  useComputedColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { IconPlugConnected } from '@tabler/icons-react';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import { useEffect, useRef, useState } from 'react';

import { openTerminal } from '../api/queries';

interface TerminalPanelProps {
  instance: string;
  machine: string;
}

type State = { kind: 'connecting' } | { kind: 'open' } | { kind: 'closed'; reason: string };

/**
 * A shell on a machine of an instance, through the gateway. Bytes go both
 * ways as binary WebSocket frames; resizes are JSON text frames.
 */
export function TerminalPanel({ instance, machine }: TerminalPanelProps) {
  const container = useRef<HTMLDivElement>(null);
  const theme = useMantineTheme();
  const scheme = useComputedColorScheme('light');
  const [state, setState] = useState<State>({ kind: 'connecting' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const element = container.current;
    if (!element) {
      return;
    }
    const dark = scheme === 'dark';
    const term = new Terminal({
      cursorBlink: true,
      fontFamily: theme.fontFamilyMonospace,
      fontSize: 14,
      theme: {
        background: dark ? theme.colors.dark[8] : theme.colors.gray[9],
        foreground: theme.colors.gray[0],
        cursor: theme.colors[theme.primaryColor][4],
      },
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(element);
    fit.fit();

    let socket: WebSocket | undefined;
    let disposed = false;
    const encoder = new TextEncoder();
    const sendSize = () => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
      }
    };

    openTerminal(instance, machine)
      .then((url) => {
        if (disposed) {
          return;
        }
        socket = new WebSocket(url);
        socket.binaryType = 'arraybuffer';
        socket.onopen = () => {
          setState({ kind: 'open' });
          sendSize();
          term.focus();
        };
        socket.onmessage = (event) => {
          if (typeof event.data === 'string') {
            const control = JSON.parse(event.data) as { type: string; message?: string };
            if (control.type === 'exit') {
              setState({ kind: 'closed', reason: control.message ?? 'The session ended.' });
            }
            return;
          }
          term.write(new Uint8Array(event.data as ArrayBuffer));
        };
        socket.onclose = () =>
          setState((s) => (s.kind === 'closed' ? s : { kind: 'closed', reason: 'Disconnected.' }));
      })
      .catch((error: Error) => setState({ kind: 'closed', reason: error.message }));

    const input = term.onData((data) => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(encoder.encode(data));
      }
    });
    const resized = term.onResize(sendSize);
    const observer = new ResizeObserver(() => fit.fit());
    observer.observe(element);

    return () => {
      disposed = true;
      observer.disconnect();
      input.dispose();
      resized.dispose();
      socket?.close();
      term.dispose();
    };
  }, [instance, machine, attempt, theme, scheme]);

  const reconnect = () => {
    setState({ kind: 'connecting' });
    setAttempt((n) => n + 1);
  };

  return (
    <Paper withBorder p="xs" bg={scheme === 'dark' ? 'dark.8' : 'gray.9'}>
      <Box ref={container} h={420} />
      {state.kind === 'connecting' && (
        <Text size="xs" c="gray.5" mt="xs">
          Connecting to {machine}…
        </Text>
      )}
      {state.kind === 'closed' && (
        <Alert mt="xs" color="gray" variant="filled" title="Terminal closed">
          <Group justify="space-between">
            <Text size="sm">{state.reason}</Text>
            <Button
              size="xs"
              variant="white"
              leftSection={<IconPlugConnected size={14} />}
              onClick={reconnect}
            >
              Reconnect
            </Button>
          </Group>
        </Alert>
      )}
    </Paper>
  );
}
