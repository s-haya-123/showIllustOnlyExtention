import * as tf from '@tensorflow/tfjs';
const imgSize = 224;
export type Picture = 'illust' | 'picture' | 'screenshot';


export async function loadImage(src: string): Promise<HTMLImageElement | null> {
    return new Promise(resolve => {
        const img = document.createElement('img');
        img.crossOrigin = "anonymous";
        img.onerror = function(e) {
            resolve(null);
        };
        img.onload = function(e) {
            if ((img.height && img.height > 128) || (img.width && img.width > 128)) {
            // Set image size for tf!
            img.width = imgSize;
            img.height = imgSize;
            resolve(img);
            }
            resolve(null);
        }
        img.src = src;
    });
}
function loadImg(img: HTMLImageElement | undefined): tf.Tensor<tf.Rank> | undefined {
    if(!img) return;
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
function is1dArray(
    value:
    | number 
    | number[] 
    | number[][] 
    | number[][][] 
    | number[][][][]
    | number[][][][][]
    | number[][][][][][]): value is number[] {
    return typeof value === 'object' && typeof value[0] === 'number';
}

export async function predictImages(model:tf.LayersModel, imgs: HTMLImageElement[]): Promise<Picture[] | undefined> {
    const bathcedImgs = imgs.map(loadImg).filter(img=>!!img) as tf.Tensor<tf.Rank>[];
    const concatBatchedImgs = bathcedImgs.reduce((acc,current) => acc.concat(current));

    const predicts = await (model.predict(concatBatchedImgs) as tf.Tensor<tf.Rank>).array();
    if(is2dArray(predicts)) {
        return predicts.map(classify);
    } else {
        return;
    }
}
export async function predictImage(model:tf.LayersModel, img: HTMLImageElement): Promise<Picture | undefined> {
    const batchImg = loadImg(img);
    if(batchImg) {
        const predict = await ( model.predict(batchImg) as tf.Tensor<tf.Rank>).array();
        return  is2dArray(predict) ? classify(predict[0]) : undefined
    }
    return;
}

export async function predictImageCanvas(model:tf.LayersModel, canvas: OffscreenCanvas) {
    const img = loadImg(canvas as any);
    const predicts = await (model.predict(img as any) as tf.Tensor<tf.Rank>).array();
    if(is2dArray(predicts)) {
        return predicts.map(classify);
    } else {
        return;
    }
}
export async function predictImageCanvases(model:tf.LayersModel, canvases: (OffscreenCanvas | undefined)[]) {
    const bathcedImgs = canvases.map(img=>img ?loadImg(img as any) : undefined).filter(img=>!!img) as tf.Tensor<tf.Rank>[];
    const concatBatchedImgs = bathcedImgs.reduce((acc,current) => acc.concat(current));
    
    const predicts = await (model.predict(concatBatchedImgs as any) as tf.Tensor<tf.Rank>).array();
    if(is2dArray(predicts)) {
        return predicts.map(classify);
    } else {
        return;
    }
}

