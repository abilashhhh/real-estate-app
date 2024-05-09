import express from 'express';
const app = express();

console.log("Server running");

app.get('/', (req, res) => {
    res.send("Server running")
})

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})
