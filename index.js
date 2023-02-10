import * as tf from "@tensorflow/tfjs";
import * as tfn from "@tensorflow/tfjs-node";
import detect from "./ai.js";
import express from 'express';
import bodyParser from "body-parser";
import cors from 'cors';
import multer from "multer";
import {drawRect} from "./drawOnImage.js";
import Canvas, {createCanvas, Image} from "canvas";

const app = express();

const storage = multer.memoryStorage();
/*const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    }
});*/
const upload = multer({storage: storage});

app.use(bodyParser.json({limit: '200mb'}));
app.use(cors())

const handler = tfn.io.fileSystem("C:\\Projekte\\NodeJS\\lufthansaserver\\model_2label\\model.json");
const model = tf.loadGraphModel(handler)

/*app.post('/', (req, res) => {
    console.log(JSON.stringify(req.body).slice(0, 100))
    const body = req.body;
    const {tensor, shape} = body;


    if (!tensor || !shape) {
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
*/

app.post("/upload", upload.single("myImage"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Please select an image." });
    }
    // do something with the image
    console.log(req.file);
    const image = new Canvas.Image();
    const imageBuffer = req.file.buffer;
    const blob = new Blob([imageBuffer], { type: req.file.mimetype });

    image.onload = () => {
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        const tensor = tf.tensor3d(imageData, [canvas.height, canvas.width, 4]);
        model.then((net) => {

            console.log("Request!")

            detect(net, tensor).then((result) => {
                console.log(result)
                const {boxes, classes, scores} = result;

                const jpegStream = drawRect(boxes, classes, scores, 0.6, image.width, image.height, image, "uploads/" + Date.now() * Math.ceil(Math.random() * 100) + ".jpg");
                res.set('Content-Type', 'image/jpeg');
                jpegStream.pipe(res);
            }).catch((error) => {
                console.log(error)
            });

            new Date().toLocaleDateString()


        }).catch((error) => {
            console.log(error)
        });
    };
    const dataUri = `data:${req.file.mimetype};base64,${imageBuffer.toString('base64')}`;
    image.src = dataUri;

    //res.json({ message: "Image uploaded successfully." });
});

app.listen(8080, () => {
    console.log("Server running on port 8080");
});
