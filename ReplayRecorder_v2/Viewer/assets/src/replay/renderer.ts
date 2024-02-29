import { ACESFilmicToneMapping, AdditiveBlending, AmbientLight, BufferAttribute, BufferGeometry, CameraHelper, Clock, Color, DirectionalLight, DoubleSide, FogExp2, FrontSide, Mesh, MeshPhongMaterial, PCFSoftShadowMap, PerspectiveCamera, Scene, ShaderMaterial, Uniform, Vector2, Vector3, WebGLRenderer } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ReplayApi } from "./moduleloader.js";

export class Renderer {
    canvas: HTMLCanvasElement;

    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    composer: EffectComposer;

    mouse: {
        x: number;
        y: number;
        left: boolean;
        right: boolean;
    };

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        this.mouse = {
            x: 0,
            y: 0,
            left: false,
            right: false
        };
        const origin = { x: 0, y: 0 };
        const old = { x: 0, y: 0 };
        window.addEventListener("keydown", (e) => {
            const fwd = new Vector3(0, 0, -1);
            fwd.applyQuaternion(this.camera.quaternion);
            switch (e.keyCode) {
            case 68:
                break;
            case 65:
                break;
            case 87:
                e.preventDefault();
                this.camera.position.x += fwd.x;
                this.camera.position.y += fwd.y;
                this.camera.position.z += fwd.z;
                break;
            case 83:
                e.preventDefault();
                this.camera.position.x -= fwd.x;
                this.camera.position.y -= fwd.y;
                this.camera.position.z -= fwd.z;
                break;
            }
        });
        this.canvas.addEventListener("mousedown", (e) => {
            e.preventDefault();
            if (e.button === 0)
                this.mouse.left = true;
            else if (e.button === 2)
                this.mouse.right = true;

            old.x = this.mouse.x;
            old.y = this.mouse.y;
            origin.x = this.mouse.x;
            origin.y = this.mouse.y;
        });
        this.canvas.addEventListener("mousemove", (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            
            if (this.mouse.left) {
                const deltaY = this.mouse.x - old.x;
                const deltaX = this.mouse.y - old.y;
                
                this.camera.rotation.y += deltaY * 0.001;
                this.camera.rotation.x += deltaX * 0.001;
                
                old.x = this.mouse.x;
                old.y = this.mouse.y;
            }
        });
        this.canvas.addEventListener("mouseup", (e) => {
            e.preventDefault();
            if (e.button === 0)
                this.mouse.left = false;
            else if (e.button === 2)
                this.mouse.right = false;
        });

        this.scene = new Scene();
        this.scene.background = new Color(0x0);

        this.camera = new PerspectiveCamera(75, this.canvas.width / this.canvas.height, 0.1, 1000);
        this.camera.rotation.order = "YXZ";
                
        this.renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.shadowMap.enabled = true;
        //this.renderer.shadowMap.type = BasicShadowMap;
        this.renderer.shadowMap.type = PCFSoftShadowMap;
        //this.renderer.shadowMap.type = PCFShadowMap;
        this.renderer.toneMapping = ACESFilmicToneMapping;
        //this.renderer.outputColorSpace = LinearSRGBColorSpace;
                
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        const bloomPass = new UnrealBloomPass( new Vector2( window.innerWidth, window.innerHeight ), 0.15, 1, 0 );
        this.composer.addPass(bloomPass);

        // add lights
        // https://stackoverflow.com/a/63507923/9642458
        const ambient = new AmbientLight(0xFFFFFF, 0.1);
        this.scene.add(ambient);
        const light = new DirectionalLight(0xFFFFFF, 1);
        light.position.y = 100;
        // TODO(randomuserhi): Setup better using bounding box of surfaces
        light.shadow.mapSize.x = 4096;
        light.shadow.mapSize.y = 4096;
        light.shadow.camera.left = -250;
        light.shadow.camera.right = 250;
        light.shadow.camera.top = 250;
        light.shadow.camera.bottom = -250;
        light.shadow.camera.far = 200;
        light.shadow.camera.near = 0.1;
        //light.shadow.blurSamples = 25;
        //light.shadow.radius = 0.5;
        light.shadow.bias = -0.01; // https://discourse.threejs.org/t/shadows-intersecting-on-flat-2-sided-objects/36824/2
        light.castShadow = true;
        this.scene.add(light);
        this.scene.add(light.target);
        light.target.translateX(0);
        light.target.translateY(-10);
                
