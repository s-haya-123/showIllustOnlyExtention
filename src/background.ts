import { predictImages, Picture } from './predictImageClass';
import * as tf from '@tensorflow/tfjs';
const image_size = 224;
let imgs: HTMLImageElement[] = [];

let model: tf.LayersModel | undefined;
tf.loadLayersModel('./model/model.json').then(m => {
    model = m;
});
// chrome.webRequest.onCompleted.addListener(async req => {
//     const img = await loadImage(req.url);
//     if( img ) imgs.push(img);
//   }, { urls: ["<all_urls>"], types: ["image"] });




chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
        const tabUrl = tab.url;
        const tabTitle = tab.title;
        console.log(tabUrl,tabTitle);

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            let message = {pageStart: true}
            chrome.tabs.sendMessage(tabId, message, function(response) {
                console.log(response);
            });
        });
    }
});
  chrome.runtime.onMessage.addListener(
    async function(request: string[], sender, sendResponse) {
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
                  console.log(request);
                  const imgs = await Promise.all(request.map(async item => await loadImage(item)));
                  if( !!model) {
                    console.log(await predictImages(model,imgs.filter(img=>!!img) as HTMLImageElement[]));
                  } else {
                      console.log('model not loaded');
                  }
                  
    });

async function loadImage(src: string): Promise<HTMLImageElement | null> {
    return new Promise(resolve => {
        const img = document.createElement('img');
        img.crossOrigin = "anonymous";
        img.onerror = function(e) {
            resolve(null);
        };
        img.onload = function(e) {
            if ((img.height && img.height > 128) || (img.width && img.width > 128)) {
            // Set image size for tf!
            img.width = image_size;
            img.height = image_size;
            resolve(img);
            }
            resolve(null);
        }
        img.src = src;
    });
}