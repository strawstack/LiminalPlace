export const helper = () => {

    const keys = {
        keyw: false,
        keya: false,
        keys: false,
        keyd: false,
        shiftleft: false,
        space: false
    };

    const mouseMove = {x: 0, y: 0};

    function listenForKeys() {
        document.addEventListener("keydown", e => {
            keys[e.code.toLowerCase()] = true;
        });
        document.addEventListener("keyup", e => {
            keys[e.code.toLowerCase()] = false;
        });
    }

    function getKeys() {
        return keys;
    }

    function startMouseLock(canvas) {
        canvas.addEventListener("click", async () => {
            await canvas.requestPointerLock();
        });
        canvas.addEventListener("mousemove", e => {
            mouseMove.x = e.movementX;
            mouseMove.y = e.movementY;
        });
    }

    function getMouseMovement() {
        if (document.pointerLockElement === null) {
            mouseMove.x = 0;
            mouseMove.y = 0;
            return mouseMove;
        } else {
            const {x, y} = mouseMove;
            mouseMove.x = 0;
            mouseMove.y = 0;
            return {x, y};
        }

    }

    return {
        listenForKeys,
        getKeys,
        startMouseLock,
        getMouseMovement,
    };

}