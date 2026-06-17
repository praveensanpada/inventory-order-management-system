import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { Dashboard, Inventory2, People, ReceiptLong, Logout } from '@mui/icons-material';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/', label: 'Dashboard', icon: <Dashboard fontSize="small" /> },
  { to: '/products', label: 'Products', icon: <Inventory2 fontSize="small" /> },
  { to: '/customers', label: 'Customers', icon: <People fontSize="small" /> },
  { to: '/orders', label: 'Orders', icon: <ReceiptLong fontSize="small" /> }
];

export default function AppLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="inherit" elevation={1}>
        <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, flexGrow: 1 }}>Ethara Inventory</Typography>
          {links.map((link) => (
            <Button
              key={link.to}
              component={NavLink}
              to={link.to}
              startIcon={link.icon}
              sx={{ color: 'text.primary', '&.active': { bgcolor: 'primary.main', color: 'white' } }}
            >
              {link.label}
            </Button>
          ))}
          <Button startIcon={<Logout />} color="secondary" onClick={() => { logout(); navigate('/login'); }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
