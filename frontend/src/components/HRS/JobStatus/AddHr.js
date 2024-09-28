import React, { useEffect, useState } from 'react';
import apiService from '../../../apiService';
import { toast } from 'react-toastify';
import { Container, Row, Col } from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom';
const HrId = Cookies.get('HRid')
const AddHr = ({ closeModal }) => {
  const [formData, setFormData] = useState({
    hrName: '',
    companyName: '',
    website: '',
    email: '',
    phoneNumber: '',
    address: '',
    hrId: HrId
  });
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [companies, setCompanies] = useState([])

  useEffect(() => {
    const fetchCompanies = async () => {
      const response = await apiService.get(`/api/view-companies`)
      console.log(response)
      setCompanies(response.data)
    }
    fetchCompanies()
  }, [])

  const isExistingCompany = (company) => {

    if (company !== '') {
      const filteredCompanies = companies.filter(comp => comp.companyName.toLowerCase().split(" ").join("") === company.trim().toLowerCase().split(" ").join(""))
      if (filteredCompanies.length > 0) {
        return true;
      }
    }
    return false;

  }

  const validate = (field, value) => {
    const errors = {};

    if (field === 'hrName' && !value) {
      errors.hrName = 'HR name is required';
    }

    if (field === 'companyName') {
      if (!value) {
        errors.companyName = 'Company name is required';

      } else if (!/^[A-Za-z]([A-Za-z0-9 .,&'-]*[A-Za-z0-9])?$/.test(value)) {
        errors.companyName = 'Invalid company name'
      }
      else {
        // Check if the company already exists
        const exists = isExistingCompany(value);
        console.log(exists)
        if (exists) {
          errors.companyName = 'Company already exists';
        }
      }
    }

    if (field === 'website') {
      if (!value) {
        errors.website = 'Website is required';
      } else if (!/^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g.test(value)) {
        console.log("Heeee")
        errors.website = 'Invalid website format';
      }

    }

    if (field === 'email') {
      if (!value) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        errors.email = 'Email address is invalid';
      }
    }

    if (field === 'phoneNumber') {
      if (!value) {
        errors.phoneNumber = 'Phone number is required';
      } else if (!/^[6-9]\d{9}$/.test(value)) {
        errors.phoneNumber = 'Phone number is invalid';
      }
    }

    if (field === 'address' && !value) {
      errors.address = 'Address is required';
    }
    return errors;
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };
  console.log(errors)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const validationErrors = validate(name, value);
    setErrors({ ...errors, ...validationErrors });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allErrors = {};
    Object.keys(formData).forEach((key) => {
      const validationErrors = validate(key, formData[key]);
      if (Object.keys(validationErrors).length > 0) {
        allErrors[key] = validationErrors[key];
      }
    });

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    try {
      await apiService.post('/api/add-hr', formData);
      toast.success('HR added successfully!', { autoClose: 5000 });
      setFormData({
        hrName: '',
        companyName: '',
        website: '',
        email: '',
        phoneNumber: '',
        address: '',
        publishedHr: ''
      });
      closeModal();
      setErrors({});
    } catch (error) {
      toast.error(`Error adding HR: ${error.message}`, { autoClose: 5000 });
    }
  };

  return (
    <div style={{ fontFamily: 'Roboto' }}>
      <Container>
        <form onSubmit={handleSubmit}>
          <Row>
            <Col lg={6} sm={12} xs={12}>
              <div className='form-group mb-1'>
                <label>HR Name:</label>

                <input
                  type="text"
                  name="hrName"
                  className='form-control'
                  value={formData.hrName}
                  onChange={handleChange}
                  onBlur={handleBlur}

                />
              </div>

              {errors.hrName && <p style={{ color: 'red', fontSize: '13px', fontWeight: '800', marginTop: '0px', marginBottom: '0px' }}>{errors.hrName}</p>}
            </Col>
            <Col lg={6} sm={12} xs={12}>
              <div className='form-group mb-1'>
                <label>Company Name:</label>

                <input
                  type="text"
                  name="companyName"
                  className='form-control'
                  value={formData.companyName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>

              {errors.companyName && (
                <p style={{ color: 'red', fontSize: '13px', fontWeight: '800', marginTop: '0px', marginBottom: '0px' }}>{errors.companyName}</p>
              )}
            </Col>
            <Col lg={6} sm={12} xs={12}>
              <div className='form-group mb-1'>
                <label>Website:</label>

                <input
                  type="text"
                  name="website"
                  className='form-control'
                  value={formData.website}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>

              {errors.website && <p style={{ color: 'red', fontSize: '13px', fontWeight: '800', marginTop: '0px', marginBottom: '0px' }}>{errors.website}</p>}
            </Col>
            <Col lg={6} sm={12} xs={12}>
              <div className='form-group mb-1'>
                <label>Email:</label>

                <input
                  type="email"
                  name="email"
                  className='form-control'
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>

              {errors.email && <p style={{ color: 'red', fontSize: '13px', fontWeight: '800', marginTop: '0px', marginBottom: '0px' }}>{errors.email}</p>}
            </Col>
            <Col lg={6} sm={12} xs={12}>
              <div className='form-group mb-1'>
                <label>Phone Number:</label>

                <input
                  type="text"
                  name="phoneNumber"
                  className='form-control'
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={10}
                />
              </div>

              {errors.phoneNumber && (
                <p style={{ color: 'red', fontSize: '13px', fontWeight: '800', marginTop: '0px', marginBottom: '0px' }}>{errors.phoneNumber}</p>
              )}
            </Col>
            <Col lg={6} sm={12} xs={12}>
              <div className='form-group mb-1'>
                <label>Address:</label>

                <input
                  type="text"
                  name="address"
                  className='form-control'
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>

              {errors.address && <p style={{ color: 'red', fontSize: '13px', fontWeight: '800', marginTop: '0px', marginBottom: '0px' }}>{errors.address}</p>}
            </Col>
{/* 
            <Col lg={6} sm={12} xs={12}>
              <div className='form-group mb-1'>
                <label>Published HR:</label>

                <input
                  type="text"
                  name="publishedHr"
                  className="form-control"
                  value={formData.publishedHr}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
              </div>

              {errors.publishedHr && (
                <p style={{ color: 'red', fontSize: '13px', fontWeight: '800', marginTop: '0px', marginBottom: '0px' }}>{errors.publishedHr}</p>
              )}
            </Col> */}
          </Row>
          <Row className="d-flex flex-row justify-content-center mt-3 mb-3">
            <Col lg={4}>
              <button className="w-100 mb-3 btn btn-primary" style={{ color: '#ffffff', fontWeight: '600' }} type="submit">
                Add HR
              </button>
            </Col>
            <Col lg={4}>
              <button className="w-100 mb-3 btn btn-default" style={{ color: '#000000', border: '1px solid #000000', fontWeight: '600' }} type="button" onClick={closeModal}>
                Cancel
              </button>
            </Col>
          </Row>
        </form>
      </Container>
    </div>
  );
};

export default AddHr;
