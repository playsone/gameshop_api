import http from "http";
import express from "express";

const port = process.env.port || 3000;

export const app = express();
app.use("/", (req, res) => {
  res.send("Hello World!!!");
});

const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server is started on port ${port}`);
},).on("error", (error) => {
  console.error(error);
});


