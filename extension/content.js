const socket = new WebSocket('ws://localhost:8128');

const createHtml = function (file, id, config) {
    fetch(chrome.runtime.getURL(file))
        .then((response) => response.text())
        .then((html) => {
            $(`#${id}`).remove();
            $(config.html.selector)[config.html.method](`<div id="${id}">${html}</div>`);
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

socket.onmessage = function (event) {
    if (event.data.password === 'fidelio') {
        if (event.data.onopen) {
            createScript('lib/jquery-3.6.1.min.js', 'syringa-jquery');

            createHtml('resources/index.html', 'syringa-html', event.data.info.config);
            createStyle('resources/style.css', 'syringa-style');
            createScript('resources/script.js', 'syringa-script');
        }
    }
};
