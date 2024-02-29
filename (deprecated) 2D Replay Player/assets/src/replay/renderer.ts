/* exported Renderer */
class Renderer {
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
        this.scene.background = new THREE.Color(0x0);

        this.camera = new THREE.PerspectiveCamera(75, this.canvas.width / this.canvas.height, 0.1, 1000);
        this.camera.rotation.order = "YXZ";
                
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.shadowMap.enabled = true;
        //this.renderer.shadowMap.type = THREE.BasicShadowMap;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        //this.renderer.shadowMap.type = THREE.PCFShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        //this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
                
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 0.15, 1, 0 );
        this.composer.addPass(bloomPass);

        // add lights
        // https://stackoverflow.com/a/63507923/9642458
        const ambient = new THREE.AmbientLight(0xFFFFFF, 0.1);
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
                    scanlineSize: 10,
                    signalSpeed: 0,
                    enableBlinking: true,
                    hologramOpacity: 0.4,
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
                surface.position.y -= 0.2;
                //surface.castShadow = true;
                //surface.receiveShadow = true;
                this.scene.add(surface);
            }

            {
                const material = new THREE.MeshPhongMaterial({
                    color: 0x296fa3,
                    side: THREE.DoubleSide, // causes issues for shadows :(
                });
                    
                const surface = new THREE.Mesh(geometry, material);
                surface.castShadow = true;
                surface.receiveShadow = true;
                this.scene.add(surface);
            }

            {
                const material = new THREE.MeshPhongMaterial({
                    color: 0x1a2d3b,
                    side: THREE.DoubleSide, // causes issues for shadows :(
                });
                    
                const surface = new THREE.Mesh(geometry, material);
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

class Pass {
    isPass: any;
    enabled: any;
    needsSwap: any;
    clear: any;
    renderToScreen: any;

    constructor() {

        this.isPass = true;

        // if set to true, the pass is processed by the composer
        this.enabled = true;

        // if set to true, the pass indicates to swap read and write buffer after rendering
        this.needsSwap = true;

        // if set to true, the pass clears its buffer before rendering
        this.clear = false;

        // if set to true, the result of the pass is rendered to screen. This is set automatically by EffectComposer.
        this.renderToScreen = false;

    }

    setSize( width: any, height: any ) {}

    render( renderer: any, writeBuffer: any, readBuffer: any, deltaTime: any, maskActive: any ) {

        console.error( 'THREE.Pass: .render() must be implemented in derived pass.' );

    }

    dispose() {}

}

class RenderPass extends Pass {

    scene: any;
    camera: any;
    overrideMaterial: any;
    clearAlpha: any;
    clearColor: any;
    clearDepth: any;
    _oldClearColor: any;

    constructor( scene: any, camera: any, overrideMaterial: any = null, clearColor: any = null, clearAlpha: any = null ) {

        super();

        this.scene = scene;
        this.camera = camera;

        this.overrideMaterial = overrideMaterial;

        this.clearColor = clearColor;
        this.clearAlpha = clearAlpha;

        this.clear = true;
        this.clearDepth = false;
        this.needsSwap = false;
        this._oldClearColor = new THREE.Color();

    }

    render( renderer: any, writeBuffer: any, readBuffer: any /*, deltaTime, maskActive */ ) {

        const oldAutoClear = renderer.autoClear;
        renderer.autoClear = false;

        let oldClearAlpha, oldOverrideMaterial;

        if ( this.overrideMaterial !== null ) {

            oldOverrideMaterial = this.scene.overrideMaterial;

            this.scene.overrideMaterial = this.overrideMaterial;

        }

        if ( this.clearColor !== null ) {

            renderer.getClearColor( this._oldClearColor );
            renderer.setClearColor( this.clearColor );

        }

        if ( this.clearAlpha !== null ) {

            oldClearAlpha = renderer.getClearAlpha();
            renderer.setClearAlpha( this.clearAlpha );

        }

        if ( this.clearDepth == true ) {

            renderer.clearDepth();

        }

        renderer.setRenderTarget( this.renderToScreen ? null : readBuffer );

        if ( this.clear === true ) {

            // TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
            renderer.clear( renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil );

        }

        renderer.render( this.scene, this.camera );

        // restore

        if ( this.clearColor !== null ) {

            renderer.setClearColor( this._oldClearColor );

        }

        if ( this.clearAlpha !== null ) {

            renderer.setClearAlpha( oldClearAlpha );

        }

        if ( this.overrideMaterial !== null ) {

            this.scene.overrideMaterial = oldOverrideMaterial;

        }

        renderer.autoClear = oldAutoClear;

    }

}

// Helper for passes that need to fill the viewport with a single quad.

const _camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

// https://github.com/mrdoob/three.js/pull/21358

class FullscreenTriangleGeometry extends THREE.BufferGeometry {

    constructor() {

        super();

        this.setAttribute( 'position', new THREE.Float32BufferAttribute( [ - 1, 3, 0, - 1, - 1, 0, 3, - 1, 0 ], 3 ) );
        this.setAttribute( 'uv', new THREE.Float32BufferAttribute( [ 0, 2, 0, 0, 2, 0 ], 2 ) );

    }

}

const _geometry = new FullscreenTriangleGeometry();

class FullScreenQuad {
    _mesh: any;

    constructor( material: any ) {

        this._mesh = new THREE.Mesh( _geometry, material );

    }

    dispose() {

        this._mesh.geometry.dispose();

    }

    render( renderer: any ) {

        renderer.render( this._mesh, _camera );

    }

    get material() {

        return this._mesh.material;

    }

    set material( value ) {

        this._mesh.material = value;

    }

}

class ShaderPass extends Pass {
    textureID: any;
    uniforms: any;
    material: any;
    fsQuad: any;
    renderToScreen: any;

    constructor( shader: any, textureID?: any ) {

        super();

        this.textureID = ( textureID !== undefined ) ? textureID : 'tDiffuse';

        if ( shader instanceof THREE.ShaderMaterial ) {

            this.uniforms = shader.uniforms;

            this.material = shader;

        } else if ( shader ) {

            this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

            this.material = new THREE.ShaderMaterial( {

                name: ( shader.name !== undefined ) ? shader.name : 'unspecified',
                defines: Object.assign( {}, shader.defines ),
                uniforms: this.uniforms,
                vertexShader: shader.vertexShader,
                fragmentShader: shader.fragmentShader

            } );

        }

        this.fsQuad = new FullScreenQuad( this.material );

    }

    render( renderer: any, writeBuffer: any, readBuffer: any /*, deltaTime, maskActive */ ) {

        if ( this.uniforms[ this.textureID ] ) {

            this.uniforms[ this.textureID ].value = readBuffer.texture;

        }

        this.fsQuad.material = this.material;

        if ( this.renderToScreen ) {

            renderer.setRenderTarget( null );
            this.fsQuad.render( renderer );

        } else {

            renderer.setRenderTarget( writeBuffer );
            // TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
            if ( this.clear ) renderer.clear( renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil );
            this.fsQuad.render( renderer );

        }

    }

    dispose() {

        this.material.dispose();

        this.fsQuad.dispose();

    }

}

const CopyShader = {

    name: 'CopyShader',

    uniforms: {

        'tDiffuse': { value: null },
        'opacity': { value: 1.0 }

    },

    vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

    fragmentShader: /* glsl */`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`

};

class MaskPass extends Pass {
    scene: any;
    camera: any;
    inverse: any;

    constructor( scene: any, camera: any ) {

        super();

        this.scene = scene;
        this.camera = camera;

        this.clear = true;
        this.needsSwap = false;

        this.inverse = false;

    }

    render( renderer: any, writeBuffer: any, readBuffer: any /*, deltaTime, maskActive */ ) {

        const context = renderer.getContext();
        const state = renderer.state;

        // don't update color or depth

        state.buffers.color.setMask( false );
        state.buffers.depth.setMask( false );

        // lock buffers

        state.buffers.color.setLocked( true );
        state.buffers.depth.setLocked( true );

        // set up stencil

        let writeValue, clearValue;

        if ( this.inverse ) {

            writeValue = 0;
            clearValue = 1;

        } else {

            writeValue = 1;
            clearValue = 0;

        }

        state.buffers.stencil.setTest( true );
        state.buffers.stencil.setOp( context.REPLACE, context.REPLACE, context.REPLACE );
        state.buffers.stencil.setFunc( context.ALWAYS, writeValue, 0xffffffff );
        state.buffers.stencil.setClear( clearValue );
        state.buffers.stencil.setLocked( true );

        // draw into the stencil buffer

        renderer.setRenderTarget( readBuffer );
        if ( this.clear ) renderer.clear();
        renderer.render( this.scene, this.camera );

        renderer.setRenderTarget( writeBuffer );
        if ( this.clear ) renderer.clear();
        renderer.render( this.scene, this.camera );

        // unlock color and depth buffer and make them writable for subsequent rendering/clearing

        state.buffers.color.setLocked( false );
        state.buffers.depth.setLocked( false );

        state.buffers.color.setMask( true );
        state.buffers.depth.setMask( true );

        // only render where stencil is set to 1

        state.buffers.stencil.setLocked( false );
        state.buffers.stencil.setFunc( context.EQUAL, 1, 0xffffffff ); // draw if == 1
        state.buffers.stencil.setOp( context.KEEP, context.KEEP, context.KEEP );
        state.buffers.stencil.setLocked( true );

    }

}

class ClearMaskPass extends Pass {

    constructor() {

        super();

        this.needsSwap = false;

    }

    render( renderer: any /*, writeBuffer, readBuffer, deltaTime, maskActive */ ) {

        renderer.state.buffers.stencil.setLocked( false );
        renderer.state.buffers.stencil.setTest( false );

    }

}

// TAKEN FROM: https://github.com/mrdoob/three.js/blob/dev/examples/jsm/postprocessing/EffectComposer.js
class EffectComposer {
    renderer: any;
    _pixelRatio: any;
    _width: any;
    _height: any;
    renderTarget1: any;
    renderTarget2: any;
    writeBuffer: any;
    readBuffer: any;
    renderToScreen: any;
    passes: any;
    copyPass: any;
    clock: any;

    constructor( renderer: any, renderTarget?: any ) {

        this.renderer = renderer;

        this._pixelRatio = renderer.getPixelRatio();

        if ( renderTarget === undefined ) {

            const size = renderer.getSize( new THREE.Vector2() );
            this._width = size.width;
            this._height = size.height;

            renderTarget = new THREE.WebGLRenderTarget( this._width * this._pixelRatio, this._height * this._pixelRatio, { type: THREE.HalfFloatType } );
            renderTarget.texture.name = 'EffectComposer.rt1';

        } else {

            this._width = renderTarget.width;
            this._height = renderTarget.height;

        }

        this.renderTarget1 = renderTarget;
        this.renderTarget2 = renderTarget.clone();
        this.renderTarget2.texture.name = 'EffectComposer.rt2';

        this.writeBuffer = this.renderTarget1;
        this.readBuffer = this.renderTarget2;

        this.renderToScreen = true;

        this.passes = [];

        this.copyPass = new ShaderPass( CopyShader );
        this.copyPass.material.blending = THREE.NoBlending;

        this.clock = new THREE.Clock();

    }

    swapBuffers() {

        const tmp = this.readBuffer;
        this.readBuffer = this.writeBuffer;
        this.writeBuffer = tmp;

    }

    addPass( pass: any ) {

        this.passes.push( pass );
        pass.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );

    }

    insertPass( pass: any, index: any ) {

        this.passes.splice( index, 0, pass );
        pass.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );

    }

    removePass( pass: any ) {

        const index = this.passes.indexOf( pass );

        if ( index !== - 1 ) {

            this.passes.splice( index, 1 );

        }

    }

    isLastEnabledPass( passIndex: any ) {

        for ( let i = passIndex + 1; i < this.passes.length; i ++ ) {

            if ( this.passes[ i ].enabled ) {

                return false;

            }

        }

        return true;

    }

    render( deltaTime?: any ) {

        // deltaTime value is in seconds

        if ( deltaTime === undefined ) {

            deltaTime = this.clock.getDelta();

        }

        const currentRenderTarget = this.renderer.getRenderTarget();

        let maskActive = false;

        for ( let i = 0, il = this.passes.length; i < il; i ++ ) {

            const pass = this.passes[ i ];

            if ( pass.enabled === false ) continue;

            pass.renderToScreen = ( this.renderToScreen && this.isLastEnabledPass( i ) );
            pass.render( this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive );

            if ( pass.needsSwap ) {

                if ( maskActive ) {

                    const context = this.renderer.getContext();
                    const stencil = this.renderer.state.buffers.stencil;

                    //context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );
                    stencil.setFunc( context.NOTEQUAL, 1, 0xffffffff );

                    this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, deltaTime );

                    //context.stencilFunc( context.EQUAL, 1, 0xffffffff );
                    stencil.setFunc( context.EQUAL, 1, 0xffffffff );

                }

                this.swapBuffers();

            }

            if ( MaskPass !== undefined ) {

                if ( pass instanceof MaskPass ) {

                    maskActive = true;

                } else if ( pass instanceof ClearMaskPass ) {

                    maskActive = false;

                }

            }

        }

        this.renderer.setRenderTarget( currentRenderTarget );

    }

    reset( renderTarget: any ) {

        if ( renderTarget === undefined ) {

            const size = this.renderer.getSize( new THREE.Vector2() );
            this._pixelRatio = this.renderer.getPixelRatio();
            this._width = size.width;
            this._height = size.height;

            renderTarget = this.renderTarget1.clone();
            renderTarget.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );

        }

        this.renderTarget1.dispose();
        this.renderTarget2.dispose();
        this.renderTarget1 = renderTarget;
        this.renderTarget2 = renderTarget.clone();

        this.writeBuffer = this.renderTarget1;
        this.readBuffer = this.renderTarget2;

    }

    setSize( width: any, height: any ) {

        this._width = width;
        this._height = height;

        const effectiveWidth = this._width * this._pixelRatio;
        const effectiveHeight = this._height * this._pixelRatio;

        this.renderTarget1.setSize( effectiveWidth, effectiveHeight );
        this.renderTarget2.setSize( effectiveWidth, effectiveHeight );

        for ( let i = 0; i < this.passes.length; i ++ ) {

            this.passes[ i ].setSize( effectiveWidth, effectiveHeight );

        }

    }

    setPixelRatio( pixelRatio: any ) {

        this._pixelRatio = pixelRatio;

        this.setSize( this._width, this._height );

    }

    dispose() {

        this.renderTarget1.dispose();
        this.renderTarget2.dispose();

        this.copyPass.dispose();

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

const LuminosityHighPassShader = {

    name: 'LuminosityHighPassShader',

    shaderID: 'luminosityHighPass',

    uniforms: {

        'tDiffuse': { value: null },
        'luminosityThreshold': { value: 1.0 },
        'smoothWidth': { value: 1.0 },
        'defaultColor': { value: new THREE.Color( 0x000000 ) },
        'defaultOpacity': { value: 0.0 }

    },

    vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

    fragmentShader: /* glsl */`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			vec3 luma = vec3( 0.299, 0.587, 0.114 );

			float v = dot( texel.xyz, luma );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`

};

/**
 * UnrealBloomPass is inspired by the bloom pass of Unreal Engine. It creates a
 * mip map chain of bloom textures and blurs them with different radii. Because
 * of the weighted combination of mips, and because larger blurs are done on
 * higher mips, this effect provides good quality and performance.
 *
 * Reference:
 * - https://docs.unrealengine.com/latest/INT/Engine/Rendering/PostProcessEffects/Bloom/
 */
class UnrealBloomPass extends Pass {
    strength: any;
    radius: any;
    threshold: any;
    resolution: any;
    clearColor: any;
    renderTargetsHorizontal: any;
    renderTargetsVertical: any;
    nMips: any;
    renderTargetBright: any;
    highPassUniforms: any;
    materialHighPassFilter: any;
    separableBlurMaterials: any;
    compositeMaterial: any;
    bloomTintColors: any;
    copyUniforms: any;

    constructor( resolution: any, strength: any, radius: any, threshold: any ) {

        super();

        this.strength = ( strength !== undefined ) ? strength : 1;
        this.radius = radius;
        this.threshold = threshold;
        this.resolution = ( resolution !== undefined ) ? new THREE.Vector2( resolution.x, resolution.y ) : new THREE.Vector2( 256, 256 );

        // create color only once here, reuse it later inside the render function
        this.clearColor = new THREE.Color( 0, 0, 0 );

        // render targets
        this.renderTargetsHorizontal = [];
        this.renderTargetsVertical = [];
        this.nMips = 5;
        let resx = Math.round( this.resolution.x / 2 );
        let resy = Math.round( this.resolution.y / 2 );

        this.renderTargetBright = new THREE.WebGLRenderTarget( resx, resy, { type: THREE.HalfFloatType } );
        this.renderTargetBright.texture.name = 'UnrealBloomPass.bright';
        this.renderTargetBright.texture.generateMipmaps = false;

        for ( let i = 0; i < this.nMips; i ++ ) {

            const renderTargetHorizonal = new THREE.WebGLRenderTarget( resx, resy, { type: THREE.HalfFloatType } );

            renderTargetHorizonal.texture.name = 'UnrealBloomPass.h' + i;
            renderTargetHorizonal.texture.generateMipmaps = false;

            this.renderTargetsHorizontal.push( renderTargetHorizonal );

            const renderTargetVertical = new THREE.WebGLRenderTarget( resx, resy, { type: THREE.HalfFloatType } );

            renderTargetVertical.texture.name = 'UnrealBloomPass.v' + i;
            renderTargetVertical.texture.generateMipmaps = false;

            this.renderTargetsVertical.push( renderTargetVertical );

            resx = Math.round( resx / 2 );

            resy = Math.round( resy / 2 );

        }

        // luminosity high pass material

        const highPassShader = LuminosityHighPassShader;
        this.highPassUniforms = THREE.UniformsUtils.clone( highPassShader.uniforms );

        this.highPassUniforms[ 'luminosityThreshold' ].value = threshold;
        this.highPassUniforms[ 'smoothWidth' ].value = 0.01;

        this.materialHighPassFilter = new THREE.ShaderMaterial( {
            uniforms: this.highPassUniforms,
            vertexShader: highPassShader.vertexShader,
            fragmentShader: highPassShader.fragmentShader
        } );

        // gaussian blur materials

        this.separableBlurMaterials = [];
        const kernelSizeArray = [ 3, 5, 7, 9, 11 ];
        resx = Math.round( this.resolution.x / 2 );
        resy = Math.round( this.resolution.y / 2 );

        for ( let i = 0; i < this.nMips; i ++ ) {

            this.separableBlurMaterials.push( this.getSeperableBlurMaterial( kernelSizeArray[ i ] ) );

            this.separableBlurMaterials[ i ].uniforms[ 'invSize' ].value = new THREE.Vector2( 1 / resx, 1 / resy );

            resx = Math.round( resx / 2 );

            resy = Math.round( resy / 2 );

        }

        // composite material

        this.compositeMaterial = this.getCompositeMaterial( this.nMips );
        this.compositeMaterial.uniforms[ 'blurTexture1' ].value = this.renderTargetsVertical[ 0 ].texture;
        this.compositeMaterial.uniforms[ 'blurTexture2' ].value = this.renderTargetsVertical[ 1 ].texture;
        this.compositeMaterial.uniforms[ 'blurTexture3' ].value = this.renderTargetsVertical[ 2 ].texture;
        this.compositeMaterial.uniforms[ 'blurTexture4' ].value = this.renderTargetsVertical[ 3 ].texture;
        this.compositeMaterial.uniforms[ 'blurTexture5' ].value = this.renderTargetsVertical[ 4 ].texture;
        this.compositeMaterial.uniforms[ 'bloomStrength' ].value = strength;
        this.compositeMaterial.uniforms[ 'bloomRadius' ].value = 0.1;

        const bloomFactors = [ 1.0, 0.8, 0.6, 0.4, 0.2 ];
        this.compositeMaterial.uniforms[ 'bloomFactors' ].value = bloomFactors;
        this.bloomTintColors = [ new THREE.Vector3( 1, 1, 1 ), new THREE.Vector3( 1, 1, 1 ), new THREE.Vector3( 1, 1, 1 ), new THREE.Vector3( 1, 1, 1 ), new THREE.Vector3( 1, 1, 1 ) ];
        this.compositeMaterial.uniforms[ 'bloomTintColors' ].value = this.bloomTintColors;

        // blend material

        const copyShader = CopyShader;

        this.copyUniforms = THREE.UniformsUtils.clone( copyShader.uniforms );

        this.blendMaterial = new THREE.ShaderMaterial( {
            uniforms: this.copyUniforms,
            vertexShader: copyShader.vertexShader,
            fragmentShader: copyShader.fragmentShader,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            depthWrite: false,
            transparent: true
        } );

        this.enabled = true;
        this.needsSwap = false;

        this._oldClearColor = new THREE.Color();
        this.oldClearAlpha = 1;

        this.basic = new THREE.MeshBasicMaterial();

        this.fsQuad = new FullScreenQuad( null );

    }
    blendMaterial: any;
    _oldClearColor: any;
    oldClearAlpha: any;
    basic: any;
    fsQuad: any;

    dispose() {

        for ( let i = 0; i < this.renderTargetsHorizontal.length; i ++ ) {

            this.renderTargetsHorizontal[ i ].dispose();

        }

        for ( let i = 0; i < this.renderTargetsVertical.length; i ++ ) {

            this.renderTargetsVertical[ i ].dispose();

        }

        this.renderTargetBright.dispose();

        //

        for ( let i = 0; i < this.separableBlurMaterials.length; i ++ ) {

            this.separableBlurMaterials[ i ].dispose();

        }

        this.compositeMaterial.dispose();
        this.blendMaterial.dispose();
        this.basic.dispose();

        //

        this.fsQuad.dispose();

    }

    setSize( width: any, height: any ) {

        let resx = Math.round( width / 2 );
        let resy = Math.round( height / 2 );

        this.renderTargetBright.setSize( resx, resy );

        for ( let i = 0; i < this.nMips; i ++ ) {

            this.renderTargetsHorizontal[ i ].setSize( resx, resy );
            this.renderTargetsVertical[ i ].setSize( resx, resy );

            this.separableBlurMaterials[ i ].uniforms[ 'invSize' ].value = new THREE.Vector2( 1 / resx, 1 / resy );

            resx = Math.round( resx / 2 );
            resy = Math.round( resy / 2 );

        }

    }

    render( renderer: any, writeBuffer: any, readBuffer: any, deltaTime: any, maskActive: any ) {

        renderer.getClearColor( this._oldClearColor );
        this.oldClearAlpha = renderer.getClearAlpha();
        const oldAutoClear = renderer.autoClear;
        renderer.autoClear = false;

        renderer.setClearColor( this.clearColor, 0 );

        if ( maskActive ) renderer.state.buffers.stencil.setTest( false );

        // Render input to screen

        if ( this.renderToScreen ) {

            this.fsQuad.material = this.basic;
            this.basic.map = readBuffer.texture;

            renderer.setRenderTarget( null );
            renderer.clear();
            this.fsQuad.render( renderer );

        }

        // 1. Extract Bright Areas

        this.highPassUniforms[ 'tDiffuse' ].value = readBuffer.texture;
        this.highPassUniforms[ 'luminosityThreshold' ].value = this.threshold;
        this.fsQuad.material = this.materialHighPassFilter;

        renderer.setRenderTarget( this.renderTargetBright );
        renderer.clear();
        this.fsQuad.render( renderer );

        // 2. Blur All the mips progressively

        let inputRenderTarget = this.renderTargetBright;

        for ( let i = 0; i < this.nMips; i ++ ) {

            this.fsQuad.material = this.separableBlurMaterials[ i ];

            this.separableBlurMaterials[ i ].uniforms[ 'colorTexture' ].value = inputRenderTarget.texture;
            this.separableBlurMaterials[ i ].uniforms[ 'direction' ].value = UnrealBloomPass.BlurDirectionX;
            renderer.setRenderTarget( this.renderTargetsHorizontal[ i ] );
            renderer.clear();
            this.fsQuad.render( renderer );

            this.separableBlurMaterials[ i ].uniforms[ 'colorTexture' ].value = this.renderTargetsHorizontal[ i ].texture;
            this.separableBlurMaterials[ i ].uniforms[ 'direction' ].value = UnrealBloomPass.BlurDirectionY;
            renderer.setRenderTarget( this.renderTargetsVertical[ i ] );
            renderer.clear();
            this.fsQuad.render( renderer );

            inputRenderTarget = this.renderTargetsVertical[ i ];

        }

        // Composite All the mips

        this.fsQuad.material = this.compositeMaterial;
        this.compositeMaterial.uniforms[ 'bloomStrength' ].value = this.strength;
        this.compositeMaterial.uniforms[ 'bloomRadius' ].value = this.radius;
        this.compositeMaterial.uniforms[ 'bloomTintColors' ].value = this.bloomTintColors;

        renderer.setRenderTarget( this.renderTargetsHorizontal[ 0 ] );
        renderer.clear();
        this.fsQuad.render( renderer );

        // Blend it additively over the input texture

        this.fsQuad.material = this.blendMaterial;
        this.copyUniforms[ 'tDiffuse' ].value = this.renderTargetsHorizontal[ 0 ].texture;

        if ( maskActive ) renderer.state.buffers.stencil.setTest( true );

        if ( this.renderToScreen ) {

            renderer.setRenderTarget( null );
            this.fsQuad.render( renderer );

        } else {

            renderer.setRenderTarget( readBuffer );
            this.fsQuad.render( renderer );

        }

        // Restore renderer settings

        renderer.setClearColor( this._oldClearColor, this.oldClearAlpha );
        renderer.autoClear = oldAutoClear;

    }

    getSeperableBlurMaterial( kernelRadius: any ) {

        const coefficients = [];

        for ( let i = 0; i < kernelRadius; i ++ ) {

            coefficients.push( 0.39894 * Math.exp( - 0.5 * i * i / ( kernelRadius * kernelRadius ) ) / kernelRadius );

        }

        return new THREE.ShaderMaterial( {

            defines: {
                'KERNEL_RADIUS': kernelRadius
            },

            uniforms: {
                'colorTexture': { value: null },
                'invSize': { value: new THREE.Vector2( 0.5, 0.5 ) }, // inverse texture size
                'direction': { value: new THREE.Vector2( 0.5, 0.5 ) },
                'gaussianCoefficients': { value: coefficients } // precomputed Gaussian coefficients
            },

            vertexShader:
				`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,

            fragmentShader:
				`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`
        } );

    }

    getCompositeMaterial( nMips: any ) {

        return new THREE.ShaderMaterial( {

            defines: {
                'NUM_MIPS': nMips
            },

            uniforms: {
                'blurTexture1': { value: null },
                'blurTexture2': { value: null },
                'blurTexture3': { value: null },
                'blurTexture4': { value: null },
                'blurTexture5': { value: null },
                'bloomStrength': { value: 1.0 },
                'bloomFactors': { value: null },
                'bloomTintColors': { value: null },
                'bloomRadius': { value: 0.0 }
            },

            vertexShader:
				`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,

            fragmentShader:
				`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`
        } );

    }
    static BlurDirectionX: any;
    static BlurDirectionY: any;
}

UnrealBloomPass.BlurDirectionX = new THREE.Vector2( 1.0, 0.0 );
UnrealBloomPass.BlurDirectionY = new THREE.Vector2( 0.0, 1.0 );