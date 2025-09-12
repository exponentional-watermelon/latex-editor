"use strict";


function createSVG(params) {
    const contentWrapper = createContentWrapper(params);

    params.parent.appendChild(contentWrapper);
    MathJax.typesetPromise([contentWrapper]);

    const paragraphs = contentWrapper.children;

    let linesCount = 0;
    for (let paragraph of Array.from(paragraphs)) {
        wrapParagraph(paragraph);
        let lines = wrapLines(paragraph, params);
        contentWrapper.removeChild(paragraph);

        for (let line of lines) {
            contentWrapper.style.width = params.width + "px";

            const lineOuterWrapper = document.createElement("div");
            lineOuterWrapper.style.position = "absolute";
            lineOuterWrapper.style.width = "100%";
            lineOuterWrapper.style.height = params.lineHeight + "px";
            lineOuterWrapper.appendChild(line);

            contentWrapper.appendChild(lineOuterWrapper);
    
            const bias = getBias(line, lineOuterWrapper);
            line.style.transform = "translateY(" + bias + ")";

            linesCount++;
        }
    }

    contentWrapper.style.height = params.lineHeight * linesCount + "px";

    alignLines(contentWrapper, params);

    const img = createImage(params);
    return img;
}


function getBias(element, wrapper) {
    const span = element.querySelector("[data-content-type='text']");
    const math = element.querySelector("[data-content-type='math-wrapper']");
    if (span) {
        const elementBbox = element.getBoundingClientRect();
        const spanBbox = span.getBoundingClientRect();
        const bias = (elementBbox.y - spanBbox.y) + "px";

        return bias;
    } 
    if (math) {
        const wrapperBbox = wrapper.getBoundingClientRect();
        const mathBbox = math.getBoundingClientRect();
        const bias = (wrapperBbox.y - mathBbox.y) + (wrapperBbox.height - mathBbox.height) / 2 + "px";

        return bias;
    }
    return 0;
}


function alignLines(wrapper, params) {
    const lines = wrapper.children;

    for (let i = 0; i < lines.length; i++) {
        lines[i].style.top = i * params.lineHeight + "px";
    }
}


function alignMathElements(wrapper) {
    const mathWrapper = wrapper.querySelectorAll("[data-content-type='math-wrapper']");

    for (let element of mathWrapper) {
        const elementBbox = element.getBoundingClientRect();

        const mjx = element.querySelector("mjx-container");
        const mjxBbox = mjx.getBoundingClientRect();

        mjx.style.display = "inline-block";
        mjx.style.margin = 0;

        const display = mjx.getAttribute("display");

        if (display) {
            element.style.width = "100%";
            mjx.style.width = "100%";
        } else {
            mjx.style.transform = `translateY(${(elementBbox.top - mjxBbox.top)/2}px)`;
        }
    }
}


function wrapLines(paragraph, params) {
    const children = paragraph.children;
    const lines = [];

    let wrapper = document.createElement("div");
    let currentWidth = 0;

    for (let child of children) {
        if (currentWidth + child.offsetWidth <= params.width) {
            currentWidth += child.offsetWidth;
            wrapper.appendChild(child.cloneNode(true));
        } else {
            lines.push(wrapper.cloneNode(true));
            wrapper = document.createElement("div");
            wrapper.setAttribute("class", "line-wrapper");
            currentWidth = child.offsetWidth;
            wrapper.appendChild(child.cloneNode(true));
        }
    }

    if ((currentWidth > 0) || (lines.length == 0)) {
        lines.push(wrapper);
    }

    return lines;
}


function wrapParagraph(paragraph) {
    const nodes = paragraph.childNodes;
    const textTags = ["b", "i", "s"];
    
    let wrappedNode = [];

    for (let node of nodes) {
        if (node.nodeType == Node.TEXT_NODE) {
            wrappedNode = wrappedNode.concat(wrapTextNode(node.textContent));
        } else if (node.nodeType == Node.ELEMENT_NODE) {
            const tagName = getTagName(node);
            if (textTags.indexOf(tagName) != -1) {
                const wrapped = wrapElementNode(node);
                wrappedNode = wrappedNode.concat(setElementAttributes(wrapped));
            } else if (tagName == "mjx-container") {
                const outerWrapper = document.createElement("span");
                outerWrapper.dataset.contentType = "math-wrapper";
                outerWrapper.appendChild(node.cloneNode(true));

                wrappedNode.push(outerWrapper);
            }
        }
    }

    while (paragraph.firstChild) {
        paragraph.removeChild(paragraph.firstChild);
    }

    for (let a of wrappedNode) {
        paragraph.appendChild(a);
    }
}


function wrapTextNode(node, isRoot=true) {
    let nodeElements = node.split(" ");
    let wrapSpans = [];

    for (let element of nodeElements) {
        let interSpans = [];
        if (element != "") {
            interSpans.push(createSpan(element, isRoot));
        } 
        interSpans.push(createSpan("&nbsp;", isRoot));
        wrapSpans = wrapSpans.concat(interSpans);
    }
    wrapSpans.pop();

    return wrapSpans;
}


