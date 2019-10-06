import { Picture, predictImages, predictImageCanvas, predictImageCanvases } from './predictImageClass';
import * as comlink from "comlink";
import * as tf from '@tensorflow/tfjs';

export class PredictionClass {
    model?: tf.LayersModel;
    async init(url: string) {
        this.model = await tf.loadLayersModel(url);
    }
    async predictImages(imgs: string[]): Promise<Picture[] | undefined> {
        if(this.model) {
            const imgBlobs = await Promise.all(imgs.map(async img=> await (await fetch(img)).blob()));
            const bitmaps = await Promise.all(imgBlobs.map(async blob=>
                blob.type.match(/svg/) ? undefined : await createImageBitmap(blob) ));
            const canvases = bitmaps.map(bitmap => {
                if(!bitmap) return;
                const canvas = new OffscreenCanvas(bitmap.width,bitmap.height);
                const c = canvas.getContext('2d');
                c && c.drawImage(bitmap,0,0);
                return canvas;
            });
            return predictImageCanvases(this.model,canvases);
        } else {
            return;
        }
    }
}
comlink.expose(PredictionClass);