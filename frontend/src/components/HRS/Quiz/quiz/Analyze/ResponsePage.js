import React from 'react';
import './responsepage.css';

const ResponsePage = ({ pagesData, responses, submissionData }) => {
  console.log('ResponsePage props:', { pagesData, responses, submissionData });

  const renderQuestion = (question, userAnswer) => {
    const isCorrect = question.correct_answer === userAnswer.answer;
    return (
      <div className="question-block" key={question.question_id}>
        <div className="question-header">
          <div className={`status ${isCorrect ? 'correct' : 'incorrect'}`}>
            {isCorrect ? '✔' : '✖'}
          </div>
          <div dangerouslySetInnerHTML={{ __html: question.question_text }} />
        </div>
        <ul className="options">
          {question.options_list.map((option, index) => (
            <li key={index} className={option === question.correct_answer ? 'correct-answer' : ''}>
              <input
                type="checkbox"
                checked={option === userAnswer.answer}
                readOnly
              />
              {option}
            </li>
          ))}
        </ul>
        <div className={`points ${isCorrect ? 'correct' : 'incorrect'}`}>
          Points: {isCorrect ? '1/1' : '0/1'}
        </div>
      </div>
    );
  };

  const getUserAnswer = (questionText) => {
    return responses.find(response => response.questionText === questionText) || {};
  };

  return (
    <div className="response-container">
      <div className="response-header">
        <div>Date submitted: {submissionData.dateSubmitted || 'N/A'}</div>
        <div>Score: {submissionData.score || 'N/A'}</div>
        <div>Duration: {submissionData.duration || 'N/A'}</div>
        <div>
          <button>Send Email</button>
          <button>PDF</button>
        </div>
      </div>
      <div className="response-summary">
        <h3>QUIZ ON {submissionData.quizTitle || 'N/A'}</h3>
        <p>{submissionData.quizDescription || 'N/A'}</p>
      </div>
      {pagesData.length > 0 ? (
        pagesData.map((page) => 
          page.question_list.map((question) => (
            renderQuestion(question, getUserAnswer(question.question_text))
          ))
        )
      ) : (
        <p>No questions available.</p>
      )}
      <button className="ok-button">OK</button>
    </div>
  );
};

export default ResponsePage;
