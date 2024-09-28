import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Grid, Typography, Box, Pagination } from '@mui/material';
import { Link } from 'react-router-dom';
import { FaAngleRight } from 'react-icons/fa';
import apiService from '../../../apiService';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaEdit, FaTrash } from 'react-icons/fa';

const DisplayHRs = () => {
  const [hrs, setHrs] = useState([]);
  const [editingHr, setEditingHr] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hrsPerPage] = useState(10);
  const [selectedHRid, setSelectedHRid] = useState(null);
  const [hrJobs, setHrJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [errors, setErrors] = useState({})
  const [searchQuery, setSearchQuery] = useState('');


  useEffect(() => {
    const fetchHrs = async () => {
      try {
        const response = await apiService.get('/api/hr_data');
        setHrs(response.data);
      } catch (error) {
        console.error('Error fetching HR data:', error);
      }
    };

    fetchHrs();
  }, []);

  const validationSchema = Yup.object({
    fullName: Yup.string().matches(/^[a-zA-Z\s]+$/, 'Invalid name').required('Full Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    workEmail: Yup.string().email('Invalid email address').required('Work Email is required'),
    mobileNo: Yup.string().matches(/^[6-9]\d{9}$/, 'Invalid mobile number').required('Mobile number is required'),
    workMobile: Yup.string().matches(/^[6-9]\d{9}$/, 'Invalid mobile number').required('Work mobile number is required'),
    emergencyContactName: Yup.string().matches(/^[a-zA-Z\s]+$/, 'Invalid name').required('Emergency Contact Name is required'),
    emergencyContactMobile: Yup.string().matches(/^[6-9]\d{9}$/, 'Invalid mobile number').required('Emergency Contact Mobile is required'),
    emergencyContactAddress: Yup.string().matches(/^[\w\s,./-]+$/, 'Invalid address').required('Emergency Contact Address is required'),
    address: Yup.string().matches(/^[\w\s,./-]+$/, 'Invalid address').required('Address is required'),
    gender: Yup.string().matches(/^(Male|Female|Other)$/, 'Invalid gender').required('Gender is required'),
    branch: Yup.string().matches(/^[a-zA-Z0-9\s]+$/, 'Invalid branch').required('Branch is required'),
  });

  const formik = useFormik({
    initialValues: editingHr || {},
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        delete values.id;
        await apiService.put(`/api/hr_data/${values.HRid}`, values);
        // Optionally update HR list and reset editing state
        setHrs(hrs.map(hr => hr.HRid === values.HRid ? values : hr));
        setEditingHr(null);
      } catch (error) {
        console.error('Error updating HR:', error);
      }
    }
  });

  const getRegexPattern = (key) => {
    switch (key) {
      case 'email':
      case 'workEmail':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      case 'fullName':
      case 'emergencyContactName':
        return /^[a-zA-Z\s]+$/;
      case 'mobileNo':
      case 'workMobile':
      case 'emergencyContactMobile':
        return /^[6-9]\d{9}$/;
      case 'address':
      case 'emergencyContactAddress':
        return /^[\w\s,./-]+$/;
      case 'gender':
        return /^(Male|Female|Other)$/;
      case 'branch':
        return /^[a-zA-Z0-9\s]+$/;
      default:
        return null;
    }
  };


  const handleDelete = async (HRid) => {
    try {
      await apiService.delete(`/api/delete_hr/${HRid}`);
      setHrs(hrs.filter(hr => hr.HRid !== HRid));
    } catch (error) {
      console.error('Error deleting HR:', error);
    }
  };

  const handleEditClick = (hr) => {
    setEditingHr(hr);
  };

  const handleCancelEdit = () => {
    setEditingHr(null);
  };


  const handleChange = (e) => {
    const { name, value } = e.target;

    const pattern = getRegexPattern(name);
    setEditingHr((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (pattern && !pattern.test(value)) {
      setErrors((prev) => ({
        ...prev,
        [name]: `Invalid ${name.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}`,
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };



  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      console.log(editingHr);
      delete editingHr["id"];
      await apiService.put(`/api/hr_data/${editingHr.HRid}`, editingHr);
      //setHrs(hrs.map(hr => hr.HRid === editingHr.HRid ? editingHr : hr));
      //setEditingHr(null);
    } catch (error) {
      console.error('Error updating HR:', error);
    }
  };

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const fetchHrJobs = async (HRid) => {
    try {
      const response = await apiService.get(`/api/hr_jobs/${HRid}`);
      setHrJobs(response.data);
    } catch (error) {
      console.error('Error fetching HR jobs:', error);
    }
  };

  const getMaxDate = () => {
    const today = new Date();
    const maxYear = today.getFullYear() - 20;
    const maxDate = new Date(maxYear, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0]; // format YYYY-MM-DD
  };

  const fetchJobDetails = async (jobId) => {
    try {
      const response = await apiService.get(`/api/job_details/${jobId}`);
      setJobDetails(response.data);
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
  };

  const handleHRidClick = async (HRid) => {
    setSelectedHRid(HRid);
    await fetchHrJobs(HRid);
  };

  const handleJobDetailsClick = async (jobId) => {
    setSelectedJobId(jobId);
    await fetchJobDetails(jobId);
  };

  const filteredHrs = hrs.filter((hr) =>
    Object.values(hr)
      .join(' ')
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const indexOfLastHr = currentPage * hrsPerPage;
  const indexOfFirstHr = indexOfLastHr - hrsPerPage;
  const currentHrs = filteredHrs.slice(indexOfFirstHr, indexOfLastHr);

  const totalPages = Math.ceil(filteredHrs.length / hrsPerPage);

  const tableStyles = {
    table: {
      minWidth: 650,
      backgroundColor: '#f5f5f5',
      width: '100%', // Adjusts table width to fit the screen
    },
    headCell: {
      backgroundColor: '#1f2c39',
      color: '#ffffff',
      textAlign: 'center',
      fontWeight: 'bold',
      padding: '16px',
      fontSize: '1rem', // Default font size
    },
    row: {
      '&:nth-of-type(odd)': {
        backgroundColor: '#fafafa',
        textAlign: 'center',
      },
      '&:hover': {
        backgroundColor: '#e0e0e0',
      },
    },
    cell: {
      padding: '16px',
      textAlign: 'center',
      fontSize: '0.875rem', // Default font size
    },
    '@media (max-width: 768px)': { // For screens smaller than 768px
      headCell: {
        padding: '12px',
        fontSize: '0.875rem', // Smaller font size for smaller screens
      },
      cell: {
        padding: '12px',
        fontSize: '0.75rem', // Smaller font size for smaller screens
      },
    },
    '@media (max-width: 480px)': { // For screens smaller than 480px
      headCell: {
        padding: '8px',
        fontSize: '0.75rem', // Even smaller font size
      },
      cell: {
        padding: '8px',
        fontSize: '0.625rem', // Even smaller font size
      },
    },
  };


  console.log(hrs);
  return (
    <div>
      {selectedJobId && jobDetails ? (
        <div>
          <Typography variant="h6" gutterBottom>Job Details for Job ID: {selectedJobId}</Typography>
          <Button variant="contained" color="primary" onClick={() => setSelectedJobId(null)}>Back</Button>
          <div>
            <p>Job Role: {jobDetails.jobRole}</p>
            <p>Company: {jobDetails.companyName}</p>
            <p>Location: {jobDetails.jobCity}</p>
            <p>Salary: {jobDetails.salary}</p>
            <p>Posted On: {jobDetails.postedOn}</p>
            <p>Last Date: {jobDetails.lastDate}</p>
            <p>Job Status: {jobDetails.jobStatus}</p>
            <p>Number of Applicants: {jobDetails.numApplicants}</p>
          </div>
        </div>
      ) : selectedHRid ? (
        <div>
          <Typography variant="h6" gutterBottom>Jobs posted by HR ID: {selectedHRid}</Typography>
          <Button variant="contained" style={{ backgroundColor: '#1f2c39', marginBottom: '10px', display: 'flex' }} onClick={() => setSelectedHRid(null)}>Back</Button>
          <TableContainer component={Paper}>
            <Table style={tableStyles.table}>
              <TableHead>
                <TableRow>
                  <TableCell style={tableStyles.headCell}>Job ID</TableCell>
                  <TableCell style={tableStyles.headCell}>Role</TableCell>
                  <TableCell style={tableStyles.headCell}>Company</TableCell>
                  <TableCell style={tableStyles.headCell}>Location</TableCell>
                  <TableCell style={tableStyles.headCell}>Salary</TableCell>
                  <TableCell style={tableStyles.headCell}>Posted On</TableCell>
                  <TableCell style={tableStyles.headCell}>Last Date</TableCell>
                  <TableCell style={tableStyles.headCell}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hrJobs.map(job => (
                  <TableRow key={job.jobId} style={tableStyles.row}>
                    <TableCell style={tableStyles.cell}>{job.jobId}</TableCell>
                    <TableCell style={tableStyles.cell}>{job.jobTitle}</TableCell>
                    <TableCell style={tableStyles.cell}>{job.companyName}</TableCell>
                    <TableCell style={tableStyles.cell}>{job.Location}</TableCell>
                    <TableCell style={tableStyles.cell}>{job.salary}</TableCell>
                    <TableCell style={tableStyles.cell}>{job.postedOn}</TableCell>
                    <TableCell style={tableStyles.cell}>{job.lastDate}</TableCell>
                    <TableCell style={tableStyles.cell}>
                      <Link to={`/SA_dash/job_desc/${job.jobId}`}>
                        <button className="btn btn-outline-secondary mx-1"><FaAngleRight /> Details</button>
                      </Link>                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      ) : (
        editingHr ? (
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ marginBottom: 4 }}>
            <Button
              variant="contained"
              style={{
                backgroundColor: '#1f2c39',
                marginBottom: '10px',
                display: 'flex'
              }}
              onClick={handleCancelEdit}
              sx={{
                width: { xs: '100%', sm: 'auto' }, // Full width on small screens
                justifyContent: { xs: 'center', sm: 'flex-start' },
              }}
            >
              Back
            </Button>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                textAlign: { xs: 'center', sm: 'left' }, // Centered on small screens
                fontSize: { xs: '1.5rem', sm: '2rem' },  // Smaller font on small screens
              }}
            >
              Edit HR
            </Typography>
            <Grid container spacing={2} direction="column">
              {Object.keys(editingHr).filter(key => !['id', 'HRid', "workEmail", "workMobile"].includes(key)).map((key) => (
                (key !== 'id' || key !== "email" || key !== 'workEmail' || key !== 'mobileNo') && (
                  <Grid item xs={12} sm={6} key={key}>
                    <TextField
                      fullWidth
                      label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                      name={key}
                      value={editingHr[key] || ''}
                      onChange={handleChange}
                      disabled={key === 'HRid' || key === 'workMobile' || key === 'workEmail'}
                      required
                      type={key === 'dob' ? 'date' : 'text'}
                      InputLabelProps={key === 'dob' ? { shrink: true } : {}}
                      inputProps={{
                        ...(key === 'mobileNo' || key === "workMobile" || key === 'emergencyContactMobile' ? { maxLength: 10 } : {}),
                        pattern: getRegexPattern(key)?.source,
                        ...(key === 'dob' ? { max: getMaxDate() } : {})
                      }}
                      error={!!errors[key]}
                      helperText={errors[key]}
                      sx={{
                        marginBottom: { xs: '16px', sm: '0' }, // Extra margin on small screens
                      }}
                    />
                  </Grid>
                )
              ))}
              <Grid item xs={12} sm={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  style={{ marginRight: '10px' }}
                  sx={{
                    width: { xs: '100%', sm: 'auto' }, // Full width on small screens
                    marginBottom: { xs: '16px', sm: '0' },
                  }}
                >
                  Update
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="outlined"
                  color="secondary"
                  sx={{
                    width: { xs: '100%', sm: 'auto' }, // Full width on small screens
                  }}
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <>
            <Box sx={{ marginBottom: 2, display: 'flex', justifyContent: 'center' }}>
              <TextField
                variant="outlined"
                placeholder="Search here..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  width: { xs: '100%', sm: '70%' }, // Full width on small screens
                }}
              />
            </Box>




            <TableContainer component={Paper}>
              <Table style={tableStyles.table}>
                <TableHead>
                  <TableRow>
                    <TableCell style={tableStyles.headCell}>HR ID</TableCell>
                    <TableCell style={tableStyles.headCell}>Name</TableCell>
                    <TableCell style={tableStyles.headCell}>Email</TableCell>
                    <TableCell style={tableStyles.headCell}>Work Email</TableCell>
                    <TableCell style={tableStyles.headCell}>Mobile</TableCell>
                    <TableCell style={tableStyles.headCell}>Branch</TableCell>
                    <TableCell style={tableStyles.headCell}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentHrs.map(hr => (
                    <TableRow key={hr.HRid} style={tableStyles.row}>
                      <TableCell style={tableStyles.cell}>
                        <button
                          onClick={() => handleHRidClick(hr.HRid)}
                          style={{ color: 'blue', border: 'none', background: 'none' }}
                        >
                          {hr.HRid}
                        </button>
                      </TableCell>
                      <TableCell style={tableStyles.cell}>{hr.fullName}</TableCell>
                      <TableCell style={tableStyles.cell}>{hr.email}</TableCell>
                      <TableCell style={tableStyles.cell}>{hr.workEmail}</TableCell>
                      <TableCell style={tableStyles.cell}>{hr.workMobile}</TableCell>
                      <TableCell style={tableStyles.cell}>{hr.branch}</TableCell>
                      <TableCell sx={{ display: 'flex' }}>
                        <Button onClick={() => handleEditClick(hr)} sx={{ minWidth: 0, padding: 0 }}>
                          <FaEdit style={{ width: '40px', color: '#1f2c39' }} />
                        </Button>
                        <Button onClick={() => handleDelete(hr.HRid)} sx={{ minWidth: 0, padding: 0 }}>
                          <FaTrash style={{ width: '40px', color: '#1f2c39' }} />
                        </Button>
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>

            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                sx={{
                  '.MuiPagination-ul': {
                    justifyContent: 'center',
                  },
                  '.MuiPaginationItem-root': {
                    fontSize: { xs: '0.75rem', sm: '1rem' }, // Smaller pagination buttons on small screens
                  },
                }}
              />
            </Box>
          </>
        )
      )}
    </div>
  );
};

export default DisplayHRs;
