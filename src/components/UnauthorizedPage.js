import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Unauthorized Access</h1>
      <p style={styles.message}>
        You do not have permission to view this page.
      </p>
      <Link to="/" style={styles.link}>
        Go back to Home
      </Link>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: '36px',
    color: '#e74c3c',
  },
  message: {
    fontSize: '18px',
    marginTop: '20px',
    color: '#7f8c8d',
  },
  link: {
    fontSize: '16px',
    marginTop: '20px',
    color: '#3498db',
    textDecoration: 'none',
  },
};

export default UnauthorizedPage;
