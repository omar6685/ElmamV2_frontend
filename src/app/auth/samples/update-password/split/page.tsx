import * as React from 'react';
import type { Metadata } from 'next';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';

import { config } from '@/config';
import { paths } from '@/paths';
import { SplitLayout } from '@/components/auth/split-layout';
import { DynamicLogo } from '@/components/core/logo';

export const metadata = { title: `Update password | Samples | Auth | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <SplitLayout>
      <Stack spacing={4}>
        <div>
          <Link
            color="text.primary"
            component={RouterLink}
            href={paths.dashboard.overview}
            sx={{ alignItems: 'center', display: 'inline-flex', gap: 1 }}
            variant="subtitle2"
          >
            <ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />
            Dashboard
          </Link>
        </div>
        <div>
          <Box component={RouterLink} href={paths.home} sx={{ display: 'inline-block', fontSize: 0 }}>
            <DynamicLogo colorDark="light" colorLight="dark" height={40} width={65} />
          </Box>
        </div>
        <Typography variant="h5">Update Password</Typography>
        <Stack spacing={2}>
          <FormControl>
            <InputLabel>Password</InputLabel>
            <OutlinedInput name="password" type="password" />
          </FormControl>
          <FormControl>
            <InputLabel>Confirm password</InputLabel>
            <OutlinedInput name="confirmPassword" type="password" />
          </FormControl>
          <Button type="submit" variant="contained">
            Update
          </Button>
        </Stack>
      </Stack>
    </SplitLayout>
  );
}