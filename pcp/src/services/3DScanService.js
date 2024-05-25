import * as THREE from 'three';
import { Point, Model3D } from '../models/model3d';

class Scan3DService {
    constructor() {
        this.model = new Model3D();
    }

    async load3DScan(file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/load3dscan', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to load 3D scan');
        }

        const data = await response.text();
        this.parsePoints(data);
        return this.model;
    }

    parsePoints(data) {
        const lines = data.trim().split('\n');
        lines.forEach(line => {
            const [x, y, z] = line.split(' ').map(Number);
            this.model.addPoint(x, y, z);
        });
    }

    async export3DScan(file1, file2) {
        const formData = new FormData();
        formData.append('file1', file1);
        formData.append('file2', file2);

        const response = await fetch('/api/export3dscan', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to export 3D scan');
        }

        const data = await response.text();
        const combinedModel = new Model3D();
        const lines = data.trim().split('\n');
        lines.forEach(line => {
            const [x, y, z] = line.split(' ').map(Number);
            combinedModel.addPoint(x, y, z);
        });

        return combinedModel;
    }

    visualize3DScan(container) {
        const points = this.model.getPoints().map(point => new THREE.Vector3(point.x, point.y, point.z));

        // Remove existing canvas if any
        const existingCanvas = container.querySelector('canvas');
        if (existingCanvas) {
            container.removeChild(existingCanvas);
        }

        // Create scene, camera, and renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // Create geometry and material for the points
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.PointsMaterial({ color: 0xff0000, size: 0.1 });
        const pointCloud = new THREE.Points(geometry, material);

        // Add point cloud to the scene
        scene.add(pointCloud);

        // Position the camera
        camera.position.z = 50;

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }

        animate();
    }
}

export default Scan3DService;
