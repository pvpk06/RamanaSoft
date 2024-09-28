import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import apiService from '../../apiService';
import { Card, Container, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';

const AppliedJobs = () => {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const internID = Cookies.get('internID');

  useEffect(() => {
    fetchAppliedJobs();
  }, []);

  const fetchAppliedJobs = async () => {
    try {
      const response = await apiService.get(`/api/applied-jobs/${internID}`);
      console.log("response :", response);
      setAppliedJobs(response.data);
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
    }
  };

  const getStatusColor = (status) => {
    if (status.toLowerCase() === 'eligible') return 'green';
    if (status.toLowerCase() === 'not-interested' || status.toLowerCase() === 'not-eligible') return 'red';
    return 'blue';
  };

  return (
    <Container>
      <h2 className="mb-4">Applied Jobs</h2>
      <Row>
        {appliedJobs.length > 0 ? (
          appliedJobs.map((job) => (
            <Col key={job.jobId} sm={12} md={6} lg={4} className="mb-4">
              <Card style={{ borderRadius: '10px', border: '1px solid #ddd' }}>
                <Card.Body>
                  <Card.Title>{job.jobRole}</Card.Title>
                  <Card.Text>
                    <strong>Job ID:</strong> {job.jobID}
                  </Card.Text>
                  <Card.Text>
                    <strong>Company Name:</strong> {job.companyName}
                  </Card.Text>
                  <Card.Text>
                    <strong>Applied On:</strong> {new Date(job.applied_on).toLocaleDateString()}
                  </Card.Text>
                  <Card.Text>
                    <strong>Posted By HR:</strong> {job.hrName}
                  </Card.Text>
                  <Card.Text>
                    <strong>HR Contact:</strong> {job.hrContact}
                  </Card.Text>
                  
                  <span style={{display:"flex", gap:"5px"}}>
                  <strong>Status:</strong>
                  <Card.Text style={{ color: getStatusColor(job.status), fontWeight: 'bold' }}>
                     {job.status}
                  </Card.Text>
                  </span>
                  
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p>No jobs applied yet.</p>
        )}
      </Row>
    </Container>
  );
};

export default AppliedJobs;
