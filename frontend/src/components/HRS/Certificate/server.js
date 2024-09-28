const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const port = 5000;
const cors = require('cors')

app.use(bodyParser.json());
app.use(cors())
const db = mysql.createConnection({
  host: '192.168.1.4',
  user: 'quiz',
  password: 'Quiz@12345',
  database: 'internship_certificate'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to database');
});

app.get('/generate-certificate-id/:role/:month', async (req, res) => {
  const { role, month } = req.params;
  const year = new Date().getFullYear().toString().slice(-2);
  const roleInitial = role.charAt(0).toUpperCase();

  try {
    // Fetch the last sequence number for the given role and month
    const query =`SELECT certificationId FROM certificates WHERE certificationId LIKE ? ORDER BY certificationId DESC LIMIT 1;`
    const likePattern = `RS${year}${roleInitial}%`;
    
    db.query(query, [likePattern], (err, result) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ error: 'Error fetching last sequence number' });
      }

      let newSequenceNumber = '01'; // Default sequence number

      if (result.length > 0) {
        const lastId = result[0].certificationId;
        const lastMonth = lastId.slice(5, 7); // Extract the month from the last ID
        console.log(lastMonth);
        if (lastMonth === month) {
          let lastSequenceNumber = parseInt(lastId.slice(-2), 10);
          newSequenceNumber = (lastSequenceNumber + 1).toString().padStart(2, '0');
        }
      }

      const newCertificationId = `RS${year}${roleInitial}${month}${newSequenceNumber}`;

      res.json({ newCertificationId });
    });
  } catch (error) {
    console.error('Error in generating certification ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
  
app.get('/show_all_certificates', (req, res) => {
  const query = 'SELECT * FROM certificates';
  db.query(query, (err, rows) => {
    if (err) {
      console.error('Error fetching certificates:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(rows);
  });
});


  app.post('/save_certificate_data', async (req, res) => {
    const { studentName, domain, position, certificationId, startDate, endDate } = req.body;
    
    const query = 'INSERT INTO certificates (studentName, domain, position, certificationId, startDate, endDate) VALUES (?, ?, ?, ?, ?, ?)';
    
    db.query(query, [studentName, domain, position, certificationId, startDate, endDate], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error saving certificate details');
      }
      
      res.status(200).send('Certificate details saved successfully');
    });
  });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
