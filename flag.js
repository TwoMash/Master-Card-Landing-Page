import * as THREE from "three";

let mouseX = 0;
let mouseY = 0;

document.addEventListener("mousemove", (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

const section = document.querySelector("section.flag");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const textureLoader = new THREE.TextureLoader();
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
section.appendChild(renderer.domElement);

const geometry = new THREE.PlaneGeometry(12 * Math.PI, 4 * Math.PI, 200, 40);
const textureURL = "https://uploads-ssl.webflow.com/65095f9d22c26ab2a962d053/650b3d3be4ce1191487dc099_material-3.jpg";
const loadedTexture = textureLoader.load(textureURL);
const normalMapURL = "https://uploads-ssl.webflow.com/65095f9d22c26ab2a962d053/650b3d3ba5170cf2cdfc02f4_normals.jpg";
const loadedNormalMap = textureLoader.load(normalMapURL);

loadedTexture.wrapS = THREE.RepeatWrapping;
loadedTexture.wrapT = THREE.RepeatWrapping;
loadedTexture.repeat.set(15, 5);
loadedNormalMap.wrapS = THREE.RepeatWrapping;
loadedNormalMap.wrapT = THREE.RepeatWrapping;
loadedNormalMap.repeat.set(15, 5);

const uniforms = {
  mixVal: { value: 0 },
  time: { value: 0 } // инициализируем time здесь
};



const material = new THREE.MeshPhongMaterial({
  map: loadedTexture,
  normalMap: loadedNormalMap,
  normalScale: new THREE.Vector2(2, 2),
  side: THREE.DoubleSide,
  onBeforeCompile: shader => {
    shader.uniforms.mixVal = uniforms.mixVal;
    shader.uniforms.time = uniforms.time; // Используем уже инициализированный uniforms.time
     
      shader.vertexShader = `
          uniform float mixVal;
          uniform float time; // Используйте uniform переменную
          float waveAmplitude = 0.1; // Амплитуда волны
          float waveFrequency = 2.0; // Частота волны
          vec3 fromSpherical(float radius, float phi, float theta) {
            float sinPhiRadius = sin(phi) * radius;
            float x = sinPhiRadius * sin(theta);
            float y = cos(phi) * radius;
            float z = sinPhiRadius * cos(theta);
            
            // Добавляем волны
            float wave = waveAmplitude * sin(waveFrequency * theta + time);
            y += wave; // Модифицируем y координату для создания волн
    
            return vec3(x, y, z);
          }
          
          ${shader.vertexShader}
      `.replace(
          `#include <begin_vertex>`,
          `#include <begin_vertex>
              float phi = (1. - uv.y) * PI;
              float theta = uv.x * PI * 2. + PI;
              transformed = mix(position, fromSpherical(1., phi, theta), mixVal);`
      );
  }
});


const pointLight = new THREE.PointLight(0xffffff, 50);
pointLight.position.set(0, 0, 4);
const ambientLight = new THREE.AmbientLight(0x1f1f1f, 100);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 4);

const flag = new THREE.Mesh(geometry, material);
scene.add(flag, pointLight, ambientLight, directionalLight);

flag.rotation.set(-1, 0, 0);

camera.position.z = 4;

const clock = new THREE.Clock();
let mixVal = 0;

const initialRepeat = { x: 15, y: 5 };
const finalRepeat = { x: 2, y: 2 };
const initialSide = THREE.DoubleSide;
const finalSide = THREE.FrontSide;
const initialRotation = new THREE.Vector3(-1, 0, 0);
const finalRotation = new THREE.Vector3(0, 0, 0);
const initialCameraPosition = 4;
const finalCameraPosition = 2.5;


function animate() {
  const t = clock.getElapsedTime();

  flag.geometry.attributes.position.array.forEach((value, index) => {
    if ((index + 1) % 3 === 0) {
          const x = flag.geometry.attributes.position.array[index - 2];
          const y = flag.geometry.attributes.position.array[index - 1];

          // Меняем амплитуду волн в зависимости от mixVal
          const waveAmplitudeX = (1 - mixVal) * 0.5; // Уменьшаем искажения по X
          const waveAmplitudeY = mixVal * 1; // Увеличиваем искажения по Y

          // Добавляем хаотичность
          const chaosFactor = mixVal * (1.0 + 0.5 * Math.sin(5.0 * x + t) * Math.sin(5.0 * y + t));

          const waveX1 = waveAmplitudeX * Math.sin(x + t + chaosFactor);
          const waveX2 = waveAmplitudeX * 0.25 * Math.sin(x * 2 + t + (mouseX) * 1.5 + chaosFactor);
          const waveX3 = waveAmplitudeX * 0.1 * Math.sin(x * 3 + t + (mouseX) * 0.5 + chaosFactor);

          const waveY1 = waveAmplitudeY * 0.2 * Math.sin(y + t + (mouseY / 3) * 1.2 + chaosFactor);
          const waveY2 = waveAmplitudeY * 0.1 * Math.sin(y * 2 + t + (mouseY / 2) * 0.8 + chaosFactor);

          
          flag.geometry.attributes.position.array[index] = waveX1 + waveX2 + waveX3 + waveY1 + waveY2;
      }
  });


    flag.geometry.attributes.position.needsUpdate = true;
    flag.geometry.computeVertexNormals();
    uniforms.time.value = t;
    uniforms.mixVal.value = mixVal;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

ScrollTrigger.create({
  trigger: "[data-round]",
  start: "top bottom",
  end: "top 60%",
  onUpdate: (self) => {
      mixVal = self.progress;

      // Линейная интерполяция значений
      loadedTexture.repeat.set(
          THREE.MathUtils.lerp(initialRepeat.x, finalRepeat.x, mixVal),
          THREE.MathUtils.lerp(initialRepeat.y, finalRepeat.y, mixVal)
      );
      loadedNormalMap.repeat.set(
          THREE.MathUtils.lerp(initialRepeat.x, finalRepeat.x, mixVal),
          THREE.MathUtils.lerp(initialRepeat.y, finalRepeat.y, mixVal)
      );

      // Изменение свойства material.side
      material.side = mixVal > 0.5 ? finalSide : initialSide;

      // Изменение поворота флага и позиции камеры
      flag.rotation.set(
          THREE.MathUtils.lerp(initialRotation.x, finalRotation.x, mixVal),
          THREE.MathUtils.lerp(initialRotation.y, finalRotation.y, mixVal),
          THREE.MathUtils.lerp(initialRotation.z, finalRotation.z, mixVal)
      );

      camera.position.z = THREE.MathUtils.lerp(initialCameraPosition, finalCameraPosition, mixVal);
  }
});


animate();