'use client';
import AppBarMUI from '@mui/material/AppBar';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import NextImage from 'next/image';
import Link from 'next/link';
import { Box, Typography } from '@mui/material';

export default function AppBar() {
  return (
    <AppBarMUI
      position='fixed'
      sx={{
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
      elevation={0}
    >
      <Toolbar>
        <Stack
          direction='row'
          spacing={2}
          alignItems='center'
          sx={{ width: '100%' }}
        >
          <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <NextImage
              src='/inv-workplace.svg'
              alt='Invisible Workplace'
              width={180}
              height={36}
              priority
            />
          </Link>
          
          <Box sx={{ flexGrow: 1 }} />
          

        </Stack>
      </Toolbar>
    </AppBarMUI>
  );
} 