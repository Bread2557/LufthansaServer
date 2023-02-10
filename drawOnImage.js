import fs from 'fs';
import Canvas from 'canvas';

export const labelMap = {
    1:{name:'softshell', color:'red'},
    2:{name:'hardshell', color:'yellow'},
}

export const drawRect = (boxes, classes, scores, threshold, imgWidth, imgHeight, image, savePath) => {
    // Create a canvas
    const canvas = Canvas.createCanvas(imgWidth, imgHeight);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(image, 0, 0, imgWidth, imgHeight);

    for(let i=0; i<=boxes.length; i++){
        if(boxes[i] && classes[i] && scores[i]>threshold){
            // Extract variables
            const [y,x,height,width] = boxes[i]
            const text = classes[i]

            // Set styling
            ctx.strokeStyle = labelMap[text]['color']
            ctx.lineWidth = 10
            ctx.fillStyle = 'blue'
            ctx.font = '20px Arial Black'

            // DRAW!!
            ctx.beginPath()
            ctx.fillText(labelMap[text]['name'] + ' - ' + Math.round(scores[i]*100)/100, x*imgWidth, y*imgHeight-10)
            ctx.rect(x*imgWidth,y*imgHeight, Math.abs((x*imgWidth) - width*imgWidth), Math.abs((y*imgHeight) -height*imgHeight));
            console.log("drawing", x*imgWidth, y*imgHeight, width*imgWidth/2, height*imgHeight/2)
            ctx.stroke()
        }
    }
    // Save the image to local storage
    const out = fs.createWriteStream(savePath)
    const stream = canvas.createJPEGStream()
    stream.pipe(out)
    out.on('finish', () =>  console.log("The image was saved!"))
    return stream;
}