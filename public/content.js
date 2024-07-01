/* eslint-disable no-undef */
console.log("version 0.0.7");
// content.js

// Define the URL of the JavaScript file to inject
// const scriptURL = chrome.runtime.getURL('script.js');
// console.log('sdsd',scriptURL)

// // Create a <script> element to inject into the webpage's DOM
// const scriptElement = document.createElement('script');
// scriptElement.src = scriptURL;

// // Inject the <script> element into the webpage's DOM
// document.head.appendChild(scriptElement);
// scriptElement.remove(); // Remove the injected <script> element
// var elt = document.createElement("script");
// const scriptURL = chrome.runtime.getURL('script.js');
// const scriptElement = document.createElement('script');
// scriptElement.src = scriptURL;
// document.head.appendChild(elt);
// Access the global variable from the webpage
// console.log(window.foo); // Output: { message: "Hello from the webpage!" }

// ;(function() {
//     function script() {
//       // your main code here
//       window.foo = 'bar'
//     }
  
//     function inject(fn) {
//       const script = document.createElement('script')
//       script.text = `(${fn.toString()})();`
//       document.documentElement.appendChild(script)
//     }
  
//     inject(script)
//   })()




// var s = document.createElement('script');
// s.src = chrome.extension.getURL('script.js');
// (document.head||document.documentElement).appendChild(s);
// s.onload = function() {
//     s.remove();
// };

// // Event listener
// document.addEventListener('RW759_connectExtension', function(e) {
//     // e.detail contains the transferred data (can be anything, ranging
//     // from JavaScript objects to strings).
//     // Do something, for example:
//     alert(e.detail);
// });



function embed() {
    // Create a <script> element
    const script = document.createElement("script");
    // Set the src attribute of the script to the URL of the injected script file
    // script.src = chrome.runtime.getURL('injectedCode.js')
    script.setAttribute('src', chrome.runtime.getURL('injectedCode.js'))
    console.log('s', script.src)
    console.log("injected",script);
    // Append the script to the webpage's DOM
    // var parent = document.getElementsByTagName('head').item(0) || document.documentElement;
    document.body.appendChild(script)
    // Remove the script element from the DOM after execution
    script.remove();
}

// Call the embed function with the code to inject
embed();