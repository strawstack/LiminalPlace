import * as THREE from 'three';
import { perlinNoise } from '../fog/perlinNoise';

export function grassMaterial() {

    const { noise } = perlinNoise();

    const customParsVertex = `#include <uv_pars_vertex>
        varying vec2 vUv;
    `;

    const customVertex = `#include <uv_vertex>
        vUv = vec3( uv, 1 ).xy;
    `;

    const customParsFragment = `#include <uv_pars_fragment>
        varying vec2 vUv;
        ${noise}
    `;

    const customFragment = `
        float chunk = 32.0;
        float xv = floor(vUv.x * chunk) / chunk;
        float yv = floor(vUv.y * chunk) / chunk;
        float scale = 20.0;
        float n = cnoise(scale *vec3(xv, yv, 1.0/scale));
        float n1 = (n / 2.0 + 1.0) * 0.6 + 0.2; 
        vec4 diffuseColor = vec4( vec3(1, 1, 1) * n1 * vec3(0.0, 0.5, 0.0), opacity );
    `;

    // const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( { 
        color: 0x00ff00,
    } );

    material.onBeforeCompile = shader => {
        shader.vertexShader = shader.vertexShader.replace(
            `#include <uv_pars_vertex>`,
            customParsVertex
        );
        shader.vertexShader = shader.vertexShader.replace(
            `#include <uv_vertex>`,
            customVertex
        );
        shader.fragmentShader = shader.fragmentShader.replace(
            `#include <uv_pars_fragment>`,
            customParsFragment
        );
        shader.fragmentShader = shader.fragmentShader.replace(
            `vec4 diffuseColor = vec4( diffuse, opacity );`,
            customFragment
        );
    };

    return {
        material
    };
}