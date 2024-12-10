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
        this.isReady = false;
        this.onReadyCallback = null;
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x000000, 0);
        document.getElementById('car-container').appendChild(this.renderer.domElement);

        // Setup camera
        this.camera.position.set(5, 3, 7);
        this.camera.lookAt(0, 0, 0);

        // Setup controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 1.5;
        this.controls.minDistance = 4;
        this.controls.maxDistance = 10;

        // Setup lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        // Create low poly car
        this.createLowPolyCar();

        this.isReady = true;
        if (this.onReadyCallback) this.onReadyCallback();

        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this), false);

        // Start animation loop
        this.animate();
    }

    createLowPolyCar() {
        // Create car group
        this.car = new THREE.Group();

        // Car body - main body
        const bodyGeometry = new THREE.BoxGeometry(3, 0.75, 1.5);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0,
            flatShading: true
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;

        // Car body - cabin
        const cabinGeometry = new THREE.BoxGeometry(1.5, 0.5, 1.3);
        const cabin = new THREE.Mesh(cabinGeometry, bodyMaterial);
        cabin.position.set(-0.3, 1.1, 0);

        // Hood slope
        const hoodGeometry = new THREE.BoxGeometry(1, 0.3, 1.4);
        const hood = new THREE.Mesh(hoodGeometry, bodyMaterial);
        hood.position.set(0.9, 0.75, 0);
        hood.rotation.z = -Math.PI * 0.08;

        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8);
        const wheelMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0,
            flatShading: true
        });

        const wheelPositions = [
            { x: -0.9, z: 0.8 },  // front left
            { x: -0.9, z: -0.8 }, // front right
            { x: 0.9, z: 0.8 },   // back left
            { x: 0.9, z: -0.8 }   // back right
        ];

        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.position.set(pos.x, 0.3, pos.z);
            wheel.rotation.x = Math.PI / 2;
            this.car.add(wheel);
        });

        // Add all parts to car
        this.car.add(body);
        this.car.add(cabin);
        this.car.add(hood);

        // Add car to scene
        this.car.rotation.y = Math.PI / 4;
        this.scene.add(this.car);
    }

    onReady(callback) {
        this.onReadyCallback = callback;
        if (this.isReady) callback();
    }

    fadeIn() {
        if (!this.car) return;
        
        this.car.traverse((child) => {
            if (child.isMesh) {
                gsap.to(child.material, {
                    opacity: 1,
                    duration: 1.5,
                    ease: 'power2.inOut'
                });
            }
        });

        // Add a slow rotation animation
        gsap.to(this.car.rotation, {
            y: this.car.rotation.y + Math.PI * 2,
            duration: 20,
            ease: 'none',
            repeat: -1
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
} 