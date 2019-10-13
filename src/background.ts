interface ImageResource {
  id: string,
  tabId: number,
  src: string
}
interface Tab {
  [tabId: string]:  ImageResource[]
}

let imgs:Tab= {};
const requestListner = async (req: chrome.webRequest.WebResponseCacheDetails) => {
  const ImageResource = imgs[`${req.tabId}`];
  const resource:ImageResource = {id: req.requestId, tabId: req.tabId,src: req.url};
  imgs = {...imgs,  [req.tabId]: ImageResource ? [...ImageResource,resource] : [resource] } ;
}

chrome.contextMenus.create({
  title: "イラストのみを表示",
  contexts: ["all"],
  type: "normal",
  onclick: function (info, tabs) {
      console.log(info, tabs,imgs);
  },
  documentUrlPatterns: ["https://twitter.com/*"],
});

chrome.tabs.onActivated.addListener(({tabId,windowId})=>{
  console.log(tabId);
  chrome.webRequest.onCompleted.removeListener(requestListner);
  chrome.webRequest.onCompleted.addListener(requestListner,
    {
      urls: ["*://*.twimg.com/*","*://*.twitter.com/*"], types: ["image"],tabId: tabId
    })
});
