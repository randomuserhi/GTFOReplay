import { MacroElement } from "@/rhu/macro.js";

export class SVGIcon extends MacroElement {
    public svg: SVGElement;
    
    constructor(dom: Node[], bindings: any) {
        super(dom, bindings);
        
        this.svg = dom[0] as SVGElement;
    }
}