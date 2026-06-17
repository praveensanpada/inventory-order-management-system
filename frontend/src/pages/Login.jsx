import { useState } from 'react';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { LockOpen } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatusAlert from '../components/common/StatusAlert';
import { hashPassword } from '../services/crypto';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { email: '', password: '' }
  });

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit = async (values) => {
    try {
      await login({ email: values.email, password_hash: await hashPassword(values.password) });
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, bgcolor: 'background.default' }}>
      <Paper sx={{ width: '100%', maxWidth: 420, p: 4 }}>
        <Stack spacing={3} component="form" onSubmit={handleSubmit(onSubmit)}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Inventory Login</Typography>
            <Typography color="text.secondary">Admin workspace for products, customers, and orders.</Typography>
          </Box>
          <TextField label="Email" {...register('email', { required: 'Email is required' })} error={Boolean(errors.email)} helperText={errors.email?.message} />
          <TextField label="Password" type="password" {...register('password', { required: 'Password is required' })} error={Boolean(errors.password)} helperText={errors.password?.message} />
          <Button type="submit" variant="contained" size="large" startIcon={<LockOpen />} disabled={isSubmitting}>
            Sign in
          </Button>
        </Stack>
      </Paper>
      <StatusAlert message={error} severity="error" onClose={() => setError('')} />
    </Box>
  );
}
