'use client';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  ListItemButton,
  Box,
  Toolbar,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Layout, 
  ListChecks, 
  FileUp, 
  ClipboardList, 
  BookOpen,
  Settings
} from 'lucide-react';

const drawerWidth = 240;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.paper,
    boxShadow: '1px 0px 5px rgba(0,0,0,0.05)',
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: '0 25px 25px 0',
  margin: '4px 8px 4px 0',
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.light + '20',
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.light + '30',
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    borderRadius: '0 25px 25px 0',
  },
}));

type NavigationItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const navigationItems: NavigationItem[] = [
  { label: 'All Demos', href: '/demos', icon: <Layout size={20} /> },
  { label: 'Request Demo', href: '/demos/request', icon: <ClipboardList size={20} /> },
  { label: 'Demo Status', href: '/demos/status', icon: <ListChecks size={20} /> },
  { label: 'Submit Demo', href: '/demos/submit', icon: <FileUp size={20} /> },
  { label: 'How to Demo', href: '/how-to-demo', icon: <BookOpen size={20} /> },
  { label: 'Admin', href: '/admin', icon: <Settings size={20} /> },
];

export default function LeftNavDrawer() {
  const pathname = usePathname();

  return (
    <StyledDrawer
      variant="permanent"
      anchor="left"
    >
      <Toolbar /> {/* This creates space for the AppBar */}
      <Divider />
      <Box sx={{ overflow: 'auto', height: '100%', mt: 2 }}>
        <List>
          {navigationItems.map((item) => (
            <ListItem key={item.href} disablePadding>
              <NextLink href={item.href} passHref style={{ textDecoration: 'none', width: '100%', color: 'inherit' }}>
                <StyledListItemButton
                  selected={pathname === item.href}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{ 
                      fontWeight: pathname === item.href ? 600 : 400,
                    }}
                  />
                </StyledListItemButton>
              </NextLink>
            </ListItem>
          ))}
        </List>
      </Box>
    </StyledDrawer>
  );
} 