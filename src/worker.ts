import { Picture, predictImages } from './predictImageClass';
import * as comlink from "comlink";
import * as tf from '@tensorflow/tfjs';

class PredictionClass {
    async predictImages(imgs: string[], url: string): Promise<Picture[] | undefined> {
        console.log("comlink here!",imgs);
        const model = await tf.loadLayersModel(url);
        const blob = await (await fetch(imgs[0])).blob();
        const bitmap = await createImageBitmap(blob);
        const canvas = new OffscreenCanvas(bitmap.width,bitmap.height);
        const c = canvas.getContext('2d');
        c && c.drawImage(bitmap,0,0);
        console.log(model);
        return new Promise((resolve,_)=> resolve(["illust"]));
        // return predictImages(model, imgs)
    }
}
comlink.expose(PredictionClass);