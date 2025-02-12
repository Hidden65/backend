require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Restrict CORS to your frontend only
app.use(cors({
  origin: ['http://localhost:3000', 'https://moneyfloww.netlify.app']
}));

// Secure route with a simple authorization token
app.get('/firebase-config', (req, res) => {
  const authToken = req.headers['authorization'];
  if (authToken === `Bearer ${process.env.SECURE_TOKEN}`) {
    res.json({
      apiKey: process.env.API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID
    });
  } else {
    res.status(403).json({ error: 'Unauthorized' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
