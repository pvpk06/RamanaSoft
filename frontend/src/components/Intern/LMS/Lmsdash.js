import React, { useState, useEffect } from 'react';
import {
  Button,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogActions,
  FormControl,
  FormControlLabel,
  DialogContent,
  Radio,
  RadioGroup,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { Container } from 'react-bootstrap';
import Cookies from 'js-cookie';
import apiService from '../../../apiService';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';


const TopicCard = ({ topic, onViewLessons, onTakeCourse, isLocked }) => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
    <CardContent sx={{ flexGrow: 1 }}>
      <Typography variant="h5" component="div" gutterBottom>
        {topic.name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {topic.description}
      </Typography>
      {/* Display the lock icon inside the card */}
      {isLocked ? (
        <LockIcon color="disabled" sx={{ position: 'absolute', top: '16px', right: '16px' }} />
      ) : (
        <LockOpenIcon color="success" sx={{ position: 'absolute', top: '16px', right: '16px' }} />
      )}
      {/* <Button color="primary" onClick={onViewLessons} sx={{ mt: 2 }}>
        View Lessons
      </Button> */}
    </CardContent>
    <Button
      variant="contained"
      color="primary"
      onClick={onTakeCourse}
      disabled={isLocked} // Disable button if the topic is locked
      sx={{ m: 2 }}
    >
      Take Course
    </Button>
  </Card>
);

const LessonDialog = ({ open, onClose, lessons }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogContent>
      <List>
        {lessons.map((lesson, index) => (
          <ListItem key={index}>
            <ListItemText primary={lesson.name} />
          </ListItem>
        ))}
      </List>
    </DialogContent>
  </Dialog>
);

const LMS_dash = () => {
  const internID = Cookies.get('internID');
  const [courses, setCourses] = useState({});
  const [courseStatus, setCourseStatus] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [iframeUrl, setIframeUrl] = useState('');
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('overview');
  const [openSubTopics, setOpenSubTopics] = useState({});
  const [quizOpen, setQuizOpen] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizResponses, setQuizResponses] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  useEffect(() => {
    if (internID) {
      fetchCoursesForIntern();
    }
  }, [internID]);

  const fetchCoursesForIntern = async () => {
    try {
      const response = await apiService.get(`/api/intern-courses/${internID}`);
      console.log("Data :", response.data);
      const organizedCourses = organizeData(response.data);
      setCourses(organizedCourses);
      fetchProgressForIntern(organizedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const organizeData = (data) => {
    console.log(data);
    const organized = {};
    data.forEach((item) => {
      // Initialize the course if not already created
      if (!organized[item.CourseName]) {
        organized[item.CourseName] = { topics: {}, quiz: item.Quiz || null };
      }

      // Initialize the topic if it exists and not already created
      if (item.Topic) {
        if (!organized[item.CourseName].topics[item.Topic]) {
          organized[item.CourseName].topics[item.Topic] = { subTopics: {}, quiz: item.Quiz || null };
        }

        // Initialize the subtopic if it exists and not already created
        if (item.SubTopic) {
          if (!organized[item.CourseName].topics[item.Topic].subTopics[item.SubTopic]) {
            organized[item.CourseName].topics[item.Topic].subTopics[item.SubTopic] = {
              materials: item.Materials || [],
              quiz: item.Quiz || null,
            };
          }
        }
      }
    });
    console.log("organized :", organized);
    return organized;
  };

  const fetchProgressForIntern = async (fetchedCourses) => {
    try {
      const response = await apiService.get(`/api/intern-progress/${internID}`);
      console.log(response.data);
      const progress = response.data.course_status || {};
      console.log("progress", progress);
      console.log(Object.keys(progress).length);
      // If intern progress is null or empty, unlock the first material
      if (Object.keys(progress).length === 0) {
        // Get the first course, topic, and subtopic
        const firstCourse = Object.keys(fetchedCourses)[0];
        console.log("firstCourse :", firstCourse);
        const firstTopic = Object.keys(fetchedCourses[firstCourse]?.topics || {})[0];
        console.log("firstTopic :", firstTopic);
        const firstSubTopic = Object.keys(fetchedCourses[firstCourse]?.topics[firstTopic]?.subTopics || {})[0];
        console.log("firstSubTopic :", firstSubTopic);
        const firstMaterial = fetchedCourses[firstCourse]?.topics[firstTopic]?.subTopics[firstSubTopic]?.materials[0];
        console.log("firstMaterial :", firstMaterial);
        if (firstMaterial) {
          // Set state to unlock the first material
          const initialCourseStatus = {
            [firstCourse]: {
              status: true,
              topics: {
                [firstTopic]: {
                  status: true,
                  subTopics: {
                    [firstSubTopic]: {
                      status: true,
                      materials: {
                        [firstMaterial.materialID]: true,
                      },
                    },
                  },
                },
              },
            },
          };

          setCourseStatus(initialCourseStatus);
          setSelectedCourse(firstCourse);
          setSelectedTopic(firstTopic);
          setSelectedSubTopic(firstSubTopic);
          setSelectedMaterial(firstMaterial);
          // setIframeUrl(`http://localhost:5000${firstMaterial.url}`);
          setIframeUrl(`http://194.238.17.64:5000${firstMaterial.url}`);

          // setIframeUrl(`https://ramanasoftwebsite-production.up.railway.app${firstMaterial.url}`);

        }
      } else {
        setCourseStatus(progress);
      }
    } catch (error) {
      console.error('Error fetching course progress:', error);
    }
  };



  // const handleCompleteMaterial = async () => {
  //   const updatedCourseStatus = {
  //     ...courseStatus,
  //     [selectedCourse]: {
  //       ...courseStatus[selectedCourse],
  //       status: true,
  //       topics: {
  //         ...courseStatus[selectedCourse]?.topics,
  //         [selectedTopic]: {
  //           ...courseStatus[selectedCourse]?.topics?.[selectedTopic],
  //           status: true,
  //           subTopics: {
  //             ...courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics,
  //             [selectedSubTopic]: {
  //               ...courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic],
  //               status: true,
  //               materials: {
  //                 ...courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic]?.materials,
  //                 [selectedMaterial.materialID]: true,
  //               },
  //               quizCompleted: true, // Mark the quiz as completed for the subtopic
  //             },
  //           },
  //         },
  //       },
  //     },
  //   };

  //   setCourseStatus(updatedCourseStatus);

  //   try {
  //     await apiService.post('/api/update-progress', {
  //       internID,
  //       progress: updatedCourseStatus,
  //     });
  //     console.log("Progress updated successfully.");
  //     moveToNextMaterial(); // Move to the next material
  //     moveToNextTopic(); // Optionally move to the next topic based on your logic
  //   } catch (error) {
  //     console.error('Error updating progress:', error);
  //   }
  // };


  // const fetchProgressForIntern = async (fetchedCourses) => {
  //   try {
  //     const response = await apiService.get(`/api/intern-progress/${internID}`);
  //     console.log(response.data);
  //     const progress = response.data.course_status || {};
  //     console.log("progress", progress);
      
  //     // If intern progress is null or empty, unlock the first material
  //     if (Object.keys(progress).length === 0) {
  //       // ... (existing code for unlocking first material)
  //     } else {
  //       // Process the existing progress data
  //       const updatedProgress = {};
        
  //       Object.entries(progress).forEach(([courseName, courseData]) => {
  //         updatedProgress[courseName] = { ...courseData };
          
  //         Object.entries(courseData.topics || {}).forEach(([topicName, topicData]) => {
  //           Object.entries(topicData.subTopics || {}).forEach(([subTopicName, subTopicData]) => {
  //             // Check if all materials in the subtopic are completed
  //             const allMaterialsCompleted = Object.values(subTopicData.materials || {}).every(status => status === true);
              
  //             // If all materials are completed, mark the subtopic as unlocked
  //             if (allMaterialsCompleted) {
  //               if (!updatedProgress[courseName].topics[topicName].subTopics[subTopicName]) {
  //                 updatedProgress[courseName].topics[topicName].subTopics[subTopicName] = {};
  //               }
  //               updatedProgress[courseName].topics[topicName].subTopics[subTopicName].status = true;
  //             }
  //           });
  //         });
  //       });
  //       console.log("updatedProgress :", updatedProgress);
  //       setCourseStatus(updatedProgress);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching course progress:', error);
  //   }
  // };

  const handleCompleteMaterial = async () => {
    const updatedCourseStatus = {
      ...courseStatus,
      [selectedCourse]: {
        ...courseStatus[selectedCourse],
        status: true,
        topics: {
          ...courseStatus[selectedCourse]?.topics,
          [selectedTopic]: {
            ...courseStatus[selectedCourse]?.topics?.[selectedTopic],
            status: true,
            subTopics: {
              ...courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics,
              [selectedSubTopic]: {
                ...courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic],
                status: true,
                materials: {
                  ...courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic]?.materials,
                  [selectedMaterial.materialID]: true,
                },
              },
            },
          },
        },
      },
    };

    setCourseStatus(updatedCourseStatus);

    try {
      await apiService.post('/api/update-progress', {
        internID,
        progress: updatedCourseStatus,
      });
      console.log("Progress updated successfully.");
      moveToNextMaterial(); // Move to the next material
      moveToNextTopic();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };


  // const moveToNextMaterial = () => {
  //   const currentTopicMaterials = courses[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic]?.materials || [];

  //   if (currentTopicMaterials.length === 0) {
  //     console.log('No materials available in the current subtopic.');
  //     moveToNextSubTopicOrTopic();
  //     return;
  //   }

  //   const currentIndex = currentTopicMaterials.findIndex(m => m.materialID === selectedMaterial?.materialID);
  //   if (currentIndex === -1) {
  //     console.error('Current material not found in the current subtopic.');
  //     return;
  //   }

  //   // Check if quiz is completed before moving to the next material
  //   const quizCompleted = courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic]?.quizCompleted === true;
  //   if (currentIndex === currentTopicMaterials.length - 1 && !quizCompleted) {
  //     console.log('Complete the quiz before moving to the next subtopic.');
  //     return;
  //   }

  //   if (currentIndex < currentTopicMaterials.length - 1) {
  //     const nextMaterial = currentTopicMaterials[currentIndex + 1];
  //     if (!nextMaterial || !nextMaterial.url) {
  //       console.error('Next material is missing or has no URL.');
  //       return;
  //     }

  //     setSelectedMaterial(nextMaterial);
  //     setIframeUrl(`http://localhost:5000${nextMaterial.url}`);

  //     setCourseStatus(prevStatus => ({
  //       ...prevStatus,
  //       [selectedCourse]: {
  //         ...prevStatus[selectedCourse],
  //         topics: {
  //           ...prevStatus[selectedCourse].topics,
  //           [selectedTopic]: {
  //             ...prevStatus[selectedCourse].topics[selectedTopic],
  //             subTopics: {
  //               ...prevStatus[selectedCourse].topics[selectedTopic].subTopics,
  //               [selectedSubTopic]: {
  //                 ...prevStatus[selectedCourse].topics[selectedTopic].subTopics[selectedSubTopic],
  //                 materials: {
  //                   ...prevStatus[selectedCourse].topics[selectedTopic].subTopics[selectedSubTopic].materials,
  //                   [nextMaterial.materialID]: true,
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     }));
  //   }
  // };


  // const moveToNextMaterial = () => {
  //   const currentTopicMaterials = courses[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic]?.materials || [];

  //   if (currentTopicMaterials.length === 0) {
  //     console.log('No materials available in the current subtopic.');
  //     moveToNextSubTopicOrTopic();
  //     return;
  //   }

  //   const currentIndex = currentTopicMaterials.findIndex(m => m.materialID === selectedMaterial?.materialID);
  //   if (currentIndex === -1) {
  //     console.error('Current material not found in the current subtopic.');
  //     return;
  //   }

  //   // Check if quiz exists and is completed before moving to the next material
  //   const subTopicData = courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic];
  //   const quizCompleted = subTopicData?.quizCompleted === true; // Check if quiz exists

  //   if (currentIndex === currentTopicMaterials.length - 1 && !quizCompleted && subTopicData?.quiz) {
  //     console.log('Complete the quiz before moving to the next subtopic.');
  //     return;
  //   }

  //   if (currentIndex < currentTopicMaterials.length - 1) {
  //     const nextMaterial = currentTopicMaterials[currentIndex + 1];
  //     if (!nextMaterial || !nextMaterial.url) {
  //       console.error('Next material is missing or has no URL.');
  //       return;
  //     }

  //     setSelectedMaterial(nextMaterial);
  //     setIframeUrl(`http://localhost:5000${nextMaterial.url}`);

  //     setCourseStatus(prevStatus => ({
  //       ...prevStatus,
  //       [selectedCourse]: {
  //         ...prevStatus[selectedCourse],
  //         topics: {
  //           ...prevStatus[selectedCourse].topics,
  //           [selectedTopic]: {
  //             ...prevStatus[selectedCourse].topics[selectedTopic],
  //             subTopics: {
  //               ...prevStatus[selectedCourse].topics[selectedTopic].subTopics,
  //               [selectedSubTopic]: {
  //                 ...prevStatus[selectedCourse].topics[selectedTopic].subTopics[selectedSubTopic],
  //                 materials: {
  //                   ...prevStatus[selectedCourse].topics[selectedTopic].subTopics[selectedSubTopic].materials,
  //                   [nextMaterial.materialID]: true,
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     }));
  //   }
  // };

  const moveToNextMaterial = () => {
    const currentTopicMaterials = courses[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic]?.materials || [];
  
    if (currentTopicMaterials.length === 0) {
      console.log('No materials available in the current subtopic.');
      moveToNextSubTopicOrTopic();
      return;
    }
  
    const currentIndex = currentTopicMaterials.findIndex(m => m.materialID === selectedMaterial?.materialID);
    if (currentIndex === -1) {
      console.error('Current material not found in the current subtopic.');
      return;
    }
  
    // Check if quiz exists and is completed only if a quiz is present
    const subTopicData = courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic];
    const quizExists = !!subTopicData?.quiz;  // Only check if quiz exists
    const quizCompleted = quizExists ? subTopicData?.quizCompleted === true : true; // Skip check if no quiz
  
    if (currentIndex === currentTopicMaterials.length - 1 && !quizCompleted && quizExists) {
      console.log('Complete the quiz before moving to the next subtopic.');
      return;
    }
  
    if (currentIndex < currentTopicMaterials.length - 1) {
      const nextMaterial = currentTopicMaterials[currentIndex + 1];
      if (!nextMaterial || !nextMaterial.url) {
        console.error('Next material is missing or has no URL.');
        return;
      }
  
      setSelectedMaterial(nextMaterial);
      // setIframeUrl(`http://localhost:5000${nextMaterial.url}`);
      setIframeUrl(`http://194.238.17.64:5000${nextMaterial.url}`);  
      setCourseStatus(prevStatus => ({
        ...prevStatus,
        [selectedCourse]: {
          ...prevStatus[selectedCourse],
          topics: {
            ...prevStatus[selectedCourse].topics,
            [selectedTopic]: {
              ...prevStatus[selectedCourse].topics[selectedTopic],
              subTopics: {
                ...prevStatus[selectedCourse].topics[selectedTopic].subTopics,
                [selectedSubTopic]: {
                  ...prevStatus[selectedCourse].topics[selectedTopic].subTopics[selectedSubTopic],
                  materials: {
                    ...prevStatus[selectedCourse].topics[selectedTopic].subTopics[selectedSubTopic].materials,
                    [nextMaterial.materialID]: true,
                  },
                },
              },
            },
          },
        },
      }));
    }
  };


