const socket = new WebSocket('ws://localhost:8128');

var appendHtml = function (fileName, callback) {
    fetch(chrome.runtime.getURL('resources/' + fileName))
        .then((response) => response.text())
        .then((data) => {
            callback(data);
        });
};

socket.onopen = function () {
    createScript('lib/jquery-3.6.1.min.js', false);

    inject();
};

socket.onmessage = function (event) {
    if (event.data === 'fidelio') {
        inject();
    }
};
