import * as comlink from "comlink";
import { PredictionClass, Predict } from './worker';
import { Message } from './background';
import { Subject, zip, timer, Subscription, ReplaySubject } from 'rxjs';
import { filter, scan } from 'rxjs/operators'

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
        scan((acc,cur)=>acc.length >= 10 ? [cur] : [...acc,cur],[] as string[]),
        filter((imgs)=>imgs.length >= 10)
    ),
    start$
);
let streamingPredict: Subscription;
start$.next(true);

chrome.runtime.onMessage.addListener(async (message:Message)=>{
    if( message.action === 'predict') {
        const imgs = Array.from(document.images);
        const medias = imgs.map(image=>image.src).filter(src=> src.match(/media/));
        predictImages(medias);
    }
    if( message.action === 'stream' && message.img) {
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
async function predictImages(medias: string[]) {
    console.time('predict');
    const [target,dictionary]: [ string[], Predict[]] = medias.reduce((acc,media)=>{
        const predict = illustDic.filter(dic=>dic.src === media);
        return predict.length > 0
        ? [ acc[0],[...acc[1], ...predict]]
        : [ [...acc[0],media], acc[1]];
    }, [ [] as string[], [] as Predict[]]);

    const predicts = target.length > 0 ? await predict(target) : [];

    console.log(medias,predicts,dictionary,illustDic);
    const allImageData = !!predicts ? [...predicts, ...dictionary] : dictionary;
    console.log(allImageData);
    setDisplayNoneOnNotIllustOnTwitter(Array.from(document.images),allImageData);
    if(predicts) {
        illustDic = [...illustDic,...allImageData];
        chrome.storage.sync.set({dictionary: illustDic});
    }
    console.timeEnd('predict');
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

