import * as tf from '@tensorflow/tfjs';


tf.loadLayersModel(chrome.extension.getURL('model/model.json')).then(m => { 
    console.log(m);
});


  window.addEventListener('load', ()=>{
    chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
        console.log(response.farewell);
      });
  }, false);