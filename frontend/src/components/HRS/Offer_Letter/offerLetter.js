import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './offerLetter.css';
import logo from './images/image1.png';  // Import your company logo
import signature from './images/ramprasadsir_sign.png';  // Import signature image
import stamp from './images/ramanasoft_stump.png';  // Import company stamp

const OfferLetter = () => {
  const certificateRef = useRef(null);
  const [showCertificate, setShowCertificate] = useState(false);

  const internDetails = {
    internName: 'Praveen Kumar',
    internshipDuration: '3 months',
    companyName: 'RamanaSoft',
    companyAddress: '#404, 4th Floor, Aditya Trade Centre, Ameerpet, Hyderabad-500016',
    companyPhone: '812 53 093 48',
    companyEmail: 'info@ramanasoft.com',
  };

  const formatDate = (date) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Intl.DateTimeFormat('en-GB', options).format(new Date(date));
  };

  const generatePDF = () => {
    html2canvas(certificateRef.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${internDetails.internName}_OfferLetter.pdf`);
    });
  };

  const toggleCertificatePreview = () => {
    setShowCertificate((prevState) => !prevState);
  };

  return (
    <div className="certificate-generator">
      <div className="button-container">
        <button className="generate-button" onClick={toggleCertificatePreview}>
          {showCertificate ? 'Hide Offer Letter' : 'Preview Offer Letter'}
        </button>
        <button className="generate-button" onClick={generatePDF} disabled={!showCertificate}>
          Download Offer Letter
        </button>
      </div>

      {showCertificate && (
        <div ref={certificateRef} className="certificate">
          <img src={logo} alt="Company Logo" className="company-logo" />
          <h1>Offer Letter</h1>
          <p>Dear <strong>{internDetails.internName}</strong>,</p>

          <p>
          We are delighted to offer you a <strong>3 months</strong> internship opportunity with our company. You will be joining us as a <strong>MERN Stack Developer</strong> intern, where you will have the chance to work on cutting-edge software solutions across various industries. We are confident that your time with us will be both educational and rewarding.
          </p>

          <p>
          Throughout the duration of your internship, you will be an integral part of our team, working closely with developers, testers, and project managers. You will gain exposure to various stages of the software development lifecycle, including requirements gathering, design, coding, and testing.
          </p>
          <p>
          As an intern, you will have the opportunity to: <br/>
          </p>
          <p style={{marginLeft:"50px", }}>
            •	Work with a variety of technologies and programming languages<br/>
            •	Learn and apply software development methodologies such as Agile and Waterfall.<br/>
            •	Develop your coding and debugging skills<br/>
            •	Learn about software testing and quality assurance processes.<br/>
            •	Collaborate with team members on projects and contribute to the development of software solutions<br/>
            •	Gain exposure to the software industry and network with professionals in the field<br/>

          </p>
          <p>
          We believe this internship will provide a valuable opportunity to expand your skills, gain practical experience, and build your professional network. We look forward to welcoming you to our team and working with you.
          </p>

          <div className="company-info">
            <p>Sincerely,</p>
            <p>From <strong>{internDetails.companyName}</strong></p>
            <img src={stamp} alt="Company Stamp" className="stamp" style={{ width: "120px", height: "120px", marginLeft: "60px",  }} />
            <div className="signature-container">
              <img src={signature} alt="Authorized Signatory" className="signature" style={{ width: "120px", height: "30px", marginLeft: "60px" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferLetter;
