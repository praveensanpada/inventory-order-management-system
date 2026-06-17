import { useState } from 'react';
import { Alert, Box, Button, Dialog, DialogContent, DialogTitle, IconButton, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { Add, Delete, Visibility } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { getCustomers } from '../api/customerApi';
import { getProducts } from '../api/productApi';
import { createOrder, deleteOrder, getOrders } from '../api/orderApi';
import StatusAlert from '../components/common/StatusAlert';

export default function Orders() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const { data, error } = useQuery({ queryKey: ['orders'], queryFn: getOrders });
  const customers = useQuery({ queryKey: ['customers'], queryFn: getCustomers });
  const products = useQuery({ queryKey: ['products'], queryFn: getProducts });
  const { register, handleSubmit, reset, watch, setError, clearErrors, formState: { errors } } = useForm();
  const selectedProductId = Number(watch('product_id'));
  const selectedQuantity = Number(watch('quantity') || 0);
  const selectedProduct = (products.data?.data || []).find((product) => product.id === selectedProductId);
  const stockError = selectedProduct && selectedQuantity > selectedProduct.stock_quantity
    ? `Only ${selectedProduct.stock_quantity} left`
    : '';
  const createMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['orders'] }); queryClient.invalidateQueries({ queryKey: ['products'] }); setOpen(false); setNotice('Order created'); }
  });
  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['orders'] }); setNotice('Order deleted'); }
  });

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box><Typography variant="h4" sx={{ fontWeight: 800 }}>Orders</Typography><Typography color="text.secondary">Create and inspect customer orders.</Typography></Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => { reset({ customer_id: '', product_id: '', quantity: 1 }); clearErrors(); setOpen(true); }}>Create Order</Button>
      </Stack>
      {error && <Alert severity="error">{error.message}</Alert>}
      <Paper sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Customer</TableCell><TableCell>Total</TableCell><TableCell>Status</TableCell><TableCell>Created</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
          <TableBody>
            {(data?.data || []).map((order) => (
              <TableRow key={order.id}>
                <TableCell>#{order.id}</TableCell><TableCell>{order.customer?.full_name || order.customer_id}</TableCell><TableCell>${order.total_amount}</TableCell><TableCell>{order.status}</TableCell><TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <IconButton component={Link} to={`/orders/${order.id}`}><Visibility /></IconButton>
                  <IconButton color="error" onClick={() => deleteMutation.mutate(order.id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Order</DialogTitle>
        <DialogContent>
          <Stack
            component="form"
            spacing={2}
            sx={{ mt: 1 }}
            onSubmit={handleSubmit((values) => {
              const product = (products.data?.data || []).find((item) => item.id === Number(values.product_id));
              const quantity = Number(values.quantity);
              if (product && quantity > product.stock_quantity) {
                setError('quantity', { type: 'manual', message: `Only ${product.stock_quantity} left` });
                return;
              }
              createMutation.mutate({
                customer_id: Number(values.customer_id),
                items: [{ product_id: Number(values.product_id), quantity }]
              });
            })}
          >
            <TextField select label="Customer" defaultValue="" {...register('customer_id', { required: true })}>
              {(customers.data?.data || []).map((customer) => <MenuItem key={customer.id} value={customer.id}>{customer.full_name}</MenuItem>)}
            </TextField>
            <TextField select label="Product" defaultValue="" {...register('product_id', { required: true })}>
              {(products.data?.data || []).map((product) => <MenuItem key={product.id} value={product.id}>{product.name} ({product.stock_quantity} left)</MenuItem>)}
            </TextField>
            <TextField
              label="Quantity"
              type="number"
              inputProps={{ min: 1, max: selectedProduct?.stock_quantity }}
              defaultValue={1}
              error={Boolean(errors.quantity || stockError)}
              helperText={errors.quantity?.message || stockError || (selectedProduct ? `${selectedProduct.stock_quantity} available` : '')}
              FormHelperTextProps={{ sx: { color: stockError ? 'error.main' : undefined, fontWeight: stockError ? 700 : 400 } }}
              {...register('quantity', {
                required: 'Quantity is required',
                min: { value: 1, message: 'Quantity must be at least 1' },
                validate: (value) => {
                  const product = (products.data?.data || []).find((item) => item.id === Number(watch('product_id')));
                  return !product || Number(value) <= product.stock_quantity || `Only ${product.stock_quantity} left`;
                }
              })}
            />
            {createMutation.error && <Alert severity="error">{createMutation.error.message}</Alert>}
            {stockError && <Alert severity="error">{stockError}</Alert>}
            <Button type="submit" variant="contained" disabled={Boolean(stockError) || createMutation.isPending}>Create</Button>
          </Stack>
        </DialogContent>
      </Dialog>
      <StatusAlert message={notice} onClose={() => setNotice('')} />
    </Stack>
  );
}
