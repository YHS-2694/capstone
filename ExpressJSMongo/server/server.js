import express from "express";
import cors from "cors";
import records from "./routes/record.js";
import logins from "./routes/login.js";
import register from "./routes/register.js";


const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/record", records);
app.use("/login", logins);
app.use("/registration", register);

// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});