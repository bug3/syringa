const socket = new WebSocket('ws://localhost:8128');
let onOpen = false;

const createHtml = (file, className, element) => {
    fetch(chrome.runtime.getURL(file))
        .then((response) => response.text())
        .then((html) => {
            $(`.syringa-${ className }`).remove();
            $(element.selector)[element.method](`<div class="syringa-${ className }">${ html }</div>`);
        });
};

const createStyle =  (file, className) => {
    const style = document.createElement('link');

    style.className = `syringa-${ className }`;
    style.rel = 'stylesheet';
    style.href = chrome.runtime.getURL(file);

    $(`.syringa-${ className }`).remove();

    document.body.append(style);
};

const createScript = (file, className) => {
    const script = document.createElement('script');

    script.className = `syringa-${ className }`;
    script.src = chrome.runtime.getURL(file);

    $(`.syringa-${ className }`).remove();

    document.body.append(script);
};

socket.onopen = (event) => {
    onOpen = true;

    if (event.isTrusted) {
        createScript('lib/jquery-3.6.1.min.js', 'jquery');
    }
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const { config } = data;

    if (event.isTrusted && data.password === 'fidelio' && chrome.runtime.id !== undefined) {
        if (config.onCreate || onOpen) {
            onOpen = false;

            config.files.html.forEach((file) => {
                createHtml(`resources/${ file }.html`, file,
                    config.codes.html.find((x) => x.file === `${ file }.html`));
            });

            config.files.css.forEach((file) => {
                createStyle(`resources/${ file }.css`, file);
            });

            config.files.js.forEach((file) => {
                createScript(`resources/${ file }.js`, file);
            });
        } else {
            const { file } = config.changes;

            switch (file.ext) {
                case '.html':
                    createHtml(`resources/${ file.base }`, file.name,
                        config.codes.html.find((x) => x.file === `${ file.base }`));

                    break;
                case '.css':
                    createStyle(`resources/${ file.base }`, file.name);

                    break;
                case '.js':
                    createScript(`resources/${ file.base }`, file.name);

                    break;
            }
        }
    } else {
        window.location.reload();
    }
};
