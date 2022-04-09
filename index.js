const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// meadle ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fzu0z.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        const database = client.db("job_task");
        const dataCollection = database.collection("data");

        // get all data
        app.get("/data", async (req, res) => {
            const cursor = dataCollection.find({});
            const datas = await cursor.toArray();
            res.json(datas);
        });

        // add data post
        app.post("/data", async (req, res) => {
            const datas = req.body;
            const result = await dataCollection.insertOne(datas);
            console.log(result);
            res.json(result);
        });

        // update data
        app.put("/data/:id", async (req, res) => {
            console.log(req.body);
            const user = req.body;
            // const filter = { name: user.name, item: user.item };
            const options = { upsert: true };
            const updatedData = { _id: ObjectId(req.params.id) };
            const updateDoc = {
                $set: {
                    name: user.name,
                    item: user.item,
                },
            };
            const result = await dataCollection.updateOne(updatedData, updateDoc, options);
            res.json(result);
        });

        // delete data
        app.delete("/data/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await dataCollection.deleteOne(query);
            console.log("deleting user with id", result);
            res.json(result);
        });
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Running my task");
});

app.listen(port, () => {
    console.log("running on port", port);
});
