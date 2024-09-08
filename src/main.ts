import { vec3, vec4 } from "gl-matrix";
const Stats = require("stats-js");
import * as DAT from "dat.gui";
import Icosphere from "./geometry/Icosphere";
import Square from "./geometry/Square";
import Cube from "./geometry/Cube";
import OpenGLRenderer from "./rendering/gl/OpenGLRenderer";
import Camera from "./Camera";
import { setGL } from "./globals";
import ShaderProgram, { Shader } from "./rendering/gl/ShaderProgram";

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 5,
  "Load Scene": loadScene, // A function pointer, essentially
  color: [255, 255, 255],
  alpha: 1,
  fragShader: "Perlin Noise",
  vertShader: "Perlin Noise",
};
const shader_name = ["Perlin Noise"];

let icosphere: Icosphere;
let square: Square;
let cube: Cube;
let prevTesselations: number = 5;

function loadScene() {
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, controls.tesselations);
  icosphere.create();
  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();
  cube = new Cube(vec3.fromValues(0, 0, 0));
  cube.create();
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = "absolute";
  stats.domElement.style.left = "0px";
  stats.domElement.style.top = "0px";
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, "tesselations", 0, 8).step(1);
  gui.add(controls, "Load Scene");
  gui.addColor(controls, "color");
  gui.add(controls, "alpha", 0, 1).step(0.1);
  gui.add(controls, "fragShader", shader_name);
  gui.add(controls, "vertShader", shader_name);

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement>document.getElementById("canvas");
  const gl = <WebGL2RenderingContext>canvas.getContext("webgl2");
  if (!gl) {
    alert("WebGL 2 not supported!");
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);

  let perlin_frag_shader = new Shader(gl.VERTEX_SHADER, require("./shaders/perlin-noise-vert.glsl"));
  let perlin_vert_shader = new Shader(gl.FRAGMENT_SHADER, require("./shaders/perlin-noise-frag.glsl"));
  // let worley_frag_shader = new Shader(gl.VERTEX_SHADER, require("./shaders/worley-noise-vert.glsl"));
  // let worley_vert_shader = new Shader(gl.FRAGMENT_SHADER, require("./shaders/worley-noise-frag.glsl"));
  // let FBM_frag_shader = new Shader(gl.VERTEX_SHADER, require("./shaders/FBM-vert.glsl"));
  // let FBM_vert_shader = new Shader(gl.FRAGMENT_SHADER, require("./shaders/FBM-frag.glsl"));
  // let lambert_frag_shader = new Shader(gl.VERTEX_SHADER, require("./shaders/lambert-vert.glsl"));
  // let lambert_vert_shader = new Shader(gl.FRAGMENT_SHADER, require("./shaders/lambert-frag.glsl"));

  
  let cur_frag_shader = perlin_frag_shader;
  let cur_vert_shader = perlin_vert_shader;

  // switch(controls.fragShader){
  //   case 'Perlin Noise':
  //     cur_frag_shader = perlin_frag_shader;
  //     break;
  //   case 'Lambert':
  //     cur_frag_shader = lambert_frag_shader;
  //     break;
  //   case 'FBM':
  //     cur_frag_shader = FBM_frag_shader;
  //     break;
  //   case 'Worley Noise':
  //     cur_frag_shader = worley_frag_shader;
  //     break;
  // }

  // switch(controls.vertShader){
  //   case 'Perlin Noise':
  //     cur_vert_shader = perlin_vert_shader;
  //     break;
  //   case 'Lambert':
  //     cur_vert_shader = lambert_vert_shader;
  //     break;
  //   case 'FBM':
  //     cur_vert_shader = FBM_vert_shader;
  //     break;
  //   case 'Worley Noise':
  //     cur_vert_shader = worley_vert_shader;
  //     break;
  // }
  const shader = new ShaderProgram([
    cur_frag_shader,
    cur_vert_shader,
  ]);


  // This function will be called every frame
  function tick(now: number) {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    if (controls.tesselations != prevTesselations) {
      prevTesselations = controls.tesselations;
      icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, prevTesselations);
      icosphere.create();
    }
    renderer.render(
      camera,
      shader,
      [
        // icosphere,
        // square,
        cube,
      ],
      vec4.fromValues(
        controls.color[0] / 255,
        controls.color[1] / 255,
        controls.color[2] / 255,
        controls.alpha,
      ),
    );
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener(
    "resize",
    function () {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.setAspectRatio(window.innerWidth / window.innerHeight);
      camera.updateProjectionMatrix();
    },
    false,
  );

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  requestAnimationFrame(tick);
}

main();
