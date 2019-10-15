import { Predict } from './worker';
import { Picture, predictImages, predictImageCanvas, predictImageCanvases } from './predictImageClass';
import * as comlink from "comlink";
import * as tf from '@tensorflow/tfjs';
const imgSize = 224;

export interface Predict {
    predict: Picture;
    src: string;
}
export interface ImageData {
    src: string;
    canvas: OffscreenCanvas;
}
export class PredictionClass {
    model?: tf.LayersModel;
    imageDatas?: ImageData[];
    async init(url: string) {
        this.model = await tf.loadLayersModel(url);
    }
    async predictImages(): Promise<Predict[] | undefined> {
        
        const imageDatas = this.imageDatas;
        if(this.model && imageDatas && imageDatas.length > 0) {
            const predicts = await predictImageCanvases(this.model, imageDatas.map(imageData=>imageData.canvas));
            return predicts ? predicts.map((predict,index)=> {
                return {
                    predict,
                    src: imageDatas[index].src
                };
            }) : undefined;
        } else {
            return;
        }
    }
    async predictImage(index: number): Promise<Predict | undefined> {
        const imageDatas = this.imageDatas;
        if(this.model && imageDatas && imageDatas[index]) {
            const predict = await predictImageCanvases(this.model,[imageDatas[index].canvas]);
            return predict ? {
                predict: predict[0],
                src: imageDatas[index].src
            } : undefined;
        } else {
            return;
        }
    }
    async loadImage(imgs: string[]) {
        const imgBlobs = await Promise.all(imgs.map(async img=> await (await fetch(img)).blob()));
        const bitmaps = await Promise.all(imgBlobs.map(async blob=>
            blob.type.match(/svg/) ? undefined : await createImageBitmap(blob) ));
        this.imageDatas = await bitmaps
        .map((bitmap,index)=> {return {bitmap,index}})
        .filter(
            ({bitmap}) => {
                return bitmap && bitmap.width > imgSize && bitmap.height > imgSize;
            }
        )
        .map(({bitmap,index}) => {
            if(!bitmap) return;
            const canvas = new OffscreenCanvas(bitmap.width,bitmap.height);
            const c = canvas.getContext('2d');
            c && c.drawImage(bitmap,0,0);
            return {
                src: imgs[index],
                canvas
            } as ImageData;
        }).filter(isNotEmpty);
        return;
    }
}
function isNotEmpty<T>(value?: T): value is T {
    return !!value;
}
comlink.expose(PredictionClass);