import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
// import { FlyControls } from 'three/addons/controls/FlyControls.js';

(() => {

    function main() {
        const scene = new THREE.Scene();
        const clock = new THREE.Clock();

        const WIDTH = 1280;
        const HEIGHT = 700;

        const viewport = document.querySelector(".viewport");
        const view_size = viewport.getBoundingClientRect();
        
        const camera = new THREE.PerspectiveCamera( 
            75, view_size.width / view_size.height, 0.1, 1000
        );

        camera.position.x = 0;
        camera.position.y = 2;
        camera.position.z = 0;

        const renderer = new THREE.WebGLRenderer({
            canvas: viewport
        });
        renderer.setSize( view_size.width, view_size.height );

        const floor = new THREE.Mesh(
            new THREE.BoxGeometry( WIDTH, 1, HEIGHT ),
            new THREE.MeshBasicMaterial({color: 0xFF0000})
        );
        floor.position.x = 0;
        floor.position.y = -1;
        floor.position.z = 0;
        // scene.add( floor );

        const cube = new THREE.Mesh(
            new THREE.BoxGeometry( 1, 1, 1 ),
            new THREE.MeshBasicMaterial({color: 0x00FF00})
        );
        cube.position.x = 0;
        cube.position.y = 2;
        cube.position.z = -5;
        // scene.add( cube );
        
        const pc = new PointerLockControls( camera, renderer.domElement );
        pc.lookSpeed = 0.5;

        viewport.addEventListener( 'click', () => {
            pc.lock();
        });

        const { animate: animateControls } = movement(pc);

        function gltf() {
            const gltfLoader = new GLTFLoader();
            const url = 'scene.glb';
            gltfLoader.load(url, (gltf) => {
              const root = gltf.scene;
              scene.add(root);
              console.log(dumpObject(root).join('\n'));
            });
        }

        gltf();

        function animate() {
            animateControls();
            pc.update( clock.getDelta() );
            renderer.render( scene, camera );
        }
        renderer.setAnimationLoop( animate );
    }

    function movement(controls) {

        const MOVE_SPEED = 50;
        let prevTime = performance.now();
        const velocity = new THREE.Vector3();
        const direction = new THREE.Vector3();
        let moveForward = false;
        let moveBackward = false;
        let moveLeft = false;
        let moveRight = false;

        const onKeyDown = function ( event ) {
            switch ( event.code ) {
                case 'ArrowUp':
                case 'KeyW':
                    moveForward = true;
                    break;

                case 'ArrowLeft':
                case 'KeyA':
                    moveLeft = true;
                    break;

                case 'ArrowDown':
                case 'KeyS':
                    moveBackward = true;
                    break;

                case 'ArrowRight':
                case 'KeyD':
                    moveRight = true;
                    break;
            }
        };

        const onKeyUp = function ( event ) {
            switch ( event.code ) {
                case 'ArrowUp':
                case 'KeyW':
                    moveForward = false;
                    break;

                case 'ArrowLeft':
                case 'KeyA':
                    moveLeft = false;
                    break;

                case 'ArrowDown':
                case 'KeyS':
                    moveBackward = false;
                    break;

                case 'ArrowRight':
                case 'KeyD':
                    moveRight = false;
                    break;
            }
        };

        document.addEventListener( 'keydown', onKeyDown );
        document.addEventListener( 'keyup', onKeyUp );

        return {
            animate: () => {
                const time = performance.now();
                if ( controls.isLocked === true ) {
                    direction.z = Number( moveForward ) - Number( moveBackward );
                    direction.x = Number( moveRight ) - Number( moveLeft );
                    direction.normalize();

                    const delta = ( time - prevTime ) / 1000;

                    velocity.x -= velocity.x * 10.0 * delta;
					velocity.z -= velocity.z * 10.0 * delta;

                    if ( moveForward || moveBackward ) velocity.z -= direction.z * MOVE_SPEED * delta;
                    if ( moveLeft || moveRight ) velocity.x -= direction.x * MOVE_SPEED * delta;

                    controls.moveRight( - velocity.x * delta );
                    controls.moveForward( - velocity.z * delta );
                }
                prevTime = time;
            }
        };
    }

    function dumpObject(obj, lines = [], isLast = true, prefix = '') {
        const localPrefix = isLast ? '└─' : '├─';
        lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
        const newPrefix = prefix + (isLast ? '  ' : '│ ');
        const lastNdx = obj.children.length - 1;
        obj.children.forEach((child, ndx) => {
          const isLast = ndx === lastNdx;
          dumpObject(child, lines, isLast, newPrefix);
        });
        return lines;
      }

    main();

})();