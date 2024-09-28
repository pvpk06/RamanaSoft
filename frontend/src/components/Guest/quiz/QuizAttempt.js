import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './quizattempt.css';
import Cookies from 'js-cookie';
import apiService from '../../../apiService';
import { Pagination, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

const SuccessPopup = ({ message, onClose }) => (
  <div className="Attempt_popupStyle">
    <p>{message}</p>
    <button onClick={onClose}>Close</button>
  </div>
);

const QuizAttempt = () => {
  const { token } = useParams();
  const user_id = Cookies.get("internID");
  const [quizData, setQuizData] = useState(null);
  const [responses, setResponses] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage, setQuestionsPerPage] = useState(5);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const [quizEndTime, setQuizEndTime] = useState(null);
  const navigate = useNavigate();

  const convertToUTC = (dateString) => {
    // console.log('Converting to UTC:', dateString);
    const date = new Date(dateString);
    const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    const result = utcDate.toISOString().slice(0, 19).replace('T', ' ');
    // console.log('Converted UTC time:', result);
    return result;
  };

  useEffect(() => {
    const fetchQuizData = async () => {
      // console.log('Fetching quiz data for token:', token);
      try {
        const response = await apiService.get(`/api/get-quiz/${token}`);
        const data = response.data;
        // console.log('Received quiz data:', data);

        if (typeof data.pages_data === 'string') {
          try {
            data.pages_data = JSON.parse(data.pages_data);
            // console.log('Parsed pages_data:', data.pages_data);
          } catch (parseError) {
            console.error('Error parsing pages_data:', parseError);
            setError('Error parsing quiz data');
            return;
          }
        }

        if (data.randomize_questions) {
          // console.log('Randomizing questions');
          data.pages_data = data.pages_data.map(page => ({
            ...page,
            question_list: shuffleArray(page.question_list)
          }));
        }

        setQuizData(data);
        setQuestionsPerPage(data.no_of_qns_per_page || 5);
        // console.log('Questions per page set to:', data.no_of_qns_per_page || 5);

        const now = new Date();
        const quizStart = new Date(data.schedule_quiz_from);
        const quizEnd = new Date(data.schedule_quiz_to);
        setQuizEndTime(quizEnd);

        let remainingTime;
        if (now < quizStart) {
          // console.log('Quiz has not started yet');
          setError('The quiz has not started yet.');
          return;
        } else if (now > quizEnd) {
          // console.log('Quiz has already ended');
          setError('The quiz has already ended.');
          return;
        } else {
          const elapsedTime = Math.floor((now - quizStart) / 1000);
          const totalQuizTime = Math.floor((quizEnd - quizStart) / 1000);
          remainingTime = Math.max(0, totalQuizTime - elapsedTime);

          if (data.time_limit) {
            const timeLimit = data.time_limit * 60;
            remainingTime = Math.min(remainingTime, timeLimit);
          }
        }

        const savedStartTime = localStorage.getItem(`startTime_${token}_${user_id}`);
        const savedTimeLeft = localStorage.getItem(`timeLeft_${token}_${user_id}`);

        if (savedStartTime && savedTimeLeft) {
          const elapsedSinceLastSave = Math.floor((now - new Date(savedStartTime)) / 1000);
          const savedRemainingTime = parseInt(savedTimeLeft, 10) - elapsedSinceLastSave;
          remainingTime = Math.min(remainingTime, Math.max(0, savedRemainingTime));
        } else {
          localStorage.setItem(`startTime_${token}_${user_id}`, now.toISOString());
        }

        // console.log('Setting remaining time:', remainingTime);
        setTimeLeft(remainingTime);
        localStorage.setItem(`timeLeft_${token}_${user_id}`, remainingTime);

      } catch (error) {
        console.error('Error fetching quiz data:', error.response ? error.response.data : error.message);
        setError('Error fetching quiz data');
      }
    };

    fetchQuizData();
  }, [token, user_id]);
  
  useEffect(() => {
    if (timeLeft <= 0 || !quizData) return;

    // console.log('Starting timer with', timeLeft, 'seconds');
    const timerId = setInterval(() => {
      setTimeLeft(prevTimeLeft => {
        const newTime = prevTimeLeft - 1;
        localStorage.setItem(`timeLeft_${token}_${user_id}`, newTime);
        // console.log('Time left:', newTime);
        if (newTime <= 0) {
          // console.log('Time up, submitting quiz');
          clearInterval(timerId);
          handleSubmit(true);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, quizData, token, user_id]);

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const shuffleArray = (array) => {
    // console.log('Shuffling array:', array);
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    // console.log('Shuffled array:', array);
    return array;
  };

  const handleInputChange = (questionText, value) => {
    const parsedValue = isNaN(value) ? value : parseInt(value, 10);
    // console.log('Answer changed for question:', questionText, 'New value:', value);
    setResponses(prevResponses => ({
      ...prevResponses,
      [questionText]: parsedValue
    }));
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    if (!quizData) return;
    // console.log('Submitting quiz');

    if (!checkQuizSchedule()) {
      console.log('Quiz is not available at this time');
      setError('Quiz is not available at this time.');
      return;
    }

    const userId = user_id;
    const quizId = token;
    const startTime = localStorage.getItem(`startTime_${token}_${user_id}`);
    const endTime = new Date().toISOString();

    // console.log('Start Time:', startTime);
    // console.log('End Time:', endTime);

    const formattedStartTime = convertToUTC(startTime);
    const formattedEndTime = convertToUTC(endTime);

    const startTimeDate = new Date(startTime);
    const endTimeDate = new Date(endTime);
    const duration = Math.floor((endTimeDate - startTimeDate) / 1000);

    // console.log('Duration (seconds):', duration);

    const formattedResponses = Object.entries(responses).map(([questionText, answer]) => ({
      questionText,
      answer
    }));
    // console.log('Formatted responses:', formattedResponses);

    const submissionData = {
      userId,
      token: quizId,
      responses: formattedResponses,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      duration
    };

    if (isAutoSubmit) {
      await submitQuiz(submissionData);
    } else {
      const allQuestions = (quizData.pages_data || []).reduce((acc, page) => acc.concat(page.question_list || []), []);
      const answeredQuestions = Object.keys(responses).length;
      const unansweredQuestions = allQuestions.length - answeredQuestions;

      setConfirmationData({
        totalQuestions: allQuestions.length,
        answeredQuestions,
        unansweredQuestions,
        submissionData
      });
      setShowConfirmation(true);
    }
  };

  const submitQuiz = async (submissionData) => {
    try {
      // console.log('Submitting quiz data:', submissionData);
      await apiService.post('/api/submit-quiz', submissionData);
      console.log('Quiz submitted successfully');
      await apiService.put(`/api/update-user-quiz-status/${submissionData.userId}/${submissionData.token}`);
      // console.log('User quiz status updated');
      setShowSuccessPopup(true);
      localStorage.removeItem(`timeLeft_${token}_${user_id}`);
      localStorage.removeItem(`startTime_${token}_${user_id}`);
    } catch (error) {
      console.error('Error submitting quiz:', error.response ? error.response.data : error.message);
      setError('Error submitting quiz');
    }
  };

  const handleClosePopup = () => {
    // console.log('Closing success popup');
    setShowSuccessPopup(false);
    navigate(`/results/${token}/${user_id}`);
    //navigate("/intern_dash?quiz");
  };

  const checkQuizSchedule = () => {
    if (!quizData) return false;

    const now = new Date();
    const start = new Date(quizData.schedule_quiz_from);
    const end = new Date(quizData.schedule_quiz_to);

    // console.log('Checking quiz schedule:', { now, start, end });

    if (now < start) {
      console.log('Quiz not activated yet');
      alert('The quiz is not activated yet.');
      return false;
    } else if (now > end) {
      console.log('Quiz link expired');
      alert('The quiz link has expired.');
      return false;
    } else {
      console.log('Quiz is active');
      return true;
    }
  };

  const handlePageChange = (event, newPage) => {
    console.log('Page changed to:', newPage);
    setCurrentPage(newPage);
  };

  const numPages = Math.ceil((quizData?.pages_data || []).reduce((acc, page) => acc + (page.question_list?.length || 0), 0) / questionsPerPage);

  const getQuestionsForCurrentPage = () => {
    if (!quizData) return [];

    const allQuestions = (quizData.pages_data || []).reduce((acc, page) => acc.concat(page.question_list || []), []);
    const start = (currentPage - 1) * questionsPerPage;
    const end = start + questionsPerPage;
    const questions = allQuestions.slice(start, end);
    console.log('Questions for current page:', questions);
    return questions;
  };

  if (error) return <div className="Attempt_error">Error: {error}</div>;
  if (!quizData) return <div className="Attempt_loading">Loading...</div>;

  const questionsForCurrentPage = getQuestionsForCurrentPage();

  return (
    <div className="Attempt_container">
      <h2 className="Attempt_heading">Quiz Attempt</h2>
      <div className="Attempt_timeLeft">Time Left: {formatTime(timeLeft)}</div>
      {questionsForCurrentPage.length > 0 ? (
        <div className="Attempt_questionPreview">
          {questionsForCurrentPage.map((question, index) => (
            <div key={index} className="Attempt_questionContainer">
              <p className="Attempt_questionHeader">Question {index + 1 + (currentPage - 1) * questionsPerPage}</p>
              <p className="Attempt_questionText" dangerouslySetInnerHTML={{ __html: question.question_text }}></p>
              {question.options_list && Array.isArray(question.options_list) ? (
                question.options_list.map((option, optionIndex) => (
                  <div key={optionIndex} className="Attempt_option">
                    <label>
                      <input
                        type="radio"
                        name={`question-${index + 1}`}
                        value={option}
                        checked={responses[question.question_text] === option}
                        onChange={(e) => handleInputChange(question.question_text, e.target.value)}
                      />
                      {option}
                    </label>
                  </div>
                ))
              ) : (
                <p>No options available for this question.</p>
              )}
            </div>
          ))}
          <div
            className="Attempt_paginationControls"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '20px'
            }}
          >
            <Pagination
              count={numPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </div>

          <button className="Attempt_button Attempt_submitButton" onClick={() => handleSubmit(false)}>
            Submit Quiz
          </button>
        </div>
      ) : (
        <p>No questions available for this page.</p>
      )}
      {showSuccessPopup && <SuccessPopup message="Quiz submitted successfully!" onClose={handleClosePopup} />}
      <Dialog
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Quiz Submission"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {confirmationData && (
              <>
                <p>Total Questions: {confirmationData.totalQuestions}</p>
                <p>Answered Questions: {confirmationData.answeredQuestions}</p>
                <p>Unanswered Questions: {confirmationData.unansweredQuestions}</p>
                <p>Are you sure you want to submit the quiz?</p>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmation(false)}>Cancel</Button>
          <Button onClick={() => {
            setShowConfirmation(false);
            submitQuiz(confirmationData.submissionData);
          }} autoFocus>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default QuizAttempt;
