import * as tf from "@tensorflow/tfjs";
import * as tfn from "@tensorflow/tfjs-node";
import detect from "./ai.js";
import express from 'express';
import bodyParser from "body-parser";
import cors from 'cors';

var corsOptions = {
    origin: 'http://localhost:8080/',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const app = express();
//app.use(express.json());
app.use(bodyParser.json({limit: '50mb'}));
app.use(cors())

const handler = tfn.io.fileSystem("C:\\Projekte\\NodeJS\\lufthansaserver\\model_2label\\model.json");
const model = tf.loadGraphModel(handler)

app.post('/', (req, res) => {
    console.log(JSON.stringify(req.body).slice(0, 100))
    const body = req.body;
    const {tensor, shape} = body;


    if(!tensor || !shape) {
        console.log("No Image provided")
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.write(JSON.stringify({error: "No image provided"}));
        res.end();
        return;
    }

    console.log(tensor.length)

   model.then((net) => {


        console.log("Request!")

        detect(net, {tensor, shape}).then((result) => {
            console.log(result)
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(JSON.stringify(result));
            res.end();
        }).catch((error) => {
            console.log(error)
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: error}));
        });




    }).catch((error) => {
        console.log(error)
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: error}));
    });
});

app.listen(8080, () => {
    console.log("Server running on port 8080");
});
