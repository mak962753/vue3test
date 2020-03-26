export function initParallax(id: string): {(): void} {
    const elem = document.getElementById(id);
    
    function onMouseMove(e: MouseEvent) {
        const _w = window.innerWidth/2;
        const _h = window.innerHeight/2;
        const _mouseX = e.clientX;
        
        const _mouseY = e.clientY;
        const _depth1 = `50% 50%`;
        const _depth2 = `${(_mouseX - _w) * 0.02}px ${50 - (_mouseY - _h) * 0.02}%`;
        const _depth3 = `${(_mouseX - _w) * 0.04}px ${50 - (_mouseY - _h) * 0.04}%`;
        const _depth4 = `${(_mouseX - _w) * 0.06}px ${50 - (_mouseY - _h) * 0.06}%`;
        const x = [_depth4, _depth3, _depth2, _depth1].join(', ');
        console.log(x);
        if (elem) 
            elem.style.backgroundPosition = x;
    }
    
    document.addEventListener("mousemove", onMouseMove);
    
    return () => {
        document.removeEventListener("mousemove", onMouseMove);
    };
}