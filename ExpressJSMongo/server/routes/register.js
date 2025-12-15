import express from "express";

// This will help us connect to the database
import db from "../db/connection.js";

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const register = express.Router();

// This section will help you create a new record.
register.post("/register", async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        if (!username || !password) {
            return res.status(400).send("Username and password are required.");
        }

        let collection = await db.collection("users");

        // 1. Check if the username already exists
        const existingUser = await collection.findOne({ username: username });

        if (existingUser) {
            // 2. If a user is found, send a 409 Conflict response
            return res.status(409).send("Username already exists. Please choose a different username.");
        }

        // 3. If the username is unique, proceed with insertion
        let newDocument = {
            username: username,
            password: password // IMPORTANT: In a real app, HASH this password!
        };

        let result = await collection.insertOne(newDocument);
        
        // Use 201 Created for successful resource creation
        // The client will need the JSON response to know the insertion ID
        res.status(201).json({ 
            message: "Registration successful!",
            insertedId: result.insertedId 
        }); 

    } catch (err) {
        console.error(err);
        res.status(500).send("Error processing registration");
    }
});

export default register;