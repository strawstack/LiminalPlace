import * as THREE from 'three';
import { fogReplace } from "./fogReplace";

export function fog({ scene, clock }) {

    const {
        fogParsVert,
        fogVert,
        fogParsFrag,
        fogFrag
    } = fogReplace();

    const params = {
        fogNearColor: 0xfc4848,
        fogHorizonColor: 0xe4dcff,
        fogDensity: 0.15, // 0.0025,
        fogNoiseSpeed: 100,
        fogNoiseFreq: 0.0012,
        fogNoiseImpact: 0.5
    };

    const fog_material = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xefd1b5) });

    let terrainShader = null;

    function animate() {
        const deltaTime = clock.getDelta();
        if(terrainShader) {
            terrainShader.uniforms.time.value += deltaTime;
        }
    }

    (() => {
        scene.background = new THREE.Color(params.fogHorizonColor);
        scene.fog = new THREE.FogExp2(params.fogHorizonColor, params.fogDensity);

        fog_material.onBeforeCompile = shader => {
            shader.vertexShader = shader.vertexShader.replace(
                `#include <fog_pars_vertex>`,
                fogParsVert
            );
            shader.vertexShader = shader.vertexShader.replace(
                `#include <fog_vertex>`,
                fogVert
            );
            shader.fragmentShader = shader.fragmentShader.replace(
                `#include <fog_pars_fragment>`,
                fogParsFrag
            );
            shader.fragmentShader = shader.fragmentShader.replace(
                `#include <fog_fragment>`,
                fogFrag
            );
        
            const uniforms = ({
                fogNearColor: { value: new THREE.Color(params.fogNearColor) },
                fogNoiseFreq: { value: params.fogNoiseFreq },
                fogNoiseSpeed: { value: params.fogNoiseSpeed },
                fogNoiseImpact: { value: params.fogNoiseImpact },
                time: { value: 0 }
            });
        
            shader.uniforms = THREE.UniformsUtils.merge([shader.uniforms, uniforms]);
            terrainShader = shader;
        };
    })();

    return {
        fog_material,
        fogAnimate: animate
    };
}