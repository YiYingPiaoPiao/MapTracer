export class MapTracerComponentsWorld {

    #MapTracerObjWorld = null;

    constructor (
        MapPath
    ) {

        const obj = document.createElement("object");
        obj.setAttribute("data", `${MapPath}/world.svg`);

        const style = document.createElement("style");
        style.textContent = `
            object {
                position  : absolute;
                left      : 0;
                right     : 0;
                top       : 0;
                bottom    : 0;
                margin    : auto;
                max-height: 100%;
                max-width : 100%;
            }
        `;

        obj.appendChild(style);
        this.#MapTracerObjWorld = obj;
    }

    getMapTracer () {
        return this.#MapTracerObjWorld;
    }
}