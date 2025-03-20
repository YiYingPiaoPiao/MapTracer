/**
 *  # MapTracer Components for Country
 *  ---
 * 
 */
export class MapTracerCountry {

    constructor () {}

    async init (
        MapPath,
        el
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

        return await fetch(MapPath)
                .then(response => response.text())
                .then(svgText => {
                    const parser = new DOMParser();
                    const svgDoc = parser.parseFromString(svgText, "image/svg+xml");

                    const svgElement = svgDoc.documentElement;
                    const svgGroup = svgElement.querySelector("g");

                    svgGroup.classList.add("map-country");
                
                    const bbox = el.getBBox();
                    const bboxX = bbox.x;
                    const bboxY = bbox.y;
                    const bboxW = bbox.width;
                    const bboxH = bbox.height;

                    const viewBox = svgElement.getAttribute("viewBox").split(" ").map(Number);
                    const vW = viewBox[2];
                    const vH = viewBox[3];

                    let scaleX = bboxW / vW;
                    let scaleY = bboxH / vH;

                    // svgGroup.setAttribute("style", `transform: translate(${bboxX}, ${bboxY}) scale(${scaleX}, ${scaleY});`);
                    // svgGroup.setAttribute("transform", `translate(${bboxX}, ${bboxY}) scale(${scaleX}, ${scaleY})`);

                    const animateTranslate = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
                    animateTranslate.setAttribute("attributeName", "transform");
                    animateTranslate.setAttribute("type", "translate");
                    animateTranslate.setAttribute("from", `${bboxX} ${bboxY}`);
                    animateTranslate.setAttribute("to", "0 0");
                    animateTranslate.setAttribute("dur", "0.5s");
                    animateTranslate.setAttribute("fill", "freeze");
                    animateTranslate.setAttribute("additive", "sum");

                    const animateScale = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
                    animateScale.setAttribute("attributeName", "transform");
                    animateScale.setAttribute("type", "scale");
                    animateScale.setAttribute("from", `${scaleX} ${scaleY}`);
                    animateScale.setAttribute("to", "1 1");
                    animateScale.setAttribute("dur", "0.5s");
                    animateScale.setAttribute("fill", "freeze");
                    animateScale.setAttribute("additive", "sum");

                    svgGroup.appendChild(animateTranslate);
                    svgGroup.appendChild(animateScale);
                    return {
                        svgGroup: svgGroup,
                        viewBox : viewBox
                    };
                })
                .catch(err => console.log(`Error: ${err}`));
    }
}
