(() => {
    const socket = new WebSocket("ws://localhost:3000/hotpocket");
    function reload(event) {
        setTimeout(() => {
            socket.close();
            location.reload();
        }, 100);
    }
    socket.addEventListener("close", reload);
    socket.addEventListener("error", reload);
})();
