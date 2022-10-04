const socket = new WebSocket('ws://localhost:8128');

var appendHtml = function (fileName, callback) {
    fetch(chrome.runtime.getURL('resources/' + fileName))
        .then((response) => response.text())
        .then((data) => {
            callback(data);
        });
};

var createScript = function (file, reload) {
    let script = document.createElement('script');
    script.src = chrome.runtime.getURL(file);

    if (reload) {
        script.id = 'syringa-script';

        $('#' + script.id).remove();
    }

    document.body.append(script);
};

var inject = function () {
    fetch(chrome.runtime.getURL('resources/.syringarc.json'))
        .then((response) => response.json())
        .then((config) => {
            if (config.url === window.location.href) {
                appendHtml('index.html', function (html) {
                    let id = 'syringa-html';

                    $('#' + id).remove();
                    $(config.html.selector)[config.html.method](`<div id="${id}">${html}</div>`);
                });

                appendHtml('style.css', function (css) {
                    let id = 'syringa-style';

                    $('#' + id).remove();
                    $(document.body).append(`<style id="${id}">${css}</style>`);
                });

                createScript('resources/script.js', true);
            }
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
