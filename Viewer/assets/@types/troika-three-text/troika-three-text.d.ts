import * as THREE from "three";

/**
* @class Text
*
* A ThreeJS Mesh that renders a string of text on a plane in 3D space using signed distance
* fields (SDF).
*/
export class Text extends THREE.Mesh {
    
    /**
    * @member {string} text
    * The string of text to be rendered.
    */
    public text: string;

    /**
    * @member {number|string} anchorX
    * Defines the horizontal position in the text block that should line up with the local origin.
    * Can be specified as a numeric x position in local units, a string percentage of the total
    * text block width e.g. `'25%'`, or one of the following keyword strings: 'left', 'center',
    * or 'right'.
    */
    public anchorX: number | string;

    /**
    * @member {number|string} anchorY
    * Defines the vertical position in the text block that should line up with the local origin.
    * Can be specified as a numeric y position in local units (note: down is negative y), a string
    * percentage of the total text block height e.g. `'25%'`, or one of the following keyword strings:
    * 'top', 'top-baseline', 'top-cap', 'top-ex', 'middle', 'bottom-baseline', or 'bottom'.
    */
    public anchorY: number | string;

    /**
    * @member {number} curveRadius
    * Defines a cylindrical radius along which the text's plane will be curved. Positive numbers put
    * the cylinder's centerline (oriented vertically) that distance in front of the text, for a concave
    * curvature, while negative numbers put it behind the text for a convex curvature. The centerline
    * will be aligned with the text's local origin; you can use `anchorX` to offset it.
    *
    * Since each glyph is by default rendered with a simple quad, each glyph remains a flat plane
    * internally. You can use `glyphGeometryDetail` to add more vertices for curvature inside glyphs.
    */
    public curveRadius: number;

    /**
    * @member {string} direction
    * Sets the base direction for the text. The default value of "auto" will choose a direction based
    * on the text's content according to the bidi spec. A value of "ltr" or "rtl" will force the direction.
    */
    public direction: string;

    /**
    * @member {string|null} font
    * URL of a custom font to be used. Font files can be in .ttf, .otf, or .woff (not .woff2) formats.
    * Defaults to Noto Sans.
    */
    public font: string | null;

    public unicodeFontsURL: string | null; //defaults to CDN

    /**
    * @member {number} fontSize
    * The size at which to render the font in local units; corresponds to the em-box height
    * of the chosen `font`.
    */
    public fontSize: number;

    /**
    * @member {number|'normal'|'bold'}
    * The weight of the font. Currently only used for fallback Noto fonts.
    */
    public fontWeight: number | 'normal' | 'bold';

    /**
    * @member {'normal'|'italic'}
    * The style of the font. Currently only used for fallback Noto fonts.
    */
    public fontStyle: 'normal' | 'italic';

    /**
    * @member {string|null} lang
    * The language code of this text; can be used for explicitly selecting certain CJK fonts.
    */
    public lang: string | null;

    /**
    * @member {number} letterSpacing
    * Sets a uniform adjustment to spacing between letters after kerning is applied. Positive
    * numbers increase spacing and negative numbers decrease it.
    */
    public letterSpacing: number;

    /**
    * @member {number|string} lineHeight
    * Sets the height of each line of text, as a multiple of the `fontSize`. Defaults to 'normal'
    * which chooses a reasonable height based on the chosen font's ascender/descender metrics.
    */
    public lineHeight: number | string;

    /**
    * @member {number} maxWidth
    * The maximum width of the text block, above which text may start wrapping according to the
    * `whiteSpace` and `overflowWrap` properties.
    */
    public maxWidth: number;

    /**
    * @member {string} overflowWrap
    * Defines how text wraps if the `whiteSpace` property is `normal`. Can be either `'normal'`
    * to break at whitespace characters, or `'break-word'` to allow breaking within words.
    * Defaults to `'normal'`.
    */
    public overflowWrap: string;

    /**
    * @member {string} textAlign
    * The horizontal alignment of each line of text within the overall text bounding box.
    */
    public textAlign: 'left' | 'right' | 'center' | 'justify';

    /**
    * @member {number} textIndent
    * Indentation for the first character of a line; see CSS `text-indent`.
    */
    public textIndent: number;

    /**
    * @member {string} whiteSpace
    * Defines whether text should wrap when a line reaches the `maxWidth`. Can
    * be either `'normal'` (the default), to allow wrapping according to the `overflowWrap` property,
    * or `'nowrap'` to prevent wrapping. Note that `'normal'` here honors newline characters to
    * manually break lines, making it behave more like `'pre-wrap'` does in CSS.
    */
    public whiteSpace: string;


    // === Presentation properties: === //

