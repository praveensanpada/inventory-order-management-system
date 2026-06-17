import { Alert, Snackbar } from '@mui/material';

export default function StatusAlert({ message, severity = 'success', onClose }) {
  return (
    <Snackbar open={Boolean(message)} autoHideDuration={4000} onClose={onClose}>
      <Alert severity={severity} variant="filled" onClose={onClose}>{message}</Alert>
    </Snackbar>
  );
}
