import React, { useRef } from 'react';
import * as XLSX from 'xlsx';

const BulkUpload = ({ onBulkUpload }) => {
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const formattedData = formatData(json);
        onBulkUpload(formattedData);
      } catch (error) {
        console.error('Error parsing file:', error);
      }
    };

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };

    reader.readAsArrayBuffer(file);
  };

  const formatData = (json) => {
    const headers = json[0];
    const data = json.slice(1);

    const pages_data = [];
    let pageIndex = 1;
    let questionCount = 0;

    pages_data[pageIndex - 1] = { page_no: pageIndex, no_of_questions: 0, question_list: [] };

    data.forEach((row) => {
      if (!pages_data[pageIndex - 1]) {
        pages_data[pageIndex - 1] = { page_no: pageIndex, no_of_questions: 0, question_list: [] };
      }

      const question = {
        question_id: questionCount + 1,
        question_text: row[headers.indexOf('Question')],
        options_list: [
          row[headers.indexOf('Option1')],
          row[headers.indexOf('Option2')],
          row[headers.indexOf('Option3')],
          row[headers.indexOf('Option4')]
        ],
        correct_answer: row[headers.indexOf('Correct')]
      };

      pages_data[pageIndex - 1].question_list.push(question);
      pages_data[pageIndex - 1].no_of_questions += 1;
      questionCount += 1;

      // Move to next page every 10 questions
      if (questionCount % 10 === 0) {
        pageIndex += 1;
        pages_data[pageIndex - 1] = { page_no: pageIndex, no_of_questions: 0, question_list: [] };
      }
    });

    return {
      no_of_pages: pages_data.length,
      pages_data
    };
  };

  return (
    <div>
      <button onClick={handleButtonClick}>Import</button>
      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileUpload}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default BulkUpload;
