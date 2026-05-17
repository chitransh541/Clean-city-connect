import React, { useState, useEffect } from 'react';
import { FiClock, FiCheckCircle, FiXCircle, FiMapPin } from 'react-icons/fi';
import Card from '../ui/Card';
import ComplaintDetail from './ComplaintDetail';
import useAuthStore from '../../store/authStore';

export default function RequestsView({ initialFilter }) {
  const { user, token } = useAuthStore();
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState(initialFilter || 'all');
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => { fetchComplaints(); }, [user]);

  useEffect(() => {
    if (initialFilter !== undefined && initialFilter !== null) {
      setFilter(initialFilter);
    }
  }, [initialFilter]);

  async function fetchComplaints() {
    if (!user || !token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/complaints`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setComplaints(data.complaints || []);
      }
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    } finally {
      setLoading(false);
    }
  }

  const filtered = filter === 'all'
    ? complaints
    : complaints.filter(c => c.status === filter);

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  function statusIcon(s) {
    if (s === 'resolved') return <FiCheckCircle />;
    if (s === 'rejected') return <FiXCircle />;
    return <FiClock />;
  }

  return (
    <div className="requests-view">
      {/* Filter tabs */}
      <div className="requests-filter-bar">
        {['all', 'pending', 'resolved', 'rejected'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`requests-filter-btn ${filter === f ? 'requests-filter-btn--active' : ''}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="requests-filter-count">
              {f === 'all' ? complaints.length : complaints.filter(c => c.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Complaints list */}
      {loading ? (
        <div className="requests-loading">Loading complaints...</div>
      ) : filtered.length === 0 ? (
        <div className="requests-empty">
          <span className="requests-empty-icon">📋</span>
          <p className="requests-empty-text">No complaints found</p>
          <p className="requests-empty-subtext">
            {filter === 'all' ? 'Start by raising a complaint from the dashboard.' : `No ${filter} complaints.`}
          </p>
        </div>
      ) : (
        <div className="requests-list">
          {filtered.map(complaint => (
            <Card
              key={complaint.id}
              className="requests-card"
              interactive
              onClick={() => setSelectedComplaint(complaint)}
            >
              <div className="requests-card-inner">
                {complaint.photo_url && (
                  <div className="requests-card-media">
                    <img src={complaint.photo_url} alt="Complaint" className="requests-card-img" />
                  </div>
                )}
                <div className="requests-card-content">
                  <div className="requests-card-header">
                    <span className={`badge badge--${complaint.status}`}>
                      {statusIcon(complaint.status)} {complaint.status}
                    </span>
                    <span className="requests-card-date">{formatDate(complaint.created_at)}</span>
                  </div>
                  <p className="requests-card-desc">
                    {complaint.ai_description || complaint.description || 'No description'}
                  </p>
                  <div className="requests-card-meta">
                    <span className="requests-card-type">{complaint.waste_type}</span>
                    {complaint.address && (
                      <span className="requests-card-location">
                        <FiMapPin /> {complaint.address}
                      </span>
                    )}
                  </div>
                  {complaint.labels?.length > 0 && (
                    <div className="requests-card-labels">
                      {complaint.labels.slice(0, 3).map((label, i) => (
                        <span key={i} className="label-pill">{label}</span>
                      ))}
                      {complaint.labels.length > 3 && <span className="label-pill label-pill--more">+{complaint.labels.length - 3}</span>}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <ComplaintDetail
        complaint={selectedComplaint}
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
      />
    </div>
  );
}
