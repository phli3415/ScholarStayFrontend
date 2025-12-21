import React from 'react';
import HouseCard from './HouseCard';
import './HouseCard.css'; // Ensure styles are applied

// Based on your Python `Houses` model and the props expected by HouseCard.jsx
const mockHouses = [
  {
    id: 1,
    address: {
      street: '123 University Ave',
      city: 'Amherst',
      province: 'MA',
    },
    monthly_rent: '1250.00',
    distance_to_university_km: 1.2, // The component expects `distance_to_university_km`
    has_kitchen: true,
    has_washer: true,
    has_parking: false,
    is_rented: false,
    // The HouseCard component uses a placeholder, but we can provide a real one
    image: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
  {
    id: 2,
    address: {
      street: '456 Main Street',
      city: 'Northampton',
      province: 'MA',
    },
    monthly_rent: '980.50',
    distance_to_university_km: 8.5,
    has_kitchen: true,
    has_washer: false,
    has_parking: true,
    is_rented: true,
    image: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
    {
    id: 3,
    address: {
      street: '789 Maple Rd',
      city: 'Amherst',
      province: 'MA',
    },
    monthly_rent: '2100.00',
    distance_to_university_km: 2.1,
    has_kitchen: true,
    has_washer: true,
    has_parking: true,
    is_rented: false,
    image: 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  },
];

const HouseCardTest = () => {
  return (
    <div style={{ padding: '2rem', backgroundColor: '#f4f4f4' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>House Card Test Page</h1>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        justifyContent: 'center'
      }}>
        {mockHouses.map(house => (
          <HouseCard key={house.id} house={house} />
        ))}
      </div>
    </div>
  );
};

export default HouseCardTest;
