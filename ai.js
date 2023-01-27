import * as tf from "@tensorflow/tfjs";

const detect = async (net, image) => {

    const {tensor, shape} = image;

    const img = tf.tensor3d(tensor, shape)

    const resized = tf.image.resizeBilinear(img, [854,640])
    const casted = resized.cast('int32')
    const expanded = casted.expandDims(0)

    console.log("detect")

    // 4. TODO - Make Detections
    const obj = await net.executeAsync(expanded)

    const boxes = await obj[0].array()
    const classes = await obj[1].array()
    const scores = await obj[6].array()

    tf.dispose(img)
    tf.dispose(resized)
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