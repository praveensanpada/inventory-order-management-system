import { Alert, Box, Grid, Paper, Stack, Typography } from '@mui/material';
import { Inventory2, People, ReceiptLong, TrendingUp } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../api/dashboardApi';

function Metric({ title, value, icon }) {
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="text.secondary">{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>{value}</Typography>
        </Box>
        {icon}
      </Stack>
    </Paper>
  );
}

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboardSummary });
  const summary = data?.data;

  if (error) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Dashboard</Typography>
        <Typography color="text.secondary">Current operating snapshot.</Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}><Metric title="Products" value={isLoading ? '...' : summary.total_products} icon={<Inventory2 color="primary" />} /></Grid>
        <Grid item xs={12} md={3}><Metric title="Customers" value={isLoading ? '...' : summary.total_customers} icon={<People color="primary" />} /></Grid>
        <Grid item xs={12} md={3}><Metric title="Orders" value={isLoading ? '...' : summary.total_orders} icon={<ReceiptLong color="primary" />} /></Grid>
        <Grid item xs={12} md={3}><Metric title="Inventory Value" value={isLoading ? '...' : `$${summary.total_inventory_value}`} icon={<TrendingUp color="primary" />} /></Grid>
      </Grid>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Low Stock Products</Typography>
        {summary?.low_stock_products?.length ? summary.low_stock_products.map((product) => (
          <Stack key={product.id} direction="row" justifyContent="space-between" sx={{ py: 1, borderBottom: '1px solid #e6e9e8' }}>
            <Typography>{product.name} ({product.sku})</Typography>
            <Typography fontWeight={700}>{product.stock_quantity} left</Typography>
          </Stack>
        )) : <Typography color="text.secondary">No low stock products.</Typography>}
      </Paper>
    </Stack>
  );
}
