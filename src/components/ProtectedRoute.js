import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ component: Component, requiredAdmin, noAuthentication, ...rest }) => {
  const user = JSON.parse(localStorage.getItem('user')); 

  if (noAuthentication && user) {
    return <Navigate to="/" />;
  }

  if (requiredAdmin && (!user || !user.isAdmin)) {
    return <Navigate to="/unauthorized" />;
  }

  if (!user && !noAuthentication) {
    return <Navigate to="/login" />;
  }

  return <Component {...rest} />;
};

export default ProtectedRoute;
