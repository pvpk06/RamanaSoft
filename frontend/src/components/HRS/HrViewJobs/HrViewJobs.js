import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Form, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import apiService from '../../../apiService';
import { RxDotFilled } from "react-icons/rx";
import { useNavigate, Link } from 'react-router-dom';
import './HrViewJobs.css';
import { FaMapMarkerAlt, FaMoneyBillWave, FaUserFriends, FaCalendarAlt, FaAngleRight } from 'react-icons/fa';
import Cookies from 'js-cookie'
import { FcExpired } from 'react-icons/fc';
import { Pagination, Box, TextField } from '@mui/material';

const statusInfo = { 'jd-received': 'JD Received', 'profiles-sent': 'Profiles sent', 'drive-scheduled': 'Drive Scheduled', 'drive-done': 'Drive Done', 'not-interested': "Not Interested" }
const HrId = Cookies.get('HRid')
const HrViewJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const hrId = HrId;

  useEffect(() => {
    fetchJobs();
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await apiService.get(`/api/hr-view-jobs?hrId=${hrId}`);
      console.log(response.data);
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const filterJobs = () => {
    const searchTermLower = searchTerm.toLowerCase();

    return jobs.filter(job => {
      const jobTitle = job.jobTitle || '';
      const jobRole = job.jobRole || '';
      const jobLocation = job.Location || '';
      const companyName = job.companyName || '';
      const email = job.email || '';
      const phone = job.phone || '';
      const jobCity = job.jobCity || '';

      const matchesSearchTerm =
        jobTitle.toLowerCase().includes(searchTermLower) ||
        jobRole.toLowerCase().includes(searchTermLower) ||
        jobLocation.toLowerCase().includes(searchTermLower) ||
        companyName.toLowerCase().includes(searchTermLower) ||
        email.toLowerCase().includes(searchTermLower) ||
        phone.toLowerCase().includes(searchTermLower) ||
        jobCity.toLowerCase().includes(searchTermLower);

      const matchesYear = !selectedYear || new Date(job.postedOn).getFullYear() === parseInt(selectedYear);
      const matchesMonth = !selectedMonth || new Date(job.postedOn).getMonth() === parseInt(selectedMonth) - 1;

      return matchesSearchTerm && matchesYear && matchesMonth;
    });
  };

  useEffect(() => {
    fetchJobs();
  }, [hrId]);

  useEffect(() => {
    setFilteredJobs(filterJobs());
  }, [jobs, searchTerm, selectedYear, selectedMonth]);


  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const currentDate = new Date();

  return (
    <div style={{ overflowY: 'hidden', height: '120vh', paddingBottom: '10px' }}>
      <Container className="my-4">
        <div className="d-flex flex-row justify-content-between">
          <h1 style={{ color: '#888888', fontWeight: 'bold', fontSize: '25px' }}>Available Jobs</h1>
        </div>
        <Row className="my-3">
          <Col md={2}>
            <Form.Control
              as="select"
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedMonth('');
              }}
            >
              <option value="">Select Year</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </Form.Control>
          </Col>
          <Col md={2}>
            <Form.Control
              as="select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              disabled={!selectedYear}
            >
              <option value="">Select Month</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </Form.Control>
          </Col>
          <Col md={8}>
            <TextField
              variant="outlined"
              placeholder="Search using Title, Role, Location, Company name, email, contact"
              value={searchTerm}
              onChange={handleSearchChange}
              fullWidth
            />
          </Col>
        </Row>
      </Container>


      <Container fluid className="px-0 ml-auto mr-auto mb-5" style={{ width: '75vw', height: "80vh" }}>
        {filteredJobs.length > 0 ? (
          <Row xs={1} sm={1} md={2} lg={3} className="g-4">
            {currentJobs.map(job => (
              <Col key={job.jobId}>
                <div
                  className="card h-100"
                  style={{
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.19)',
                    borderRadius: '10px',
                    padding: '5px',
                  }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between ">
                      <div>
                        <h5 className="card-title fw-bold">{job.jobTitle}</h5>
                        <p className="card-subtitle mb-2 text-muted">{job.companyName}</p>
                      </div>
                      {new Date(job.lastDate) < currentDate && (
                        <span style={{ fontWeight: '500', color: '#fa3e4b' }}>
                          <FcExpired />Applications closed
                        </span>
                      )}
                    </div>

                    <div className="mt-3">
                      <p><FaMapMarkerAlt className="me-2" />Location: <span> {job.Location}</span></p>
                      <div className="d-flex mb-2">
                        <FaMoneyBillWave className="me-2" /> <span>CTC: {job.salary}</span>
                      </div>
                      <div className="d-flex mb-2">
                        <FaUserFriends className="me-2" /> <span>Openings: {job.openings}</span>
                      </div>
                      <div className="d-flex mb-2">
                        <FaCalendarAlt className="me-2" /> <span>Apply By: {formatDate(job.lastDate)}</span>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <span
                        style={{
                          border: '1px solid #fdf3c6',
                          borderRadius: '5px',
                          padding: '5px',
                          fontSize: '12px',
                          backgroundColor: '#fdf3c6',
                          color: '#943d0e',
                          fontWeight: '500',
                        }}
                      >
                        <RxDotFilled /> {statusInfo[job.status]}
                      </span>
                      <Link
                        to={`/hr_dash/job_desc/${job.jobId}`}
                        style={{ textDecoration: 'none', color: '#53289e', fontWeight: '500' }}
                        className="btn btn-link p-0"
                      >
                        View Job <FaAngleRight />
                      </Link>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          <p>No jobs found.</p>
        )}
        <Pagination
          count={Math.ceil(filteredJobs.length / jobsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          style={{ display: "flex", marginTop: '20px', textAlign: "center", justifyContent: 'center' }}
        />
      </Container>
    </div>
  );
};

export default HrViewJobs;