        const helper = new CameraHelper(light.shadow.camera);
        this.scene.add(helper);

        this.scene.fog = new FogExp2(0x333333, 0.003);

        /*const point = new THREE.PointLight(0xFFFFFF, 2);
        point.shadow.mapSize.x = 4096;
        point.shadow.mapSize.y = 4096;
        point.distance = 250;
        //point.shadow.bias = -0.01;
        point.castShadow = false;
        this.scene.add(point);*/

        const update = () => {
            //point.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
            this.materials?.forEach(m => m.update());
            this.composer.render();
            requestAnimationFrame(update);
        };
        update();
    }

    public resize(width: number, height: number) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
    }

    materials: HolographicMaterial[];
    public Test(replay: ReplayApi) {
        const meshes = replay.header.get("Vanilla.Map.Geometry")!.get(0)!;
        this.materials = [];
        for (let i = 0; i < meshes.length; ++i) {
            const geometry = new BufferGeometry();
                    
            geometry.setIndex(meshes[i].indices);
            
            geometry.setAttribute("position", new BufferAttribute(meshes[i].vertices, 3));
            geometry.computeVertexNormals();
            
            {
                //const material = new THREE.MeshStandardMaterial({
                //const material = new THREE.MeshPhongMaterial({
                const material = new HolographicMaterial({
                    hologramColor: 0x00d5ff,
                    fresnelOpacity: 0.5,
                    scanlineSize: 10,
                    signalSpeed: 0,
                    enableBlinking: true,
                    hologramOpacity: 0.4,
                    depthTest: true,
                    blendMode: AdditiveBlending,
                    hologramBrightness: 2,
                    //color: 0x3e6078,
                    side: DoubleSide, // causes issues for shadows :(
                //flatShading: true,
                });
                this.materials.push(material);
                    
                {
                    const surface = new Mesh(geometry, material);
                    surface.position.y += 0.1;
                    //surface.castShadow = true;
                    //surface.receiveShadow = true;
                    this.scene.add(surface);
                }
                const surface = new Mesh(geometry, material);
                surface.position.y -= 0.2;
                //surface.castShadow = true;
                //surface.receiveShadow = true;
                this.scene.add(surface);
            }

            {
                const material = new MeshPhongMaterial({
                    color: 0x296fa3,
                    side: DoubleSide, // causes issues for shadows :(
                });
                    
                const surface = new Mesh(geometry, material);
                surface.castShadow = true;
                surface.receiveShadow = true;
                this.scene.add(surface);
            }

            {
                const material = new MeshPhongMaterial({
                    color: 0x1a2d3b,
                    side: DoubleSide, // causes issues for shadows :(
                });
                    
                const surface = new Mesh(geometry, material);
                surface.position.y -= 0.1;
                this.scene.add(surface);
            }

            /*const edges = new THREE.EdgesGeometry( geometry ); 
            const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial( { color: 0x888888 } ) ); 
            this.scene.add( line );*/

            //const helper = new VertexNormalsHelper(surface);
            //this.scene.add(helper);
        }
    }
}

class HolographicMaterial extends ShaderMaterial {

    /**
     * Create a HolographicMaterial.
     *
     * @param {Object} parameters - The parameters to configure the material.
     * @param {number} [parameters.time=0.0] - The time uniform representing animation time.
     * @param {number} [parameters.fresnelOpacity=1.0] - The opacity for the fresnel effect.
     * @param {number} [parameters.fresnelAmount=1.0] - The strength of the fresnel effect.
     * @param {number} [parameters.scanlineSize=15.0] - The size of the scanline effect.
     * @param {number} [parameters.hologramBrightness=1.0] - The brightness of the hologram.
     * @param {number} [parameters.signalSpeed=1.0] - The speed of the signal effect.
     * @param {Color} [parameters.hologramColor=new Color('#00d5ff')] - The color of the hologram.
     * @param {boolean} [parameters.enableBlinking=true] - Enable/disable blinking effect.
     * @param {boolean} [parameters.blinkFresnelOnly=false] - Enable blinking only on the fresnel effect.
     * @param {number} [parameters.hologramOpacity=1.0] - The opacity of the hologram.
     * @param {number} [parameters.blendMode=NormalBlending] - The blending mode. Use `THREE.NormalBlending` or `THREE.AdditiveBlending`.
     * @param {number} [parameters.side=FrontSide] - The rendering side. Use `THREE.FrontSide`, `THREE.BackSide`, or `THREE.DoubleSide`.
     * @param {Boolean} [parameters.depthTest=true] - Enable or disable depthTest.
     */
  
