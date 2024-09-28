import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, MenuItem } from '@mui/material';
import { Formik, Field, Form as FormikForm } from 'formik';
import * as Yup from 'yup';
import apiService from '../../../../apiService'

const validationSchema = Yup.object().shape({
  jobId: Yup.string().required('Job ID is required'),
  jobTitle: Yup.string().required('Job Title is required'),
  companyName: Yup.string().required('Company Name is required'),
  jobCategory: Yup.string().required('Job Category is required'),
  jobDescription: Yup.string().required('Job Description is required'),
  jobExperience: Yup.string().required('Job Experience is required'),
  jobQualification: Yup.string().required('Job Qualification is required'),
  jobType: Yup.string().required('Job Type is required'),
  salary: Yup.string().required('Salary is required'),
  phone: Yup.string().required('Phone is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  Location: Yup.string().required('Location is required'),
  applicationUrl: Yup.string().url('Invalid URL').required('Application URL is required'),
  postedOn: Yup.date().required('Posted On date is required'),
  lastDate: Yup.date().required('Last Date is required'),
});

const EditJobModal = ({ show, handleClose, job, handleSave }) => {
  const [companyNames, setCompanyNames] = useState([]);
  const [companyDetails, setCompanyDetails] = useState({});
  const today = new Date().toISOString().split('T')[0];
  const [initialValues, setInitialValues] = useState({
    jobId: '',
    jobTitle: '',
    companyName: '',
    jobCategory: '',
    jobDescription: '',
    jobExperience: '',
    jobQualification: '',
    jobType: '',
    salary: '',
    phone: '',
    email: '',
    Location: '',
    applicationUrl: '',
    postedOn: '',
    lastDate: '',
  });

  useEffect(() => {
    if (job) {
      setInitialValues({
        jobId: job.jobId || '',
        jobTitle: job.jobTitle || '',
        companyName: job.companyName || '',
        jobCategory: job.jobCategory || '',
        jobDescription: job.jobDescription || '',
        jobExperience: job.jobExperience || '',
        jobQualification: job.jobQualification || '',
        jobType: job.jobType || '',
        salary: job.salary || '',
        phone: job.phone || '',
        email: job.email || '',
        Location: job.Location || '',
        applicationUrl: job.applicationUrl || '',
        postedOn: job.postedOn ? formatDate(job.postedOn) : '',
        lastDate: job.lastDate ? formatDate(job.lastDate) : '',
      });
    }
  }, [job]);

  const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  const handleFormSubmit = (values, { setSubmitting }) => {
    const changedValues = {};
    Object.keys(values).forEach(key => {
      if (values[key] !== initialValues[key]) {
        changedValues[key] = values[key];
      }
    });

    const updatedValues = {
      ...changedValues,
      postedOn: changedValues.postedOn ? new Date(changedValues.postedOn).toISOString() : undefined,
      lastDate: changedValues.lastDate ? new Date(changedValues.lastDate).toISOString() : undefined,
    };

    console.log("Submitting values:", updatedValues);
    handleSave({ ...updatedValues, jobId: values.jobId });
    setSubmitting(false);
  };

  const fetchCompanyNames = async () => {
    try {
      const response = await apiService.get('/api/registered-companies');
      setCompanyNames(response.data);
      const details = response.data.reduce((acc, company) => {
        acc[company.companyName] = {
          email: company.email,
          phone: company.mobileNo,
          companyId: company.companyID,
          website: company.website
        };
        return acc;
      }, {});
      setCompanyDetails(details);
    } catch (error) {
      console.error('Error fetching company names', error);
    }
  };

  useEffect(() => {
    fetchCompanyNames();
  }, []);

  return (
    <Dialog open={show} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Edit Job</DialogTitle>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
      >
        {({ values, handleChange, setFieldValue, touched, errors, isSubmitting }) => (
          <FormikForm>
            <DialogContent dividers>
              <Field type="hidden" name="jobId" />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Job Title"
                    name="jobTitle"
                    value={values.jobTitle}
                    onChange={handleChange}
                    error={touched.jobTitle && Boolean(errors.jobTitle)}
                    helperText={touched.jobTitle && errors.jobTitle}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Company Name"
                    name="companyName"
                    value={values.companyName}
                    onChange={(e) => {
                      const selectedCompany = e.target.value;
                      handleChange(e);  // Call Formik's handleChange
                      if (selectedCompany !== 'Select Company Name' && companyDetails[selectedCompany]) {
                        setFieldValue('email', companyDetails[selectedCompany].email);
                        setFieldValue('phone', companyDetails[selectedCompany].phone);
                        setFieldValue('applicationUrl', companyDetails[selectedCompany].website);
                      } else {
                        setFieldValue('email', '');
                        setFieldValue('phone', '');
                        setFieldValue('applicationUrl', '');
                      }
                    }}
                    error={touched.companyName && Boolean(errors.companyName)}
                    helperText={touched.companyName && errors.companyName}
                  >
                    <MenuItem value="">Select Company Name</MenuItem>
                    {companyNames.map(company => (
                      <MenuItem key={company.companyID} value={company.companyName}>
                        {company.companyName}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Job Category"
                    name="jobCategory"
                    value={values.jobCategory}
                    onChange={handleChange}
                    error={touched.jobCategory && Boolean(errors.jobCategory)}
                    helperText={touched.jobCategory && errors.jobCategory}
                  >
                    <MenuItem value="">Select Category</MenuItem>
                    <MenuItem value="Technical">Technical</MenuItem>
                    <MenuItem value="Non-Technical">Non-Technical</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Job Type"
                    name="jobType"
                    value={values.jobType}
                    onChange={handleChange}
                    error={touched.jobType && Boolean(errors.jobType)}
                    helperText={touched.jobType && errors.jobType}
                  >
                    <MenuItem value="">Select Type</MenuItem>
                    <MenuItem value="Full Time">Full Time</MenuItem>
                    <MenuItem value="Part Time">Part Time</MenuItem>
                    <MenuItem value="Contract">Contract</MenuItem>
                    <MenuItem value="Internship">Internship</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    label="Job Description"
                    name="jobDescription"
                    value={values.jobDescription}
                    onChange={handleChange}
                    error={touched.jobDescription && Boolean(errors.jobDescription)}
                    helperText={touched.jobDescription && errors.jobDescription}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Job Experience"
                    name="jobExperience"
                    value={values.jobExperience}
                    onChange={handleChange}
                    error={touched.jobExperience && Boolean(errors.jobExperience)}
                    helperText={touched.jobExperience && errors.jobExperience}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Job Qualification"
                    name="jobQualification"
                    value={values.jobQualification}
                    onChange={handleChange}
                    error={touched.jobQualification && Boolean(errors.jobQualification)}
                    helperText={touched.jobQualification && errors.jobQualification}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Salary"
                    name="salary"
                    value={values.salary}
                    onChange={handleChange}
                    error={touched.salary && Boolean(errors.salary)}
                    helperText={touched.salary && errors.salary}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={values.phone}
                    onChange={handleChange}
                    error={touched.phone && Boolean(errors.phone)}
                    helperText={touched.phone && errors.phone}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    name="Location"
                    value={values.Location}
                    onChange={handleChange}
                    error={touched.Location && Boolean(errors.Location)}
                    helperText={touched.Location && errors.Location}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Application URL"
                    name="applicationUrl"
                    value={values.applicationUrl}
                    onChange={handleChange}
                    error={touched.applicationUrl && Boolean(errors.applicationUrl)}
                    helperText={touched.applicationUrl && errors.applicationUrl}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Posted On"
                    name="postedOn"
                    disabled
                    value={values.postedOn}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    error={touched.postedOn && Boolean(errors.postedOn)}
                    helperText={touched.postedOn && errors.postedOn}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Last Date"
                    name="lastDate"
                    min={today}
                    value={values.lastDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    error={touched.lastDate && Boolean(errors.lastDate)}
                    helperText={touched.lastDate && errors.lastDate}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="secondary">Cancel</Button>
              <Button type="submit" color="primary" disabled={isSubmitting}>Save</Button>
            </DialogActions>
          </FormikForm>
        )}
      </Formik>
    </Dialog>
  );
};

export default EditJobModal;
