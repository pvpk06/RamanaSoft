import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useTable, useSortBy, useGlobalFilter, usePagination } from 'react-table';
import { Link } from 'react-router-dom'
import { FaFilePdf } from "react-icons/fa";
import * as XLSX from 'xlsx';
import StatusCell from './StatusCell';
import { Container, Row, Col, Button, Form, Table } from 'react-bootstrap';
import Cookies from 'js-cookie'
import apiService from '../../../../apiService';

const HrId = Cookies.get('HRid')
const JobApplicationsTable = () => {
  const [data, setData] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [jobsInCompany, setJobs] = useState([])
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownValue, setDropdownValue] = useState('changeStatus');
  const [jobIdFilter, setJobIdFilter] = useState('');
  const [showJobIdDropdown, setShowJobIdDropdown] = useState(false);
  const [companyNameFilter, setCompanyNameFilter] = useState('');
  const [showCompanyNameDropdown, setShowCompanyNameDropdown] = useState(false);

  const jobIdRef = useRef(null);
  const companyNameRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (jobIdRef.current && !jobIdRef.current.contains(event.target)) {
        setShowJobIdDropdown(false);
      }
      if (companyNameRef.current && !companyNameRef.current.contains(event.target)) {
        setShowCompanyNameDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredJobs = jobsInCompany.filter(job =>
    `${job.jobId} - ${job.jobTitle} - ${job.companyName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.get(`/api/hr-view-jobs-company?hrId=${HrId}`); // Adjust the URL as needed
        setJobs(response.data.map(item => ({ ...item, isEditing: false })));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const fetchJobData = useCallback(async () => {
    try {
      let url = `/api/hr-job-applications?hrId=${HrId}`;
      const response = await apiService.get(url);
      const fetchedData = response.data.map(item => ({ ...item, isEditing: false }));
      setData(fetchedData);
      setOriginalData(fetchedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    fetchJobData();
  }, [fetchJobData]);


  const handleResetFilters = useCallback(() => {
    setGlobalFilter('');
    setJobIdFilter('');
    setCompanyNameFilter('');
    setShowJobIdDropdown(false);
    setShowCompanyNameDropdown(false);
    setData(originalData);
  }, [originalData]);

  const uniqueJobIds = useMemo(() => {
    return [...new Set(data.map(item => item.jobID))];
  }, [data]);

  const filteredJobIds = uniqueJobIds.filter(jobId =>
    jobId.toString().includes(jobIdFilter)
  );

  const uniqueCompanyNames = useMemo(() => {
    return [...new Set(data.map(item => item.companyName))];
  }, [data]);

  const filteredCompanyNames = uniqueCompanyNames.filter(companyName =>
    companyName.toLowerCase().includes(companyNameFilter.toLowerCase())
  );

  const handleSelectJob = (jobId) => {
    setSelectedJob(jobId);
    setSearchTerm(
      `${jobsInCompany.find(job => job.jobId === jobId).jobTitle} - ${jobsInCompany.find(job => job.jobId === jobId).companyName}`
    );
    setShowDropdown(false);
  };

  const handleJobIdSelect = (jobId) => {
    setJobIdFilter(jobId.toString());
    setShowJobIdDropdown(false);
    // Apply the filter to your data here
    const filteredData = data.filter(item => item.jobID === jobId);
    setData(filteredData);
  };

  const handleCompanyNameSelect = (companyName) => {
    setCompanyNameFilter(companyName);
    setShowCompanyNameDropdown(false);
    // Apply the filter to your data here
    const filteredData = data.filter(item => item.companyName === companyName);
    setData(filteredData);
  };


  const updateStatus = async (applicationIDs, status) => {
    if (status !== 'changeStatus') {
      try {
        await apiService.put('/api/applications/status', { status, ids: applicationIDs });
        if (Array.isArray(applicationIDs)) {
          setData(prevData => prevData.map(app =>
            applicationIDs.includes(app.applicationID) ? { ...app, status, isEditing: false } : app
          ));
          setSelectedIds([]);
        } else {
          setData(prevData => prevData.map(app => app.applicationID === applicationIDs ? { ...app, status, isEditing: false } : app))
        }
      } catch (error) {
        console.error('Error updating status:', error);
      }
      setDropdownValue('changeStatus')
    }
  };
  
  const toggleEditing = (applicationID) => {
    setData(prevData => prevData.map(app =>
      app.applicationID === applicationID ? { ...app, isEditing: !app.isEditing } : app
    ));
  };

  const handleCheckboxChange = (applicationID) => {
    setSelectedIds(prevSelectedIds => {
      if (prevSelectedIds.includes(applicationID)) {
        return prevSelectedIds.filter(id => id !== applicationID);
      } else {
        return [...prevSelectedIds, applicationID];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map(app => app.applicationID));
    }
  };

  const memoColumns = useMemo(() => [
    {
      Header: (
        <Form.Check
          type="checkbox"
          onChange={handleSelectAll}
          checked={selectedIds.length === data.length && data.length > 0}
        />
      ),
      accessor: 'selection',
      Cell: ({ row }) => (
        <Form.Check
          type="checkbox"
          checked={selectedIds.includes(row.original.applicationID)}
          onChange={() => handleCheckboxChange(row.original.applicationID)}
        />
      ),
      disableSortBy: true,
      disableGlobalFilter: true,
    },
    { Header: 'ID', accessor: 'candidateID' },
    {
      Header: 'Full Name', accessor: 'fullName',
      Cell: ({ row }) => (
        <Link style={{ textDecoration: 'none', color: '#53289e', fontWeight: '800' }} to={`/HR_dash/student/${row.original.candidateID}`}>
          {row.original.fullName}
        </Link>
      )
    },
    { Header: 'Contact Number', accessor: 'mobileNo' },
    { Header: 'Email', accessor: 'email' },
    { Header: 'Job ID', accessor: 'jobID' },
    { Header: 'Job Role', accessor: 'jobRole' ,
      Cell:({row})=>(
        <Link  style={{textDecoration:'none',color:'#53289e',fontWeight:'800'}} to={`/hr_dash/job_desc/${row.original.JobId}`}>{row.original.jobRole}</Link>
      )
    },
    { Header: 'Company Name', accessor: 'companyName' },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ row, value }) => (
        console.log("Row", row),
        console.log("value ", value),
        <StatusCell
          value={value}
          row={{ ...row, toggleEditing }}
          updateStatus={updateStatus}
          isEditing={row.original.isEditing}
        />
      )
    },
    { Header: 'Y.O.P', accessor: 'passedOut' },
    { Header: 'Gender', accessor: 'gender' },
    { Header: 'Experience', accessor: 'experience' },
    { Header: 'Resume', accessor: 'resume', disableSortBy: true }
  ], [selectedIds]);

  const memoData = useMemo(() => data, [data]);



  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    setGlobalFilter,
    state,
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize
  } = useTable(
    { columns: memoColumns, data: memoData, initialState: { pageSize: 10 }, autoResetPage: false, autoResetSortBy: false, autoResetFilters: false, },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const { globalFilter, pageIndex, pageSize } = state;
  console.log("Data:", data);
  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 0; i < pageCount; i++) {
      pageNumbers.push(
        <Button
          key={i}
          onClick={() => gotoPage(i)}
          style={{
            margin: '0 5px', outline: 'none', border: '1px solid #515357', fontWeight: '600',
            borderRadius: '2px', color: '#ffffff', padding: '5px 10px', cursor: 'pointer', backgroundColor: i === pageIndex ? '#416cb0' : '#9499a1'
          }}
        >
          {i + 1}
        </Button>
      );
    }
    return pageNumbers;
  };


  const downloadExcel = (completeData = false) => {
    const dataToExport = completeData ? memoData : page;
    console.log("Memo:", memoData);
    console.log("Page data:", page)
    const exportData = dataToExport.map(row => {
      const rowData = {};
      memoColumns.forEach(column => {
        if (column.accessor !== 'resume' && column.accessor !== 'selection') {
          rowData[column.Header] = row.original
            ? row.original[column.accessor]
            : row[column.accessor] || '';
        }
      });
      return rowData;
    });
    console.log("Exported", exportData);
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Job Applications');
    const fileName = `JobApplications${completeData ? '_Complete' : ''}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleResumeDownload = async (applicationId) => {
    try {
      console.log("Id:", applicationId);
      const url = `/api/download-resume/${applicationId.applicationID}`;
      console.log("Request URL:", url); // Log the URL for debugging
      const response = await apiService.getWithResponseType(url, 'blob');
      console.log("Resp", response);
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      console.log("Content", contentType)
      let extension = 'pdf'; // Default extension
      if (contentType.includes('application/pdf')) {
        extension = 'pdf';
      } else if (contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        extension = 'docx';
      } else if (contentType.includes('application/msword')) {
        extension = 'doc';
      }
      const blob = new Blob([response.data], { type: contentType });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `resume-${applicationId.fullName}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl); // Clean up
    } catch (error) {
      console.error('Error downloading the file:', error);
    }
  };


  return (
    <>
      <Container className='p-1' style={{ fontFamily: 'Calibri', width: '78vw' }}>
        <Row className='mb-3'>
          <Col >
            <h1>Students Applied</h1>
          </Col>
        </Row>
        <Row className='mb-3'>
          <Row style={{ display: 'flex', marginTop: '10px' }}>
            <Col md={2}>
              <Form.Control
                type="search"
                value={globalFilter}
                onChange={e => setGlobalFilter(e.target.value)}
                placeholder="Search all columns"
                style={{
                  fontSize: '16px',
                  padding: '5px',
                  height: '34px',
                  width: "100%",
                  border: '1px solid #ced4da',
                  borderRadius: '4px'
                }}
              />
            </Col>

            <Col md={2}>
              <div ref={jobIdRef} style={{ width: '100%', maxWidth: '250px' }}>
                <Form.Control
                  type="text"
                  placeholder="Search Job ID"
                  value={jobIdFilter}
                  onChange={(e) => setJobIdFilter(e.target.value)}
                  onFocus={() => setShowJobIdDropdown(true)}
                  style={{
                    fontSize: '16px',
                    padding: '5px',
                    height: '34px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px'
                  }}
                />
                {showJobIdDropdown && (
                  <ul style={{
                    position: 'absolute',
                    zIndex: 400,
                    backgroundColor: 'white',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    width: '13%',
                    listStyleType: 'none',
                    padding: 0,
                    margin: 0
                  }}>
                    {filteredJobIds.length > 0 ? (
                      filteredJobIds.map(jobId => (
                        <li
                          key={jobId}
                          onClick={() => handleJobIdSelect(jobId)}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f1f1f1'
                          }}
                        >
                          {jobId}
                        </li>
                      ))
                    ) : (
                      <li style={{
                        padding: '8px 12px',
                        color: '#ff4d4f',
                        textAlign: 'center',
                        fontWeight: 'bold'
                      }}>
                        No data found
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </Col>

            <Col md={2}>
              <div ref={companyNameRef} style={{ position: 'relative', width: '100%', maxWidth: '250px' }}>
                <Form.Control
                  type="text"
                  placeholder="Search Company Name"
                  value={companyNameFilter}
                  onChange={(e) => setCompanyNameFilter(e.target.value)}
                  onFocus={() => setShowCompanyNameDropdown(true)}
                  style={{
                    fontSize: '16px',
                    padding: '5px',
                    height: '34px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px'
                  }}
                />
                {showCompanyNameDropdown && (
                  <ul style={{
                    position: 'absolute',
                    zIndex: 400,
                    backgroundColor: 'white',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    width: '100%',
                    listStyleType: 'none',
                    padding: 0,
                    margin: 0
                  }}>
                    {filteredCompanyNames.length > 0 ? (
                      filteredCompanyNames.map(companyName => (
                        <li
                          key={companyName}
                          onClick={() => handleCompanyNameSelect(companyName)}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f1f1f1'
                          }}
                        >
                          {companyName}
                        </li>
                      ))
                    ) : (
                      <li style={{
                        padding: '8px 12px',
                        color: '#ff4d4f',
                        textAlign: 'center',
                        fontWeight: 'bold'
                      }}>
                        No data found
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </Col>
            <Col md={4}>
              <Button variant="secondary" onClick={handleResetFilters}>Reset Filters</Button>
            </Col>
          </Row>
        </Row>
        <Row className="mb-3 d-flex justify-content-between">
          <Col md={6} xs={10}>

            <Button onClick={() => downloadExcel(false)} style={{ height: '40px', marginRight: '10px', backgroundColor: '#6cde37', border: 'none', borderRadius: '5px', color: '#ffffff', fontWeight: 'bold', marginBottom: '5px' }}>
              Download Current Page as Excel
            </Button>
            <Button onClick={() => downloadExcel(true)} style={{ height: '40px', backgroundColor: '#37a6de', marginRight: '10px', border: 'none', borderRadius: '5px', color: '#ffffff', fontWeight: 'bold', marginBottom: '5px' }}>
              Download Complete Data as Excel
            </Button>
          </Col>
          <div className='d-flex align-items-center'>
            <p className='fw-bold me-2 mb-0' style={{ fontSize: '18px' }}>Show</p>
            <Form.Select
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
              className='me-2'
              style={{
                width: '80px',
                fontSize: '16px',
                padding: '5px',
                height: '34px',
                border: '1px solid #ced4da',
                borderRadius: '4px'
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Form.Select>
            <p className='fw-bold mb-0' style={{ fontSize: '18px' }}>entries</p>
          </div>
          {selectedIds.length > 0 && <Col md={6} xs={8} lg={4} className="d-flex justify-content-end">
            <select onChange={(e) => updateStatus(selectedIds, e.target.value)} className='me-2' style={{ height: '30px', border: '1px solid #737478', outline: 'none', borderRadius: '2px', fontSize: '12px' }}>
              <option value="changeStatus">Change Status</option>
              <option value="applied">Applied</option>
              <option value="qualified">Qualified</option>
              <option value="not-qualified">Not Qualified</option>
              <option value="placed">Placed</option>
              <option value="not-placed">Not Placed</option>
              <option value="not-attended">Not Attended</option>
              <option value="not-interested">Not Interested</option>
              <option value="not-eligible">Not Eligible</option>
              <option value="eligible">Eligible/Profile Sent</option>
              <option value="under-progress">Yet to Receive Feedback</option>
              <option value="level-1">Level 1</option>
              <option value="level-2">Level 2</option>
              <option value="level-3">Level 3</option>

            </select>
          </Col>}
        </Row>

        <Row>
          <Col sm={12} md={6} className='d-flex '>


            {jobsInCompany.length > 0 && <div style={{ width: '50%', marginRight: '10px', position: 'relative', marginBottom: '10px' }}>
              <input
                type="search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setShowDropdown(false)}
                placeholder="Search Jobs"
                className="py-1 ps-3"
                style={{
                  width: '100%',
                  border: '1px solid black',
                  fontFamily: 'Calibri',
                  fontWeight: '600',
                }}
              />
              {showDropdown && filteredJobs.length > 0 && (
                <ul
                  style={{
                    position: 'absolute',
                    zIndex: '1000',
                    width: '100%', // Ensure it takes the full width of the parent
                    backgroundColor: '#ffffff',
                    border: '1px solid black',
                    borderTop: 'none',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    listStyleType: 'none',
                    margin: '0',
                    padding: '0',
                  }}
                >
                  {filteredJobs.map(job => (
                    <li
                      key={job.jobId}
                      onMouseDown={() => handleSelectJob(job.jobId)} // onMouseDown to prevent onBlur from hiding dropdown
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                      }}
                    >
                      {job.jobId} - {job.jobTitle} - {job.companyName}
                    </li>
                  ))}
                </ul>
              )}
            </div>}


          </Col>
        </Row>
        <Row>
          <Col>{
            data.length > 0 ? (<Table {...getTableProps()} bordered hover responsive className='table-striped'>
              <thead className='table-dark'>
                {headerGroups.map(headerGroup => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(column => (
                      <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                        {column.render('Header')}
                        <span>
                          {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {page.map(row => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map(cell => {
                        if (cell.column.id === 'resume') {
                          return (
                            <td {...cell.getCellProps()}>
                              <FaFilePdf
                                onClick={() => handleResumeDownload(row.original)}
                                style={{ cursor: 'pointer' }}
                                size={20}
                              />
                            </td>
                          );
                        }
                        return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </Table>) : (<p>No data to show</p>)
          }
          </Col>
        </Row>

        <Row>
          <Col md={4} style={{ width: '70%' }}>
            <Button onClick={() => previousPage()} disabled={!canPreviousPage} className='btn btn-secondary'>
              Previous
            </Button>
            {renderPageNumbers()}
            <Button onClick={() => nextPage()} disabled={!canNextPage} className='btn btn-secondary ms-2'>
              Next
            </Button>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default JobApplicationsTable;