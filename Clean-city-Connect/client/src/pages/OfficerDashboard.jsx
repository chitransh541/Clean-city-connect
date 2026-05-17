import React, { useState, useEffect } from 'react';
import { FiList, FiCheckCircle, FiClock, FiXCircle, FiMenu, FiX, FiAlertTriangle, FiEye } from 'react-icons/fi';
import { RiLeafLine } from 'react-icons/ri';
import Card from '../components/ui/Card';
import WaveButton from '../components/ui/WaveButton';
import Modal from '../components/ui/Modal';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const STATUS_TABS = [
  { id: 'all', label: 'All', icon: <FiList /> },
  { id: 'pending', label: 'Pending', icon: <FiClock /> },
  { id: 'resolved', label: 'Resolved', icon: <FiCheckCircle /> },
  { id: 'rejected', label: 'Rejected', icon: <FiXCircle /> },
];

export default function OfficerDashboard() {
  const { user, token } = useAuthStore();
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [officerNote, setOfficerNote] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  async function fetchComplaints() {
    try {
      const res = await fetch(`${API_BASE}/complaints`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setComplaints(data.complaints || []);
      }
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(complaintId, status) {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, officerNote }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Complaint ${status}!`);
        setSelectedComplaint(null);
        setOfficerNote('');
        fetchComplaints();
      } else {
        toast.error(data.message || 'Failed to update');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setActionLoading(false);
    }
  }

  const filtered = activeTab === 'all' ? complaints : complaints.filter(c => c.status === activeTab);

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    rejected: complaints.filter(c => c.status === 'rejected').length,
  };

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function statusColor(s) {
    if (s === 'resolved') return 'badge--resolved';
    if (s === 'rejected') return 'badge--rejected';
    return 'badge--pending';
  }

  return (
    <div className="dashboard-page">
      {/* Sidebar overlay */}
      {sidebarOpen && <div className="dashboard-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'dashboard-sidebar--open' : 'dashboard-sidebar--closed'}`}>
        <div className="dashboard-sidebar-close">
          <button onClick={() => setSidebarOpen(false)} className="dashboard-sidebar-close-btn">
            <FiX className="dashboard-sidebar-close-icon" />
          </button>
        </div>

        <div className="dashboard-sidebar-user">
          <div className="dashboard-sidebar-user-inner">
            <div className="dashboard-sidebar-avatar">
              <RiLeafLine className="dashboard-sidebar-avatar-icon" />
            </div>
            <div>
              <p className="dashboard-sidebar-name">{user?.name || 'Officer'}</p>
              <p className="dashboard-sidebar-phone">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="dashboard-sidebar-nav">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              className={`sidebar-link ${activeTab === tab.id ? 'sidebar-link--active' : ''}`}
            >
              <span className="dashboard-sidebar-link-icon">{tab.icon}</span>
              {tab.label}
              <span className="officer-tab-count">{stats[tab.id === 'all' ? 'total' : tab.id]}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="dashboard-main">
        <div className="dashboard-topbar">
          <div className="dashboard-topbar-left">
            <button onClick={() => setSidebarOpen(true)} className="dashboard-menu-btn">
              <FiMenu className="dashboard-menu-icon" />
            </button>
            <h2 className="dashboard-title">Officer Dashboard</h2>
          </div>
          <div className="officer-stats-bar">
            <span className="officer-stat officer-stat--blue">{stats.total} Total</span>
            <span className="officer-stat officer-stat--amber">{stats.pending} Pending</span>
            <span className="officer-stat officer-stat--green">{stats.resolved} Resolved</span>
            <span className="officer-stat officer-stat--red">{stats.rejected} Rejected</span>
          </div>
        </div>

        <div className="dashboard-content">
          {loading ? (
            <div className="requests-loading">Loading complaints...</div>
          ) : filtered.length === 0 ? (
            <div className="requests-empty">
              <span className="requests-empty-icon">📋</span>
              <p className="requests-empty-text">No {activeTab === 'all' ? '' : activeTab} complaints</p>
            </div>
          ) : (
            <div className="officer-complaints-grid">
              {filtered.map(complaint => (
                <Card key={complaint.id} className="officer-complaint-card" interactive onClick={() => setSelectedComplaint(complaint)}>
                  <div className="officer-card-inner">
                    {/* Thumbnail */}
                    <div className="officer-card-thumb">
                      {complaint.photo_url ? (
                        <img src={complaint.photo_url} alt="" className="officer-card-img" />
                      ) : (
                        <div className="officer-card-no-img"><FiAlertTriangle /></div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="officer-card-info">
                      <div className="officer-card-top">
                        <span className={`badge ${statusColor(complaint.status)}`}>{complaint.status}</span>
                        <span className="officer-card-date">{formatDate(complaint.created_at)}</span>
                      </div>
                      <p className="officer-card-desc">
                        {complaint.ai_description || complaint.description || 'No description'}
                      </p>
                      <div className="officer-card-meta">
                        <span className="officer-card-type">{complaint.waste_type}</span>
                        {complaint.user_name && <span className="officer-card-user">by {complaint.user_name}</span>}
                        {complaint.address && <span className="officer-card-addr">{complaint.address}</span>}
                      </div>
                      {complaint.labels?.length > 0 && (
                        <div className="officer-card-labels">
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
        </div>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedComplaint} onClose={() => { setSelectedComplaint(null); setOfficerNote(''); }} title="Complaint Details" maxWidth="max-w-3xl">
        {selectedComplaint && (
          <div className="officer-detail">
            {/* Media */}
            <div className="officer-detail-media">
              {selectedComplaint.photo_url && (
                <img src={selectedComplaint.photo_url} alt="Complaint" className="officer-detail-img" />
              )}
              {selectedComplaint.video_url && (
                <video src={selectedComplaint.video_url} controls className="officer-detail-video" />
              )}
            </div>

            {/* Info grid */}
            <div className="officer-detail-grid">
              <div className="officer-detail-field">
                <span className="officer-detail-label">Status</span>
                <span className={`badge ${statusColor(selectedComplaint.status)}`}>{selectedComplaint.status}</span>
              </div>
              <div className="officer-detail-field">
                <span className="officer-detail-label">Waste Type</span>
                <span className="officer-detail-value">{selectedComplaint.waste_type}</span>
              </div>
              <div className="officer-detail-field">
                <span className="officer-detail-label">Reported By</span>
                <span className="officer-detail-value">{selectedComplaint.user_name || 'Unknown'} ({selectedComplaint.user_phone || 'N/A'})</span>
              </div>
              <div className="officer-detail-field">
                <span className="officer-detail-label">Date</span>
                <span className="officer-detail-value">{formatDate(selectedComplaint.created_at)}</span>
              </div>
              {selectedComplaint.address && (
                <div className="officer-detail-field officer-detail-field--full">
                  <span className="officer-detail-label">Location</span>
                  <span className="officer-detail-value">{selectedComplaint.address}</span>
                </div>
              )}
            </div>

            {/* AI Description */}
            {selectedComplaint.ai_description && (
              <div className="officer-detail-section">
                <span className="officer-detail-label">AI Description</span>
                <p className="officer-detail-desc">{selectedComplaint.ai_description}</p>
              </div>
            )}

            {/* User Description */}
            {selectedComplaint.description && (
              <div className="officer-detail-section">
                <span className="officer-detail-label">User Comments</span>
                <p className="officer-detail-desc">{selectedComplaint.description}</p>
              </div>
            )}

            {/* Labels */}
            {selectedComplaint.labels?.length > 0 && (
              <div className="officer-detail-section">
                <span className="officer-detail-label">Categories</span>
                <div className="officer-detail-labels">
                  {selectedComplaint.labels.map((label, i) => (
                    <span key={i} className="label-pill">{label}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Officer Note */}
            {selectedComplaint.officer_note && (
              <div className="officer-detail-section">
                <span className="officer-detail-label">Officer Note</span>
                <p className="officer-detail-desc">{selectedComplaint.officer_note}</p>
              </div>
            )}

            {/* Action area (only for pending) */}
            {selectedComplaint.status === 'pending' && (
              <div className="officer-action-area">
                <textarea
                  className="input-field dashboard-textarea"
                  placeholder="Add a note (optional)..."
                  value={officerNote}
                  onChange={(e) => setOfficerNote(e.target.value)}
                  rows={2}
                />
                <div className="officer-action-btns">
                  <WaveButton
                    onClick={() => handleStatusUpdate(selectedComplaint.id, 'resolved')}
                    disabled={actionLoading}
                  >
                    <FiCheckCircle style={{ marginRight: 6 }} />
                    {actionLoading ? 'Processing...' : 'Resolve (+50 pts)'}
                  </WaveButton>
                  <button
                    onClick={() => handleStatusUpdate(selectedComplaint.id, 'rejected')}
                    disabled={actionLoading}
                    className="officer-reject-btn"
                  >
                    <FiXCircle style={{ marginRight: 6 }} />
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
