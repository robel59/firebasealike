const io = require("socket.io-client");
const socket = io("http://localhost:3000");

socket.on("file_uploaded", (data) => {
  console.log("New JSON file detected:", data.message);
});

// Test: Upload a JSON file manually
const axios = require("axios");

axios.post("http://localhost:3000/upload")
  .then((res) => console.log(res.data))
  .catch((err) => console.error(err));
