// StudentDetails.js
import React, { useEffect, useState } from 'react';
import { Container, Col, Table, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { FaFilePdf } from 'react-icons/fa';
import Cookies from 'js-cookie'
import apiService from '../../../../apiService';

const StudentDetails = ({ candidateID }) => {

  const [studentData, setStudentData] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchStudentData();
    fetchAppliedJobs();
  }, [candidateID]);
  
  const HrId = Cookies.get('HRid')
  const fetchStudentData = async () => {
    try {


      const response = await apiService.get(`/api/applicant-history/?candidateID=${candidateID}`);
      setStudentData(response.data);
      console.log("Stud", response.data)


    } catch (error) {
      console.error('Error fetching student data', error);
      setErrorMsg('No data found for the student.');
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const response = await apiService.get(`/api/hr-job-applicant-history/?candidateId=${candidateID}&hrId=${HrId}`);
      setAppliedJobs(response.data);
      if (response.data.length > 0) {
        setErrorMsg('')
      } else {
        setErrorMsg('No job applications found for the student.');
      }
    } catch (error) {
      console.error('Error fetching applied jobs', error);
      setErrorMsg('No applied jobs found for the student.');
    }
  };
  const formatDate = (date) => {
    /*
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    console.log(new Date(date).toLocaleDateString(undefined, options))
    return new Date(date).toLocaleDateString(undefined, options);*/
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const handleResumeDownload = async (applicationId) => {
    try {
      console.log("Id:", applicationId);
      const url = `/api/download-resume/${applicationId.applicationID}`;
      console.log("Request URL:", url);
      const response = await apiService.getWithResponseType(url, 'blob');
      console.log("Resp", response);
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      console.log("Content", contentType)
      let extension = 'pdf'; // Default extension
      if (contentType.includes('application/pdf')) {
        extension = 'pdf';
      } else if (contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        extension = 'docx';
      } else if (contentType.includes('application/msword')) {
        extension = 'doc';
      }
      const blob = new Blob([response.data], { type: contentType });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `resume-${applicationId.fullName}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl); // Clean up
    } catch (error) {
      console.error('Error downloading the file:', error);
    }
  };

  console.log(errorMsg, appliedJobs)
  return (
    <>
      <Container className='mt-4'>
        <h2>Student data</h2>
        {studentData ? (
          <Col lg={10} sm={12} xs={12} className='mt-4'>
            <Table responsive bordered className="table">
              <thead style={{ backgroundColor: 'green' }}>
                <tr style={{ backgroundColor: 'blue' }}>
                  <th style={{ backgroundColor: '#1b74a8', color: 'white' }}>CandidateID</th>
                  <th style={{ backgroundColor: '#1b74a8', color: 'white' }}>Name</th>
                  <th style={{ backgroundColor: '#1b74a8', color: 'white' }}>Email</th>
                  <th style={{ backgroundColor: '#1b74a8', color: 'white' }}>Phone</th>
                  <th style={{ backgroundColor: '#1b74a8', color: 'white' }}>Domain</th>
                  <th style={{ backgroundColor: '#1b74a8', color: 'white' }}>Batch</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{studentData.candidateID}</td>
                  <td>{studentData.fullName}</td>
                  <td>{studentData.email}</td>
                  <td>{studentData.mobileNo}</td>
                  <td>{studentData.domain}</td>
                  <td>{studentData.batchNo}</td>
                </tr>
              </tbody>
            </Table>
          </Col>
        ) : (
          errorMsg && <Alert variant="danger">{errorMsg}</Alert>
        )}
        <h3>Job Applications</h3>

        {appliedJobs.length > 0 ? (
          <Col lg={10} sm={12} xs={12} className='mt-4'>
            <Table responsive bordered style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ backgroundColor: '#416cb0', color: '#ffffff', border: '1px solid black', padding: '8px' }}>Job ID</th>
                  <th style={{ backgroundColor: '#416cb0', color: '#ffffff', border: '1px solid black', padding: '8px' }}>Job Title</th>
                  <th style={{ backgroundColor: '#416cb0', color: '#ffffff', border: '1px solid black', padding: '8px' }}>Company</th>
                  <th style={{ backgroundColor: '#416cb0', color: '#ffffff', border: '1px solid black', padding: '8px' }}>Application Date</th>
                  <th style={{ backgroundColor: '#416cb0', color: '#ffffff', border: '1px solid black', padding: '8px' }}>Status</th>
                  <th style={{ backgroundColor: '#416cb0', color: '#ffffff', border: '1px solid black', padding: '8px' }}>Resume</th>
                </tr>
              </thead>
              <tbody>
                {appliedJobs.map(job => (
                  <tr key={job.jobID}>
                    <td>{job.jobID}</td>
                    <td><Link to={`/hr_dash/job_desc/${job.jobID}`}>{job.jobRole}</Link></td>
                    <td>{job.companyName}</td>
                    <td>{formatDate(job.applied_on)}</td>
                    <td>{job.status}</td>
                    <td
                      style={{ border: '1px solid black', padding: '8px', cursor: 'pointer', backgroundColor: '#ffffff' }}
                      onClick={() => handleResumeDownload(job)}
                    >
                      <div className='text-align-center d-flex flex-row justify-content-center'>
                        <FaFilePdf color='#2a97eb' />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        ) : (
          errorMsg && <Alert variant="danger">{errorMsg}</Alert>
        )}
      </Container>
    </>

  );
};

export default StudentDetails;
