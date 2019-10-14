import * as comlink from "comlink";
import { PredictionClass } from './worker';
import { Message } from './background';

console.log('start');
chrome.runtime.onMessage.addListener((message:Message)=>{
    if( message.action === 'predict') {
        const imgs = Array.from(document.images).map(image=>image.src);
        console.log(imgs.filter((_,index)=>index < 10));
        load(imgs.filter((_,index)=>index < 10));
    }
})
async function load(imgs: string[]) {
    const worker = await fetch(chrome.extension.getURL('worker.js'));
    const js = await worker.text();
    const blob = new Blob([js], {type: "text/javascript"});
    const url = URL.createObjectURL(blob)
    const workerClass: any = comlink.wrap(new Worker(url));
    const instance:PredictionClass = await new workerClass();
    await instance.init(chrome.extension.getURL('model/model.json'));
    await instance.loadImage(imgs);
    console.log(await instance.predictImages());
}

