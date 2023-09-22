import * as THREE from "three";

let mouseX = 0;
let mouseY = 0;


document.addEventListener("mousemove", (event) => {
  // нормализовать координаты мыши, чтобы они были в диапазоне от -1 до 1
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

const section = document.querySelector("section.flag");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const texture = new THREE.TextureLoader();

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
section.appendChild(renderer.domElement);

const geometry = new THREE.PlaneGeometry(20, 20, 200, 40);

const textureURL =
  "https://uploads-ssl.webflow.com/65095f9d22c26ab2a962d053/650b3d3be4ce1191487dc099_material-3.jpg";
const loadedTexture = texture.load(textureURL);
const normalMapURL =
  "https://uploads-ssl.webflow.com/65095f9d22c26ab2a962d053/650b3d3ba5170cf2cdfc02f4_normals.jpg";
const loadedNormalMap = texture.load(normalMapURL);

loadedTexture.wrapS = THREE.RepeatWrapping;
loadedTexture.wrapT = THREE.RepeatWrapping;
loadedTexture.repeat.set(5, 5); // Повторите текстуру 4 раза по горизонтали и 4 раза по вертикали
loadedNormalMap.wrapS = THREE.RepeatWrapping;
loadedNormalMap.wrapT = THREE.RepeatWrapping;
loadedNormalMap.repeat.set(5, 5);

const material = new THREE.MeshPhongMaterial({
  map: loadedTexture,
  normalMap: loadedNormalMap,
  normalScale: new THREE.Vector2(2, 2), // Вы можете настроить эти значения
  side: THREE.DoubleSide
});

const pointLight = new THREE.PointLight(0xffffff, 50); // белый свет, начальная интенсивность - 0.5
pointLight.position.set(2, 0, 4); // позиция света

const ambientLight = new THREE.AmbientLight(0x1f1f1f, 12);
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(1, 1, 4);

const flag = new THREE.Mesh(geometry, material);

scene.add(flag, pointLight, ambientLight, directionalLight);

flag.rotation.set(-1, 0, 0);

camera.position.z = 4.5;

const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();
  flag.geometry.attributes.position.array.forEach((value, index) => {
    if ((index + 1) % 3 === 0) {
      // Только для Z-координат
      const x = flag.geometry.attributes.position.array[index - 2];
      const y = flag.geometry.attributes.position.array[index - 1];

      // Волны по X
      const waveX1 = 0.5 * Math.sin(x + t);
      const waveX2 = 0.25 * Math.sin(x * 2 + t + (mouseX) * 1.5);
      const waveX3 = 0.1 * Math.sin(x * 3 + t + (mouseX) * 0.5);

      // Волны по Y (меньшая амплитуда)
      const waveY1 = 0.2 * Math.sin(y + t + (mouseY / 3) * 1.2);
      const waveY2 = 0.1 * Math.sin(y * 2 + t + (mouseY / 2) * 0.8);

      flag.geometry.attributes.position.array[index] =
        waveX1 + waveX2 + waveX3 + waveY1 + waveY2;
    }
  });

  flag.geometry.attributes.position.needsUpdate = true;

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.updateProjectionMatrix();
});

// Находим элемент с атрибутом data-canvas
const canvasElement = document.querySelector("[data-canvas]");

// Создаем анимацию с GSAP и ScrollTrigger
gsap.to(flag.rotation, {
  scrollTrigger: {
    trigger: canvasElement,
    start: "bottom bottom", // Когда нижняя часть элемента достигает низа экрана
    end: "bottom top", // Когда нижняя часть элемента достигает верха экрана
    scrub: true, // Плавная анимация с прокруткой
  },
  x: 1, // Финальное значение для x (или euler.x) в flag.rotation.set(x, 0, 0)
  immediateRender: false, // Не применять начальные значения до старта анимации
});
