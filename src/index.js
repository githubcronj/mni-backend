require("dotenv").config();
const express = require("express");
const route = require("./routes/route");
const mongoose = require("mongoose");
const errorHandler = require("./middlewares/errorHandler");
const multer = require("multer");
const cors = require("cors");

mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true })
.then(() => console.log(`MongoDB Connection Successful`))
.catch((err) => console.log(err));

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api", route);
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Express App running on port ${port}`);
});

