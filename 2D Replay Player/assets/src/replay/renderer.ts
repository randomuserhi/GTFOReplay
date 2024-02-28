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

    public Test(replay: Replay.Api) {
        const meshes = replay.header.get("Vanilla.Map.Geometry")!.get(0)!;
        for (let i = 0; i < meshes.length; ++i) {
            const geometry = new THREE.BufferGeometry();
                    
            geometry.setIndex(meshes[i].indices);
            
            geometry.setAttribute("position", new THREE.BufferAttribute(meshes[i].vertices, 3));
            geometry.computeVertexNormals();

            //const material = new THREE.MeshStandardMaterial({
            //const material = new THREE.MeshPhongMaterial({
            const material = new THREE.MeshStandardMaterial({
                color: 0xaaaaaa,
                side: THREE.DoubleSide, // causes issues for shadows :(
                //flatShading: true,
            });
                    
            const surface = new THREE.Mesh(geometry, material);
            surface.castShadow = true;
            surface.receiveShadow = true;
            this.scene.add(surface);

            /*const edges = new THREE.EdgesGeometry( geometry ); 
            const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial( { color: 0x888888 } ) ); 
            this.scene.add( line );*/

            //const helper = new VertexNormalsHelper(surface);
            //this.scene.add(helper);
        }
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