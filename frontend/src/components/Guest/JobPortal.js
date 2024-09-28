import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Modal, Button, Form } from 'react-bootstrap';
import { Box, Pagination } from '@mui/material';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import apiService from '../../apiService';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { FaChevronRight } from 'react-icons/fa';

const qualifications = [
  'High School', 'Diploma', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD'
];

const experienceOptions = [
  '0-6 months', '6 months-1 year', '1-2 years', '2-3 years', '3-5 years', '5+ years'
];

const cities = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune'
];

const technologies = [
  'JavaScript', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin'
];

const initialValues = {
  jobId: '',
  companyName: '',
  jobRole: '',
  guestID: '',
  fullName: '',
  email: '',
  mobileNumber: '',
  qualification: '',
  yearOfPassedOut: '',
  gender: '',
  dateOfBirth: '',
  experience: '',
  location: '',
  technology: '',
  megaDrive: '',
  resume: null,
};

const validationSchema = Yup.object({
  qualification: Yup.string().required('Qualification is required'),
  yearOfPassedOut: Yup.number()
    .required('Year of Passed Out is required')
    .min(new Date().getFullYear() - 18, `Year must not be earlier than ${new Date().getFullYear() - 18}`)
    .max(new Date().getFullYear(), `Year must not be later than ${new Date().getFullYear()}`),
  gender: Yup.string().required('Gender is required'),
  dateOfBirth: Yup.date()
    .required('Date of Birth is required')
    .max(new Date(new Date().setFullYear(new Date().getFullYear() - 18)), 'You must be at least 18 years old'), experience: Yup.string().required('Experience is required'),
  location: Yup.string().required('Location is required'),
  technology: Yup.string().required('Technology is required'),
  megaDrive: Yup.string().required('Mega Drive is required'),
  resume: Yup.mixed()
    .required('Resume is required')
    .test('fileType', 'Only PDF files are allowed', value =>
      value && value.type === 'application/pdf'
    ),
});

