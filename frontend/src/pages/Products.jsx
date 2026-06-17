import { useState } from 'react';
import { Alert, Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../api/productApi';
import StatusAlert from '../components/common/StatusAlert';

export default function Products() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const { data, error } = useQuery({ queryKey: ['products'], queryFn: getProducts });
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const saveMutation = useMutation({
    mutationFn: (values) => editing ? updateProduct(editing.id, values) : createProduct(values),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); setOpen(false); setNotice('Product saved'); }
  });
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); setNotice('Product deleted'); }
  });

  const startCreate = () => { setEditing(null); reset({ name: '', sku: '', price: '', stock_quantity: '' }); setOpen(true); };
  const startEdit = (product) => { setEditing(product); reset(product); setOpen(true); };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box><Typography variant="h4" sx={{ fontWeight: 800 }}>Products</Typography><Typography color="text.secondary">Manage SKU, pricing, and stock.</Typography></Box>
        <Button variant="contained" startIcon={<Add />} onClick={startCreate}>Add Product</Button>
      </Stack>
      {error && <Alert severity="error">{error.message}</Alert>}
      <Paper sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead><TableRow><TableCell>Name</TableCell><TableCell>SKU</TableCell><TableCell>Price</TableCell><TableCell>Stock</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
          <TableBody>
            {(data?.data || []).map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell><TableCell>{product.sku}</TableCell><TableCell>${product.price}</TableCell><TableCell>{product.stock_quantity}</TableCell>
                <TableCell align="right">
                  <IconButton aria-label="edit product" onClick={() => startEdit(product)}><Edit /></IconButton>
                  <IconButton aria-label="delete product" color="error" onClick={() => deleteMutation.mutate(product.id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Update Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <Stack component="form" spacing={2} sx={{ mt: 1 }} onSubmit={handleSubmit((values) => saveMutation.mutate({ ...values, price: Number(values.price), stock_quantity: Number(values.stock_quantity) }))}>
            <TextField label="Product name" {...register('name', { required: 'Name is required' })} error={Boolean(errors.name)} helperText={errors.name?.message} />
            <TextField label="SKU/code" {...register('sku', { required: 'SKU is required' })} error={Boolean(errors.sku)} helperText={errors.sku?.message} />
            <TextField label="Price" type="number" inputProps={{ step: '0.01', min: 0 }} {...register('price', { required: 'Price is required', min: 0 })} />
            <TextField label="Quantity in stock" type="number" inputProps={{ min: 0 }} {...register('stock_quantity', { required: 'Stock is required', min: 0 })} />
            {saveMutation.error && <Alert severity="error">{saveMutation.error.message}</Alert>}
            <Button type="submit" variant="contained">Save</Button>
          </Stack>
        </DialogContent>
      </Dialog>
      <StatusAlert message={notice} onClose={() => setNotice('')} />
    </Stack>
  );
}
