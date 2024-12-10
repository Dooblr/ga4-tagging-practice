import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';

export class CarScene {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.controls = null;
        this.car = null;
        this.base = null;
        this.isReady = false;
        this.onReadyCallback = null;
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.physicallyCorrectLights = true;
        document.getElementById('car-container').appendChild(this.renderer.domElement);

        // Setup camera
        this.camera.position.set(1, 2, 5);
        this.camera.lookAt(0, 0, 0);

        // Setup controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 1.5;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 10;

        // Setup lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Add multiple directional lights for better illumination
        const lights = [
            { position: [5, 5, 5], intensity: 1 },
            { position: [-5, 3, -5], intensity: 0.8 },
            { position: [0, 5, 0], intensity: 0.5 },
            { position: [0, -2, 5], intensity: 0.3 }
        ];

        lights.forEach(light => {
            const directionalLight = new THREE.DirectionalLight(0xffffff, light.intensity);
            directionalLight.position.set(...light.position);
            this.scene.add(directionalLight);
        });

        // Create environment map for reflections
        const cubeTextureLoader = new THREE.CubeTextureLoader();
        const envMap = cubeTextureLoader.load([
            'https://threejs.org/examples/textures/cube/Bridge2/posx.jpg',
            'https://threejs.org/examples/textures/cube/Bridge2/negx.jpg',
            'https://threejs.org/examples/textures/cube/Bridge2/posy.jpg',
            'https://threejs.org/examples/textures/cube/Bridge2/negy.jpg',
            'https://threejs.org/examples/textures/cube/Bridge2/posz.jpg',
            'https://threejs.org/examples/textures/cube/Bridge2/negz.jpg'
        ]);
        this.scene.environment = envMap;

        // Create rotating base
        const baseGeometry = new THREE.CylinderGeometry(2, 2, 0.1, 32);
        const baseMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x111111,
            metalness: 0.9,
            roughness: 0.5,
            transparent: true,
            opacity: 0,
            envMapIntensity: 0.8
        });
        this.base = new THREE.Mesh(baseGeometry, baseMaterial);
        this.base.position.y = -0.05;
        this.scene.add(this.base);

        this.createSimpleCar();

        this.isReady = true;
        if (this.onReadyCallback) this.onReadyCallback();

        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        this.animate();
    }

    createSimpleCar() {
        this.car = new THREE.Group();

        // Create metallic material
        const bodyMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x2b2b2b,
            metalness: 1,
            roughness: 0.2,
            transparent: true,
            opacity: 0,
            envMapIntensity: 1.5
        });

        // Create glass material for windshield
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x88ccff,
            metalness: 0.1,
            roughness: 0.1,
            transparent: true,
            opacity: 0.3,
            transmission: 0.9,
            thickness: 0.5,
            envMapIntensity: 1.2,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            side: THREE.DoubleSide
        });

        // Simple box for car body
        const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 1);
        const carBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
        carBody.position.y = 0.5;
        this.car.add(carBody);

        // Create triangular windshield
        const windshieldGeometry = new THREE.BufferGeometry();
        
        // Define vertices for triangular windshield (narrower and smaller)
        const vertices = new Float32Array([
            // Front triangle
            0.3, 0, 0.4,     // bottom left
            -0.3, 0, 0.4,    // bottom right
            0, 0.5, 0.4,     // top center

            // Back triangle
            0.3, 0, -0.4,    // bottom left
            -0.3, 0, -0.4,   // bottom right
            0, 0.5, -0.4     // top center
        ]);

        // Define indices to create faces
        const indices = new Uint16Array([
            0, 1, 2,    // front face
            3, 4, 5,    // back face
            0, 3, 2,    // left side
            2, 3, 5,    // top
            1, 4, 2,    // right side
            2, 4, 5     // top right
        ]);

        windshieldGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        windshieldGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
        windshieldGeometry.computeVertexNormals();

        const windshield = new THREE.Mesh(windshieldGeometry, glassMaterial);
        // Adjust position for smaller windshield
        windshield.position.set(0.7, 0.5, 0);
        this.car.add(windshield);

        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16);
        const wheelMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x111111,
            metalness: 1,
            roughness: 0.3,
            transparent: true,
            opacity: 0
        });

        const wheelPositions = [
            { x: -0.7, z: 0.4 },   // front left
            { x: 0.7, z: 0.4 },    // front right
            { x: -0.7, z: -0.4 },  // rear left
            { x: 0.7, z: -0.4 }    // rear right
        ];

        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.position.set(pos.x, 0.2, pos.z);
            wheel.rotation.x = Math.PI / 2;
            this.car.add(wheel);
        });

        // Position the car on the base
        this.car.position.y = 0.1;
        this.base.add(this.car);
    }

    fadeIn() {
        if (!this.car) return;
        
        // Fade in all meshes
        this.scene.traverse((child) => {
            if (child.isMesh) {
                gsap.to(child.material, {
                    opacity: 1,
                    duration: 1.5,
                    ease: 'power2.inOut'
                });
            }
        });

        // Add a slow rotation animation to the base
        gsap.to(this.base.rotation, {
            y: this.base.rotation.y + Math.PI * 2,
            duration: 15,
            ease: 'none',
            repeat: -1
        });
    }

    onReady(callback) {
        this.onReadyCallback = callback;
        if (this.isReady) callback();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.renderer.render(this.scene, this.camera);
    }
} 