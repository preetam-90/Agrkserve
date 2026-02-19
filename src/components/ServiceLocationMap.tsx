import React from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Type definition for the props
type ServiceLocationMapProps = {
  latitude: number;
  longitude: number;
  radius: number; // in meters
};

const ServiceLocationMap: React.FC<ServiceLocationMapProps> = ({ latitude, longitude, radius }) => {
  return (
    <MapContainer
      center={[latitude, longitude] as [number, number]}
      zoom={11}
      scrollWheelZoom={false}
      style={{ height: '256px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
      />

      <Circle
        center={[latitude, longitude] as [number, number]}
        radius={radius}
        pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.2 }}
      />

      <Marker position={[latitude, longitude] as [number, number]} icon={icon}>
        <Popup>Service Center</Popup>
      </Marker>
    </MapContainer>
  );
};

export default ServiceLocationMap;
