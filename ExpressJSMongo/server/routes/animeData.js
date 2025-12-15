import express from "express";
// This will help us connect to the database
import db from "../db/connection.js";

// This help convert the id from string to ObjectId for the _id.
import { ObjectId } from "mongodb";

const animeRouter = express.Router();

animeRouter.patch("/addFavorite", async (req, res) => {
    try {
        const userId = req.body.userId;
        const animeId = req.body.animeId;
        const title = req.body.title;
        const imageUrl = req.body.imageUrl;

        // 1. Validation
        if (!userId || !animeId || !title || !imageUrl) {
            return res.status(400).send("Missing required fields.");
        }

        const favoriteItem = { animeId, title, imageUrl };

        // 2. Define the Query
        // We use the Clerk 'userId' string directly as the MongoDB '_id'.
        // This makes lookups fast and prevents ObjectId errors.
        const query = { _id: userId };

        // 3. Define the Update
        const update = {
            // $addToSet ensures we don't add duplicate favorites
            $addToSet: { 
                favorites: favoriteItem 
            },
            // $setOnInsert runs ONLY if a new document is created.
            // Good for setting fields like 'createdAt' or 'email' that shouldn't change later.
            $setOnInsert: { 
                createdAt: new Date(),
                username: req.body.username || "New User" // Optional: if you passed username
            }
        };

        // 4. Options: Enable Upsert
        const options = { upsert: true };

        const collection = await db.collection("users");
        
        // This single line handles both "Find & Update" and "Create New"
        const result = await collection.updateOne(query, update, options);

        // 5. Handle the Response based on what happened
        if (result.upsertedCount > 0) {
            // Case A: User didn't exist, so we created them with the favorite
            return res.status(201).send({ 
                message: "New user created and anime added to favorites.", 
                result 
            });
        } 
        else if (result.modifiedCount > 0) {
            // Case B: User existed and we added the favorite
            return res.status(200).send({ 
                message: "Anime added to favorites.", 
                result 
            });
        } 
        else if (result.matchedCount > 0 && result.modifiedCount === 0) {
            // Case C: User existed, but the anime was ALREADY in favorites ($addToSet did nothing)
            return res.status(200).send({ 
                message: "Anime already in favorites.", 
                result 
            });
        }

        // Fallback (should rarely happen with upsert)
        res.status(200).send({ message: "Request processed." });

    } catch (err) {
        console.error("Error in addFavorite:", err);
        res.status(500).send("Internal Server Error");
    }
});


animeRouter.get("/Favorites/:id", async (req, res) => {
    try {
        const userId = req.params.id;

        if (!userId) {
            return res.status(400).send("User ID is required in the path.");
        }

        let collection = await db.collection("users");

        // FIX: Do NOT use new ObjectId(userId). Use the string directly.
        // We are querying by the Clerk ID which is stored as the _id string.
        let query = { _id: userId };

        // Define the PROJECTION to only return the favorites array
        let options = {
            projection: { favorites: 1 }
        };

        let result = await collection.findOne(query, options);

        if (!result) {
            // It's possible the user exists but has no favorites yet, 
            // or the user hasn't been created in your DB yet.
            // Returning an empty list is safer for the frontend than a 404 error.
            return res.status(200).json({ favorites: [] });
        }

        // Success: Send the result. 
        // The frontend expects { favorites: [...] }, which matches this result.
        res.status(200).json(result);

    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving favorites");
    }
});

animeRouter.delete("/removeFavorite", async (req, res) => {
    try {
        const { userId, animeId } = req.body;

        if (!userId || !animeId) {
            return res.status(400).send("User ID and Anime ID are required.");
        }

        // 🚨 FIX: Do NOT use 'new ObjectId(userId)' for Clerk IDs. 
        // Just use the userId string directly.
        const query = { _id: userId }; 

        const updates = {
            $pull: {
                favorites: {
                    animeId: animeId
                }
            },
        };

        let collection = await db.collection("users");
        let result = await collection.updateOne(query, updates);

        if (result.matchedCount === 0) {
            return res.status(404).send("User not found.");
        }

        if (result.modifiedCount === 0) {
            return res.status(200).send({ message: "Anime was not found in favorites." });
        }

        res.status(200).send({ message: "Anime successfully removed.", result });

    } catch (err) {
        console.error("Error removing favorite:", err);
        res.status(500).send("Error updating record");
    }
});


animeRouter.post("/addReview", async (req, res) => {
    try {
        // 1. Destructure ALL fields, including 'username' which the frontend now sends
        const { animeId, userId, reviewText, username } = req.body;

        if (!animeId || !reviewText || !userId || !username) {
            return res.status(400).send("animeId, userId, reviewText, and username are required.");
        }

        // 2. REMOVED: The User Lookup Code
        // We do NOT need to look up the user in the database anymore.
        // The frontend already sent us the correct username from Clerk.
        // Plus, removing this fixes the "Invalid userId format" crash caused by new ObjectId(userId).

        // 3. Save to 'anime' collection
        let reviewsCollection = await db.collection("anime");

        const newReview = {
            animeId: animeId,
            userId: userId,
            username: username, // Use the username directly from the request
            createdAt: new Date(),
            review: reviewText
        };

        let result = await reviewsCollection.insertOne(newReview);

        // 4. Format the response
        const responseReview = {
            _id: result.insertedId,
            animeId: newReview.animeId,
            userId: newReview.userId,
            username: newReview.username,
            reviewText: newReview.review,
            date: newReview.createdAt
        };

        res.status(200).send(responseReview);

    } catch (err) {
        console.error("Error adding review:", err);
        res.status(500).send("Error adding review");
    }
});

animeRouter.get("/getReviews/:animeId", async (req, res) => {
    try {
        const animeId = req.params.animeId;

        if (!animeId) {
            return res.status(400).send("animeId parameter is required.");
        }

        let collection = await db.collection("anime");

        let query = { animeId: animeId };

        let reviews = await collection.find(query).toArray();

        res.status(200).json(reviews);

    } catch (err) {
        console.error("Error retrieving reviews:", err);
        res.status(500).send("Error retrieving reviews");
    }
});

export default animeRouter;