// Same for moveToNextSubTopicOrTopic
const moveToNextSubTopicOrTopic = () => {
  const currentCourse = courses[selectedCourse];
  if (!currentCourse || !currentCourse.topics || !currentCourse.topics[selectedTopic]) {
    console.error('Selected course or topic is missing.');
    return;
  }

  const topic = currentCourse.topics[selectedTopic];
  const subTopics = topic.subTopics || {};

  const topicKeys = Object.keys(currentCourse?.topics || {});
  const currentTopicIndex = topicKeys.indexOf(selectedTopic);
  const subTopicKeys = Object.keys(subTopics);
  const currentSubTopicIndex = subTopicKeys.indexOf(selectedSubTopic);

  if (currentSubTopicIndex < subTopicKeys.length - 1) {
    const nextSubTopic = subTopicKeys[currentSubTopicIndex + 1];
    const nextMaterial = subTopics[nextSubTopic]?.materials[0];

    setSelectedSubTopic(nextSubTopic);
    if (nextMaterial) {
      setSelectedMaterial(nextMaterial);
      // setIframeUrl(`http://localhost:5000${nextMaterial.url}`);
      setIframeUrl(`http://194.238.17.64:5000${nextMaterial.url}`);

    }

    setCourseStatus((prevStatus) => ({
      ...prevStatus,
      [selectedCourse]: {
        ...prevStatus[selectedCourse],
        topics: {
          ...prevStatus[selectedCourse].topics,
          [selectedTopic]: {
            ...prevStatus[selectedCourse].topics?.[selectedTopic],
            subTopics: {
              ...prevStatus[selectedCourse].topics?.[selectedTopic]?.subTopics,
              [nextSubTopic]: {
                ...prevStatus[selectedCourse].topics?.[selectedTopic]?.subTopics?.[nextSubTopic],
                status: true, // Unlock the next subtopic
              },
            },
          },
        },
      },
    }));
  } else if (currentTopicIndex < topicKeys.length - 1) {
    const nextTopic = topicKeys[currentTopicIndex + 1];
    setSelectedTopic(nextTopic);
  } else {
    console.log("All topics and subtopics completed!");
  }
};


  const moveToNextSubTopic = (updatedCourseStatus) => {
    const topicKeys = Object.keys(courses[selectedCourse]?.topics || {});
    const subTopicKeys = Object.keys(courses[selectedCourse]?.topics?.[selectedTopic]?.subTopics || {});
    const currentSubTopicIndex = subTopicKeys.indexOf(selectedSubTopic);

    if (currentSubTopicIndex < subTopicKeys.length - 1) {
      const nextSubTopic = subTopicKeys[currentSubTopicIndex + 1];
      const nextMaterial = courses[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[nextSubTopic]?.materials?.[0];

      if (nextMaterial) {
        setSelectedSubTopic(nextSubTopic);
        setSelectedMaterial(nextMaterial);
        // setIframeUrl(`http://localhost:5000${nextMaterial.url}`);
        setIframeUrl(`http://194.238.17.64:5000${nextMaterial.url}`);

        // Unlock the next subtopic and its first material
        const updatedStatus = {
          ...updatedCourseStatus,
          [selectedCourse]: {
            ...updatedCourseStatus[selectedCourse],
            topics: {
              ...updatedCourseStatus[selectedCourse].topics,
              [selectedTopic]: {
                ...updatedCourseStatus[selectedCourse].topics[selectedTopic],
                subTopics: {
                  ...updatedCourseStatus[selectedTopic]?.subTopics,
                  [nextSubTopic]: {
                    status: true, // Unlock the subtopic
                    materials: {
                      [nextMaterial.materialID]: true, // Unlock the first material
                    },
                  },
                },
              },
            },
          },
        };

        setCourseStatus(updatedStatus);
      } else {
        console.log("No materials available in the next subtopic.");
      }
    }
  };



  // const moveToNextSubTopicOrTopic = () => {
  //   const topicKeys = Object.keys(courses[selectedCourse]?.topics || {});
  //   const currentTopicIndex = topicKeys.indexOf(selectedTopic);
  //   const subTopicKeys = Object.keys(courses[selectedCourse]?.topics?.[selectedTopic]?.subTopics || {});
  //   const currentSubTopicIndex = subTopicKeys.indexOf(selectedSubTopic);

  //   const currentTopicMaterials = courses[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic]?.materials || [];
  //   const allMaterialsCompleted = currentTopicMaterials.every(m =>
  //     courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic]?.materials?.[m.materialID] === true
  //   );

  //   const subTopicQuizCompleted = courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic]?.quizCompleted === true;

  //   console.log("All materials completed:", allMaterialsCompleted);
  //   console.log("Subtopic quiz completed:", subTopicQuizCompleted);

  //   if (allMaterialsCompleted && subTopicQuizCompleted) {
  //     if (currentSubTopicIndex < subTopicKeys.length - 1) {
  //       const nextSubTopic = subTopicKeys[currentSubTopicIndex + 1];
  //       const nextMaterial = courses[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[nextSubTopic]?.materials[0];

  //       setSelectedSubTopic(nextSubTopic);
  //       if (nextMaterial) {
  //         setSelectedMaterial(nextMaterial);
  //         setIframeUrl(`http://localhost:5000${nextMaterial.url}`);

  //         setCourseStatus(prevStatus => ({
  //           ...prevStatus,
  //           [selectedCourse]: {
  //             ...prevStatus[selectedCourse],
  //             topics: {
  //               ...prevStatus[selectedCourse].topics,
  //               [selectedTopic]: {
  //                 ...prevStatus[selectedTopic],
  //                 subTopics: {
  //                   ...prevStatus[selectedTopic].subTopics,
  //                   [nextSubTopic]: {
  //                     ...prevStatus[selectedTopic].subTopics[nextSubTopic],
  //                     status: true, // Unlock the next subtopic
  //                     materials: {
  //                       [nextMaterial.materialID]: true, // Unlock the first material of the next subtopic
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         }));
  //       } else {
  //         console.log("No materials available in the next subtopic.");
  //       }
  //     } else if (currentTopicIndex < topicKeys.length - 1) {
  //       // Move to the next topic if no more subtopics
  //       // Logic to handle moving to the next topic
  //     } else {
  //       console.log("All materials completed!");
  //     }
  //   } else {
  //     console.log("Complete all materials and the quiz before moving to the next subtopic.");
  //   }
  // };



  const moveToNextTopic = () => {
    const topicKeys = Object.keys(courses[selectedCourse]?.topics || {});
    const currentTopicIndex = topicKeys.indexOf(selectedTopic);

    // Check if all subtopics and their quizzes in the current topic are completed
    const allSubTopicsCompleted = Object.keys(courses[selectedCourse]?.topics[selectedTopic]?.subTopics || {}).every((subTopic) => {
      const subTopicMaterials = courses[selectedCourse]?.topics[selectedTopic]?.subTopics?.[subTopic]?.materials || [];
      const allMaterialsCompleted = subTopicMaterials.every(
        (material) => courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[subTopic]?.materials?.[material.materialID] === true
      );
      const subTopicQuizCompleted = courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[subTopic]?.quizCompleted === true;
      return allMaterialsCompleted && subTopicQuizCompleted;
    });

    // Check if the quiz for the current topic is completed
    const topicQuizCompleted = courseStatus[selectedCourse]?.topics?.[selectedTopic]?.quizCompleted === true;

    console.log("All subtopics completed:", allSubTopicsCompleted);
    console.log("Topic quiz completed:", topicQuizCompleted);

    if (allSubTopicsCompleted && topicQuizCompleted && currentTopicIndex < topicKeys.length - 1) {
      const nextTopic = topicKeys[currentTopicIndex + 1];
      setSelectedTopic(nextTopic);

      const nextSubTopic = Object.keys(courses[selectedCourse].topics[nextTopic]?.subTopics || {})[0];
      if (nextSubTopic) {
        setSelectedSubTopic(nextSubTopic);

        const nextMaterial = courses[selectedCourse].topics[nextTopic].subTopics[nextSubTopic]?.materials[0];
        if (nextMaterial) {
          setSelectedMaterial(nextMaterial);
          // setIframeUrl(`http://localhost:5000${nextMaterial.url}`);
          setIframeUrl(`http://194.238.17.64:5000${nextMaterial.url}`);

          setCourseStatus((prevStatus) => ({
            ...prevStatus,
            [selectedCourse]: {
              ...prevStatus[selectedCourse],
              topics: {
                ...prevStatus[selectedCourse].topics,
                [nextTopic]: {
                  ...prevStatus[nextTopic],
                  subTopics: {
                    [nextSubTopic]: {
                      materials: {
                        [nextMaterial.materialID]: true,
                      },
                    },
                  },
                },
              },
            },
          }));
        }
      }
    } else {
      console.log("Complete all subtopics, their materials, and quizzes before moving to the next topic.");
    }
  };



  const handleViewLessons = (course, topic) => {
    setSelectedCourse(course);
    setSelectedTopic(topic);
    setLessonDialogOpen(true);
  };

  const handleTakeCourse = (course, topic) => {
    setSelectedCourse(course);
    setSelectedTopic(topic);
    setViewMode('detail');

    const firstSubTopic = Object.keys(courses[course]?.topics[topic]?.subTopics || {})[0];
    const firstMaterial = courses[course]?.topics[topic]?.subTopics[firstSubTopic]?.materials[0];
    setSelectedSubTopic(firstSubTopic);
    setSelectedMaterial(firstMaterial);
    // setIframeUrl(firstMaterial && `http://localhost:5000${firstMaterial.url}`);
    setIframeUrl(firstMaterial && `http://194.238.17.64:5000${firstMaterial.url}`);
    // setIframeUrl(firstMaterial && `https://ramanasoftwebsite-production.up.railway.app${firstMaterial.url}`);

  };

  const handleToggleSubTopic = (subTopic) => {
    setOpenSubTopics((prev) => ({
      ...prev,
      [subTopic]: !prev[subTopic],
    }));
  };

  const isMaterialUnlocked = (course, topic, subTopic, materialIndex) => {
    const courseData = courses[course];
    if (!courseData || !courseData.topics) return false;

    const topicData = courseData.topics[topic];
    if (!topicData || !topicData.subTopics) return false;

    const subTopicData = topicData.subTopics[subTopic];
    if (!subTopicData || !subTopicData.materials || subTopicData.materials.length <= materialIndex) return false;

    const material = subTopicData.materials[materialIndex];

    const isCompleted = courseStatus[course]?.topics?.[topic]?.subTopics?.[subTopic]?.materials?.[material.materialID] === true;

    if (Object.keys(courseStatus).length > 0) {
      return isCompleted || (materialIndex === 0 && courseStatus[course]?.topics?.[topic]?.subTopics?.[subTopic]?.status === true);
    }

    return materialIndex === 0;
  };

  // const renderTopicList = () => {
  //   return Object.entries(courses).map(([courseName, courseData]) => (
  //     <Grid container spacing={3} key={courseName} sx={{ mb: 4 }}>
  //       <Grid item xs={12}>
  //         <Typography variant="h5">{courseName}</Typography>
  //       </Grid>
  //       {Object.entries(courseData.topics).map(([topicName, topicData]) => {
  //         const isTopicUnlocked = courseStatus[courseName]?.topics?.[topicName]?.status === true;
  //         return (
  //           <Grid item xs={12} sm={6} md={4} key={topicName}>
  //             <TopicCard
  //               topic={{
  //                 name: topicName,
  //                 description: topicData.description,
  //               }}
  //               onViewLessons={() => handleViewLessons(courseName, topicName)}
  //               onTakeCourse={() => handleTakeCourse(courseName, topicName)}
  //               isLocked={!isTopicUnlocked}
  //             />
  //           </Grid>
  //         );
  //       })}
  //     </Grid>
  //   ));
  // };



  const renderTopicList = () => {
    return Object.entries(courses).map(([courseName, courseData]) => (
      <Grid container spacing={3} key={courseName} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Typography variant="h5">{courseName}</Typography>
          </Grid>
          <Grid item xs={12}>
            {renderQuiz(courseData.quiz, courseName)} {/* Render quiz here in a full-width grid item */}
          </Grid>
        {Object.entries(courseData.topics).map(([topicName, topicData]) => {
          const isTopicUnlocked = courseStatus[courseName]?.topics?.[topicName]?.status === true;
          return (
            <Grid item xs={12} sm={6} md={4} key={topicName}>
              <TopicCard
                topic={{
                  name: topicName,
                  description: topicData.description,
                }}
                onViewLessons={() => handleViewLessons(courseName, topicName)}
                onTakeCourse={() => handleTakeCourse(courseName, topicName)}
                isLocked={!isTopicUnlocked}
              />
            </Grid>
          );
        })}
      </Grid>
    ));
  };



  const renderDetailView = () => {
    if (!selectedCourse || !selectedTopic) return null;

    return (
      <Grid container>
        <Grid item xs={10}>
          <IconButton onClick={() => setViewMode('overview')}>
            <ArrowBackIcon /> Back to Overview
          </IconButton>
        </Grid>
        <Grid item xs={12} md={9} sx={{ maxHeight: '100%', overflowY: 'auto' }}>
          <Typography variant="h6" gutterBottom>Material Content</Typography>
          <iframe
            src={iframeUrl}
            title="Material Content"
            width="100%"
            height="600px"
            style={{ border: 'none' }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCompleteMaterial}
            sx={{ mt: 2 }}
          >
            Complete and Next
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={3} sx={{
          maxHeight: '650px',
          overflowY: 'auto',
          borderLeft: '1px solid #ddd',
          padding: '20px'
        }}>
          <List>
            {Object.entries(courses[selectedCourse]?.topics[selectedTopic]?.subTopics || {}).map(([subTopicName, subTopicData]) => {
              const isSubTopicUnlocked = courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[subTopicName]?.status === true;
              
              return (
                <React.Fragment key={subTopicName}>
                  <ListItem button onClick={() => handleToggleSubTopic(subTopicName)}>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body1" // Adjust the variant as needed
                          sx={{
                            fontWeight: isSubTopicUnlocked ? 'bold' : 'normal', // Make it bold if unlocked
                          }}
                        >
                          {subTopicName}
                        </Typography>
                      }
                    />
                    {openSubTopics[subTopicName] ? <ExpandLess /> : <ExpandMore />}
                    {isSubTopicUnlocked ? <LockOpenIcon color="success" /> : <LockIcon color="disabled" />}
                  </ListItem>
                  <Collapse in={openSubTopics[subTopicName]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {subTopicData?.materials?.map((material, index) => {
                        console.log(selectedCourse, selectedTopic, subTopicName)
                        const isUnlocked = isMaterialUnlocked(selectedCourse, selectedTopic, subTopicName, index);

                        const isCompleted = courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[subTopicName]?.materials?.[material.materialID] === true;
                        return (
                          <ListItem
                            key={material.materialID}
                            button
                            sx={{ pl: 4 }}
                            onClick={() => {
                              if (isUnlocked) {
                                setSelectedSubTopic(subTopicName);
                                setSelectedMaterial(material);
                                // setIframeUrl(`http://localhost:5000${material.url}`);
                                setIframeUrl(`http://194.238.17.64:5000${material.url}`);
                              }
                            }}
                            disabled={!isUnlocked}
                          >
                            <ListItemText
                              primary={
                                <Typography
                                  variant="body1" // Adjust the variant as needed
                                  sx={{
                                    fontWeight: isSubTopicUnlocked ? 'bold' : 'normal', // Make it bold if unlocked
                                    fontSize: "14px",
                                    color: isSubTopicUnlocked ? 'primary.main' : 'text.disabled', // Change color based on unlocked status
                                  }}
                                >
                                  {material.name}
                                </Typography>
                              }
                            />
                            {isCompleted ? (
                              <LockOpenIcon color="success" />
                            ) : isUnlocked ? (
                              <LockOpenIcon color="primary" />
                            ) : (
                              <LockIcon color="disabled" />
                            )}
                          </ListItem>
                        );
                      })}
                      {renderQuiz(subTopicData.quiz, selectedCourse, selectedTopic, subTopicName)}
                    </List>
                  </Collapse>
                </React.Fragment>
              );
            })}
          </List>
          {/* Course-level quiz rendering could remain here if needed */}
          {renderQuiz(courses[selectedCourse]?.topics[selectedTopic]?.quiz, selectedCourse, selectedTopic)}
        </Grid>
      </Grid>
    );
  };




  const isQuizUnlocked = (course, topic, subTopic) => {
    if (subTopic) {
      console.log("subTopic :", subTopic);
      const subTopicMaterials = courses[course]?.topics[topic]?.subTopics[subTopic]?.materials || [];
      console.log("subTopicMaterials :", subTopicMaterials);
      const allMaterialsCompleted = subTopicMaterials.every(material =>
        courseStatus[course]?.topics?.[topic]?.subTopics?.[subTopic]?.materials?.[material.materialID] === true
      );

      // Check if the last material is completed
      const lastMaterial = subTopicMaterials[subTopicMaterials.length - 1];
      console.log("lastMaterial :", lastMaterial);
      const lastMaterialCompleted = lastMaterial && courseStatus[course]?.topics?.[topic]?.subTopics?.[subTopic]?.materials?.[lastMaterial.materialID] === true;
      console.log("lastMaterial completed:", lastMaterialCompleted);
      console.log('SubTopic:', subTopic, 'All materials completed:', allMaterialsCompleted, 'Last material completed:', lastMaterialCompleted);

      // Ensure all materials are completed and the last material is completed
      return allMaterialsCompleted && lastMaterialCompleted;
    } else if (topic) {
      // Topic Quiz - Ensure all subtopics in the topic are completed
      const subTopics = courses[course]?.topics[topic]?.subTopics || {};
      const allSubTopicsCompleted = Object.keys(subTopics).every((subTopicKey) => {
        const subTopicMaterials = subTopics[subTopicKey]?.materials || [];

        // Check if all materials in this subtopic are completed
        const allMaterialsCompleted = subTopicMaterials.every(material =>
          courseStatus[course]?.topics?.[topic]?.subTopics?.[subTopicKey]?.materials?.[material.materialID] === true
        );

        // Check if the last material is completed
        const lastMaterial = subTopicMaterials[subTopicMaterials.length - 1];
        const lastMaterialCompleted = lastMaterial && courseStatus[course]?.topics?.[topic]?.subTopics?.[subTopicKey]?.materials?.[lastMaterial.materialID] === true;

        console.log('SubTopic:', subTopicKey, 'All materials completed:', allMaterialsCompleted, 'Last material completed:', lastMaterialCompleted);

        return allMaterialsCompleted && lastMaterialCompleted; // Ensure both are true
      });

      console.log('Topic:', topic, 'All subtopics completed:', allSubTopicsCompleted);
      return allSubTopicsCompleted;
    } else {
      // Course Quiz - Ensure all topics in the course are completed
      const topics = courses[course]?.topics || {};
      const allTopicsCompleted = Object.keys(topics).every((topicKey) => {
        const subTopics = topics[topicKey]?.subTopics || {};
        return Object.keys(subTopics).every((subTopicKey) => {
          const subTopicMaterials = subTopics[subTopicKey]?.materials || [];

          // Check if all materials in this subtopic are completed
          const allMaterialsCompleted = subTopicMaterials.every(material =>
            courseStatus[course]?.topics?.[topicKey]?.subTopics?.[subTopicKey]?.materials?.[material.materialID] === true
          );

          // Check if the last material is completed
          const lastMaterial = subTopicMaterials[subTopicMaterials.length - 1];
          const lastMaterialCompleted = lastMaterial && courseStatus[course]?.topics?.[topicKey]?.subTopics?.[subTopicKey]?.materials?.[lastMaterial.materialID] === true;

          console.log('SubTopic:', subTopicKey, 'All materials completed:', allMaterialsCompleted, 'Last material completed:', lastMaterialCompleted);

          return allMaterialsCompleted && lastMaterialCompleted; // Ensure both are true
        });
      });

      console.log('Course:', course, 'All topics completed:', allTopicsCompleted);
      return allTopicsCompleted;
    }
  };


  // const isQuizUnlocked = (course, topic, subTopic) => {
  //   if (subTopic) {
  //     const subTopicMaterials = courses[course]?.topics[topic]?.subTopics[subTopic]?.materials || [];
  //     const allMaterialsCompleted = subTopicMaterials.every(material =>
  //       courseStatus[course]?.topics?.[topic]?.subTopics?.[subTopic]?.materials?.[material.materialID] === true
  //     );
      
  //     // If there's no quiz for this subtopic, consider it as completed
  //     const hasQuiz = !!courses[course]?.topics[topic]?.subTopics[subTopic]?.quiz;
  //     const quizCompleted = hasQuiz ? courseStatus[course]?.topics?.[topic]?.subTopics?.[subTopic]?.quizCompleted === true : true;
      
  //     return allMaterialsCompleted && quizCompleted;
  //   } else if (topic) {
  //     const subTopics = courses[course]?.topics[topic]?.subTopics || {};
  //     const allSubTopicsCompleted = Object.keys(subTopics).every((subTopicKey) => {
  //       return isQuizUnlocked(course, topic, subTopicKey);
  //     });
      
  //     // If there's no quiz for this topic, consider it as completed
  //     const hasQuiz = !!courses[course]?.topics[topic]?.quiz;
  //     const quizCompleted = hasQuiz ? courseStatus[course]?.topics?.[topic]?.quizCompleted === true : true;
      
  //     return allSubTopicsCompleted && quizCompleted;
  //   } else {
  //     const topics = courses[course]?.topics || {};
  //     const allTopicsCompleted = Object.keys(topics).every((topicKey) => {
  //       return isQuizUnlocked(course, topicKey);
  //     });
      
  //     // If there's no quiz for this course, consider it as completed
  //     const hasQuiz = !!courses[course]?.quiz;
  //     const quizCompleted = hasQuiz ? courseStatus[course]?.quizCompleted === true : true;
      
  //     return allTopicsCompleted && quizCompleted;
  //   }
  // };


  const handleTakeQuiz = (quizData, course, topic, subTopic) => {
    setCurrentQuiz({
      ...quizData,
      course,
      topic,
      subTopic,
    });
    setQuizOpen(true);
    setQuizResponses({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };
  // const renderQuiz = (quiz, course, topic, subTopic) => {

  //   if (!quiz) {
  //     console.log('No quiz available for:', course, topic, subTopic);
  //     return null; // Quiz doesn't exist, so don't render the button
  //   }

  //   const isUnlocked = isQuizUnlocked(course, topic, subTopic);

  //   console.log('Rendering quiz for:', course, topic, subTopic, 'Quiz token:', quiz.token, 'Unlocked:', isUnlocked);

  //   return (
  //     <Button
  //       variant="contained"
  //       color={isUnlocked ? "primary" : "secondary"}
  //       onClick={() => handleTakeQuiz(quiz.token, )}
  //       disabled={!isUnlocked} // Disable if not unlocked
  //     >
  //       {isUnlocked ? "Take Quiz" : "Quiz Locked"}
  //     </Button>
  //   );
  // };

  const moveToNextContent = () => {
    const currentTopicMaterials = courses[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic]?.materials || [];

    const currentMaterialIndex = currentTopicMaterials.findIndex(m => m.materialID === selectedMaterial?.materialID);

    if (currentMaterialIndex < currentTopicMaterials.length - 1) {
      // Move to the next material in the current subtopic
      const nextMaterial = currentTopicMaterials[currentMaterialIndex + 1];
      setSelectedMaterial(nextMaterial);
      // setIframeUrl(`http://localhost:5000${nextMaterial.url}`);
      setIframeUrl(`http://194.238.17.64:5000${nextMaterial.url}`);

    } else {
      // Move to the next subtopic or topic if no more materials in the current one
      moveToNextSubTopicOrTopic();
    }
  };



  const handleSubmitQuiz = async () => {
    try {
      let correctAnswers = 0;
      const totalQuestions = currentQuiz.pages_data[0].question_list.length;

      currentQuiz.pages_data[0].question_list.forEach((question) => {
        if (quizResponses[question.question_id] === question.correct_answer) {
          correctAnswers++;
        }
      });

      const score = (correctAnswers / totalQuestions) * 100;
      console.log(totalQuestions);
      console.log(score);

      // Update the backend with the quiz result
      await apiService.post(`/api/submit-quiz/${currentQuiz.token}`, {
        internID,
        responses: quizResponses,
        score: score,
      });

      setQuizSubmitted(true); // Set quiz as submitted
      setQuizScore(score); // Update quiz score

      if (score >= 100) {
        const updatedCourseStatus = {
          ...courseStatus,
          [currentQuiz.course]: {
            ...courseStatus[currentQuiz.course],
            topics: {
              ...courseStatus[currentQuiz.course]?.topics,
              [currentQuiz.topic]: {
                ...courseStatus[currentQuiz.course]?.topics?.[currentQuiz.topic],
                subTopics: {
                  ...courseStatus[currentQuiz.course]?.topics?.[currentQuiz.topic]?.subTopics,
                  [currentQuiz.subTopic]: {
                    ...courseStatus[currentQuiz.course]?.topics?.[currentQuiz.topic]?.subTopics?.[currentQuiz.subTopic],
                    quizCompleted: true,
                  },
                },
              },
            },
          },
        };
        setCourseStatus(updatedCourseStatus);

        // Update the backend with the new course status
        try {
          await apiService.post('/api/update-progress', {
            internID,
            progress: updatedCourseStatus,
          });
          console.log("Quiz completion status updated successfully.");
          moveToNextContent();
        } catch (error) {
          console.error('Error updating quiz completion status:', error);
        }
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };





  const handleQuizResponse = (questionId, answer) => {
    setQuizResponses(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const renderQuizModal = () => {
    const totalQuestions = currentQuiz?.pages_data[0]?.question_list.length || 0;
    const correctAnswers = Object.values(quizResponses).filter((response, index) => response === currentQuiz.pages_data[0].question_list[index].correct_answer).length;
    return (
      <Dialog
        open={quizOpen}
        onClose={() => setQuizOpen(false)}
        fullWidth
        maxWidth="lg"
        sx={{
          '& .MuiDialog-paper': {
            width: '98%', // Custom width percentage
            height: '98%', // Custom height percentage
            maxHeight: '90vh', // Prevent overflow on large screens
          },
        }} // Additional styles
        classes={{ paper: 'Attempt_container' }} // Adding custom class for container
      >
        <DialogContent>
          {!quizSubmitted ? ( // If quiz is not submitted, show the questions
            currentQuiz?.pages_data[0]?.question_list.map((question, index) => (
              <div key={question.question_id} className="Attempt_questionPreview">
                <Typography variant="subtitle1" className="Attempt_questionHeader">
                  {`${index + 1}. ${question.question_text || question.text || 'Question Text Missing'}`}
                </Typography>
                <RadioGroup
                  name={`question-${question.question_id}`}
                  value={quizResponses[question.question_id] || ''}
                  onChange={(e) => handleQuizResponse(question.question_id, e.target.value)}
                >
                  {question.options_list.map((option, optIndex) => (
                    <div key={optIndex} className="Attempt_option">
                      <input
                        type="radio"
                        value={option}
                        checked={quizResponses[question.question_id] === option}
                        onChange={(e) => handleQuizResponse(question.question_id, e.target.value)}
                      />
                      <label>{option}</label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))
          ) : ( // If quiz is submitted, show the results
            <>
              <Typography variant="h6" color={quizScore === 100 ? 'success' : 'error'} className="Attempt_error">
                Your score: {quizScore.toFixed(2)}%
                {quizScore === 100 ? ' - Great job! You can now proceed to the next content.' : ' - Please try again to unlock the next content.'}
              </Typography>
              <Typography variant="body1" className="Attempt_detail">
                Total Questions: {totalQuestions}
              </Typography>
              <Typography variant="body1" className="Attempt_detail">
                Correct Answers: {correctAnswers}
              </Typography>
              <Typography variant="body1" className="Attempt_detail">
                {correctAnswers / totalQuestions > 0.7 ?
                  "You're doing great! Keep it up!" :
                  "Consider reviewing the material before attempting the quiz again."}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuizOpen(false)} className="Attempt_button">Close</Button>
          {!quizSubmitted && (
            <Button onClick={handleSubmitQuiz} color="primary" variant="contained" className="Attempt_button Attempt_submitButton">
              Submit
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  };




  const renderQuiz = (quiz, course, topic, subTopic) => {
    if (!quiz) {
      return null; // Quiz doesn't exist
    }
    console.log(course, topic, subTopic);
    // Determine if the quiz is a course quiz
    const isCourseQuiz = course && !topic && !subTopic;

    // Check if all topics in the course are completed
    const allTopicsCompleted = () => {
      const courseTopics = courses[course.id]?.topics;
      if (!courseTopics) return false;

      return Object.values(courseTopics).every(topic =>
        topic.subTopics &&
        Object.values(topic.subTopics).every(subTopic =>
          subTopic.quizCompleted
        )
      );
    };
    const isUnlocked = isCourseQuiz ? allTopicsCompleted() : isQuizUnlocked(course, topic, subTopic);
    const quizCompleted = courseStatus[course]?.topics?.[topic]?.subTopics?.[subTopic]?.quizCompleted === true;

    return (
      <Button
        variant="contained"
        color={quizCompleted ? "success" : (isUnlocked ? "primary" : "secondary")}
        onClick={() => !quizCompleted && handleTakeQuiz(quiz, course, topic, subTopic)}
        disabled={!isUnlocked || quizCompleted}
        sx={{
          display: 'flex',
          alignItems: 'center',
          marginLeft: "40px",
          justifyContent: 'center',
          '&:hover': {
            backgroundColor: quizCompleted ? 'green' : (isUnlocked ? 'darkblue' : 'gray'), // Customize hover color
          },
        }}
      >
        {/* Conditional Icons */}
        {quizCompleted ? (
          <>
            <CheckCircleIcon sx={{ marginRight: 1 }} />
            Completed
          </>
        ) : isUnlocked ? (
          <>
            <LockOpenIcon sx={{ marginRight: 1 }} />
            Take Quiz
          </>
        ) : (
          <>
            <LockIcon sx={{ marginRight: 1 }} />
            Quiz Locked
          </>
        )}
      </Button>
    );
  };






  return (
    <Container>
      {viewMode === 'overview' ? renderTopicList() : renderDetailView()}
      <LessonDialog
        open={lessonDialogOpen}
        onClose={() => setLessonDialogOpen(false)}
        lessons={selectedTopic ? Object.keys(courses[selectedCourse]?.topics[selectedTopic]?.subTopics || {}).map(subTopic => ({ name: subTopic })) : []}
      />
      {renderQuizModal()}
    </Container>
  );

};

export default LMS_dash;