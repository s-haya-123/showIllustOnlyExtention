const image_size = 224;
let imgs: HTMLImageElement[] = [];
// chrome.webRequest.onCompleted.addListener(async req => {
//     const img = await loadImage(req.url);
//     if( img ) imgs.push(img);
//   }, { urls: ["<all_urls>"], types: ["image"] });

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
                  console.log(imgs);
                  imgs = [];
      if (request.greeting == "hello")
        sendResponse({farewell: "goodbye"});
    });

function loadImage(src: string): Promise<HTMLImageElement | null> {
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