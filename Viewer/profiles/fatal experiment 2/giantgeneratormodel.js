
const { Mesh, MeshPhongMaterial, Vector3, Euler } = await require("three", "esm");
const { StickFigure } = await require("../vanilla/renderer/models/stickfigure.js", "asl");
const { FlyerModel } = await require("../vanilla/renderer/enemy/models/flyer.js", "asl");
exports.GiantGeneratorModel = class extends FlyerModel {
  constructor() {
    super();
      
    this.stickfigure = new StickFigure();
    
    // Attach the stickfigure to the flyer so it moves and rotates with it
    this.anchor.add(this.stickfigure.root);
    this.stickfigure.applySettings({
      hide: {
        leftUpperLeg: true,
        leftLowerLeg: true,
        rightUpperLeg: true,
        rightLowerLeg: true
      }
    })
    
    //this.stickfigure.visual.joints.leftUpperLeg.quaternion.set(0, 0, 0, 0); // change rotations of joints
    this.stickfigure.root.position.add(new Vector3(0, -0.5, 0));
    this.stickfigure.root.scale.set(0.8, 0.8, 0.8)

    this.stickfigure.visual.joints.leftShoulder.position.add(new Vector3(-0.1, -0.08, 0));
    this.stickfigure.visual.joints.leftShoulder.rotation.set(0, 0, 20 * Math.deg2rad);
    this.stickfigure.visual.joints.leftLowerArm.rotation.set(0, 0, 0);
    this.stickfigure.visual.joints.rightShoulder.position.add(new Vector3(0.1, -0.08, 0));
    this.stickfigure.visual.joints.rightShoulder.rotation.set(0, 0, -20 * Math.deg2rad);
    this.stickfigure.visual.joints.rightLowerArm.rotation.set(0, 0, 0);
  }
  render(dt, time, enemy, anim) {
    super.render(dt, time, enemy, anim); // ensure the flyer is rendered
    this.stickfigure.color = this.material.color;
    this.stickfigure.draw() // draw stick figure
  }
  applySettings(settings) {
    super.applySettings(settings);
  }
};