function setElementAttributes(wrappedNodes) {
    const newWrapped = [];

    for (let node of wrappedNodes) {
        const wrapper = document.createElement("span");
        const nodeTagName = getTagName(node);

        wrapper.dataset.contentType = "text";
        wrapper.dataset.bold = (nodeTagName == "b");
        wrapper.dataset.italic = (nodeTagName == "i");
        wrapper.dataset.strikethrough = (nodeTagName == "s");

        let child = node.firstChild;
        while (child) {
            const tagName = child.nodeType == Node.ELEMENT_NODE ? getTagName(child) : "";
            switch (tagName) {
                case "b":
                    wrapper.dataset.bold = true;
                    break;
                case "i":
                    wrapper.dataset.italic = true;
                    break;
                case "s":
                    wrapper.dataset.strikethrough = true;
                    break;
                case "span":
                    wrapper.dataset.content = child.textContent;
                    break;
            }
            child = child.firstChild;
        }

        wrapper.appendChild(node);
        newWrapped.push(wrapper);
    }

    return newWrapped;
}


function getTagName(element) {
    return element.tagName.toLowerCase();
}


function wrapElementNode(elementNone) {
    const nodes = elementNone.childNodes;
    const tagName = getTagName(elementNone);
    
    let wrappedNodes = [];

    for (let node of nodes) {
        let wrappedElements = [];
        if (node.nodeType == Node.TEXT_NODE) {
            wrappedElements = wrapTextNode(node.textContent, false);
        } else if (node.nodeType == Node.ELEMENT_NODE) {
            wrappedElements = wrapElementNode(node);
        }

        for (let element of wrappedElements) {
            const wrapElement = document.createElement(tagName);
            wrapElement.appendChild(element);
            wrappedNodes.push(wrapElement);
        }
    }

    return wrappedNodes;
}


function createSpan(textContent, isRoot) {
    const span = document.createElement("span");
    span.innerHTML = textContent;

    if (isRoot) {
        span.dataset.contentType = "text";
        span.dataset.bold = false;
        span.dataset.italic = false;
        span.dataset.strikethrough = false;
        span.dataset.content = textContent == "&nbsp;" ? " " : textContent;
    }

    return span;
}


function createContentWrapper(params) {
    const contentWrapper = document.createElement("div");

    contentWrapper.classList.add("content-wrapper");

    contentWrapper.style.fontSize = params.font.fontSize + "px";
    contentWrapper.style.fontFamily = params.font.fontFamily;
    contentWrapper.style.position = "relative";
    contentWrapper.innerHTML = params.content;

    return contentWrapper;
}


function createImage(params) {
    const wrapper = params.parent;
    const wrapperBbox = wrapper.getBoundingClientRect();

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", wrapperBbox.width + "px");
    svg.setAttribute("height", wrapperBbox.height + "px");

    const textParts = wrapper.querySelectorAll("[data-content-type='text']");
    for (let textPart of textParts) {
        const textSvg = createTextSvg(textPart, params)
        svg.appendChild(textSvg);
    }

    const mathParts = wrapper.querySelectorAll("[data-content-type='math-wrapper']");
    for (let mathPart of mathParts) {
        const mathSvg = createMathSvg(mathPart, params)
        svg.appendChild(mathSvg);
    }

    const b64 = svgToBase64(svg);
    return b64;
}


function createTextSvg(textPart, params) {
    const wrapper = params.parent;
    const wrapperBbox = wrapper.getBoundingClientRect();
    const textBbox = textPart.getBoundingClientRect();

    const textSvg = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textSvg.textContent = textPart.dataset.content;
    textSvg.setAttribute("x", (textBbox.x - wrapperBbox.x) + "px");
    textSvg.setAttribute("y", (textBbox.y - wrapperBbox.y + params.font.fontSize) + "px");
    textSvg.setAttribute("font-family", params.font.fontFamily);
    textSvg.setAttribute("font-size", params.font.fontSize);

    if (textPart.dataset.bold == "true") {
        textSvg.setAttribute("font-weight", "bold");
    }
    if (textPart.dataset.italic == "true") {
        textSvg.setAttribute("font-style", "italic");
    }

    return textSvg;
}


function createMathSvg(mathPart, params) {
    const wrapper = params.parent;
    const wrapperBbox = wrapper.getBoundingClientRect();

    const mathSvg = mathPart.querySelector("svg");
    const mathBbox = mathSvg.getBoundingClientRect();

    const mathSvgClone = mathSvg.cloneNode(true);
    mathSvgClone.setAttribute("width", mathBbox.width + "px");
    mathSvgClone.setAttribute("height", mathBbox.height + "px");
    mathSvgClone.setAttribute("x", (mathBbox.x - wrapperBbox.x) + "px");
    mathSvgClone.setAttribute("y", (mathBbox.y - wrapperBbox.y - 0.07 * params.font.fontSize) + "px");

    return mathSvgClone;
}


function svgToBase64(svgElement) {
    const xmlSerializer = new XMLSerializer();
    let svgString = xmlSerializer.serializeToString(svgElement);

    function utf8Encode(str) {
        return new TextEncoder().encode(str, "UTF-8").reduce((acc, byte) => {
            return acc + String.fromCharCode(byte);
        }, "");
    }
    svgString = utf8Encode(svgString);

    return "data:image/svg+xml;base64," + btoa(svgString);
}