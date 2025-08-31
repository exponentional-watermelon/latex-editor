"use strict";


const textarea = document.querySelector("#textarea");
const calculatingWrapper = document.querySelector(".calculating-wrapper");


const fontFamilySelect = document.querySelector("#font-family-select");


const fontSizeGroup = document.querySelector(".font-size-group");
const fontSizeInput = document.querySelector(".font-size-group input");
const fontSizeStatusLabel = document.querySelector(".font-size-group .status-text");


const lineHeightGroup = document.querySelector(".line-height-group");
const lineHeightInput = document.querySelector(".line-height-group input");
const lineHeightStatusLabel = document.querySelector(".line-height-group .status-text");


const resultWidthGroup = document.querySelector(".result-width-group");
const resultWidthInput = document.querySelector(".result-width-group input");
const resultWidthStatusLabel = document.querySelector(".result-width-group .status-text");


const resultWrapper = document.querySelector(".result-wrapper");
const loadButton = document.querySelector(".load-button");


let renderedImg;


const params = {
    content: "",
    parent: calculatingWrapper,
    width: 1600,
    font: {
        fontSize: 41,
        fontFamily: "Open Sans"
    },
    lineHeight: 58
}


fontFamilySelect.addEventListener("input", () => {
    params.font.fontFamily = fontFamilySelect.value;
});


fontSizeInput.addEventListener("input", () => {
    const value = Number(fontSizeInput.value);
    if (isNaN(value)) {
        fontSizeGroup.classList.add("error");
        fontSizeStatusLabel.textContent = "Not a number.";
    } else if ((value > 100) || (value < 0)) {
        fontSizeGroup.classList.add("error");
        fontSizeStatusLabel.textContent = "Must be between 0 and 100.";
    } else {
        fontSizeGroup.classList.remove("error");
        fontSizeStatusLabel.textContent = "";
        params.font.fontSize = value;
    }
});


lineHeightInput.addEventListener("input", () => {
    const value = Number(lineHeightInput.value);
    if (isNaN(value)) {
        lineHeightGroup.classList.add("error");
        lineHeightStatusLabel.textContent = "Not a number.";
    } else if ((value > 200) || (value < 0)) {
        lineHeightGroup.classList.add("error");
        lineHeightStatusLabel.textContent = "Must be between 0 and 200.";
    } else {
        lineHeightGroup.classList.remove("error");
        lineHeightStatusLabel.textContent = "";
        params.lineHeight = value;
    }
});


resultWidthInput.addEventListener("input", () => {
    const value = Number(resultWidthInput.value);
    if (isNaN(value)) {
        resultWidthGroup.classList.add("error");
        resultWidthStatusLabel.textContent = "Not a number.";
    } else if ((value > 9999) || (value < 0)) {
        resultWidthGroup.classList.add("error");
        resultWidthStatusLabel.textContent = "Must be between 0 and 9999.";
    } else {
        resultWidthGroup.classList.remove("error");
        resultWidthStatusLabel.textContent = "";
        params.width = value;
    }
});


textarea.addEventListener("input", async () => {
    const content = processText(textarea.value);
    params.content = content;
    renderedImg = await createPng(params);
    addResult();
});


function addResult() {
    const img = document.createElement("img");
    img.src = renderedImg;
    img.alt = "Rendered Image";
    while (resultWrapper.firstChild) {
        resultWrapper.removeChild(resultWrapper.firstChild);
    }
    resultWrapper.appendChild(img);
}


loadButton.addEventListener("click", async () => {
    await addImage(res);
});
