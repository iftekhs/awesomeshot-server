const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require('mongodb');

const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

const main = async () => {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);
  try {
    const servicesCollection = client.db('awesomeshot').collection('services');
    app.get('/services', async (req, res) => {
      const size = parseInt(req.query.size);
      const cursor = servicesCollection.find({});
      let services;
      if (size) {
        services = await cursor.limit(size).toArray();
      } else {
        services = await cursor.toArray();
      }
      res.send(services);
    });
  } catch (error) {
    console.log(error);
  } finally {
  }
};

main().catch(console.error);

app.get('/', (req, res) => {
  res.send('Server running!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
