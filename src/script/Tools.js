/**
 *  ## Tools of MapTracer
 * ---
 */
export class MapTracerTools {
    
    constructor () {

    }

    /**
     * ## Get Json
     * ---
     * 
     * 
     * 
     * @param   {string} url The json url path.
     * @return  {json}  
     */
    async getJson (
        url
    ) {
        if (window.fetch) {
            return fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP Error! Status: ${response.status}`);
                    }
                    return response.json();
                });
        } else {
            return new Promise(function(resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, true);
    
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                var data = JSON.parse(xhr.responseText);
                                resolve(data);
                            } catch (e) {
                                reject(e);
                            }
                        } else {
                            reject(new Error(`HTTP Error! Status: ${xhr.status}`));
                        }
                    }
                };
    
                xhr.send();
            });
        }
    }
}