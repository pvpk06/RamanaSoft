import React from 'react';
import { Link } from 'react-router-dom';

const PageNotFound = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px', marginBottom:"50px", height:"430px" }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      Go back to 
      <Link to="/" style={{ color: 'blue', textDecoration: 'none', marginLeft:"5px" }}>
         Home
      </Link>
    </div>
  );
};

export default PageNotFound;
