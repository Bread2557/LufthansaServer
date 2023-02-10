import * as tf from "@tensorflow/tfjs";

const detect = async (net, imageTensor3D) => {

    /*const {tensor, shape} = image;

    const img = tf.tensor3d(tensor, shape)*/

    //const resized = tf.image.resizeBilinear(imageTensor3D, [854,640])
    const casted = imageTensor3D.cast('int32')
    const expanded = casted.expandDims(0)

    console.log("detect")

    // 4. TODO - Make Detections
    const tensorWithoutAlpha = expanded.slice([0, 0, 0, 0], [-1, -1, -1, 3]);
    const obj = await net.executeAsync(tensorWithoutAlpha)

    const boxes = await obj[0].array()
    const classes = await obj[1].array()
    const scores = await obj[6].array()

    //tf.dispose(resized)
    tf.dispose(casted)
    tf.dispose(expanded)
    tf.dispose(obj)

    console.log(JSON.stringify({
        boxes: boxes[0],
        classes: classes[0],
        scores: scores[0]
    }))

    return {
        boxes: boxes[0],
        classes: classes[0],
        scores: scores[0]
    };
};

export default detect;