import { TweenMax, Expo, Power3 } from '../node_modules/gsap/all.js'

function main() {
    let canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl");
    if(!gl) return;

    const m4 = twgl.m4;

    const programInfo = twgl.createProgramInfo(gl, [
        document.getElementById("2d-vertex-shader").text,
        document.getElementById("2d-fragment-shader").text
    ]);
    const bufferInfo = twgl.primitives.createPlaneBufferInfo(gl, 1, 1, 30, 30);

    const texture = twgl.createTexture(gl, {
        src: "../img/Long Cutout.png",
    });

    let values = {
        time: 0,
        power: 0,
        progress: 0,
        mousePos: [0, 0],
        mouseX: 0,
        mouseY: 0,
    }

    let isAnimating = false;

    function render() {
        twgl.resizeCanvasToDisplaySize(gl.canvas);

        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        let matrix = m4.identity();

        const texAspect = texture.width / texture.height;
        const imgAspect = gl.canvas.width / gl.canvas.height;

        // Initialize
        let scaleX = 0;
        let scaleY = 0;
        
        if (imgAspect < texAspect) {
            scaleY = 1;
            scaleX = imgAspect / texAspect;
        } else if (imgAspect > texAspect) {
            scaleY = texAspect / imgAspect;
            scaleX = 1;
        }

        m4.scale(matrix, [scaleX, scaleY, 1], matrix)

        values.time++;

        m4.ortho(0, gl.canvas.width, gl.canvas.height, 0, -1, 1, matrix)
        m4.translate(matrix, [gl.canvas.width / 2, gl.canvas.height / 2, 1], matrix)
        m4.scale(matrix, [gl.canvas.width / 2, gl.canvas.height, 1], matrix)

        gl.useProgram(programInfo.program);

        twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);

        twgl.setUniforms(programInfo, {
            uMatrix: matrix,
            uTex: texture,
            uTime: values.time,
            uMousePos: [values.mouseX, values.mouseY],
            uPower: values.power,
            uProgress: values.progress,
            uRes: [gl.canvas.width, gl.canvas.height],
        })

        twgl.drawBufferInfo(gl, bufferInfo);
    }

    function listeners() {
        // window.addEventListener('mousemove', onHover);
        window.addEventListener('click', onClick);
    }

    let onHover = (e) => {
        if(isAnimating) return;
        isAnimating = true;
        const halfWidth = gl.canvas.width / 2;
        const halfHeight = gl.canvas.height / 2;
        let newX = e.clientX - halfWidth;
        let newY = halfHeight - e.clientY;

        TweenMax.set(values, {mouseX: newX, mouseY: newY, ease: Power3.easeInOut,  onComplete: () => {
            isAnimating = false;
        }})
    }

    let onClick = (e) => {
        if(isAnimating) return;
        isAnimating = true;
        TweenMax.to(values, 5.0, {progress: 25.0, ease: Power4.easeInOut, onComplete: () => {
            TweenMax.to(values, 5.0, {progress: 0.0, ease: Power4.easeInOut});
            isAnimating = false;
        }})
    }

    function init() {
        listeners();

        TweenMax.ticker.addEventListener('tick', render);
    }

    init();
}

main();