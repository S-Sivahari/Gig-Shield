import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { ShieldAlert, ChevronRight, Activity } from 'lucide-react';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const metricRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Get user data from localStorage
  const getUserData = () => {
    const userData = localStorage.getItem('gigshield_user_data');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const user = getUserData();
  const userName = user?.fullName || 'User';
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);

  useEffect(() => {
    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      // Show all elements immediately without animation
      metricRefs.current.forEach((ref) => {
        if (ref) ref.classList.add('animate-fade-in-up');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    metricRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const handleProfileClick = () => {
    try {
      // Check if auth state exists (in a real app, this would check localStorage/sessionStorage)
      // For now, we'll just navigate directly
      navigate('/profile');
    } catch (error) {
      console.error('Navigation error:', error);
      // Stay on current page if error occurs
    }
  };

  const handleProfileKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleProfileClick();
    }
  };

  return (
    <div className="gs-dashboard-page animate-fade-in">
      
      {/* Top Header Section */}
      <div className="gs-dash-header">
        <div className="gs-dash-greeting-row">
          <div>
            <h1 className="gs-dash-greeting">Good morning,</h1>
            <p className="gs-dash-name">{userName}</p>
          </div>
          <div 
            className="gs-avatar gs-avatar--clickable" 
            onClick={handleProfileClick}
            onKeyDown={handleProfileKeyDown}
            role="button"
            tabIndex={0}
            aria-label="Go to profile"
          >
            {userInitials}
          </div>
        </div>

        {/* Protection Card */}
        <div className="gs-protection-card">
          <div className="gs-prot-header">
            <span className="gs-prot-label">This week's coverage</span>
            <Badge variant="success">Active</Badge>
          </div>
          <h2 className="gs-prot-amount">₹3,360 <span>protected</span></h2>
          
          <div className="gs-prot-progress">
            <div className="gs-prot-progress-header">
              <span>Weekly premium</span>
              <span>₹89 / ₹89</span>
            </div>
            <div className="gs-prot-progress-track">
              <div className="gs-prot-progress-fill" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="gs-dash-content">
        
        {/* Zone Alert Banner */}
        <div className="gs-zone-banner" onClick={() => navigate('/zone')}>
          <div className="gs-zone-indicator" />
          <div className="gs-zone-text">
            <b>Koramangala</b> • AQI 168 · Rain forecast in 2 hrs. Monitoring.
          </div>
          <ChevronRight size={16} />
        </div>

        {/* 2x2 Metric Grid */}
        <div className="gs-metric-grid mt-4">
          <Card 
            className="gs-metric-card"
            ref={(el) => { metricRefs.current[0] = el; }}
          >
            <span className="gs-metric-label">Total paid out</span>
            <span className="gs-metric-value gs-text-green">₹12,450</span>
          </Card>
          <Card 
            className="gs-metric-card"
            ref={(el) => { metricRefs.current[1] = el; }}
          >
            <span className="gs-metric-label">Claims this month</span>
            <span className="gs-metric-value">4</span>
          </Card>
          <Card 
            className="gs-metric-card" 
            onClick={() => navigate('/gigscore')}
            ref={(el) => { metricRefs.current[2] = el; }}
          >
            <span className="gs-metric-label">GigScore</span>
            <span className="gs-metric-value gs-text-blue" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              78 <ChevronRight size={16} />
            </span>
          </Card>
          <Card 
            className="gs-metric-card"
            ref={(el) => { metricRefs.current[3] = el; }}
          >
            <span className="gs-metric-label">Next renewal</span>
            <span className="gs-metric-value" style={{ fontSize: '16px' }}>Oct 12</span>
          </Card>
        </div>

        {/* Recent Activity List */}
        <div className="gs-activity-section mt-6">
          <div className="gs-section-header">
            <h3 className="gs-section-title">Recent activity</h3>
            <button className="gs-link-button" onClick={() => navigate('/payouts')}>View all</button>
          </div>

          <div className="gs-activity-list">
            
            <div className="gs-activity-item">
              <div className="gs-activity-icon-box bg-blue-light">
                <ShieldAlert size={20} className="text-primary-blue" />
              </div>
              <div className="gs-activity-details">
                <p className="gs-activity-title">Heavy Rain Disruption</p>
                <p className="gs-activity-date">Oct 4 • <span className="gs-text-green">Auto-approved</span></p>
              </div>
              <div className="gs-activity-amount gs-text-green">+₹560</div>
            </div>

            <div className="gs-activity-item">
              <div className="gs-activity-icon-box bg-blue-light">
                <Activity size={20} className="text-primary-blue" />
              </div>
              <div className="gs-activity-details">
                <p className="gs-activity-title">AQI Spike Disruption</p>
                <p className="gs-activity-date">Sep 28 • <span className="gs-text-green">Auto-approved</span></p>
              </div>
              <div className="gs-activity-amount gs-text-green">+₹840</div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
