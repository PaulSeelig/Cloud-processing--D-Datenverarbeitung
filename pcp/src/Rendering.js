import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { XYZLoader } from 'three/addons/loaders/XYZLoader.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import Stats from 'three/addons/libs/stats.module.js';

import AddScene from './AddScene';


//let particles;

//const PARTICLE_SIZE = 20;

//let raycaster, intersects;
//let pointer, INTERSECTED;
const color = new THREE.Color();
const white = new THREE.Color().setHex(0xffffff);



function RenderFileOnCanvas(files, canvas,) {

    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas, alpha: true });
    renderer.setClearColor(0x000000, 0);
    const { scene, camera } = AddScene();

    const controls = new OrbitControls(camera, renderer.domElement);
    var D3_Mesh = null;
    //var PickPoint1 = new THREE.Sphere(new );
    var P1 = new THREE.Mesh(new THREE.SphereGeometry(10, 10, 10), new THREE.MeshBasicMaterial({ color: 0x329044 }));

    var P2 = new THREE.Mesh(new THREE.SphereGeometry(10, 10, 10), new THREE.MeshBasicMaterial({ color: 0x329044 }));

    var P3 = new THREE.Mesh(new THREE.SphereGeometry(10, 10, 10), new THREE.MeshBasicMaterial({ color: 0x329044 }));

    scene.add(P1);
    scene.add(P2);
    scene.add(P3);
    const pointsize = canvas.parentNode.querySelector('.pointsize');
    const pointclr = canvas.parentNode.querySelector('[name="colors"]');
    const rotate = canvas.parentNode.querySelector('[name="rotate"]');
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 0.1
    const pointer = new THREE.Vector2();
    function onPointerClick(event) {
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
   
    }

    canvas.addEventListener('pointerclick', onPointerClick);
    //document.addEventListener('pointermove', onPointerClick);
    for (const file of files) {

        const reader = new FileReader();
        const PointsMaterial = new THREE.PointsMaterial({ color: pointclr.value, size: pointsize.value / 500000 });
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const geometry = new THREE.BufferGeometry();
            let positions = [];
            let colors = [];

            function handleGeometry(parsedGeometry) {
                positions = parsedGeometry.attributes.position.array;

                // Generate random colors for each point for demonstration
                for (let i = 0; i < positions.length; i += 3) {
                    colors.push(Math.random(), Math.random(), Math.random());
                }

                geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
                geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

                D3_Mesh = new THREE.Points(geometry, PointsMaterial);
                scene.add(D3_Mesh);
            }

            if (file.name.endsWith('.ply')) {
                new PLYLoader().load(e.target.result, handleGeometry, undefined, console.error);
            } else if (file.name.endsWith('.xyz')) {
                new XYZLoader().load(e.target.result, handleGeometry, undefined, console.error);
            } else if (file.name.endsWith('.stl')) {
                new STLLoader().load(e.target.result, handleGeometry, undefined, console.error);
            } else {
                return console.error("Unsupported file type");
            }
            pointsize.addEventListener("input", function () { D3_Mesh.material.size = pointsize.value / 500000 });
            pointclr.addEventListener("input", function () { D3_Mesh.material.color = new THREE.Color(pointclr.value) });// CreatePointsMaterial() });
        }
    }
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
        if (resizeRendererToDisplaySize(renderer)) {
            renderer.clear(true, true);
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        controls.update();
        raycaster.setFromCamera(pointer, camera);

        if (D3_Mesh) {
            const intersects = raycaster.intersectObject(D3_Mesh);
            if (intersects.length > 0) {
                const intersect = intersects[0];
                console.info(intersect.point);
                P1.position.x = intersect.point.x;

                P1.position.y = intersect.point.y;

                P1.position.z = intersect.point.z;
            }
        }
        
        renderer.render(scene, camera);

        if (rotate.checked) { scene.rotation.z = 0.00025 * time; }

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
export default RenderFileOnCanvas;
