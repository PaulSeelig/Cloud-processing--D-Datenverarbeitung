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
    var D3_Mesh2 = null;
    const pointsize = canvas.parentNode.querySelector('.pointsize');
    const pointsize2 = canvas.parentNode.querySelectorAll('.pointsize')[1];
    const pointclr = canvas.parentNode.querySelector('[name="colors"]');
    const pointclr2 = canvas.parentNode.querySelectorAll('[name="colors"]')[1];
    function NewPoint(colour) { return new THREE.Mesh(new THREE.SphereGeometry(1 + pointsize.value / 500000, 1, 1), new THREE.MeshBasicMaterial({ color: colour })); }
    var P1 = NewPoint(0x3d9044);
    var P2 = NewPoint(0x32f044);
    var P3 = NewPoint(0x3290e4);
    const PZero = NewPoint(0x000000)
    const Points = new THREE.Object3D()
    Points.add(P1);
    Points.add(P2);
    Points.add(P3);
    scene.add(Points);
    var PCounter = 1;
    //const rotate = canvas.parentNode.querySelector('[name="rotate"]');
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 0.1
    const pointer = new THREE.Vector2();
    function onPointerClick(event) {
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        function SetPoint(P, intersect) {
            P.position.copy(intersect.point);
            PCounter++;
            canvas.textContent = PCounter > 3 ? JSON.stringify([P1.position, P2.position, P3.position ]) : '';
        }

        if (D3_Mesh) {
            raycaster.setFromCamera(pointer, camera);
            //const intersects = raycaster.intersectObject(event.type == 'click' ? D3_Mesh : Points);
            raycaster.params.Points.threshold = 1000000000;
            const P = raycaster.intersectObject(P1).length > 0 ? P1 : raycaster.intersectObject(P2).length > 0 ? P2 : raycaster.intersectObject(P3).length > 0 ? P3 : null;
            if (P) {
                console.info(P.point + "removed to zero");
                P.position.copy(PZero.position);
                canvas.textContent = '';
                PCounter--;
            }
            else
            {
                raycaster.params.Points.threshold = 0.1
                const intersects = raycaster.intersectObject(D3_Mesh);
                if (intersects.length > 0)
                {
                    const intersect = intersects[0];
                    console.info(intersect.point);
                    P1.position.equals(PZero.position) ? SetPoint(P1, intersect) : P2.position.equals(PZero.position) ? SetPoint(P2, intersect) : P3.position.equals(PZero.position) ? SetPoint(P3, intersect) : "";
                }
            }
        }
    }
    for (var i = 0; i < files.length; i++) {
        const a = i; // This may look stupid, but listen: onload is an event that is fired after the loop already counted 'i' up to 1 ... it doesn't count the 'a' up though
        const reader = new FileReader();
        const PointsMaterial = new THREE.PointsMaterial({ color:  pointclr.value, size: pointsize.value / 500000 });
        reader.readAsDataURL(files[i]);
        reader.onload = (e) => {
            const geometry = new THREE.BufferGeometry();
            let positions = [];
            let colors = [];

            function handleGeometry(parsedGeometry) {
                positions = parsedGeometry.attributes.position.array;

                geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
                geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
                a == 0 ? D3_Mesh = new THREE.Points(geometry, PointsMaterial)  : D3_Mesh2 = new THREE.Points(geometry, PointsMaterial) ;
                scene.add(a == 0 ? D3_Mesh : D3_Mesh2);
            }

            if (files[a].name.endsWith('.ply')) {
                new PLYLoader().load(e.target.result, handleGeometry, undefined, console.error);
            } else if (files[a].name.endsWith('.xyz')) {
                new XYZLoader().load(e.target.result, handleGeometry, undefined, console.error);
            } else if (files[a].name.endsWith('.stl')) {
                new STLLoader().load(e.target.result, handleGeometry, undefined, console.error);
            } else {
                return console.error("Unsupported file type");
            }
            if (a == 0) {
                pointsize.addEventListener("input", function () { D3_Mesh.material.size = pointsize.value / 500000 });
                pointclr.addEventListener("input", function () { D3_Mesh.material.color = new THREE.Color(pointclr.value) });
                
            }
            else {
                pointsize2.addEventListener("input", function () { D3_Mesh2.material.size = pointsize2.value / 500000 });
                pointclr2.addEventListener("input", function () { D3_Mesh2.material.color = new THREE.Color(pointclr2.value) });
            }
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

        //if (rotate.checked) { scene.rotation.z = 0.00025 * time; }

        requestAnimationFrame(render);
    }

    canvas.addEventListener('dblclick', onPointerClick);
    canvas.addEventListener('contextmenu', onPointerClick);
    requestAnimationFrame(render);
}
export default RenderFileOnCanvas;