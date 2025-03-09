class MapTracer extends HTMLElement {

    constructor () {
        super();
    }

    connectedCallback () {

        const shadow = this.attachShadow({
            mode: "open"
        });

        const MapBox = document.createElement("div");
        MapBox.setAttribute("id", "MapTracer-MapBox");

        shadow.appendChild(MapBox);
    }
}

customElements.define("map-tracer", MapTracer);