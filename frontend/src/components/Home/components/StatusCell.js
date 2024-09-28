import React from 'react';
import { FaEdit } from 'react-icons/fa';

const StatusCell = ({ value, row, updateStatus, isEditing }) => {
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
          onChange={(e) => updateStatus(row.original.applicationID, e.target.value)}
        >
          <option value="Applied">Applied</option>
          <option value="Qualified">Qualified</option>
          <option value="Not Qualified">Not Qualified</option>
          <option value="Placed">Placed</option>
          
              
              
              <option value="Not Placed">Not Placed</option>
              <option value="Not Attended">Not Attended</option>
              <option value="Not Interested">Not Interested</option>
              <option value="Not Eligible">Not Eligible</option>
              <option value="Eligible">Eligible/Profile Sent</option>
              <option value="Under Progress">Yet to Receive Feedback</option>
              <option value="Level 1">Level 1</option>
              <option value="Level 2">Level 2</option>
              <option value="Level 3">Level 3</option>
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
          {value}
        </>
      )}
      <button
        onClick={() => row.toggleEditing(row.original.applicationID)}
        style={{ marginLeft: '8px', border: 'none', background: 'none', cursor: 'pointer' }}
      >
        <FaEdit />
      </button>
    </div>
  );
};

export default StatusCell;