const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const { MongoClient, GridFSBucket } = require("mongodb");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Connect to MongoDB
const mongoURI = "mongodb://localhost:27017/jsonDB";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const client = new MongoClient(mongoURI);
client.connect().then(() => {
  console.log("MongoDB connected for GridFS");
});

const db = client.db("jsonDB");
const bucket = new GridFSBucket(db, { bucketName: "jsonFiles" });

// 🔹 Upload JSON File to MongoDB (GridFS)
app.post("/upload", (req, res) => {
  const uploadStream = bucket.openUploadStream("data.json");
  fs.createReadStream("data.json").pipe(uploadStream);

  uploadStream.on("finish", () => {
    console.log("JSON file stored in MongoDB!");
    io.emit("file_uploaded", { message: "New JSON file added!" });
    res.json({ success: true, message: "JSON file uploaded!" });
  });
});

// 🔹 Notify Clients When New JSON Files Are Stored
db.collection("jsonFiles.files").watch().on("change", (change) => {
  if (change.operationType === "insert") {
    io.emit("file_uploaded", { message: "New JSON file available!" });
  }
});

// 🔹 Retrieve JSON File from GridFS
app.get("/download", (req, res) => {
  const downloadStream = bucket.openDownloadStreamByName("data.json");
  res.setHeader("Content-Type", "application/json");
  downloadStream.pipe(res);
});

// 🔹 WebSocket Connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the Server
server.listen(3000, () => {
  console.log("Server running on port 3000");
});
