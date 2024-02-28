/* exported Renderer */
class Renderer {
    canvas: HTMLCanvasElement;

    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;

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
            const fwd = new THREE.Vector3(0, 0, -1);
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

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x333333);

        this.camera = new THREE.PerspectiveCamera(75, this.canvas.width / this.canvas.height, 0.1, 1000);
        this.camera.rotation.order = "YXZ";
                
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.shadowMap.enabled = true;
        //this.renderer.shadowMap.type = THREE.BasicShadowMap;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        //this.renderer.shadowMap.type = THREE.PCFShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        //this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
                
        // add lights
        // https://stackoverflow.com/a/63507923/9642458
        const ambient = new THREE.AmbientLight(0xFFFFFF, 0.4);
        this.scene.add(ambient);
        const light = new THREE.DirectionalLight(0xFFFFFF, 1);
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
                
        const helper = new THREE.CameraHelper(light.shadow.camera);
        this.scene.add(helper);

        this.scene.fog = new THREE.FogExp2(0x333333, 0.003);

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
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(update);
        };
        update();
    }

    public resize(width: number, height: number) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    materials: HolographicMaterial[];
    public Test(replay: Replay.Api) {
        const meshes = replay.header.get("Vanilla.Map.Geometry")!.get(0)!;
        this.materials = [];
        for (let i = 0; i < meshes.length; ++i) {
            const geometry = new THREE.BufferGeometry();
                    
            geometry.setIndex(meshes[i].indices);
            
            geometry.setAttribute("position", new THREE.BufferAttribute(meshes[i].vertices, 3));
            geometry.computeVertexNormals();
            
            {
                //const material = new THREE.MeshStandardMaterial({
                //const material = new THREE.MeshPhongMaterial({
                const material = new HolographicMaterial({
                    hologramColor: 0x00d5ff,
                    fresnelOpacity: 0.5,
                    scanlineSize: 20,
                    signalSpeed: 0,
                    enableBlinking: true,
                    hologramOpacity: 0.7,
                    depthTest: true,
                    blendMode: THREE.AdditiveBlending,
                    hologramBrightness: 2,
                    //color: 0x3e6078,
                    side: THREE.DoubleSide, // causes issues for shadows :(
                //flatShading: true,
                });
                this.materials.push(material);
                    
                {
                    const surface = new THREE.Mesh(geometry, material);
                    surface.position.y += 0.1;
                    //surface.castShadow = true;
                    //surface.receiveShadow = true;
                    this.scene.add(surface);
                }
                const surface = new THREE.Mesh(geometry, material);
                surface.position.y -= 0.1;
                //surface.castShadow = true;
                //surface.receiveShadow = true;
                this.scene.add(surface);
            }

            {
                const material = new THREE.MeshPhongMaterial({
                    color: 0x1f3e54,
                    side: THREE.DoubleSide, // causes issues for shadows :(
                });
                    
                const surface = new THREE.Mesh(geometry, material);
                surface.castShadow = true;
                surface.receiveShadow = true;
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

// TAKEN FROM https://github.com/ektogamat/threejs-vanilla-holographic-material/blob/main/src/HolographicMaterialVanilla.js
class HolographicMaterial extends THREE.ShaderMaterial {

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
            time: new THREE.Uniform(0),
    
            /**
           * The opacity for the fresnel effect.
           * @type {Uniform<number>}
           * @default 1.0
           */
            fresnelOpacity: new THREE.Uniform(parameters.fresnelOpacity !== undefined ? parameters.fresnelOpacity : 1.0),
    
            /**
           * The strength of the fresnel effect.
           * @type {Uniform<number>}
           * @default 1.0
           */
            fresnelAmount: new THREE.Uniform(parameters.fresnelAmount !== undefined ? parameters.fresnelAmount : 0.45),
    
            /**
           * The size of the scanline effect.
           * @type {Uniform<number>}
           * @default 1.0
           */
            scanlineSize: new THREE.Uniform(parameters.scanlineSize !== undefined ? parameters.scanlineSize : 8.0),
    
            /**
           * The brightness of the hologram.
           * @type {Uniform<number>}
           * @default 1.0
           */
            hologramBrightness: new THREE.Uniform(parameters.hologramBrightness !== undefined ? parameters.hologramBrightness : 1.0),
    
            /**
           * The speed of the signal effect.
           * @type {Uniform<number>}
           * @default 1.0
           */
            signalSpeed: new THREE.Uniform(parameters.signalSpeed !== undefined ? parameters.signalSpeed : 1.0),
    
            /**
           * The color of the hologram.
           * @type {Uniform<Color>}
           * @default new Color(0xFFFFFF)
           */
            hologramColor: new THREE.Uniform(parameters.hologramColor !== undefined ? new THREE.Color(parameters.hologramColor) : new THREE.Color("#00d5ff")),
    
            /**
           * Enable/disable blinking effect.
           * @type {Uniform<boolean>}
           * @default true
           */
            enableBlinking: new THREE.Uniform(parameters.enableBlinking !== undefined ? parameters.enableBlinking : true),
    
            /**
           * Enable blinking only on the fresnel effect.
           * @type {Uniform<boolean>}
           * @default false
           */
            blinkFresnelOnly: new THREE.Uniform(parameters.blinkFresnelOnly !== undefined ? parameters.blinkFresnelOnly : true),
    
            /**
           * The opacity of the hologram.
           * @type {Uniform<number>}
           * @default 1.0
           */
            hologramOpacity: new THREE.Uniform(parameters.hologramOpacity !== undefined ? parameters.hologramOpacity : 1.0),
        };
    
        this.clock = new THREE.Clock();
        this.setValues(parameters as any);
        this.depthTest = parameters.depthTest !== undefined ? parameters.depthTest : false;
        this.blending = parameters.blendMode !== undefined ? parameters.blendMode : THREE.AdditiveBlending;
        this.transparent = true;
        this.side = parameters.side !== undefined ? parameters.side : THREE.FrontSide;
  
    }
  
  
    update() {
        this.uniforms.time.value = this.clock.getElapsedTime();
    }
  
}

// TAKEN FROM: https://github.com/mrdoob/three.js/blob/dev/examples/jsm/helpers/VertexNormalsHelper.js FOR DEBUGGING
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _normalMatrix = new THREE.Matrix3();

class VertexNormalsHelper extends THREE.LineSegments {
    object: THREE.Mesh;
    size: number;
    type: string;


    constructor( object: THREE.Mesh, size = 1, color = 0xff0000 ) {

        const geometry = new THREE.BufferGeometry();

        const nNormals = object.geometry.attributes.normal.count;
        const positions = new THREE.Float32BufferAttribute( nNormals * 2 * 3, 3 );

        geometry.setAttribute( 'position', positions );

        super( geometry, new THREE.LineBasicMaterial( { color, toneMapped: false } ) );

        this.object = object;
        this.size = size;
        this.type = 'VertexNormalsHelper';

        //

        this.matrixAutoUpdate = false;

        this.update();

    }

    update() {

        this.object.updateMatrixWorld( true );

        _normalMatrix.getNormalMatrix( this.object.matrixWorld );

        const matrixWorld = this.object.matrixWorld;

        const position = this.geometry.attributes.position;

        //

        const objGeometry = this.object.geometry;

        if ( objGeometry ) {

            const objPos = objGeometry.attributes.position;

            const objNorm = objGeometry.attributes.normal;

            let idx = 0;

            // for simplicity, ignore index and drawcalls, and render every normal

            for ( let j = 0, jl = objPos.count; j < jl; j ++ ) {

                _v1.fromBufferAttribute( objPos, j ).applyMatrix4( matrixWorld );

                _v2.fromBufferAttribute( objNorm, j );

                _v2.applyMatrix3( _normalMatrix ).normalize().multiplyScalar( this.size ).add( _v1 );

                position.setXYZ( idx, _v1.x, _v1.y, _v1.z );

                idx = idx + 1;

                position.setXYZ( idx, _v2.x, _v2.y, _v2.z );

                idx = idx + 1;

            }

        }

        position.needsUpdate = true;

    }

    dispose() {

        this.geometry.dispose();
        (this.material as any).dispose();

    }

}