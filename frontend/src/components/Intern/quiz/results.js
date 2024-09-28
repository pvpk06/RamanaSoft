import React, { useState, useEffect } from 'react';
import apiService from '../../../apiService';
import { useParams } from 'react-router-dom';
import Certificate from './quiz/QuizCreate/Configure/Certificate';
import './results.css';

const QuizResults = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { quizToken, userId } = useParams();

  useEffect(() => {
    const fetchResults = async () => {
      if (!quizToken || !userId) {
        setError('Missing quizToken or userId');
        setLoading(false);
        return;
      }

      try {
        const response = await apiService.get(`/api/calculate-results/${quizToken}/${userId}`);
        setResults(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Error fetching results');
        setLoading(false);
      }
    };

    fetchResults();
  }, [quizToken, userId]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="results_container">
      <h2 className="results_header">Quiz Results</h2>
      {results ? (
        <div className="results">
          <p className="results_text"><strong>Score:</strong> {results.score}</p>
          <p className="results_text"><strong>Grade:</strong> {results.grade}</p>
          <div className="results_certificate">
            <Certificate certificateId={userId} />
          </div>
        </div>
      ) : (
        <p className="results_text">No results available</p>
      )}
    </div>
  );
};

export default QuizResults;
