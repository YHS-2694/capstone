import express from "express";

// This will help us connect to the database
import db from "../db/connection.js";

// This help convert the id from string to ObjectId for the _id.
import { ObjectId } from "mongodb";

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const loginRouter = express.Router();

// This section will help you create a new record.
loginRouter.post("/loginCheck", async (req, res) => {
  try {
    // 1. Get the collection
    const collection = await db.collection("registration");

    // 2. Use findOne() to execute the query and retrieve a single document
    // NOTE: This assumes the password in the database is UNSECURELY stored in plaintext.
    const user = await collection.findOne({
      username: req.body.username,
      password: req.body.password, 
    });

    // 3. Check if a user was found
    if (user) {
      // SUCCESS: Login successful, send user data (excluding password) and 200 status
      res.status(200).json({ 
        message: "Login successful",
        userId: user._id, 
        // DO NOT return the password field 
      });
    } else {
      // FAILURE: User not found, send 401 Unauthorized
      res.status(401).send("Invalid username or password.");
    }

  } catch (err) {
    console.error(err);
    // 4. Use a more appropriate error message and 500 status
    res.status(500).send("Internal server error during login.");
  }
});

export default loginRouter;