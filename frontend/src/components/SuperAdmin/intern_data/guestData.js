import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import { Table, Box, Pagination, TextField } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import apiService from '../../../apiService';
import { Link } from 'react-router-dom';

const GuestData = () => {
  const [guests, setguests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [guestsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.get('/api/guest_data');
        console.log(response.data);
        setguests(response.data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (guestID) => {
    console.log("Deleting intern with ID: ", guestID);
    try {
      await apiService.delete(`/api/guest_data/${guestID}`);
      setguests((prevguests) => prevguests.filter(intern => intern.guestID !== guestID));
    } catch (error) {
      console.error("Error deleting data: ", error);
    }
  };

  const filteredguests = guests.filter((intern) =>
    Object.values(intern).some(value =>
      value != null && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const indexOfLastIntern = currentPage * guestsPerPage;
  const indexOfFirstIntern = indexOfLastIntern - guestsPerPage;
  const currentguests = filteredguests.slice(indexOfFirstIntern, indexOfLastIntern);
  const totalPages = Math.ceil(filteredguests.length / guestsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <Container className="intern-table-container" style={{ overflow: 'auto', width: "100%" }}>
      <Box sx={{ marginBottom: 2, display: 'flex', justifyContent: 'center' }}>
        <TextField
          variant="outlined"
          placeholder="Search here..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: '70%' }}
        />
      </Box>

      <Table
        bordered
        hover
        responsive
        style={{ backgroundColor: '#1f2c39' }}
      >
        <thead style={{ backgroundColor: '#1f2c39', color: 'white' }}>
          <tr>
            <th style={{ padding: '16px' }}>Intern ID</th>
            <th style={{ padding: '16px' }}>Full Name</th>
            <th style={{ padding: '16px' }}>Email</th>
            <th style={{ padding: '16px' }}>Mobile No</th>
            <th style={{ padding: '16px' }}>Program</th>
            <th style={{ padding: '16px' }}>Domain</th>
            <th style={{ padding: '16px' }}>Batch No</th>
            <th style={{ padding: '16px' }}>Mode of Training</th>
            <th style={{ padding: '16px' }}>Mega Drive Status</th>
            <th style={{ padding: '16px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentguests.map(intern => (
            <tr key={intern.guestID} style={{ backgroundColor: '#ffffff', '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}>
              <td style={{ padding: '16px', textAlign: 'center' }}>{intern.guestID}</td>
              {/* <td style={{ padding: '16px', textAlign: 'center' }}>
                <Link style={{ textDecoration: "none", fontWeight: "bold" }} to={`/sa_dash/student/${intern.guestID}`}>{intern.fullName}</Link></td> */}
              <td style={{ padding: '16px', textAlign: 'center' }}>{intern.fullName}</td>
              <td style={{ padding: '16px', textAlign: 'center' }}>{intern.email}</td>
              <td style={{ padding: '16px', textAlign: 'center' }}>{intern.mobileno}</td>
              <td style={{ padding: '16px', textAlign: 'center' }}>{intern.program}</td>
              <td style={{ padding: '16px', textAlign: 'center' }}>{intern.domain}</td>
              <td style={{ padding: '16px', textAlign: 'center' }}>{intern.batchno}</td>
              <td style={{ padding: '16px', textAlign: 'center' }}>{intern.modeOfTraining}</td>
              <td style={{ padding: '16px', textAlign: 'center' }}>{intern.megadriveStatus}</td>
              <td style={{ padding: '16px' }}>
                <Button variant="danger" onClick={() => handleDelete(intern.guestID)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      {/* Media Queries */}
      <style jsx>{`
        @media (max-width: 768px) {
          .intern-table-container {
            width: 100%;
          }
          table th, table td {
            padding: 8px;
            font-size: 12px;
          }
          table th {
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          table th, table td {
            padding: 4px;
            font-size: 10px;
          }
          table th {
            font-size: 12px;
          }
          .intern-table-container {
            width: 100%;
            padding: 0;
          }
        }

        @media (max-width: 360px) {
          table th, table td {
            padding: 2px;
            font-size: 8px;
          }
        }
      `}</style>
    </Container>
  );
};

export default GuestData;
