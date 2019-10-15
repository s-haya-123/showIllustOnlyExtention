import { Predict } from './worker';

export interface Message {
  action: 'predict',
  dic: Predict[]
};
let illustDic: Predict[] = [];
chrome.contextMenus.create({
  title: "イラストのみを表示",
  contexts: ["all"],
  type: "normal",
  onclick: (_, tabs) => {
        tabs.id &&
        chrome.tabs.sendMessage(tabs.id, {action: 'predict', dic: illustDic} as Message)
  },
  documentUrlPatterns: ["https://twitter.com/*"],
});

chrome.runtime.onMessage.addListener((dictionary: Predict[])=>{
  illustDic=[...illustDic,...dictionary];
  console.log(illustDic);
});