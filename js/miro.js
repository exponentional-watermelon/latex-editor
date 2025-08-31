"use strict";


const {board} = window.miro;


async function init() {
    board.ui.on("icon:click", async () => {
        await board.ui.openPanel({
            url: "/"
        });
    });
}


async function addImage(url) {
    const viewport = await board.viewport.get();

    const centerX = viewport.x + viewport.width / 2;
    const centerY = viewport.y + viewport.height / 2;

    await board.createImage({
        title: "LaTeX Text",
        url: url,
        x: centerX,
        y: centerY
    });
}


init();