    clock: THREE.Clock;

    constructor(parameters: {
        time?: number,
        fresnelOpacity?: number,
        fresnelAmount?: number,
        scanlineSize?: number,
        hologramBrightness?: number,
        signalSpeed?: number,
        hologramColor?: number,
        enableBlinking?: boolean,
        blinkFresnelOnly?: boolean,
        hologramOpacity?: number,
        blendMode?: THREE.Blending,
        side?: THREE.Side,
        depthTest?: boolean,
    } = {}) {
        super();
  
        this.vertexShader = /*GLSL */
      `
        #define STANDARD
        varying vec3 vViewPosition;
        #ifdef USE_TRANSMISSION
        varying vec3 vWorldPosition;
        #endif
      
        varying vec2 vUv;
        varying vec4 vPos;
        varying vec3 vNormalW;
        varying vec3 vPositionW;
  
        #include <common>
        #include <uv_pars_vertex>
        #include <envmap_pars_vertex>
        #include <color_pars_vertex>
        #include <fog_pars_vertex>
        #include <morphtarget_pars_vertex>
        #include <skinning_pars_vertex>
        #include <logdepthbuf_pars_vertex>
        #include <clipping_planes_pars_vertex>
  
        void main() {
          
          #include <uv_vertex>
          #include <color_vertex>
          #include <morphcolor_vertex>
        
          #if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
        
            #include <beginnormal_vertex>
            #include <morphnormal_vertex>
            #include <skinbase_vertex>
            #include <skinnormal_vertex>
            #include <defaultnormal_vertex>
        
          #endif
        
          #include <begin_vertex>
          #include <morphtarget_vertex>
          #include <skinning_vertex>
          #include <project_vertex>
          #include <logdepthbuf_vertex>
          #include <clipping_planes_vertex>
        
          #include <worldpos_vertex>
          #include <envmap_vertex>
          #include <fog_vertex>
  
          mat4 modelViewProjectionMatrix = projectionMatrix * modelViewMatrix;
  
          vUv = uv;
          vPos = projectionMatrix * modelViewMatrix * vec4( transformed, 1.0 );
          vPositionW = vec3( vec4( transformed, 1.0 ) * modelMatrix);
          vNormalW = normalize( vec3( vec4( normal, 0.0 ) * modelMatrix ) );
          
          gl_Position = modelViewProjectionMatrix * vec4( transformed, 1.0 );
  
        }`;
  
        this.fragmentShader = /*GLSL */
      ` 
        varying vec2 vUv;
        varying vec3 vPositionW;
        varying vec4 vPos;
        varying vec3 vNormalW;
        
        uniform float time;
        uniform float fresnelOpacity;
        uniform float scanlineSize;
        uniform float fresnelAmount;
        uniform float signalSpeed;
        uniform float hologramBrightness;
        uniform float hologramOpacity;
        uniform bool blinkFresnelOnly;
        uniform bool enableBlinking;
        uniform vec3 hologramColor;
  
        float flicker( float amt, float time ) {return clamp( fract( cos( time ) * 43758.5453123 ), amt, 1.0 );}
        float random(in float a, in float b) { return fract((cos(dot(vec2(a,b) ,vec2(12.9898,78.233))) * 43758.5453)); }
  
        void main() {
          vec2 vCoords = vPos.xy;
          vCoords /= vPos.w;
          vCoords = vCoords * 0.5 + 0.5;
          vec2 myUV = fract( vCoords );
  
          // Defines hologram main color
          vec4 hologramColor = vec4(hologramColor, mix(hologramBrightness, vUv.y, 0.5));
  
          // Add scanlines
          float scanlines = 10.;
          scanlines += 20. * sin(time *signalSpeed * 20.8 - myUV.y * 60. * scanlineSize);
          scanlines *= smoothstep(1.3 * cos(time *signalSpeed + myUV.y * scanlineSize), 0.78, 0.9);
          scanlines *= max(0.25, sin(time *signalSpeed) * 1.0);        
          
          // Scanlines offsets
          float r = random(vUv.x, vUv.y);
          float g = random(vUv.y * 20.2, 	vUv.y * .2);
          float b = random(vUv.y * .9, 	vUv.y * .2);
  
          // Scanline composition
          hologramColor += vec4(r*scanlines, b*scanlines, r, 1.0) / 84.;
          vec4 scanlineMix = mix(vec4(0.0), hologramColor, hologramColor.a);
  
          // Calculates fresnel
          vec3 viewDirectionW = normalize(cameraPosition - vPositionW);
          float fresnelEffect = dot(viewDirectionW, vNormalW) * (1.6 - fresnelOpacity/2.);
          fresnelEffect = clamp(fresnelAmount - fresnelEffect, 0., fresnelOpacity);
  
          // Blinkin effect
          //Suggested by Octano - https://x.com/OtanoDesign?s=20
          float blinkValue = enableBlinking ? 0.6 - signalSpeed : 1.0;
          float blink = flicker(blinkValue, time * signalSpeed * .02);
      
          // Final shader composition
          vec3 finalColor;
  
          if(blinkFresnelOnly){
            finalColor = scanlineMix.rgb + fresnelEffect * blink;
          }else{
            finalColor = scanlineMix.rgb * blink + fresnelEffect;
          }
  
          gl_FragColor = vec4( finalColor, hologramOpacity);
  
        }`;
  
        // Set default values or modify existing properties if needed
        this.uniforms = {
            /**
           * The time uniform representing animation time.
           * @type {Uniform<number>}
           * @default 0.0
           */
            time: new Uniform(0),
    
            /**
           * The opacity for the fresnel effect.
           * @type {Uniform<number>}
           * @default 1.0
           */
            fresnelOpacity: new Uniform(parameters.fresnelOpacity !== undefined ? parameters.fresnelOpacity : 1.0),
    
            /**
           * The strength of the fresnel effect.
           * @type {Uniform<number>}
           * @default 1.0
           */
            fresnelAmount: new Uniform(parameters.fresnelAmount !== undefined ? parameters.fresnelAmount : 0.45),
    
            /**
           * The size of the scanline effect.
           * @type {Uniform<number>}
           * @default 1.0
           */
            scanlineSize: new Uniform(parameters.scanlineSize !== undefined ? parameters.scanlineSize : 8.0),
    
            /**
           * The brightness of the hologram.
           * @type {Uniform<number>}
           * @default 1.0
           */
            hologramBrightness: new Uniform(parameters.hologramBrightness !== undefined ? parameters.hologramBrightness : 1.0),
    
            /**
           * The speed of the signal effect.
           * @type {Uniform<number>}
           * @default 1.0
           */
            signalSpeed: new Uniform(parameters.signalSpeed !== undefined ? parameters.signalSpeed : 1.0),
    
            /**
           * The color of the hologram.
           * @type {Uniform<Color>}
           * @default new Color(0xFFFFFF)
           */
            hologramColor: new Uniform(parameters.hologramColor !== undefined ? new Color(parameters.hologramColor) : new Color("#00d5ff")),
    
            /**
           * Enable/disable blinking effect.
           * @type {Uniform<boolean>}
           * @default true
           */
            enableBlinking: new Uniform(parameters.enableBlinking !== undefined ? parameters.enableBlinking : true),
    
            /**
           * Enable blinking only on the fresnel effect.
           * @type {Uniform<boolean>}
           * @default false
           */
            blinkFresnelOnly: new Uniform(parameters.blinkFresnelOnly !== undefined ? parameters.blinkFresnelOnly : true),
    
            /**
           * The opacity of the hologram.
           * @type {Uniform<number>}
           * @default 1.0
           */
            hologramOpacity: new Uniform(parameters.hologramOpacity !== undefined ? parameters.hologramOpacity : 1.0),
        };
    
        this.clock = new Clock();
        this.setValues(parameters as any);
        this.depthTest = parameters.depthTest !== undefined ? parameters.depthTest : false;
        this.blending = parameters.blendMode !== undefined ? parameters.blendMode : AdditiveBlending;
        this.transparent = true;
        this.side = parameters.side !== undefined ? parameters.side : FrontSide;
  
    }
  
  
    update() {
        this.uniforms.time.value = this.clock.getElapsedTime();
    }
  
}