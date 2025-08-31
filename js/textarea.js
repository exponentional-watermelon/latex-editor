"use strict";


function processText(content) { 
    content = escapeTags(content);
    content = markdownToBold(content);
    content = markdownToItalic(content);

    content = content.split("\n");

    let newContent = "";
    for (let line of content) {
        const cntBOpen = countOccurrences(line, "<b>");
        const cntBClose = countOccurrences(line, "</b>");
        const cntIOpen = countOccurrences(line, "<i>");
        const cntIClose = countOccurrences(line, "</i>");

        if (cntBOpen > cntBClose) {
            line = line + "</b>";
        }
        if (cntBOpen < cntBClose) {
            line = "<b>" + line;
        }
        if (cntIOpen > cntIClose) {
            line = line + "</i>";
        }
        if (cntIOpen < cntIClose) {
            line = "<i>" + line;
        }

        line = "<p>" + line + "</p>";
        newContent += line;
    }

    return newContent;
}


function countOccurrences(string, substring) {
    return string.split(substring).length - 1;
}


function escapeTags(content) {
    content = content.replace(/</g, "&lt;");
    content = content.replace(/>/g, "&gt;");
    content = content.replace(/&/g, "&amp;");

    return content
}


function markdownToBold(content) {
    const boldRegex = /\*\*([\s\S]*?)\*\*/g;
    const replacedText = content.replace(boldRegex, "<b>$1</b>");

    return replacedText;
}


function markdownToItalic(content) {
    const italicRegex = /__([\s\S]*?)__/g;
    const replacedText = content.replace(italicRegex, "<i>$1</i>");

    return replacedText;
}