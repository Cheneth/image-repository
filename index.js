const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express(),
    bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Initialize db
const db = require("./db");

// Routes
const imageRoute = require("./routes/image_route")
const authRoute = require("./routes/auth_route")

app.use(imageRoute)
app.use(authRoute)

app.listen(process.env.PORT, () => {
    console.log(`Ethan's Shopify challenge listening at http://localhost:${process.env.PORT}`);
});
