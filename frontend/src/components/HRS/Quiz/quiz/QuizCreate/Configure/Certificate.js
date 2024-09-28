import React, { useState, useEffect, useRef } from 'react';
import './certificate.css';
import apiService from '../../../../../../apiService';

const Certificate = ({ certificateId }) => {
  const [certificateData, setCertificateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const certificateRef = useRef(null);

  useEffect(() => {
    const fetchCertificateData = async () => {
      try {
        setLoading(true);
        const response = await apiService.get(`/api/intern_data/${certificateId}`);
        console.log(response);

        if (response.status !== 200) {
          throw new Error('Failed to fetch certificate data');
        }

        const data = response.data[0] || {};

        setCertificateData({
          name: data.fullName || '',
          id: data.candidateID || '',
          issueDate: data.issueDate || new Date().toISOString().split('T')[0],
          ceo: data.ceo || 'Y Ramprasad',
          programManager: data.programManager || 'Rajashekhar Reddy'
        });
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        setNotification({ message: 'Failed to fetch data', type: 'error' });
      }
    };

    fetchCertificateData();
  }, [certificateId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!certificateData) return <div>No certificate data found</div>;

  return (
    <div>
      <h2>Certificate:</h2>
      <div ref={certificateRef} className="certificate">
        <div className="header">
          <div className="logo">
            <span className="rs">RS</span>
            <span className="company-name">RamanaSoft</span>
          </div>
        </div>
        <div className="Certificate_content">
          <h1>QUIZ COMPLETION CERTIFICATE</h1>
          <p className="subtitle">This internship program certificate is proudly awarded to</p>
          <div className="recipient-name">{certificateData.name}</div>
          <div className="details">
            <p>ID No: <span>{certificateData.id}</span></p>
          </div>
        </div>
        <div className="signatures">
          <div className="signature">
            <p>{certificateData.ceo}</p>
            <p className="role">CEO</p>
          </div>
          <div className="signature">
            <p>{certificateData.programManager}</p>
            <p className="role">PROGRAM MANAGER</p>
          </div>
        </div>
        <p className="issue-date">Date Of Issue: {certificateData.issueDate}</p>
        <div className="border-design">
          <div className="top-right"></div>
          <div className="bottom-left"></div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
