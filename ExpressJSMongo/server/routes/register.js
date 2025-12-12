import express from "express";

// This will help us connect to the database
import db from "../db/connection.js";

// This help convert the id from string to ObjectId for the _id.
import { ObjectId } from "mongodb";

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const register = express.Router();

// This section will help you create a new record.
register.post("/register", async (req, res) => {
  try {
    let newDocument = {
      username: req.body.username,
      password: req.body.password
    };
    let collection = await db.collection("registration");
    let result = await collection.insertOne(newDocument);
    res.send(result).status(204);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding registration");
  }
});

export default register;