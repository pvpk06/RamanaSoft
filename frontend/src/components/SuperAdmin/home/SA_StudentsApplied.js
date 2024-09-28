import React, { useMemo, useState, useEffect } from 'react';
import { useTable, useSortBy, useGlobalFilter, usePagination } from 'react-table';
import { Link } from 'react-router-dom'
import { FaFilePdf } from "react-icons/fa";
import * as XLSX from 'xlsx';
import SAStatusCell from './SA_StatusCell';
import { Container, Row, Col, Button, Form, Table } from 'react-bootstrap'; 
import apiService from '../../../apiService';

const JobApplicationsTable = () => {
  const [data, setData] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");

  useEffect(() => {

    const fetchData = async () => {
      try {
        const url = selectedCompany 
          ? `/api/applications?companyName=${selectedCompany}`
          : `/api/applications`;
    
        const response = await apiService.get(url);
        console.log("Fetched Data:", response.data);
        setData(response.data.map(item => ({ ...item, isEditing: false })));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, [selectedCompany]);
  
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await apiService.get('/api/view-companies');
        console.log("response:", response)
        console.log(response.data)
        setCompanies(response.data);
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    console.log("Data State:", data);
  }, [data]);
  
  useEffect(() => {
    console.log("Companies State:", companies);
  }, [companies]);


  const updateStatus = async (applicationIDs, status) => {
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
        <Link style={{ textDecoration: 'none', color: '#53289e', fontWeight: '800' }} to={`/SA_dash/student/${row.original.candidateID}`}>
          {row.original.fullName}
        </Link>
      )
    },
    { Header: 'Contact Number', accessor: 'mobileNo' },
    { Header: 'Email', accessor: 'email' },
    { Header: 'Job Role', accessor: 'jobRole' },
    { Header: 'Job ID', accessor: 'jobID' },
    { Header: 'Company Name', accessor: 'companyName' },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ row, value }) => (
        <SAStatusCell
          value={value}
          row={{ ...row, toggleEditing }}
          updateStatus={updateStatus}
          isEditing={row.original.isEditing}
        />
      ),
      CellProps: { style: { textAlign: "center" } }

    },
    { Header: 'Y.O.P', accessor: 'passedOut' },
    { Header: 'Gender', accessor: 'gender' },
    { Header: 'Experience', accessor: 'experience' },
    { Header: 'Resume', accessor: 'resume', disableSortBy: true }
  ], [selectedIds, data]);

  const memoData = useMemo(() => data, [data]);
  const downloadExcel = (completeData = false) => {

    const dataToExport = completeData ? memoData : page;
    console.log("Memo:", memoData);
    console.log("Page data:", page)
    // Map the data to include only the necessary columns
    const exportData = dataToExport.map(row => {
      const rowData = {};
      memoColumns.forEach(column => {
        if (column.accessor !== 'resume' && column.accessor !== 'selection') {
          rowData[column.Header] = row.original
            ? row.original[column.accessor] // Use row.original if available
            : row[column.accessor] || ''; // Fallback to row[column.accessor]
        }
      });

      return rowData;
    });

    console.log("Exported", exportData); // Debugging: Check the mapped data


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
      console.log(url);
      console.log("Request URL:", url);
      const response = await apiService.getWithResponseType(url, 'blob');
      console.log("Resp", response);
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      console.log("Content", contentType)
      let extension = 'pdf';
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
    { columns: memoColumns, data: memoData, initialState: { pageSize: 10 } },
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
  console.log(selectedCompany)
  return (
    <div style={{overflowX:"hidden"}}>
      <Container fluid className='py-5' style={{ fontFamily: 'Calibri', width: '79vw' }}>
        <Row className='mb-3'>
          <Col>
            <h1>Students Applied</h1>
          </Col>
        </Row>
        <Row className='mb-3'>
          <Col md={6}>
            <div className='d-flex align-items-center'>
              <p className='fw-bold me-2' style={{ fontSize: '20px' }}>
                Show
              </p>
              <Form.Select
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
                className='me-2'
                style={{ width: 'auto' }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Form.Select>
              <p className='fw-bold' style={{ fontSize: '20px' }}>
                entries
              </p>
            </div>
          </Col>
          <Col md={6} className='d-flex justify-content-end align-items-center'>
            <Form.Label className='me-2 mb-0' style={{ fontSize: '20px', fontWeight: 'bold' }}>Search:</Form.Label>
            <Form.Control
              type="search"
              value={globalFilter || ''}
              onChange={e => setGlobalFilter(e.target.value || undefined)}
              placeholder="Search all columns"
              style={{ marginBottom: '10px', padding: '5px', height: '30px', border: '1px solid #737478', outline: 'none', borderRadius: '5px' }}
            />
          </Col>
        </Row>
        <Row className="mb-3 d-flex justify-content-between">
        <Col md={6} xs={10}>
            <Button onClick={() => downloadExcel(false)} style={{ height: '40px', marginRight: '10px', backgroundColor: '#6cde37', border: 'none', borderRadius: '5px', color: '#ffffff', fontWeight: 'bold',marginBottom:'5px' }}>
              Download Current Page as Excel
            </Button>
            <Button onClick={() => downloadExcel(true)} style={{ height: '40px', backgroundColor: '#37a6de', marginRight: '10px', border: 'none', borderRadius: '5px', color: '#ffffff', fontWeight: 'bold',marginBottom:'5px'}}>
              Download Complete Data as Excel
            </Button>
          </Col>
          <Col md={6} xs={8} lg={4} className="d-flex justify-content-end">

            <select onChange={(e) => updateStatus(selectedIds, e.target.value)} className='me-2' style={{ height: '30px', border: '1px solid #737478', outline: 'none', borderRadius: '2px' }}>
              <option value="">Change Status</option>
              <option value="applied">Applied</option>
              <option value="qualified">Qualified</option>
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
          </Col>
          <Col md={6} className='d-flex '>
            <div>
              <Form.Select
                value={selectedCompany}
                onChange={e => setSelectedCompany(e.target.value)}
                className='py-1 ps-3'
                style={{ border: '1px solid black', fontFamily: 'Calibri', fontWeight: '600', width: '250px' }}
              >
                <option value=''>Select a Company</option>
                {companies.map(company => (
                  <option key={company.companyID} value={company.companyName}>{company.companyName}</option>
                ))}
              </Form.Select>
            </div>
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
        <Row className='d-flex justify-content-between mt-3'>
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
    </div>
  );
};

export default JobApplicationsTable;