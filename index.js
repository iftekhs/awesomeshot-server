const express = require('express');
const cors = require('cors');
const app = express();

const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

// -------Database------------

// -------Database------------

app.get('/', (req, res) => {
  res.send('Server running!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
