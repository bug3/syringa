chrome.runtime.onInstalled.addListener(function () {
    console.log('syringa background running');
});

chrome.tabs.onCreated.addListener(function () {
    chrome.runtime.reload();
});
