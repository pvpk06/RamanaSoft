import React from 'react';
import { TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel, Button } from '@mui/material';
import { toast } from 'react-toastify';
import apiService from '../../../apiService';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Validation schema
const validationSchema = Yup.object({
  fullName: Yup.string().required('Full Name is required').matches(/^[A-Za-z ]*$/, 'Only alphabets are allowed for this field'),
  email: Yup.string()
  .matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, 'Email ID must be a valid Gmail address (e.g., user123@gmail.com)')
  .required('Email is required').min(8, "email should be 5 digits long and must ended with @gmail.com")
  , contactNo: Yup.string().matches(/^[6-9][0-9]{9}$/, 'Mobile number must start with 6,7,8,9 and contain exactly 10 digits').required('Contact No is required'),
  dob: Yup.date().required('Date of Birth is required'),
  address: Yup.string().required('Address is required')
    .min(10, 'Address must be at least 10 characters long')
    .max(100, 'Address cannot be longer than 100 characters'),
  workEmail: Yup.string().email('Invalid work email address').required('Work Email is required'),
  workMobile: Yup.string().matches(/^[6-9][0-9]{9}$/, 'Mobile number must start with 6,7,8,9 and contain exactly 10 digits').required('Work Mobile is required'),
  emergencyContactName: Yup.string().required('Emergency Contact Name is required').matches(/^[A-Za-z ]*$/, 'Only alphabets are allowed for this field'),
  emergencyContactAddress: Yup.string().required('Emergency Contact Address is required'),
  emergencyContactMobile: Yup.string().matches(/^[6-9][0-9]{9}$/, 'Mobile number must start with 6,7,8,9 and contain exactly 10 digits').required('Emergency Contact Mobile is required'),
  gender: Yup.string().oneOf(['Male', 'Female', 'Other'], 'Invalid Gender').required('Gender is required'),
  branch: Yup.string().required('Branch is required').matches(/^[A-Za-z ]*$/, 'Only alphabets are allowed for this field'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
});

