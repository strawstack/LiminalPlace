

const COLS = 79;
const ROWS = 45;
const BASE_SIZE = 16;

const type = {
    POST: 0,
    ROOM: 1,
    WALL: 2
};

const dir = {
    HORZ: 0,
    VERT: 1
};

function setCSSVar(name, value) {
    document.documentElement.style.setProperty(name, value);
}

function getCSSVar(name, asInt) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name);

    if (asInt === true) {
        return parseInt(value.toString().split("px")[0]);
    } else {
        return value;
    }
}

function resize(lst, trueValue, condition, falseValue) {
    return lst.map((_, i) => condition(i) ? trueValue : falseValue);
}

function bigrooms(lst) {
    const expand = shuffle(Array(ROWS).fill(0).map((_, i) => i).filter(i => (i % 2) === 0)).slice(0, 5);
    const shrink = shuffle(Array(ROWS).fill(0).map((_, i) => i).filter(i => (i % 2) === 0 && !expand.includes(i))).slice(0, 10);

    const EXPAND_SIZE = 48;
    const SHRINK_SIZE = 16;

    lst = lst.map((v, i) => expand.includes(i) ? EXPAND_SIZE : v);
    lst = lst.map((v, i) => shrink.includes(i) ? SHRINK_SIZE : v);

    return lst;
}

function prefix(lst) {
    const rtn = [0];
    lst.forEach((v, i) => {
        rtn.push(rtn[i] + v);
    });
    rtn.pop();
    return rtn;
}

function sizes() {
    const WIDTH = COLS * BASE_SIZE  + BASE_SIZE / 2;
    const HEIGHT = ROWS * BASE_SIZE  + BASE_SIZE / 2;

    setCSSVar("--canvas-width", `${WIDTH}px`);
    setCSSVar("--canvas-height", `${HEIGHT}px`);

    const c = bigrooms(resize(Array(COLS).fill(BASE_SIZE), 1, r => r % 2 === 1, 16));
    const r = bigrooms(resize(Array(ROWS).fill(BASE_SIZE), 1, r => r % 2 === 1, 16));

    return {
        COLS: c,
        ROWS: r,
        WIDTH: c.reduce((a, v) => a + v),
        HEIGHT: r.reduce((a, v) => a + v)
    };
}

function getType(x, y) {
    if (x % 2 === 1 && y % 2 === 1) {
        return type.POST;
    } else if (x % 2 === 1 || y % 2 === 1) {
        return type.WALL;
    } else {
        return type.ROOM;
    }
}

function inBounds(num_rows, num_cols, x, y) {
    return x >= 0 && x < num_cols && y >= 0 && y < num_rows;
}

const hash = (x, y) => `${x}:${y}`;

function getAreas(ROWS, COLS) {
    const adj = [{x: 0, y: -1},{x: 1, y: 0},{x: 0, y: 1},{x: -1, y: 0}];
    const rooms = {};
    const walls = {};
    const posts = {};
    ROWS.forEach((h, y) => {
        COLS.forEach((w, x) => {
            const area_type = getType(x, y);
            if (area_type === type.POST) {
                posts[hash(x, y)] = {
                    type: type.POST
                };
            } else if (area_type === type.WALL) {
                const direction = (y % 2 === 1) ? dir.HORZ : dir.VERT;
                const adj_index = (direction === dir.HORZ) ? [0, 2] : [1, 3];
                const wid = hash(x, y);
                walls[wid] = {
                    id: wid,
                    type: type.WALL,
                    dir: direction,
                    rooms: adj_index.map(i => {
                        const {x: dx, y: dy} = adj[i];
                        return {x: dx + x, y: dy + y}; 
                    }).map(({x, y}) => {
                        const b = inBounds(ROWS.length, COLS.length, x, y);
                        return b ? hash(x, y) : null; 
                    })
                };
            } else { // area_type === type.ROOM
                const rid = hash(x, y);
                rooms[rid] = {
                    id: rid,
                    type: type.ROOM,
                    walls: adj.map(({x: dx, y: dy}) => {return {x: dx + x, y: dy + y}})
                        .map(({x, y}) => inBounds(ROWS.length, COLS.length, x, y) ? hash(x, y) : null)
                };
            }
        });
    });
    return {
        rooms,
        walls,
        posts
    }
}

function unionFind(rooms) {

    const group = {};
    rooms.forEach(rid => group[rid] = rid);

    function union(a, b) {
        const ga = find(a);
        const gb = find(b);
        group[gb] = ga; 
    }

    function find(a) {
        let ga = a;
        while(ga !== group[ga]) {
            ga = group[ga];
        }
        group[a] = ga;
        return ga;
    }

    return {
        union,
        find
    };
}

function kruskal(walls, {union, find}) {
    shuffle(walls);
    const openWalls = [];
    walls.forEach(({ id, rooms: [ rid_one, rid_two ] }) => {
        const group_rid_one = find(rid_one);
        const group_rid_two = find(rid_two);
        if (group_rid_one !== group_rid_two) {
            union(group_rid_one, group_rid_two);
            openWalls.push(id);
        }
    });
    return openWalls;
}

function shuffle(arr) {
    let ci = arr.length;
    while (ci != 0) {
        let ri = Math.floor(Math.random() * ci);
        ci -= 1;
        [arr[ci], arr[ri]] = [arr[ri], arr[ci]];
    }
    return arr;
}

export {
    resize,
    prefix,
    sizes,
    getType,
    getAreas,
    hash,
    type,
    dir,
    unionFind,
    kruskal
}