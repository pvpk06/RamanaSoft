import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './certificate.css';
import image1 from './images/image1.png';
import ravisir_sign from './images/ravisir_sign.png';
import ramprasadsir_sign from './images/ramprasadsir_sign.png';
import ramanasoft_stump from './images/ramanasoft_stump.png';
import apiService from '../../../apiService';
import { toast } from 'react-toastify';
import { Button, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, TextField, MenuItem, } from '@mui/material';


const CertificateGenerator = () => {
  const [studentName, setStudentName] = useState('');
  const [domain, setDomain] = useState('');
  const [position, setPosition] = useState('');
  const [certificationId, setCertificationId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCertificate, setShowCertificate] = useState(false);
  const certificateRef = useRef(null);
  const [certificates, setCertificates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [interns, setInterns] = useState([]);
  const [filteredInterns, setFilteredInterns] = useState([]);
  

  const domains = ['MERN Full Stack', 'Java Full Stack', 'Python Full Stack', 'Testing', 'Scrum Master', 'Business Analyst'];
  const positions = ['Frontend Developer', 'Backend Developer', 'Full stack Developer','Software Testing Engineer'];

  useEffect(() => {
    const fetchCertificationId = async () => {
      try {
        const month = new Date().getMonth() + 1;
        const monthString = month < 10 ? `0${month}` : `${month}`;
        const response = await apiService.get(`/api/generate-certificate-id/${domain}/${monthString}`);
        const newCertificationId = response.data.newCertificationId;
        setCertificationId(newCertificationId);
      } catch (error) {
        console.error('Error fetching certification ID:', error);
      }
    };

    if (domain) {
      fetchCertificationId();
    }
  }, [domain]);

  useEffect(() => {
    fetchCertificates();
  }, []);

  useEffect(() => {
    const fetchInterns = async () => {
      try {
        const response = await apiService.get('/api/intern_data');
        setInterns(response.data);
        console.log(interns);
        setFilteredInterns(response.data);
        console.log(filteredInterns);
      } catch (error) {
        console.error('Error fetching interns:', error);
      }
    };
    fetchInterns();
  }, []);
  
  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    setFilteredInterns(
      interns.filter((intern) =>
        (intern.name && intern.name.toLowerCase().includes(lowercasedQuery)) ||
        (intern.candidateID && intern.candidateID.toLowerCase().includes(lowercasedQuery)) 
      )
    )
    console.log("filteredInterns", filteredInterns);
  }, [searchQuery, interns]);

  
  const fetchCertificates = async () => {
    try {
      const response = await apiService.get('/api/show_all_certificates');
      setCertificates(response.data);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  const toCamelCase = (str) => {
    return str
      .split(' ')
      .map((word, index) => {
        if (index === 0) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };

  const formatDate = (date) => {
    if (!date) return '';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Intl.DateTimeFormat('en-GB', options).format(new Date(date));
  };

  const generatePDF = async () => {
    try {
      const certificateData = {
        studentName,
        domain,
        position,
        certificationId: certificationId,
        startDate,
        endDate
      };

      await apiService.post('/api/save_certificate_data', certificateData);
      toast.success("Certificate generated successfully!");

      const camelCaseStudentName = toCamelCase(studentName);
      html2canvas(certificateRef.current, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${camelCaseStudentName}_certificate.pdf`);
      });

    } catch (error) {
      console.error('Error generating certificate:', error);
      toast.error('There was an error generating the certificate.');
    }
  };

  const toggleCertificatePreview = () => {
    setShowCertificate((prevState) => !prevState);
  };

  return (
    <div>
    <div className='Certificate_Generator' style={{ marginTop: "30px" }}>
      <div className="input-form">
        <input
          type="text"
          placeholder="Student Name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
        />
        <select value={domain} onChange={(e) => setDomain(e.target.value)}>
          <option value="" disabled>Select Domain</option>
          {domains.map((dom, index) => (
            <option key={index} value={dom}>{dom}</option>
          ))}
        </select>

        <select value={position} onChange={(e) => setPosition(e.target.value)}>
          <option value="" disabled>Select Position</option>
          {positions.map((pos, index) => (
            <option key={index} value={pos}>{pos}</option>
          ))}
        </select>
        <div className="date-input-container">
          <label htmlFor="startDate">Start Date :</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="date-input-container">
          <label htmlFor="endDate">End Date :</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <button className="generate_buttons" onClick={toggleCertificatePreview}>
          {showCertificate ? 'Hide Certificate' : 'Preview Certificate'}
        </button>
        <button className="generate_buttons" onClick={generatePDF} disabled={!showCertificate}>
          Generate Certificate
        </button>
      </div>

      {showCertificate && (
        <div ref={certificateRef} className="certificate">
          <img src={image1} alt="Company Logo" className="company-logo" />
          <p className="date">Date: {formatDate(new Date())}</p>
          <h1>Experience Letter</h1>
          <p>Dear <strong>{toCamelCase(studentName)}</strong>,</p>
          <p>
            Congratulations on your successful completion of <strong>Internship</strong> on
            <strong> {domain}</strong> in our organization.
          </p>
          <div className="details">
            <p><strong>Position</strong>: {position}</p>
            <p><strong>Certification Id</strong>: {certificationId}</p>
            <p><strong>Duration</strong>: {formatDate(startDate)} to {formatDate(endDate)}</p>
          </div>
          <p>
            Your willingness to learn, adapt, showing sensitivity to urgency and
            involvement in the tasks assigned to you is appreciated by the entire
            Software Developer team. We are sure you will see success coming to
            you more easily with this approach.
          </p>
          <p>
            Besides showing high comprehension capacity, managing assignments with
            the utmost expertise, and exhibiting maximal efficiency, you have also
            maintained an outstanding professional demeanor and showcased
            excellent moral character throughout the traineeship period.
          </p>
          <div className='regards-p'>
            We hereby certify your overall work as <strong>Good</strong> to the best of my
            knowledge.
            <br />
            Wishing you the best of luck in your future endeavors.
          </div>
          <img src={ramanasoft_stump} alt='CEO' style={{ width: "120px", height: "120px", marginLeft: "30px", marginTop: "40px" }} />
          <div className='signature-container'>
            <p className="ceo-signature">C.E.O</p>
            <p className="manager-signature">Program Manager</p>
          </div>
          <div className='signature-container2'>
            <img src={ramprasadsir_sign} alt='CEO' style={{ width: "120px", height: "30px", marginLeft: "30px" }} />
            <img src={ravisir_sign} alt='Program_Manager' style={{ width: "120px", height: "40px", marginRight: "20px" }} />
          </div>
        </div>
        
      )}
      
       <div>
         <Typography variant="h5" gutterBottom>
           Certificate List
         </Typography>
         {certificates.length > 0 ? (
           <TableContainer component={Paper}>
             <Table>
               <TableHead>
                 <TableRow>
                   <TableCell>Name</TableCell>
                   <TableCell>Domain</TableCell>
                   <TableCell>Position</TableCell>
                   <TableCell>Certification Id</TableCell>
                   <TableCell>Start Date</TableCell>
                   <TableCell>End Date</TableCell>
                 </TableRow>
               </TableHead>
               <TableBody>
                 {certificates.map((certificate) => (
                   <TableRow key={certificate.certificationId}>
                     <TableCell>{certificate.studentName}</TableCell>
                     <TableCell>{certificate.domain}</TableCell>
                     <TableCell>{certificate.position}</TableCell>
                     <TableCell>{certificate.certificationId}</TableCell>
                     <TableCell>{formatDate(certificate.startDate)}</TableCell>
                     <TableCell>{formatDate(certificate.endDate)}</TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           </TableContainer>
         ) : (
          <Typography variant="body1">No certificates available.</Typography>
         )}
       </div>
     </div>
     </div>
  );
};

export default CertificateGenerator;


// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import { Button, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, TextField, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
// import image1 from './images/image1.png';
// import ravisir_sign from './images/ravisir_sign.png';
// import ramprasadsir_sign from './images/ramprasadsir_sign.png';
// import ramanasoft_stump from './images/ramanasoft stump.png';


// const CertificateGenerator = () => {
//   const [studentName, setStudentName] = useState('');
//   const [domain, setDomain] = useState('');
//   const [position, setPosition] = useState('');
//   const [certificationId, setCertificationId] = useState('');
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [showCertificate, setShowCertificate] = useState(false);
  // const [certificates, setCertificates] = useState([]);
//   const certificateRef = useRef(null);

  // useEffect(() => {
  //   fetchCertificates();
  // }, []);

  // const fetchCertificates = async () => {
  //   try {
  //     const response = await axios.get('/api/show_all_certificates');
  //     setCertificates(response.data);
  //   } catch (error) {
  //     console.error('Error fetching certificates:', error);
  //   }
  // };

//   const handleGenerateCertificate = () => {
//     setShowCertificate(true);
//     const newCertificate = {
//       studentName,
//       domain,
//       position,
//       certificationId,
//       startDate,
//       endDate,
//     };
//     saveCertificate(newCertificate);
//   };

//   const toCamelCase = (str) => {
//     return str
//       .split(' ')
//       .map((word, index) => {
//         if (index === 0) {
//           return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
//         }
//         return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
//       })
//       .join(' ');
//   };

//   const saveCertificate = async (certificate) => {
//     try {
//       await axios.post('/api/save_certificate', certificate);
//       fetchCertificates(); // Refresh the certificate list after saving
//     } catch (error) {
//       console.error('Error saving certificate:', error);
//     }
//   };

//   const generatePDF = async () => {
//     try {
//       const certificateData = {
//         studentName,
//         domain,
//         position,
//         certificationId: certificationId,
//         startDate,
//         endDate
//       };

//       await axios.post('/api/save_certificate_data', certificateData);
//       toast.success("Certificate generated successfully!");

//       const camelCaseStudentName = toCamelCase(studentName);
//       html2canvas(certificateRef.current, { scale: 2 }).then((canvas) => {
//         const imgData = canvas.toDataURL('image/png');
//         const pdf = new jsPDF('p', 'mm', 'a4');
//         const pdfWidth = pdf.internal.pageSize.getWidth();
//         const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
//         pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
//         pdf.save(`${camelCaseStudentName}_certificate.pdf`);
//       });

//     } catch (error) {
//       console.error('Error generating certificate:', error);
//       toast.error('There was an error generating the certificate.');
//     }
//   };

//   const formatDate = (date) => {
//     const options = { year: 'numeric', month: 'long', day: 'numeric' };
//     return new Date(date).toLocaleDateString(undefined, options);
//   };

//   return (
//     <div>
//       <Typography variant="h4" gutterBottom>
//         Certificate Generator
//       </Typography>

//       <div>
//         <TextField
//           label="Student Name"
//           value={studentName}
//           onChange={(e) => setStudentName(e.target.value)}
//           fullWidth
//           margin="normal"
//         />

//         <FormControl fullWidth margin="normal">
//           <InputLabel>Domain</InputLabel>
//           <Select value={domain} onChange={(e) => setDomain(e.target.value)}>
//             <MenuItem value="Technology">Technology</MenuItem>
//             <MenuItem value="Science">Science</MenuItem>
//             <MenuItem value="Arts">Arts</MenuItem>
//           </Select>
//         </FormControl>

//         <TextField
//           label="Position"
//           value={position}
//           onChange={(e) => setPosition(e.target.value)}
//           fullWidth
//           margin="normal"
//         />

//         <TextField
//           label="Certification ID"
//           value={certificationId}
//           onChange={(e) => setCertificationId(e.target.value)}
//           fullWidth
//           margin="normal"
//         />

//         <TextField
//           label="Start Date"
//           type="date"
//           value={startDate}
//           onChange={(e) => setStartDate(e.target.value)}
//           InputLabelProps={{ shrink: true }}
//           fullWidth
//           margin="normal"
//         />

//         <TextField
//           label="End Date"
//           type="date"
//           value={endDate}
//           onChange={(e) => setEndDate(e.target.value)}
//           InputLabelProps={{ shrink: true }}
//           fullWidth
//           margin="normal"
//         />

//         <Button variant="contained" color="primary" onClick={handleGenerateCertificate}>
//           Generate Certificate
//         </Button>
//       </div>

//       {showCertificate && (
//         <div ref={certificateRef} className="certificate">
//           <img src={image1} alt="Company Logo" className="company-logo" />
//           <p className="date">Date: {formatDate(new Date())}</p>
//           <h1>Experience Letter</h1>
//           <p>Dear <strong>{toCamelCase(studentName)}</strong>,</p>
//           <p>
//             Congratulations on your successful completion of <strong>Internship</strong> on
//             <strong> {domain}</strong> in our organization.
//           </p>
//           <div className="details">
//             <p><strong>Position</strong>: {position}</p>
//             <p><strong>Certification Id</strong>: {certificationId}</p>
//             <p><strong>Duration</strong>: {formatDate(startDate)} to {formatDate(endDate)}</p>
//           </div>
//           <p>
//             Your willingness to learn, adapt, showing sensitivity to urgency and
//             involvement in the tasks assigned to you is appreciated by the entire
//             Software Developer team. We are sure you will see success coming to
//             you more easily with this approach.
//           </p>
//           <p>
//             Besides showing high comprehension capacity, managing assignments with
//             the utmost expertise, and exhibiting maximal efficiency, you have also
//             maintained an outstanding professional demeanor and showcased
//             excellent moral character throughout the traineeship period.
//           </p>
//           <div className='regards-p'>
//             We hereby certify your overall work as <strong>Good</strong> to the best of my
//             knowledge.
//             <br />
//             Wishing you the best of luck in your future endeavors.
//           </div>
//           <img src={ramanasoft_stump} alt='CEO' style={{ width: "120px", height: "120px", marginLeft: "30px", marginTop: "40px" }} />
//           <div className='signature-container'>
//             <p className="ceo-signature">C.E.O</p>
//             <p className="manager-signature">Program Manager</p>
//           </div>
//           <div className='signature-container2'>
//             <img src={ramprasadsir_sign} alt='CEO' style={{ width: "120px", height: "30px", marginLeft: "30px" }} />
//             <img src={ravisir_sign} alt='Program_Manager' style={{ width: "120px", height: "40px", marginRight: "20px" }} />
//           </div>
//         </div>
        
//       )}

    //   <div>
    //     <Typography variant="h5" gutterBottom>
    //       Certificate List
    //     </Typography>
    //     {certificates.length > 0 ? (
    //       <TableContainer component={Paper}>
    //         <Table>
    //           <TableHead>
    //             <TableRow>
    //               <TableCell>Name</TableCell>
    //               <TableCell>Domain</TableCell>
    //               <TableCell>Position</TableCell>
    //               <TableCell>Certification Id</TableCell>
    //               <TableCell>Start Date</TableCell>
    //               <TableCell>End Date</TableCell>
    //             </TableRow>
    //           </TableHead>
    //           <TableBody>
    //             {certificates.map((certificate) => (
    //               <TableRow key={certificate.certificationId}>
    //                 <TableCell>{certificate.studentName}</TableCell>
    //                 <TableCell>{certificate.domain}</TableCell>
    //                 <TableCell>{certificate.position}</TableCell>
    //                 <TableCell>{certificate.certificationId}</TableCell>
    //                 <TableCell>{formatDate(certificate.startDate)}</TableCell>
    //                 <TableCell>{formatDate(certificate.endDate)}</TableCell>
    //               </TableRow>
    //             ))}
    //           </TableBody>
    //         </Table>
    //       </TableContainer>
    //     ) : (
    //       <Typography variant="body1">No certificates available.</Typography>
    //     )}
    //   </div>
    // </div>
//   );
// };

// export default CertificateGenerator;
