class mytag extends HTMLElement {

    constructor () {
        super();
    }

    connectedCallback () {
        const shadow = this.attachShadow({ mode: "open" });
        
        const wrapper = document.createElement("div");

        const img = document.createElement("img");
        img.src = "https://seechen.github.io/File/Image/MyTimeline/20231202-01.avif";

        const style = document.createElement("style");
        console.log(style.isConnected);

        const myattr = this.getAttribute("myattr");
        alert(myattr);

        style.textContent = `
            div {
                position: fixed;

                left: 0;
                right: 0;
                top: 0;
                bottom: 0;

                margin: auto;

                width: 80vw;
                height: 80dvh;
                background: #1aa260;
            }

            img {
                position: absolute;

                display: block;

                left: 0;
                right: 0;
                top: 0;
                bottom: 0;

                margin: auto;

                max-width: 80vw;
                max-height: 80dvh;
            }
        `;

        shadow.appendChild(style);
        shadow.appendChild(wrapper);
        wrapper.appendChild(img);
    }
}

customElements.define("my-tag", mytag);