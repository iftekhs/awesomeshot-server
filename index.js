const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;

require('dotenv').config();

// middlewares
app.use(cors());
app.use(express.json());

const main = async () => {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  function veryifyJwt(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
        res.status(403).send({ message: 'unauthorized access' });
      }
      req.decoded = decoded;
      next();
    });
  }

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

    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const service = await servicesCollection.findOne({ _id: ObjectId(id) });
      res.send(service);
    });

    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send({ token });
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
