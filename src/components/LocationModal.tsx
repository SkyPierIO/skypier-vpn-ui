import React, { useState } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'


interface LocationProps {
  country: string;
  city: string;
  latitude: number;
  longitude: number;
}

const LocationModal: React.FC<LocationProps> = ({ country, city, latitude, longitude }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // console.log("LocationModal", country, city, latitude, longitude);

  return (
    <div>
      <Button onClick={handleOpen}>Show Location</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Location: {country}, {city}
          </Typography>
          <div>
            {/* <MapContainer center={[latitude, longitude]} zoom={13} scrollWheelZoom={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[latitude, longitude]}>
                </Marker>
            </MapContainer> */}
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default LocationModal;