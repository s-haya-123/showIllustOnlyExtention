import { Picture, predictImages } from './predictImageClass';
import * as comlink from "comlink";
import * as tf from '@tensorflow/tfjs';

class PredictionClass {
    async predictImages(imgs: HTMLImageElement[]): Promise<Picture[] | undefined> {
        const model = await tf.loadLayersModel(chrome.extension.getURL('model/model.json'));
        return predictImages(model, imgs)
    }
}
comlink.expose(PredictionClass);