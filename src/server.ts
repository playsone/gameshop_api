import http from "http";
import dotenv from "dotenv";
import express from "express";
import  router from "./routes/router_api";
import bodyParser from "body-parser";
dotenv.config();

const port = process.env.PORT || 3006;
const app = express();

app.use(express.json());

app.use(bodyParser.text()); //parse body to text
app.use(bodyParser.json()); //parse body to json

app.use('/', router);
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server is started on port ${port}`);
},).on("error", (error) => {
  console.error(error);
});

