const { MongoClient, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');

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
      return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
        return res.status(403).send({ message: 'unauthorized access' });
      }
      req.decoded = decoded;
      next();
    });
  }

  try {
    const servicesCollection = client.db('awesomeshot').collection('services');
    const reviewsCollection = client.db('awesomeshot').collection('reviews');

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

    app.get('/reviews/:id', async (req, res) => {
      const cursor = reviewsCollection.find({ serviceId: req.params.id });
      const reviews = await cursor.sort({ _id: -1 }).toArray();
      res.send(reviews);
    });

    app.get('/reviews', veryifyJwt, async (req, res) => {
      const decoded = req.decoded;
      let query = {};

      if (decoded.email !== req.query.email) {
        return res.status(403).send({ message: 'unauthorized access' });
      }

      query = {
        email: decoded.email,
      };

      const cursor = reviewsCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    app.post('/reviews', veryifyJwt, async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.status(201).send(result);
    });

    app.delete('/reviews/:id', veryifyJwt, async (req, res) => {
      const decoded = req.decoded;
      const id = req.params.id;

      const query = { _id: ObjectId(id) };
      const review = reviewsCollection.findOne(query);

      if (decoded.email !== review.email) {
        res.status(403).send({ message: 'unauthorized access' });
      }

      const result = await reviewsCollection.deleteOne(query);
      res.send(result);
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
