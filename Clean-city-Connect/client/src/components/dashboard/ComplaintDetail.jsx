import React from 'react';
import { FiClock, FiCheckCircle, FiXCircle, FiMapPin, FiImage, FiVideo } from 'react-icons/fi';
import Modal from '../ui/Modal';

/**
 * ComplaintDetail – A modal showing full complaint details.
 * Reused in both citizen RequestsView and OfficerDashboard.
 */
export default function ComplaintDetail({ complaint, isOpen, onClose }) {
  if (!complaint) return null;

  function formatDate(d) {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  function statusColor(s) {
    if (s === 'resolved') return 'badge--resolved';
    if (s === 'rejected') return 'badge--rejected';
    return 'badge--pending';
  }

  function statusIcon(s) {
    if (s === 'resolved') return <FiCheckCircle />;
    if (s === 'rejected') return <FiXCircle />;
    return <FiClock />;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complaint Details" maxWidth="max-w-3xl">
      <div className="complaint-detail">
        {/* Media */}
        <div className="complaint-detail-media">
          {complaint.photo_url && (
            <div className="complaint-detail-media-item">
              <img src={complaint.photo_url} alt="Complaint photo" className="complaint-detail-img" />
              <span className="complaint-detail-media-badge"><FiImage /> Photo</span>
            </div>
          )}
          {complaint.video_url && (
            <div className="complaint-detail-media-item">
              <video src={complaint.video_url} controls className="complaint-detail-video" />
              <span className="complaint-detail-media-badge"><FiVideo /> Video</span>
            </div>
          )}
          {!complaint.photo_url && !complaint.video_url && (
            <div className="complaint-detail-no-media">No media attached</div>
          )}
        </div>

        {/* Status + Date */}
        <div className="complaint-detail-status-row">
          <span className={`badge ${statusColor(complaint.status)}`}>
            {statusIcon(complaint.status)} {complaint.status}
          </span>
          <span className="complaint-detail-date">Reported: {formatDate(complaint.created_at)}</span>
        </div>

        {/* Info grid */}
        <div className="complaint-detail-grid">
          <div className="complaint-detail-field">
            <span className="complaint-detail-label">Waste Type</span>
            <span className="complaint-detail-value complaint-detail-type">{complaint.waste_type}</span>
          </div>
          {complaint.resolved_at && (
            <div className="complaint-detail-field">
              <span className="complaint-detail-label">Resolved At</span>
              <span className="complaint-detail-value">{formatDate(complaint.resolved_at)}</span>
            </div>
          )}
          {complaint.rejected_at && (
            <div className="complaint-detail-field">
              <span className="complaint-detail-label">Rejected At</span>
              <span className="complaint-detail-value">{formatDate(complaint.rejected_at)}</span>
            </div>
          )}
        </div>

        {/* Location */}
        {complaint.address && (
          <div className="complaint-detail-section">
            <span className="complaint-detail-label"><FiMapPin style={{ marginRight: 4 }} /> Location</span>
            <p className="complaint-detail-desc">{complaint.address}</p>
          </div>
        )}

        {/* AI Description */}
        {complaint.ai_description && (
          <div className="complaint-detail-section">
            <span className="complaint-detail-label">🤖 AI Description</span>
            <p className="complaint-detail-desc">{complaint.ai_description}</p>
          </div>
        )}

        {/* User Description */}
        {complaint.description && (
          <div className="complaint-detail-section">
            <span className="complaint-detail-label">User Comments</span>
            <p className="complaint-detail-desc">{complaint.description}</p>
          </div>
        )}

        {/* Labels */}
        {complaint.labels?.length > 0 && (
          <div className="complaint-detail-section">
            <span className="complaint-detail-label">Categories</span>
            <div className="complaint-detail-labels">
              {complaint.labels.map((label, i) => (
                <span key={i} className="label-pill">{label}</span>
              ))}
            </div>
          </div>
        )}

        {/* Officer note */}
        {complaint.officer_note && (
          <div className="complaint-detail-section complaint-detail-section--note">
            <span className="complaint-detail-label">Officer Note</span>
            <p className="complaint-detail-desc">{complaint.officer_note}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
