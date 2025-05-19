class ComponentsStatus {
    static INIT     = "Init"    ;
    static WORLD    = "World"   ;
    static COUNTRY  = "Country" ;
}

class MapTracer extends HTMLElement {

    #visitedData = {};
    #componentsStatus = ComponentsStatus.INIT;

    constructor () {
        super();
        
        console.log("MapTracer Created!");
        console.log(this.#componentsStatus);
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
        this.#visitedData = visited;

        // Get Map Style
        const path_StyleMaps = "/src/styles/map.css";
        const styleMaps = document.createElement("style");
        styleMaps.setAttribute("type", "text/css");
        styleMaps.textContent = ` @import url('${path_StyleMaps}'); `;

        // Components - World Maps
        const Box_MapsWorld = document.createElement("div");
        Box_MapsWorld.id = "Box-MapWorld";
        Box_MapsWorld.classList.add("MapTracer-Maps");

        const Obj_MapsWorld = document.createElement("object");
        Obj_MapsWorld.setAttribute("type", "image/svg+xml");
        Obj_MapsWorld.setAttribute("data", "/src/res/maps/world.svg");

        Box_MapsWorld.appendChild(Obj_MapsWorld);

        // Components - Country Maps
        const Box_MapsCountry = document.createElement("div");
        Box_MapsCountry.id = "Box-MapCountry";
        Box_MapsCountry.classList.add("MapTracer-Maps", "MapTracer-Maps-NoAnimation");

        // Components - Traveled List
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

        // Components - Back button
        const Btn_Back = document.createElement("p");
        Btn_Back.id = "Btn-Back";
        Btn_Back.textContent = "Back";

        // Settings Country Maps position
        document.documentElement.style.setProperty("--country-W", "0px");
        document.documentElement.style.setProperty("--country-H", "0px");
        document.documentElement.style.setProperty("--country-H", "0");
        document.documentElement.style.setProperty("--country-H", "0");

        // Set style
        const style = document.createElement("style");
        style.textContent = `
            map-tracer {
                border: 0.15em solid #FF0;
            }

            #Btn-Back {
                position: absolute;

                border          : 0.15em solid #CCC;
                border-radius   : 1em;
                padding         : 0.25em 1em;

                top : 1em;
                left: 1em;

                margin: auto;

                cursor: pointer;

                transition: all 0.5s;
            }

            #Box-MapWorld {
                position: absolute;

                top: 0;

                height: calc(100% - 4em);
                width : 100%;
            }

            #Box-MapCountry {
                position: absolute;

                width : var(--country-W);
                height: var(--country-H);
                left  : var(--country-L);
                top   : var(--country-T);
            }

            .MapTracer-Maps {
                transition: all 0.5s;
                opacity: 1;
            }
            div.MapTracer-Maps-NoAnimation {
                transition: none;
            }
            div.MapTracer-Maps-Hide {
                opacity: 0;
            }

            object {
                width : 100%;
                height: 100%;

                will-change: transform;
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
        shadow.appendChild(Btn_Back        );
        // shadow.appendChild(Box_ListTraveled);

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

        // Init done, change components status the World
        this.#componentsStatus = ComponentsStatus.WORLD;

        // SVG Click Events
        svg.addEventListener("click", (event) => {
            
            // Only response with visited area
            if (!event.target.classList.contains("visited")) {
                return;
            }

            // let areaCode = event.target.id;
            this.mapsClick.country(event.target);
        });

        // Traveled List Click Events
        Box_ListTraveled.addEventListener("click", (event) => {
            
            // Prevent responses outside the list
            if (!event.target.classList.contains("visited")) {
                return;
            }

            // let areaCode = event.target.id;
            this.mapsClick.country(event.target);
        });

        Btn_Back.addEventListener("click", (event) => {
            this.backBtn_Click(event);
        });
    }

    async disconnectedCallback () {}

    // Back button click function
    backBtn_Click (
        event
    ) {
        this.backClick[this.#componentsStatus]();
    }
    backClick = {
        World: async () => {
            // console.log("Test");
        }
    }
    // end of back button function

    mapsClick = {
        country: async (
            targetCountry
        ) => {

            // Display Province Maps
            let countryId = targetCountry.id;
            let Box_MapsCountry = this.shadowRoot.querySelector("#Box-MapCountry");

            let tempObj = Box_MapsCountry.querySelector("object");
            if (tempObj !== null) {
                Box_MapsCountry.removeChild(tempObj);
            }

            let provinceVisited = this.#visitedData[countryId];

            const countryObj = document.createElement("object");
            countryObj.setAttribute("type", "image/svg+xml");
            countryObj.setAttribute("data", `/src/res/maps/world/${countryId}.svg`);

            // Settings Country Position and Size
            // Select target country maps in world maps
            let MapsWorld = this.shadowRoot.querySelector("#Box-MapWorld");
            let targetMaps = MapsWorld.querySelector("object").contentDocument.querySelector(`#${countryId}`);

            // Get Size and Position
            const baseRect = MapsWorld.getBoundingClientRect();
            const targetRect = targetMaps.getBoundingClientRect();

            // Setting size and position
            document.documentElement.style.setProperty("--country-H", `${targetRect.height}px`);
            document.documentElement.style.setProperty("--country-W", `${targetRect.width}px`);
            document.documentElement.style.setProperty("--country-L", `${targetRect.left}px`);
            document.documentElement.style.setProperty("--country-T", `${targetRect.top}px`);

            Box_MapsCountry.appendChild(countryObj);
            MapsWorld.classList.add("MapTracer-Maps-Hide");

            // Get Visited Data
            console.log(provinceVisited);
            let svg = await new Promise((resolve) => {
                countryObj.addEventListener("load", () => {
                    let svg = countryObj.contentDocument;

                    const path_StyleMaps = "/src/styles/map.css";
                    const styleMaps = document.createElement("style");
                    styleMaps.setAttribute("type", "text/css");
                    styleMaps.textContent = ` @import url('${path_StyleMaps}'); `;

                    svg.querySelector("defs").appendChild(styleMaps);
                    resolve(svg);
                });
            });

            Object.keys(this.#visitedData[countryId]).forEach(province => {
                svg.querySelector(`#${province}`).classList.add("visited", "province");
            });
            
            // Sacale the Maps
            await new Promise(resolve => setTimeout(resolve, 500));
            Box_MapsCountry.classList.remove("MapTracer-Maps-NoAnimation");
            document.documentElement.style.setProperty("--country-H", `calc(100% - 4em)`);
            document.documentElement.style.setProperty("--country-W", `100%`);
            document.documentElement.style.setProperty("--country-L", `0px`);
            document.documentElement.style.setProperty("--country-T", `0px`);
        }
    }
}

customElements.define("map-tracer", MapTracer);