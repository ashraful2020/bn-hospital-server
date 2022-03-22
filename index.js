const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wijwg.mongodb.net/car_shop?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    client.connect();
    const database = client.db("bn-hospital");
    const reviewCollection = database.collection("review");
    const doctorsCollection = database.collection("doctors");
    const userCollection = database.collection("users");
    const appointmentCollection = database.collection("appointments");

    //Post user info in server
    app.post("/review", async (req, res) => {
      const user = req.body;
      const result = await reviewCollection.insertOne(user);
      res.json(result);
    });

    app.get("/review", async (req, res) => {
      const cursor = reviewCollection.find({});
      const user = await cursor.toArray();
      res.json(user);
    });

    //Post all orders data to Database
    app.post("/appointment", async (req, res) => {
      const orders = req.body;
      const result = await appointmentCollection.insertOne(orders);
      res.json(result);
    });

    //get orders data from server
    app.get("/appointment", async (req, res) => {
      const cursor = appointmentCollection.find({});
      const orders = await cursor.toArray();
      console.log(orders);
      res.send(orders);
    });

    ////user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.json(result);
    });

    app.get("/users", async (req, res) => {
      const cursor = userCollection.find({});
      const user = await cursor.toArray();
      res.send(user);
    }); 
    // Change Appointment Status
    app.put("/updateStatue/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          status: "Approved",
        },
      };
      const result = await appointmentCollection.updateOne(
        query,
        updatedDoc,
        options
      );
      res.json(result);
    });

    /// Change review status
    app.put("/updateReivewStatue/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          status: "Approved",
        },
      };
      const result = await reviewCollection.updateOne(
        query,
        updatedDoc,
        options
      );
      res.json(result);
    });

    ///
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await userCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    ///
    //Create admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const query = req?.body.email;
      console.log(query);
      if (query) {
        const requesterAccount = await userCollection.findOne({ email: query });
        const filter = { email: user.email };
        const updateUser = { $set: { role: "admin" } };
        const result = await userCollection.updateOne(filter, updateUser);
        res.json(result);
      } else {
        res.status(403).json({ message: "You don't have access" });
      }
    });
  } catch {
    // client.close()
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Hello ! , It's working");
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
