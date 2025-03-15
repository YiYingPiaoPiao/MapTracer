import { MapTracerTools     as mtTools     } from "../script/Tools.js"     ;

import { MapTracerWorld    as mtcWorld    } from "./MapTracerWorld.js"  ;


/**
 *  ## MapTracer
 */
class MapTracer extends HTMLElement {

    MapTracerDefaultValueHost = "http://127.0.0.1:5500";

    /** Resource Configuration File Path. @private @type {string} */
    #defaultResource;

    /**
     * ## MapTracer Attributes
     * ---
     * Stores default attribute values for the MapTracer component.
     * If the user sets these attributes, their values will override the defaults.
     * 
     * ### Attributes:
     * 1. **`res-map`**  - Path to the map SVG resource configuration file.
     * 2. **`visited`**  - Records accessed configuration files. Must follow a specified format.
     * 
     * ---
     * ### Note:
     * - All attributes have predefined default values.
     * - If the user specifies an attribute, its value will be updated accordingly.
     * 
     * @private
     * @type {Object.<string, string>}
     */
    #MapTracerAttribute = {
        "res-map"   : `${this.MapTracerDefaultValueHost}/data/resMap.json` ,
        "visited"   : `${this.MapTracerDefaultValueHost}/data/visited.json`,
        "map-style" : `${this.MapTracerDefaultValueHost}/src/styles/map.css`
    };

    #visitedData    = {};
    #visitedCountry = [];

    #componentsWorld = new mtcWorld();

    #mtTools     = new mtTools();
    #mtTaskAgent;

    /** innerStyle @type {string} */
    innerStyle;

    constructor () {
        super();

        this.#init.style()      ;
        this.#init.attr()       ;
        this.#init.innerStyle() ;
    }

    async connectedCallback () {
        const shadow = this.attachShadow({
            mode: "open"
        });

        // Get Map Configuration
        this.#defaultResource = await this.#configuration(
            this.#MapTracerAttribute["res-map"]
        );

        // Set world map
        this.#componentsWorld.init(
            this.#defaultResource["world"]
        );

        const MapWorld = document.createElement("div");
        MapWorld.setAttribute(
            "id",
            "MapTracer-World"
        );
        MapWorld.appendChild(
            this.#componentsWorld.object
        );
        
        // Settings Components inner style.
        const style = document.createElement("style");
        style.textContent = this.innerStyle;
        shadow.appendChild(style);
        shadow.appendChild(MapWorld);

        // Set data when loaded svg maps
        this.#visitedData = await this.#mtTools.getJson(
            this.#MapTracerAttribute["visited"]
        )
        this.#visitedCountry = Object.keys(this.#visitedData);

        // Process loded function
        this.#componentsWorld.loaded(
            this.#MapTracerAttribute["map-style"],
            this.#visitedCountry
        );
    }

    /**
     * ## Load Map Resource Configuration File
     *
     * This method retrieves the resource path from the `res-map` property.
     * The configuration file must be in **JSON** format and contain the following keys:
     *
     * - **world**: Path to the world map resource, typically an SVG file.
     * - **country**: Directory containing country map resources.
     *   - Unless specified otherwise, all country maps will be loaded from this directory.
     * 
     * If specific countries have unique resource paths, their respective IDs in the world map
     * can be used as keys to define their paths.
     * 
     * **Note:** If the resource cannot be loaded from the specified path in the configuration file,  
     * the system will fall back to the default map resource.
     *
     * ### Example Configuration:
     * ```json
     * {
     *   "world"    : "/your/world/svg/file/path/map.svg",
     *   "country"  : "/path/to/all/country/maps",
     *   "my"       : "/path/to/malaysia/map.svg"
     * }
     * ```
     *
     * @param   {string         } configPath - The file path of the configuration set by the user.
     * @return  {Promise<JSON>  } Resolves with the parsed JSON configuration object.
     * @throws  {ReferenceError } If the configuration file is missing required keys.
     * @throws  {Error          } If the file cannot be loaded due to an error.
     * @private
     */
    async #configuration (
        configPath
    ) {
        try {
            const config = await this.#mtTools.getJson(configPath);
            if (!config?.world || !config?.country) {
                throw new ReferenceError(
                    `Invalid configuration: Missing required keys "world" or "country" in resource file "${configPath}".`
                );
            }
            return config;
        } catch (error) {
            throw new Error(
                `Failed to load resource configuration from: "${configPath}". Cause: ${error.message}`
            );
        }
    }

    /** 
     * ## Initializes the component
     * 
     * @private
     */
    get #init () {
        return {
            /**
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
             * 
             */
            style: () => {
                /** The computed styles of the element */
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
            },

            /**
             * Handles element attributes by checking user-defined values  
             * and applying default values if necessary.
             * 
             * - Retrieves attribute names from `#MapTracerAttribute`.
             * - Checks if the attribute is missing, empty, or invalid.
             * - Logs a warning if an attribute is unset and applies the default value.
             * - Updates `#MapTracerAttribute` with the user-defined or default value.
             */
            attr: () => {
                Object.keys(this.#MapTracerAttribute).forEach((attr) => {
                    let userAttr = this.getAttribute(attr)?.trim();
                    if (
                        !userAttr               ||
                        userAttr === ""         ||
                        userAttr === "undefined"
                    ) {
                        console.warn(`The attribute [${attr}] is not set or empty, using default value: ${this.#MapTracerAttribute[attr]}`);
                    }

                    this.#MapTracerAttribute[attr] = userAttr || this.#MapTracerAttribute[attr];
                });
            },

            /**
             * ## Inject Inner Styles for MapTracer
             * ---
             * Dynamically generates and applies styles for the MapTracer world and its object.
             */
            innerStyle: () => {
                let Style_MapTracer_World = `
                /* MapTracer World */
                #MapTracer-World {

                    position: absolute;

                    left  : 0;
                    right : 0;
                    top   : 0;
                    bottom: 0;

                    margin: auto;

                    height: ${this.style.height};
                    width : ${this.style.width };
                }
                `;

                let Style_MapTracer_Obj = `
                /* MapTracer World Object */
                #MapTracer-World object {
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

                this.innerStyle = `${Style_MapTracer_World}${Style_MapTracer_Obj}`;
            }
        }
    }

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

customElements.define("map-tracer", MapTracer);