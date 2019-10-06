import * as tf from '@tensorflow/tfjs';
import { predictImages, loadImage } from './predictImageClass';
import * as comlink from "comlink";
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
    const instance: any = await new workerClass();
    

    console.log(await instance.predictImages(imgs.filter((img,i)=>!!img && i < 10),chrome.extension.getURL('model/model.json')));
}
async function workertest() {
    const worker = await fetch(chrome.extension.getURL('worker.js'));
    const js = await worker.text();
    const blob = new Blob([js], {type: "text/javascript"});
    const url = URL.createObjectURL(blob)
    const workerClass: any = comlink.wrap(new Worker(url));
    const instance: any = await new workerClass();
    
    console.log(await instance.predictImages("message",chrome.extension.getURL('model/model.json')));
}
