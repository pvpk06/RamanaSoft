import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '../../../../apiService';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button
} from '@mui/material';

const AnalyzeQuiz = () => {
  const { token } = useParams();
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const url = `/api/quiz-responses/${token}`;
        console.log("URL :", url);
        const response = await apiService.get(url);
        console.log ("responses:",response.data);
        setQuizData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response ? err.response.data.error : 'Error fetching quiz data');
        setLoading(false);
      }
    };
    fetchQuizData();
  }, [token]);

  const openModal = (response) => {
    setSelectedResponse(response);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedResponse(null);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      {quizData && quizData.responses && quizData.responses.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Domain</strong></TableCell>
                <TableCell><strong>Start Time</strong></TableCell>
                <TableCell><strong>End Time</strong></TableCell>
                <TableCell><strong>Duration(sec)</strong></TableCell>
                <TableCell><strong>Score</strong></TableCell>
                <TableCell><strong>Grade</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quizData.responses.map((data, index) => (
                <TableRow key={index}>
                  <TableCell>{data.user_name}</TableCell>
                  <TableCell>{data.user_email}</TableCell>
                  <TableCell>{data.domain}</TableCell>
                  <TableCell>{new Date(data.start_time).toLocaleString()}</TableCell>
                  <TableCell>{new Date(data.end_time).toLocaleString()}</TableCell>
                  <TableCell>{data.duration / 10}</TableCell>
                  <TableCell>{data.score}</TableCell>
                  <TableCell>{data.grade}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" onClick={() => openModal(data)}>
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <p>No responses available for this quiz</p>
      )}

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Quiz Details"
      >
        <div style={{ position: 'relative', padding: '20px' }}>
          <Button
            onClick={closeModal}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </Button>
          {selectedResponse ? (
            <div>
              <h2>Quiz Details</h2>
              <p><strong>Date submitted:</strong> {new Date(selectedResponse.start_time).toLocaleString()}</p>
              <p><strong>Score:</strong> {selectedResponse.score}</p>
              <p><strong>Duration:</strong> {selectedResponse.duration / 10} seconds</p>
              <hr />
              <div>
                <p><strong>Questions and Answers:</strong></p>
                {quizData && quizData.pages_data && quizData.pages_data.length > 0 ? (
                  quizData.pages_data.map((page, pageIndex) => (
                    page.question_list.map((question, questionIndex) => {
                      const userAnswer = selectedResponse.responses.find(response =>
                        response.questionText === question.question_text
                      )?.answer;

                      return (
                        <div key={`${pageIndex}-${questionIndex}`} style={{ marginBottom: '20px' }}>
                          <p><strong>Question {pageIndex * 10 + questionIndex + 1}:</strong> {question.question_text}</p>
                          <div style={{ marginLeft: '20px' }}>
                            {question.options_list.map((option, i) => {
                              const isCorrect = option === question.correct_answer;
                              const isUserAnswer = option === userAnswer;
                              const isIncorrectAnswer = isUserAnswer && !isCorrect;

                              return (
                                <p key={i} style={{
                                  color: isCorrect ? 'green' : (isIncorrectAnswer ? 'red' : 'black'),
                                  fontWeight: isCorrect || isUserAnswer ? 'bold' : 'normal',
                                  backgroundColor: isIncorrectAnswer ? '#ffe6e6' : (isCorrect ? '#e6ffe6' : 'transparent'),
                                  padding: '2px',
                                  borderRadius: '4px'
                                }}>
                                  {option}
                                </p>
                              );
                            })}
                          </div>
                          <hr />
                        </div>
                      );
                    })
                  ))
                ) : (
                  <p>No pages data available</p>
                )}
              </div>
            </div>
          ) : (
            <p>Loading response details...</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AnalyzeQuiz;
