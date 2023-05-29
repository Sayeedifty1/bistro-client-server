const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nsyuaxc.mongodb.net/?retryWrites=true&w=majority`;

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
        await client.connect();

        const userCollection = client.db("bistroDb").collection("user");
        const menuCollection = client.db("bistroDb").collection("menu");
        const reviewCollection = client.db("bistroDb").collection("reviews");
        const cartCollection = client.db("bistroDb").collection("carts");
        
        // !user related Apis
        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user)
            const query = {email: user.email};
            const existingUser = await userCollection.findOne(query);
            console.log("existing user", existingUser)
            if(existingUser){
                return res.send({message: "User already exists"});
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        });


        // ! Menu related Apis
        // get all menu
        app.get('/menu', async (req, res) => {
            const result = await menuCollection.find({}).toArray();
            res.send(result);
        });
        // !review related Apis
        // get all review
        app.get('/reviews', async (req, res) => {
            const result = await reviewCollection.find({}).toArray();
            res.send(result);
        });
        // cart collection api
        app.get('/carts', async (req, res) => {
            const email = req.query.email;
            if(!email){
                res.send([]);
            }
            const query = {email: email};
            const result  = await cartCollection.find(query).toArray();
            res.send(result);
        });


        // insert cart data cartCollection
        app.post('/carts', async (req, res) => {
            const item = req.body;
            const result = await cartCollection.insertOne(item);
            res.send(result);
        });

        // deleting a cart item
        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        });


     


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Boss is here');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});