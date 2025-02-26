import * as THREE from 'three';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

import { helper } from './helper';

import {
    WIDTH,
    HEIGHT,
    createWalls
} from './kruskal/main';

import { firstPersonMovement } from "./firstPersonMovement";

import { fog } from './fog/main';

import { grassMaterial } from './grass/material';

(() => {
    const help = helper();
    const {
        getKeys,
        startMouseLock
    } = help;

    function main() {
        const scene = new THREE.Scene();
        const clock = new THREE.Clock();
        // const { fog_material, fogAnimate } = fog({ scene, clock });
        
        const viewport = document.querySelector(".viewport");
        const view_size = viewport.getBoundingClientRect();
        
        const camera = new THREE.PerspectiveCamera( 
            75, view_size.width / view_size.height, 0.1, 1000
        );

        camera.position.x = WIDTH/2;
        camera.position.y = 2;
        camera.position.z = HEIGHT/2;

        const camera2 = new THREE.PerspectiveCamera( 
            75, view_size.width / view_size.height, 0.1, 1000
        );

        camera2.position.x = WIDTH/2;
        camera2.position.y = 400;
        camera2.position.z = HEIGHT/2;
        camera2.rotateX(-1 * Math.PI/2);
        
        const renderer = new THREE.WebGLRenderer({
            canvas: viewport
        });
        renderer.setSize( view_size.width, view_size.height );

        const CONTROLS = { 
            FPS: 0,
            FLY: 1,
            ORBIT: 2,
            MINE: 3,
            PTR: 4
        };
        const ctrls = CONTROLS.PTR;

        const fpsControls = new FirstPersonControls(camera, renderer.domElement);
        fpsControls.lookSpeed = 0.5;
        fpsControls.movementSpeed = 4;

        const flyControls = new FlyControls(camera, renderer.domElement);
        flyControls.movementSpeed = 1;
        flyControls.rollSpeed = 0.05;

        const ptrControls = new PointerLockControls(camera, renderer.domElement);
        ptrControls.pointerSpeed = 1;
    
        viewport.addEventListener( 'click', () => {
            ptrControls.lock();
        });

        const { material } = grassMaterial();

        const floor = new THREE.Mesh(
            new THREE.BoxGeometry( WIDTH, 1, HEIGHT ),
            material
        );
        floor.position.x = WIDTH/2;
        floor.position.y = -1;
        floor.position.z = HEIGHT/2;

        scene.add( floor );

        createWalls({ scene });

        function onWindowResize() {
            // camera.aspect = window.innerWidth / window.innerHeight;
            // camera.updateProjectionMatrix();
            // renderer.setSize( window.innerWidth, window.innerHeight );
            fpsControls.handleResize();
        }
        window.addEventListener( 'resize', onWindowResize );

        function animate() {
            switch (ctrls) {
                case CONTROLS.FPS:
                    fpsControls.update( clock.getDelta() );
                    break;
                case CONTROLS.FLY:
                    flyControls.update( clock.getDelta() );
                    break;
                case CONTROLS.ORBIT:
                    break;
                case CONTROLS.PTR:
                    ptrControls.update( clock.getDelta() );
                    break;  
            }
            
            renderer.render( scene, camera );
            // fogAnimate();
        } 
        renderer.setAnimationLoop( animate );
    }

    main();

})();