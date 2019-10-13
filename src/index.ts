import * as tf from '@tensorflow/tfjs';
import { predictImages, loadImage } from './predictImageClass';
import * as comlink from "comlink";
import { PredictionClass } from './worker';

console.log('start');

setTimeout( ()=>{
      const imgs = Array.from(document.images).map(image=>image.src);
      load(imgs);
  },2000);

async function load(imgs: string[]) {
    const worker = await fetch(chrome.extension.getURL('worker.js'));
    const js = await worker.text();
    const blob = new Blob([js], {type: "text/javascript"});
    const url = URL.createObjectURL(blob)
    const workerClass: any = comlink.wrap(new Worker(url));
    const instance:PredictionClass = await new workerClass();
    await instance.init(chrome.extension.getURL('model/model.json'));
    // await instance.elementTest(Array.from(document.images)[0]);
    console.log(imgs);
    await instance.loadImage(imgs);
    console.log('load done');
    console.time('load img');
    // console.log(await instance.predictImages());
    console.log(await instance.predictImage(1));
    console.timeEnd('load img');
    // console.log(await instance.predictImages(imgs.filter((img,i)=>!!img && i < 1)));
    // console.log(await instance.predictImages(imgs.filter((img)=>!!img)));
}

