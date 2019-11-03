import * as comlink from "comlink";
import { PredictionClass, Predict } from './worker';
import { Message } from './background';
import { Subject, zip, timer, Subscription, ReplaySubject } from 'rxjs';
import { filter, scan } from 'rxjs/operators'
const length = 5;
let illustDic: Predict[] = [];
chrome.storage.sync.get(['dictionary'], function(result) {
    if(result.dictionary) {
        console.log(result.dictionary);
        illustDic = result.dictionary;
    }
});

const image$ = new ReplaySubject<string>();
const start$ = new ReplaySubject<boolean>();
timer(1000,1000).subscribe(_=>{
    setDisplayNoneOnNotIllustOnTwitter(Array.from(document.images),illustDic);
});
const streaming$ = zip(
    image$.pipe(
        filter(src=> !!src.match(/media/)),
        scan((acc,cur)=>acc.length >= length ? [cur] : [...acc,cur],[] as string[]),
        filter((imgs)=>imgs.length >= length)
    ),
    start$
);
let streamingPredict: Subscription;
start$.next(true);
let instance: PredictionClass;
createInstance().then(i=>instance = i);

chrome.runtime.onMessage.addListener(async (message:Message)=>{
    if( message.action === 'predict') {
        injectLoader();
        const imgs = Array.from(document.images);
        const medias = imgs.map(image=>image.src).filter(src=> src.match(/media/));
        await predictImages(medias);
        deleteLoader();
    }
    if( message.action === 'stream' && message.img) {
        instance && message.img.match(/media/) && instance.addImage(message.img);
        image$.next(message.img);
    }
    if( message.action === 'start_stream' ){
        console.log('start');
        streamingPredict = streaming$.subscribe(([images,_])=>predictImages(images));
    }
    if( message.action === 'stop_stream' ){
        streamingPredict.unsubscribe();
    }
});
function injectLoader() {
    const wrapper = document.createElement('div');
    wrapper.id = 'loader-wrapper';
    wrapper.className = 'wrapper';
    const loader = document.createElement('div');
    loader.id = 'inject-loader';
    loader.className = 'loader';
    wrapper.appendChild(loader);
    document.body.appendChild(wrapper);
}
function deleteLoader() {
    const loader = document.getElementById('loader-wrapper');
    loader && loader.remove();
}
async function predictImages(medias: string[]) {
    console.time('all');
    console.time('reduce');
    const [target,dictionary]: [ string[], Predict[]] = medias.reduce((acc,media)=>{
        const predict = illustDic.filter(dic=>dic.src === media);
        return predict.length > 0
        ? [ acc[0],[...acc[1], ...predict]]
        : [ [...acc[0],media], acc[1]];
    }, [ [] as string[], [] as Predict[]]);
    console.timeEnd('reduce');
    console.time('predict_all');
    const predicts = target.length > 0 ? await predict(target,instance) : [];
    console.timeEnd('predict_all');

    const allImageData = !!predicts ? [...predicts, ...dictionary] : dictionary;
    console.log(predicts);
    console.time('set none');
    setDisplayNoneOnNotIllustOnTwitter(Array.from(document.images),allImageData);
    console.timeEnd('set none');
    console.time('storage');
    if(predicts) {
        illustDic = [...illustDic,...allImageData];
        chrome.storage.sync.set({dictionary: illustDic});
    }
    console.timeEnd('storage');
    console.timeEnd('all');
    start$.next(true);
}

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
async function createInstance():Promise<PredictionClass> {
    console.time('load');
    const worker = await fetch(chrome.extension.getURL('worker.js'));
    const js = await worker.text();
    const blob = new Blob([js], {type: "text/javascript"});
    const url = URL.createObjectURL(blob)
    const workerClass: any = comlink.wrap(new Worker(url));
    const instance:PredictionClass = await new workerClass();
    await instance.init(chrome.extension.getURL('model/model.json'));
    console.timeEnd('load');
    return instance;
}

async function predict(imgs: string[], instance: PredictionClass): Promise<Predict[] | undefined>{
    console.time('load_img');
    // await instance.loadImage(imgs);
    console.timeEnd('load_img');
    console.time('predict');
    const predicts = await instance.predictImages();
    console.timeEnd('predict');
    return predicts;

}

