class MapTracer extends HTMLElement {

    constructor () {
        super();
        
        console.log("MapTracer Created!");
    }

    async connectedCallback () {
        const shadow = this.attachShadow({
            mode: "open"
        });

        // Get Map Style
        const path_StyleMaps = "/src/styles/map.css";
        const styleMaps = document.createElement("style");
        styleMaps.setAttribute("type", "text/css");
        styleMaps.textContent = ` @import url('${path_StyleMaps}'); `;

        // World Maps
        const Box_MapsWorld = document.createElement("div");
        Box_MapsWorld.id = "Box-MapWorld";

        const Obj_MapsWorld = document.createElement("object");
        Obj_MapsWorld.setAttribute("type", "image/svg+xml");
        Obj_MapsWorld.setAttribute("data", "/src/res/maps/world.svg");

        Box_MapsWorld.appendChild(Obj_MapsWorld);

        // Country Maps
        const Box_MapsCountry = document.createElement("div");
        Box_MapsCountry.id = "Box-MapCountry";

        // Traveled List
        const Box_ListTraveled = document.createElement("div");
        Box_ListTraveled.id = "Box-ListTraveled";

        const style = document.createElement("style");
        style.textContent = `
            map-tracer {
                border: 0.15em solid #FF0;
            }

            #Box-MapWorld {
                position: absolute;

                top: 0;

                height: calc(100% - 4em);
                width : 100%;
            }

            object {
                width : 100%;
                height: 100%;
            }

            #Box-ListTraveled {
                height      : 4em;
                width       : 100%;
                background  : red;
                position    : absolute;
                bottom: 0;  
            }
        `;
        shadow.appendChild(style);

        shadow.appendChild(Box_MapsWorld   );
        shadow.appendChild(Box_MapsCountry );
        shadow.appendChild(Box_ListTraveled);

        // Apply maps style
        let svg = await new Promise((resolve) => {
            Obj_MapsWorld.addEventListener("load", () => {
                let svg = Obj_MapsWorld.contentDocument;

                svg.querySelector("defs").appendChild(styleMaps);
                resolve(svg);
            });
        });
        
        let visited = await fetch("/data/visited.json").then(response => {
            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }

            return response.json();
        });

        // Add class to visited places
        Object.keys(visited).forEach(country => {
            svg.querySelector(`#${country}`).classList.add("visited");
        });
    }

    async disconnectedCallback () {}
}

customElements.define("map-tracer", MapTracer);