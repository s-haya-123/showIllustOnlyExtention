import { Picture, predictImages, predictImageCanvas } from './predictImageClass';
import * as comlink from "comlink";
import * as tf from '@tensorflow/tfjs';

export class PredictionClass {
    model?: tf.LayersModel;
    async init(url: string) {
        this.model = await tf.loadLayersModel(url);
    }
    async predictImages(imgs: string[]): Promise<Picture[] | undefined> {
        if(this.model) {
            const blob = await (await fetch(imgs[0])).blob();
            const bitmap = await createImageBitmap(blob);
            const canvas = new OffscreenCanvas(bitmap.width,bitmap.height);
            const c = canvas.getContext('2d');
            c && c.drawImage(bitmap,0,0);
            return predictImageCanvas(this.model, canvas);
        } else {
            return;
        }
    }
}
comlink.expose(PredictionClass);