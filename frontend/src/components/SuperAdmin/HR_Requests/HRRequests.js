import React, { useEffect, useState } from 'react';
import { Table, Container, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import apiService from '../../../apiService';
import { FaCheck, FaTimes } from 'react-icons/fa';

const HRRequests = () => {
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  
  useEffect(()=>{
    fetchCandidates();
  },[])

  const fetchCandidates = async () => {
    try {
      const response = await apiService.get("/api/hr-requests");
      setCandidates(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };
  console.log("Hr req")
  const handleAccept = async (acceptedCandidates) => {
    try {
      const response = await apiService.post("/api/accept-hrs", acceptedCandidates);
      const { accepted, rejected } = response.data;

      if (accepted.length > 0 && rejected.length === 0) {
        toast.success("HRs accepted successfully!", {
          autoClose: 5000
        });
      } else if (rejected.length > 0 && accepted.length === 0) {
        toast.error("All HRs rejected!", {
          autoClose: 5000
        });
        rejected.forEach(candidate => {
          toast.error(`Candidate ${candidate.fullName} (${candidate.email}) was rejected because they already exist in the database.`, {
            autoClose: 5000
          });
        });
      } else {
        accepted.forEach(candidate => {
          toast.success(`Candidate ${candidate.fullName} (${candidate.email}) accepted successfully!`, {
            autoClose: 5000
          });
        });
        rejected.forEach(candidate => {
          toast.error(`Candidate ${candidate.fullName} (${candidate.email}) was rejected because they already exist in the database.`, {
            autoClose: 5000
          });
        });
      }

      fetchCandidates();
      setSelectedCandidates([]);
    } catch (error) {
      console.error('Error accepting candidate:', error);
      toast.error(`There was an error accepting the registration: ${error.message}`, {
        autoClose: 5000
      });
    }
  };

  const handleReject = async (rejectedCandidates) => {
    try {
      await apiService.post("/api/reject-hrs", rejectedCandidates)
        .then(response => {
          toast.success("Registration Rejected successfully!", {
            autoClose: 5000
          });
          fetchCandidates();
          setSelectedCandidates([]);
        })
        .catch(error => {
          toast.error(`There was an error rejecting the registration ${error}`, {
            autoClose: 5000
          });
        });
    } catch (error) {
      console.error('Error rejecting candidate:', error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSelectCandidate = (candidate) => {
    setSelectedCandidates(prevSelected => {
      if (prevSelected.includes(candidate)) {
        return prevSelected.filter(cand => cand.id !== candidate.id);
      } else {
        return [...prevSelected, candidate];
      }
    });
  };

  const handleSelectAllCandidates = () => {
    if (selectedCandidates.length === filteredCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(filteredCandidates.map(candidate => candidate));
    }
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.contactNo.includes(searchTerm)
  );

  const tableStyles = {
    table: {
      minWidth: 650,
      backgroundColor: '#f5f5f5',
    },
    headCell: {
      backgroundColor: '#1f2c39',
      color: '#ffffff',
      fontWeight: 'bold',
      padding: '13px',
    },
    row: {
      '&:nth-of-type(odd)': {
        backgroundColor: '#fafafa',
      },
      '&:hover': {
        backgroundColor: '#e0e0e0',
      }
    },
    cell: {
      padding: '16px',
    },
    checkbox: {
      margin: '0',
    },
    actionsButton: {
      background: 'transparent',
      border: 'none',
    },
    acceptButton: {
      color: 'green',
    },
    rejectButton: {
      color: 'red',
    }
  };

  return (
    <div>
      <Container className="my-4">
        <h1 style={{ color: '#888888', fontWeight: 'bold', fontSize: '25px' }}>HR Requests</h1>
        <Form.Control
          type="text"
          placeholder="Search by name, email, or phone"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </Container>

      <Container className="px-0 ml-auto" style={{ width: '100%', overflow:"auto" }}>
        <div className="table-responsive">
          <Table style={tableStyles.table} responsive bordered>
            <thead>
              <tr>
                <th style={tableStyles.headCell}>
                  <Form.Check
                    type="checkbox"
                    checked={selectedCandidates.length === filteredCandidates.length && filteredCandidates.length !== 0}
                    onChange={handleSelectAllCandidates}
                    style={tableStyles.checkbox}
                  />
                </th>
                <th style={tableStyles.headCell}>Full Name</th>
                <th style={tableStyles.headCell}>Email</th>
                <th style={tableStyles.headCell}>Contact No</th>
                <th style={tableStyles.headCell}>Work Email</th>
                <th style={tableStyles.headCell}>Work Mobile</th>
                <th style={tableStyles.headCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map(candidate => (
                <tr key={candidate.id} style={tableStyles.row}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedCandidates.includes(candidate)}
                      onChange={() => handleSelectCandidate(candidate)}
                      style={tableStyles.checkbox}
                    />
                  </td>
                  <td style={tableStyles.cell}>{candidate.fullName}</td>
                  <td style={tableStyles.cell}>{candidate.email}</td>
                  <td style={tableStyles.cell}>{candidate.contactNo}</td>
                  <td style={tableStyles.cell}>{candidate.workEmail}</td>
                  <td style={tableStyles.cell}>{candidate.workMobile}</td>
                  <td style={tableStyles.cell}>
                    <Button
                      style={{ ...tableStyles.actionsButton, ...tableStyles.acceptButton }}
                      onClick={() => handleAccept([candidate])}
                    >
                      <FaCheck className="me-1" /> Accept
                    </Button>
                    <Button
                      style={{ ...tableStyles.actionsButton, ...tableStyles.rejectButton }}
                      onClick={() => handleReject([candidate])}
                    >
                      <FaTimes className="me-1" /> Reject
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredCandidates.length === 0 && <p style={{ textAlign: 'center' }}>No registration requests</p>}
        </div>
        {selectedCandidates.length > 0 &&
          <div className="d-flex justify-content-end">
            <Button
              style={{ ...tableStyles.actionsButton, ...tableStyles.acceptButton }}
              onClick={() => handleAccept(selectedCandidates)}
              disabled={selectedCandidates.length === 0}
            >
              <FaCheck className="me-1" /> Accept Selected
            </Button>
            <Button
              style={{ ...tableStyles.actionsButton, ...tableStyles.rejectButton }}
              onClick={() => handleReject(selectedCandidates)}
              disabled={selectedCandidates.length === 0}
            >
              <FaTimes className="me-1" /> Reject Selected
            </Button>
          </div>
        }
      </Container>
    </div>
  );
};

export default HRRequests;
