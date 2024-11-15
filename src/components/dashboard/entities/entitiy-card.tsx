'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Icon } from '@phosphor-icons/react/dist/lib/types';

export interface EntityCardProps {
  icon: Icon;
  title: string;
  description: string;
  soon?: boolean;
}

export function EntityCard({ icon: Icon, title, description, soon }: EntityCardProps): React.JSX.Element {
  return (
      <Card sx={{ position: 'relative' }}>
        <CardContent>
          <Stack direction="row" spacing={3} sx={{ alignItems: 'start' }}>
            {soon && (
              <span className="rounded-bl-[20px] shadow absolute right-0 top-0 py-1 px-3 bg-red-500 text-white font-medium">
                soon...
              </span>
            )}
            <Avatar
              sx={{
                '--Avatar-size': '48px',
                bgcolor: 'var(--mui-palette-background-paper)',
                boxShadow: 'var(--mui-shadows-8)',
                color: 'var(--mui-palette-text-primary)',
              }}
            >
              <Icon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
            <div>
              <Typography variant="h6">{title}</Typography>
            </div>
          </Stack>
        </CardContent>
        <Box sx={{ p: '16px', pt: '2px' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                alignItems: 'center',
                // color: trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)',
                display: 'flex',
                justifyContent: 'center',
              }}
            ></Box>
            <Typography color="text.secondary" variant="body2">
              <Typography component="span" variant="subtitle2">
                {description}
              </Typography>{' '}
            </Typography>
          </Stack>
        </Box>
      </Card>
  );
}
