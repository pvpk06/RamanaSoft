import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet, useParams } from 'react-router-dom';
import './SA_dashboard.css';
import RSLogo from './RSLogo.jpeg';
import Cookies from 'js-cookie';
import RegistrationRequests from '../Intern_Requests/RegistrationRequests';
import GuestRegistrationRequests from '../Intern_Requests/guestRequests';
import SAPostJobs from '../SAPostJobs/SAPostJobs';
import SAViewJobs from '../SAViewJobs/SAViewJobs';
import HRRequests from '../HR_Requests/HRRequests';
import HrPortal from '../home/Home';
import InternData from '../intern_data/internData';
import GuestData from '../intern_data/guestData';
import AddHR from '../AddHR/AddHR';
import DisplayHRs from '../All Hrs/HRData';
import SAQuizDash from '../Quiz/SA_QuizDash';
import { Dropdown } from 'react-bootstrap';
import SADetails from './profile';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import JobApplicationsTable from '../home/SA_StudentsApplied';
import SAHrLeads from '../home/JobStatus/HrLeads';
import JobStatus from '../home/JobStatus/SAJobStatus';
import SAJobDesc from '../SAViewJobs/SAJobDesc';
import StudentsPlaced from '../home/SAStudentsPlaced';
import SAStudentDetails from '../home/SAStudentData';
import CompanyData from '../home/CompanyData';
import PreviewQuiz from '../Quiz/preview/preview';

