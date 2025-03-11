import { MapTracer_World } from "./MapWorld.js";

const tools = {
    getJson: async (
        url
    ) => {
        if (window.fetch) {
            return fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP Error! Status: ${response.status}`);
                    }
                    return response.json();
                });
        } else {
            return new Promise(function(resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, true);
    
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                var data = JSON.parse(xhr.responseText);
                                resolve(data);
                            } catch (e) {
                                reject(e);
                            }
                        } else {
                            reject(new Error(`HTTP Error! Status: ${xhr.status}`));
                        }
                    }
                };
    
                xhr.send();
            });
        }
    }
}

class MapTracer extends HTMLElement {

    #visitedData    = {};
    #visitedCountry = [];

    #resDir = "/src/res";

    constructor () {
        super();

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
        
        const res = this.getAttribute("res");
        if (res) {
            this.#resDir = res;
        }
    }

    async connectedCallback () {

        const shadow = this.attachShadow({
            mode: "open"
        });

        const MapBox_World = document.createElement("div");

        MapBox_World.setAttribute("id", "MapTracer-MapBox-World");
        MapBox_World.appendChild(MapTracer_World.init(
            this.#resDir
        ));

        const MapBox_Country = document.createElement("div");
        MapBox_Country.setAttribute("id", "MapTracer-MapBox-Country");

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
        `;

        shadow.appendChild(style);
        shadow.appendChild(MapBox_World);

        const visited = this.getAttribute("visited");
        if (
            !visited ||
            visited.trim() === "" ||
            visited === "undefined"
        ) {
            throw new ReferenceError(`<map-tracer> must have a "visited" attribute with a valid value. Your "visited" value is: "${visited}".`);
        }

        this.#visitedData    = await tools.getJson(visited);
        this.#visitedCountry = Object.keys(this.#visitedData);

        const MapBox_World_Object = MapBox_World.querySelector("object");
        MapBox_World_Object.addEventListener("load", () => {
            let svgWorld = MapBox_World_Object.contentDocument;

            this.#visitedCountry.forEach(country => {
                svgWorld.querySelector(`#${country}`).classList.add("visited");
            });

            svgWorld.addEventListener("mouseover", (e) => {
                if (e.target.classList.contains("visited")) {
                    console.log(e.target);
                }
            });
        });
    }
}

customElements.define("map-tracer", MapTracer);