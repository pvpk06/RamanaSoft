import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography } from '@mui/material';

const CertificateList = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showList, setShowList] = useState(false);

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const response = await axios.get('http://192.168.1.4:5000/show_all_certificates');
                console.log(response.data);
                setCertificates(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching certificates:', error);
                setLoading(false);
            }
        };

        fetchCertificates();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
                <CircularProgress />
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <Typography variant="h4" gutterBottom>
                All Certificates
            </Typography>
            <Button 
                variant="contained" 
                color="primary" 
                onClick={() => setShowList(prev => !prev)}
                style={{ marginBottom: '20px' }}
            >
                {showList ? 'Hide Certificates' : 'Show Certificates'}
            </Button>

            {showList && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Student Name</TableCell>
                                <TableCell>Domain</TableCell>
                                <TableCell>Position</TableCell>
                                <TableCell>Certification ID</TableCell>
                                <TableCell>Start Date</TableCell>
                                <TableCell>End Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {certificates.map((certificate, index) => (
                                <TableRow key={index}>
                                    <TableCell>{certificate.studentName}</TableCell>
                                    <TableCell>{certificate.domain}</TableCell>
                                    <TableCell>{certificate.position}</TableCell>
                                    <TableCell>{certificate.certificationId}</TableCell>
                                    <TableCell>{new Date(certificate.startDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{new Date(certificate.endDate).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </div>
    );
};

export default CertificateList;
