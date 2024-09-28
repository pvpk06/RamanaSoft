import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@mui/material';

import './styles/internDash.css';
import AppliedJobs from './AppliedJobs.js';
import Profile from './Profile.js';
import HrViewJob from './JobPortal.js';
import p3 from '../images/p3.jpeg'
import Quiz from './quiz/Quiz.js';
import Cookies from 'js-cookie';
const GuestDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedView, setSelectedView] = useState('Applied');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'Applied', name: 'Applied', icon: 'fas fa-home' },
    { id: 'Jobs', name: 'Jobs', icon: 'fas fa-chalkboard-user' },
    { id: 'Quiz', name: 'Quiz', icon: 'fas fa-users' },
    { id: 'Profile', name: 'Profile', icon: 'fas fa-briefcase' },
  ];

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab) {
      setSelectedView(tab.charAt(0).toUpperCase() + tab.slice(1));
    }
  }, [location]);

  const handleMenuItemClick = (view) => {
    setSelectedView(view);
    navigate(`?${view.toLowerCase()}`);
  };
  const handleLogout = () => {
    Object.keys(Cookies.get()).forEach(cookieName => {
      Cookies.remove(cookieName);
    });
    navigate('/');
  };
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    switch (selectedView) {
      case 'Applied':
        return <AppliedJobs />
      case 'Jobs':
        return <HrViewJob  setSelectedView={setSelectedView}/>
      case 'Quiz':
        return <Quiz />
      case 'Profile':
        return <Profile />

      default:
        return <p> Default</p>
    }
  };

  return (
    <div className={`intern_dashboard ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <nav className={`intern-side-nav ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="logo">
          {isSidebarOpen ? <img className="logo-img" src={p3} alt='text' /> : ''}
        </div>
        <button className="intern-toggle-button" onClick={toggleSidebar}>
          {isSidebarOpen ? '◁' : '▷'}
        </button>
        <div className='icons-container'>
          <ul>
            {menuItems.map((item) => (
              <li
                key={item.id}
                onClick={() => handleMenuItemClick(item.id)}
                className={selectedView === item.name ? 'active' : ''}>
                <i className={item.icon}></i>
                {isSidebarOpen && <span>{item.name}</span>}
              </li>
            ))}
          </ul>
        </div>
        <Button
        className={"Logout" ? 'active' : ''}
          variant="outlined"
          style={{
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            fontSize: "13px",
            position: "absolute",
            bottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            transition: "background-color 0.3s, color 0.3s",
          }}
          onClick={handleLogout}
        >
          Logout <i className="fa-solid fa-sign-out-alt"></i>
        </Button>

      </nav>
      <div className={`intern-main-content ${isSidebarOpen ? 'expanded' : 'collapsed'}`}>
        {renderContent()}
      </div>
    </div>
  );
};

export default GuestDashboard;
