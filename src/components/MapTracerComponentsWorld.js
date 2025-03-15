/**
 *  # MapTracer Components for World
 *  ---
 * 
 */
export class MapTracerWorld {

    #MapTracerObj = null;

    constructor (
        MapPath = ""
    ) {
        if (MapPath !== "") {
            this.init(MapPath);
        }
    }
    
    /**
     * Initializes the world map component.
     *
     * @param   {string} MapPath - The file path to the world map (SVG).
     * @returns {MapTracerWorld} The initialized MapTracerWorld instance.
     */
    init (
        MapPath
    ) {
        if (
            typeof MapPath !== "string" ||
            !MapPath.trim()             ||
            MapPath === "undefined"
        ) {
            throw new Error (
                `The parameter "MapPath" is required and cannot be empty or "undefined". Ensure you are passing a valid map path.`
            );
        }

        // Create an object elements, and set data using svg.
        this.#MapTracerObj = document.createElement("object");
        this.#MapTracerObj.setAttribute("type", "image/svg+xml");
        this.#MapTracerObj.setAttribute("data", MapPath);
    }

    /**
     *  @return {HTMLElement.object}
     */
    get object() {
        return this.#MapTracerObj;
    }

    // setVisited (
    //     Visited
    // ) {
    //     let svgWorld = this.#MapTracerObjWorld.contentDocument;
    //     console.log(svgWorld)
    //     Visited.forEach(country => {

    //         svgWorld.querySelector(`#${country}`).classList.add("visited");
    //     });
    // }
}