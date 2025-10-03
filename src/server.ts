import http from "http";
import dotenv from "dotenv";
import express from "express";
import router from "./routes/router_api";
import bodyParser from "body-parser";
import cors from "cors";
import os from  "os"; 
dotenv.config();
 
const port = process.env.PORT || 3000;
const app = express();


app.use(
  cors({
    origin: ["https://gameshop-api-u2qx.onrender.com",  'http://localhost:4200'],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use(bodyParser.text()); //parse body to text
app.use(bodyParser.json()); //parse body to json

app.use('/', router);

var ip = "0.0.0.0";
const nets = os.networkInterfaces();

if (nets) {
  Object.keys(nets).forEach((_interface) => {
    const netInfo = nets[_interface];
    if (netInfo) {
      netInfo.forEach((_dev) => {
        if (_dev.family === "IPv4" && !_dev.internal) {
          ip = _dev.address;
        }
      });
    }
  });
}

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server is started on http://${ip}:${port}`);
},).on("error", (error) => {
  console.error(error);
});

