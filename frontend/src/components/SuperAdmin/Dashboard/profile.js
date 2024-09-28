import React, { useEffect, useState } from 'react';
import { TextField, Container, Grid, Typography, Paper } from '@mui/material';
import Cookies from 'js-cookie';
import apiService from '../../../apiService';
const UserDetails = () => {
    const SAid = Cookies.get('SAid');
    const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiService.get(`/api/SA_details/${SAid}`);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUser();
  }, [SAid]);

  if (!SAid) {
    return <Typography variant="h6">Failed to fetch Data </Typography>;
  }

  return (
    <Container component={Paper} elevation={3} sx={{ padding: 4, marginTop: 4 }}>
      <Typography variant="h5" gutterBottom>
        User Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Name"
            value={user.name || ''}
            InputProps={{
              readOnly: true,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Username"
            value={user.username || ''}
            InputProps={{
              readOnly: true,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={user.email || ''}
            InputProps={{
              readOnly: true,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={user.password || ''}
            InputProps={{
              readOnly: true,
            }}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserDetails;
