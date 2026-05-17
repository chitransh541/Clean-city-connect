import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import Modal from './Modal';
import WaveButton from './WaveButton';
import { FiMapPin, FiNavigation } from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Click handler inside the map
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// Re-center map when location changes
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 16);
    }
  }, [lat, lng, map]);
  return null;
}

/**
 * Reverse geocode lat/lng to address using OpenStreetMap Nominatim (free).
 */
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

/**
 * MapPicker – Opens a Leaflet map in a modal for location selection.
 * 
 * Props:
 *  - isOpen: boolean
 *  - onClose: close handler
 *  - onSelect: callback({ lat, lng, address })
 *  - initialLat, initialLng: starting position
 */
export default function MapPicker({ isOpen, onClose, onSelect, initialLat, initialLng }) {
  const [position, setPosition] = useState(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  const [address, setAddress] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [gettingGPS, setGettingGPS] = useState(false);

  // Default map center (Delhi)
  const defaultCenter = [28.6139, 77.2090];

  function handleLocationSelect({ lat, lng }) {
    setPosition({ lat, lng });
    setGeocoding(true);
    reverseGeocode(lat, lng).then(addr => {
      setAddress(addr);
      setGeocoding(false);
    });
  }

  function handleUseGPS() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setGettingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleLocationSelect({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGettingGPS(false);
      },
      (err) => {
        console.error('GPS error:', err);
        alert('Could not get your location. Please enable location services.');
        setGettingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleConfirm() {
    if (position) {
      onSelect({ lat: position.lat, lng: position.lng, address });
      onClose();
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose Location" maxWidth="max-w-3xl">
      <div className="map-picker">
        <div className="map-picker-toolbar">
          <button type="button" onClick={handleUseGPS} className="map-picker-gps-btn" disabled={gettingGPS}>
            <FiNavigation />
            {gettingGPS ? 'Getting GPS...' : 'Use My Location'}
          </button>
          {geocoding && <span className="map-picker-status">Fetching address...</span>}
        </div>

        <div className="map-picker-container">
          <MapContainer
            center={position ? [position.lat, position.lng] : defaultCenter}
            zoom={position ? 16 : 12}
            className="map-picker-map"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onLocationSelect={handleLocationSelect} />
            {position && (
              <>
                <Marker position={[position.lat, position.lng]} />
                <RecenterMap lat={position.lat} lng={position.lng} />
              </>
            )}
          </MapContainer>
        </div>

        {address && (
          <div className="map-picker-address">
            <FiMapPin className="map-picker-address-icon" />
            <span>{address}</span>
          </div>
        )}

        <div className="map-picker-footer">
          <button type="button" onClick={onClose} className="map-picker-cancel-btn">Cancel</button>
          <WaveButton onClick={handleConfirm} disabled={!position}>
            <FiMapPin style={{ marginRight: 6 }} /> Confirm Location
          </WaveButton>
        </div>
      </div>
    </Modal>
  );
}
