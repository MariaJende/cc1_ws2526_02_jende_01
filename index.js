import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

// ---------- Scene Setup ----------
const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(35, w / h, 0.0001, 4000);
camera.position.z = 600;

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(w, h);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ---------- Lighting ----------
/*const hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.3);
scene.add(hemiLight);*/

const pointLight = new THREE.PointLight(0xffffff, 50, 0, 0);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

const pointLightHelper = new THREE.PointLightHelper(pointLight, 20);
scene.add(pointLightHelper);

// ---------- Utils ----------
function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

// ---------- Globals ----------
const patternGroup = new THREE.Group();
scene.add(patternGroup);

const arcs = []; // stores arc animation data

// ---------- Create Pattern ----------
function createCurvedPattern() {
    const arcCount = 30;

    for (let i = 0; i < arcCount; i++) {
        const hue = randomInRange(200, 360);
        const color = new THREE.Color(`hsl(${hue}, 50%, 30%)`);

        const radius = randomInRange(10, 200);
        const startDeg = randomInRange(0, 360);
        const speed = randomInRange(0.002, 0.01);

        // ----- Main circle (optional) -----
        const circleGeom = new THREE.CircleGeometry(1, 32);
        const circleMat = new THREE.MeshLambertMaterial({ 
            color: 0xffffff,
        });
        const circle = new THREE.Mesh(circleGeom, circleMat);

        // ----- Multiple Points on Arc -----
        const pointCount = 50; // number of points per arc
        const points = [];

        for (let j = 0; j < pointCount; j++) {
            const angleOffset = (j / pointCount) * Math.PI * 2;

            const pointGeom = new THREE.SphereGeometry(20, 32, 32);
            const pointMat = new THREE.MeshStandardMaterial({ 
                color,
                metallness: 0.9,
                roughness: 0.0,
             });
            const point = new THREE.Mesh(pointGeom, pointMat);

            // Initial position
            point.position.set(
                radius * Math.cos(startDeg * Math.PI / 180 + angleOffset),
                radius * Math.sin(startDeg * Math.PI / 180 + angleOffset),
                0
            );

            patternGroup.add(point);
            points.push({ mesh: point, angleOffset });
        }

        // Initial circle position
        circle.position.set(
            radius * Math.cos(startDeg * Math.PI / 180),
            radius * Math.sin(startDeg * Math.PI / 180),
            100
        )

        patternGroup.add(circle);
        //patternGroup.add(arcGroup);

        // Save animation data
        arcs.push({
            //arcGroup,
            circle,
            points,
            radius,
            baseAngle: startDeg * Math.PI / 180,
            speed
        });
    }
}


// ---------- Update Pattern ----------
function updateCurvedPattern() {
    arcs.forEach(arc => {
        arc.baseAngle += arc.speed;

        /*// Rotate line arc
        arc.arcGroup.rotation.z = arc.baseAngle;*/

        // Move main circle
        arc.circle.position.set(
            arc.radius * Math.cos(arc.baseAngle),
            arc.radius * Math.sin(arc.baseAngle),
            0
        );

        // Move all points
        arc.points.forEach(p => {
            p.mesh.position.set(
                arc.radius * Math.cos(arc.baseAngle + p.angleOffset),
                arc.radius * Math.sin(arc.baseAngle + p.angleOffset),
                0
            );
        });
    });
}

// ---------- Animation Loop ----------
let lastTime = 0;

function animate(time) {
    requestAnimationFrame(animate);

    if (time - lastTime < 1000 / 30) return;
    lastTime = time;

    controls.update();
    updateCurvedPattern();
    renderer.render(scene, camera);
}

// ---------- Init ----------
createCurvedPattern();
animate();
