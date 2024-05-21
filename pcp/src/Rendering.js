import * as THREE from 'three';
import ReactDOM from 'react-dom/client';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PCDLoader } from 'three/addons/loaders/PCDLoader.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { randFloat, randInt } from 'three/src/math/MathUtils';
import AddScene from './AddScene';

function RenderFileOnCanvas(file, canvas)
{
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas, alpha: true });
    renderer.setClearColor(0x000000, 0);
    const { scene, camera } = AddScene();

    //const loader = new PLYLoader().parse(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
        new PLYLoader().load(e.target.result,
            function (e) { scene.add(new THREE.Mesh(e, new THREE.MeshPhongMaterial({ color: 0xFFFFFF, emissive: 0xFFFFFF }) ))},
            function (error) { console.error(error); },
            function (error) { console.error(error); }); //(m) => {
            // Check if this is a mesh or a point cloud:
            //if (m.index) {
            //    opts.upAxis = '+Y'
            //    loadMesh(wrapGeometry(m), 'ply')
            //} else {
            //    opts.upAxis = '+Z'
            //    loadPointCloud(m)
            //}
        //});
        
    };
    //loader.load(file.result, function (plyfile) {scene.add(plyfile.scene);}, undefined, function (error) { console.error(error);});

    //const { left, right, top, bottom, width, height } = canvas.domElement.parentNode.getBoundingClientRect();
    camera.fov = 100000;
    scene.rotateX(10.4);
    camera.aspect = 0.3;
    camera.updateProjectionMatrix();

    function resizeRendererToDisplaySize(renderer) {
        renderer.clear(true, true);
        const canvas = renderer.domElement.parentNode;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);

        }

        return needResize;
    }

    function render(time) {
        time *= 0.001;

        if (resizeRendererToDisplaySize(renderer)) {
            renderer.clear(true, true);
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        renderer.render(scene, camera);

        scene.rotation.x = 0.5 * time;
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

    
function RenderOnCanvas(event) {
    const canvas = event.target //THREE.createCanvasElement();
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas, alpha: false });
    renderer.setClearColor(0x000000, 0);
    canvas.nextElementSibling.classList.add("hidden");
    const sceneInfo = AddScene(canvas.parentNode);
    const scene = sceneInfo.scene;
    const camera = sceneInfo.camera;
    scene.rotateX(-0.4);

// an array of objects who's rotation to update
    const objects = [];
    const ps = [];
    const solarsystem = new THREE.Object3D();
    scene.add(solarsystem);
    objects.push(solarsystem);

    const radius = 0.8;
    const widthSegments = 100;
    const heightSegments = 100;
    const sphereGeometry = new THREE.SphereGeometry(
    radius,
    widthSegments,
    heightSegments
    );
    
    const sunMaterial = new THREE.MeshPhongMaterial({ color: 0xaaFFaa, emissive: 0xddFFdd });
    const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
    sunMesh.scale.set(5, 5, 5);
    solarsystem.add(sunMesh);
    //objects.push(sunMesh);

    const dunGeometry = new THREE.BoxGeometry(2, 4, 2, 10, 10, 6);
    const dunMaterial = new THREE.MeshPhongMaterial({ color: 0xaa0Faa, emissive: 0xddF0dd });
    const dunMesh = new THREE.Mesh(dunGeometry, dunMaterial);
    dunMesh.position.x = -30;
    dunMesh.position.y = 15;
    //dunMesh.scale.set(5, 5, 5);
    solarsystem.add(dunMesh);
    objects.push(dunMesh);
    objects.push(sunMesh);

    for (var i = 0; i < 100; i++) {
        solarsystem.add(createPoint(Math.random() * 0.15, Math.random() * 100, Math.random() * 100, 0xFFF00F, 0xFFFFFF, Math.random() * 20 * Math.PI, Math.random() * 20 * Math.PI, 0));
        solarsystem.add(createPoint(Math.random() * 0.15, Math.random() * 100, Math.random() * 100, 0xFFF00F, 0xFFFFFF, Math.random() * (-20) * Math.PI, Math.random() * (- 20) * Math.PI, 0));
        solarsystem.add(createPoint(Math.random() * 0.15, Math.random() * 100, Math.random() * 100, 0xFFF00F, 0xFFFFFF, Math.random() * 20 * Math.PI, Math.random() * (- 20) * Math.PI, 0));
        solarsystem.add(createPoint(Math.random() * 0.15, Math.random() * 100, Math.random() * 100, 0xFFF00F, 0xFFFFFF, Math.random() * (-20) * Math.PI, Math.random() * 20 * Math.PI, 0));
        }

    ps.push(createPoint(2, 100, 10, 0xaaaaFF, 0x0000FF, 2, -45, 0));
    ps.push(createPoint(1, 20, 30, 0xaf0eaa, 0x2a0955, 1, -30, 0));
    ps.push(createPoint(1, 15, 300, 0x115511, 0x112244, 7, 10, 0));
    ps.forEach((p) => {
        solarsystem.add(p);
        objects.push(p);
    });

    const { left, right, top, bottom, width, height } = sceneInfo.displayElement.getBoundingClientRect();
    camera.fov = 1000;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    function resizeRendererToDisplaySize(renderer)
    {
        renderer.clear(true, true);
        const canvas = renderer.domElement.parentNode;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);

        }

        return needResize;
    }



    function render(time)
    {
        time *= 0.001;

        if (resizeRendererToDisplaySize(renderer)) {
            renderer.clear(true, true);
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        dunMesh.rotation.x = 0.5 * time;
        objects.forEach((obj) => {
            obj.rotation.z = 0.1*time;
            // obj.rotation.x = 0.05 * time;
            time *= 5;
        });
        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

function createPoint(radius, widthsegm, heightsegm, colr, emi, xp, yp, zp)
{
 //   var pointsgeometry = new THREE.SphereGeometry(radius, widthsegm, heightsegm);
    var pointsgeometry = new THREE.SphereGeometry(radius, 10, 10);
    var pointsmaterial = new THREE.MeshPhongMaterial({ color: colr, emissive: emi })
    var poin = new THREE.Mesh(pointsgeometry, pointsmaterial);
    poin.position.x = xp;
    poin.position.y = yp;
    poin.position.z = zp;
    return poin;
}


export default RenderFileOnCanvas;