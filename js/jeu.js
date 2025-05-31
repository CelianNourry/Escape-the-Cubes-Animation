import * as THREE from "three";
import { GLTFLoader } from "gltf";

let cnv = document.querySelector('#myCanvas');
let renderer = new THREE.WebGLRenderer({ canvas: cnv, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5); // Position de la lumière
directionalLight.castShadow = true; // Autoriser cette lumière à projeter des ombres
directionalLight.shadow.mapSize.width = 1024; // Optionnel : taille de la texture d'ombre
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
scene.add(directionalLight);

//Le joueur qui est une sphère
let sphereGeometry = new THREE.SphereGeometry(0.5, 20, 20);
let texture = new THREE.TextureLoader().load("../assets/Balle.bmp");
let sphereMaterial = new THREE.MeshBasicMaterial({ map: texture });
let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.y = -3
scene.add(sphere);

//Bordures blanches
let geometry_cube1 = new THREE.PlaneGeometry(1, 10);  // 100x100 unités
let material_cube1 = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
let _cube1 = new THREE.Mesh(geometry_cube1, material_cube1);
_cube1.position.x = 3;
let geometry_cube2 = new THREE.PlaneGeometry(1, 10);  // 100x100 unités
let material_cube2 = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
let _cube2 = new THREE.Mesh(geometry_cube2, material_cube2);
_cube2.position.x = -3;

scene.add(_cube1);
scene.add(_cube2);

let moveLeft = false;
let moveRight = false;

let alive = true;
let collisionDetected = false;

const vies_initiale = 3;
let vies_actuelles = 3;

//Liste de tous les cubes
let cubes = []
let vies = []

async function creer_cube(cubes){
    const x = Math.floor(Math.random() * 5) + 1

    let asteroide = undefined;
    let data = await loader.loadAsync("assets/asteroid.glb");
        if(data) {
        asteroide = data.scene;
        asteroide.position.y = 3;
        asteroide.position.x = 4.5;
        asteroide.scale.set(0.1, 0.1, 0.075);
        scene.add(asteroide);
        vies.push(asteroide)
        }
    asteroide.position.y = 5;

    asteroide.castShadow = true;
    let direction = 0;
    switch(x){
        case 1:
            asteroide.position.x = -2;
            break;
        case 2:
            asteroide.position.x = -1;
            break;
        case 3:
            asteroide.position.x = 0;
            break;
        case 4:
            asteroide.position.x = 1;
            break;
        default:
            asteroide.position.x = 2;
            break;
    }
    cubes.push(asteroide);
    scene.add(asteroide);
    return direction;
}

class AABBox {
    constructor() {
        this.min = new THREE.Vector3();
        this.max = new THREE.Vector3();
    }
    initWithObj(obj) {
        let minx = obj.geometry.attributes.position.array[0];
        let miny = obj.geometry.attributes.position.array[1];
        let minz = obj.geometry.attributes.position.array[2];
        let maxx = minx;
        let maxy = miny;
        let maxz = minz;
        for(let i = 1; i < obj.geometry.attributes.position.count; i++) {
            let nx = obj.geometry.attributes.position.array[i*3];
            let ny = obj.geometry.attributes.position.array[1+i*3];
            let nz = obj.geometry.attributes.position.array[2+i*3];
            if(nx < minx) minx = nx;
            if(ny < miny) miny = ny;
            if(nz < minz) minz = nz;
            if(nx > maxx) maxx = nx;
            if(ny > maxy) maxy = ny;
            if(nz > maxz) maxz = nz;
        }
        this.min = new THREE.Vector3(obj.position.x+minx,
        obj.position.y+miny,obj.position.z+minz);
        this.max = new THREE.Vector3(obj.position.x+maxx,
        obj.position.y+maxy,obj.position.z+maxz);
        }
    collision(anotherAabb) {
        if(this.max.x < anotherAabb.min.x || this.min.x > anotherAabb.max.x)
            return false;
        if(this.max.y < anotherAabb.min.y || this.min.y > anotherAabb.max.y)
            return false;
        if(this.max.z < anotherAabb.min.z || this.min.z > anotherAabb.max.z)
            return false;
        return true;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onWindowResize);

function supprimerObjet(objet) {
    scene.remove(objet);
    objet.geometry.dispose();
    objet.material.dispose();

    objet = null;
}

function supprimerCoeur(objet) {
    scene.remove(objet);

    if (objet.geometry) objet.geometry.dispose();
    if (objet.material) {
        if (Array.isArray(objet.material)) {
            objet.material.forEach(mat => mat.dispose());
        } else {
            objet.material.dispose();
        }
    }
    objet = null; // Nettoyage final de la référence
}

setInterval(() => {
    creer_cube(cubes);
}, 500);

let heart = undefined;
let heart1 = undefined;
let heart2 = undefined;
let loader = new GLTFLoader();

let data = await loader.loadAsync("assets/heart.glb");
if(data) {
  heart = data.scene;
  heart.position.y = 3;
  heart.position.x = 4.5;
  heart.scale.set(0.1, 0.1, 0.075);
  scene.add(heart);
  vies.push(heart)
}

let data1 = await loader.loadAsync("assets/heart.glb");
if(data1) {
    heart1 = data1.scene;
    heart1.position.y = 3;
    heart1.position.x = 5.75;
    heart1.scale.set(0.1, 0.1, 0.075);
    scene.add(heart1);
    vies.push(heart1)
}

let data2 = await loader.loadAsync("assets/heart.glb");
if(data2) {
    heart2 = data2.scene;
    heart2.position.y = 3;
    heart2.position.x = 7;
    heart2.scale.set(0.1, 0.1, 0.075);
    scene.add(heart2);
    vies.push(heart2)
}

function animate() {
    if (moveLeft && sphere.position.x > -2) sphere.position.x -= 0.15;
    if (moveRight && sphere.position.x < 2) sphere.position.x += 0.15;

    let sphereAABB = new AABBox();
    sphereAABB.initWithObj(sphere);

    for (let i = 0; i < cubes.length && alive; i++) {
        let cube = cubes[i];

        if (cube.position.y < -4.5) {
            scene.remove(cube);
            cubes.splice(i, 1);
            continue;
        }
        let cubeAABB = new AABBox();
        cubeAABB.initWithObj(cube);

        if (sphereAABB.collision(cubeAABB) && !collisionDetected) {
            collisionDetected = true
            cube.material.color.set(0xff0000);
            setTimeout(() => {
                if (vies_actuelles > 0) {
                    let index = vies_actuelles - 1;
                    supprimerCoeur(vies[index]);
                    vies.splice(index, 1);
                    vies_actuelles--;
                }
                if (vies_actuelles <= 0) {
                    alive = false;
                    supprimerObjet(sphere);
                }
                collisionDetected = false;
            }, 1000);
        }

        if (cube.position.y - 2.5 < sphere.position.y){
          switch(cube.position.x){
              case -2:
                  moveLeft = false;
                  moveRight = true;
                  break;
              case -1:
                moveLeft = false;
                moveRight = true;
                  break;
              case 0:
                if (cube.position.x > 0){
                    moveLeft = true;
                    moveRight = false;
                }
                else{
                    moveLeft = false;
                    moveRight = true;
                }
                  break;
              case 1:
                moveLeft = true;
                moveRight = false;
                  break;
              default:
                moveLeft = true;
                moveRight = false;
                  break;
          }
        }

        cube.rotation.y += 0.01;
        cube.position.y -= 0.1;
        sphere.rotation.x -= 0.01;
        for (let j = 0; j < vies.length; j++) {
            vies[j].rotation.y += 0.01;
        }
    }
    renderer.render(scene, camera);
}
