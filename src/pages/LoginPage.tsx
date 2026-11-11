import { Alert, Button, Card, Center, PasswordInput, Stack, TextInput } from '@mantine/core';
import { Navigate, useNavigate } from '@tanstack/react-router';
import { type FormEvent, useState } from 'react';

import { useLogin, useMe } from '../api/queries';
import { PageHeader } from '../components/PageHeader';
import { PROJECT_NAME } from '../project';

export function LoginPage() {
  const me = useMe();
  const login = useLogin();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (me.data) {
    return <Navigate to="/" />;
  }

  const submit = (event: FormEvent) => {
    event.preventDefault();
    login.mutate(
      { username: username.trim(), password },
      { onSuccess: () => void navigate({ to: '/' }) },
    );
  };

  return (
    <Center>
      <Card withBorder w={380} padding="xl">
        <PageHeader title={`Sign in to ${PROJECT_NAME}`} />
        <form onSubmit={submit}>
          <Stack>
            <TextInput
              label="Username"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
            />
            <PasswordInput
              label="Password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
            {login.isError && (
              <Alert color="red">
                {login.error.message === 'sign in first'
                  ? 'Wrong username or password.'
                  : login.error.message}
              </Alert>
            )}
            <Button type="submit" loading={login.isPending}>
              Sign in
            </Button>
          </Stack>
        </form>
      </Card>
    </Center>
  );
}
