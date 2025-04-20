export class MapTracerMap {

    #svgMap;
    
    constructor () {}

    get objectMap () {
        return this.#svgMap;
    }

    async init (
        path
    ) {
        console.log(path);
        if (
            typeof path !== "string"    ||
            path === "undefined"        ||
            !path
        ) {
            throw new Error("Can't read path!");
        }

        this.#svgMap = document.createElement("object");
        this.#svgMap.setAttribute("type", "image/svg+xml");
        this.#svgMap.setAttribute("data", path);
    }
}