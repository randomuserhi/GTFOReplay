const { Mesh, MeshPhongMaterial, Vector3, Euler } = await require("three", "esm");
const { loadGLTFGeometry } = await require("@asl/vanilla/library/modelloader.js", "asl");
const { HumanoidEnemyModel } = await require("@asl/vanilla/renderer/enemy/models/humanoid.js", "asl");
exports.BloodMassModel = class extends HumanoidEnemyModel {
  constructor(wrapper) {
    super(wrapper);
    this.tendrilMaterial = new MeshPhongMaterial({ color: 0xff0000 });

    this.tendrils = [];
    this.originalRotations = [];
    this.randomOffsets = [];
    
    loadGLTFGeometry("../js3party/models/spike.glb").then(model => {
      const tendrilsPerPart = 8;

      const partsToAttachTo = ["hip", "spine1", "spine2"];

      let tendrilScale = new Vector3(0.1, 0.3, 0.1);
      if (this.settings?.tendrilScale !== undefined)
      { 
        tendrilScale.multiply(new Vector3(this.settings.tendrilScale.x, this.settings.tendrilScale.y, this.settings.tendrilScale.z));
      }


      for (let j = 0; j < partsToAttachTo.length; j++) {
        const jointname = partsToAttachTo[j];
        const randOffset = Math.random();
        for (let i = 0; i < tendrilsPerPart; i++) {
          const rotAngle = i * (360/tendrilsPerPart);
          const tendril = new Mesh(model, this.tendrilMaterial);
          this.visual.joints[jointname].add(tendril);
          tendril.scale.copy(tendrilScale);
          tendril.rotation.set(Math.deg2rad * 60, Math.deg2rad * rotAngle + randOffset, 0, "YXZ");
          const fwd = new Vector3(0, 0.08, 0);
          tendril.position.add(fwd.applyQuaternion(tendril.quaternion));
          tendril.position.add(new Vector3(0, (j * 0.15), 0));

          this.tendrils.push(tendril);
          this.originalRotations.push(tendril.rotation.clone());
          this.randomOffsets.push(Math.random());
        }

        // to have them point downwards
        for (let i = 0; i < tendrilsPerPart; i++) {
          const rotAngle = i * (360/tendrilsPerPart);
          const tendril = new Mesh(model, this.tendrilMaterial);
          this.visual.joints[jointname].add(tendril);
          tendril.scale.copy(tendrilScale);
          tendril.rotation.set(Math.deg2rad * 110, Math.deg2rad * rotAngle + randOffset, 0, "YXZ");
          const fwd = new Vector3(0, 0.08, 0);
          tendril.position.add(fwd.applyQuaternion(tendril.quaternion));
          tendril.position.add(new Vector3(0, (j * 0.15), 0));

          this.tendrils.push(tendril);
          this.originalRotations.push(tendril.rotation.clone());
          this.randomOffsets.push(Math.random());
        }

        const upspikeTendril = new Mesh(model, this.tendrilMaterial);
        this.visual.joints[jointname].add(upspikeTendril);
        upspikeTendril.scale.copy(tendrilScale);
        upspikeTendril.position.add(new Vector3(0, (j * 0.15) + 0.08, 0));
        this.tendrils.push(upspikeTendril);
        this.originalRotations.push(upspikeTendril.rotation.clone());
        this.randomOffsets.push(Math.random());

        const downspikeTendril = new Mesh(model, this.tendrilMaterial);
        this.visual.joints[jointname].add(downspikeTendril);
        downspikeTendril.scale.copy(tendrilScale);
        downspikeTendril.position.add(new Vector3(0, (j * 0.15) + 0.08, 0));
        downspikeTendril.rotation.set(Math.deg2rad * 180, 0, 0)
        this.tendrils.push(downspikeTendril);
        this.originalRotations.push(downspikeTendril.rotation.clone());
        this.randomOffsets.push(Math.random());
      }

    });

    // for gc prevention
    this.temp = new Euler();

  }

  applySettings(settings) {
    super.applySettings(settings);

    if (this.settings?.color !== undefined) this.tendrilMaterial.color.set(this.settings.color);
  }

  render(dt, time, enemy, anim) {
    // console.log(this.temp);
    // console.log(this.tendrils);
    // console.log(this.originalRotations);

    if (!this.isVisible()) return;
    if (anim.state === "Hibernate") time *= 0.2;
    this.animate(dt, time, enemy, anim); // animate the stick figure as normal
    //super.render(dt, time, enemy, anim); // call original render function to draw stick figure
    
    // small amounts of wriggling to the tendrils
    for (let i = 0; i < this.tendrils.length; ++i) {
      const tendril = this.tendrils[i];
      const rot = this.originalRotations[i];
      const offset = this.randomOffsets[i];
      this.temp.copy(rot);
      this.temp.x += 5 * Math.sin((time * offset + offset * 2000) / 1000) * Math.deg2rad;
      this.temp.y += 10 * Math.sin((time * offset + offset * 4000) / 1000) * Math.deg2rad;
      this.temp.z += 20 * Math.sin((time * offset + offset * 3000) / 1000) * Math.deg2rad;
      tendril.rotation.copy(this.temp);
    }

  }
};