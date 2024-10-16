import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  Modal,
  Checkbox,
  Radio,
  Tooltip,
  RadioGroup,
  DialogActions,
  FormControlLabel
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Add as AddIcon,
  Delete as DeleteIcon,
  LibraryBooks as QuizIcon,
  UploadFile as UploadIcon,
} from '@mui/icons-material';
import apiService from '../../../apiService';
import CloseIcon from '@mui/icons-material/Close';
import { v4 as uuidv4 } from 'uuid';
import CreateDash from './CreateDash';

const LMSDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [newCourseName, setNewCourseName] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [newSubTopicName, setNewSubTopicName] = useState('');
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [expandedSubTopic, setExpandedSubTopic] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState(null);
  const [files, setFiles] = useState(null); // For file upload
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizFor, setQuizFor] = useState({ type: '', name: '', token: '', course: '', topic: '', subtopic: '', enabled: false });
  const [isQuizEnabled, setIsQuizEnabled] = useState(false);
  const [quizStatuses, setQuizStatuses] = useState({});

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await apiService.get('/api/courses');
      console.log(response.data);
      const organizedCourses = organizeData(response.data);
      setCourses(organizedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleOpenQuizModal = (type, name, course, topic, subtopic, quiz) => {
    console.log('Opening quiz modal:', type, name, course, topic, subtopic, quiz);
    setQuizFor({
      type,
      name,
      token: quiz ? quiz.token : uuidv4(),
      course,
      topic,
      subtopic,
      enabled: quiz ? quiz.enable : false
    });
    setQuizModalOpen(true);
  };

  // const renderQuizStatus = (quiz, type, name, course, topic, subtopic) => {
  //   // Handle checkbox change to enable/disable the quiz
  //   const handleQuizStatusChange = (event) => {
  //     const newStatus = event.target.checked;
  
  //     // If quiz doesn't exist yet, open the modal to create a new quiz
  //     if (!quiz) {
  //       handleOpenQuizModal(type, name, course, topic, subtopic);
  //     } else {
  //       // Update quiz status (enable/disable)
  //       const updatedQuiz = { ...quiz, enable: newStatus };
  
  //       // Call an API to update the quiz status in the backend
  //       apiService
  //         .post('/api/update-quiz-status', {
  //           token: quiz.token,
  //           enable: newStatus
  //         })
  //         .then((response) => {
  //           console.log('Quiz status updated:', response.data);
  //           // Optionally update the state here to reflect the change in UI
  //         })
  //         .catch((error) => {
  //           console.error('Error updating quiz status:', error);
  //         });
  //     }
  //   };
  
  //   return (
  //     <FormControlLabel
  //       control={
  //         <Checkbox
  //           checked={quiz ? quiz.enable : false}
  //           onChange={handleQuizStatusChange}
  //         />
  //       }
  //       label={quiz ? "Quiz Enabled" : "Enable Quiz"}
  //     />
  //   );
  // };
  

  // const renderQuizStatus = (quiz, type, name, course, topic, subtopic) => {
  //   // Handle checkbox change to enable/disable the quiz
  //   const handleQuizStatusChange = (event) => {
  //     const newStatus = event.target.checked;
  
  //     if (!quiz) {
  //       // If quiz doesn't exist, open modal to create a new one
  //       handleOpenQuizModal(type, name, course, topic, subtopic);
  //     } else {
  //       // Update existing quiz status
  //       const updatedQuiz = { ...quiz, enable: newStatus };
  
  //       // Call API to update quiz status in the backend
  //       apiService.post('/api/update-quiz-status', {
  //         token: quiz.token,
  //         enable: newStatus
  //       })
  //       .then((response) => {
  //         console.log('Quiz status updated:', response.data);
  //         // Update local state to reflect change
  //         // This part depends on how you're managing state in your component
  //         // You might need to update the 'courses' state here
  //       })
  //       .catch((error) => {
  //         console.error('Error updating quiz status:', error);
  //       });
  //     }
  //   };
  
  //   return (
  //     <FormControlLabel
  //       control={
  //         <Checkbox
  //           checked={quiz ? quiz.enable : false}
  //           onChange={handleQuizStatusChange}
  //         />
  //       }
  //       label={quiz ? "Quiz Enabled" : "Enable Quiz"}
  //     />
  //   );
  // };

  // const handleOpenQuizModal = (type, name, course, topic, subtopic) => {
  //   console.log('Opening quiz modal:', type, name, course, topic, subtopic);
  //   const token = uuidv4();
  //   let quizId, enabled;

  //   switch (type) {
  //     case 'course':
  //       quizId = `${course}-course`;
  //       enabled = quizStatuses[quizId] || false;
  //       break;
  //     case 'topic':
  //       quizId = `${course}-${topic}-topic`;
  //       enabled = quizStatuses[quizId] || false;
  //       break;
  //     case 'subtopic':
  //       quizId = `${course}-${topic}-${subtopic}-subtopic`;
  //       enabled = quizStatuses[quizId] || false;
  //       break;
  //     default:
  //       console.error('Unknown quiz type:', type);
  //       return;
  //   }

  //   setQuizFor({
  //     type,
  //     name,
  //     token,
  //     course,
  //     topic,
  //     subtopic,
  //     enabled
  //   });
  //   setQuizModalOpen(true);
  // };
  const handleCloseQuizModal = () => {
    setQuizModalOpen(false);
    setQuizFor({ type: '', name: '', token: '', course: '', topic: '', subtopic: '', enabled: false });
  };

  const handleQuizStatusChange = (type, course, topic, subtopic) => (event) => {
    const newStatus = event.target.checked;
    let quizId;

    switch (type) {
      case 'course':
        quizId = `${course}-course`;
        break;
      case 'topic':
        quizId = `${course}-${topic}-topic`;
        break;
      case 'subtopic':
        quizId = `${course}-${topic}-${subtopic}-subtopic`;
        break;
      default:
        console.error('Unknown quiz type:', type);
        return;
    }

    setQuizStatuses(prevStatuses => ({
      ...prevStatuses,
      [quizId]: newStatus
    }));
  };


  const organizeData = (data) => {
    const organized = {};
    data.forEach((item) => {
      if (!organized[item.CourseName]) {
        organized[item.CourseName] = { topics: {}, quiz: item.Quiz };
      }
      if (item.Topic) {
        if (!organized[item.CourseName].topics[item.Topic]) {
          organized[item.CourseName].topics[item.Topic] = { subTopics: {}, quiz: item.Quiz };
        }
        if (item.SubTopic) {
          organized[item.CourseName].topics[item.Topic].subTopics[item.SubTopic] = {
            materials: item.Materials || [],
            quiz: item.Quiz
          };
        }
      }
    });
    console.log("organizeData :", organized);
    return organized;
  };
  const handleCreateCourse = async () => {
    if (!newCourseName.trim()) return;
    try {
      await apiService.post('/api/create_course', { courseName: newCourseName });
      setNewCourseName('');
      fetchCourses();
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  const handleAddTopic = async () => {
    if (!newTopicName.trim() || !selectedCourse) return;
    try {
      await apiService.post('/api/add_topic', {
        courseId: selectedCourse,
        topicName: newTopicName,
      });
      setNewTopicName('');
      fetchCourses();
    } catch (error) {
      console.error('Error adding topic:', error);
    }
  };

  const handleAddSubTopic = async () => {
    if (!newSubTopicName.trim() || !selectedCourse || !selectedTopic) return;
    try {
      await apiService.post('/api/add_subtopic', {
        courseId: selectedCourse,
        topicName: selectedTopic,
        subTopicName: newSubTopicName,
      });
      setNewSubTopicName('');
      fetchCourses();
    } catch (error) {
      console.error('Error adding subtopic:', error);
    }
  };

  const handleDeleteCourse = async (courseName) => {
    try {
      await apiService.delete(`/api/delete_course/${courseName}`);
      fetchCourses();
    } catch (error) {
      console.error(`Error deleting course:`, error);
    }
  };

  const handleDeleteTopic = async (courseName) => {
    try {
      await apiService.delete(`/api/delete_course/${courseName}`);
      fetchCourses();
    } catch (error) {
      console.error(`Error deleting course:`, error);
    }
  };

  const handleDeleteSubTopic = async (courseName) => {
    try {
      await apiService.delete(`/api/delete_course/${courseName}`);
      fetchCourses();
    } catch (error) {
      console.error(`Error deleting course:`, error);
    }
  };

  const handleFileUpload = async () => {
    if (!files || !selectedCourse || !selectedTopic || !selectedSubTopic) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file); // Append each file to FormData
    });

    try {
      const url = `/api/add_material/${selectedCourse}/${selectedTopic}/${selectedSubTopic}`;
      await apiService.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }, // Send multipart form data
      });

      setFiles(null); // Clear file input after successful upload
      fetchCourses(); // Refresh course data
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const handleOpenDialog = (type, course, topic, subTopic) => {
    setDialogType(type);
    setSelectedCourse(course);
    setSelectedTopic(topic);
    setSelectedSubTopic(subTopic);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setNewCourseName('');
    setNewTopicName('');
    setNewSubTopicName('');
  };

  const handleOpenModal = (material) => {
    setSelectedMaterial(material);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedMaterial(null);
  };


  const renderDialog = () => {
    let title, content;
    switch (dialogType) {
      case 'course':
        title = 'Add New Course';
        content = (
          <TextField
            autoFocus
            margin="dense"
            label="Course Name"
            fullWidth
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
          />
        );
        break;
      case 'topic':
        title = 'Add New Topic';
        content = (
          <TextField
            autoFocus
            margin="dense"
            label="Topic Name"
            fullWidth
            value={newTopicName}
            onChange={(e) => setNewTopicName(e.target.value)}
          />
        );
        break;
      case 'subtopic':
        title = 'Add New Subtopic';
        content = (
          <TextField
            autoFocus
            margin="dense"
            label="Subtopic Name"
            fullWidth
            value={newSubTopicName}
            onChange={(e) => setNewSubTopicName(e.target.value)}
          />
        );
        break;
      case 'material':
        title = 'Upload Materials';
        content = (
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            style={{ marginTop: '16px' }}
          />
        );
        break;
      default:
        return null;
    }

    return (
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{content}</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={() => {
              switch (dialogType) {
                case 'course':
                  handleCreateCourse();
                  break;
                case 'topic':
                  handleAddTopic();
                  break;
                case 'subtopic':
                  handleAddSubTopic();
                  break;
                case 'material':
                  handleFileUpload();
                  break;
                default:
              }
              handleCloseDialog();
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <div style={{ padding: '20px' }}>

      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => handleOpenDialog('course')}
        style={{ marginBottom: '20px' }}
      >
        Add Course
      </Button>
      <Typography variant="h4" gutterBottom>
        Available Courses
      </Typography>
      <List style={{ fontSize: "12px" }}>
        {Object.entries(courses).map(([courseName, courseData]) => (
          <React.Fragment key={courseName}>
            <ListItem >
              <ListItemText primary={courseName} />
              {/* {renderQuizStatus(courseData.quiz, 'course', courseName, courseName, '', '')} */}
              <IconButton onClick={() => handleOpenQuizModal('course', courseName, courseName, '', '', courseData.quiz)} style={{ fontSize: "12px", alignItems: "center", gap: "2px" }}>
                <QuizIcon /> Course Quiz
              </IconButton>
              <IconButton onClick={() => handleOpenDialog('topic', courseName)} style={{ fontSize: "12px", alignItems: "center", gap: "2px" }}>
                <AddIcon /> Topic
              </IconButton>
              {/* <IconButton onClick={() => handleDeleteCourse(courseName)} style={{ fontSize: "12px", alignItems: "center", gap: "2px" }}>
                <DeleteIcon /> Course
              </IconButton> */}
              <IconButton onClick={() => setExpandedCourse(expandedCourse === courseName ? null : courseName)}>
                {expandedCourse === courseName ? <ExpandLess /> : <ExpandMore />}
              </IconButton>

            </ListItem>
            <Collapse in={expandedCourse === courseName} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>

                {Object.entries(courseData.topics).map(([topicName, topicData]) => (
                  <React.Fragment key={topicName}>
                    <ListItem style={{ paddingLeft: 50 }}>
                      <ListItemText primary={topicName} />
                      {/* {renderQuizStatus(topicData.quiz, 'topic', topicName, courseName, topicName, '')} */}
                      <IconButton onClick={() => handleOpenQuizModal('topic', topicName, courseName, topicName, '', topicData.quiz)} style={{ fontSize: "12px", alignItems: "center", gap: "2px" }}>
                        <QuizIcon /> Topic Quiz
                      </IconButton>
                      <IconButton onClick={() => handleOpenDialog('subtopic', courseName, topicName)} style={{ fontSize: "12px", alignItems: "center", gap: "2px" }}>
                        <AddIcon /> SubTopic
                      </IconButton>
                      {/* <IconButton onClick={() => handleDeleteTopic(topicName)} style={{ fontSize: "12px", alignItems: "center", gap: "2px" }}>
                        <DeleteIcon /> Topic
                      </IconButton> */}
                      <IconButton onClick={() => setExpandedTopic(expandedTopic === topicName ? null : topicName)}>
                        {expandedTopic === topicName ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </ListItem>
                    <Collapse in={expandedTopic === topicName} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {Object.entries(topicData.subTopics).map(([subTopicName, subTopicData]) => (
                          <React.Fragment key={subTopicName}>
                            <ListItem style={{ paddingLeft: 100 }}>
                              <ListItemText primary={subTopicName} />
                              {/* {renderQuizStatus(subTopicData.quiz, 'subtopic', subTopicName, courseName, topicName, subTopicName)} */}
                              <IconButton onClick={() => handleOpenQuizModal('subtopic', subTopicName, courseName, topicName, subTopicName, subTopicData.quiz)} style={{ fontSize: "12px", alignItems: "center", gap: "2px" }}>
                                <QuizIcon /> SubTopic Quiz
                              </IconButton>
                              <IconButton onClick={() => handleOpenDialog('material', courseName, topicName, subTopicName)} style={{ fontSize: "12px", alignItems: "center", gap: "2px" }}>
                                <UploadIcon /> Upload Material
                              </IconButton>
                              {/* <IconButton onClick={() => handleDeleteTopic(topicName)} style={{ fontSize: "12px", alignItems: "center", gap: "2px" }}>
                                <DeleteIcon /> Topic
                              </IconButton> */}
                              <IconButton onClick={() => setExpandedSubTopic(expandedSubTopic === subTopicName ? null : subTopicName)}>
                                {expandedSubTopic === subTopicName ? <ExpandLess /> : <ExpandMore />}
                              </IconButton>
                            </ListItem>
                            <Collapse in={expandedSubTopic === subTopicName} timeout="auto" unmountOnExit>
                              <List component="div" disablePadding>
                                {subTopicData.materials.map((material, index) => (
                                  <ListItem key={index} style={{ paddingLeft: 130 }}>
                                    <div>
                                      <Typography variant="body2">
                                        <Button
                                          variant="text"
                                          onClick={() => handleOpenModal(material)}
                                          style={{ textDecoration: 'none', color: '#1976d2', flexGrow: 1 }}
                                        >
                                          {material.name}
                                        </Button>
                                        <Modal
                                          open={modalOpen}
                                          onClose={handleCloseModal}
                                          aria-labelledby="modal-title"
                                          aria-describedby="modal-description"
                                        >
                                          <div
                                            style={{
                                              display: 'flex',
                                              flexDirection: 'column',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              position: 'fixed',
                                              top: 0,
                                              left: 0,
                                              right: 0,
                                              bottom: 0,
                                              backgroundColor: 'rgba(0, 0, 0, 0.7)', // semi-transparent background
                                              padding: '20px',
                                              overflowY: 'auto',
                                            }}
                                          >
                                            <div
                                              style={{
                                                backgroundColor: 'white',
                                                borderRadius: '8px',
                                                width: '98%',
                                                // maxWidth: '800px', // maximum width for large screens
                                                height: '98%', // height of the modal
                                                display: 'flex',
                                                flexDirection: 'column',
                                                position: 'relative', // To position the close button correctly
                                              }}
                                            >
                                              <IconButton
                                                onClick={handleCloseModal}
                                                style={{
                                                  position: 'absolute',
                                                  top: '10px',
                                                  right: '10px',
                                                }}
                                              >
                                                <CloseIcon />
                                              </IconButton>

                                              <Typography id="modal-title" variant="h6" component="h2" sx={{ padding: '10px' }}>
                                                {selectedMaterial?.name?.split('.').slice(0, -1) || selectedMaterial?.name}
                                              </Typography>
                                              <Typography id="modal-description" sx={{ mt: 2, flexGrow: 1 }}>
                                                <iframe
                                                  src={`http://localhost:5000${selectedMaterial?.url}`}
                                                  // src={`https://ramanasoftwebsite-production.up.railway.app${selectedMaterial?.url}`}

                                                  style={{ width: '100%', height: '100%', border: 'none' }}
                                                  title={selectedMaterial?.name}
                                                  // sandbox="allow-scripts allow-popups allow-same-origin"
                                                  onContextMenu={(e) => e.preventDefault()}
                                                />
                                              </Typography>
                                            </div>
                                          </div>
                                        </Modal>
                                      </Typography>
                                    </div>
                                  </ListItem>
                                ))}
                              </List>

                            </Collapse>
                          </React.Fragment>
                        ))}

                      </List>
                    </Collapse>
                  </React.Fragment>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
      {renderDialog()}
      {/* <Modal
        open={quizModalOpen}
        onClose={handleCloseQuizModal}
        aria-labelledby="quiz-modal-title"
        aria-describedby="quiz-modal-description"
      >
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          height: '90%',
          backgroundColor: 'white',
          boxShadow: 24,
          p: 4,
          overflow: 'auto'
        }}>
          <IconButton
            onClick={handleCloseQuizModal}
            style={{
              backgroundColor: "white",
              color: "black",
              position: 'absolute',
              top: '10px',
              right: '10px',
            }}
          >
            <CloseIcon />
          </IconButton>
          <div style={{ display: "flex", backgroundColor: "#1cbfff", paddingLeft: "50px", gap: "10px", alignItems: "center" }}>
            <Typography id="quiz-modal-title" style={{ fontWeight: "bold" }}>
              {quizFor.name}
            </Typography>
            <Typography id="quiz-modal-title">
              ({quizFor.token})
            </Typography>
            <Typography id="quiz-modal-title">
              ({quizFor.enabled})
            </Typography>
            <Typography id="quiz-modal-title">
              ({quizFor.course})
            </Typography>
            <Typography id="quiz-modal-title">
              ({quizFor.subtopic})
            </Typography>
          </div>
          <CreateDash token={quizFor.token} enabled={quizFor.enabled} subTopic={quizFor.subtopic} course={quizFor.course} topic={quizFor.topic} />
        </div>
      </Modal> */}
      <Modal
        open={quizModalOpen}
        onClose={handleCloseQuizModal}
        aria-labelledby="quiz-modal-title"
        aria-describedby="quiz-modal-description"
      >
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          height: '90%',
          backgroundColor: 'white',
          boxShadow: 24,
          p: 4,
          overflow: 'auto'
        }}>
          <IconButton
            onClick={handleCloseQuizModal}
            style={{
              backgroundColor: "white",
              color: "black",
              position: 'absolute',
              top: '10px',
              right: '10px',
            }}
          >
            <CloseIcon />
          </IconButton>
          <div style={{ display: "flex", backgroundColor: "#1cbfff", paddingLeft: "50px", gap: "10px", alignItems: "center" }}>
            <Typography id="quiz-modal-title" style={{ fontWeight: "bold" }}>
              {quizFor.name} ({quizFor.type})
            </Typography>
            <Typography id="quiz-modal-title">
              Token: {quizFor.token}
            </Typography>
            {/* <Typography id="quiz-modal-title">
              Enabled: {quizFor.enabled ? 'Yes' : 'No'}
            </Typography> */}
          </div>
          <CreateDash token={quizFor.token} subTopic={quizFor.subtopic} course={quizFor.course} topic={quizFor.topic} />
        </div>
      </Modal>
    </div>
  );
};

export default LMSDashboard;
