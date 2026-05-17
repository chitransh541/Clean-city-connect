import React, { useState, useEffect } from 'react';
import { FiGift, FiStar } from 'react-icons/fi';
import Card from '../ui/Card';
import useAuthStore from '../../store/authStore';

export default function RewardsHistory() {
  const { user, token } = useAuthStore();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRewards();
  }, [user]);

  async function fetchRewards() {
    if (!user || !token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/complaints/rewards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setRewards(data.rewards || []);
      }
    } catch (err) {
      console.error('Failed to fetch rewards:', err);
    } finally {
      setLoading(false);
    }
  }

  const totalPoints = rewards.reduce((sum, r) => sum + r.points, 0);

  return (
    <div className="rewards-view">
      {/* Points summary */}
      <Card className="rewards-summary-card">
        <div className="rewards-summary">
          <div className="rewards-summary-icon">
            <FiStar />
          </div>
          <div>
            <p className="rewards-summary-points">{user?.reward_points || totalPoints}</p>
            <p className="rewards-summary-label">Total Reward Points</p>
          </div>
        </div>
      </Card>

      {/* History */}
      <div className="rewards-history-section">
        <h3 className="rewards-history-title">Points History</h3>
        {loading ? (
          <div className="requests-loading">Loading rewards...</div>
        ) : rewards.length === 0 ? (
          <div className="rewards-empty">
            <span className="rewards-empty-icon">🎁</span>
            <p className="rewards-empty-text">No rewards yet</p>
            <p className="rewards-empty-subtext">Submit complaints and earn 50 points when they're resolved!</p>
          </div>
        ) : (
          <div className="rewards-list">
            {rewards.map((reward) => (
              <Card key={reward.id} className="rewards-item">
                <div className="rewards-item-inner">
                  <div className="rewards-item-icon">
                    <FiGift />
                  </div>
                  <div className="rewards-item-content">
                    <p className="rewards-item-desc">{reward.description}</p>
                    <p className="rewards-item-date">
                      {new Date(reward.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className="rewards-item-points">+{reward.points}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
