import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { XYZLoader } from 'three/addons/loaders/XYZLoader.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import AddScene from './AddScene';


let particles;

const PARTICLE_SIZE = 20;

let raycaster, intersects;
let pointer, INTERSECTED;
function onPointerClick(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
 }
 /**
  * Thats a lot to comment on... will be done later
  * @param {any} file
  * @param {any} canvas
  */
function RenderFileOnCanvas(file, canvas)
{
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas, alpha: true });
    renderer.setClearColor(0x000000, 0);
    const { scene, camera } = AddScene();

    const controls = new OrbitControls(camera, renderer.domElement);
    var D3_Mesh = new THREE.Points();
    const reader = new FileReader();
    const pointsize = canvas.parentNode.querySelector('.pointsize');
    const pointclr = canvas.parentNode.querySelector('[name="colors"]');
    const rotate = canvas.parentNode.querySelector('[name="rotate"]');
    //const raycaster = new THREE.Raycaster();
    //const pointer = new THREE.Vector2();
    document.addEventListener('pointermove', onPointerClick);
    const PointsMaterial = new THREE.PointsMaterial({ color: pointclr.value, size: pointsize.value / 500000 });
    reader.readAsDataURL(file);
    reader.onload = (e) =>
    {
        if (file.name.endsWith('.ply')) {
            new PLYLoader().load(e.target.result,
                function (e) {
                    D3_Mesh = new THREE.Points(e.center(), PointsMaterial);
                    scene.add(D3_Mesh);
                },
                undefined,
                function (error) { console.error(error); }
            );
        }
        else if (file.name.endsWith('.xyz')) {
            new XYZLoader().load(e.target.result,
                function (e) {
                    D3_Mesh = new THREE.Points(e.center(), PointsMaterial);
                    scene.add(D3_Mesh);
                },
                undefined,
                function (error) { console.error(error); }
            );
        }
        else if (file.name.endsWith('.stl')) {
            new STLLoader().load(e.target.result,
                function (e) {
                    D3_Mesh = new THREE.Points(e.center(), PointsMaterial);
                    scene.add(D3_Mesh);
                },
                undefined,
                function (error) { console.error(error) }
            );
        }
        else {return console.error("something went wrong") }
        pointsize.addEventListener("input", function () { D3_Mesh.material.size = pointsize.value / 500000 });
        pointclr.addEventListener("input", function () { D3_Mesh.material.color = new THREE.Color(pointclr.value) });// CreatePointsMaterial() });
    }
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
        if (resizeRendererToDisplaySize(renderer))
        {
            renderer.clear(true, true);
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        
        controls.update();
        //raycaster.params.Points.threshold = 0.1;
        //raycaster.setFromCamera(pointer, camera);
        //particles = D3_Mesh;
        //intersects = raycaster.intersectObject(particles);

        //if (intersects.length > 0) {

        //    if (INTERSECTED != intersects[0].index) {

        //        pointsize.array[INTERSECTED] = PARTICLE_SIZE;

        //        INTERSECTED = intersects[0].index;

        //        pointsize.array[INTERSECTED] = PARTICLE_SIZE * 1.25;
        //        pointsize.needsUpdate = true;

        //    }

        //} else if (INTERSECTED != null) {

        //    pointsize.array[INTERSECTED] = PARTICLE_SIZE;
        //    pointsize.needsUpdate = true;
        //    INTERSECTED = null;

        //}
        renderer.render(scene, camera);

        if (rotate.checked) { scene.rotation.z = 0.00025 * time; }

        canvas.addEventListener('pointerchange', onPointerClick);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
export default RenderFileOnCanvas;