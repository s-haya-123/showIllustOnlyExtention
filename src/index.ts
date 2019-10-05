import * as tf from '@tensorflow/tfjs';
import { predictImages, loadImage } from './predictImageClass';
import * as comlink from "comlink";
let model: tf.LayersModel | undefined;

// tf.loadLayersModel(chrome.extension.getURL('model/model.json')).then(m => { 
//     model = m;
// });

console.log('start')
setTimeout( ()=>{
      const imgs = Array.from(document.images).map(image=>image.src);
      // load(imgs);
      workertest();
  },1000);

async function load(request: string[]) {
  console.log(request);
  // const imgs = await Promise.all(request.map(async item => await loadImage(item)));
    // console.log(await predictImages(model,imgs.filter(img=>!!img) as HTMLImageElement[]));
    // console.log(imgs.filter((img,i)=>!!img && i < 10) as HTMLImageElement[]);


    // const worker = await fetch(chrome.extension.getURL('worker.js'));
    // const content = await import(worker);
    // const js = await worker.text();
    // const blob = new Blob([js], {type: "text/javascript"});
    // const url = URL.createObjectURL(blob)
    const workerClass: any = comlink.wrap(new Worker('./worker.ts'));
    // const instance: any = await new workerClass();
    // console.log(instance);
    
    // console.log(await predictImages(model,imgs.filter((img,i)=>!!img && i < 10) as HTMLImageElement[]));
    // const elements = imgs.filter((img,i)=>!!img && i < 10) as HTMLImageElement[];
    // console.log(await instance.predictImages(elements,[elements as any]));
}
async function workertest() {
  // const worker = new Worker("./testWorker.ts", { type: "module"});
  // const worker = new Worker();
  // worker.onmessage = (evt) => {
  //   console.log(evt);
  // }
  // console.log(worker);
  // worker.postMessage("run!");

    const worker = await fetch(chrome.extension.getURL('testWorker.js'));
    // const content = await import(worker);
    const js = await worker.text();
    const blob = new Blob([js], {type: "text/javascript"});
    const url = URL.createObjectURL(blob)
    // const workerClass: any = comlink.wrap(new Worker(url));
    const workerClass = new Worker(url);
    workerClass.onmessage = (evt)=> {
      console.log('message',evt);
    }
    console.log(workerClass)
    workerClass.postMessage('message');
    // const instance: any = await new workerClass();
    // console.log(instance);
}