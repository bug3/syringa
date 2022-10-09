const socket = new WebSocket('ws://localhost:8128');

const appendHtml = function (fileName, callback) {
    fetch(chrome.runtime.getURL(`resources/${fileName}`))
        .then((response) => response.text())
        .then((data) => {
            callback(data);
        });
};

const createScript = function (file, reload) {
    const script = document.createElement('script');

    script.src = chrome.runtime.getURL(file);

    if (reload) {
        script.id = 'syringa-script';

        $(`#${script.id}`).remove();
    }

    document.body.append(script);
};

const inject = function () {
    fetch(chrome.runtime.getURL('resources/.syringarc.json'))
        .then((response) => response.json())
        .then((config) => {
            if (removeTrailingSlash(config.url) === removeTrailingSlash(window.location.href)) {
                appendHtml('index.html', function (html) {
                    const id = 'syringa-html';

                    $(`#${id}`).remove();
                    $(config.html.selector)[config.html.method](`<div id="${id}">${html}</div>`);
                });

                appendHtml('style.css', function (css) {
                    const id = 'syringa-style';

                    $(`#${id}`).remove();
                    $(document.body).append(`<style id="${id}">${css}</style>`);
                });

                createScript('resources/script.js', true);
            }
        });
};

const removeTrailingSlash = function (url) {
    return url.replace(/\/$/, '');
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
