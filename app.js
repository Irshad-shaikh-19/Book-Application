//Import express and Cors(for frontend api calling)
const express = require('express');
const app = express();
const cors = require('cors')



//Import config file for Database connection
require('dotenv').config();
require("./conn/conn");



//Importing Routes
const user = require('./routes/user')
const book = require('./routes/book')
const favourite = require('./routes/favourite')
const cart = require('./routes/cart')
const order = require('./routes/order')



//Middlewares
app.use(cors());
app.use(express.json());


//Creating Routes
app.use("/api/v1",user)
app.use("/api/v1",book)
app.use("/api/v1",favourite)
app.use("/api/v1",cart)
app.use("/api/v1",order)



// Creating Port
app.listen(process.env.PORT, () => {
    console.log(`Server Started on Port ${process.env.PORT}`);
});
