const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const multer = require('multer');
const sharp = require('sharp');
const { Client } = require('pg');
const GoogleImages = require('google-images');
app.use(bodyparser.urlencoded({extended:true}));
// Google Images API setup
const googleClient = new GoogleImages('your_google_cse_id', 'your_google_api_key');
//database connection
const pgClient = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'sepide',
  port: 5432,
});
pgClient.connect();
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


app.post('/download', async (req, res) => {
  try {
    const results = await googleClient.search(req.body.query, { page: 1, size: 'medium' });
    for (const image of results) {
      const resizedImageBuffer = await sharp(Buffer.from(image.thumbnail.url, 'base64'))
        .resize(300, 200)
        .toBuffer();

      const query = 'INSERT INTO images (description, data) VALUES ($1, $2)';
      const values = [image.description || 'No description', resizedImageBuffer];

      await pgClient.query(query, values);
    }

    res.send('Images downloaded and stored successfully!');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error occurred during processing.');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});


app.listen(3000,()=>{console.log('app is running on port3000')});
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });