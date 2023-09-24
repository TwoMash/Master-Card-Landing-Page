import * as THREE from "three";

let mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster(); // Инициализация Raycaster


document.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

const section = document.querySelector("section.flag");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const textureLoader = new THREE.TextureLoader();
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
section.appendChild(renderer.domElement);

const geometry = new THREE.PlaneGeometry(12 * Math.PI, 5 * Math.PI, 150, 30); // увеличьте количество сегментов
const textureURL = "https://uploads-ssl.webflow.com/65095f9d22c26ab2a962d053/650ff644084d0dfd92b24512_material-3.jpg";
const loadedTexture = textureLoader.load(textureURL);
const normalMapURL = "https://uploads-ssl.webflow.com/65095f9d22c26ab2a962d053/650ff644109f7d930db73912_normals.jpg";
const loadedNormalMap = textureLoader.load(normalMapURL);


loadedTexture.wrapS = THREE.RepeatWrapping;
loadedTexture.wrapT = THREE.RepeatWrapping;
loadedTexture.repeat.set(15, 5);
loadedNormalMap.wrapS = THREE.RepeatWrapping;
loadedNormalMap.wrapT = THREE.RepeatWrapping;
loadedNormalMap.repeat.set(15, 5);

const uniforms = {
  mixVal: { value: 0 },
  time: { value: 0 }, // инициализируем time здесь
};



const material = new THREE.MeshPhongMaterial({
  map: loadedTexture,
  normalMap: loadedNormalMap,
  normalScale: new THREE.Vector2(2, 2),
  side: THREE.DoubleSide,
  onBeforeCompile: shader => {
    shader.uniforms.mixVal = uniforms.mixVal;
    shader.uniforms.time = uniforms.time;
  
    
    shader.vertexShader = `
    uniform float mixVal;
    uniform float time;
    
    float waveAmplitude = 0.025; // Уменьшаем амплитуду
    float waveFrequency = 3.0; // Увеличиваем частоту
    
    vec3 fromSpherical(float radius, float phi, float theta) {
        float sinPhi = sin(phi);
        float cosPhi = cos(phi);

        float mixedFrequency = waveFrequency * (1.0 + 0.5 * sin(3.0 * theta));
        
        // Смешиваем несколько волн для создания более хаотичного эффекта
        float wave = waveAmplitude * (
            sin(mixedFrequency * phi + time) +
            0.75 * sin(2.0 * mixedFrequency * theta - time) +
            0.25 * sin(3.0 * mixedFrequency * phi + time)
        );
        
        // Модулируем радиус сферы вместо координат
        float r = radius + wave * sinPhi;
        float x = r * sinPhi * sin(theta);
        float y = r * cosPhi;
        float z = r * sinPhi * cos(theta);
        
        return vec3(x, y, z);
    }

    ${shader.vertexShader}
    `.replace(
      `#include <begin_vertex>`,
      `#include <begin_vertex>
          float phi = (1. - uv.y) * PI;
          float theta = uv.x * PI * 2. + PI;
          vec3 spherePosition = fromSpherical(1., phi, theta);
  
          float impactRadius = 1.0;
  
          vec3 modifiedPosition = vec3(spherePosition.x, spherePosition.y, spherePosition.z); // Пример изменения позиции
          
          transformed = mix(position, modifiedPosition, mixVal);
      `
  );
}
});



const pointLight = new THREE.PointLight(0xffffff, 15);
pointLight.position.set(0, 0, 4.5);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 15, 50);

const flag = new THREE.Mesh(geometry, material);
scene.add(flag, pointLight, ambientLight, directionalLight);

flag.rotation.set(1, 0, 0);

camera.position.z = 4;

const clock = new THREE.Clock();
let mixVal = 0;

const initialRepeat = { x: 15, y: 5 };
const finalRepeat = { x: 3, y: 3 };
const initialSide = THREE.DoubleSide;
const finalSide = THREE.FrontSide;
const initialRotation = new THREE.Vector3(-1, 0, 0);
const finalRotation = new THREE.Vector3(0, 0, 0);
const initialCameraPosition = 4;
const finalCameraPosition = 2.2;
const simplex = new SimplexNoise();
const amplitude = 0.1; // измените, чтобы увеличить/уменьшить амплитуду волн
const frequency = 0.5; // измените, чтобы увеличить/уменьшить частоту волн


function animate() {
  const t = clock.getElapsedTime();


  flag.geometry.attributes.position.array.forEach((value, index) => {
    if ((index + 1) % 3 === 0) {
          const x = flag.geometry.attributes.position.array[index - 2];
          const y = flag.geometry.attributes.position.array[index - 1];


          // Меняем амплитуду волн в зависимости от mixVal
          const waveAmplitudeX = (1 - mixVal) * 0.35; // Уменьшаем искажения по X
          const waveAmplitudeY = mixVal * 0.25; // Увеличиваем искажения по Y

          // Добавляем хаотичность
          const chaosFactor = mixVal * (50.0 + 0.8 * Math.sin(5.0 * x + t) * Math.sin(5.0 * y + t));
          const noiseValue = amplitude * simplex.noise2D(x * frequency, y * frequency + t);
          const waveX1 = waveAmplitudeX * Math.sin(x + t + chaosFactor);
          const waveX2 = waveAmplitudeX * 0.25 * Math.sin(x * 2 + t + (mouse.x) * 1.5 + chaosFactor);
          const waveX3 = waveAmplitudeX * 0.1 * Math.sin(x * 3 + t + (mouse.x) * 0.5 + chaosFactor);

          const waveY1 = waveAmplitudeY * 2 * Math.sin(y + t + (mouse.y / 3) * 1.2 + chaosFactor);
          const waveY2 = waveAmplitudeY * 0.1 * Math.sin(y * 2 + t + (mouse.y / 2) * 0.8 + chaosFactor);

          
          flag.geometry.attributes.position.array[index] = waveX1 + waveX2 + waveX3 + waveY1 + waveY2 + noiseValue;
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
  end: "top 50%",
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