export const MapTracer_World = {

    init: (
        resDir
    ) => {

        const MapTracer_World = document.createElement("object");
        MapTracer_World.setAttribute("data", `${resDir}/world.svg`);

        const MapTracer_World_Style = document.createElement("style");
        MapTracer_World_Style.textContent = `
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

        MapTracer_World.appendChild(MapTracer_World_Style);

        return MapTracer_World;
    }
}