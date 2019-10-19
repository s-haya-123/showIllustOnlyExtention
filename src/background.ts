export interface Message {
  action: 'predict' | 'stream',
  img?: string
};

chrome.contextMenus.create({
  title: "イラストのみを表示",
  contexts: ["all"],
  type: "normal",
  onclick: (_, tabs) => {
        tabs.id &&
        chrome.tabs.sendMessage(tabs.id, {action: 'predict'} as Message)
  },
  documentUrlPatterns: ["https://twitter.com/*"],
});

const requestListner = (tabId: number) => {
  return async (req: chrome.webRequest.WebResponseCacheDetails) => {
    chrome.tabs.sendMessage(tabId, {action: 'stream', img: req.url} as Message)
  }
}
let requestFunc: (req: chrome.webRequest.WebResponseCacheDetails) => void;
chrome.tabs.onActivated.addListener(({tabId,windowId})=>{
  chrome.webRequest.onCompleted.removeListener(requestFunc);
  requestFunc = requestListner(tabId);
  chrome.webRequest.onCompleted.addListener(requestFunc,
    {
      urls: ["*://*.twimg.com/*","*://*.twitter.com/*"], types: ["image"],tabId: tabId
    })
});