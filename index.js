const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const express = require("express");

const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors()); //middleware
app.use(express.json()); //middleware undefined
//verify token function
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  if (token.length < 500) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).send({ message: "Forbidden access " });
      }
      req.decoded = decoded;
      next();
    });
  } else {
    const decoded = jwt.decode(token);

    req.decoded = decoded;
    next();
  }
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.baf5z.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const inventoriesCollection = client
      .db("inventoryManagement")
      .collection("inventories");
    const servicesCollection = client
      .db("inventoryManagement")
      .collection("services");
    const reviewsCollection = client
      .db("inventoryManagement")
      .collection("reviews");
    //get all inventories
    app.get("/inventories", async (req, res) => {
      const query = {};
      const cursor = inventoriesCollection.find(query);
      const inventories = await cursor.toArray();
      res.send(inventories);
    });
    //get only logged in user's inventories
    app.get("/items", verifyJWT, async (req, res) => {
      const decodedEmail = req?.decoded?.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = inventoriesCollection.find(query);
        const items = await cursor.toArray();
        res.send(items);
      } else {
        res.status(403).send({ message: "Forbidden Access " });
      }
    });
    //get one inventories
    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await inventoriesCollection.findOne(query);
      res.send(result);
    });
    //update one quantity
    app.put("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const updatedQuantity = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          quantity: updatedQuantity.quantity,
        },
      };
      const result = await inventoriesCollection.updateOne(
        filter,
        updatedDoc,
        options
      );

      res.send(result);
    });
    //delete inventory
    app.delete("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await inventoriesCollection.deleteOne(query);
      res.send(result);
    });
    //add inventory
    app.post("/inventories", async (req, res) => {
      const addInventories = req.body;
      console.log("adding new inventory", addInventories);
      const result = await inventoriesCollection.insertOne(addInventories);
      res.send(result);
    });

    //Auth
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

    //get all services
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
    //get all reviews
    app.get("/reviews", async (req, res) => {
      const query = {};
      const cursor = reviewsCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running EIMS server");
});
app.listen(port, () => {
  console.log("listening to port", port);
});
