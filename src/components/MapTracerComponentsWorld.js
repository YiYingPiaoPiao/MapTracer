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
}