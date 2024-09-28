import React from 'react';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

const generateDocx = (userDetails) => {
  const { name, date, position, certificationId, duration, startDate, endDate } = userDetails;

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun("Experience Letter"),
              new TextRun({ text: `\n\nDate: ${date}`, break: 1 }),
              new TextRun({ text: `\n\nDear ${name},`, break: 1 }),
              new TextRun({
                text: `\n\nCongratulations on your successful completion of Internship as Full Stack Java Developer in our organization with`,
                break: 1
              }),
              new TextRun({
                text: `Position: ${position}\nCertification Id: ${certificationId}\nDuration: ${duration}\nDate: ${startDate} to ${endDate}`,
                break: 1
              }),
              new TextRun({
                text: `\n\nYour willingness to learn, adapt, showing sensitivity to urgency and involvement in the tasks assigned to you is appreciated by the entire Software Developer team. We are sure you will see success coming to you more easily with this approach.`,
                break: 1
              }),
              new TextRun({
                text: `\nBesides showing high comprehension capacity, managing assignments with the utmost expertise, and exhibiting maximal efficiency, he has also maintained an outstanding professional demeanor and showcased excellent moral character throughout the traineeship period.`,
                break: 1
              }),
              new TextRun({
                text: `\nI hereby certify his overall work as Good to the best of my knowledge. Wishing him the best of luck in his future endeavors.`,
                break: 1
              }),
              new TextRun({
                text: `\n\nC.E.O\t\t\t\t\t\t\t\tProgram Manager`,
                break: 1
              }),
            ],
          }),
        ],
      },
    ],
  });

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, 'Experience_Letter.docx');
  });
};

export default generateDocx;
