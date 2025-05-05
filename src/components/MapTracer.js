class MapTracer extends HTMLElement {

    constructor () {
        super();
        
        console.log("MapTracer Created!");
    }

    async connectedCallback () {
        const shadow = this.attachShadow({
            mode: "open"
        });

        // Get Visited List
        let visited = await fetch("/data/visited.json").then(response => {
            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }

            return response.json();
        });
        console.log(visited);

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
        Object.keys(visited).forEach(country => {
            let ListTraveled = document.createElement("span");

            // Add class "visited" for easy handling
            ListTraveled.classList.add("visited", "country");

            // Set id to country code
            ListTraveled.setAttribute("id", country);
            ListTraveled.textContent = country;

            Box_ListTraveled.appendChild(ListTraveled);
        });

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
                height      : 2em;
                width       : 100%;
                background  : red;
                position    : absolute;
                bottom      : 0;
            }

            #Box-ListTraveled span {
                background: green;
                font-size : 1.5em;
                cursor    : pointer;
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

        // Add class to visited places
        Object.keys(visited).forEach(country => {
            svg.querySelector(`#${country}`).classList.add("visited", "country");
        });

        // SVG Click Events
        svg.addEventListener("click", (event) => {
            
            // Only response with visited area
            if (!event.target.classList.contains("visited")) {
                return;
            }

            let areaCode = event.target.id;
            this.mapsClick.country(areaCode);
        });

        // Traveled List Click Events
        Box_ListTraveled.addEventListener("click", (event) => {
            
            // Prevent responses outside the list
            if (!event.target.classList.contains("visited")) {
                return;
            }

            let areaCode = event.target.id;
            this.mapsClick.country(areaCode);
        });
    }

    async disconnectedCallback () {}

    mapsClick = {
        country: async (
            countryCode
        ) => {
            // todo
            // action after maps click
            console.log(`Country Click ${countryCode}`);
        }
    }
}

customElements.define("map-tracer", MapTracer);