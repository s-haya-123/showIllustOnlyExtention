
export interface Message {
  action: 'predict'
};
chrome.contextMenus.create({
  title: "イラストのみを表示",
  contexts: ["all"],
  type: "normal",
  onclick: function (_, tabs) {
        tabs.id &&
        chrome.tabs.sendMessage(tabs.id, {action: 'predict'} as Message);
  },
  documentUrlPatterns: ["https://twitter.com/*"],
});
