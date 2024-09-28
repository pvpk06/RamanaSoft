import React from 'react';
import { FaEdit } from 'react-icons/fa';

const HrStatusCell = ({ value, row, updateStatus, isEditing }) => {
  console.log(value)
    const statusInfo={'jd-received':'JD Received','profiles-sent':'Profiles sent','drive-scheduled':'Drive Scheduled','drive-done':'Drive Done','not-interested':"Not Interested"} 
  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'yellow';
      case 'Qualified':
        return 'green';
      case 'Not Qualified':
        return 'red';
      default:
        return 'blue';
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {isEditing ? (
        <select
          value={value}
          onChange={(e) => updateStatus(row.original.jobId, e.target.value)}
        >
          
              <option value="jd-received">{statusInfo['jd-received']}</option>
              <option value="profiles-sent">{statusInfo['profiles-sent']}</option>
              <option value="drive-scheduled">{statusInfo['drive-scheduled']}</option>
              <option value="drive-done">{statusInfo['drive-done']}</option>
              <option value="not-interested">{statusInfo['not-interested']}</option>
        </select>
      ) : (
        <>
          <span
            style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(value),
              marginRight: '8px'
            }}
          ></span>
          {statusInfo[value]}
        </>
      )}
      <button
        onClick={() => row.toggleEditing(row.original.jobId)}
        style={{ marginLeft: '8px', border: 'none', background: 'none', cursor: 'pointer' }}
      >
        <FaEdit />
      </button>
    </div>
  );
};

export default HrStatusCell;