import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PropertyPage.css';

// MOCK DATA - In a real app, you would fetch this based on the `id` param
const mockHouses = [
  {
    id: 1,
    street: '123 University Ave',
    city: 'Amherst',
    province: 'Massachusetts',
    house_number: '101',
    monthly_rent: 1250.00,
    distance_to_university: 1.2, // Assuming km, will convert to miles
    has_kitchen: true,
    has_washer: true,
    has_parking: false,
    description: 'A cozy 3-bedroom near campus, perfect for students.',
    image: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    // The model doesn't have a 'rooms' field, so we'll add it here for the UI
    rooms: 3 
  },
  // ... other mock houses if needed
];

const PropertyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Find the specific house from our mock data
  const house = mockHouses.find(h => h.id === parseInt(id));

  if (!house) {
    return <div className="property-container"><h2>Property not found.</h2></div>;
  }

  // Helper to convert km to miles
  const kmToMiles = (km) => (km * 0.621371).toFixed(1);

  return (
    <div className="property-container">
      <div className="property-card">
        <div className="property-header">
          <button onClick={() => navigate(-1)} className="back-button">
            &larr; Back to Search
          </button>
          <button className="bookmark-button">Log in to Bookmark</button>
        </div>

        <h1 className="property-title">{house.street}, {house.city}</h1>

        <div className="property-image">
          <img src={house.image} alt={`View of ${house.street}`} />
        </div>

        <div className="property-details-grid">
          <div><strong>Apartment No:</strong> {house.house_number}</div>
          <div><strong>Rooms:</strong> {house.rooms}</div>
          <div><strong>Rent per Month:</strong> ${house.monthly_rent.toFixed(2)}</div>
          <div><strong>Distance from Campus:</strong> {kmToMiles(house.distance_to_university)} miles</div>
          <div><strong>Province:</strong> {house.province}</div>
          <div><strong>City:</strong> {house.city}</div>
        </div>

        <div className="property-section">
          <h2 className="section-title">Amenities</h2>
          <ul className="amenities-list">
            <li>
              Kitchen: 
              <span className={house.has_kitchen ? 'available' : 'not-available'}>
                {house.has_kitchen ? 'Available' : 'Not Available'}
              </span>
            </li>
            <li>
              Laundry/Drying: 
              <span className={house.has_washer ? 'available' : 'not-available'}>
                {house.has_washer ? 'Available' : 'Not Available'}
              </span>
            </li>
            <li>
              Parking: 
              <span className={house.has_parking ? 'available' : 'not-available'}>
                {house.has_parking ? 'Not Available' : 'Available'}
              </span>
            </li>
          </ul>
        </div>

        <div className="property-section">
          <h2 className="section-title">Description</h2>
          <p>{house.description}</p>
        </div>

        <div className="property-section">
          <h2 className="section-title">To Contact if Interested</h2>
          <p className="contact-info">Contact information will be provided by the owner.</p>
        </div>

      </div>
    </div>
  );
};

export default PropertyPage;
