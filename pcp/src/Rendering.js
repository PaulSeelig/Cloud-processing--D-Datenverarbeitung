import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { XYZLoader } from 'three/addons/loaders/XYZLoader.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

import AddScene from './AddScene';

function RenderFileOnCanvas(files, canvas, tMatrix, params1, params2) {
    tMatrix ? tMatrix = tMatrix.matrix : '';
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas, alpha: true });
    renderer.setClearColor(0x000000, 0);
    const { scene, camera } = AddScene();

    const controls = new OrbitControls(camera, renderer.domElement);
    var D3_Mesh = null;
    var D3_Mesh2 = null;
    const pointsize = canvas.parentNode.querySelector('.pointsize');
    const pointsize2 = canvas.parentNode.querySelectorAll('.pointsize')[1];
    const ppointsize = document.querySelector('[name = "pick_pointsize"]');
    const pointclr = canvas.parentNode.querySelector('[name="colors"]');
    const pointclr2 = canvas.parentNode.querySelectorAll('[name="colors"]')[1];
    if (params1) {
        pointsize.value = params1[0].value;
        pointsize2.value = params2[0].value;
        pointclr.value = params1[1].value;
        pointclr2.value = params2[1].value;
    }
    function NewPoint(colour) { return new THREE.Mesh(new THREE.SphereGeometry(1 + ppointsize.value / 250000, 1, 1), new THREE.MeshBasicMaterial({ color: colour })); }
    var [P1, P2, P3] = [NewPoint(0x3d9044), NewPoint(0x32f044), NewPoint(0x3290e4)];
    const PZero = NewPoint(0x000000);
    var Points = new THREE.Object3D();
    Points.add(P1);
    Points.add(P2);
    Points.add(P3);
    scene.add(Points);
    ppointsize.addEventListener('input', function () {
        const [s, d, w] = [P1.position, P2.position, P3.position];
        Points.clear(); 
        [P1, P2, P3] = [NewPoint(0x3d9044), NewPoint(0x32f044), NewPoint(0x3290e4)];
        P1.position.copy(s); P2.position.copy(d); P3.position.copy(w);
        Points.add(P1);
        Points.add(P2);
        Points.add(P3);
    });
    var PCounter = 1;
    const raycaster = new THREE.Raycaster();
    const raycasterPP = new THREE.Raycaster();
    raycasterPP.params.Points.threshold = 1000;
    raycasterPP.params.Line.threshold = 1;
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
            raycasterPP.setFromCamera(pointer, camera);
            const interPp = raycasterPP.intersectObject(Points)[0];
            const P = !interPp? null : interPp.object;
            if (P) {
                console.info(P.point + "removed to zero");
                P.position.copy(PZero.position);
                canvas.textContent = '';
                PCounter--;
            }
            else
            {
                const intersects = raycaster.intersectObject(D3_Mesh);
                if (intersects.length > 0)
                {
                    const intersect = intersects[0];
                    console.info(intersect.point);
                    P1.position.equals(PZero.position) ? SetPoint(P1, intersect) :
                        P2.position.equals(PZero.position) ? SetPoint(P2, intersect) :
                            P3.position.equals(PZero.position) ? SetPoint(P3, intersect) : "";
                }
            }
        }
    }
    
    for (var i = 0; i < files.length; i++) {
        const a = i; // This may look stupid, but listen: onload is an event that is fired after the loop already counted 'i' up to 1 ... it doesn't count the 'a' up though
        const reader = new FileReader();
        const PointsMaterial = new THREE.PointsMaterial({ color: a==0 ? pointclr.value : pointclr2.value, size: a==0 ? pointsize.value / 500000 : pointsize2.value / 500000 });
        reader.readAsDataURL(files[i]);
        reader.onload = (e) => {
            const geometry = new THREE.BufferGeometry();
            let positions = [];
            let colors = [];
            function setMatrix(D3_Mesh, tMatrix) {
                D3_Mesh.matrix.set(tMatrix[0], tMatrix[1], tMatrix[2], tMatrix[3], tMatrix[4], tMatrix[5], tMatrix[6], tMatrix[7], tMatrix[8], tMatrix[9], tMatrix[10], tMatrix[11], tMatrix[12], tMatrix[13], tMatrix[14], tMatrix[15]);
                    }
            function handleGeometry(parsedGeometry) {
                positions = parsedGeometry.attributes.position.array;

                geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
                geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
                a == 0 ? D3_Mesh = new THREE.Points(geometry, PointsMaterial)  : D3_Mesh2 = new THREE.Points(geometry, PointsMaterial) ;
                
                if (a == 0 && tMatrix) {
                    setMatrix(D3_Mesh, tMatrix);
                     D3_Mesh.matrixAutoUpdate = false;
                    const observer = new MutationObserver(
                        function () {
                            tMatrix = JSON.parse(canvas.textContent);
                            setMatrix(D3_Mesh, tMatrix.matrix);
                        }
                    );
                    observer.observe(canvas, { childList: true });
                }
                scene.add(a == 0 ? D3_Mesh : D3_Mesh2);
            }

            files[a].name.endsWith('.ply') ? 
                new PLYLoader().load(e.target.result, handleGeometry, undefined, console.error) :
                files[a].name.endsWith('.xyz') ?
                    new XYZLoader().load(e.target.result, handleGeometry, undefined, console.error) :
                    files[a].name.endsWith('.stl') ?
                        new STLLoader().load(e.target.result, handleGeometry, undefined, console.error) :
                        console.error("Unsupported file type"); // this is not an actual test for unsupported files... import() already tests for unsupported fileEnds ... therefor a break of thefunction is unnecessary
            
            if (a == 0) {
                pointsize.addEventListener("input", function () { D3_Mesh.material.size = pointsize.value / 500000 });
                pointclr.addEventListener("input", function () { D3_Mesh.material.color = new THREE.Color(pointclr.value) });
                
            }
            else {
                pointsize2.addEventListener("input", function () { D3_Mesh2.material.size = pointsize2.value / 500000 });
                pointclr2.addEventListener("input", function () { D3_Mesh2.material.color = new THREE.Color(pointclr2.value) });

                pointsize2.value = params2[0];
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
    function render() {
        if (resizeRendererToDisplaySize(renderer)) {
            renderer.clear(true, true);
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;

            
            camera.updateProjectionMatrix();
        }

        controls.update();
        raycaster.setFromCamera(pointer, camera);
        raycasterPP.setFromCamera(pointer, camera);


        
        renderer.render(scene, camera);

        //if (rotate.checked) { scene.rotation.z = 0.00025 * time; }

        requestAnimationFrame(render);
    }
    if (files.length == 1) {
        canvas.addEventListener('dblclick', onPointerClick);
        canvas.addEventListener('contextmenu', onPointerClick);
    }
    requestAnimationFrame(render);
}
export default RenderFileOnCanvas;