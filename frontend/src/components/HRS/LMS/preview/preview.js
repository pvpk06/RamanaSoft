import React, { useState, useEffect } from 'react';
import './preview.css';
import { useParams } from 'react-router-dom';
import apiService from '../../../../apiService';
import Pagination from '@mui/material/Pagination';

const PreviewQuiz = ({token}) => {
  const [quizData, setQuizData] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  // const currentPath = window.location.pathname;
  // const token = currentPath.split('/')[6];

  useEffect(() => {
    if (token) {
      apiService.get(`/api/get-lms-quiz/${token}`)
        .then(response => {
          const data = response.data;
          console.log('Received data:', data);
          if (data && data.pages_data) {
            try {
              // const parsedPages = JSON.parse(data.pages_data);
              const parsedPages = data.pages_data;
              setQuizData(parsedPages);
            } catch (error) {
              console.error('Error parsing pages_data:', error);
              throw new Error('Invalid quiz data structure');
            }
          } else {
            throw new Error('No pages_data available');
          }
        })
        .catch(error => {
          console.error('Error fetching quiz data:', error);
        });
    }
  }, [token]);

  const handlePageChange = (event, value) => {
    setCurrentPageIndex(value - 1); // MUI Pagination is 1-based index
  };

  if (quizData === null) {
    return <div>No Quiz data available to show</div>;
  }

  if (!Array.isArray(quizData) || quizData.length === 0) {
    return <div>No quiz data available</div>;
  }

  const currentPage = quizData[currentPageIndex];
  let questionNumber = 1;
  for (let i = 0; i < currentPageIndex; i++) {
    questionNumber += quizData[i].question_list.length;
  }

  return (
    <div className="preview-container">
      <div className="page-container">
        {currentPage.question_list.map((q, questionIndex) => (
          <div key={questionIndex} className="question-preview">
            <div className="question-header">Question {questionNumber + questionIndex}</div>
            <div className="question-text" dangerouslySetInnerHTML={{ __html: q.question_text }} />
            <div className="options-preview">
              {q.options_list.map((option, optionIndex) => (
                <div key={optionIndex} className="option">
                  <input
                    type="radio"
                    id={`question-${questionNumber + questionIndex}-option-${optionIndex}`}
                    name={`question-${questionNumber + questionIndex}`}
                  />
                  <label htmlFor={`question-${questionNumber + questionIndex}-option-${optionIndex}`}>{option}</label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div>
          <Pagination
            count={quizData.length}
            page={currentPageIndex + 1}
            onChange={handlePageChange}
            color="primary"
            style={{ display:"flex",marginTop: '20px',  textAlign:"center", justifyContent: 'center', marginBottom:"20px" }}
            shape="rounded"
          />
      </div>
    </div>
  );
};

export default PreviewQuiz;
