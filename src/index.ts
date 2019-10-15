import * as comlink from "comlink";
import { PredictionClass, Predict } from './worker';
import { Message } from './background';

console.log('start');
chrome.runtime.onMessage.addListener(async (message:Message)=>{
    if( message.action === 'predict') {
        const imgs = Array.from(document.images)
        const medias = imgs.map(image=>image.src).filter(src=> src.match(/media/));
        const [target,dictionary]: [ string[], Predict[]] = medias.reduce((acc,media)=>{
            const predict = message.dic.filter(d=>d.src === media);
            return predict.length > 0
            ? [ acc[0],[...acc[1], ...predict]]
            : [ [...acc[0],media], acc[1]];
        }, [ [] as string[], [] as Predict[]]);
        const predicts = target.length === 0 ? await predict(target) : [];
        if(predicts) {
            setDisplayNoneOnNotIllustOnTwitter(imgs,predicts.concat(dictionary));
            chrome.runtime.sendMessage(predicts);
        }
    }
})
function setDisplayNoneOnNotIllustOnTwitter(imgs: HTMLImageElement[], predicts: Predict[]) {
    Array.from(imgs).forEach(img=>{
        if( predicts.filter(predict=>predict.src === img.src
            && predict.predict !== 'illust').length > 0) {
                const element = img.parentElement;
                searchParentElement(element!).style.display = 'none';
            }
    });
}
function searchParentElement(dom: HTMLElement): HTMLElement {
    let target: HTMLElement = dom;
    let parent: HTMLElement | null = target.parentElement;
    while( parent && parent.childElementCount < 6) {
        target = parent;
        parent = target.parentElement;
    }
    return target;
}
async function predict(imgs: string[]): Promise<Predict[] | undefined> {
    const worker = await fetch(chrome.extension.getURL('worker.js'));
    const js = await worker.text();
    const blob = new Blob([js], {type: "text/javascript"});
    const url = URL.createObjectURL(blob)
    const workerClass: any = comlink.wrap(new Worker(url));
    const instance:PredictionClass = await new workerClass();
    await instance.init(chrome.extension.getURL('model/model.json'));
    await instance.loadImage(imgs);
    return instance.predictImages();
}

