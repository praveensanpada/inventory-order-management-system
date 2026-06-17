import { Alert, Button, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { getOrder } from '../api/orderApi';

export default function OrderDetails() {
  const { id } = useParams();
  const { data, error, isLoading } = useQuery({ queryKey: ['order', id], queryFn: () => getOrder(id) });
  const order = data?.data;

  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (isLoading) return <Typography>Loading...</Typography>;

  return (
    <Stack spacing={3}>
      <Button component={Link} to="/orders" startIcon={<ArrowBack />} sx={{ alignSelf: 'flex-start' }}>Back</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Order #{order.id}</Typography>
        <Typography color="text.secondary">{order.customer?.full_name} · ${order.total_amount} · {order.status}</Typography>
      </Paper>
      <Paper sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead><TableRow><TableCell>Product</TableCell><TableCell>Quantity</TableCell><TableCell>Unit Price</TableCell></TableRow></TableHead>
          <TableBody>
            {order.items.map((item) => (
              <TableRow key={item.id}><TableCell>{item.product?.name || item.product_id}</TableCell><TableCell>{item.quantity}</TableCell><TableCell>${item.price_at_purchase}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
