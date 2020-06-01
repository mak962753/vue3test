
let clientX = -100;
let clientY = -100;
let clientX1 = -100;
let clientY1 = -100;
let outerBox = {width:30,height:30};
let divCursor1: HTMLElement|null = null;
let divCursor2: HTMLElement|null = null;
function cursorInit() {
    divCursor1 = document.querySelector('.cursor--inner');
    divCursor2 = document.querySelector('.cursor--outer');
    outerBox = divCursor2?.getBoundingClientRect() || outerBox;
}
function cursorMove(e: MouseEvent) {
    clientX = e.clientX;
    clientY = e.clientY;
}
function cursorUpdate() {
    if (!divCursor1 || !divCursor2)
        return;
    clientX1 = lerp(clientX1, clientX - outerBox.width/2, 0.2);
    clientY1 = lerp(clientY1, clientY - outerBox.height/2, 0.2);
    divCursor1.style.transform = `translate(${clientX}px,${clientY}px)`;
    divCursor2.style.transform = `translate(${clientX1}px,${clientY1}px)`;
}
function lerp(s:number,e:number,n:number):number {
    return (1-n) * s + n * e;
}

export {
    cursorInit,
    cursorMove,
    cursorUpdate,
}