    /**
    * @member {THREE.Material} material
    * Defines a _base_ material to be used when rendering the text. This material will be
    * automatically replaced with a material derived from it, that adds shader code to
    * decrease the alpha for each fragment (pixel) outside the text glyphs, with antialiasing.
    * By default it will derive from a simple white MeshBasicMaterial, but you can use any
    * of the other mesh materials to gain other features like lighting, texture maps, etc.
    *
    * Also see the `color` shortcut property.
    */
    public material: THREE.Material;

    /**
    * @member {string|number|THREE.Color} color
    * This is a shortcut for setting the `color` of the text's material. You can use this
    * if you don't want to specify a whole custom `material`. Also, if you do use a custom
    * `material`, this color will only be used for this particuar Text instance, even if
    * that same material instance is shared across multiple Text objects.
    */
    public color: THREE.ColorRepresentation;

    /**
    * @member {object|null} colorRanges
    * WARNING: This API is experimental and may change.
    * This allows more fine-grained control of colors for individual or ranges of characters,
    * taking precedence over the material's `color`. Its format is an Object whose keys each
    * define a starting character index for a range, and whose values are the color for each
    * range. The color value can be a numeric hex color value, a `THREE.Color` object, or
    * any of the strings accepted by `THREE.Color`.
    */
    public colorRanges: object | null;

    /**
    * @member {number|string} outlineWidth
    * WARNING: This API is experimental and may change.
    * The width of an outline/halo to be drawn around each text glyph using the `outlineColor` and `outlineOpacity`.
    * Can be specified as either an absolute number in local units, or as a percentage string e.g.
    * `"12%"` which is treated as a percentage of the `fontSize`. Defaults to `0`, which means
    * no outline will be drawn unless an `outlineOffsetX/Y` or `outlineBlur` is set.
    */
    public outlineWidth: number | string;

    /**
    * @member {string|number|THREE.Color} outlineColor
    * WARNING: This API is experimental and may change.
    * The color of the text outline, if `outlineWidth`/`outlineBlur`/`outlineOffsetX/Y` are set.
    * Defaults to black.
    */
    public outlineColor: THREE.ColorRepresentation;

    /**
    * @member {number} outlineOpacity
    * WARNING: This API is experimental and may change.
    * The opacity of the outline, if `outlineWidth`/`outlineBlur`/`outlineOffsetX/Y` are set.
    * Defaults to `1`.
    */
    public outlineOpacity: number;

    /**
    * @member {number|string} outlineBlur
    * WARNING: This API is experimental and may change.
    * A blur radius applied to the outer edge of the text's outline. If the `outlineWidth` is
    * zero, the blur will be applied at the glyph edge, like CSS's `text-shadow` blur radius.
    * Can be specified as either an absolute number in local units, or as a percentage string e.g.
    * `"12%"` which is treated as a percentage of the `fontSize`. Defaults to `0`.
    */
    public outlineBlur: number | string;

    /**
    * @member {number|string} outlineOffsetX
    * WARNING: This API is experimental and may change.
    * A horizontal offset for the text outline.
    * Can be specified as either an absolute number in local units, or as a percentage string e.g. `"12%"`
    * which is treated as a percentage of the `fontSize`. Defaults to `0`.
    */
    public outlineOffsetX: number | string;

    /**
    * @member {number|string} outlineOffsetY
    * WARNING: This API is experimental and may change.
    * A vertical offset for the text outline.
    * Can be specified as either an absolute number in local units, or as a percentage string e.g. `"12%"`
    * which is treated as a percentage of the `fontSize`. Defaults to `0`.
    */
    public outlineOffsetY: number | string;

    /**
    * @member {number|string} strokeWidth
    * WARNING: This API is experimental and may change.
    * The width of an inner stroke drawn inside each text glyph using the `strokeColor` and `strokeOpacity`.
    * Can be specified as either an absolute number in local units, or as a percentage string e.g. `"12%"`
    * which is treated as a percentage of the `fontSize`. Defaults to `0`.
    */
    public strokeWidth: number | string;

    /**
    * @member {string|number|THREE.Color} strokeColor
    * WARNING: This API is experimental and may change.
    * The color of the text stroke, if `strokeWidth` is greater than zero. Defaults to gray.
    */
    public strokeColor: THREE.ColorRepresentation;

    /**
    * @member {number} strokeOpacity
    * WARNING: This API is experimental and may change.
    * The opacity of the stroke, if `strokeWidth` is greater than zero. Defaults to `1`.
    */
    public strokeOpacity: number;

