import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./Grading.css";
import apiService from '../../../../../../apiService';

function Grading() {
    const [grades, setGrades] = useState([
        { grade: '', minimum: '', maximum: '' }
    ]);

    useEffect(() => {
        apiService.get('/api/grades')
            .then(response => {
                setGrades(response.data);
            })
            .catch(error => {
                console.error('Error fetching grades:', error);
            });
    }, []);

    const handleChange = (index, field, value) => {
        const newGrades = [...grades];
        newGrades[index][field] = value;
        setGrades(newGrades);
    };

    return (
        <div className='bg_1'>
            <div className='bg'>
                <form>
                    <table className='Grading_table'>
                        <thead className='Grading_Header'>
                            <tr className='Grading_tr'>
                                <th className="Grading_th1" style={{ textAlign: 'center' }}>Grade</th>
                                <th className="Grading_th" style={{ textAlign: 'center' }}>Minimum %</th>
                                <th className="Grading_th3" style={{ textAlign: 'center' }}>Maximum %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grades.map((grade, index) => (
                                <tr key={index} className='Grading_tr'>
                                    <td className='Grading_td'>
                                        <input 
                                            className='Grading_text_input'
                                            type='text'
                                            value={grade.grade}
                                            onChange={(e) => handleChange(index, 'grade', e.target.value)}
                                        />
                                    </td>
                                    <td className='Grading_td'>
                                        <input
                                        className='Grading_number_input'
                                            value={grade.minimum}
                                            onChange={(e) => handleChange(index, 'minimum', e.target.value)}
                                        />
                                    </td>
                                    <td className='Grading_td'>
                                        <input
                                        className='Grading_number_input'
                                            value={grade.maximum}
                                            onChange={(e) => handleChange(index, 'maximum', e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </form>
            </div>
        </div>
    );
}

export default Grading;
