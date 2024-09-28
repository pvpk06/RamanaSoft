import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faChevronDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import { v4 as uuidv4 } from 'uuid';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../../../../apiService';

const QuizDash = () => {
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [folders, setFolders] = useState({});
    const [newFolder, setNewFolder] = useState('');
    const [newSubfolder, setNewSubfolder] = useState('');
    const [newQuiz, setNewQuiz] = useState('');
    const [quizType, setQuizType] = useState('');
    const [openFolders, setOpenFolders] = useState({});
    const [showFolderInput, setShowFolderInput] = useState(false);
    const [showSubfolderInput, setShowSubfolderInput] = useState(null);
    const [selectedSubfolder, setSelectedSubfolder] = useState(null);
    const [showQuizInputs, setShowQuizInputs] = useState(false);
    const [error, setError] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [renameQuiz, setRenameQuiz] = useState({ token: '', name: '' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await apiService.get('/api/getAllData');
            const data = response.data;
            const organizedData = organizeData(data);
            setFolders(organizedData);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to fetch data');
        }
    };

    const organizeData = (data) => {
        const organized = {};
        data.forEach(item => {
            if (!organized[item.folder_name]) {
                organized[item.folder_name] = { subfolders: [] };
            }
            if (item.subfolder_name) {
                const subfolderIndex = organized[item.folder_name].subfolders.findIndex(sf => sf.name === item.subfolder_name);
                if (subfolderIndex === -1) {
                    organized[item.folder_name].subfolders.push({
                        name: item.subfolder_name,
                        quizzes: item.quiz_name ? [{ name: item.quiz_name, type: item.quiz_type, token: item.token }] : []
                    });
                } else {
                    if (item.quiz_name) {
                        organized[item.folder_name].subfolders[subfolderIndex].quizzes.push({ name: item.quiz_name, type: item.quiz_type, token: item.token });
                    }
                }
            }
        });
        return organized;
    };

    const addFolder = async () => {
        if (newFolder.trim() !== '') {
            setFolders({ ...folders, [newFolder]: { subfolders: [] } });
            setNewFolder('');
            setShowFolderInput(false);
            try {
                await apiService.post('/api/addFolder', { folder: newFolder });
            } catch (error) {
                console.error('Error adding folder:', error);
                setError('Failed to add folder');
            }
        }
    };

    const addSubfolder = async (folder) => {
        if (newSubfolder.trim() !== '') {
            setFolders({
                ...folders,
                [folder]: {
                    ...folders[folder],
                    subfolders: [...folders[folder].subfolders, { name: newSubfolder, quizzes: [] }]
                }
            });
            setNewSubfolder('');
            setShowSubfolderInput(null);
            try {
                await apiService.post('/api/addSubfolder', { folder, subfolder: newSubfolder });
            } catch (error) {
                console.error('Error adding subfolder:', error);
                setError('Failed to add subfolder');
            }
        }
    };

    const handleAddQuizClick = () => {
        setShowQuizInputs(true);
    };

    const addQuiz = async (folder, subfolder) => {
        if (newQuiz.trim() !== '' && quizType !== '') {
            const token = uuidv4();
            const updatedSubfolders = folders[folder].subfolders.map((sf) => {
                if (sf.name === subfolder) {
                    return { ...sf, quizzes: [...sf.quizzes, { name: newQuiz, type: quizType, token }] };
                }
                return sf;
            });

            setFolders({
                ...folders,
                [folder]: {
                    ...folders[folder],
                    subfolders: updatedSubfolders
                }
            });
            setNewQuiz('');
            setQuizType('');
            setShowQuizInputs(false);
            try {
                await apiService.post('/api/addQuiz', { folder, subfolder, quiz: newQuiz, type: quizType, token });
            } catch (error) {
                console.error('Error adding quiz:', error);
                setError('Failed to add quiz');
            }
            navigate(`/hr_dash/edit/Create/${token}`);
        }
    };

    const toggleFolder = (folder) => {
        setOpenFolders(prevState => ({ ...prevState, [folder]: !prevState[folder] }));
    };

    const handleSubfolderClick = (folder, subfolder) => {
        setSelectedSubfolder({ folder, subfolder });
    };

    const handlePreviewClick = (quizToken) => {
        const url = `/quiz/preview/${quizToken}`;
        window.open(url, '_blank');
    };

    const handleRenameQuiz = (quizToken) => {
        const quiz = folders[selectedSubfolder.folder].subfolders
            .find(sf => sf.name === selectedSubfolder.subfolder)
            .quizzes.find(q => q.token === quizToken);

        setRenameQuiz({ token: quizToken, name: quiz.name });
    };

    const handleRenameChange = (e) => {
        setRenameQuiz({ ...renameQuiz, name: e.target.value });
    };

    const handleRenameSubmit = async (e) => {
        e.preventDefault();
        const updatedSubfolders = folders[selectedSubfolder.folder].subfolders.map((sf) => {
            if (sf.name === selectedSubfolder.subfolder) {
                return {
                    ...sf,
                    quizzes: sf.quizzes.map((q) => (q.token === renameQuiz.token ? { ...q, name: renameQuiz.name } : q))
                };
            }
            return sf;
        });

        setFolders({
            ...folders,
            [selectedSubfolder.folder]: {
                ...folders[selectedSubfolder.folder],
                subfolders: updatedSubfolders
            }
        });

        setRenameQuiz({ token: '', name: '' });

        try {
            await apiService.put(`/api/renameQuiz/${renameQuiz.token}`, { token: renameQuiz.token, name: renameQuiz.name });
        } catch (error) {
            console.error('Error renaming quiz:', error);
            setError('Failed to rename quiz');
        }
    };

    const Modal = ({ message, onClose }) => {
        if (!message) return null;

        return (
            <div
                style={{
                    position: "fixed",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: "1000"
                }}
                onClick={onClose}
            >
                <div
                    style={{
                        backgroundColor: "#fff",
                        padding: "20px",
                        borderRadius: "8px",
                        width: "400px",
                        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
                        textAlign: "center"
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <p>{message}</p>
                    <button
                        style={{
                            padding: "5px 10px",
                            backgroundColor: "#007bff",
                            border: "none",
                            borderRadius: "5px",
                            color: "#fff",
                            cursor: "pointer",
                            transition: "background-color 0.3s ease"
                        }}
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    };

    const handleDeleteQuiz = async (quizToken) => {
        const updatedSubfolders = folders[selectedSubfolder.folder].subfolders.map((sf) => {
            if (sf.name === selectedSubfolder.subfolder) {
                return {
                    ...sf,
                    quizzes: sf.quizzes.filter((q) => q.token !== quizToken)
                };
            }
            return sf;
        });

        setFolders({
            ...folders,
            [selectedSubfolder.folder]: {
                ...folders[selectedSubfolder.folder],
                subfolders: updatedSubfolders
            }
        });

        try {
            await apiService.delete(`/api/deleteQuiz/${quizToken}`);
        } catch (error) {
            console.error('Error deleting quiz:', error);
            setError('Failed to delete quiz');
        }
    };

    const handleDropdownSelect = (option, quizToken) => {
        switch (option) {
            case 'rename':
                handleRenameQuiz(quizToken);
                break;
            case 'delete':
                handleDeleteQuiz(quizToken);
                break;
            default:
                break;
        }
        setDropdownOpen(null);
    };

    return (
        <>
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                height: "100%",
                backgroundColor: "#f8f9fa",
                paddingTop: "50px",
                height: "700px"
            }}>
                <div style={{
                    display: "flex",
                    backgroundColor: "#fff",
                    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
                    borderRadius: "8px",
                    overflow: "hidden",
                    width: "90%",
                    height: "80%"
                }}>
                    <div
                        style={{
                            backgroundColor: "#343a40",
                            color: "#fff",
                            width: isPanelOpen ? "300px" : "50px",
                            minWidth: "250px",
                            overflowY: "scroll",
                            transition: "width 0.3s ease",
                            padding: "10px"
                        }}
                    >
                        <ul style={{
                            listStyleType: "none",
                            paddingLeft: "0",
                            marginTop: "30px"
                        }}>
                            {Object.keys(folders).map((folder, index) => (
                                <li key={index}>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: "10px",
                                            backgroundColor: "#495057",
                                            borderRadius: "5px",
                                            cursor: "pointer",
                                            transition: "background-color 0.3s ease"
                                        }}
                                        onClick={() => toggleFolder(folder)}
                                    >
                                        {folder}
                                        <FontAwesomeIcon icon={openFolders[folder] ? faChevronDown : faPlus} className="Q_toggle-icon" />
                                    </div>
                                    {openFolders[folder] && (
                                        <ul style={{
                                            listStyleType: "none",
                                            paddingLeft: "20px",
                                            marginTop: "10px"
                                        }}>
                                            {folders[folder].subfolders.map((subfolder, subIndex) => (
                                                <li key={subIndex}>
                                                    <div
                                                        style={{
                                                            padding: "5px 10px",
                                                            backgroundColor: "#6c757d",
                                                            borderRadius: "5px",
                                                            cursor: "pointer",
                                                            transition: "background-color 0.3s ease"
                                                        }}
                                                        onClick={() => handleSubfolderClick(folder, subfolder.name)}
                                                    >
                                                        {subfolder.name}
                                                    </div>
                                                </li>
                                            ))}
                                            {showSubfolderInput === folder ? (
                                                <div style={{
                                                    marginTop: "10px",
                                                    display: "flex",
                                                    alignItems: "center"
                                                }}>
                                                    <input
                                                        type="text"
                                                        style={{
                                                            padding: "5px",
                                                            borderRadius: "5px",
                                                            border: "1px solid #ced4da",
                                                            marginRight: "10px",
                                                            width: "150px"
                                                        }}
                                                        value={newSubfolder}
                                                        onChange={(e) => setNewSubfolder(e.target.value)}
                                                        placeholder="New subfolder name"
                                                    />
                                                    <button
                                                        style={{
                                                            padding: "5px 10px",
                                                            backgroundColor: "#28a745",
                                                            border: "none",
                                                            borderRadius: "5px",
                                                            color: "#fff",
                                                            cursor: "pointer",
                                                            transition: "background-color 0.3s ease"
                                                        }}
                                                        onClick={() => addSubfolder(folder)}
                                                    >
                                                        Add
                                                    </button>
                                                    <button
                                                        style={{
                                                            background: "none",
                                                            border: "none",
                                                            color: "#dc3545",
                                                            cursor: "pointer",
                                                            fontSize: "18px",
                                                            marginLeft: "10px",
                                                            transition: "color 0.3s ease"
                                                        }}
                                                        onClick={() => setShowSubfolderInput(null)}
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    style={{
                                                        background: "none",
                                                        border: "none",
                                                        color: "#28a745",
                                                        cursor: "pointer",
                                                        fontSize: "18px",
                                                        transition: "color 0.3s ease"
                                                    }}
                                                    onClick={() => setShowSubfolderInput(folder)}
                                                >
                                                    <FontAwesomeIcon icon={faPlus} />
                                                </button>
                                            )}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <div style={{
                            marginTop: "10px",
                            display: "flex",
                            alignItems: "center"
                        }}>
                            {showFolderInput ? (
                                <>
                                    <input
                                        type="text"
                                        style={{
                                            padding: "5px",
                                            borderRadius: "5px",
                                            border: "1px solid #ced4da",
                                            marginRight: "10px",
                                            width: "150px"
                                        }}
                                        value={newFolder}
                                        onChange={(e) => setNewFolder(e.target.value)}
                                        placeholder="New folder name"
                                    />
                                    <button
                                        style={{
                                            padding: "5px 10px",
                                            backgroundColor: "#28a745",
                                            border: "none",
                                            borderRadius: "5px",
                                            color: "#fff",
                                            cursor: "pointer",
                                            transition: "background-color 0.3s ease"
                                        }}
                                        onClick={addFolder}
                                    >
                                        Add
                                    </button>
                                    <button
                                        style={{
                                            background: "none",
                                            border: "none",
                                            color: "#dc3545",
                                            cursor: "pointer",
                                            fontSize: "18px",
                                            marginLeft: "10px",
                                            transition: "color 0.3s ease"
                                        }}
                                        onClick={() => setShowFolderInput(false)}
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </>
                            ) : (
                                <button
                                    style={{
                                        background: "none",
                                        border: "none",
                                        color: "#28a745",
                                        cursor: "pointer",
                                        fontSize: "18px",
                                        transition: "color 0.3s ease"
                                    }}
                                    onClick={() => setShowFolderInput(true)}
                                >
                                    <FontAwesomeIcon icon={faPlus} />
                                </button>
                            )}
                        </div>
                    </div>
                    <div style={{
                        flex: "1",
                        padding: "20px",
                        overflowY: "auto"
                    }}>
                        {selectedSubfolder ? (
                            <div style={{
                                backgroundColor: "#f8f9fa",
                                borderRadius: "8px",
                                padding: "20px",
                                boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)"
                            }}>
                                <h3 style={{ marginBottom: "20px", color: "#343a40" }}>
                                    {selectedSubfolder.folder}/{selectedSubfolder.subfolder}
                                </h3>
                                <div style={{
                                    display: "flex",
                                    width: "300px",
                                    alignItems: "center",
                                    marginTop: "10px"
                                }}>
                                    {showQuizInputs ? (
                                        <>
                                            <select
                                                style={{
                                                    padding: "5px",
                                                    borderRadius: "5px",
                                                    border: "1px solid #ced4da",
                                                    marginRight: "10px",
                                                    backgroundColor: "#fff",
                                                    color: "#343a40",
                                                    width: "150px"
                                                }}
                                                value={quizType}
                                                onChange={(e) => setQuizType(e.target.value)}
                                            >
                                                <option style={{ padding: "5px", backgroundColor: "#fff", color: "#343a40" }} value="">Quiz Type</option>
                                                <option style={{ padding: "5px", backgroundColor: "#fff", color: "#343a40" }} value="live">Live</option>
                                                <option style={{ padding: "5px", backgroundColor: "#fff", color: "#343a40" }} value="static">Static</option>
                                            </select>
                                            {quizType && (
                                                <>
                                                    <input
                                                        type="text"
                                                        style={{
                                                            padding: "5px",
                                                            borderRadius: "5px",
                                                            border: "1px solid #ced4da",
                                                            marginRight: "10px",
                                                            width: "250px"
                                                        }}
                                                        value={newQuiz}
                                                        onChange={(e) => setNewQuiz(e.target.value)}
                                                        placeholder="New quiz name"
                                                    />
                                                    <button
                                                        style={{
                                                            padding: "5px 10px",
                                                            backgroundColor: "#28a745",
                                                            border: "none",
                                                            borderRadius: "5px",
                                                            color: "#fff",
                                                            cursor: "pointer",
                                                            transition: "background-color 0.3s ease",
                                                            width: "300px"
                                                        }}
                                                        onClick={() => addQuiz(selectedSubfolder.folder, selectedSubfolder.subfolder)}
                                                    >
                                                        Add
                                                    </button>
                                                    <button
                                                        style={{
                                                            background: "none",
                                                            border: "none",
                                                            color: "#dc3545",
                                                            cursor: "pointer",
                                                            fontSize: "18px",
                                                            marginLeft: "10px",
                                                            transition: "color 0.3s ease"
                                                        }}
                                                        onClick={() => setShowQuizInputs(false)}
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} />
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <button
                                            onClick={handleAddQuizClick}
                                            style={{
                                                backgroundColor: '#007BFF',
                                                color: '#FFFFFF',
                                                border: 'none', 
                                                borderRadius: '4px',
                                                padding: '5px 10px',
                                                fontSize: '16px',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.3s ease', // Smooth background color transition
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'} // Darker blue on hover
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007BFF'} // Original blue on mouse out
                                        >
                                            New Quiz
                                        </button>

                                    )}
                                </div>
                                <table style={{
                                    width: "100%",
                                    borderCollapse: "collapse"
                                }}>
                                    <tbody style={{ backgroundColor: "#fff" }}>
                                        {folders[selectedSubfolder.folder].subfolders
                                            .find(sf => sf.name === selectedSubfolder.subfolder)
                                            .quizzes.map((quiz, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        {renameQuiz.token === quiz.token ? (
                                                            <form onSubmit={handleRenameSubmit}>
                                                                <input
                                                                    type="text"
                                                                    value={renameQuiz.name}
                                                                    onChange={handleRenameChange}
                                                                    onBlur={() => setRenameQuiz({ token: '', name: '' })}
                                                                    autoFocus
                                                                />
                                                            </form>
                                                        ) : (
                                                            <Link
                                                                style={{
                                                                    color: "#007bff",
                                                                    textDecoration: "none",
                                                                    cursor: "pointer",
                                                                    transition: "color 0.3s ease"
                                                                }}
                                                                to={`/hr_dash/edit/create/${quiz.token}`}
                                                            >
                                                                {quiz.name}
                                                            </Link>
                                                        )}
                                                    </td>
                                                    <td style={{ color: "#6c757d" }}>{quiz.type}</td>
                                                    <td>{quiz.status}</td>
                                                    <td>
                                                        <button
                                                            style={{
                                                                backgroundColor: "#6baff9",
                                                                margin: "5px",
                                                                borderRadius: "5px",
                                                                border: "black 1px solid",
                                                                width: "100px",
                                                                padding: "4px"
                                                            }}
                                                            onClick={() => handlePreviewClick(quiz.token)}
                                                        >
                                                            Preview
                                                        </button>
                                                        <div style={{
                                                            position: "relative",
                                                            display: "inline-block"
                                                        }}>
                                                            <button
                                                                style={{
                                                                    backgroundColor: "#6baff9",
                                                                    margin: "5px",
                                                                    borderRadius: "5px",
                                                                    border: "black 1px solid",
                                                                    width: "100px",
                                                                    padding: "4px"
                                                                }}
                                                                onClick={() => setDropdownOpen(dropdownOpen === quiz.token ? null : quiz.token)}
                                                            >
                                                                Options
                                                            </button>
                                                            {dropdownOpen === quiz.token && (
                                                                <div style={{
                                                                    display: "flex",
                                                                    flexDirection: "column",
                                                                    position: "absolute",
                                                                    top: "100%",
                                                                    right: "0",
                                                                    backgroundColor: "#fff",
                                                                    border: "1px solid #ddd",
                                                                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                                                                    zIndex: "1000"
                                                                }}>
                                                                    <button
                                                                        style={{
                                                                            border: "none",
                                                                            background: "none",
                                                                            padding: "8px 16px",
                                                                            textAlign: "left",
                                                                            cursor: "pointer",
                                                                            width: "100%",
                                                                            transition: "background-color 0.3s ease"
                                                                        }}
                                                                        onClick={() => handleDropdownSelect('rename', quiz.token)}
                                                                    >
                                                                        Rename
                                                                    </button>
                                                                    <button
                                                                        style={{
                                                                            border: "none",
                                                                            background: "none",
                                                                            padding: "8px 16px",
                                                                            textAlign: "left",
                                                                            cursor: "pointer",
                                                                            width: "100%",
                                                                            transition: "background-color 0.3s ease"
                                                                        }}
                                                                        onClick={() => handleDropdownSelect('delete', quiz.token)}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div
                                style={{
                                    backgroundColor: "#f8f9fa",
                                    borderRadius: "8px",
                                    padding: "20px",
                                    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)"
                                }}
                            >

                            </div>

                        )}
                    </div>
                    {error && <p style={{ color: "#dc3545", fontWeight: "bold", marginTop: "20px" }}>{error}</p>}
                </div>
            </div>
        </>
    );
};

export default QuizDash;
