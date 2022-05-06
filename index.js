const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const express = require("express");

const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors()); //middleware
app.use(express.json()); //middleware for undefined

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
    //get all inventories
    app.get("/inventories", async (req, res) => {
      const query = {};
      const cursor = inventoriesCollection.find(query);
      const inventories = await cursor.toArray();
      res.send(inventories);
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
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("connected");
});
app.listen(port, () => {
  console.log("listening to port", port);
});