    /**
    * @member {number} fillOpacity
    * WARNING: This API is experimental and may change.
    * The opacity of the glyph's fill from 0 to 1. This behaves like the material's `opacity` but allows
    * giving the fill a different opacity than the `strokeOpacity`. A fillOpacity of `0` makes the
    * interior of the glyph invisible, leaving just the `strokeWidth`. Defaults to `1`.
    */
    public fillOpacity: number;

    /**
    * @member {number} depthOffset
    * This is a shortcut for setting the material's `polygonOffset` and related properties,
    * which can be useful in preventing z-fighting when this text is laid on top of another
    * plane in the scene. Positive numbers are further from the camera, negatives closer.
    */
    public depthOffset: number;

    /**
    * @member {Array<number>} clipRect
    * If specified, defines a `[minX, minY, maxX, maxY]` of a rectangle outside of which all
    * pixels will be discarded. This can be used for example to clip overflowing text when
    * `whiteSpace='nowrap'`.
    */
    public clipRect: number[];

    /**
    * @member {string} orientation
    * Defines the axis plane on which the text should be laid out when the mesh has no extra
    * rotation transform. It is specified as a string with two axes: the horizontal axis with
    * positive pointing right, and the vertical axis with positive pointing up. By default this
    * is '+x+y', meaning the text sits on the xy plane with the text's top toward positive y
    * and facing positive z. A value of '+x-z' would place it on the xz plane with the text's
    * top toward negative z and facing positive y.
    */
    public orientation: string;

    /**
    * @member {number} glyphGeometryDetail
    * Controls number of vertical/horizontal segments that make up each glyph's rectangular
    * plane. Defaults to 1. This can be increased to provide more geometrical detail for custom
    * vertex shader effects, for example.
    */
    public glyphGeometryDetail: number;

    /**
    * @member {number|null} sdfGlyphSize
    * The size of each glyph's SDF (signed distance field) used for rendering. This must be a
    * power-of-two number. Defaults to 64 which is generally a good balance of size and quality
    * for most fonts. Larger sizes can improve the quality of glyph rendering by increasing
    * the sharpness of corners and preventing loss of very thin lines, at the expense of
    * increased memory footprint and longer SDF generation time.
    */
    public sdfGlyphSize: number | null;

    /**
    * @member {boolean} gpuAccelerateSDF
    * When `true`, the SDF generation process will be GPU-accelerated with WebGL when possible,
    * making it much faster especially for complex glyphs, and falling back to a JavaScript version
    * executed in web workers when support isn't available. It should automatically detect support,
    * but it's still somewhat experimental, so you can set it to `false` to force it to use the JS
    * version if you encounter issues with it.
    */
    public gpuAccelerateSDF: boolean;

    public debugSDF: boolean;

    /**
     * Updates the text rendering according to the current text-related configuration properties.
     * This is an async process, so you can pass in a callback function to be executed when it
     * finishes.
     * @param {function} [callback]
     */
    sync(callback?: () => void): void;

    /**
     * Initiate a sync if needed - note it won't complete until next frame at the
     * earliest so if possible it's a good idea to call sync() manually as soon as
     * all the properties have been set.
     * @override
     */
    onBeforeRender(renderer: THREE.Renderer, scene: THREE.Scene, camera: THREE.Camera, geometry: THREE.BufferGeometry, material: THREE.Material, group: THREE.Group): void;

    onAfterRender(renderer: THREE.Renderer, scene: THREE.Scene, camera: THREE.Camera, geometry: THREE.BufferGeometry, material: THREE.Material, group: THREE.Group): void;

    /**
     * Shortcut to dispose the geometry specific to this instance.
     * Note: we don't also dispose the derived material here because if anything else is
     * sharing the same base material it will result in a pause next frame as the program
     * is recompiled. Instead users can dispose the base material manually, like normal,
     * and we'll also dispose the derived material at that time.
     */
    dispose(): void;

    /**
     * @property {TroikaTextRenderInfo|null} textRenderInfo
     * @readonly
     * The current processed rendering data for this TextMesh, returned by the TextBuilder after
     * a `sync()` call. This will be `null` initially, and may be stale for a short period until
     * the asynchrous `sync()` process completes.
     */
    //get textRenderInfo(): TroikaTextRenderInfo | null;

    /**
     * Translate a point in local space to an x/y in the text plane.
     */
    public localPositionToTextCoords(position: THREE.Vector2Like, target?: THREE.Vector2): THREE.Vector2;

    /**
     * Translate a point in world space to an x/y in the text plane.
     */
    public worldPositionToTextCoords(position: THREE.Vector2Like, target?: THREE.Vector2): THREE.Vector2;

    /**
     * @override Custom raycasting to test against the whole text block's max rectangular bounds
     * TODO is there any reason to make this more granular, like within individual line or glyph rects?
     */
    public raycast(raycaster: unknown, intersects: unknown): void;
}