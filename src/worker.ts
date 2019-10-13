import { Picture, predictImages, predictImageCanvas, predictImageCanvases } from './predictImageClass';
import * as comlink from "comlink";
import * as tf from '@tensorflow/tfjs';
const imgSize = 224;

export class PredictionClass {
    model?: tf.LayersModel;
    canvases?: OffscreenCanvas[];
    async init(url: string) {
        this.model = await tf.loadLayersModel(url);
    }
    async predictImages(): Promise<Picture[] | undefined> {
        if(this.model && this.canvases) {
            return predictImageCanvases(this.model,this.canvases);
        } else {
            return;
        }
    }
    async predictImage(index: number): Promise<Picture[] | undefined> {
        if(this.model && this.canvases && this.canvases[index]) {
            return predictImageCanvases(this.model,[this.canvases[index]]);
        } else {
            return;
        }
    }
    async loadImage(imgs: string[]) {
        const imgBlobs = await Promise.all(imgs.map(async img=> await (await fetch(img)).blob()));
        const bitmaps = await Promise.all(imgBlobs.map(async blob=>
            blob.type.match(/svg/) ? undefined : await createImageBitmap(blob) ));
        this.canvases = await bitmaps
        .filter(isNotEmpty)
        .filter(
            bitmap => bitmap.width > imgSize && bitmap.height > imgSize
        )
        .map((bitmap) => {
            const canvas = new OffscreenCanvas(bitmap.width,bitmap.height);
            const c = canvas.getContext('2d');
            c && c.drawImage(bitmap,0,0);
            return canvas;
        });
        return;
    }
}
function isNotEmpty<T>(value?: T): value is T {
    return !!value;
}
comlink.expose(PredictionClass);