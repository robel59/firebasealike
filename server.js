const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const { MongoClient } = require('mongodb');
const mongoURI = "mongodb://localhost:27017"; 

const app = express();
app.use(cors()); // Allow cross-origin requests

const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });


//connecting to  database 
MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        db = client.db("realtimeDB");
        jsonCollection = db.collection("jsonFiles");

        console.log("Connected to MongoDB");

        // look for changes in MongoDB and notify clients
        const changeStream = jsonCollection.watch();
        changeStream.on("change", (change) => {
            console.log("Database changed:", change);
            io.emit("dbUpdate", change);
        });
    })
    .catch(err => console.error("MongoDB Connection Error:", err));



// Socket.io connection
app.post("/upload", async (req, res) => {
  try {
      const jsonData = req.body;
      const result = await jsonCollection.insertOne({ data: jsonData, timestamp: new Date() });

      io.emit("newJson", jsonData); // Notify all clients about new data
      res.json({ success: true, message: "JSON stored successfully!", id: result.insertedId });
  } catch (error) {
      res.status(500).json({ success: false, message: "Error storing JSON", error });
  }
});

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/client.html");
});

server.listen(3000, () => console.log("Server running on http://localhost:3000"));