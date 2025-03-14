
export class MapTracerComponentsWorld {

    #MapTracerObjWorld = null;
    
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