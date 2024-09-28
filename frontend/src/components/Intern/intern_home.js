import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, Typography, Button, Grid, LinearProgress, Box, CircularProgress 
} from '@mui/material';
import Cookies from 'js-cookie';
import apiService from '../../apiService';

function Home({setSelectedView}) {
    const [pdf, setPdf] = useState(null);
    const [achievementVisible, setAchievementVisible] = useState(false);
    const [courseStatus, setCourseStatus] = useState([]);
    const [loading, setLoading] = useState(true);
    const internID = Cookies.get('internID');

    useEffect(() => {
        fetchCourseProgress();
    }, []);

    const fetchCourseProgress = async () => {
        try {
            setLoading(true);
            const response = await apiService.get(`/api/intern-progress/${internID}`);
            console.log(response);
            setCourseStatus(response.data.courseData || []); // Fallback to an empty array if data is not present
        } catch (error) {
            console.error('Error fetching course progress:', error);
        } finally {
            setLoading(false);
        }
    };

    // const showPdf = (pdfUrl) => {
    //     setPdf(pdfUrl);
    //     setAchievementVisible(false); 
    // };

    // const showAchievement = () => {
    //     setAchievementVisible(true);
    //     setPdf(null); 
    // };

    const closeContent = () => {
        setPdf(null);
        setAchievementVisible(false);
    };

    const handleContinue = () => {
        setSelectedView('LMS');
      };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                    Course Progress
                </Typography>
                <Grid container spacing={3}>
                    {courseStatus.map((course, index) => {
                        const { course_name, completed_materials, total_materials } = course;
                        const progress = (completed_materials / total_materials) * 100;

                        return (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="body1">{course_name}</Typography>
                                        <LinearProgress variant="determinate" value={progress} />
                                        <Typography variant="body2">
                                            {completed_materials} / {total_materials} completed
                                        </Typography>
                                        <Button variant="outlined" color="primary" sx={{ mt: 1 }} onClick={handleContinue}>
                                            Continue Learning
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>

            {/* <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            Achievement
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Click to view your offer letter / Achievement
                        </Typography>
                        <Button 
                            variant="contained" 
                            onClick={() => showPdf('/path/to/your/file.pdf')} 
                            sx={{ mr: 1 }}
                        >
                            Offer Letter
                        </Button>
                        <Button variant="contained" onClick={showAchievement}>
                            Achievement
                        </Button>
                    </CardContent>
                </Card>
            </Grid> */}

            </Grid>

            {(pdf || achievementVisible) && (
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Button onClick={closeContent} variant="contained" sx={{ mb: 2 }}>
                                Close
                            </Button>
                            {pdf && (
                                <Box component="iframe" src={pdf} width="100%" height="600px" border="none" />
                            )}
                            {achievementVisible && (
                                <Box>
                                    <Typography variant="h6">Achievement</Typography>
                                    <Typography>Here you can display details about the achievements.</Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            )}
        </Grid>
    );
}

export default Home;
