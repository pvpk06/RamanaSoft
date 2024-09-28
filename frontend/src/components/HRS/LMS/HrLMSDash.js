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
  DialogActions,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Add as AddIcon,
  Delete as DeleteIcon,
  UploadFile as UploadIcon,
} from '@mui/icons-material';
import apiService from '../../../apiService';
import CloseIcon from '@mui/icons-material/Close';

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

  const organizeData = (data) => {
    const organized = {};
    data.forEach((item) => {
      if (!organized[item.CourseName]) {
        organized[item.CourseName] = { topics: {} };
      }
      if (item.Topic) {
        if (!organized[item.CourseName].topics[item.Topic]) {
          organized[item.CourseName].topics[item.Topic] = { subTopics: {} };
        }
        if (item.SubTopic) {
          organized[item.CourseName].topics[item.Topic].subTopics[item.SubTopic] = {
            materials: item.Materials || [], // Directly assign materials if they exist
          };
        }
      }
    });
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
      <Typography variant="h4" gutterBottom>
        Learning Management System
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => handleOpenDialog('course')}
        style={{ marginBottom: '20px' }}
      >
        Add Course
      </Button>
      <List>
        {Object.entries(courses).map(([courseName, courseData]) => (
          <React.Fragment key={courseName}>
            <ListItem>
              <ListItemText primary={courseName} />
              <IconButton onClick={() => setExpandedCourse(expandedCourse === courseName ? null : courseName)}>
                {expandedCourse === courseName ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
              <IconButton onClick={() => handleOpenDialog('topic', courseName)}>
                <AddIcon />
              </IconButton>
              <IconButton onClick={() => handleDeleteCourse(courseName)}>
                <DeleteIcon />
              </IconButton>
            </ListItem>
            <Collapse in={expandedCourse === courseName} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {Object.entries(courseData.topics).map(([topicName, topicData]) => (
                  <React.Fragment key={topicName}>
                    <ListItem style={{ paddingLeft: 32 }}>
                      <ListItemText primary={topicName} />
                      <IconButton onClick={() => setExpandedTopic(expandedTopic === topicName ? null : topicName)}>
                        {expandedTopic === topicName ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                      <IconButton onClick={() => handleOpenDialog('subtopic', courseName, topicName)}>
                        <AddIcon />
                      </IconButton>
                    </ListItem>
                    <Collapse in={expandedTopic === topicName} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {Object.entries(topicData.subTopics).map(([subTopicName, subTopicData]) => (
                          <React.Fragment key={subTopicName}>
                            <ListItem style={{ paddingLeft: 64 }}>
                              <ListItemText primary={subTopicName} />
                              <IconButton onClick={() => setExpandedSubTopic(expandedSubTopic === subTopicName ? null : subTopicName)}>
                                {expandedSubTopic === subTopicName ? <ExpandLess /> : <ExpandMore />}
                              </IconButton>
                              <IconButton onClick={() => handleOpenDialog('material', courseName, topicName, subTopicName)}>
                                <UploadIcon />
                              </IconButton>
                            </ListItem>
                            <Collapse in={expandedSubTopic === subTopicName} timeout="auto" unmountOnExit>
                              <List component="div" disablePadding>
                                {subTopicData.materials.map((material, index) => (
                                  <ListItem key={index} style={{ paddingLeft: 96 }}>
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
    </div>
  );
};

export default LMSDashboard;
