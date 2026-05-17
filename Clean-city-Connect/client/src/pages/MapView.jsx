import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FiFilter, FiX, FiClock, FiCheckCircle, FiXCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Fix default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Colored marker icons
function createIcon(color) {
  return L.divIcon({
    className: 'map-custom-marker',
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -12],
  });
}

const ICONS = {
  pending: createIcon('#f59e0b'),
  resolved: createIcon('#22c55e'),
  rejected: createIcon('#ef4444'),
};

// Component to fit map bounds to markers
function FitBounds({ complaints }) {
  const map = useMap();
  useEffect(() => {
    if (complaints.length > 0) {
      const bounds = complaints
        .filter(c => c.location_lat && c.location_lng)
        .map(c => [parseFloat(c.location_lat), parseFloat(c.location_lng)]);
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      }
    }
  }, [complaints, map]);
  return null;
}

export default function MapView() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filters, setFilters] = useState({
    status: ['pending', 'resolved', 'rejected'],
    wasteType: ['wet', 'dry', 'solid', 'mixed'],
  });

  useEffect(() => { fetchComplaints(); }, []);

  async function fetchComplaints() {
    try {
      const res = await fetch(`${API_BASE}/complaints/map`);
      const data = await res.json();
      if (res.ok) {
        setComplaints(data.complaints || []);
      }
    } catch (err) {
      console.error('Map fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }

  function toggleFilter(category, value) {
    setFilters(prev => {
      const arr = prev[category];
      const updated = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
      return { ...prev, [category]: updated };
    });
  }

  const filtered = complaints.filter(c =>
    filters.status.includes(c.status) &&
    filters.wasteType.includes(c.waste_type) &&
    c.location_lat && c.location_lng
  );

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <div className="mapview-page">
      {/* Filter sidebar */}
      <div className={`mapview-sidebar ${sidebarOpen ? 'mapview-sidebar--open' : 'mapview-sidebar--closed'}`}>
        <div className="mapview-sidebar-header">
          <h3 className="mapview-sidebar-title"><FiFilter /> Filters</h3>
          <button className="mapview-sidebar-close" onClick={() => setSidebarOpen(false)}><FiX /></button>
        </div>

        <div className="mapview-filter-group">
          <h4 className="mapview-filter-label">Status</h4>
          {[
            { id: 'pending', label: 'Pending', icon: <FiClock />, color: '#f59e0b' },
            { id: 'resolved', label: 'Resolved', icon: <FiCheckCircle />, color: '#22c55e' },
            { id: 'rejected', label: 'Rejected', icon: <FiXCircle />, color: '#ef4444' },
          ].map(s => (
            <label key={s.id} className="mapview-filter-check">
              <input
                type="checkbox"
                checked={filters.status.includes(s.id)}
                onChange={() => toggleFilter('status', s.id)}
              />
              <span className="mapview-filter-dot" style={{ background: s.color }} />
              {s.label}
              <span className="mapview-filter-count">
                {complaints.filter(c => c.status === s.id).length}
              </span>
            </label>
          ))}
        </div>

        <div className="mapview-filter-group">
          <h4 className="mapview-filter-label">Waste Type</h4>
          {['wet', 'dry', 'solid', 'mixed'].map(type => (
            <label key={type} className="mapview-filter-check">
              <input
                type="checkbox"
                checked={filters.wasteType.includes(type)}
                onChange={() => toggleFilter('wasteType', type)}
              />
              {type.charAt(0).toUpperCase() + type.slice(1)}
              <span className="mapview-filter-count">
                {complaints.filter(c => c.waste_type === type).length}
              </span>
            </label>
          ))}
        </div>

        <div className="mapview-filter-summary">
          Showing {filtered.length} of {complaints.length} complaints
        </div>
      </div>

      {/* Toggle sidebar button */}
      {!sidebarOpen && (
        <button className="mapview-toggle-btn" onClick={() => setSidebarOpen(true)}>
          <FiChevronRight />
        </button>
      )}

      {/* Map */}
      <div className="mapview-map-container">
        {loading ? (
          <div className="mapview-loading">Loading map data...</div>
        ) : (
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            className="mapview-map"
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds complaints={filtered} />
            {filtered.map(complaint => (
              <Marker
                key={complaint.id}
                position={[parseFloat(complaint.location_lat), parseFloat(complaint.location_lng)]}
                icon={ICONS[complaint.status] || ICONS.pending}
              >
                <Popup className="mapview-popup">
                  <div className="mapview-popup-inner">
                    {complaint.photo_url && (
                      <img src={complaint.photo_url} alt="" className="mapview-popup-img" />
                    )}
                    <div className="mapview-popup-content">
                      <span className={`badge badge--${complaint.status}`}>{complaint.status}</span>
                      <p className="mapview-popup-desc">
                        {complaint.ai_description || 'No description'}
                      </p>
                      <p className="mapview-popup-meta">
                        {complaint.waste_type} • {formatDate(complaint.created_at)}
                      </p>
                      {complaint.address && (
                        <p className="mapview-popup-addr">{complaint.address}</p>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
