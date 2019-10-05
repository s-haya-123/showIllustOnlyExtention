import { predictImages, Picture, predictImage, loadImage } from './predictImageClass';
import * as tf from '@tensorflow/tfjs';
let imgs: HTMLImageElement[] = [];

let model: tf.LayersModel | undefined;
tf.loadLayersModel('./model/model.json').then(m => {
    model = m;
});
// chrome.webRequest.onCompleted.addListener(async req => {
    
//     if(req.initiator && !req.initiator.match(/chrome-extension/g)){
//         const img = await loadImage(req.url);
//         console.log(req);
//         const predict = model && img && await predictImage(model,img);
//         console.log(predict);
//     }
//   }, { urls: ["<all_urls>"], types: ["image", "object"] });




// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//     if (changeInfo.status == 'complete') {
//         const tabUrl = tab.url;
//         const tabTitle = tab.title;
//         console.log(tabUrl,tabTitle);

//         chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//             let message = {pageStart: true}
//             chrome.tabs.sendMessage(tabId, message, function(response) {
//                 console.log(response);
//             });
//         });
//     }
// });
//   chrome.runtime.onMessage.addListener(
//     async function(request: string[], sender, sendResponse) {
//       console.log(sender.tab ?
//                   "from a content script:" + sender.tab.url :
//                   "from the extension");
//                   console.log(request);
//                   const imgs = await Promise.all(request.map(async item => await loadImage(item)));
//                   if( !!model) {
//                     // console.log(await predictImages(model,imgs.filter(img=>!!img) as HTMLImageElement[]));
//                     // console.log(imgs.filter((img,i)=>!!img && i < 10) as HTMLImageElement[]);
//                     console.log(await predictImages(model,imgs.filter((img,i)=>!!img && i < 10) as HTMLImageElement[]));
//                   } else {
//                       console.log('model not loaded');
//                   }
                  
//     });
