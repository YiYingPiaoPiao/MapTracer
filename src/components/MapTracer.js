class MapTracer extends HTMLElement {

    constructor () {
        super();
        
        console.log("MapTracer Created!");
    }

    async connectedCallback () {
        const shadow = this.attachShadow({
            mode: "open"
        });

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
                height: 100%;
                width : 100%;
            }

            object {
                width : 100%;
                height: 100%;
            }
        `;
        shadow.appendChild(style);

        shadow.appendChild(Box_MapsWorld   );
        shadow.appendChild(Box_MapsCountry );
        shadow.appendChild(Box_ListTraveled);
    }

    async disconnectedCallback () {}
}

customElements.define("map-tracer", MapTracer);