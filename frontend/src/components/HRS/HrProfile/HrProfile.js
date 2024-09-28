import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import apiService from '../../../apiService';
import Cookies from 'js-cookie';
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@mui/material';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const validationSchema = Yup.object({
  fullName: Yup.string()
  .required('Full Name is required')
  .matches(/^[A-Za-z ]*$/, 'Only alphabets are allowed for this field'),
  email: Yup.string()
  .email('Invalid email format').required('Email is required'),
  mobileNo: Yup.string()
  .required('Mobile No is required')
  .matches(/^[6-9][0-9]{9}$/, 'Mobile number must start with 6,7,8,9 and contain exactly 10 digits')  ,
  dob: Yup.date().required('Date of Birth is required'),
  address: Yup.string()
  .required('Address is required')
  .min(10, 'Address must be at least 10 characters long')
  .max(100, 'Address cannot be longer than 100 characters'),
  workEmail: Yup.string().email('Invalid  email format').required('Work Email is required'),
  workMobile: Yup.string()
  .required('Work Mobile is required')
  .matches(/^[6-9][0-9]{9}$/, 'Mobile number must start with 6,7,8,9 and contain exactly 10 digits'),
  emergencyContactName: Yup.string()
  .required('Emergency Contact Name is required')
  .matches(/^[A-Za-z ]*$/, 'Only alphabets are allowed for this field'),

  emergencyContactAddress: Yup.string()
  .required('Address is required')
  .min(10, 'Address must be at least 10 characters long')
  .max(100, 'Address cannot be longer than 100 characters'),

  emergencyContactMobile: Yup.string()
  .required('Emergency Contact Mobile is required')
  .matches(/^[6-9][0-9]{9}$/, 'Mobile number must start with 6,7,8,9 and contain exactly 10 digits')  ,

  gender: Yup.string().required('Gender is required'),
  branch: Yup.string()
  .required('Branch is required')
  .matches(/^[A-Za-z ]*$/, 'Only alphabets are allowed for this field'),

  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
});

