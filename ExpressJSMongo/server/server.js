import express from "express";
import cors from "cors";
import "dotenv/config";
import records from "./routes/record.js";
import logins from "./routes/login.js";
import register from "./routes/register.js";
import animeData from "./routes/animeData.js";


const app = express();

app.use(cors());
app.use(express.json());
app.use("/record", records);
app.use("/login", logins);
app.use("/registration", register);
app.use("/anime", animeData);

// start the Express server
const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});