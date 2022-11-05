const socket = new WebSocket('ws://localhost:8128');

const appendHtml = function (fileName, callback) {
    fetch(chrome.runtime.getURL(`resources/${fileName}`))
        .then((response) => response.text())
        .then((data) => {
            callback(data);
        });
};

const createStyle = function (file, id) {
    const style = document.createElement('link');

    style.id = id;
    style.rel = 'stylesheet';
    style.href = chrome.runtime.getURL(file);

    $(`#${style.id}`).remove();

    document.body.append(style);
};

const createScript = function (file, id) {
    const script = document.createElement('script');

    script.id = id;
    script.src = chrome.runtime.getURL(file);

    $(`#${script.id}`).remove();

    document.body.append(script);
};

const inject = function () {
    fetch(chrome.runtime.getURL('resources/.syringarc.json'))
        .then((response) => response.json())
        .then((config) => {
            appendHtml('index.html', function (html) {
                const id = 'syringa-html';

                $(`#${id}`).remove();
                $(config.html.selector)[config.html.method](`<div id="${id}">${html}</div>`);
            });

            createStyle('resources/style.css', 'syringa-style');
            createScript('resources/script.js', 'syringa-script');
        });
};

socket.onopen = function () {
    createScript('lib/jquery-3.6.1.min.js', 'syringa-jquery');

    inject();
};

socket.onmessage = function (event) {
    if (event.data === 'fidelio') {
        inject();
    }
};
