import { MapTracer_World } from "./MapWorld.js";

class MapTracer extends HTMLElement {

    constructor () {
        super();
    }

    connectedCallback () {

        const shadow = this.attachShadow({
            mode: "open"
        });

        const MapBox_World = document.createElement("div");
        MapBox_World.setAttribute("id", "MapTracer-MapBox-World");
        MapBox_World.appendChild(MapTracer_World.init());

        const MapBox_Country = document.createElement("div");
        MapBox_Country.setAttribute("id", "MapTracer-MapBox-Country");

        shadow.appendChild(MapBox);
    }
}

customElements.define("map-tracer", MapTracer);