const JobPortal = ({ setSelectedView }) => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(6);
  const guestID = Cookies.get("guestID");
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedJobRole, setSelectedJobRole] = useState('');
  const [jobRoles, setJobRoles] = useState([]);
  const [isApplying, setIsApplying] = useState(false);
  const [internData, setInternData] = useState({});
  const Nav = useNavigate();
  const years = [2020, 2021, 2022, 2023, 2024];
  const months = [
    { value: '', label: 'Select Month' },
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  useEffect(() => {
    fetchJobs();
    if (guestID) {
      fetchInternDetails();
    }
  }, [guestID]);

  const fetchJobs = async () => {
    try {
      const response = await apiService.get(`/api/intern-view-jobs/${guestID}`);
      setJobs(response.data);
      const uniqueRoles = [...new Set(response.data.map(job => job.jobTitle))];
      setJobRoles(uniqueRoles);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error(`${error.response?.data?.error || 'An error occurred'}`, {
        autoClose: 5000
      });
    }
  };

  const fetchInternDetails = async () => {
    try {
      const response = await apiService.get(`/api/guest_data/${guestID}`);
      setInternData(response.data[0]);
    } catch (error) {
      console.error('Error fetching intern details:', error);
      toast.error(`${error.response?.data?.error || 'An error occurred'}`, {
        autoClose: 5000
      });
    }
  };

  const filterJobs = () => {
    const filtered = jobs.filter(job => {
      const jobDate = new Date(job.postedOn);
      const jobYear = jobDate.getFullYear().toString();
      const jobMonth = String(jobDate.getMonth() + 1).padStart(2, '0');

      const yearMatch = selectedYear ? jobYear === selectedYear : true;
      const monthMatch = selectedMonth ? jobMonth === selectedMonth : true;
      const jobRoleMatch = selectedJobRole ? job.jobTitle === selectedJobRole : true;
      return yearMatch && monthMatch && jobRoleMatch;
    });
    setFilteredJobs(filtered);
  };

  useEffect(() => {
    filterJobs();
  }, [jobs, selectedYear, selectedMonth, selectedJobRole]);

  const handleCardClick = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const handleApplyNow = () => {
    setShowModal(false);
    setIsApplying(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedJob(null);
    setIsApplying(false);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleBackToJobs = () => {
    setIsApplying(false);
    setSelectedJob(null);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleJobRoleChange = (e) => {
    setSelectedJobRole(e.target.value);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toISOString().split('T')[0];
  };

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const paginate = (event, value) => setCurrentPage(value);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const handleSubmit = async (values) => {
    try {
      const formDataToSend = new FormData();
      Object.keys(values).forEach(key => {
        if (key === 'resume') {
          formDataToSend.append(key, values[key]);
        } else {
          formDataToSend.append(key, values[key]);
        }
      });
      formDataToSend.append("applied_on", new Date().toISOString());

      const response = await apiService.post('/api/guest-apply-job', formDataToSend);
      console.log('Application submitted successfully:', response.data);
      toast.success('Applied successfully!', { autoClose: 5000 });
      setSelectedView("Applied");
    } catch (error) {
      console.error('Error applying for job:', error);
      toast.error(`${error.response?.data?.error || 'An error occurred while submitting the application'}`, {
        autoClose: 5000
      });
    }
  };

  const clearFilters = () => {
    setSelectedYear('');
    setSelectedMonth('');
    setSelectedJobRole('');
    setFilteredJobs(jobs);
  };

  return (
    <div>
      <Container className="my-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h1 style={{ color: '#888888', fontWeight: 'bold', fontSize: '25px' }}>Available Jobs</h1>
          <div style={{ display: "flex" }}>
            <select
              id="JobRole"
              name="JobRole"
              value={selectedJobRole}
              onChange={handleJobRoleChange}
              style={{ padding: '10px', fontSize: '16px' }}
            >
              <option value="">Select Job Role</option>
              {jobRoles.map((role, index) => (
                <option key={index} value={role}>{role}</option>
              ))}
            </select>
            <Button
              onClick={clearFilters}
              style={{ marginLeft: '10px', padding: '10px', fontSize: '16px' }}
            >
              Clear
            </Button>
          </div>
        </div>
      </Container>

      <Container className="px-0 ml-auto mr-auto mb-5" style={{ overflow: "auto" }}>
        {isApplying ? (
          <div className="container mt-5">
            <h2 className="mb-4">Job Application Form</h2>
            <Formik
              initialValues={{
                ...initialValues,
                jobId: selectedJob.jobId,
                companyName: selectedJob.companyName,
                jobRole: selectedJob.jobTitle,
                guestID: guestID,
                fullName: internData.fullName || '',
                email: internData.email || '',
                mobileNumber: internData.mobileno || '',
                qualification: internData.qualification || '',
                yearOfPassedOut: internData.yearOfPassedOut || '',
                gender: internData.gender || '',
                dateOfBirth: internData.dateOfBirth ? formatDate(internData.dateOfBirth) : '',
                experience: internData.experience || '',
                location: internData.location || '',
                technology: internData.technology || '',
                megaDrive: internData.megaDrive || '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ handleSubmit }) => (
                <Form onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(e);
                }}>
                  <Field name="jobRole">
                    {({ field }) => (
                      <Form.Group className="mb-3">
                        <Form.Label>Job Role *</Form.Label>
                        <Form.Control {...field} type="text" readOnly />
                      </Form.Group>
                    )}
                  </Field>
                  <ErrorMessage name="jobRole" component="div" className="text-danger" />

                  <Field name="companyName">
                    {({ field }) => (
                      <Form.Group className="mb-3">
                        <Form.Label>Company Name *</Form.Label>
                        <Form.Control {...field} type="text" readOnly />
                      </Form.Group>
                    )}
                  </Field>
                  <ErrorMessage name="companyName" component="div" className="text-danger" />

                  <Field name="jobId">
                    {({ field }) => (
                      <Form.Group className="mb-3">
                        <Form.Label>Job ID *</Form.Label>
                        <Form.Control {...field} type="text" readOnly />
                      </Form.Group>
                    )}
                  </Field>
                  <ErrorMessage name="jobId" component="div" className="text-danger" />

                  <Field name="guestID">
                    {({ field }) => (
                      <Form.Group className="mb-3">
                        <Form.Label>Candidate ID *</Form.Label>
                        <Form.Control {...field} type="text" readOnly />
                      </Form.Group>
                    )}
                  </Field>
                  <ErrorMessage name="guestID" component="div" className="text-danger" />

                  <Field name="fullName">
                    {({ field }) => (
                      <Form.Group className="mb-3">
                        <Form.Label>Full Name *</Form.Label>
                        <Form.Control {...field} type="text" readOnly />

                      </Form.Group>
                    )}
                  </Field>
                  <ErrorMessage name="fullName" component="div" className="text-danger" />

                  <Field name="email">
                    {({ field }) => (
                      <Form.Group className="mb-3">
                        <Form.Label>Email *</Form.Label>
                        <Form.Control {...field} type="email" readOnly />
                      </Form.Group>
                    )}
                  </Field>
                  <ErrorMessage name="email" component="div" className="text-danger" />

                  <Field name="mobileNumber">
                    {({ field }) => (
                      <Form.Group className="mb-3">
                        <Form.Label>Mobile Number *</Form.Label>
                        <Form.Control {...field} type="tel" />
                      </Form.Group>
                    )}
                  </Field>
                  <ErrorMessage name="mobileNumber" component="div" className="text-danger" />

                  <Field name="qualification">
                    {({ field }) => (
                      <Form.Group className="mb-3">
                        <Form.Label>Qualification *</Form.Label>
                        <Form.Select {...field}>
                          <option value="">Select qualification</option>
                          {qualifications.map((qual, index) => (
                            <option key={index} value={qual}>{qual}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    )}
                  </Field>
                  <ErrorMessage name="qualification" component="div" className="text-danger" />

                  <Field name="yearOfPassedOut">
                    {({ field }) => (
                      <Form.Group className="mb-3">
                        <Form.Label>Year of Passed Out *</Form.Label>
                        <Form.Control {...field} type="number" />
                      </Form.Group>
                    )}
                  </Field>
                  <ErrorMessage name="yearOfPassedOut" component="div" className="text-danger" />

                  <Field name="gender">
                    {({ field }) => (
                      <Form.Group className="mb-3">
                        <Form.Label>Gender *</Form.Label>
                        <Form.Select {...field}>
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </Form.Select>
                      </Form.Group>
                    )}
                  </Field>
                  <ErrorMessage name="gender" component="div" className="text-danger" />

                  <Field name="dateOfBirth">
                    {({ field }) => (
                      <Form.Group className="mb-3">
                        <Form.Label>Date of Birth *</Form.Label>
                        <Form.Control {...field} type="date" />
                      </Form.Group>
                    )}
                  </Field>
                  <ErrorMessage name="dateOfBirth" component="div" className="text-danger" />

                  <Field name="experience">
                    {({ field }) => (
                      <Form.Group className="mb-3">
                        <Form.Label>Experience *</Form.Label>
                        <Form.Select {...field}>
                          <option value="">Select experience</option>
                          {experienceOptions.map((exp, index) => (
                            <option key={index} value={exp}>{exp}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    )}
                  </Field>
                  <ErrorMessage name="experience" component="div" className="text-danger" />

                  <Field name="location">
                    {({ field }) => (
                      <Form.Group className="mb-3">
                        <Form.Label>Location *</Form.Label>
                        <Form.Select {...field}>
                          <option value="">Select location</option>
                          {cities.map((city, index) => (
                            <option key={index} value={city}>{city}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    )}
                  </Field>
                  <ErrorMessage name="location" component="div" className="text-danger" />

                  <Field name="technology">
                    {({ field }) => (
                      <Form.Group className="mb-3">
                        <Form.Label>Technology *</Form.Label>
                        <Form.Select {...field}>
                          <option value="">Select technology</option>
                          {technologies.map((tech, index) => (
                            <option key={index} value={tech}>{tech}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    )}
                  </Field>
                  <ErrorMessage name="technology" component="div" className="text-danger" />

                  <Field name="megaDrive">
                    {({ field }) => (
                      <Form.Group className="mb-3">
                        <Form.Label>Mega Drive *</Form.Label>
                        <Form.Select {...field}>
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </Form.Select>
                      </Form.Group>
                    )}
                  </Field>
                  <ErrorMessage name="megaDrive" component="div" className="text-danger" />
                  <Form.Group className="mb-3">
                    <Form.Label>Resume *</Form.Label>
                    <Field name="resume">
                      {({ field, form }) => (
                        <div>
                          <input
                            type="file"
                            onChange={(event) => {
                              const file = event.currentTarget.files[0];
                              console.log("Selected file:", file);
                              form.setFieldValue("resume", file);
                            }}
                            onBlur={() => form.setFieldTouched("resume", true)}
                            style={{
                              display: 'block',
                              marginBottom: '10px',
                              border: '1px solid #ced4da',
                              borderRadius: '4px',
                              padding: '6px 12px',
                              fontSize: '16px',
                            }}
                          />

                          <ErrorMessage name="resume" component="div" className="text-danger" style={{ marginTop: '5px' }} />
                        </div>
                      )}
                    </Field>

                  </Form.Group>

                  {/* <Button
                    type="submit"
                    style={{
                      backgroundColor: '#007bff', // Primary color
                      borderColor: '#007bff', // Primary border color
                      color: '#fff', // Text color
                      padding: '10px 20px', // Padding
                      fontSize: '16px', // Font size
                      borderRadius: '5px', // Rounded corners
                      border: 'none', // Remove border
                      cursor: 'pointer', // Pointer cursor on hover
                    }}
                  >
                    Apply
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleBackToJobs}
                    style={{
                      backgroundColor: '#6c757d', // Secondary color
                      borderColor: '#6c757d', // Secondary border color
                      color: '#fff', // Text color
                      padding: '10px 20px', // Padding
                      fontSize: '16px', // Font size
                      borderRadius: '5px', // Rounded corners
                      border: 'none', // Remove border
                      cursor: 'pointer', // Pointer cursor on hover
                      margin: '10px', // Margin
                    }}
                  >
                    Back
                  </Button> */}

                  <Button type="submit">
                    Apply
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleBackToJobs} style={{ margin: '10px' }}>
                    Back
                  </Button>
                </Form>
              )}
            </Formik>
          </div>
        ) : (
          <>
            <Container>
              <Row>
                {currentJobs.length > 0 ? (
                  currentJobs.map((job) => (
                    <Col key={job._id} sm={12} md={6} lg={4} className="mb-4">
                      <div
                        style={{
                          borderRadius: '10px',
                          border: '1px solid #ddd',
                          background: "white",
                          height: '350px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          padding: '16px',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        <div>
                          <h5
                            style={{
                              fontWeight: 'bold',
                              fontSize: '1.25rem',
                              marginBottom: '8px',
                            }}
                          >
                            {job.jobTitle}
                          </h5>
                          <p
                            style={{
                              color: '#6c757d',
                              marginBottom: '15px',
                            }}
                          >
                            {job.companyName}
                          </p>
                        </div>
                        <p style={{ marginBottom: '10px' }}>
                          <strong><i className="fa-solid fa-id-badge"></i> Job ID :</strong> {job.jobId}
                        </p>
                        <p style={{ marginBottom: '10px' }}>
                          <strong><i className="fa-solid fa-calendar-alt"></i> Posted On :</strong> {formatDate(job.postedOn)}
                        </p>
                        <p style={{ marginBottom: '10px' }}>
                          <strong><i className="fa-solid fa-chalkboard"></i> Skills Required :</strong> {job.requiredSkills}
                        </p>
                        <p style={{ marginBottom: '10px' }}>
                          <strong><i className="fa-solid fa-money-check-alt"></i> Salary :</strong> {job.salary}
                        </p>
                        <span style={{
                          cursor: "pointer",
                          textAlign: "right",
                          textDecoration: 'none',
                          color: '#53289e',
                          fontWeight: '500',
                          marginRight: "30px",
                          marginTop: '20px',
                          marginBottom: "20px"
                        }}>
                          <a href onClick={() => handleCardClick(job)}> View Details
                            <FaChevronRight style={{ marginLeft: '8px', marginBottom: "2px" }} size={15} />
                          </a>
                        </span>
                      </div>
                    </Col>
                  ))
                ) : (
                  <p>No jobs found</p>
                )}
              </Row>
            </Container>
            {filteredJobs.length > jobsPerPage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={paginate}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Container>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Job Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedJob ? (
            <>
              <p><strong></strong> {selectedJob.jobTitle}</p>
              <p><strong>JobID:</strong> {selectedJob.jobId}</p>
              <p><strong>Company Name:</strong> {selectedJob.companyName}</p>
              <p><strong>Description:</strong> {selectedJob.jobDescription}</p>
              <p><strong>Experience :</strong> {selectedJob.jobExperience}</p>
              <p><strong>Qualification :</strong> {selectedJob.jobQualification}</p>
              <p><strong>Skills Required:</strong> {selectedJob.requiredSkills}</p>
              <p><strong>Location:</strong> {selectedJob.Location}</p>
              <p><strong>Salary:</strong> {selectedJob.salary}</p>
              <p><strong>Posted Date:</strong> {formatDate(selectedJob.postedOn)}</p>
              <p><strong>Last Date:</strong> {formatDate(selectedJob.lastDate)}</p>
            </>
          ) : (
            <p>Loading job details...</p>
          )}
        </Modal.Body>
        {/* <Modal.Footer>
          {selectedJob && (
            <Button
              variant="primary"
              onClick={handleApplyNow}
            >
              Apply Now
            </Button>
          )}
        </Modal.Footer> */}

        <Modal.Footer>
          {selectedJob && (
            <Button
              variant="primary"
              onClick={handleApplyNow}
            >
              {isApplying ? 'Applying...' : 'Apply Now'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default JobPortal;