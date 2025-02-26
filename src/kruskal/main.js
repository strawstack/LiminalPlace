import * as THREE from 'three';
import {
    prefix,
    sizes,
    getType,
    getAreas,
    hash,
    type, // ROOM, WALL, or POST
    unionFind,
    kruskal as kruskalAlgo
} from './helper';

const {
    COLS,
    ROWS,
    WIDTH,
    HEIGHT
} = sizes();

const ROWS_PRE = prefix(ROWS);
const COLS_PRE = prefix(COLS);

const grid = getAreas(ROWS, COLS);

const colourLookup = {
    [type.POST]: "#999",
    [type.WALL]: "#777",
    [type.ROOM]: "#333",
};

const openWalls = kruskalAlgo(Object.values(grid.walls), unionFind(Object.keys(grid.rooms)));

function createWalls({ scene }) {
    const pos = (x, y) => {
        return {
            x: COLS_PRE[x] + COLS[x]/2,
            y: ROWS_PRE[y] + ROWS[y]/2,
            width: COLS[x],
            height: ROWS[y]
        };
    }

    const wall = (p, mat) => {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry( p.width, 5, p.height ), 
            mat
        );
        mesh.position.x = p.x;
        mesh.position.y = 2.5;
        mesh.position.z = p.y;
        scene.add(mesh);
    };

    ROWS.forEach((h, y) => {
        COLS.forEach((w, x) => {

            let mat = new THREE.MeshBasicMaterial({ 
                color: 0x00ff00,
                opacity: 0.5,
                transparent: true
            });

            if (getType(x, y) === type.WALL) {
                mat = new THREE.MeshBasicMaterial({ 
                    color: 0x0000ff,
                    opacity: 0.8,
                    transparent: true
                });
            }

            if (getType(x, y) === type.POST) {
                mat = new THREE.MeshBasicMaterial({ 
                    color: 0x0000ff,
                });
            }

            if (!openWalls.includes(hash(x, y)) && getType(x, y) !== type.ROOM) {
                wall(pos(x, y), mat);
            }
        });
    });
}

export {
    WIDTH,
    HEIGHT,
    createWalls
}