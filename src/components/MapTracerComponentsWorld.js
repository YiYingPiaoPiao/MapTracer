/**
 *  Create an element for World map.
 */
export class MapTracerComponentsWorld {

    #MapTracerObjWorld = null;

    /**
     * 
     * @param MapPath The path of world map.svg
     */
    constructor (
        MapPath
    ) {
        const obj = document.createElement("object");
        obj.setAttribute(
            "data", 
            MapPath
        );
        this.#MapTracerObjWorld = obj;
    }

    getMapTracer () {
        return this.#MapTracerObjWorld;
    }

    setVisited (
        Visited
    ) {
        let svgWorld = this.#MapTracerObjWorld.contentDocument;
        console.log(svgWorld)
        Visited.forEach(country => {

            svgWorld.querySelector(`#${country}`).classList.add("visited");
        });
    }
}