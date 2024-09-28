import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import apiService from '../../../apiService';
import { Card, Button, Container, Row, Col, ListGroup } from 'react-bootstrap';
import { Typography } from '@mui/material';
import { FaClock } from 'react-icons/fa';

const Quiz = () => {
  const user_id = Cookies.get("internID");
  const [assignedQuizzes, setAssignedQuizzes] = useState([]);
  const [submittedQuizzes, setSubmittedQuizzes] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date().toISOString());

  useEffect(() => {
  console.log("Fetching data...");
  fetchData();

  // Set a timer to update the current time every second
  const timeUpdater = setInterval(() => {
    const nowTime = new Date().toISOString();
    setCurrentTime(nowTime);
  }, 1000);

  // Poll the backend to refresh the data every 30 seconds (adjust time as needed)
  const dataUpdater = setInterval(() => {
    console.log("Polling for updated quiz data...");
    fetchData(); // Fetch updated data
  }, 30000); // 30 seconds

  return () => {
    console.log("Clearing intervals");
    clearInterval(timeUpdater); // Clear the time update interval
    clearInterval(dataUpdater); // Clear the polling interval
  };
}, [user_id]);

 
  const fetchData = async () => {
    try {
      const response = await apiService.get(`/api/user-quizzes/${user_id}`);
      console.log("API Response:", response);

      const data = response.data;
      const assigned = data.filter(quiz => !quiz.status);
      const submitted = data.filter(quiz => quiz.status);

      data.forEach((quiz) => {
        const utcDateFrom = new Date(quiz.schedule_quiz_from);
        const localDateFrom = utcDateFrom.toLocaleString(); // Converts to local time zone
        const utcDateTo = new Date(quiz.schedule_quiz_to);
        const localDateTo = utcDateTo.toLocaleString(); // Converts to local time zone
        console.log(`Quiz: ${quiz.quiz_name}`);
        console.log("Local from:", localDateFrom);
        console.log("Local to:", localDateTo);
      });

      setAssignedQuizzes(assigned);
      setSubmittedQuizzes(submitted);
      console.log("Assigned quizzes:", assigned);
      console.log("Submitted quizzes:", submitted);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handleAttemptQuiz = (quizId) => {
    console.log(`Attempting quiz with ID: ${quizId}`);
    const url = `/test/${quizId}`;
    window.open(url, '_blank');
  };

  const handleViewAnalysis = (quizToken) => {
    console.log(`Viewing analysis for quiz token: ${quizToken}`);
    const url = `/quiz-analysis/${user_id}/${quizToken}`;
    window.open(url, '_blank');
  };

  const getQuizStatus = (scheduleFrom, scheduleTo) => {
    const now = new Date(currentTime);
    const start = new Date(scheduleFrom);
    const end = new Date(scheduleTo);

    // If current time is before the start, it's not available yet
    if (now < start) {
      const totalSeconds = Math.ceil((start - now) / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      return {
        status: 'not available',
        time: `Starts in ${formattedTime}`,
        color: 'blue'
      };
    }

    // If current time is between start and end, it's available
    if (now >= start && now <= end) {
      const totalSeconds = Math.ceil((end - now) / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const timeRemaining = `${minutes}m ${seconds}s remaining`;

      return {
        status: 'available',
        time: timeRemaining,
        color: 'green'
      };
    }

    // If current time is past the end, it's expired
    return {
      status: 'expired',
      time: 'Quiz expired',
      color: 'red'
    };
  };

  return (
    <Container style={{ marginTop: '20px' }}>
      {assignedQuizzes.length > 0 ? (
        <Row>
          <Col>
            <Typography variant="h5" gutterBottom>
              Available Quizzes
            </Typography>
            <ListGroup>
              {assignedQuizzes.map((quiz) => {
                const { status, time, color } = getQuizStatus(quiz.schedule_quiz_from, quiz.schedule_quiz_to);

                return (
                  <ListGroup.Item key={quiz.id} className="mb-3">
                    <Card.Body className="d-flex justify-content-between align-items-center">
                      <Typography
                        style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#333',
                          padding: '5px 0',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          maxWidth: '70%',
                        }}
                      >
                        {quiz.quiz_name}
                      </Typography>
                      <div style={{alignItems:"center"}}>
                        {status === 'available' && (
                          <Button
                            onClick={() => handleAttemptQuiz(quiz.token)}
                            style={{
                              backgroundColor: '#007bff',
                              color: '#fff',
                              padding: '10px 15px',
                              border: 'none',
                              alignItems:"center",
                              borderRadius: '5px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              transition: 'background-color 0.3s',
                              marginRight: '10px',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                          >
                            Attempt Quiz
                          </Button>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', color, marginTop:"3px" }}>
                          <FaClock style={{ marginRight: '5px' }} />
                          <Typography style={{ color }}>
                            {time}
                          </Typography>
                        </div>
                      </div>
                    </Card.Body>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </Col>
        </Row>
      ) : (
        <Typography variant="body1" align="center" style={{ margin: '20px 0' }}>
          No quizzes assigned
        </Typography>
      )}

      {submittedQuizzes.length > 0 ? (
        <Row style={{ marginTop: '40px' }}>
          <Col>
            <Typography variant="h5" gutterBottom>
              Your Submissions
            </Typography>
            <ListGroup>
              {submittedQuizzes.map((quiz) => (
                <ListGroup.Item key={quiz.id} className="mb-3">
                  <Card>
                    <Card.Body className="d-flex justify-content-between align-items-center">
                      <Typography variant="h6">{quiz.quiz_name}</Typography>
                      <Button variant="success" onClick={() => handleViewAnalysis(quiz.token)}>
                        View Analysis
                      </Button>
                    </Card.Body>
                  </Card>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
        </Row>
      ) : (
        <Typography variant="body1" align="center" style={{ margin: '20px 0' }}>
          No quizzes submitted yet
        </Typography>
      )}
    </Container>
  );
};

export default Quiz;
