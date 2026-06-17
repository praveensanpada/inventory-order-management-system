import { Alert, Box, Grid, Paper, Stack, Typography } from '@mui/material';
import { Inventory2, People, ReceiptLong, TrendingUp } from '@mui/icons-material';
import { useQueries } from '@tanstack/react-query';
import { getProducts } from '../api/productApi';
import { getCustomers } from '../api/customerApi';
import { getOrders } from '../api/orderApi';

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
  const [productsQuery, customersQuery, ordersQuery] = useQueries({
    queries: [
      { queryKey: ['products'], queryFn: getProducts },
      { queryKey: ['customers'], queryFn: getCustomers },
      { queryKey: ['orders'], queryFn: getOrders }
    ]
  });
  const isLoading = productsQuery.isLoading || customersQuery.isLoading || ordersQuery.isLoading;
  const error = productsQuery.error || customersQuery.error || ordersQuery.error;
  const products = productsQuery.data?.data || [];
  const customers = customersQuery.data?.data || [];
  const orders = ordersQuery.data?.data || [];
  const summary = {
    total_products: products.length,
    total_customers: customers.length,
    total_orders: orders.length,
    low_stock_products: products.filter((product) => Number(product.stock_quantity) <= 5),
    total_inventory_value: products.reduce((total, product) => total + Number(product.price || 0) * Number(product.stock_quantity || 0), 0)
  };

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
        <Grid item xs={12} md={3}><Metric title="Inventory Value" value={isLoading ? '...' : `$${summary.total_inventory_value.toFixed(2)}`} icon={<TrendingUp color="primary" />} /></Grid>
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
