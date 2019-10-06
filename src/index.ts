import * as tf from '@tensorflow/tfjs';
import { predictImages, loadImage } from './predictImageClass';
import * as comlink from "comlink";
import { PredictionClass } from './worker';
let model: tf.LayersModel | undefined;

console.log('start')


setTimeout( ()=>{
      const imgs = Array.from(document.images).map(image=>image.src);
      load(imgs);
  },1000);

async function load(imgs: string[]) {
    const worker = await fetch(chrome.extension.getURL('worker.js'));
    const js = await worker.text();
    const blob = new Blob([js], {type: "text/javascript"});
    const url = URL.createObjectURL(blob)
    const workerClass: any = comlink.wrap(new Worker(url));
    const instance:PredictionClass = await new workerClass();
    await instance.init(chrome.extension.getURL('model/model.json'));

    console.log(await instance.predictImages(imgs.filter((img,i)=>!!img && i < 10)));
}

