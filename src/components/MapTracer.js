import { MapTracerTools     as mtTools     } from "../script/Tools.js"     ;
import { MapTracerTaskAgent as mtTaskAgent } from "../script/TaskAgent.js" ;

import { MapTracerComponentsWorld    as mtcWorld    } from "./MapTracerComponentsWorld.js"  ;
import { MapTracerComponentsCountry  as mtcCountry  } from "./MapTracerComponentsCountry.js";

class MapTracer extends HTMLElement {

    /** Resource Configuration File Path. @private @type {string} */
    #defaultResource;

    /**  */
    #visitedData    = {};
    #visitedCountry = [];

    #componentsWorld;

    #mtTools    ;
    #mtTaskAgent;

    constructor () {
        super();

        this.#mtTools       = new mtTools()     ;
        this.#mtTaskAgent   = new mtTaskAgent() ;

        this.#initSytle();
    }

    /**
     * @private
     * ## Adjust Element Dimensions and Style Fixes
     * ---
     * 1. Retrieve the computed styles of the current element using `getComputedStyle()`.
     * 2. Extract width, height, and related min/max dimensions, storing them in the `dimensions` object.
     * 3. If both `width` and `height` are set to `auto`, adjust them based on constraints:
     *    - Calculate `height`:
     *      - If `max-height` is `none`:
     *        - If `min-height` is `0px`, set `height` to `80dvh` (default height).
     *        - Otherwise, use `min-height` as the `height`.
     *      - Otherwise, use `max-height` as the `height`.
     *    - Calculate `width`:
     *      - If `max-width` is `none`:
     *        - If `min-width` is `0px`, set `width` to `80vw` (default width).
     *        - Otherwise, use `min-width` as the `width`.
     *      - Otherwise, use `max-width` as the `width`.
     * 
     * 4. Apply style fixes:
     *    - If `position` is `static` (default style or user-defined), change it to `relative` to ensure proper positioning.
     *    - If `display`  is `inline` (default style or user-defined), change it to `block`    to ensure correct layout behavior.
     * 
     * 5. Iterate through `StyleFixes` to apply corrections:
     *    - Retrieve the user-defined styles and apply fixes if they match the defined rules.
     */
    #initSytle () {
        const userStyle = getComputedStyle(this);
        const dimensions = {
            width       : userStyle.getPropertyValue("width"        ),
            height      : userStyle.getPropertyValue("height"       ),
            minHeight   : userStyle.getPropertyValue("min-height"   ),
            maxHeight   : userStyle.getPropertyValue("max-height"   ),
            minWidth    : userStyle.getPropertyValue("min-width"    ),
            maxWidth    : userStyle.getPropertyValue("max-width"    ),
        }
        if (
            dimensions.width  === "auto" &&
            dimensions.height === "auto"
        ) {
            this.style.height = dimensions.maxHeight === "none" ? (dimensions.minHeight === "0px" ? "80dvh" : dimensions.minHeight) : dimensions.maxHeight;
            this.style.width  = dimensions.maxWidth  === "none" ? (dimensions.minWidth  === "0px" ? "80vw"  : dimensions.minWidth ) : dimensions.minWidth ;
        }
        const StyleFixes = {
            position: (value) => (value === "static" ? "relative"   : ""),
            display : (value) => (value === "inline" ? "block"      : ""),
        };
        Object.entries(StyleFixes).forEach(([prop, fix]) => {
            const userValue = userStyle.getPropertyValue(prop);
            const newValue  = fix(userValue);
            if (newValue) this.style[prop] = newValue;
        });
    }

    /**
     * Load Map Resource Configuration File
     * 
     * This method retrieves the resource path from the `res` attribute in the tag.  
     * The configuration file follows a **JSON** format.
     * 
     * The configuration file must include the following two keys:
     *   1. world
     *      > The path to the world map resource, typically an SVG file.
     *   2. country
     *      > The directory containing country map resources.  
     *      > Unless specified otherwise, all country maps are loaded from this folder.
     * 
     * If different countries have unique resource paths,  
     * their respective IDs in the world map can be used as keys to specify paths.
     * 
     * Note: If resources cannot be loaded from the specified paths in the configuration file,  
     * the default map resources will be used.
     * 
     * Example Configuration:
     * ```
     * {
     *     "world"  : "/your/world/svg/file/path/map.svg"   ,
     *     "country": "/path/to/all/country/maps"           ,
     *     "my"     : "/path/to/malaysia/map.svg"
     * }
     * ```
     * 
     *  @param {string} resCfg
     *  @return {string} cfg:
     */
    async #configuration (
        resCfg
    ) {
        if (
            !resCfg ||
            resCfg.trim() === "" ||
            resCfg === "undefined"
        ) {
            throw new ReferenceError(`<map-tracer> must have a [res] attribute with a valid value. Your [res] value is: "${resCfg}".`);
        }
        try {
            var cfg = await this.#mtTools.getJson(resCfg);
        } catch (error) {
            throw new Error(`Failed to load resource configuration from: "${resCfg}". Error: ${error.message}`);
        }
        if (
            !cfg.world    ||
            !cfg.country
        ) {
            throw new ReferenceError(`Invalid configuration: Missing required keys "world" or "country" in resource file "${resCfg}".`);
        }
        return cfg;
    }

    async connectedCallback () {

        const shadow = this.attachShadow({
            mode: "open"
        });

        this.#defaultResource = await this.#configuration(
            this.getAttribute("res")?.trim()
        );

        /**
         *  World Map relation logic.
         */
        this.#componentsWorld = new mtcWorld(this.#defaultResource.world);
        const MapTracerBoxWorld = document.createElement("div");
        MapTracerBoxWorld.setAttribute(
            "id",
            "MapTracer-MapBox-World"
        );
        MapTracerBoxWorld.append(
            this.#componentsWorld.getMapTracer()
        );

        const style = document.createElement("style");
        style.textContent = `
            #MapTracer-MapBox-World {

                position: absolute;

                left  : 0;
                right : 0;
                top   : 0;
                bottom: 0;

                margin: auto;

                height: ${this.clientHeight}px;
                width : ${this.clientWidth }px;
            }

            #MapTracer-MapBox-World object {
                position  : absolute;
                left      : 0;
                right     : 0;
                top       : 0;
                bottom    : 0;
                margin    : auto;
                max-height: 100%;
                max-width : 100%;
            }
        `;

        shadow.appendChild(style);
        shadow.appendChild(MapTracerBoxWorld);

        const visited = this.getAttribute("visited");
        if (
            !visited ||
            visited.trim() === "" ||
            visited === "undefined"
        ) {
            throw new ReferenceError(`<map-tracer> must have a "visited" attribute with a valid value. Your "visited" value is: "${visited}".`);
        }

        this.#visitedData = await this.#mtTools.getJson(visited);
        this.#visitedCountry = Object.keys(this.#visitedData);
        console.log(this.#visitedCountry);

        const MapObj = MapTracerBoxWorld.querySelector("object");
        MapObj.addEventListener("load", () => {
            let svgWorld = MapObj.contentDocument;
            this.#componentsWorld.setVisited(
                this.#visitedCountry
            );
            // this.#
        });
        
        // .addEventListener("load", () => {

        //     let svgWorld = MapTracerBoxWorld.contentDocument;
        //     console.log(svgWorld);
        // });

        // const MapBox_World_Object = MapBox_World.querySelector("object");
        // MapBox_World_Object.addEventListener("load", () => {
        //     let svgWorld = MapBox_World_Object.contentDocument;

        //     this.#visitedCountry.forEach(country => {
        //         svgWorld.querySelector(`#${country}`).classList.add("visited");
        //     });

        //     svgWorld.addEventListener("mouseover", (e) => {
        //         if (!e.target.classList.contains("visited")) {
        //             return;
        //         }

        //         let country_svg = `https://raw.githubusercontent.com/SeeChen/seechen.github.io/refs/heads/main/File/Maps/${e.target.id}_High.svg`;
        //         fetch(country_svg)
        //             .then(response => response.text())
        //             .then(svgTxt => {
        //                 const parser = new DOMParser();
        //                 const svgDoc = parser.parseFromString(svgTxt, "image/svg+xml");

        //                 const svgElement = svgDoc.documentElement;
        //                 const svgGroup = svgElement.querySelector("g");
                        
        //                 const bbox = e.target.getBBox();
        //                 const bboxX = bbox.x;
        //                 const bboxY = bbox.y;
        //                 const bboxW = bbox.width;
        //                 const bboxH = bbox.height;

        //                 const viewBox = svgElement.getAttribute("viewBox").split(" ").map(Number);
        //                 const vW = viewBox[2];
        //                 const vH = viewBox[3];

        //                 let scaleX = bboxW / vW;
        //                 let scaleY = bboxH / vH;

        //                 svgGroup.setAttribute("transform", `translate(${bboxX}, ${bboxY}) scale(${scaleX}, ${scaleY})`)
        //                 e.target.parentNode.replaceChild(svgGroup, e.target);

        //             })
        //             .catch(err => console.log("Error"));
        //     });
        // });
    }
}

customElements.define("map-tracer", MapTracer);