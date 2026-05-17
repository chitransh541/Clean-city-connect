import React, { useState } from 'react';
import { FiHome, FiGift, FiList, FiHelpCircle, FiSettings, FiMenu, FiX, FiStar } from 'react-icons/fi';
import { RiLeafLine } from 'react-icons/ri';
import useAuthStore from '../store/authStore';
import DashboardHome from '../components/dashboard/DashboardHome';
import RequestsView from '../components/dashboard/RequestsView';
import RewardsHistory from '../components/dashboard/RewardsHistory';
import GetHelp from '../components/dashboard/GetHelp';
import Settings from '../components/dashboard/Settings';

const TABS = [
  { id: 'home', label: 'Home', icon: <FiHome /> },
  { id: 'rewards', label: 'Rewards History', icon: <FiGift /> },
  { id: 'requests', label: 'Requests', icon: <FiList /> },
  { id: 'help', label: 'Get Help', icon: <FiHelpCircle /> },
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);

  function handleStatClick(status) {
    setStatusFilter(status);
    setActiveTab('requests');
    setSidebarOpen(false);
  }

  function renderContent() {
    switch (activeTab) {
      case 'home':
        return <DashboardHome onStatClick={handleStatClick} />;
      case 'rewards':
        return <RewardsHistory />;
      case 'requests':
        return <RequestsView initialFilter={statusFilter} />;
      case 'help':
        return <GetHelp />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardHome onStatClick={handleStatClick} />;
    }
  }

  return (
    <div className="dashboard-page">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="dashboard-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'dashboard-sidebar--open' : 'dashboard-sidebar--closed'}`}>
        {/* Mobile close */}
        <div className="dashboard-sidebar-close">
          <button onClick={() => setSidebarOpen(false)} className="dashboard-sidebar-close-btn">
            <FiX className="dashboard-sidebar-close-icon" />
          </button>
        </div>

        {/* User info */}
        <div className="dashboard-sidebar-user">
          <div className="dashboard-sidebar-user-inner">
            <div className="dashboard-sidebar-avatar">
              <RiLeafLine className="dashboard-sidebar-avatar-icon" />
            </div>
            <div>
              <p className="dashboard-sidebar-name">{user?.name || 'User'}</p>
              <p className="dashboard-sidebar-phone">{user?.phone}</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="dashboard-sidebar-nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); setStatusFilter(null); }}
              className={`sidebar-link ${activeTab === tab.id ? 'sidebar-link--active' : ''}`}
            >
              <span className="dashboard-sidebar-link-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Settings at bottom */}
        <div className="dashboard-sidebar-footer">
          <button
            onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
            className={`sidebar-link ${activeTab === 'settings' ? 'sidebar-link--active' : ''}`}
          >
            <span className="dashboard-sidebar-link-icon"><FiSettings /></span>
            Settings
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="dashboard-main">
        {/* Top bar */}
        <div className="dashboard-topbar">
          <div className="dashboard-topbar-left">
            <button onClick={() => setSidebarOpen(true)} className="dashboard-menu-btn">
              <FiMenu className="dashboard-menu-icon" />
            </button>
            <h2 className="dashboard-title">
              {activeTab === 'home' ? 'Dashboard' : activeTab === 'help' ? 'Get Help' : activeTab}
            </h2>
          </div>

          {/* Reward points */}
          <div className="dashboard-reward-badge">
            <FiStar className="dashboard-reward-icon" />
            <span className="dashboard-reward-value">{user?.reward_points || 0}</span>
            <span className="dashboard-reward-label">points</span>
          </div>
        </div>

        {/* Page content */}
        <div className="dashboard-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
