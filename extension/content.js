const socket = new WebSocket('ws://localhost:8128');

socket.onmessage = function (event) {
    if (event.data === 'fidelio') {
        alert('Message received');
    }
};
