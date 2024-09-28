import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { InputAdornment, Button, Menu, MenuItem, IconButton, TextField } from '@mui/material';
import ramana from '../images/p3.jpeg';
import slider1 from '../images/slider1.jpg';
import slider2 from '../images/slider2.jpg';
import slider3 from '../images/slider3.jpg';
import jobsearch from '../images/jobsearch.jpeg';
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';
import About from './About';
import Contact from './Contact';
import SuperAdminLogin from './SALogin';
import OtpService from './OtpService';
import InternRegistration from '../../register/intern_Reg/intern_reg';
import HRRegistration from '../../register/hr_Reg/hr_register';
import GuestRegistration from '../../register/guest_Reg/guest_reg';
import ViewJobs from './Jobs';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import apiService from '../../../apiService';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import PageNotFound from '../../pageNotFound';

const Home = ({ defaultTab }) => {
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState('home');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const firstOtpInputRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const scrollRef = useRef(null);

  const menuItems = [
    { id: 'About', name: 'About RamanaSoft' },
    { id: 'Jobs', name: 'Current Openings' },
    { id: 'Contact', name: 'Contact Us' },
    { id: 'HrReg', name: 'Register as HR' },
    { id: 'InternReg', name: 'Register as Intern' },
    { id: 'HrReg', name: 'Register as Guest' },
    { id: 'HRLogin', name: 'Login as HR' },
    { id: 'SuperAdminLogin', name: 'Login as SA' },
    { id: 'InternLogin', name: 'Login as Intern' },
    { id: 'GuestLogin', name: 'Login as Guest' },
    { id: 'PrivacyPolicy', name: 'Privacy Ploicy' },
    { id: 'Security', name: 'Security' },
    { id: 'accessibility', name: 'accessibility' },
    { id: 'Cookies', name: 'cookies' },
    { id: 'PageNotFound', name: 'PageNotFound' },

  ];

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);


  useEffect(() => {
    const scrollContainer = scrollRef.current;

    const scrollSpeed = 1; // Adjust this value to control the scroll speed

    const autoScroll = () => {
      if (scrollContainer) {
        scrollContainer.scrollLeft += scrollSpeed;
        // If reached the end, reset to the beginning
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
          scrollContainer.scrollLeft = 0;
        }
      }
    };

    const scrollInterval = setInterval(autoScroll, 30); // Adjust interval time to control smoothness

    return () => {
      clearInterval(scrollInterval); // Clean up interval on component unmount
    };
  }, []);


  useEffect(() => {
    if (defaultTab) {
      setSelectedView(defaultTab);
    }
  }, [defaultTab]);

  const [formData, setFormData] = useState({ email: '', password: '', mobileNo: '', otp: ['', '', '', '', '', ''] });
  const [errors, setErrors] = useState({ email: '', password: '' });

  useEffect(() => {
    const HRid = Cookies.get('HRid');
    const verified = Cookies.get('verified');
    if (HRid && verified === 'true') {
      navigate('/hr_dash');
    }
    const SAid = Cookies.get("SAid");
    if (SAid && verified === 'true') {
      navigate('/SA_dash')
    }
    const internID = Cookies.get("internID")
    if (internID && verified === 'true') {
      navigate('/intern_dash')
    }

    const guestID = Cookies.get("guestID")
    if (guestID && verified === 'true') {
      navigate('/extern_dash')
    }

  }, [navigate]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'email' && value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
      setErrors({ ...errors, email: 'Invalid email address' });
    } else if (name === 'password' && !value) {
      setErrors({ ...errors, password: 'Password is required' });
    } else {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // const handleRefresh = () => {
  //   setSelectedView('home');
  //   navigate('/');
  // };
  // useEffect(() => {
  //   handleRefresh();
  // }, []);

  const handleOtpChange = (e, index) => {
    const { value } = e.target;
    const newOtp = [...formData.otp];

    if (/[0-9]/.test(value) || value === '') {
      newOtp[index] = value;
      setFormData({ ...formData, otp: newOtp });
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }

    if (e.key === 'Backspace' && index > 0 && !newOtp[index]) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const sendOtp = async () => {
    if (formData.mobileNo && formData.mobileNo.length === 10) {
      try {
        await apiService.post('/api/guest_login', { mobileNo: formData.mobileNo });
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log('Generated OTP:', generatedOtp);
        setOtp(generatedOtp);
        setOtpSent(true);
        setTimer(30);
        await OtpService.sendOtp(formData.mobileNo, generatedOtp);
        toast.success('OTP sent successfully!', { autoClose: 5000 });
      } catch (error) {
        if (error.response) {
          if (error.response.status === 404) {
            toast.error('User not found, please register.', { autoClose: 5000 });
          } else if (error.response.status === 500) {
            toast.error('Server error, please try again later.', { autoClose: 5000 });
          } else {
            toast.error('Failed to send OTP, please try again.', { autoClose: 5000 });
          }
        }
        console.error('Error sending OTP:', error);
      }
    } else {
      setErrors({ ...errors, mobileNo: 'Mobile number must be 10 digits' });
      toast.error('Invalid mobile number. Please enter a valid 10-digit number.', { autoClose: 5000 });
    }
  };


  const sendOtpIntern = async () => {
    if (formData.mobileNo && formData.mobileNo.length === 10) {
      try {
        await apiService.post('/api/intern_login', { mobileNo: formData.mobileNo });
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log('Generated OTP:', generatedOtp);
        setOtp(generatedOtp);
        setOtpSent(true);
        setTimer(30);
        await OtpService.sendOtp(formData.mobileNo, generatedOtp);
        toast.success('OTP sent successfully!', { autoClose: 5000 });
      } catch (error) {
        if (error.response) {
          if (error.response.status === 404) {
            toast.error('User not found, please register.', { autoClose: 5000 });
          } else if (error.response.status === 500) {
            toast.error('Server error, please try again later.', { autoClose: 5000 });
          } else {
            toast.error('Failed to send OTP, please try again.', { autoClose: 5000 });
          }
        }
        console.error('Error sending OTP:', error);
      }
    } else {
      setErrors({ ...errors, mobileNo: 'Mobile number must be 10 digits' });
      toast.error('Invalid mobile number. Please enter a valid 10-digit number.', { autoClose: 5000 });
    }
  };


  const verifyOtp = async () => {
    const enteredOtp = formData.otp.join('');
    console.log('Entered OTP:', enteredOtp);
    console.log('Generated OTP:', otp);

    if (enteredOtp === otp) {
      toast.success('Logged in successfully!', { autoClose: 5000 });
      setOtpSent(false);

      try {
        const response = await apiService.post('/api/intern_login', { mobileNo: formData.mobileNo });
        if (response.status === 200) {
          const intern = response.data.intern;
          Object.keys(Cookies.get()).forEach(cookieName => {
            Cookies.remove(cookieName);
          });
          Cookies.set('role', 'intern', { expires: 30 });
          Cookies.set('internID', intern.candidateID, { expires: 30 });
          Cookies.set('verified', 'true', { expires: 30 });
          navigate('/intern_dash');
        }
      } catch (error) {
        if (error.response) {
          if (error.response.status === 404) {
            toast.error('Intern not found, please register.', { autoClose: 5000 });
          } else if (error.response.status === 500) {
            toast.error('Server error, please try again later.', { autoClose: 5000 });
          } else {
            toast.error('Login failed. Please try again.', { autoClose: 5000 });
          }
        } else {
          toast.error('Network error, please try again.', { autoClose: 5000 });
        }
        console.error('Error logging in:', error);
      }
    } else {
      toast.error('Invalid OTP. Please try again.', { autoClose: 5000 });
    }
  };

  const GuestverifyOtp = async () => {
    const enteredOtp = formData.otp.join('');
    console.log('Entered OTP:', enteredOtp);
    console.log('Generated OTP:', otp);

    if (enteredOtp === otp) {
      toast.success('Logged in successfully!', { autoClose: 5000 });
      setOtpSent(false);

      try {
        const response = await apiService.post('/api/guest_login', { mobileNo: formData.mobileNo });
        if (response.status === 200) {
          const guest = response.data.guest;
          Object.keys(Cookies.get()).forEach(cookieName => {
            Cookies.remove(cookieName);
          });
          Cookies.set('role', 'Guest', { expires: 30 });
          Cookies.set('guestID', guest.guestID, { expires: 30 });
          Cookies.set('verified', 'true', { expires: 30 });
          navigate('/extern_dash');
        }
      } catch (error) {
        if (error.response) {
          if (error.response.status === 404) {
            toast.error('Intern not found, please register.', { autoClose: 5000 });
          } else if (error.response.status === 500) {
            toast.error('Server error, please try again later.', { autoClose: 5000 });
          } else {
            toast.error('Login failed. Please try again.', { autoClose: 5000 });
          }
        } else {
          toast.error('Network error, please try again.', { autoClose: 5000 });
        }
        console.error('Error logging in:', error);
      }
    } else {
      toast.error('Invalid OTP. Please try again.', { autoClose: 5000 });
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.email && formData.password) {
      console.log(formData);
      try {
        const response = await apiService.post('/api/hr-login', {
          email: formData.email,
          password: formData.password
        });

        // Handle successful login
        console.log(response);
        toast.success('Logged in successfully!', { autoClose: 5000 });

        // Clear all existing cookies
        document.cookie.split(';').forEach(cookie => {
          const cookieName = cookie.split('=')[0].trim();
          Cookies.remove(cookieName);
        });

        // Set new cookies
        Cookies.set('verified', true, { expires: 30 });
        Cookies.set('HRid', response.data.HRid, { expires: 30 });
        Cookies.set('role', 'HR', { expires: 30 });

        // Navigate to HR dashboard
        navigate('/hr_dash');
      } catch (error) {
        console.log(error);

        // Handle different status codes
        if (error.response) {
          const statusCode = error.response.status;
          if (statusCode === 404) {
            toast.error('User not found', { autoClose: 5000 });
          } else if (statusCode === 401) {
            toast.error('Invalid credentials', { autoClose: 5000 });
          }
        } else {
          toast.error('Network error or server is unreachable', { autoClose: 5000 });
        }
      }
    } else {
      setErrors({
        email: !formData.email ? 'Email is required' : '',
        password: !formData.password ? 'Password is required' : ''
      });
    }
  };

  const handleMenuItemClick = (id) => {
    navigate(`/${id.toLowerCase()}`);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLoginMenuItemClick = (loginType) => {
    navigate(`/login/${loginType.toLowerCase()}`)
    handleClose();
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };


  const renderContent = () => {
    switch (selectedView) {
      case 'About':
        return <About />;
      case 'Contact':
        return <Contact />;
      case 'Jobs':
        return <ViewJobs />
      // case 'JobDesc':
      //   return <JobDesc />
      case 'HRLogin':
        return (
          <div className='login'>
            <div className="container d-flex flex-column justify-content-center align-items-center" style={{ height: '85vh' }}>
              <img alt='logo' className='rounded mb-3' src={ramana} style={{ width: '200px', height: 'auto' }} />
              <div className="border rounded shadow p-3 d-flex flex-column align-items-center bg-white" style={{ width: '100%', maxWidth: '500px' }}>
                <h4 className='fw-bold mb-4 mt-2 text-nowrap' style={{ fontFamily: 'monospace' }}>
                  HR Login <i className="fa-solid fa-right-to-bracket"></i>
                </h4>
                <form onSubmit={handleSubmit}>
                  <TextField
                    label="Email"
                    variant="outlined"
                    className="w-100 mb-3"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    error={Boolean(errors.email)}
                    helperText={errors.email}
                    InputLabelProps={{ className: 'fw-bold text-secondary' }}
                  />

                  <TextField
                    label="Password"
                    variant="outlined"
                    type={showPassword ? 'text' : 'password'}
                    className="w-100 mb-3"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    error={Boolean(errors.password)}
                    helperText={errors.password}
                    InputLabelProps={{ className: 'fw-bold text-secondary' }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    variant="contained"
                    color="primary"
                    type='submit'
                    className='w-100'
                  >
                    Login
                  </Button>
                </form>
                <div className="d-flex justify-content-center align-items-center w-100">
                  <Link
                    className='fw-bold text-center text-decoration-none text-primary p-2'
                    onClick={() => setSelectedView('HrReg')}
                  >
                    Register as HR ?
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      case 'home':
        return (
          <div>
            <section className='carousel'>
              <div id="carouselExampleIndicators" className="carousel slide" data-bs-ride="carousel" data-bs-interval="3000">
                <div className="carousel-indicators">
                  <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                  <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1" aria-label="Slide 2"></button>
                  <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2" aria-label="Slide 3"></button>
                </div>
                <div className="carousel-inner">
                  <div className="carousel-item active">
                    <img src={slider1} className="d-block w-100" alt="Slider 1" />
                  </div>
                  <div className="carousel-item">
                    <img src={slider2} className="d-block w-100" alt="Slider 2" />
                  </div>
                  <div className="carousel-item">
                    <img src={slider3} className="d-block w-100" alt="Slider 3" />
                  </div>
                </div>
                <a className="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-bs-slide="prev">
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Previous</span>
                </a>
                <a className="carousel-control-next" href="#carouselExampleIndicators" role="button" data-bs-slide="next">
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Next</span>
                </a>
              </div>
            </section>
            <section className='info'>
              <div className='d-lg-flex align-items-center justify-content-center'>
                <div>
                  <img src={jobsearch} alt='seeking for jobs?' className='w-100' />
                </div>
                <div>
                  <div>
                    <h1 className='text-center fw-semibold' style={{ fontFamily: 'sans-serif', color: '#013356' }}>Looking for a Job?</h1>
                    <h4 className='text-center mt-3'>We empower people to realize their potential and build rewarding careers. As India’s Largest IT Staffing & Solutions Company, we can help turn your ambition to reality.</h4>
                    <h3 className='text-center text-secondary mt-4' style={{ fontFamily: 'monospace' }}>Your dream IT career. We’ll help you live it.</h3>
                    <p className='text-center fw-bold text-secondary'>Register here, to forge your career.</p>
                    <div className='d-flex justify-content-center mt-4'>
                      <div className='d-flex justify-content-center mt-4'>
                        <button
                          style={{ marginLeft: '20px', marginTop: "5px", background: "#013356", color: "white", }}
                          className='btn btn-info px-5 rounded shadow fw-bold text-white '
                          onClick={() => setSelectedView('InternReg')}
                        >
                          Continue to Register.
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </section>
            {/* <section className='testimonial p-lg-4 mt-4 mt-lg-2' style={{ backgroundColor: '#f8f9fa' }}>
              <div>
                <Box
                  ref={scrollRef}
                  sx={{
                    display: 'flex',
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    whiteSpace: 'nowrap',
                    p: 2,
                    gap: 2,
                    '::-webkit-scrollbar': {
                      display: 'none',
                    },
                  }}
                >
                  {[...Array(9)].map((_, index) => (
                    <Card
                      key={index}
                      sx={{
                        display: 'inline-block',
                        width: '200px',
                        flexShrink: 0,
                        textAlign: 'center',
                        backgroundColor: '#f5f5f5',
                      }}
                    >
                      <CardContent>
                        <Typography variant="h5">Card {index + 1}</Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </div>
            </section> */}
          </div>
        );
      case 'SuperAdminLogin':
        return <SuperAdminLogin />;

      case 'GuestLogin':
        return (
          <div className='login'>
            <div className="container d-flex flex-column justify-content-center align-items-center" style={{ height: '85vh' }}>
              <img alt='logo' className='rounded mb-3' src={ramana} style={{ width: '200px', height: 'auto' }} />

              <div className="border rounded shadow p-3 d-flex flex-column align-items-center bg-white" style={{ width: '100%', maxWidth: '500px' }}>
                <h4 className='fw-bold mb-4 mt-2 text-nowrap' style={{ fontFamily: 'monospace' }}>Login to Continue <i className="fa-solid fa-right-to-bracket"></i></h4>
                <TextField
                  label="Mobile No"
                  variant="outlined"
                  className="w-100 mb-3"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleChange}
                  required
                  error={Boolean(errors.mobileNo)}
                  helperText={errors.mobileNo}
                  inputProps={{ maxLength: 10 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <span className="bg-secondary-subtle rounded p-2">+91</span>
                      </InputAdornment>
                    ),
                    className: 'fw-bold'
                  }}
                  InputLabelProps={{ className: 'fw-bold text-secondary' }}
                  onKeyPress={(e) => {
                    const isValidInput = /[0-9]/;
                    if (!isValidInput.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={sendOtp}
                  disabled={timer > 0}
                  className='w-50 sendotp'
                >
                  {timer > 0 ? `Resend OTP in ${timer}s` : 'Send OTP'}
                </Button>
                <div className="d-flex justify-content-center align-items-center w-100">
                  <Link
                    to='/register/guest'
                    className='fw-bold text-center text-decoration-none text-primary p-2'
                  // onClick={() => setSelectedView('GuestReg')}
                  >
                    Register as Guest ?
                  </Link>
                </div>
                {otpSent && (
                  <div className="d-flex flex-column align-items-center mt-3">
                    <p className='fw-bold text-success'>OTP sent successfully!</p>
                    <div className="d-flex justify-content-between mb-3 w-100">
                      {formData.otp.map((digit, index) => (
                        <TextField
                          key={index}
                          id={`otp-${index}`}
                          inputRef={index === 0 ? firstOtpInputRef : null} // Attach the ref to the first input field
                          variant="outlined"
                          className="text-center mx-1"
                          inputProps={{
                            maxLength: 1,
                            style: { textAlign: 'center', fontWeight: 'bold', width: '0.8rem', height: '0.8rem' },
                          }}
                          value={digit}
                          onChange={(e) => handleOtpChange(e, index)}
                          onFocus={(e) => e.target.select()}
                          onKeyDown={(e) => handleOtpChange(e, index)}
                        />
                      ))}
                    </div>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={GuestverifyOtp}
                      className='w-50 verifyotp'
                    >
                      Verify OTP
                    </Button>

                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'InternLogin':
        return (
          <div className='login'>
            <div className="container d-flex flex-column justify-content-center align-items-center" style={{ height: '85vh' }}>
              <img alt='logo' className='rounded mb-3' src={ramana} style={{ width: '200px', height: 'auto' }} />

              <div className="border rounded shadow p-3 d-flex flex-column align-items-center bg-white" style={{ width: '100%', maxWidth: '500px' }}>
                <h4 className='fw-bold mb-4 mt-2 text-nowrap' style={{ fontFamily: 'monospace' }}>Login to Continue <i className="fa-solid fa-right-to-bracket"></i></h4>
                <TextField
                  label="Mobile No"
                  variant="outlined"
                  className="w-100 mb-3"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleChange}
                  required
                  error={Boolean(errors.mobileNo)}
                  helperText={errors.mobileNo}
                  inputProps={{ maxLength: 10 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <span className="bg-secondary-subtle rounded p-2">+91</span>
                      </InputAdornment>
                    ),
                    className: 'fw-bold'
                  }}
                  InputLabelProps={{ className: 'fw-bold text-secondary' }}
                  onKeyPress={(e) => {
                    const isValidInput = /[0-9]/;
                    if (!isValidInput.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={sendOtpIntern}
                  disabled={timer > 0}
                  className='w-50 sendotp'
                >
                  {timer > 0 ? `Resend OTP in ${timer}s` : 'Send OTP'}
                </Button>
                <div className="d-flex justify-content-center align-items-center w-100">
                  <Link
                    to='/register/intern'
                    className='fw-bold text-center text-decoration-none text-primary p-2'
                  >
                    Register as Intern ?
                  </Link>
                </div>
                {otpSent && (
                  <div className="d-flex flex-column align-items-center mt-3">
                    <p className='fw-bold text-success'>OTP sent successfully!</p>
                    <div className="d-flex justify-content-between mb-3 w-100">
                      {formData.otp.map((digit, index) => (
                        <TextField
                          key={index}
                          id={`otp-${index}`}
                          inputRef={index === 0 ? firstOtpInputRef : null} // Attach the ref to the first input field
                          variant="outlined"
                          className="text-center mx-1"
                          inputProps={{
                            maxLength: 1,
                            autoComplete: "off",
                            style: { textAlign: 'center', fontWeight: 'bold', width: '0.8rem', height: '0.8rem' },
                          }}
                          value={digit}
                          onChange={(e) => handleOtpChange(e, index)}
                          onFocus={(e) => e.target.select()}
                          onKeyDown={(e) => handleOtpChange(e, index)}
                        />
                      ))}
                    </div>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={verifyOtp}
                      className='w-50 verifyotp'
                    >
                      Verify OTP
                    </Button>

                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'InternReg':
        return <InternRegistration setSelectedView={setSelectedView} />;
      case 'HrReg':
        return <HRRegistration setSelectedView={setSelectedView} />

      case 'GuestReg':
        return <GuestRegistration setSelectedView={setSelectedView} />

      case 'PrivacyPolicy':
        return (
          <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.6' }}>
            <h2 style={{ textAlign: 'center', color: '#013356' }}>Privacy Policy</h2>
            <p>
              We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and share your information when you visit our website or use our services.
            </p>
            <h3 style={{ color: '#01579B' }}>Information We Collect</h3>
            <p>
              We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact customer support. This may include your name, email address, phone number, and payment information.
            </p>
            <p>
              We also collect information automatically when you use our services, including your IP address, browser type, and browsing behavior on our site. This helps us improve our services and customize your experience.
            </p>
            <h3 style={{ color: '#01579B' }}>How We Use Your Information</h3>
            <p>
              We use your information to provide and improve our services, process transactions, and communicate with you. We may also use your information to send you promotional materials and updates, but you can opt-out at any time.
            </p>
            <p>
              We do not share your personal information with third parties except as necessary to provide our services or comply with legal obligations. We may share aggregated, anonymized data with our partners for research and analysis.
            </p>
            <h3 style={{ color: '#01579B' }}>Your Rights</h3>
            <p>
              You have the right to access, correct, or delete your personal information at any time. You can also object to or restrict our processing of your data. If you have any concerns about your privacy, please contact us.
            </p>
            <p>
              We are committed to keeping your information secure and will take appropriate measures to protect it from unauthorized access, disclosure, or misuse.
            </p>
            <h3 style={{ color: '#01579B' }}>Changes to This Policy</h3>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on our website and updating the date at the top of this page.
            </p>
            <p>
              Your continued use of our services after any changes to this policy will constitute your acceptance of the revised terms.
            </p>
          </div>
        );
      case 'Security':
        return (
          <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.6' }}>
            <h2 style={{ textAlign: 'center', color: '#013356' }}>Security</h2>
            <p>
              The security of your personal information is important to us. We employ a variety of security measures to ensure that your data is protected from unauthorized access, use, or disclosure.
            </p>
            <h3 style={{ color: '#01579B' }}>Security Measures</h3>
            <p>
              We use secure servers, encryption protocols, and regular software updates to protect your data. Our systems are monitored 24/7 for any suspicious activity, and we regularly conduct security audits to identify and address potential vulnerabilities.
            </p>
            <p>
              All sensitive information, such as credit card details, is transmitted securely using SSL (Secure Socket Layer) technology. We also use strong passwords and multi-factor authentication to safeguard your account.
            </p>
            <h3 style={{ color: '#01579B' }}>Data Breach Response</h3>
            <p>
              In the unlikely event of a data breach, we have a comprehensive response plan in place. We will notify affected users as soon as possible, provide guidance on protective measures, and work with law enforcement to investigate the breach.
            </p>
            <p>
              We encourage you to take your own precautions as well, such as keeping your login credentials confidential and using a strong, unique password for your account.
            </p>
            <h3 style={{ color: '#01579B' }}>Regular Security Updates</h3>
            <p>
              We continuously update our security practices to stay ahead of emerging threats. This includes patching vulnerabilities, upgrading our infrastructure, and educating our staff on the latest security protocols.
            </p>
            <p>
              Your trust is important to us, and we are committed to keeping your data secure. If you have any concerns or questions about our security practices, please contact us.
            </p>
            <h3 style={{ color: '#01579B' }}>Security Tips for Users</h3>
            <p>
              While we take extensive measures to protect your data, it's also important for you to follow best practices for online security. Here are a few tips:
            </p>
            <ul style={{ marginLeft: '20px', listStyleType: 'disc' }}>
              <li>Use a strong, unique password for each of your online accounts.</li>
              <li>Enable two-factor authentication wherever possible.</li>
              <li>Be cautious of phishing emails and links that ask for personal information.</li>
              <li>Keep your software and devices updated with the latest security patches.</li>
            </ul>
          </div>
        );
      case 'accessibility':
        return (
          <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.6' }}>
            <h2 style={{ textAlign: 'center', color: '#013356' }}>Website Accessibility</h2>
            <p>
              We are committed to ensuring that our website is accessible to all users, including individuals with disabilities. We believe that everyone should have equal access to our content and services, regardless of their abilities.
            </p>
            <h3 style={{ color: '#01579B' }}>Accessibility Features</h3>
            <p>
              Our website has been designed with accessibility in mind. Some of the features that enhance accessibility include:
            </p>
            <ul style={{ marginLeft: '20px', listStyleType: 'disc' }}>
              <li>Keyboard navigation: Users can navigate our website using only their keyboard.</li>
              <li>Text alternatives: We provide text alternatives for all non-text content, such as images and videos.</li>
              <li>Responsive design: Our site is optimized for different screen sizes and devices, ensuring a consistent experience across platforms.</li>
              <li>Color contrast: We use high-contrast color schemes to make text and images easier to see.</li>
            </ul>
            <h3 style={{ color: '#01579B' }}>Continuous Improvement</h3>
            <p>
              We are constantly working to improve our website's accessibility. We regularly review our site against accessibility standards, such as the Web Content Accessibility Guidelines (WCAG), and make necessary updates to ensure compliance.
            </p>
            <p>
              We welcome feedback from our users. If you encounter any barriers to accessibility on our site, please let us know. Your input helps us create a more inclusive experience for everyone.
            </p>
            <h3 style={{ color: '#01579B' }}>Assistive Technology Compatibility</h3>
            <p>
              Our website is compatible with a variety of assistive technologies, including screen readers, voice recognition software, and screen magnifiers. We strive to provide a seamless experience for users who rely on these tools.
            </p>
            <p>
              If you have any questions or need assistance with accessing our content, please do not hesitate to contact us. We are here to help and are committed to making our website accessible to all.
            </p>
          </div>
        );
      case 'Cookies':
        return (
          <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.6' }}>
            <h2 style={{ textAlign: 'center', color: '#013356' }}>Cookies</h2>
            <p>
              Our website uses cookies to enhance your browsing experience and provide personalized content and services. This Cookies Policy explains what cookies are, how we use them, and how you can manage your cookie preferences.
            </p>
            <h3 style={{ color: '#01579B' }}>What Are Cookies?</h3>
            <p>
              Cookies are small text files that are placed on your device when you visit a website. They allow the website to remember your actions and preferences over time, so you don't have to re-enter information each time you return to the site.
            </p>
            <h3 style={{ color: '#01579B' }}>Types of Cookies We Use</h3>
            <ul style={{ marginLeft: '20px', listStyleType: 'disc' }}>
              <li>
                <strong>Essential Cookies:</strong> These cookies are necessary for the basic functionality of our website, such as enabling you to log in and access secure areas.
              </li>
              <li>
                <strong>Performance Cookies:</strong> These cookies help us understand how visitors interact with our site by collecting anonymous information about page views, traffic sources, and other metrics.
              </li>
              <li>
                <strong>Functional Cookies:</strong> These cookies allow us to remember your preferences, such as language settings and display options, to provide a more personalized experience.
              </li>
              <li>
                <strong>Advertising Cookies:</strong> These cookies are used to deliver relevant advertisements based on your browsing behavior. They also help us measure the effectiveness of our advertising campaigns.
              </li>
            </ul>
            <h3 style={{ color: '#01579B' }}>Managing Your Cookie Preferences</h3>
            <p>
              You can manage your cookie preferences through your browser settings. Most browsers allow you to block or delete cookies, but please note that doing so may affect your ability to use certain features of our website.
            </p>
            <p>
              If you have any questions about our use of cookies or need assistance with managing your preferences, please contact us.
            </p>
            <h3 style={{ color: '#01579B' }}>Changes to This Policy</h3>
            <p>
              We may update this Cookies Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any significant changes by posting the updated policy on our website.
            </p>
            <p>
              Your continued use of our website after any changes to this policy will constitute your acceptance of the revised terms.
            </p>
          </div>
        );
      case 'PageNotFound':
        return <PageNotFound />
      default:
        return null;
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleScroll = () => {
    if (window.pageYOffset > 300) {
      setShowBackToTop(true);
    } else {
      setShowBackToTop(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="container-fluid justify-content-center">
      <section className='header'>
        <div className="container-fluid justify-content-center" style={{ alignItems: "center", background: '#013356', height: "57px", display: "flex", borderBottomLeftRadius: "5px", borderBottomRightRadius: "5px" }}>
          <Link onClick={() => setSelectedView('home')} to="/">
            <img src={ramana} alt="ramanaSoft" width={'120px'} style={{ marginLeft: "30px" }} />
          </Link>

          <ul
            className='d-flex justify-content-end text-nowrap align-items-center header w-100 text-white p-2 fw-bold'
            style={{ listStyle: 'none', alignItems: "center", marginTop: "30px" }}
          >
            {menuItems
              .filter((item) => item.id !== 'HRLogin' && item.id !== 'SuperAdminLogin' && item.id !== 'InternLogin' && item.id !== 'InternReg' && item.id !== 'HrReg' && item.id !== 'GuestReg' && item.id !== 'GuestLogin' && item.id !== 'PrivacyPolicy' && item.id !== 'Security' && item.id !== 'accessibility' && item.id !== 'Cookies' && item.id !== 'PageNotFound')
              .map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleMenuItemClick(item.id)}
                  style={{
                    cursor: 'pointer',
                    margin: '0px 15px',
                    border: '1px solid transparent',
                    borderRadius: '4px',
                    color: selectedView === item.id ? '#fff' : '#fff',
                    transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
                  }}
                >
                  {item.name}
                </li>
              ))}
            <li>
              <Button variant="contained" color="primary" onClick={handleClick} style={{ marginLeft: '20px', marginTop: "5px", background: "rgba(0, 0, 0, .08)", color: "white", border: "1px solid white" }}>
                Login
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem
                  style={{
                    padding: "0px 24px",
                    fontSize: "15px",
                    fontWeight: "bold",
                    textAlign: 'center',
                    marginTop: "10px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0)",
                    transition: "background-color 1s ease, transform 1s ease"

                  }}
                  onClick={() => handleLoginMenuItemClick('Intern')}>
                  Intern
                </MenuItem>
                <MenuItem
                  style={{
                    padding: "0px 24px",
                    fontSize: "15px",
                    fontWeight: "bold",
                    textAlign: 'center',
                    marginTop: "10px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0)",
                    transition: "background-color 1s ease, transform 1s ease"
                  }}
                  onClick={() => handleLoginMenuItemClick('Guest')}>
                  Guest
                </MenuItem>
              </Menu>
            </li>
          </ul>
        </div>
      </section>
      <div className='content'>
        {renderContent()}
      </div>
      <footer>
        <div style={{ background: '#013356', color: '#ffffff' }}>
          <div className="d-flex justify-content-center align-items-center py-3">
            <a href target="_blank" rel="noopener noreferrer">
              <FaFacebook style={{ margin: '0 10px', cursor: 'pointer', width: '25px', height: '25px' }} />
            </a>
            <a href target="_blank" rel="noopener noreferrer">
              <FaInstagram style={{ margin: '0 10px', cursor: 'pointer', width: '25px', height: '25px' }} />
            </a>
            <a href target="_blank" rel="noopener noreferrer">
              <FaTwitter style={{ margin: '0 10px', cursor: 'pointer', width: '25px', height: '25px' }} />
            </a>
            <a href="https://www.linkedin.com/company/ramanasoftware/?originalSubdomain=in" target="_blank" rel="noopener noreferrer">
              <FaLinkedin style={{ margin: '0 10px', cursor: 'pointer', width: '25px', height: '25px' }} />
            </a>
          </div>

          <hr style={{ borderColor: '#ffffff', width: '80%', margin: '0 auto' }} />

          <div className="text-center py-3">
            <h5 className="fw-bold">RamanaSoft</h5>
            <p>©2024 RamanaSoft IT Services. All rights reserved.</p>
            <Link
              to="/privacy-policy"
              className="text-decoration-none text-white mx-2"
              onClick={() => setSelectedView('PrivacyPolicy')}
            >Privacy Policy</Link>
            <Link
              to="/security"
              className="text-decoration-none text-white mx-2"
              onClick={() => setSelectedView('Security')}
            >Security</Link>
            <Link
              to="/accessibility"
              className="text-decoration-none text-white mx-2"
              onClick={() => setSelectedView('accessibility')}
            >Website Accessibility</Link>
            <Link
              to="/cookies"
              className="text-decoration-none text-white mx-2"
              onClick={() => setSelectedView('Cookies')}
            >Manage Cookies</Link>
          </div>
        </div>
      </footer>
      {showBackToTop && (
        <div
          className='back-to-top'
          style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: '999' }}
          onClick={scrollToTop}
        >
          <button className='p-2 rounded btn btn-outline-dark' title='back to top'>
            <i className='fas fa-arrow-up text-warning fs-5'></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
