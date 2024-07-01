// background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_SOCO_EXTENSION') {
    // Open the extension UI here
    // For example, you might use chrome.windows.create
    chrome.windows.create({
      url: 'index.html#/popup/connect', // Adjust the URL as per your extension's structure
      type: 'popup',
      height: 620,
      width: 360,
      left: 1000,
    });
  }
});
