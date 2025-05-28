class ComponentsStatus {
    static INIT     = "Init"    ;
    static WORLD    = "World"   ;
    static COUNTRY  = "Country" ;
    static PROVINCE = "Province";
}

class MapTracer extends HTMLElement {

    #visitedData = {};
    #componentsStatus = ComponentsStatus.INIT;

    #mapsPrev = {
        world: {
            width : 0,
            height: 0,
            left  : 0,
            top   : 0
        }
    };

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

        // Components - Pictures
        const Box_Photos = document.createElement("div");
        Box_Photos.id = "Box-Photos";

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

                opacity: 0;
                pointer-events: none;

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

            #Box-Photos {
                position: absolute;

                width   : 100%;
                height  : 100%;

                top : 0;
                left: 0;

                pointer-events: none;
            }
        `;
        shadow.appendChild(style);

        shadow.appendChild(Box_MapsWorld   );
        shadow.appendChild(Box_MapsCountry );
        shadow.appendChild(Btn_Back        );
        shadow.appendChild(Box_Photos      );
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
        Init: async () => {
            console.log("Current Stage: Init");
        },

        World: async () => {
            console.log("Current Stage: World.");
        },

        Country: async () => {
            console.log("Current Stage: Country.");

            // Change back button to hide status
            const Btn_Back = this.shadowRoot.querySelector("#Btn-Back");
            Btn_Back.style.opacity = 0;
            Btn_Back.style.pointerEvents = "none";

            // Setting size and position
            document.documentElement.style.setProperty("--country-H", `${this.#mapsPrev.world.height}px`);
            document.documentElement.style.setProperty("--country-W", `${this.#mapsPrev.world.width }px`);
            document.documentElement.style.setProperty("--country-L", `${this.#mapsPrev.world.left  }px`);
            document.documentElement.style.setProperty("--country-T", `${this.#mapsPrev.world.top   }px`);

            await new Promise(resolve => setTimeout(resolve, 500));

            let MapsWorld = this.shadowRoot.querySelector("#Box-MapWorld");
            MapsWorld.classList.remove("MapTracer-Maps-Hide");

            await new Promise(resolve => setTimeout(resolve, 250));
            let Box_MapsCountry = this.shadowRoot.querySelector("#Box-MapCountry");
            // Box_MapsCountry.classList.add("MapTracer-Maps-Hide");
            Box_MapsCountry.removeChild(Box_MapsCountry.querySelector("object"));

            document.documentElement.style.setProperty("--country-H", ``);
            document.documentElement.style.setProperty("--country-W", ``);
            document.documentElement.style.setProperty("--country-L", ``);
            document.documentElement.style.setProperty("--country-T", ``);

            // Change current stage.
            this.#componentsStatus = ComponentsStatus.WORLD;
        },

        Province: async () => {
            console.log("Current Stage: Province.");
            
            // Change current stage.
            this.#componentsStatus = ComponentsStatus.COUNTRY;
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

            // Storing original data
            this.#mapsPrev.world.height = targetRect.height;
            this.#mapsPrev.world.width  = targetRect.width ;
            this.#mapsPrev.world.top    = targetRect.top   ;
            this.#mapsPrev.world.left   = targetRect.left  ;

            // Setting size and position
            document.documentElement.style.setProperty("--country-H", `${this.#mapsPrev.world.height}px`);
            document.documentElement.style.setProperty("--country-W", `${this.#mapsPrev.world.width }px`);
            document.documentElement.style.setProperty("--country-L", `${this.#mapsPrev.world.left  }px`);
            document.documentElement.style.setProperty("--country-T", `${this.#mapsPrev.world.top   }px`);

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

            // Change current stage.
            this.#componentsStatus = ComponentsStatus.COUNTRY;

            // Show back button when loaded.
            const Btn_Back = this.shadowRoot.querySelector("#Btn-Back");
            Btn_Back.style.opacity = 1;
            Btn_Back.style.pointerEvents = "auto";

            // Set click events for Province maps
            svg.addEventListener("click", (event) => {
                // Only response with visited area
                if (!event.target.classList.contains("visited")) {
                    return;
                }

                this.#componentsStatus = ComponentsStatus.PROVINCE;
                this.mapsClick.province(countryId, event.target);
            });
        },

        province: async (
            parentCountry,
            targetProvince
        ) => {
            
            let provinceId = targetProvince.id;

            console.log(`Country: ${parentCountry}, Province: ${provinceId}`);
            console.log(this.#visitedData[parentCountry][provinceId]);
        }
    }
}

customElements.define("map-tracer", MapTracer);