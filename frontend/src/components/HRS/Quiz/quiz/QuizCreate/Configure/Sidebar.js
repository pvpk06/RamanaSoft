import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import './Sidebar.css';
import Grading from './Grading';
import Certificate from './Certificate';
import QuizOptionsForm from './General';
import Notification from '../Create/notification';

const ConfigurePanel = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = window.location.pathname;
    const token = currentPath.split('/')[4];
    // const token = currentPath.split('/')[6];

    console.log("TOKEN :", token);    const [notification, setNotification] = useState({ message: '', type: '' });
    const [selectedView, setSelectedView] = useState('General');

    const menuItems = [
        { id: 'general', name: 'General' },
        { id: 'grading', name: 'Grading' },
        { id: 'certificate', name: 'Certificate' },
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
        navigate(`/hr_dash/edit/configure/${token}?tab=${view.toLowerCase()}`);
    };
    const closeNotification = () => {
        setNotification({ message: '', type: '' });
      };

    const renderContent = () => {
        switch (selectedView) {
            case 'General':
                return <QuizOptionsForm token={token} />;
            case 'Grading':
                return <Grading />;
            case 'Certificate':
                return <Certificate certificateId="RS00001" />;
            default:
                return null;
        }
    };

    return (
        <div className="configure-panel">
                  <Notification
        message={notification.message}
        type={notification.type}
        onClose={closeNotification}
      />
            <nav className="Configure-side-nav">
                <ul>
                    {menuItems.map((item) => (
                        <li
                            key={item.id}
                            onClick={() => handleMenuItemClick(item.name)}
                            className={selectedView === item.name ? 'active' : ''}
                        >
                            {item.name}
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="configure-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default ConfigurePanel;