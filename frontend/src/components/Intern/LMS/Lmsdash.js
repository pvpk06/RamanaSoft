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
  DialogContent,
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
      <Button color="primary" onClick={onViewLessons} sx={{ mt: 2 }}>
        View Lessons
      </Button>
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

  useEffect(() => {
    if (internID) {
      fetchCoursesForIntern();
    }
  }, [internID]);

  const fetchCoursesForIntern = async () => {
    try {
      const response = await apiService.get(`/api/intern-courses/${internID}`);
      const organizedCourses = organizeData(response.data);
      setCourses(organizedCourses);
      fetchProgressForIntern(organizedCourses);
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
            materials: item.Materials || [],
          };
        }
      }
    });
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
          setIframeUrl(`https://ramanasoftwebsite-production.up.railway.app${firstMaterial.url}`);

        }
      } else {
        setCourseStatus(progress);
      }
    } catch (error) {
      console.error('Error fetching course progress:', error);
    }
  };

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
      moveToNextMaterial();
      moveToNextTopic();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const moveToNextMaterial = () => {
    // Safely access materials of the current subtopic
    const currentTopicMaterials = courses[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic]?.materials || [];
    const currentIndex = currentTopicMaterials.findIndex(m => m.materialID === selectedMaterial.materialID);
  
    // Move to the next material in the same subtopic if available
    if (currentIndex < currentTopicMaterials.length - 1) {
      const nextMaterial = currentTopicMaterials[currentIndex + 1];
      setSelectedMaterial(nextMaterial);
      // setIframeUrl(`http://localhost:5000${nextMaterial.url}`);
      setIframeUrl(`https://ramanasoftwebsite-production.up.railway.app${nextMaterial.url}`);
  
      // Unlock the next material
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
                    [nextMaterial.materialID]: true, // Unlock the next material
                  },
                },
              },
            },
          },
        },
      }));
    } else {
      moveToNextSubTopicOrTopic();
    }
  };
  
  const moveToNextSubTopicOrTopic = () => {
    const topicKeys = Object.keys(courses[selectedCourse]?.topics || {});
    const currentTopicIndex = topicKeys.indexOf(selectedTopic);
    const subTopicKeys = Object.keys(courses[selectedCourse]?.topics?.[selectedTopic]?.subTopics || {});
    const currentSubTopicIndex = subTopicKeys.indexOf(selectedSubTopic);
  
    // Check if all materials in the current subtopic are completed
    const currentTopicMaterials = courses[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic]?.materials || [];
    const allMaterialsCompleted = currentTopicMaterials.every(m =>
      courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic]?.materials?.[m.materialID] === true
    );
  
    if (allMaterialsCompleted) {
      // Move to the next subtopic if available
      if (currentSubTopicIndex < subTopicKeys.length - 1) {
        const nextSubTopic = subTopicKeys[currentSubTopicIndex + 1];
        const nextMaterial = courses[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[nextSubTopic]?.materials[0];
  
        setSelectedSubTopic(nextSubTopic);
        if (nextMaterial) {
          setSelectedMaterial(nextMaterial);
          // setIframeUrl(`http://localhost:5000${nextMaterial.url}`);
          setIframeUrl(`https://ramanasoftwebsite-production.up.railway.app${nextMaterial.url}`);

          // Unlock the first material of the next subtopic
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
                    [nextSubTopic]: {
                      ...prevStatus[selectedCourse].topics[selectedTopic].subTopics[nextSubTopic],
                      materials: {
                        [nextMaterial.materialID]: true, // Unlock the first material of the next subtopic
                      },
                    },
                  },
                },
              },
            },
          }));
        } else {
          console.log("No materials available in the next subtopic.");
        }
      }
      // Move to the next topic if no more subtopics
      else if (currentTopicIndex < topicKeys.length - 1) {
        const nextTopic = topicKeys[currentTopicIndex + 1];
        const nextSubTopic = Object.keys(courses[selectedCourse]?.topics?.[nextTopic]?.subTopics || {})[0];
  
        setSelectedTopic(nextTopic);
        if (nextSubTopic) {
          const nextMaterial = courses[selectedCourse]?.topics?.[nextTopic]?.subTopics?.[nextSubTopic]?.materials[0];
          setSelectedSubTopic(nextSubTopic);
  
          if (nextMaterial) {
            setSelectedMaterial(nextMaterial);
            // setIframeUrl(`http://localhost:5000${nextMaterial.url}`);
            setIframeUrl(`https://ramanasoftwebsite-production.up.railway.app${nextMaterial.url}`);

            // Unlock the first material of the next topic's first subtopic
            setCourseStatus(prevStatus => ({
              ...prevStatus,
              [selectedCourse]: {
                ...prevStatus[selectedCourse],
                topics: {
                  ...prevStatus[selectedCourse].topics,
                  [nextTopic]: {
                    ...prevStatus[selectedCourse].topics[nextTopic],
                    subTopics: {
                      [nextSubTopic]: {
                        ...prevStatus[selectedCourse].topics[nextTopic].subTopics[nextSubTopic],
                        materials: {
                          [nextMaterial.materialID]: true, // Unlock the first material of the next topic
                        },
                      },
                    },
                  },
                },
              },
            }));
          } else {
            console.log("No materials available in the next topic.");
          }
        } else {
          console.log("No subtopics available in the next topic.");
        }
      } else {
        console.log("All materials completed!");
      }
    }
  };
  

  const moveToNextTopic = () => {
    const topicKeys = Object.keys(courses[selectedCourse]?.topics || {});
    const currentTopicIndex = topicKeys.indexOf(selectedTopic);

    const allSubTopicsCompleted = Object.keys(courses[selectedCourse]?.topics[selectedTopic]?.subTopics || {}).every((subTopic) => {
      const subTopicMaterials = courses[selectedCourse]?.topics[selectedTopic]?.subTopics?.[subTopic]?.materials || [];
      return subTopicMaterials.every(
        (material) => courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[subTopic]?.materials?.[material.materialID] === true
      );
    });

    if (allSubTopicsCompleted && currentTopicIndex < topicKeys.length - 1) {
      const nextTopic = topicKeys[currentTopicIndex + 1];
      setSelectedTopic(nextTopic);

      const nextSubTopic = Object.keys(courses[selectedCourse].topics[nextTopic]?.subTopics || {})[0];
      if (nextSubTopic) {
        setSelectedSubTopic(nextSubTopic);

        const nextMaterial = courses[selectedCourse].topics[nextTopic].subTopics[nextSubTopic]?.materials[0];
        if (nextMaterial) {
          setSelectedMaterial(nextMaterial);
          // setIframeUrl(`http://localhost:5000${nextMaterial.url}`);
          setIframeUrl(`https://ramanasoftwebsite-production.up.railway.app${nextMaterial.url}`);

          setCourseStatus((prevStatus) => ({
            ...prevStatus,
            [selectedCourse]: {
              ...prevStatus[selectedCourse],
              topics: {
                ...prevStatus[selectedCourse].topics,
                [nextTopic]: {
                  ...prevStatus[selectedCourse].topics[nextTopic],
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
    setIframeUrl(firstMaterial && `https://ramanasoftwebsite-production.up.railway.app${firstMaterial.url}`);

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

  const renderTopicList = () => {
    return Object.entries(courses).map(([courseName, courseData]) => (
      <Grid container spacing={3} key={courseName} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="h5">{courseName}</Typography>
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
          <Typography variant="h6" gutterBottom>Course Content</Typography>
          <List>
            {Object.entries(courses[selectedCourse]?.topics[selectedTopic]?.subTopics || {}).map(([subTopicName, subTopicData]) => {
              const isSubTopicUnlocked = courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[subTopicName]?.status === true;

              return (
                <React.Fragment key={subTopicName}>
                  <ListItem button onClick={() => handleToggleSubTopic(subTopicName)}>
                    <ListItemText primary={subTopicName} />
                    {openSubTopics[subTopicName] ? <ExpandLess /> : <ExpandMore />}
                    {isSubTopicUnlocked ? <LockOpenIcon color="success" /> : <LockIcon color="disabled" />}
                  </ListItem>
                  <Collapse in={openSubTopics[subTopicName]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {subTopicData?.materials?.map((material, index) => {
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
                                setIframeUrl(`https://ramanasoftwebsite-production.up.railway.app${material.url}`);

                              }
                            }}
                            disabled={!isUnlocked}
                          >
                            <ListItemText
                              primary={material.name}
                              style={{
                                fontSize: "10px",
                                color: "#333",
                                fontWeight: "bold",
                                letterSpacing: "1px",
                                textTransform: "uppercase",
                                padding: "5px",
                              }}
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
                    </List>
                  </Collapse>
                </React.Fragment>
              );
            })}
          </List>
        </Grid>
      </Grid>
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
    </Container>
  );
};

export default LMS_dash;


// import React, { useState, useEffect } from 'react';
// import {
//   Button,
//   Typography,
//   Grid,
//   List,
//   ListItem,
//   ListItemText,
//   Collapse,
//   Card,
//   CardContent,
//   Dialog,
//   DialogContent,
//   IconButton,
// } from '@mui/material';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import ExpandLess from '@mui/icons-material/ExpandLess';
// import ExpandMore from '@mui/icons-material/ExpandMore';
// import LockIcon from '@mui/icons-material/Lock';
// import LockOpenIcon from '@mui/icons-material/LockOpen';
// import { Container } from 'react-bootstrap';
// import Cookies from 'js-cookie';
// import apiService from '../../../apiService';

// const TopicCard = ({ topic, onViewLessons, onTakeCourse, isLocked }) => (
//   <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
//     <CardContent sx={{ flexGrow: 1 }}>
//       <Typography variant="h5" component="div" gutterBottom>
//         {topic.name}
//       </Typography>
//       <Typography variant="body2" color="text.secondary">
//         {topic.description}
//       </Typography>
//       {/* Display the lock icon inside the card */}
//       {isLocked ? (
//         <LockIcon color="disabled" sx={{ position: 'absolute', top: '16px', right: '16px' }} />
//       ) : (
//         <LockOpenIcon color="success" sx={{ position: 'absolute', top: '16px', right: '16px' }} />
//       )}
//       <Button color="primary" onClick={onViewLessons} sx={{ mt: 2 }}>
//         View Lessons
//       </Button>
//     </CardContent>
//     <Button
//       variant="contained"
//       color="primary"
//       onClick={onTakeCourse}
//       disabled={isLocked} // Disable button if the topic is locked
//       sx={{ m: 2 }}
//     >
//       Take Course
//     </Button>
//   </Card>
// );


// const LessonDialog = ({ open, onClose, lessons }) => (
//   <Dialog open={open} onClose={onClose}>
//     <DialogContent>
//       <List>
//         {lessons.map((lesson, index) => (
//           <ListItem key={index}>
//             <ListItemText primary={lesson.name} />
//           </ListItem>
//         ))}
//       </List>
//     </DialogContent>
//   </Dialog>
// );

// const LMS_dash = () => {
//   const internID = Cookies.get('internID');
//   const [courses, setCourses] = useState({});
//   const [courseStatus, setCourseStatus] = useState({});
//   const [selectedCourse, setSelectedCourse] = useState(null);
//   const [selectedTopic, setSelectedTopic] = useState(null);
//   const [selectedSubTopic, setSelectedSubTopic] = useState(null);
//   const [selectedMaterial, setSelectedMaterial] = useState(null);
//   const [iframeUrl, setIframeUrl] = useState('');
//   const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
//   const [viewMode, setViewMode] = useState('overview');
//   const [openSubTopics, setOpenSubTopics] = useState({});

//   useEffect(() => {
//     if (internID) {
//       fetchCoursesForIntern();
//     }
//   }, [internID]);

//   const fetchCoursesForIntern = async () => {
//     try {
//       const response = await apiService.get(`/api/intern-courses/${internID}`);
//       const organizedCourses = organizeData(response.data);
//       setCourses(organizedCourses);
//       fetchProgressForIntern(organizedCourses);
//     } catch (error) {
//       console.error('Error fetching courses:', error);
//     }
//   };

//   const organizeData = (data) => {
//     const organized = {};
//     data.forEach((item) => {
//       if (!organized[item.CourseName]) {
//         organized[item.CourseName] = { topics: {} };
//       }
//       if (item.Topic) {
//         if (!organized[item.CourseName].topics[item.Topic]) {
//           organized[item.CourseName].topics[item.Topic] = { subTopics: {} };
//         }
//         if (item.SubTopic) {
//           organized[item.CourseName].topics[item.Topic].subTopics[item.SubTopic] = {
//             materials: item.Materials || [],
//           };
//         }
//       }
//     });
//     return organized;
//   };

//   const fetchProgressForIntern = async (fetchedCourses) => {
//     try {
//       const response = await apiService.get(`/api/intern-progress/${internID}`);
//       const progress = response.data.course_status || {};

//       // If intern progress is null or empty, unlock the first material
//       if (Object.keys(progress).length === 0) {
//         // Get the first course, topic, and subtopic
//         const firstCourse = Object.keys(fetchedCourses)[0];
//         const firstTopic = Object.keys(fetchedCourses[firstCourse]?.topics || {})[0];
//         const firstSubTopic = Object.keys(fetchedCourses[firstCourse]?.topics[firstTopic]?.subTopics || {})[0];
//         const firstMaterial = fetchedCourses[firstCourse]?.topics[firstTopic]?.subTopics[firstSubTopic]?.materials[0];

//         if (firstMaterial) {
//           // Set state to unlock the first material
//           const initialCourseStatus = {
//             [firstCourse]: {
//               status: true, // Mark course as started
//               topics: {
//                 [firstTopic]: {
//                   status: true, // Mark topic as started
//                   subTopics: {
//                     [firstSubTopic]: {
//                       status: true, // Mark subtopic as started
//                       materials: {
//                         [firstMaterial.materialID]: true // Unlock first material
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           };

//           setCourseStatus(initialCourseStatus);
//           setSelectedCourse(firstCourse);
//           setSelectedTopic(firstTopic);
//           setSelectedSubTopic(firstSubTopic);
//           setSelectedMaterial(firstMaterial);
//           setIframeUrl(`http://localhost:5000${firstMaterial.url}`);
//         }
//       } else {
//         setCourseStatus(progress);
//         // If there is progress, set selected states based on progress
//         // This part needs to remain intact based on your existing logic
//       }
//     } catch (error) {
//       console.error('Error fetching course progress:', error);
//     }
//   };


//   const handleCompleteMaterial = async () => {
//     // Create a copy of the current course status
//     const updatedCourseStatus = {
//       ...courseStatus,
//       [selectedCourse]: {
//         ...courseStatus[selectedCourse],
//         status: true, // Mark course as started/in progress
//         topics: {
//           ...courseStatus[selectedCourse]?.topics,
//           [selectedTopic]: {
//             ...courseStatus[selectedCourse]?.topics?.[selectedTopic],
//             status: true, // Mark topic as started/in progress
//             subTopics: {
//               ...courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics,
//               [selectedSubTopic]: {
//                 ...courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic],
//                 status: true, // Mark subtopic as started/in progress
//                 materials: {
//                   ...courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic]?.materials,
//                   [selectedMaterial.materialID]: true, // Mark current material as completed
//                 }
//               }
//             }
//           }
//         }
//       }
//     };

//     // Update the course status in the state
//     setCourseStatus(updatedCourseStatus);

//     try {
//       await apiService.post('/api/update-progress', {
//         internID,
//         progress: updatedCourseStatus,
//       });
//       console.log("Progress updated successfully.");
//       moveToNextMaterial(); // Move to the next material
//       // Call the moveToNextTopic function to check and proceed to the next topic if applicable
//       moveToNextTopic();
//     } catch (error) {
//       console.error('Error updating progress:', error);
//     }
//   };

//   const moveToNextTopic = () => {
//     const topicKeys = Object.keys(courses[selectedCourse].topics);
//     const currentTopicIndex = topicKeys.indexOf(selectedTopic);

//     // Check if all subTopics in the current topic are completed
//     const allSubTopicsCompleted = Object.keys(courses[selectedCourse]?.topics[selectedTopic]?.subTopics || {}).every(
//       (subTopic) => {
//         const subTopicMaterials = courses[selectedCourse]?.topics[selectedTopic]?.subTopics?.[subTopic]?.materials || [];
//         return subTopicMaterials.every(
//           (material) =>
//             courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[subTopic]?.materials?.[material.materialID] === true
//         );
//       }
//     );

//     if (allSubTopicsCompleted) {
//       // Move to the next topic if all subTopics are completed
//       if (currentTopicIndex < topicKeys.length - 1) {
//         const nextTopic = topicKeys[currentTopicIndex + 1];
//         setSelectedTopic(nextTopic);

//         const nextSubTopic = Object.keys(courses[selectedCourse].topics[nextTopic]?.subTopics || {})[0];
//         if (nextSubTopic) {
//           setSelectedSubTopic(nextSubTopic);

//           const nextMaterial = courses[selectedCourse].topics[nextTopic].subTopics[nextSubTopic]?.materials[0];
//           if (nextMaterial) {
//             setSelectedMaterial(nextMaterial);
//             setIframeUrl(`http://localhost:5000${nextMaterial.url}`);

//             // Unlock the first material of the next topic's first subtopic
//             setCourseStatus((prevStatus) => ({
//               ...prevStatus,
//               [selectedCourse]: {
//                 ...prevStatus[selectedCourse],
//                 topics: {
//                   ...prevStatus[selectedCourse].topics,
//                   [nextTopic]: {
//                     ...prevStatus[selectedCourse].topics[nextTopic],
//                     subTopics: {
//                       [nextSubTopic]: {
//                         ...prevStatus[selectedCourse].topics[nextTopic].subTopics[nextSubTopic],
//                         materials: {
//                           [nextMaterial.materialID]: true, // Unlock the first material of the next topic
//                         },
//                       },
//                     },
//                   },
//                 },
//               },
//             }));
//           } else {
//             console.log("No materials available in the next topic.");
//           }
//         } else {
//           console.log("No subtopics available in the next topic.");
//         }
//       } else {
//         console.log("All topics completed!");
//       }
//     } else {
//       console.log("Not all subTopics in the current topic are completed.");
//     }
//   };


  // const moveToNextMaterial = () => {
  //   // Safely access materials of the current subtopic
  //   const currentTopicMaterials = courses[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic]?.materials || [];
  //   const currentIndex = currentTopicMaterials.findIndex(m => m.materialID === selectedMaterial.materialID);

  //   // Check if there's a next material in the same subtopic
  //   if (currentIndex < currentTopicMaterials.length - 1) {
  //     // Move to the next material in the same subtopic
  //     const nextMaterial = currentTopicMaterials[currentIndex + 1];
  //     setSelectedMaterial(nextMaterial);
  //     setIframeUrl(`http://localhost:5000${nextMaterial.url}`);

  //     // Unlock the next material
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
  //                   [nextMaterial.materialID]: true // Unlock the next material
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }));

  //   } else {
  //     // Move to the next subtopic or topic
  //     const topicKeys = Object.keys(courses[selectedCourse].topics);
  //     const currentTopicIndex = topicKeys.indexOf(selectedTopic);
  //     const subTopicKeys = Object.keys(courses[selectedCourse].topics[selectedTopic]?.subTopics || {});
  //     const currentSubTopicIndex = subTopicKeys.indexOf(selectedSubTopic);

  //     // Check if all materials in the current subtopic are completed
  //     const allMaterialsCompleted = currentTopicMaterials.every(m =>
  //       courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic]?.materials?.[m.materialID] === true
  //     );

  //     if (allMaterialsCompleted) {
  //       // Move to next subtopic
  //       if (currentSubTopicIndex < subTopicKeys.length - 1) {
  //         const nextSubTopic = subTopicKeys[currentSubTopicIndex + 1];
  //         setSelectedSubTopic(nextSubTopic);
  //         const nextMaterial = courses[selectedCourse].topics[selectedTopic].subTopics[nextSubTopic]?.materials[0];

  //         if (nextMaterial) {
  //           setSelectedMaterial(nextMaterial);
  //           setIframeUrl(`http://localhost:5000${nextMaterial.url}`);

  //           // Unlock the first material of the next subtopic
  //           setCourseStatus(prevStatus => ({
  //             ...prevStatus,
  //             [selectedCourse]: {
  //               ...prevStatus[selectedCourse],
  //               topics: {
  //                 ...prevStatus[selectedCourse].topics,
  //                 [selectedTopic]: {
  //                   ...prevStatus[selectedCourse].topics[selectedTopic],
  //                   subTopics: {
  //                     ...prevStatus[selectedCourse].topics[selectedTopic].subTopics,
  //                     [nextSubTopic]: {
  //                       ...prevStatus[selectedCourse].topics[selectedTopic].subTopics[nextSubTopic],
  //                       materials: {
  //                         [nextMaterial.materialID]: true // Unlock the first material of the next subtopic
  //                       }
  //                     }
  //                   }
  //                 }
  //               }
  //             }
  //           }));
  //         } else {
  //           console.log("No materials available in the next subtopic.");
  //         }
  //       } else if (currentTopicIndex < topicKeys.length - 1) {
  //         // Move to the next topic if no more subtopics
  //         const nextTopic = topicKeys[currentTopicIndex + 1];
  //         setSelectedTopic(nextTopic);
  //         const nextSubTopic = Object.keys(courses[selectedCourse].topics[nextTopic]?.subTopics || {})[0];

  //         // Make sure to check that nextSubTopic is defined
  //         if (nextSubTopic) {
  //           setSelectedSubTopic(nextSubTopic);
  //           const nextMaterial = courses[selectedCourse].topics[nextTopic].subTopics[nextSubTopic]?.materials[0];

  //           if (nextMaterial) {
  //             setSelectedMaterial(nextMaterial);
  //             setIframeUrl(`http://localhost:5000${nextMaterial.url}`);

  //             // Unlock the first material of the next topic's first subtopic
  //             setCourseStatus(prevStatus => ({
  //               ...prevStatus,
  //               [selectedCourse]: {
  //                 ...prevStatus[selectedCourse],
  //                 topics: {
  //                   ...prevStatus[selectedCourse].topics,
  //                   [nextTopic]: {
  //                     ...prevStatus[selectedCourse].topics[nextTopic],
  //                     subTopics: {
  //                       [nextSubTopic]: {
  //                         ...prevStatus[selectedCourse].topics[nextTopic].subTopics[nextSubTopic],
  //                         materials: {
  //                           [nextMaterial.materialID]: true // Unlock the first material of the next topic
  //                         }
  //                       }
  //                     }
  //                   }
  //                 }
  //               }
  //             }));
  //           } else {
  //             console.log("No materials available in the next topic.");
  //           }
  //         } else {
  //           console.log("No subtopics available in the next topic.");
  //         }
  //       } else {
  //         // All materials completed
  //         console.log("All materials completed!");
  //       }
  //     } else {
  //       // If not all materials are completed, just show the next material in the same subtopic
  //       if (currentIndex < currentTopicMaterials.length - 1) {
  //         const nextMaterial = currentTopicMaterials[currentIndex + 1];
  //         setSelectedMaterial(nextMaterial);
  //         setIframeUrl(`http://localhost:5000${nextMaterial.url}`);
  //       } else {
  //         console.log("All materials in this subtopic are completed, but the next subtopic is not unlocked.");
  //       }
  //     }
  //   }
  // };



//   const handleViewLessons = (course, topic) => {
//     setSelectedCourse(course);
//     setSelectedTopic(topic);
//     setLessonDialogOpen(true);
//   };

//   const handleTakeCourse = (course, topic) => {
//     setSelectedCourse(course);
//     setSelectedTopic(topic);
//     setViewMode('detail');

//     const firstSubTopic = Object.keys(courses[course].topics[topic].subTopics)[0];
//     const firstMaterial = courses[course].topics[topic].subTopics[firstSubTopic].materials[0];
//     setSelectedSubTopic(firstSubTopic);
//     setSelectedMaterial(firstMaterial);
//     setIframeUrl(firstMaterial && `http://localhost:5000${firstMaterial.url}`);
//   };

//   const handleToggleSubTopic = (subTopic) => {
//     setOpenSubTopics(prev => ({
//       ...prev,
//       [subTopic]: !prev[subTopic]
//     }));
//   };

//   const isMaterialUnlocked = (course, topic, subTopic, materialIndex) => {
//     const courseData = courses[course];
//     if (!courseData || !courseData.topics) return false;

//     const topicData = courseData.topics[topic];
//     if (!topicData || !topicData.subTopics) return false;

//     const subTopicData = topicData.subTopics[subTopic];
//     if (!subTopicData || !subTopicData.materials || subTopicData.materials.length <= materialIndex) return false;

//     const material = subTopicData.materials[materialIndex];

//     const isCompleted = courseStatus[course]?.topics?.[topic]?.subTopics?.[subTopic]?.materials?.[material.materialID] === true;

//     if (Object.keys(courseStatus).length > 0) {
//       return isCompleted || (materialIndex === 0 && courseStatus[course]?.topics?.[topic]?.subTopics?.[subTopic]?.status === true);
//     }

//     return materialIndex === 0;
//   };

//   const renderTopicList = () => {
//     return Object.entries(courses).map(([courseName, courseData]) => (
//       <Grid container spacing={3} key={courseName} sx={{ mb: 4 }}>
//         <Grid item xs={12}>
//           <Typography variant="h5">{courseName}</Typography>
//         </Grid>
//         {Object.entries(courseData.topics).map(([topicName, topicData]) => {
//           const isTopicUnlocked = courseStatus[courseName]?.topics?.[topicName]?.status === true;
//           return (
//             <Grid item xs={12} sm={6} md={4} key={topicName}>
//               <TopicCard
//                 topic={{
//                   name: topicName,
//                   description: topicData.description,
//                 }}
//                 onViewLessons={() => handleViewLessons(courseName, topicName)}
//                 onTakeCourse={() => handleTakeCourse(courseName, topicName)}
//                 isLocked={!isTopicUnlocked} // Pass lock status to the TopicCard
//               />
//             </Grid>
//           );
//         })}
//       </Grid>
//     ));
//   };

//   const renderDetailView = () => {
//     if (!selectedCourse || !selectedTopic) return null;

//     return (
//       <Grid container>
//         <Grid item xs={10}>
//           <IconButton onClick={() => setViewMode('overview')}>
//             <ArrowBackIcon /> Back to Overview
//           </IconButton>
//         </Grid>
//         <Grid item xs={12} md={9} sx={{ maxHeight: '100%', overflowY: 'auto' }}>
//           <Typography variant="h6" gutterBottom>Material Content</Typography>
//           <iframe
//             src={iframeUrl}
//             title="Material Content"
//             width="100%"
//             height="600px"
//             style={{ border: 'none' }}
//           />
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={handleCompleteMaterial}
//             sx={{ mt: 2 }}
//           >
//             Complete and Next
//           </Button>
//         </Grid>
//         <Grid item xs={12} sm={6} md={3} sx={{
//           maxHeight: '650px',
//           overflowY: 'auto',
//           borderLeft: '1px solid #ddd',
//           padding: '20px'
//         }}>
//           <Typography variant="h6" gutterBottom>Course Content</Typography>
//           <List>
//             {Object.entries(courses[selectedCourse].topics[selectedTopic].subTopics).map(([subTopicName, subTopicData]) => {
//               const isSubTopicUnlocked = courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[subTopicName]?.status === true;

//               return (
//                 <React.Fragment key={subTopicName}>
//                   <ListItem button onClick={() => handleToggleSubTopic(subTopicName)}>
//                     <ListItemText primary={subTopicName} />
//                     {openSubTopics[subTopicName] ? <ExpandLess /> : <ExpandMore />}
//                     {isSubTopicUnlocked ? <LockOpenIcon color="success" /> : <LockIcon color="disabled" />}
//                   </ListItem>
//                   <Collapse in={openSubTopics[subTopicName]} timeout="auto" unmountOnExit>
//                     <List component="div" disablePadding>
//                       {subTopicData.materials.map((material, index) => {
//                         const isUnlocked = isMaterialUnlocked(selectedCourse, selectedTopic, subTopicName, index);
//                         const isCompleted = courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[subTopicName]?.materials?.[material.materialID] === true;
//                         return (
//                           <ListItem
//                             key={material.materialID}
//                             button
//                             sx={{ pl: 4 }}
//                             onClick={() => {
//                               if (isUnlocked) {
//                                 setSelectedSubTopic(subTopicName);
//                                 setSelectedMaterial(material);
//                                 setIframeUrl(`http://localhost:5000${material.url}`);
//                               }
//                             }}
//                             disabled={!isUnlocked}
//                           >
//                             <ListItemText
//                               primary={material.name}
//                               style={{
//                                 fontSize: "10px",
//                                 color: "#333",
//                                 fontWeight: "bold",
//                                 letterSpacing: "1px",
//                                 textTransform: "uppercase",
//                                 padding: "5px",
//                               }}
//                             />
//                             {isCompleted ? (
//                               <LockOpenIcon color="success" />
//                             ) : isUnlocked ? (
//                               <LockOpenIcon color="primary" />
//                             ) : (
//                               <LockIcon color="disabled" />
//                             )}
//                           </ListItem>
//                         );
//                       })}
//                     </List>
//                   </Collapse>
//                 </React.Fragment>
//               );
//             })}
//           </List>
//         </Grid>
//       </Grid>
//     );
//   };

//   return (
//     <Container>
//       {viewMode === 'overview' ? renderTopicList() : renderDetailView()}
//       <LessonDialog
//         open={lessonDialogOpen}
//         onClose={() => setLessonDialogOpen(false)}
//         lessons={selectedTopic ? Object.keys(courses[selectedCourse]?.topics[selectedTopic]?.subTopics || {}).map(subTopic => ({ name: subTopic })) : []}
//       />
//     </Container>
//   );
// };

// export default LMS_dash;