const AddHR = ({ setSelectedView }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const handleSubmit = async (values) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await apiService.post('/api/add/hr', values, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      toast.success('Registered successfully!', { autoClose: 5000 });
      setSelectedView('allHrs');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      console.error('Error registering:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      contactNo: '',
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
    },
    validationSchema: validationSchema,
    onSubmit: handleSubmit
  });
  return (
    <div className="intern_reg_container" style={{ backgroundColor: 'white', borderRadius: "5px" }}>
      <form className="intern_reg_section" onSubmit={formik.handleSubmit} autoComplete='off'>
        <div className="intern_reg_section">
          <h3 className='intern_reg_section_title'>HR Personal Information</h3>
          <div className="intern_reg_form_group">
            <TextField
              label="Full Name"
              variant="outlined"
              className="intern_reg_input"
              name="fullName"
              value={formik.values.fullName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.fullName && Boolean(formik.errors.fullName)}
              helperText={formik.touched.fullName && formik.errors.fullName}
              required
              InputProps={{ className: 'fw-bold' }}
              InputLabelProps={{ className: 'fw-bold text-secondary' }}
            />
          </div>
          <div className="intern_reg_form_group">
            <TextField
              label="Email"
              variant="outlined"
              className="intern_reg_input"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              required
              InputProps={{ className: 'fw-bold' }}
              InputLabelProps={{ className: 'fw-bold text-secondary' }}
            />
          </div>
          <div className="intern_reg_form_group">
            <TextField
              label="Contact No"
              variant="outlined"
              className="intern_reg_input"
              name="contactNo"
              value={formik.values.contactNo}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.contactNo && Boolean(formik.errors.contactNo)}
              helperText={formik.touched.contactNo && formik.errors.contactNo}
              inputProps={{ maxLength: 10 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <span className='bg-secondary-subtle rounded p-2'>+91</span>
                  </InputAdornment>
                ),
                className: 'fw-bold'
              }}
              InputLabelProps={{ className: 'fw-bold text-secondary' }}
              required
            />
          </div>
          <div className="intern_reg_form_group">
            <TextField
              label="Date of Birth"
              variant="outlined"
              type="date"
              className="intern_reg_input"
              name="dob"
              value={formik.values.dob}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.dob && Boolean(formik.errors.dob)}
              helperText={formik.touched.dob && formik.errors.dob}
              required
              InputLabelProps={{ shrink: true, className: 'fw-bold text-secondary' }}
            />
          </div>
          <div className="intern_reg_form_group">
            <TextField
              label="Address"
              variant="outlined"
              className="intern_reg_input"
              name="address"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.address && Boolean(formik.errors.address)}
              helperText={formik.touched.address && formik.errors.address}
              required
              InputProps={{ className: 'fw-bold' }}
              InputLabelProps={{ className: 'fw-bold text-secondary' }}
            />
          </div>
          <div className="intern_reg_form_group">
            <FormControl variant="outlined" className="intern_reg_input" required>
              <InputLabel className='fw-bold text-secondary'>Gender</InputLabel>
              <Select
                name="gender"
                value={formik.values.gender}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.gender && Boolean(formik.errors.gender)}
                label="Gender"
                inputProps={{ className: 'fw-bold' }}
                labelId="gender-label"
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
              {formik.touched.gender && formik.errors.gender && (
                <div style={{ color: 'red', fontSize: '0.75rem' }}>{formik.errors.gender}</div>
              )}
            </FormControl>
          </div>
          <div className="intern_reg_form_group">
            <TextField
              label="Branch"
              variant="outlined"
              className="intern_reg_input"
              name="branch"
              value={formik.values.branch}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.branch && Boolean(formik.errors.branch)}
              helperText={formik.touched.branch && formik.errors.branch}
              required
              InputProps={{ className: 'fw-bold' }}
              InputLabelProps={{ className: 'fw-bold text-secondary' }}
            />
          </div>
        </div>
        <div className="intern_reg_section">
          <h3 className='intern_reg_section_title'>HR Professional Information</h3>
          <div className="intern_reg_form_group">
            <TextField
              label="Work Email"
              variant="outlined"
              className="intern_reg_input"
              name="workEmail"
              value={formik.values.workEmail}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.workEmail && Boolean(formik.errors.workEmail)}
              helperText={formik.touched.workEmail && formik.errors.workEmail}
              required
              InputProps={{ className: 'fw-bold' }}
              InputLabelProps={{ className: 'fw-bold text-secondary' }}
            />
          </div>
          <div className="intern_reg_form_group">
            <TextField
              label="Work Mobile"
              required
              variant="outlined"
              className="intern_reg_input"
              name="workMobile"
              value={formik.values.workMobile}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.workMobile && Boolean(formik.errors.workMobile)}
              helperText={formik.touched.workMobile && formik.errors.workMobile}
              inputProps={{ maxLength: 10 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <span className='bg-secondary-subtle rounded p-2'>+91</span>
                  </InputAdornment>
                ),
                className: 'fw-bold'
              }}
              InputLabelProps={{ className: 'fw-bold text-secondary' }}
            />
          </div>
          <div className="intern_reg_form_group">
            <TextField
              label="Password"
              variant="outlined"
              className="intern_reg_input"
              name="password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              required
              InputProps={{ className: 'fw-bold' }}
              InputLabelProps={{ className: 'fw-bold text-secondary' }}
            />
          </div>
        </div>
        <div className="intern_reg_section">
          <h3 className='intern_reg_section_title'>Emergency Contact Information</h3>
          <div className="intern_reg_form_group">
            <TextField
              label="Emergency Contact Name"
              variant="outlined"
              className="intern_reg_input"
              name="emergencyContactName"
              value={formik.values.emergencyContactName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.emergencyContactName && Boolean(formik.errors.emergencyContactName)}
              helperText={formik.touched.emergencyContactName && formik.errors.emergencyContactName}
              required
              InputProps={{ className: 'fw-bold' }}
              InputLabelProps={{ className: 'fw-bold text-secondary' }}
            />
          </div>
          <div className="intern_reg_form_group">
            <TextField
              label="Emergency Contact Address"
              variant="outlined"
              className="intern_reg_input"
              name="emergencyContactAddress"
              value={formik.values.emergencyContactAddress}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.emergencyContactAddress && Boolean(formik.errors.emergencyContactAddress)}
              helperText={formik.touched.emergencyContactAddress && formik.errors.emergencyContactAddress}
              required
              InputProps={{ className: 'fw-bold' }}
              InputLabelProps={{ className: 'fw-bold text-secondary' }}
            />
          </div>
          <div className="intern_reg_form_group">
            <TextField
              label="Emergency Contact Mobile"
              variant="outlined"
              className="intern_reg_input"
              name="emergencyContactMobile"
              value={formik.values.emergencyContactMobile}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.emergencyContactMobile && Boolean(formik.errors.emergencyContactMobile)}
              helperText={formik.touched.emergencyContactMobile && formik.errors.emergencyContactMobile}
              required
              inputProps={{ maxLength: 10 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <span className='bg-secondary-subtle rounded p-2'>+91</span>
                  </InputAdornment>
                ),
                className: 'fw-bold'
              }}
              InputLabelProps={{ className: 'fw-bold text-secondary' }}
            />
          </div>
        </div>
        <Button type="submit" variant="contained" color="primary" className="intern_reg_button">
          Add
        </Button>
      </form>
    </div>
  );
};

export default AddHR;
