import * as THREE from 'three';
import ReactDOM from 'react-dom/client';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { XYZLoader } from 'three/addons/loaders/XYZLoader.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { randFloat, randInt } from 'three/src/math/MathUtils';
import AddScene from './AddScene';

function RenderFileOnCanvas(file, canvas)
{
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas, alpha: true });
    renderer.setClearColor(0x000000, 0);
    const { scene, camera } = AddScene();

    const controls = new OrbitControls(camera, renderer.domElement);
    //controls. = new THREE.Vector3(1, 0, 0);
    var D3_Mesh = new THREE.Points();
    const reader = new FileReader();
    const pointsize = canvas.parentNode.querySelector('.pointsize');
    const pointclr = canvas.parentNode.querySelector('[name="colors"]');
    const rotate = canvas.parentNode.querySelector('[name="rotate"]');
    reader.readAsDataURL(file);
    reader.onload = (e) =>
    {
        if (file.name.endsWith('.ply')) {
            new PLYLoader().load(e.target.result,
                function (e) {
                    D3_Mesh = new THREE.Points(e.center(), CreatePointsMaterial());
                    scene.add(D3_Mesh);
                },
                undefined,
                function (error) { console.error(error); }
            );
        }
        else if (file.name.endsWith('.xyz')) {
            new XYZLoader().load(e.target.result,
                function (e) {
                    D3_Mesh = new THREE.Points(e.center(), CreatePointsMaterial());
                    scene.add(D3_Mesh);
                },
                undefined,
                function (error) { console.error(error); }
            );
        }
        else {return console.error("Not supported file") }
        pointsize.addEventListener("input", function () { D3_Mesh.material = CreatePointsMaterial() });
        pointclr.addEventListener("input", function () { D3_Mesh.material = CreatePointsMaterial() });
    };
    function CreatePointsMaterial() { return new THREE.PointsMaterial({ color: pointclr.value, size: pointsize.value / 500000 }) }
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
        renderer.render(scene, camera);

        if (rotate.checked) {scene.rotation.z = 0.00025 * time;}
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
export default RenderFileOnCanvas;