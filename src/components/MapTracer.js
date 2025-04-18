import { MapTracerTools    as mtTools     } from "../script/Tools.js"   ;

import { MapTracerWorld    as mtcWorld    } from "./MapTracerWorld.js"  ;
import { MapTracerCountry  as mtcCountry  } from "./MapTracerCountry.js";

class MapTracer extends HTMLElement {

    defaultHost = "http://127.0.0.1:5500";
    // defaultHost = "https://raw.githubusercontent.com/YiYingPiaoPiao/MapTracer/refs/heads/main";
    #attributes = {
        "map-res"   : `${this.defaultHost}/data/resMap.json`    ,
        "map-style" : `${this.defaultHost}/src/styles/map.css`  ,
        "visited"   : `${this.defaultHost}/data/visited.json`
    }

    innerStyle;
    
    #dataMapTracer = {};

    #mtTools = new mtTools();

    #mtWorld = new mtcWorld();

    constructor () {
        super();

        this.#initialization.attributes ();
        this.#initialization.styleTag   ();
        this.#initialization.styleInner ();
    }

    async connectedCallback() {
        const shadow = this.attachShadow({
            mode: "open"
        });

        await this.#data.visited (this.#attributes["visited"]);
        await this.#data.resource(this.#attributes["map-res"]);

        console.log(this.#dataMapTracer);
        this.#mtWorld.init(
            this.#dataMapTracer.world.res
        );
    }

    #initialization = {
        attributes: () => {
            let warnMsg = "";
            Object.keys(this.#attributes).forEach(
                (attribute) => {
                    let attr = this.getAttribute(attribute)?.trim();
                    if (
                        !attr               ||
                        attr === ""         ||
                        attr === "undefined"
                    ) {
                        warnMsg = `\t${attribute}: ${this.#attributes[attribute]}\n${warnMsg}`
                    }

                    this.#attributes[attribute] = attr || this.#attributes[attribute];
                }
            );

            if (warnMsg !== "") {
                console.warn(`The data following below is not set or empty, that are using default value:\n${warnMsg}`);
            }
        },

        styleTag: () => {
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

        styleInner: () => {
            let style_Map_MapTracer = `
            div.MapTracer-Map {

                position: absolute;

                left  : 0;
                right : 0;
                top   : 0;
                bottom: 0;

                margin: auto;

                height: ${this.style.height};
                width : ${this.style.width };ss
            }
            `;

            let style_Object_MapTracer = `
            div.MapTracer-Map object {
                position   : absolute;
                left       : 0;
                right      : 0;
                top        : 0;
                bottom     : 0;
                margin     : auto;
                max-height : 100%;
                max-width  : 100%;
                will-change: transform;
            }
            `;

            this.innerStyle = `${style_Map_MapTracer}${style_Object_MapTracer}`
        }
    }

    #data = {

        resource: async (
            path
        ) => {
            let dataTemp = await this.#mtTools.getJson(path);

            if (
                !dataTemp["world"]
            ) {
                throw new ReferenceError("The map resource 'world' can't be emtpy.");
            }

            this.#dataMapTracer["world"] = {
                res: dataTemp.world
            };
            this.#dataMapTracer.country.list.forEach((country) => {
                this.#dataMapTracer.country[country]["res"] = dataTemp[country] || `${dataTemp.country}${country}.svg`;
            });
        },

        visited: async (
            path
        ) => {
            this.#dataMapTracer["country"] = {
                list : []
            };

            let dataTemp    = await this.#mtTools.getJson(path);
            let listCountry = Object.keys(dataTemp);
            
            if (listCountry.length === 0) {
                console.warn("Visited List in an empty list.");
                return;
            }

            listCountry.forEach((country) => {
                let dataCountry     = dataTemp[country];
                let listProvince    = Object.keys(dataCountry);

                if (listProvince.length === 0) {
                    console.warn(`That have no province from Country: ${country}`);
                    return;
                }

                listProvince.forEach((province) => {
                    let dataProvince        = dataCountry[province];
                    let dataProvinceLength  = dataProvince.length;
                    if (
                        dataProvinceLength === 0
                    ) {
                        console.warn(`The province ${province} is not any data in this list.`);
                        return;
                    }

                    if (!this.#dataMapTracer.country[country]) {
                        this.#dataMapTracer.country.list.push(country);
                        this.#dataMapTracer.country[country] = {
                            list: []
                        };
                    }

                    this.#dataMapTracer.country[country].list.push(province);
                    this.#dataMapTracer.country[country][province] = dataProvince;
                });
            });

            // console.log(this.#dataMapTracer);
        }
    }

    // #visitedData    = {};
    // #visitedCountry = [];

    // #componentsWorld  = new mtcWorld  ();
    // #componentsCoutry = new mtcCountry();

    // #mtTools     = new mtTools();
    // #mtTaskAgent;

    // async connectedCallback () {
    //     const shadow = this.attachShadow({
    //         mode: "open"
    //     });

    //     // Get Map Configuration
    //     this.#defaultResource = await this.#configuration(
    //         this.#MapTracerAttribute["res-map"]
    //     );

    //     // Set world map
    //     this.#componentsWorld.init(
    //         this.#defaultResource["world"]
    //     );

    //     const MapWorld = document.createElement("div");
    //     MapWorld.classList.add("MapTracer-SVG");
    //     MapWorld.setAttribute(
    //         "id",
    //         "MapTracer-World"
    //     );
    //     MapWorld.appendChild(
    //         this.#componentsWorld.object
    //     );

    //     // Initial Country Maps
    //     const MapCountry = document.createElement("div");
    //     MapCountry.classList.add("MapTracer-SVG");
    //     MapCountry.setAttribute(
    //         "id",
    //         "MapTracer-Country"
    //     );
    //     MapCountry.append(
    //         this.#componentsCoutry.object
    //     );

    //     // init visited list
    //     const MapTracerListVisited = document.createElement("div");
    //     MapTracerListVisited.setAttribute(
    //         "id",
    //         "MapTracer-List-Visited"
    //     );
        
    //     // Settings Components inner style.
    //     const style = document.createElement("style");
    //     style.textContent = this.innerStyle;
    //     shadow.appendChild(style);
        
    //     shadow.appendChild(MapWorld             );
    //     shadow.appendChild(MapCountry           );
    //     shadow.appendChild(MapTracerListVisited );

    //     // Set data when loaded svg maps
    //     this.#visitedData = await this.#mtTools.getJson(
    //         this.#MapTracerAttribute["visited"]
    //     )
    //     this.#visitedCountry = Object.keys(this.#visitedData);

    //     // Process loded function
    //     await this.#componentsWorld.loaded(
    //         this.#MapTracerAttribute["map-style"],
    //         this.#visitedCountry
    //     );

    //     // Bind events listen
    //     this.#componentsWorld.object.contentDocument.addEventListener("click", (e) => this.#componentsWorld.MapEvents.MapClick(e, this.country.loadMaps));
    // }

    /**
     *  ## Country function
     */
    // get country() {
    //     return {
    //         /**
    //          * Loading Country function
    //          * 
    //          * @param {HTMLElement} el 
    //          */
    //         loadMaps: async (
    //             el
    //         ) => {
    //             let CountryId = el.id;
                
    //             let resourcePath = 
    //                 this.#defaultResource[CountryId.toLowerCase()] ||
    //                 this.#defaultResource[CountryId.toUpperCase()] ||
    //                 this.#defaultResource[CountryId]               ||
    //                 `${this.#defaultResource["country"]}${CountryId.toLowerCase()}.svg`;

    //             let svgCountryData = await this.#componentsCoutry.init (
    //                 resourcePath,
    //                 el
    //             );
    //             let svgCountry = svgCountryData["svgGroup"];
    //             let viewBox    = svgCountryData["viewBox" ];

    //             let pathChild = svgCountry.querySelectorAll("path");
    //             let animateTransform = svgCountry.querySelectorAll("animateTransform");

    //             const parentBox = el.parentNode;

    //             parentBox.parentNode.querySelector("defs").querySelector("style").textContent += `
    //             .land:not(.map-country .land) {
    //                 fill        : rgba(0, 0, 0, 0);
    //                 background  : rgba(0, 0, 0, 0);
    //                 transition  : all 0.5s;
    //             }

    //             #${CountryId} {
    //                 fill        : rgba(0, 0, 0, 0);
    //                 background  : rgba(0, 0, 0, 0);
    //                 transition  : all 1s;
    //             }
    //             `;

    //             await new Promise(r => setTimeout(r, 500));

    //             while(parentBox.firstChild) {
    //                 parentBox.removeChild(parentBox.firstChild);
    //             }

    //             const animateViewBox = document.createElementNS("http://www.w3.org/2000/svg", "animate");
    //             animateViewBox.setAttribute("attributeName", "viewBox");
    //             animateViewBox.setAttribute("from", parentBox.parentNode.getAttribute("viewBox"));
    //             animateViewBox.setAttribute("to", `${viewBox[0]} ${viewBox[1]} ${viewBox[2]} ${viewBox[3]}`);
    //             animateViewBox.setAttribute("dur", "0.5s");
    //             animateViewBox.setAttribute("fill", "freeze");

    //             parentBox.appendChild(svgCountry);
    //             animateTransform.forEach(animate => {
    //                 animate.beginElement();
    //             });

    //             setTimeout(() => {
    //                 parentBox.parentNode.appendChild(animateViewBox);
    //                 animateViewBox.beginElement();
    //             }, 50);
    //         }
    //     }
    // }

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
    // async #configuration (
    //     configPath
    // ) {
    //     try {
    //         const config = await this.#mtTools.getJson(configPath);
    //         if (!config?.world || !config?.country) {
    //             throw new ReferenceError(
    //                 `Invalid configuration: Missing required keys "world" or "country" in resource file "${configPath}".`
    //             );
    //         }
    //         return config;
    //     } catch (error) {
    //         throw new Error(
    //             `Failed to load resource configuration from: "${configPath}". Cause: ${error.message}`
    //         );
    //     }
    // }
}

customElements.define("map-tracer", MapTracer);