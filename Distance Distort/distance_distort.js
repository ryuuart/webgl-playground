import { TweenMax, Expo, Power3, Power2 } from '../node_modules/gsap/all.js'

function main() {
    let canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl");
    if(!gl) return;

    const m4 = twgl.m4;

    const programInfo = twgl.createProgramInfo(gl, [
        document.getElementById("2d-vertex-shader").text,
        document.getElementById("2d-fragment-shader").text
    ]);
    const bufferInfo1 = twgl.primitives.createPlaneBufferInfo(gl, 1, 1, 30, 30);
    // const bufferInfo12 = twgl.primitives.createPlanebufferInfo1(gl, 1, 1, 30, 30);

    const texture = twgl.createTexture(gl, {
        src: "../img/Long Cutout.png",
    });

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    let values = {
        time: 0,
        power: 0,
        progress: 0,
        mousePos: [0, 0],
        mouseX: 0,
        mouseY: 0,
    }

    let mouseData = {
        start: [0, 0],
        end: [0, 0],
    }

    let isAnimating = false;
    let newX = 0, newY = 0;

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
        if (values.progress > 0) {
            values.progress -= 0.02;
        }

        m4.ortho(0, gl.canvas.width, gl.canvas.height, 0, -1, 1, matrix)
        m4.translate(matrix, [gl.canvas.width / 2, gl.canvas.height / 2, 1], matrix)
        m4.scale(matrix, [gl.canvas.width * 1.2, gl.canvas.height, 1], matrix)

        gl.useProgram(programInfo.program);

        twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo1);

        twgl.setUniforms(programInfo, {
            uMatrix: matrix,
            uTex: texture,
            uTime: values.time,
            uMousePos: [values.mouseX, values.mouseY],
            uPower: values.power,
            uProgress: values.progress,
            uRes: [gl.canvas.width, gl.canvas.height],
        })

        twgl.drawBufferInfo(gl, bufferInfo1);
        
        // m4.translate(matrix, [0.5, 0, 0], matrix);

        // twgl.setUniforms(programInfo, {
        //     uMatrix: matrix,
        //     uTex: texture,
        //     uTime: values.time,
        //     uMousePos: [values.mouseX, values.mouseY],
        //     uPower: values.power,
        //     uProgress: values.progress,
        //     uRes: [gl.canvas.width, gl.canvas.height],
        // })

        // twgl.drawBufferInfo(gl, bufferInfo1);

        const ease = `0.112`;

        mouseData.end = [lerp(mouseData.start[0],  mouseData.end[0], ease),
                         lerp(mouseData.start[1],  mouseData.end[1], ease)];

        mouseData.end = [Math.floor(mouseData.end[0] * 100) / 100, 
                         Math.floor(mouseData.end[1] * 100) / 100];

        TweenMax.to(values, 0.1, {mouseX: mouseData.end[0], mouseY: mouseData.end[1], ease: Power4.easeInOut})
    }

    function listeners() {
        window.addEventListener('mousemove', onHover);
        window.addEventListener('click', onClick);
    }

    let onHover = (e) => {
        // if(isAnimating) return;
        // isAnimating = true;
        const halfWidth = gl.canvas.width / 2;
        const halfHeight = gl.canvas.height / 2;
        newX = e.clientX - halfWidth;
        newY = halfHeight - e.clientY;

        mouseData.start = [newX, newY];
        if (values.progress != 0.97) {
            TweenMax.to(values, 0.1, {progress: 1, ease: Power2.easeInOut});
        }
    }

    let onClick = (e) => {
        if(isAnimating) return;
        isAnimating = true;
        TweenMax.to(values, 0.15, {progress: 1.0, ease: Power4.easeInOut, onComplete: () => {
            // TweenMax.to(values, 1.0, {progress: 0.0, ease: Power4.easeInOut});
            // isAnimating = false;
        }})
    }
    
    function init() {
        values.progress = 0.0;
        listeners();
        
        TweenMax.ticker.addEventListener('tick', render);
    }

    init();
}

main();

function lerp(a, b, n) {
    return (1 - n) * a + n * b;
}