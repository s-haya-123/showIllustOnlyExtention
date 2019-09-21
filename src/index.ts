import * as tf from '@tensorflow/tfjs';
const xhr = new XMLHttpRequest();

// xhr.open('GET', chrome.extension.getURL('model/model.json'), true);

// xhr.onreadystatechange = () =>{
//     if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
//         const model = JSON.parse(xhr.responseText);
//         tf.loadLayersModel(model).then(m => { 
//             console.log(m);
//         });
//     } else {
//         console.log(xhr);
//     }
// }
// xhr.send();

function loadImg(img: HTMLImageElement): tf.Tensor<tf.Rank> | undefined {
    const resizeImg = tf.image.resizeBilinear(tf.browser.fromPixels(img,3),[224,224]);
    return tf.tidy(() => {
        return resizeImg.expandDims(0);
      }).cast('float32').div(tf.scalar(255));
}

tf.loadLayersModel('chrome-extension://oleakhblomlaelndnfgmakgmoeomcpkb/model/model.json').then(m => { 
    console.log(m);
    const batched = loadImg(document.body.querySelectorAll( 'img' ) [4])
    !!batched ? (m.predict(batched) as any).print():{};
});