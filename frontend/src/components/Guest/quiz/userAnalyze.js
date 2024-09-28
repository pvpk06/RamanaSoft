import React, { useState, useEffect } from 'react';
import apiService from '../../../apiService';
import { useParams } from 'react-router-dom';
import './useranalysis.css';

const UserQuizAnalysis = () => {
    const { userId, quizToken } = useParams();
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const response = await apiService.get(`/api/quiz-analysis/${userId}/${quizToken}`);
                console.log('API Response:', response.data);

                const { responses, start_time, end_time, duration, score, grade } = response.data;

                setAnalysis({ responses, startTime: new Date(start_time), endTime: new Date(end_time), duration, score, grade });
                setLoading(false);
            } catch (err) {
                console.error('Error fetching quiz analysis:', err);
                setError('Error fetching quiz analysis');
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, [userId, quizToken]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    if (!analysis || !Array.isArray(analysis.responses)) {
        return <div>No data available</div>;
    }

    const { responses, startTime, endTime, duration, score, grade } = analysis;
    const totalQuestions = responses.length;
    const correctAnswers = responses.filter(r => r.is_correct).length;
    const calculatedScore = (correctAnswers / totalQuestions) * 100;

    return (
        <div className="analysis-container">
            <h2>Responses</h2>
            <div className="result-summary">
                <p>Date submitted: {endTime.toLocaleString()}</p>
                <p>Score: {score} ({grade})</p>
                <p>Duration: {duration}s</p>
            </div>
	    {/* <h3>Your Responses</h3>
            {responses.length === 0 && <p>No responses found</p>}
            {responses.map((response, index) => (
                <div key={index} className="question-container">
                    <div className="question-header">
                        <span className={response.is_correct ? "correct" : "incorrect"}>
                            {response.is_correct ? "✓" : "✗"}
                        </span>
                        <span>Points: {response.is_correct ? "1/1" : "0/1"}</span>
                    </div>
                    <div className="question-content">
                        <p dangerouslySetInnerHTML={{ __html: response.questionText || 'No question text' }}></p>
                        <div className={`option ${response.is_correct ? 'correct' : 'incorrect'}`}>
                            Your answer: {response.answer}
                        </div>
                    </div>
                </div>
            ))}  */}
        </div>
    );
};

export default UserQuizAnalysis;
