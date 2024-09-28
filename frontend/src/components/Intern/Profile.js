import React, { useState, useRef, useEffect } from 'react';
import { Container, Button } from '@mui/material';
import { Form, Row, Col } from 'react-bootstrap';
import avatar2 from '../images/avatar2.avif';
import Cookies from 'js-cookie';
import apiService from '../../apiService';
import {toast} from 'react-toastify';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    candidateID: '',
    fullName: '',
    email: '',
    mobileNo: '',
    altMobileNo: '',
    domain: '',
    belongedToVasaviFoundation: '',
    address: '',
    batchNo: '',
    modeOfInternship: '',
  });
  const [originalFormData, setOriginalFormData] = useState({});
  const [profileImage, setProfileImage] = useState(avatar2);
  const internID = Cookies.get("internID");

  useEffect(() => {
    console.log('Fetching profile data for internID:', internID);
    apiService.get(`/api/intern_data/${internID}`)
      .then(response => {
        console.log('Response status:', response.status);
        return response.data;
      })
      .then(data => {
        console.log('Fetched data:', data);
        if (Array.isArray(data) && data.length > 0) {
          const profileData = data[0];
          
          const newFormData = {
            candidateID: profileData.candidateID,
            fullName: profileData.fullName,
            email: profileData.email,
            mobileNo: profileData.mobileNo,
            altMobileNo: profileData.altMobileNo,
            domain: profileData.domain,
            belongedToVasaviFoundation: profileData.belongedToVasaviFoundation,
            address: profileData.address,
            batchNo: profileData.batchNo,
            modeOfInternship: profileData.modeOfInternship,
          };
          
          setFormData(newFormData);
          setOriginalFormData(newFormData);
        }
      })
      .catch(error => console.error('Error fetching profile data:', error));
  }, [internID]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    const updatedProfile = {
      fullName: formData.fullName,
      email: formData.email,
      mobileNo: formData.mobileNo,
      altMobileNo: formData.altMobileNo,
      domain: formData.domain,
      belongedToVasaviFoundation: formData.belongedToVasaviFoundation,
      address: formData.address,
      batchNo: formData.batchNo,
    };
    
    try {
      const response = await apiService.put(`/api/intern_data/${internID}`, updatedProfile);
      console.log("Profile updated successfully:", response.data);
      toast.success('Updated successfully!', {
        autoClose: 5000
      });
      setIsEditing(false);
      setOriginalFormData(formData);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.warning(`${error.response.data.message}. ${error.response.data.suggestion}`);
      } else if (error.response && error.response.status === 401) {
        toast.warning(`${error.response.data.message}.`);
      } else {
        console.error('Update failed:', error);
        toast.error('Update failed. Please try again later.');
      }
      console.error("Error updating profile:", error);
    }
  };

  const handleCancel = () => {
    setFormData(originalFormData);
    setIsEditing(false);
  };

  return (
    <Container>
      <Row className='mt-3'>
        <Col md={3}>
          <div className="text-center flex-column d-flex">
            <img
              src={profileImage}
              alt="Profile"
              className="img-fluid rounded-circle img-thumbnail"
              style={{ width: '300px', height: '300px', objectFit: 'cover', marginTop: "100px" }}
            />
          </div>
        </Col>
        <Col md={8} className='ms-5'>
          <h2 className="mb-4 text-center fw-semibold border rounded p-2">
            Profile Information <i className="fa-solid fa-id-card"></i>
          <h6>Contact Admin if you want to update the details </h6>
            {/* {isEditing ? (
              <>
                <Button
                  style={{ marginLeft: "100px" }}
                  type="button"
                  onClick={handleSave}
                >
                  Save<i className="fa-solid fa-check text-dark fs-5" style={{ marginLeft: "10px", color: "blue" }}></i>
                </Button>
                <Button
                  style={{ marginLeft: "10px" }}
                  type="button"
                  onClick={handleCancel}
                >
                  Cancel<i className="fa-solid fa-times text-dark fs-5" style={{ marginLeft: "10px", color: "red" }}></i>
                </Button>
              </>
            ) : (
              <Button
                style={{ marginLeft: "200px" }}
                type="button"
                onClick={handleEdit}
              >
                <i className="fa-solid fa-edit text-dark" style={{ background: "none", height: "20px", width: "30px" }}></i>
              </Button>
            )} */}
          </h2>
          {/* <Form onSubmit={(e) => { e.preventDefault(); handleSave(); }}> */}
          <Form>
            <Form.Group controlId="formCandidateID">
              <Form.Label className="fw-bold">Candidate ID</Form.Label>
              <Form.Control
                type="text"
                name="candidateID"
                placeholder="Candidate ID"
                value={formData.candidateID}
                onChange={handleChange}
                disabled
              />
            </Form.Group>

            <Form.Group controlId="formFullName">
              <Form.Label className="fw-bold">Full Name</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Form.Group>

            <Form.Group controlId="formEmail">
              <Form.Label className="fw-bold">Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled
              />
            </Form.Group>

            <Form.Group controlId="formMobileNo">
              <Form.Label className="fw-bold">Mobile Number</Form.Label>
              <Form.Control
                type="tel"
                name="mobileNo"
                placeholder=""
                value={formData.mobileNo}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Form.Group>

            <Form.Group controlId="altMobileNo">
              <Form.Label className="fw-bold">Parent/Gaurdian Mobile Number</Form.Label>
              <Form.Control
                type="tel"
                name="altMobileNo"
                placeholder=""
                value={formData.altMobileNo}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Form.Group>

            <Form.Group controlId="formDomain">
              <Form.Label className="fw-bold">Domain</Form.Label>
              <Form.Control
                type="text"
                name="domain"
                placeholder="Software Development"
                value={formData.domain}
                onChange={handleChange}
                disabled
              />
            </Form.Group>

            <Form.Group controlId="formBelongedToVasaviFoundation">
              <Form.Label className="fw-bold">Belonged to Vasavi Foundation</Form.Label>
              <Form.Control
                type="text"
                name="belongedToVasaviFoundation"
                placeholder="Yes/No"
                value={formData.belongedToVasaviFoundation}
                onChange={handleChange}
                disabled
              />
            </Form.Group>

            <Form.Group controlId="formAddress">
              <Form.Label className="fw-bold">Address</Form.Label>
              <Form.Control
                type="text"
                rows={3}
                name="address"
                placeholder="123 Main St, City, Country"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Form.Group>

            <Form.Group controlId="formBatchNo">
              <Form.Label className="fw-bold">Batch Number</Form.Label>
              <Form.Control
                type="text"
                name="batchNo"
                value={formData.batchNo}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Form.Group>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;