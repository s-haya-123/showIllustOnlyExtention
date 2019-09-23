import * as tf from '@tensorflow/tfjs';
const imgSize = 224;
export type Picture = 'illust' | 'picture' | 'screenshot';

function loadImg(img: HTMLImageElement): tf.Tensor<tf.Rank> | undefined {
    const resizeImg = tf.image.resizeBilinear(tf.browser.fromPixels(img,3),[imgSize,imgSize]);
    return tf.tidy(() => {
        return resizeImg.expandDims(0);
      }).cast('float32').div(tf.scalar(255));
}
function classify(predictArray: number[]): Picture {
    const [_,index] = predictArray.reduce(
        ([max,index],current,currentIndex)=> current > max? [current,currentIndex]:[max,index],[0,0] );
    switch(index) {
        case 0:
            return 'illust';
        case 1:
            return 'picture';
        case 2:
            return 'screenshot';
        default:
            throw new Error(`${index} is out of bounds of classify`);
    }
}
function is2dArray(
    value:
    | number 
    | number[] 
    | number[][] 
    | number[][][] 
    | number[][][][]
    | number[][][][][]
    | number[][][][][][]): value is number[][] 
{
        return typeof value === 'object' && typeof value[0] === 'object' && typeof value[0][0] === 'number';
}

export async function predictImages(model:tf.LayersModel, imgs: HTMLImageElement[]): Promise<Picture[] | undefined> {
    const bathcedImgs = imgs.map(loadImg).filter(img=>!!img) as tf.Tensor<tf.Rank>[];
    console.log(bathcedImgs);
    const concatBatchedImgs = bathcedImgs.reduce((acc,current) => acc.concat(current));
    console.log(concatBatchedImgs);
    const predicts = await (model.predict(concatBatchedImgs) as tf.Tensor<tf.Rank>).array();
    if(is2dArray(predicts)) {
        return predicts.map(classify);
    } else {
        return;
    }
}

