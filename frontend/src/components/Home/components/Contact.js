import React, { useEffect, useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import contact from '../images/contact.jpg';
import './styling.css';
import { toast } from 'react-toastify';

const Contact = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [formData, setFormData] = useState({
    to_name: '',
    from_name: '',
    message: '',
  });
  useEffect(()=>{
    window.scrollTo(0, 0);
 },[]);
 
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const form = useRef();
  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm('service_b8w3fbs', 'template_jwxga0b', form.current, 'IbKEkzMWeB4fDNBSj')
      .then(
        () => {
          toast.success('e-mail sent!');
          setFormData({
            to_name: '',
            from_name: '',
            message: '',
          })
        },
        (error) => {
          toast.warning('FAILED...', error.text);
        },
      );
  };

  return (
    <div className='p-1'>
      <section className='image'>
        <div>
          <img src={contact} alt='contact' className='w-100 contact' style={{ height: '55vh' }} />
        </div>
      </section>
      <section className="branches mt-5">
        <div className="container">
          <h2 className="text-center mb-4" style={{color:'#c80000'}}>Our Branches <i className="fa-solid fa-code-branch fs-4"></i></h2>
          <div className="row mb-5 border rounded p-2 bg">
            <div className="col-md-5 px-5 py-4">
              <h4>RamanaSoft IT-Services</h4>
              <p>
                <strong>Address:</strong><br />
                Aditya Trade Center<br />
                404, fourth floor, <br />
                Ameerpet, Hyderabad<br />
                Telangana, India.
              </p>
              <p>
                <strong>Phone:</strong> 1800-2020-0344<br />
                <strong>Email:</strong> support.ramanasoft@gmail.com
              </p>
            </div>
            <div className="col-md-7">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d238.0516257759557!2d78.44636970361658!3d17.43667573157586!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb90cf65909a77%3A0x711aa7f9600e3ad1!2sAditya%20Trade%20Center!5e0!3m2!1sen!2sus!4v1718983589638!5m2!1sen!2sus"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Location 1"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
      <section className='contact-form'>
        <div className='mt-4 text-center'>
          <h2 className='text-center fw-bold' style={{color:'#c80000'}}>Contact Us <i className="fa-solid fa-circle-question"></i></h2>
          <h1 className='fw-bold p-2' style={{fontFamily:'cursive',color:'#013356'}}>For Customer Queries</h1>
          <h4 className='text-secondary mt-2'><i className="fa-solid fa-headset"></i> <a href='callto:1800-2020-0344' className='text-decoration-none text-secondary fw-bold'>1800-2020-0344</a></h4>
          <h4 className='text-secondary mt-2'><i className="fa-solid fa-headset"></i> <a href='callto:1800-2020-0344' className='text-decoration-none text-secondary fw-bold'>1800-2024-0345</a></h4>
          <h1 className='fw-bold p-2' style={{fontFamily:'cursive',color:'#013356'}}>For Support Chat</h1>
          <h4 className='text-secondary mt-2'><i className="fa-solid fa-envelope"></i> <a href='mailto:support@ramanasoft.gmail.com' className='text-decoration-none text-secondary fw-bold'>support@ramanasoft.com</a></h4>
        </div>
        <div className='d-flex justify-content-center mb-4 mt-3'>
          <div className='p-3 mx-lg-5 mx-1 mt-3 w-50 form border shadow rounded'>
            <h2 className='text-center fw-bold text-info'>Write a Message <i className="fa-solid fa-comment"></i></h2>
            <form ref={form} onSubmit={sendEmail}>
              <div className="mb-3">
                <label htmlFor="to_name" className="form-label fw-bold text-secondary">Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="to_name"
                  name="to_name"
                  value={formData.to_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="from_name" className="form-label fw-bold text-secondary">Email address</label>
                <input
                  type="email"
                  className="form-control"
                  id="from_name"
                  name="from_name"
                  value={formData.from_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="message" className="form-label fw-bold text-secondary">Message</label>
                <textarea
                  className="form-control"
                  id="message"
                  name="message"
                  rows="3"
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary px-4 fw-bold shadow">Submit <i className="fa-solid fa-paper-plane"></i></button>
            </form>
          </div>
        </div>
      </section>

      {showBackToTop && (
        <div className="back-to-top" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: '999' }} onClick={scrollToTop}>
          <button className='p-2 rounded btn btn-outline-dark' title='back to top'>
            <i className="fas fa-arrow-up text-warning fs-5"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default Contact;
