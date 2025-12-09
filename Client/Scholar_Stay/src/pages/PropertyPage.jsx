import React from 'react';
import { useParams } from 'react-router-dom';

const PropertyPage = () => {
  const { id } = useParams();
  return <h2>Property Details for ID: {id}</h2>;
};

export default PropertyPage;