const ProfilePage = () => {
  const HRid = Cookies.get('HRid');
  const [profile, setProfile] = useState({
    HRID : '',
    fullName: '',
    email: '',
    mobileNo: '',
    dob: '',
    address: '',
    workEmail: '',
    workMobile: '',
    emergencyContactName: '',
    emergencyContactAddress: '',
    emergencyContactMobile: '',
    gender: '',
    branch: '',
    password: ''
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchHRData = async () => {
      try {
        const response = await apiService.get(`/api/hr-profile/${HRid}`);
        console.log(response.data);
        setProfile(response.data);
      } catch (error) {
        toast.error('Error fetching profile data');
      }
    };
    fetchHRData();
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await apiService.put(`/api/hr-profile/${HRid}`, values);
      toast.success('Profile updated successfully');
      setProfile(values);
      setIsEditing(false);
    } catch (err) {
      toast.error('Error updating profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ overflow: 'hidden', fontFamily: 'Arial, sans-serif' }}>
      <Container className="bg-light" style={{ width: '80%', overflow: 'auto', marginTop: '30px', marginBottom: '30px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
        <div className="py-4">
        <span style={{ display: "flex", justifyContent: "space-between", width: "90%" }}>
        <h2>Your Details</h2>
            <div>
              <Button onClick={() => setIsEditing(true)} className="btn btn-primary" style={{ alignItems:"right", backgroundColor: '#007bff', borderColor: '#007bff' }}>
                Edit
              </Button>
            </div>
          </span>
          {isEditing ? (
            <Formik
              initialValues={profile}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ errors, touched, isSubmitting }) => (
                <Form>
                  <TableContainer component={Paper} style={{ marginTop: '20px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell>Full Name</TableCell>
                          <TableCell>
                            <Field name="fullName">
                              {({ field }) => (
                                <input type="text" {...field} className="form-control" placeholder="Full Name" style={{ borderRadius: '4px', border: '1px solid #ced4da', padding: '8px' }} />
                              )}
                            </Field>
                            {errors.fullName && touched.fullName ? (
                              <div className="text-danger">{errors.fullName}</div>
                            ) : null}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Email</TableCell>
                          <TableCell>
                            <Field name="email">
                              {({ field }) => (
                                <input type="email" {...field} className="form-control" placeholder="Email" style={{ borderRadius: '4px', border: '1px solid #ced4da', padding: '8px' }} />
                              )}
                            </Field>
                            {errors.email && touched.email ? (
                              <div className="text-danger">{errors.email}</div>
                            ) : null}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Mobile No</TableCell>
                          <TableCell>
                            <Field name="mobileNo">
                              {({ field }) => (
                                <input type="text" {...field} className="form-control" placeholder="Mobile No" style={{ borderRadius: '4px', border: '1px solid #ced4da', padding: '8px' }} />
                              )}
                            </Field>
                            {errors.mobileNo && touched.mobileNo ? (
                              <div className="text-danger">{errors.mobileNo}</div>
                            ) : null}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Date of Birth</TableCell>
                          <TableCell>
                            <Field name="dob">
                              {({ field }) => (
                                <input type="date" {...field} className="form-control" style={{ borderRadius: '4px', border: '1px solid #ced4da', padding: '8px' }} />
                              )}
                            </Field>
                            {errors.dob && touched.dob ? (
                              <div className="text-danger">{errors.dob}</div>
                            ) : null}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Address</TableCell>
                          <TableCell>
                            <Field name="address">
                              {({ field }) => (
                                <input type="text" {...field} className="form-control" placeholder="Address" style={{ borderRadius: '4px', border: '1px solid #ced4da', padding: '8px' }} />
                              )}
                            </Field>
                            {errors.address && touched.address ? (
                              <div className="text-danger">{errors.address}</div>
                            ) : null}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Work Email</TableCell>
                          <TableCell>
                            <Field name="workEmail">
                              {({ field }) => (
                                <input type="email" {...field} className="form-control" placeholder="Work Email" style={{ borderRadius: '4px', border: '1px solid #ced4da', padding: '8px' }} />
                              )}
                            </Field>
                            {errors.workEmail && touched.workEmail ? (
                              <div className="text-danger">{errors.workEmail}</div>
                            ) : null}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Work Mobile</TableCell>
                          <TableCell>
                            <Field name="workMobile">
                              {({ field }) => (
                                <input type="text" {...field} className="form-control" placeholder="Work Mobile" style={{ borderRadius: '4px', border: '1px solid #ced4da', padding: '8px' }} />
                              )}
                            </Field>
                            {errors.workMobile && touched.workMobile ? (
                              <div className="text-danger">{errors.workMobile}</div>
                            ) : null}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Emergency Contact Name</TableCell>
                          <TableCell>
                            <Field name="emergencyContactName">
                              {({ field }) => (
                                <input type="text" {...field} className="form-control" placeholder="Emergency Contact Name" style={{ borderRadius: '4px', border: '1px solid #ced4da', padding: '8px' }} />
                              )}
                            </Field>
                            {errors.emergencyContactName && touched.emergencyContactName ? (
                              <div className="text-danger">{errors.emergencyContactName}</div>
                            ) : null}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Emergency Contact Address</TableCell>
                          <TableCell>
                            <Field name="emergencyContactAddress">
                              {({ field }) => (
                                <input type="text" {...field} className="form-control" placeholder="Emergency Contact Address" style={{ borderRadius: '4px', border: '1px solid #ced4da', padding: '8px' }} />
                              )}
                            </Field>
                            {errors.emergencyContactAddress && touched.emergencyContactAddress ? (
                              <div className="text-danger">{errors.emergencyContactAddress}</div>
                            ) : null}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Emergency Contact Mobile</TableCell>
                          <TableCell>
                            <Field name="emergencyContactMobile">
                              {({ field }) => (
                                <input type="text" {...field} className="form-control" placeholder="Emergency Contact Mobile" style={{ borderRadius: '4px', border: '1px solid #ced4da', padding: '8px' }} />
                              )}
                            </Field>
                            {errors.emergencyContactMobile && touched.emergencyContactMobile ? (
                              <div className="text-danger">{errors.emergencyContactMobile}</div>
                            ) : null}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Gender</TableCell>
                          <TableCell>
                            <Field name="gender" as="select" className="form-control" style={{ borderRadius: '4px', border: '1px solid #ced4da', padding: '8px' }}>
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </Field>
                            {errors.gender && touched.gender ? (
                              <div className="text-danger">{errors.gender}</div>
                            ) : null}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Branch</TableCell>
                          <TableCell>
                            <Field name="branch">
                              {({ field }) => (
                                <input type="text" {...field} className="form-control" placeholder="Branch" style={{ borderRadius: '4px', border: '1px solid #ced4da', padding: '8px' }} />
                              )}
                            </Field>
                            {errors.branch && touched.branch ? (
                              <div className="text-danger">{errors.branch}</div>
                            ) : null}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Password</TableCell>
                          <TableCell>
                            <Field name="password">
                              {({ field }) => (
                                <input type="password" {...field} className="form-control" placeholder="Password" style={{ borderRadius: '4px', border: '1px solid #ced4da', padding: '8px' }} />
                              )}
                            </Field>
                            {errors.password && touched.password ? (
                              <div className="text-danger">{errors.password}</div>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    <div className="mt-3">
                      <Button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ backgroundColor: '#007bff', borderColor: '#007bff' }}>Save Changes</Button>
                      <Button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary ml-2" style={{ backgroundColor: '#6c757d', borderColor: '#6c757d' }}>Cancel</Button>
                    </div>
                  </TableContainer>
                </Form>
              )}
            </Formik>
          ) : (
            <TableContainer component={Paper} style={{ marginTop: '20px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
              <Table>
                <TableBody>
                  {Object.keys(profile)
                    .filter(key => !['id'].includes(key)) // Filter out unwanted keys
                    .map((key) => (
                      <TableRow key={key}>
                        <TableCell>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</TableCell>
                        <TableCell>{profile[key]}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

          )}
        </div>
      </Container>
      <ToastContainer position="top-right" autoClose={5000}/>
    </div>
  );
};

export default ProfilePage;
