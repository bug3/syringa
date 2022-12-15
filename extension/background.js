chrome.runtime.onInstalled.addListener(function () {
    console.log('syringa background running');
});

chrome.tabs.onCreated.addListener(function () {
    if (chrome.runtime.Port !== undefined) {
        chrome.runtime.Port.disconnect();
    }

    chrome.runtime.reload();
});