const SADash = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedView, setSelectedView] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});

  const name = Cookies.get('name');
  const SAid = Cookies.get('SAid');
  console.log(name, SAid)
  const { '*': currentPath } = useParams();

  const menuItems = [
    { id: 'home', name: 'Home', icon: 'fas fa-home' },
    {
      id: 'hr', name: 'HR', icon: 'fas fa-chalkboard-user',
      submenu: [
        { id: 'allHrs', name: 'All HRs', icon: 'fas fa-list' },
        { id: 'addHr', name: 'New HR', icon: 'fas fa-plus' },
        { id: 'hrRequests', name: 'HR Requests', icon: 'fas fa-envelope' },
      ]
    },
    {
      id: 'students', name: 'Students', icon: 'fas fa-users',
      submenu: [
        { id: 'allInterns', name: 'All Interns', icon: 'fas fa-list' },
        { id: 'allGuests', name: 'All Guests', icon: 'fas fa-list' },
        { id: 'internRequests', name: 'Intern Requests', icon: 'fas fa-envelope' },
        { id: 'guestRequests', name: 'Guest Requests', icon: 'fas fa-envelope' },
      
      ]

    },
    {
      id: 'jobs', name: 'Jobs Gallery', icon: 'fas fa-briefcase',
      submenu: [
        { id: 'postJob', name: 'Post a Job', icon: 'fas fa-plus' },
        { id: 'viewJobs', name: 'View Jobs', icon: 'fas fa-eye' },
      ]
    },
    { id: 'quiz', name: 'Quiz', icon: 'fas fa-book' },
  ];

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    if (pathParts.length > 2) {
      const view = pathParts[2];
      setSelectedView(view);
    }
  }, [location]);

  const handleMenuItemClick = (id) => {
    setSelectedView(id);
    navigate(`/SA_dash/${id}`);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  const toggleSubmenu = (id) => {
    setExpandedMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const logout = () => {
    Object.keys(Cookies.get()).forEach(cookieName => {
      Cookies.remove(cookieName);
    });

    navigate("/")
  }

  const renderMenuItem = (item) => (
    <li key={item.id} className="menu-item-container">
      <div
        className={`menu-item ${selectedView === item.id ? 'active' : ''}`}
        onClick={() => item.submenu ? toggleSubmenu(item.id) : handleMenuItemClick(item.id)}
      >
        <i className={item.icon}></i>
        {isSidebarOpen && <span>{item.name}</span>}
        {item.submenu && isSidebarOpen && (
          <i className={`submenu-toggle fas ${expandedMenus[item.id] ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
        )}
      </div>
      {item.submenu && expandedMenus[item.id] && (
        <ul className="submenu">
          {item.submenu.map(subItem => (
            <li
              key={subItem.id}
              className={`submenu-item ${selectedView === subItem.id ? 'active' : ''}`}
              onClick={() => handleMenuItemClick(subItem.id)}
            >
              <i className={subItem.icon}></i>
              {isSidebarOpen && subItem.name}
            </li>
          ))}
        </ul>
      )}
    </li>
  );

  const renderContent = () => {
    if (currentPath.startsWith('job_desc/')) {
      const jobId = currentPath.split('/')[1];
      return <SAJobDesc jobId={jobId} setSelectedView={setSelectedView} />;
    }
    

    if (currentPath.startsWith('student/')) {
      const candidateID = currentPath.split('/')[1];
      return (
        <SAStudentDetails candidateID={candidateID} />
      );
    }

    if (currentPath.startsWith('preview/')) {
      const token = currentPath.split('/')[1];
      console.log(token);
      return (
        <PreviewQuiz token={token} />
      );
    }
    
    if (currentPath.startsWith('companies/')) {
      const companyID = currentPath.split('/')[1];
      return <CompanyData companyID={companyID} />;
    }

    const statusMapping = {
      "students-qualified": "qualified",
      "students-placed": "placed",
      "students-not-placed": "not-placed",
      "not-attended": "not-attended",
      "under-progress": "under-progress",
      "interns-not-interested": "interns-not-interested",
      "not-eligible": "not-eligible",
      "eligible": "eligible",
      "level-1": "level-1",
      "level-2": "level-2",
      "level-3": "level-3",
    };

    switch (selectedView) {
      case 'home':
        return <HrPortal />;
      case 'allHrs':
        return <DisplayHRs />;
      case 'addHr':
        return <AddHR setSelectedView={setSelectedView} />;
      case 'hrRequests':
        return <HRRequests />;
      case 'allInterns':
        return <InternData />;

      case 'allGuests' :
        return <GuestData />
      case 'internRequests':
        return <RegistrationRequests />;
      case 'guestRequests':
        return <GuestRegistrationRequests />;

      case 'postJob':
        return <SAPostJobs />;
      case 'viewJobs':
        return <SAViewJobs />;
      case 'quiz':
        return <SAQuizDash />;
      case 'profile':
        return <SADetails />;
      case "students-applied":
        return <JobApplicationsTable />
      case "students-qualified":
      case "students-placed":
      case "students-not-placed":
      case "not-attended":
      case "interns-not-interested":
      case "not-eligible":
      case "under-progress":
      case "eligible":
      case 'level-1':
      case 'level-2':
      case 'level-3':
        return <StudentsPlaced status={statusMapping[selectedView]} />;
      case "hr-leads":
        return <SAHrLeads />
        case "all-jobs":
          return <JobStatus statusInfo="all-jobs" />;  
      case "jd-received":
        return <JobStatus statusInfo="jd-received" />;
      case "profiles-sent":
        return <JobStatus statusInfo="profiles-sent" />;
      case "drive-scheduled":
        return <JobStatus statusInfo="drive-scheduled" />;
      case "drive-done":
        return <JobStatus statusInfo="drive-done" />;
      case "not-interested":
        return <JobStatus statusInfo="not-interested" />;
      case "preview":
        return <PreviewQuiz />
      default:
        return <HrPortal />;
    }
  };

  return (
    <div className={`dashboard ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <nav className={`SA_side-nav ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="logo">
          {isSidebarOpen ? <img className="logo-img" src={RSLogo} alt='text' /> : ''}
        </div>
        <button className="SA-toggle-button" onClick={toggleSidebar}>
        <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} />
        </button>
        <div className='icons-container'>
          <ul>
            {menuItems.map(renderMenuItem)}
          </ul>
        </div>
      </nav>
      <div className={`main-content ${isSidebarOpen ? 'expanded' : 'collapsed'}`}>
        <div className="top-panel" >
          <Dropdown.Item className="p">{name}</Dropdown.Item>
          <button
            onClick={logout}
            className="btn bg-transparent logout-btn fw-bold ml-5 w-100 pt-0"
            style={{ color: 'white', marginRight: "30px" }}
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
          </button>
        </div>
        {renderContent()}
        <Outlet />
      </div>
    </div>
  );
};

export default SADash;
