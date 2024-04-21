const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//midelewere
app.use(cors({
  origin: ['http://localhost:5173', 'https://hotel-booking-85452.web.app'],
  credentials: true
}));
app.use(express.json());


console.log(process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@rokon.tnm65c6.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();


    const servicesCollection = client.db('hotelBooking').collection('roomServices');
    const bookingCollection = client.db('hotelBooking').collection('bookingRooms');

    //auth related api
    app.post('/jwt', async(req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
      console.log(token);
      res
      .cookie('Token', token, {
          httpOnly: true,
          secure: false,
          sameSite: 'none'
      })
      .send({success: true});
    })

    //services related api
    app.get('/rooms', async(req, res)=>{
        const coursor = servicesCollection.find();
        const result = await coursor.toArray();
        res.send(result);

    });
    app.get('/rooms/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await servicesCollection.findOne(query);
        res.send(result);
    });
    
    app.get('/bookings', async(req, res)=>{
      let query  = {};
      if(req.query.email){
        query = {email: req.query?.email};
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    })
    app.post('/bookings', async(req, res)=>{
        const booking = req.body;
        console.log(booking);
        const result = await bookingCollection.insertOne(booking);
        res.send(result);
    });
    
    //delete item
    app.delete('/bookings/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    })







    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/', (req, res)=>{
    res.send('hotel server is running')
});

app.listen(port, ()=>{
    console.log(`hotel server is running ${port}`);
});


