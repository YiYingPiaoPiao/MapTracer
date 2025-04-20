import { MapTracerMap } from "./MapTracerMap.js";

export class MapTracerWorld extends MapTracerMap {
    
    constructor () {
        super();
    }
}

// export class MapTracerWorld {

//     #MapTracerObj = null;

//     constructor (
//         MapPath = ""
//     ) {
//         if (MapPath !== "") {
//             this.init(MapPath);
//         }
//     }


//     /**
//      * 
//      * @param {string       } pathStyle 
//      * @param {Array<string>} listVisited 
//      */
//     async loaded (
//         pathStyle,
//         listVisited
//     ) {
//         return new Promise((resolve) => {
//             this.#MapTracerObj.addEventListener("load", () => {
//                 let svg = this.#MapTracerObj.contentDocument;

//                 this.#load.mapStyle(
//                     svg,
//                     pathStyle
//                 );
    
//                 this.#load.visited(
//                     svg,
//                     listVisited
//                 );

//                 resolve(svg);
//             });
//         });
//     }

//     /**
//      *  @return {HTMLElement.object}
//      */
//     get object() {
//         return this.#MapTracerObj;
//     }

//     /**
//      * Procress data
//      */
//     get #load () {
//         return {

//             /**
//              *  Load Map Style
//              */
//             mapStyle: (
//                 svg,
//                 pathStyle
//             ) => {
//                 const style = document.createElement("style");
//                 style.setAttribute("type", "text/css");
//                 style.textContent = ` @import url('${pathStyle}'); `;
//                 svg.querySelector("defs").appendChild(
//                     style
//                 );
//             },

//             /**
//              *  Set visited country to diffrent view
//              *  @param {Array} visited The list of visited.
//              */
//             visited: (
//                 svg,
//                 visited
//             ) => {
//                 visited.forEach((country) => {
//                     svg.querySelector(`#${country}`).classList.add("visited");
//                 });
//             }
//         }
//     }

//     /**
//      *  Settings events listener
//      */
//     get MapEvents() {
//         return {

//             /**
//              * Click events
//              * 
//              * @param {Event} e Events
//              */
//             MapClick: (
//                 e,
//                 callback
//             ) => {

//                 // If not a visited place, pass.
//                 if (!e.target.classList.contains("visited")) {
//                     return;
//                 }

//                 callback(e.target);
//             }
//         }
//     }
// }
