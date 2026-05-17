import React from 'react';
import { FiUser, FiPhone, FiLogOut } from 'react-icons/fi';
import Card from '../ui/Card';
import WaveButton from '../ui/WaveButton';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  }

  return (
    <div className="settings-view">
      {/* Profile info */}
      <Card className="settings-profile-card">
        <h3 className="settings-section-title">Profile Information</h3>
        <div className="settings-profile-grid">
          <div className="settings-field">
            <span className="settings-field-icon"><FiUser /></span>
            <div>
              <p className="settings-field-label">Name</p>
              <p className="settings-field-value">{user?.name || 'N/A'}</p>
            </div>
          </div>
          <div className="settings-field">
            <span className="settings-field-icon"><FiPhone /></span>
            <div>
              <p className="settings-field-label">Phone</p>
              <p className="settings-field-value">{user?.phone || 'N/A'}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Account actions */}
      <Card className="settings-actions-card">
        <h3 className="settings-section-title">Account</h3>
        <div className="settings-actions">
          <WaveButton onClick={handleLogout}>
            <FiLogOut style={{ marginRight: '8px' }} />
            Logout
          </WaveButton>
        </div>
      </Card>
    </div>
  );
}
