import React, { useMemo, useState, useEffect } from 'react';
import { useTable, useSortBy, useGlobalFilter, usePagination } from 'react-table';
import { Link } from 'react-router-dom';
import { FaFilePdf } from "react-icons/fa";
import * as XLSX from 'xlsx';
import { Container, Row, Col, Button, Form, Table } from 'react-bootstrap';
import apiService from '../../../../apiService';
const SAHrLeads = () => {
  const [data, setData] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.get('/api/view-companies');
        setData(response.data.map(item => ({ ...item, isEditing: false })));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const memoColumns = useMemo(() => [
    {Header:'Company ID',accessor:'companyID',
      
    },
    { Header: 'Company Name', accessor: 'companyName',
      Cell: ({ row }) => (
        <Link style={{textDecoration:'none',color:'#53289e',fontWeight:'500'}} to={`/sa_dash/companies/${row.original.companyID}`}>
          {row.original.companyName}
        </Link>
      )
     },
    { Header: 'Hr name', accessor: 'hrName' },
    { Header: 'Hr Email', accessor: 'email' },
    { Header: 'Mobile Number', accessor: 'mobileNo' },
    
    
    { Header: 'Address', accessor: 'address' },
    {Header:'Website',accessor:'website',Cell:({row})=>(
      <a href={row.original.website}>{row.original.website}</a>
    )},
    { Header: 'published Hr', accessor: 'publishedHrID' },
  ], [selectedIds, data]);

  const memoData = useMemo(() => data, [data]);

  const downloadExcel = (completeData = false) => {

    const dataToExport = completeData ? memoData : page;
    console.log("Memo:",memoData);
    console.log("Page data:",page)
    // Map the data to include only the necessary columns
    const exportData = dataToExport.map(row => {
        const rowData = {};
        memoColumns.forEach(column => {
          if (column.accessor !== 'resume' && column.accessor !== 'selection') {
              // Safely access row.original or row.values based on the structure
              rowData[column.Header] = row.original
                  ? row.original[column.accessor] // Use row.original if available
                  : row[column.accessor] || ''; // Fallback to row[column.accessor]
          }
      });

        return rowData;
    });

    console.log("Exported",exportData); // Debugging: Check the mapped data

  
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
      
      // Fetch the file with 'blob' response type
      const response = await apiService.getWithResponseType(url, 'blob');
      console.log("Response:", response);
  
      // Get the content type from headers
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      console.log("Content Type:", contentType);
      
      // Determine the file extension based on content type
      let extension = 'pdf'; // Default to PDF
      if (contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        extension = 'docx';
      } else if (contentType.includes('application/msword')) {
        extension = 'doc';
      }
      
      // Create a blob from the response data
      const blob = new Blob([response.data], { type: contentType });
      const blobUrl = window.URL.createObjectURL(blob);
  
      // Create an anchor element to trigger the download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `resume-${applicationId.fullName}.${extension}`;
      
      // Append the anchor to the document body, click it to download, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Revoke the blob URL to free up memory
      window.URL.revokeObjectURL(blobUrl);
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
    pageOptions,
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
          variant={i === pageIndex ? 'primary' : 'secondary'}
          style={{ margin: '0 5px', fontWeight: '600' }}
        >
          {i + 1}
        </Button>
      );
    }
    return pageNumbers;
  };

  return (
    <>
      <Container className="p-3" style={{width:'75vw'}}>
        <Row className="mb-3">
          <Col md={6} className="d-flex align-items-center">
            <p className="fw-bold" style={{ fontSize: '20px' }}>
              Show
              <Form.Select
                className="ms-2 me-2"
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
                style={{ width: 'auto', display: 'inline-block' }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Form.Select>
              entries
            </p>
          </Col>
          <Col md={6} className="d-flex justify-content-end align-items-center">
            <Form.Label className="me-2" style={{ fontSize: '20px', fontWeight: 'bold' }}>Search:</Form.Label>
            <Form.Control
              type="search"
              value={globalFilter || ''}
              onChange={e => setGlobalFilter(e.target.value || undefined)}
              placeholder="Search all columns"
              style={{ height: '30px', border: '1px solid #737478', outline: 'none', borderRadius: '2px' }}
            />
          </Col>
        </Row>
        <Row className="mb-3">
        <Col md={6} xs={10}>
            <Button onClick={() => downloadExcel(false)} style={{ height: '40px', marginRight: '10px', backgroundColor: '#6cde37', border: 'none', borderRadius: '5px', color: '#ffffff', fontWeight: 'bold',marginBottom:'5px' }}>
              Download Current Page as Excel
            </Button>
            <Button onClick={() => downloadExcel(true)} style={{ height: '40px', backgroundColor: '#37a6de', marginRight: '10px', border: 'none', borderRadius: '5px', color: '#ffffff', fontWeight: 'bold',marginBottom:'5px'}}>
              Download Complete Data as Excel
            </Button>
          </Col>

        </Row>
        <Row>
          <Col xs={12} lg={12}>
            <Table {...getTableProps()} striped bordered hover responsive>
              <thead>
                {headerGroups.map(headerGroup => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(column => (
                      <th {...column.getHeaderProps(column.getSortByToggleProps())} style={{ backgroundColor: '#416cb0', color: '#ffffff' }}>
                        {column.render('Header')}
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? ' 🔽'
                              : ' 🔼'
                            : ''}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              {data.length > 0 ? (
                <tbody {...getTableBodyProps()}>
                  {page.map(row => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map(cell => (
                          <td
                            {...cell.getCellProps()}
                            style={{ cursor: cell.column.id === 'resume' ? 'pointer' : 'default' }}
                            onClick={() => {
                              if (cell.column.id === 'resume') {
                                const jobId = row.original;
                                handleResumeDownload(jobId);
                              }
                            }}
                          >
                            {cell.column.id === 'resume' ? (
                              <div className='text-align-center d-flex justify-content-center'>
                                <FaFilePdf color='#2a97eb' />
                              </div>
                            ) : (
                              cell.render('Cell')
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              ) : (
                <tbody className="text-center w-100">
                  <tr><td colSpan={memoColumns.length}>No data to show</td></tr>
                </tbody>
              )}
            </Table>
          </Col>
        </Row>
        {data.length !== pageSize && (
          <Row className="mt-3">
            <Col className="d-flex justify-content-center">
              <Button style={{ color: '#ffffff', border: '1px solid #515357', borderRadius: '2px', backgroundColor: '#9499a1' }} onClick={() => previousPage()} disabled={!canPreviousPage}>&lt; Previous</Button>
              {renderPageNumbers()}
              <Button style={{ color: '#ffffff', border: '1px solid #515357', borderRadius: '2px', backgroundColor: '#9499a1' }} onClick={() => nextPage()} disabled={!canNextPage}>Next &gt;</Button>
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
};

export default SAHrLeads;
