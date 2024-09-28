import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import apiService from './apiService'; // Make sure to have an API service to call your backend

function PrivateRoute({ role, element }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await apiService.get('/verifySession');
        console.log(response.data);
        if (response.data.user && response.data.user.verified) {

          setIsAuthenticated(true);
          setUserRole(response.data.user.role);
        }
      } catch (error) {
        console.log("Private Route Error :", error);
        setIsAuthenticated(false);
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated && userRole === role) {
    return element;
  } else {
    return <Navigate to="/" />;
  }
}

export default PrivateRoute;
