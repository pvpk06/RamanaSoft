import React, { useEffect, useState } from 'react';
import { Container, Form, Row, Col, } from 'react-bootstrap';
import { TextField } from '@mui/material';
import { toast } from 'react-toastify';
import { MdEdit, MdDelete } from 'react-icons/md';
import { RxDotFilled } from "react-icons/rx";
import { Link } from 'react-router-dom';
import { FaAngleRight } from 'react-icons/fa';
import { FcExpired } from 'react-icons/fc';
import { Pagination, Box } from '@mui/material';
import apiService from '../../../apiService';
const SAViewJobs = () => {
  const currentDate = new Date();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [sortCriteria, setSortCriteria] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (jobs.length > 0) {
      let filtered = jobs.filter(job =>
        (job.jobId && job.jobId.toString().includes(searchQuery)) ||
        (job.jobTitle && job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (job.postedBy && job.postedBy.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (job.jobRole && job.jobRole.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (job.companyName && job.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (job.email && job.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (job.phone && job.phone.includes(searchQuery)) ||
        (job.jobCity && job.jobCity.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      if (selectedYear) {
        filtered = filtered.filter(job => new Date(job.postedOn).getFullYear() === parseInt(selectedYear));
      }

      if (selectedMonth) {
        filtered = filtered.filter(job => new Date(job.postedOn).getMonth() === parseInt(selectedMonth) - 1);
      }

      setFilteredJobs(filtered);
    }
  }, [jobs, searchQuery, selectedYear, selectedMonth]);


  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  }

  const fetchJobs = async () => {
    try {
      const response = await apiService.get("/api/view-jobs");
      const sortedJobs = response.data.sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate));
      setJobs(sortedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleEdit = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const handleSave = async (updatedJob) => {
    const changedValues = {};
    const originalJob = filteredJobs.find(job => updatedJob.jobId === job.jobId);
    for (let key in updatedJob) {
      if (updatedJob.hasOwnProperty(key) && originalJob.hasOwnProperty(key)) {
        if (updatedJob[key] !== originalJob[key]) {
          changedValues[key] = updatedJob[key];
        }
      }
    }
    try {
      await apiService.post("/api/update-job", { changedValues, jobId: updatedJob.jobId });
      toast.success(`Job updated successfully`, { autoClose: 5000 });
      setShowModal(false);
      fetchJobs();
    } catch (error) {
      console.error('There was an error updating the job!', error);
      toast.error(`${error.response.data.error}`, { autoClose: 5000 });
    }
  };

  const handleDelete = async (job) => {
    try {
      console.log(job);
      await apiService.delete(`/api/delete-job/${job.jobId}`);
      toast.success("Job deleted successfully!", { autoClose: 5000 });
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error(`There was an error deleting the job ${error}`, { autoClose: 5000 });
    }
  };


  const handleSort = (criteria) => {
    const sortedJobs = [...jobs].sort((a, b) => {
      if (criteria === 'name') {
        return a.jobRole.localeCompare(b.jobRole);
      } else if (criteria === 'date') {
        return new Date(b.postedOn) - new Date(a.postedOn);
      } else if (criteria === 'company') {
        return a.companyName.localeCompare(b.companyName);
      }
      return 0;
    });
    setSortCriteria(criteria);
    setJobs(sortedJobs);
  };

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div>
      <Container className="my-4">
        <div className="d-flex flex-row justify-content-between">
          <h1 style={{ color: '#888888', fontWeight: 'bold', fontSize: '25px' }}>Available Jobs</h1>
        </div>
        <Row className="my-3">
          <Col xs={12} md={4}>
            <Form.Control as="select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              <option value="">Select Year</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </Form.Control>
          </Col>
          <Col xs={12} md={4}>
            <Form.Control as="select" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
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
          <Col xs={12} md={4}>
            <TextField
              variant="outlined"
              placeholder="Search here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
            />
          </Col>
        </Row>
      </Container>

      <Container style={{ width: "1200px" }}>
        {currentJobs.length > 0 ? (
          <Row xs={1} sm={1} md={2} lg={3} >
            {currentJobs.map(job => (
              <Col key={job.jobId} style={{ marginBottom: "20px" }}>
                <div
                  className="card h-100"
                  style={{
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.19)',
                    borderRadius: '10px',
                    padding: '5px',
                  }}
                >
                  <div className="card-body" >
                    <div className="d-flex justify-content-between ">
                      <div>
                        <h5 className="card-title fw-bold">{job.jobTitle}</h5>
                        <p className="card-subtitle mb-2 text-muted">{job.companyName}</p>
                      </div>

                      {new Date(job.lastDate) < currentDate && <span style={{ fontWeight: '500', color: '#fa3e4b' }}><FcExpired />Applications closed</span>}
                    </div>
                    <div>
                      <p ><RxDotFilled /> <strong style={{ color: "black" }}>Job ID:</strong> {job.jobId}</p>
                      <p ><RxDotFilled /> <strong style={{ color: "black" }}>Location: </strong>{job.Location}</p>
                      <p ><RxDotFilled /> <strong style={{ color: "black" }}>Posted By: </strong>{job.postedBy}</p>
                      <p ><RxDotFilled /> <strong style={{ color: "black" }}>Date Posted: </strong>{formatDate(job.postedOn)}</p>
                    </div>

                    <div className="d-flex justify-content-end mt-4">
                      <Link to={`/SA_dash/job_desc/${job.jobId}`}>
                        <button className="btn btn-outline-secondary mx-1"><FaAngleRight /> Details</button>
                      </Link>
                      <button className="btn btn-outline-danger mx-1" onClick={() => handleDelete(job)}><MdDelete /> Delete</button>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          <p>No jobs available.</p>
        )}

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
          <Pagination
            count={Math.ceil(filteredJobs.length / jobsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            className="mt-4"
            size="large"
          />
        </Box>
      </Container>

    </div>
  );
};

export default SAViewJobs;
