import React, { useState, useEffect } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import BulkUpload from './import/Import';
import {Button} from '@mui/material';
import { FaTrashAlt, FaRegSave } from 'react-icons/fa';
import './create.css';
import Notification from './notification'
import apiService from '../../../../apiService';
const CreationPage = ({enabled, token, course, topic, subTopic}) => {
  console.log(token);
  console.log(enabled);
  console.log(course);
  console.log(topic);
  console.log(subTopic);
  
  const [pages, setPages] = useState([]);
  const [showDropdown, setShowDropdown] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await apiService.get(`/api/get-lms-quiz/${token}`);
        const data = response.data;
        console.log("response, ", data)
        if (response.status === 200) {
          console.log('Fetched data:', data);
          
          const formattedPages = data.pages_data;
          console.log('Formatted pages:', formattedPages);
  
          const transformedPages = formattedPages.map(page => page.question_list || []);
          
          setPages(transformedPages);
        } else {
          console.error('Error fetching quiz data:', data);
          setNotification({ message: 'Failed to fetch quiz data', type: 'error' });
        }
      } catch (error) {
        console.error('Error fetching quiz data:', error);
      }
    };
  
    fetchQuizData();
  }, [token]);
    

  useEffect(() => {
    console.log('Pages state updated:', pages);
  }, [pages]);

  const handleBulkUpload = (bulkData) => {
    console.log('Bulk data received:', bulkData);

    const questionsPerPage = 10;
    const newPages = [...pages];

    bulkData.pages_data.forEach(page => {
      if (page.question_list) {
        const questions = page.question_list;
        for (let i = 0; i < questions.length; i += questionsPerPage) {
          const chunk = questions.slice(i, i + questionsPerPage);
          if (currentPageIndex >= newPages.length) {
            newPages.push([]);
          }
          newPages[currentPageIndex] = [
            ...(newPages[currentPageIndex] || []),
            ...chunk
          ];
          if (chunk.length === questionsPerPage) {
            setCurrentPageIndex(currentPageIndex + 1);
          }
        }
      }
    });
    console.log('Updated pages before setting state:', newPages);
    setPages(newPages);
    console.log('Pages state updated:', newPages);
    setNotification({ message: 'Bulk upload successful', type: 'success' });
  };

  const addQuestion = (pageIndex) => {
    const newPages = [...pages];
    newPages[pageIndex] = [...(newPages[pageIndex] || []), { question_id: null, question_text: '', options_list: ['', ''], correct_answer: '' }];
    setPages(newPages);
    setNotification({ message: 'Question added successfully', type: 'success' });
  };

  const deleteQuestion = (pageIndex, questionIndex) => {
    const newPages = [...pages];
    newPages[pageIndex] = [...(newPages[pageIndex] || [])];
    newPages[pageIndex].splice(questionIndex, 1);
    setPages(newPages);
    setNotification({ message: 'Question deleted successfully', type: 'success' });
  };

  const addOption = (pageIndex, questionIndex) => {
    const newPages = [...pages];
    newPages[pageIndex] = [...(newPages[pageIndex] || [])];
    newPages[pageIndex][questionIndex] = {
      ...newPages[pageIndex][questionIndex],
      options_list: [...(newPages[pageIndex][questionIndex].options_list || []), '']
    };
    setPages(newPages);
    setNotification({ message: 'Option added successfully', type: 'success' });
  };

  const deleteOption = (pageIndex, questionIndex, optionIndex) => {
    const newPages = [...pages];
    newPages[pageIndex] = [...(newPages[pageIndex] || [])];
    newPages[pageIndex][questionIndex] = {
      ...newPages[pageIndex][questionIndex],
      options_list: [...(newPages[pageIndex][questionIndex].options_list || [])]
    };
    newPages[pageIndex][questionIndex].options_list.splice(optionIndex, 1);
    setPages(newPages);
    setNotification({ message: 'Option deleted successfully', type: 'success' });
  };

  const handleQuestionChange = (pageIndex, questionIndex, data) => {
    const newPages = [...pages];
    newPages[pageIndex] = [...(newPages[pageIndex] || [])];
    newPages[pageIndex][questionIndex] = {
      ...newPages[pageIndex][questionIndex],
      question_text: data
    };
    setPages(newPages);
  };

  const handleOptionChange = (pageIndex, questionIndex, optionIndex, value) => {
    const newPages = [...pages];
    newPages[pageIndex] = [...(newPages[pageIndex] || [])];
    newPages[pageIndex][questionIndex] = {
      ...newPages[pageIndex][questionIndex],
      options_list: [...(newPages[pageIndex][questionIndex].options_list || [])]
    };
    newPages[pageIndex][questionIndex].options_list[optionIndex] = value;
    setPages(newPages);
  };

  const handleCorrectChange = (pageIndex, questionIndex, value) => {
    const newPages = [...pages];
    newPages[pageIndex] = [...(newPages[pageIndex] || [])];
    newPages[pageIndex][questionIndex] = {
      ...newPages[pageIndex][questionIndex],
      correct_answer: value
    };
    setPages(newPages);
  };

  const toggleDropdown = (pageIndex) => {
    setShowDropdown(showDropdown === pageIndex ? null : pageIndex);
    setCurrentPageIndex(pageIndex);
  };

  const saveQuestions = () => {
    // Format the pages data
    const formattedPages = pages.map((page) => ({
        question_list: page
    }));
    console.log("formattedPages", formattedPages);

    // Construct the data object with the required fields
    const data = {
        token: token,
        enable: enabled, // Assuming this is already managed in the state/props
        pages_data: JSON.stringify(formattedPages),
        CourseName: course, // Assuming CourseName is available as course
        Topic: topic, // Assuming Topic is available as topic
        SubTopic: subTopic // Assuming SubTopic is available as subTopic
    };
    
    console.log("data", data);

    // Send the POST request
    apiService.post('/api/save-lms-questions', data)
        .then(response => {
            console.log('Response:', response.data);
            setNotification({ message: 'Questions saved successfully!', type: 'success' });
        })
        .catch(error => {
            console.error('Error:', error);
            setNotification({ message: 'Failed to save questions. Please try again.', type: 'error' });
        });
};


  const addPage = () => {
    setPages([...pages, []]);
    setNotification({ message: 'New page added successfully', type: 'success' });
  };

  const deletePage = (pageIndex) => {
    const newPages = [...pages];
    newPages.splice(pageIndex, 1);
    setPages(newPages);
    setNotification({ message: 'Page deleted successfully', type: 'success' });
  };

  const closeNotification = () => {
    setNotification({ message: '', type: '' });
  };

  return (
    <div className="Create_container">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={closeNotification}
      />
      <div className="Create_pages-container">
        {Array.isArray(pages) && pages.length > 0 ? (
          pages.map((page, pageIndex) => (
            <div key={pageIndex} className="Create_page-container">
              <div className="Create_page-header">
                <div className="Create_page-title">Page {pageIndex + 1}</div>
                <div className="Create_page-actions">
                  <span className="Create_page-action" onClick={() => deletePage(pageIndex)}><FaTrashAlt /></span>
                </div>
              </div>
              <div className="Create_add-item-container">
                <button className="Create_add-item" onClick={() => toggleDropdown(pageIndex)}>
                  Add item
                </button>
                {showDropdown === pageIndex && (
                  <div className="Create_dropdown">
                    <button onClick={() => { addQuestion(pageIndex); toggleDropdown(null); }}>Add Question</button>
                    <BulkUpload onBulkUpload={handleBulkUpload} />
                  </div>
                )}
              </div>
              {Array.isArray(page) && page.length > 0 ? (
                page.map((q, questionIndex) => (
                  <div key={questionIndex} className="Create_question-container">
                    <div className="Create_editor">
                      <CKEditor
                        editor={ClassicEditor}
                        data={q.question_text || ''}
                        onChange={(event, editor) => handleQuestionChange(pageIndex, questionIndex, editor.getData())}
                      />
                    </div>
                    <div className="Create_option-container">
                      <h5>Options</h5>
                      {Array.isArray(q.options_list) && q.options_list.length > 0 ? (
                        q.options_list.map((option, optionIndex) => (
                          <div key={optionIndex} className="Create_option">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(pageIndex, questionIndex, optionIndex, e.target.value)}
                            />
                            <button onClick={() => deleteOption(pageIndex, questionIndex, optionIndex)}><FaTrashAlt /></button>
                          </div>
                        ))
                      ) : (
                        <p>No options available</p>
                      )}
                      <button onClick={() => addOption(pageIndex, questionIndex)}>Add Option</button>
                      <div>
                        <label>Correct Answer:</label>
                        <select
                          value={q.correct_answer || ''}
                          onChange={(e) => handleCorrectChange(pageIndex, questionIndex, e.target.value)}
                        >
                          <option value="">Select</option>
                          {q.options_list.map((option, optionIndex) => (
                            <option key={optionIndex} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button onClick={() => deleteQuestion(pageIndex, questionIndex)}><FaTrashAlt /></button>
                  </div>
                ))
              ) : (
                <p>No questions available</p>
              )}
            </div>
          ))
        ) : (
          <p>No pages available</p>
        )}
        <Button 
                sx={{
                  backgroundColor: '#2196F3', 
                  color: 'white', 
                  borderRadius: '4px',
                  margin: '5px',
                  fontSize: '14px',
                  textTransform: 'none',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                  '&:hover': {
                    backgroundColor: '#2196F3',
                    color:'black'
                  }
                }}
                 onClick={addPage}>Add Page</Button>
        <button className="Create_add-item" onClick={saveQuestions}><FaRegSave /> Save</button>
      </div>
    </div>
  );
};

export default CreationPage;