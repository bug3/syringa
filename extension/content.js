const socket = new WebSocket('ws://localhost:8128');

socket.onopen = function () {
    createScript('lib/jquery-3.6.1.min.js', false);

    inject();
};

socket.onmessage = function (event) {
    if (event.data === 'fidelio') {
        alert('Message received');
    }
};
