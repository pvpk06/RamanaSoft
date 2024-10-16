import React, { useState } from 'react';
import './createdash.css';
import CreatePage from './Create/create';
import AnalyzeQuiz from './Analyze/Analyze';
import PreviewQuiz from './preview/preview';
import { GoEye } from "react-icons/go";

const CreateDash = ({ type, token, enabled, subTopic, course, topic }) => {
  const [selectedView, setSelectedView] = useState('Create');
  console.log("token :", token);
  
  const menuItems = [
    { id: 'create', name: 'Create' },
    { id: 'analyze', name: 'Analyze' },
  ];


  const handleMenuItemClick = (view) => {
    setSelectedView(view);
  };
  

  const renderContent = () => {
    switch (selectedView) {
      case 'Analyze':
        return <AnalyzeQuiz type={type} token={token} enabled={enabled} subTopic={subTopic} course={course} topic={topic}/>;
      default:
        return <CreatePage type={type} token={token} enabled={enabled} subTopic={subTopic} course={course} topic={topic} />;
    }
  };

  return (
    <div className="CreateDash_Navbody">
      <div className="CreateDash_top-panel">
        <ul className="CreateDash_menu">
          {menuItems.map((item) => (
            <li
              key={item.id}
              onClick={() => handleMenuItemClick(item.name)}
              className={selectedView === item.name ? 'active' : ''}
            >
              {item.name}
            </li>
          ))}
          <li
            key="preview"
            onClick={() => handleMenuItemClick('Preview')}
            className={`CreateDash_Preview ${selectedView === 'Preview' ? 'active' : ''}`}
          >
            <GoEye size={13} className="icon-spacing" /> Preview
          </li>
        </ul>
      </div>
      <div className="CreateDash_content">
        {selectedView === 'Preview' ? <PreviewQuiz token={token} enabled={enabled} subTopic={subTopic} course={course} topic={topic} /> : renderContent()}
      </div>
    </div>
  );
};

export default CreateDash;
