const mongoose = require('mongoose');
const url = process.env.MONGO_URL;
console.log(url)

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => {
    console.log("Connected to database")
}).catch((err) => {
    console.log("Error connecting to database")
})
