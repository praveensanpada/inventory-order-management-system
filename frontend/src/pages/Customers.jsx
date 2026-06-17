import { useState } from 'react';
import { Alert, Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { createCustomer, deleteCustomer, getCustomers } from '../api/customerApi';
import StatusAlert from '../components/common/StatusAlert';

export default function Customers() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const { data, error } = useQuery({ queryKey: ['customers'], queryFn: getCustomers });
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); setOpen(false); setNotice('Customer saved'); }
  });
  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); setNotice('Customer deleted'); }
  });

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box><Typography variant="h4" sx={{ fontWeight: 800 }}>Customers</Typography><Typography color="text.secondary">Maintain customer records.</Typography></Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => { reset({ full_name: '', email: '', phone: '' }); setOpen(true); }}>Add Customer</Button>
      </Stack>
      {error && <Alert severity="error">{error.message}</Alert>}
      <Paper sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Phone</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
          <TableBody>
            {(data?.data || []).map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.full_name}</TableCell><TableCell>{customer.email}</TableCell><TableCell>{customer.phone}</TableCell>
                <TableCell align="right"><IconButton color="error" onClick={() => deleteMutation.mutate(customer.id)}><Delete /></IconButton></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Customer</DialogTitle>
        <DialogContent>
          <Stack component="form" spacing={2} sx={{ mt: 1 }} onSubmit={handleSubmit((values) => createMutation.mutate(values))}>
            <TextField label="Full name" {...register('full_name', { required: 'Name is required' })} error={Boolean(errors.full_name)} helperText={errors.full_name?.message} />
            <TextField label="Email" type="email" {...register('email', { required: 'Email is required' })} error={Boolean(errors.email)} helperText={errors.email?.message} />
            <TextField label="Phone" {...register('phone', { required: 'Phone is required' })} error={Boolean(errors.phone)} helperText={errors.phone?.message} />
            {createMutation.error && <Alert severity="error">{createMutation.error.message}</Alert>}
            <Button type="submit" variant="contained">Save</Button>
          </Stack>
        </DialogContent>
      </Dialog>
      <StatusAlert message={notice} onClose={() => setNotice('')} />
    </Stack>
  );
}
