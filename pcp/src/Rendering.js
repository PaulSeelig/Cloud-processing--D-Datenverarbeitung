import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { XYZLoader } from 'three/addons/loaders/XYZLoader.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
//import Stats from 'three/addons/libs/stats.module.js';

import AddScene from './AddScene';
function RenderFileOnCanvas(files, canvas,) {

    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas, alpha: true });
    renderer.setClearColor(0x000000, 0);
    const { scene, camera } = AddScene();

    const controls = new OrbitControls(camera, renderer.domElement);
    var D3_Mesh = null;
    const pointsize = canvas.parentNode.querySelector('.pointsize');
    const pointclr = canvas.parentNode.querySelector('[name="colors"]');
    function NewPoint(colour) { return new THREE.Mesh(new THREE.SphereGeometry(1 + pointsize.value / 500000, 1, 1), new THREE.MeshBasicMaterial({ color: colour })); }
    var P1 = NewPoint(0x3d9044);
    var P2 = NewPoint(0x32f044);
    var P3 = NewPoint(0x3290e4);
    scene.add(P1);
    scene.add(P2);
    scene.add(P3);
    var PCounter = 1;
    const rotate = canvas.parentNode.querySelector('[name="rotate"]');
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 0.1
    const pointer = new THREE.Vector2();
    function onPointerClick(event) {
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        function SetPoints(P, intersect)
        {
            P.position.copy(intersect.point);
            PCounter++;
            canvas.textContent = PCounter > 3 ? JSON.stringify(P1.position) + JSON.stringify(P2.position) + JSON.stringify(P3.position): '';
            //console.info(canvas.textContent);
        }
        if (D3_Mesh) {
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObject(D3_Mesh);
            if (intersects.length > 0) {
                const intersect = intersects[0];
                console.info(intersect.point);
                PCounter == 1 ? SetPoints(P1, intersect) : PCounter == 2 ? SetPoints(P2, intersect) : PCounter == 3 ? SetPoints(P3, intersect): "";
            }
        }
    }

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


        
        renderer.render(scene, camera);

        if (rotate.checked) { scene.rotation.z = 0.00025 * time; }

        requestAnimationFrame(render);
    }

    canvas.addEventListener('click', onPointerClick);
    requestAnimationFrame(render);
}
export default RenderFileOnCanvas;
