import TweenMax from '../node_modules/gsap/TweenMax.js'

function main() {
    // Get A WebGL context
    var canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl");
    if (!gl) return;
    
    // Create matrix "typedef"
    const m4 = twgl.m4;
    
    // Setup GLSL Program
    const programInfo = twgl.createProgramInfo(gl, [document.getElementById("2d-vertex-shader").text, document.getElementById("2d-fragment-shader").text]);
    const bufferInfo = twgl.primitives.createPlaneBufferInfo(gl, 1, 1, 30, 30);
    
    // 🖌️ create that texture
    const texture = twgl.createTexture(gl, {
        src: "../img/Colored Long.png",
    });

    let values = {
        scrollBefore: 0,
        scrollNow: 0,
        time: 0,
        power: 0,
        proress: 0,
    }

    let isAnimating = false;
    
    function render() {
        // If you don't have this, the resolution will be jacked
        twgl.resizeCanvasToDisplaySize(gl.canvas);
        
        // Boilerplate for setting up the "canvas". think painting it white to get started painting
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        
        // Set up out matrices
        let matrix = m4.identity();
        let tMatrix = m4.identity();
        
        // Create ratio comparisons for the algorithm below
        const texAspect = texture.width / texture.height
        const imgAspect = gl.canvas.width / gl.canvas.height
        
        // Initialize
        let scaleY = 0
        let scaleX = 0
        
        // Decide whether to scale down by X or Y
        if (imgAspect < texAspect) {
            scaleY = 1
            scaleX = imgAspect / texAspect
        } else if (imgAspect > texAspect) {
            scaleY = texAspect / imgAspect
            scaleX = 1
        }
        
        // wtf below looks like this would take some serious research
        m4.scale(tMatrix, [scaleX, scaleY, 1], tMatrix)
        
        values.time++;
        
        // These control positioning and scaling so we don't have to control it via shader... very interesting right? 🤔
        m4.ortho(0, gl.canvas.width, gl.canvas.height, 0, -1, 1, matrix)
        m4.translate(matrix, [gl.canvas.width / 2, gl.canvas.height / 3.5, 1], matrix)
        m4.scale(matrix, [gl.canvas.width / 2.5, gl.canvas.height / 2.5, 1], matrix)
        
        // Aight we're gonna use this particular shader for this thing
        gl.useProgram(programInfo.program);
        
        // Don't even think about the boilerplate that's involved in the below
        twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
        
        twgl.setUniforms(programInfo, {
            uMatrix: matrix,
            uTmatrix: tMatrix,
            uTex: texture,
            uTime: values.time,
            uPower: values.power,
            uProgress: values.progress,
            uRes: [gl.canvas.width, gl.canvas.height],
            // uOffset: values.offset
        })
        
        // the gl.drawArrays thing but all in one. It's beautiful 😢
        twgl.drawBufferInfo(gl, bufferInfo);
    }
    
    function listeners() {
        window.addEventListener('scroll', onScroll);
    }

    let onScroll = () => {
        if (isAnimating) return;
        isAnimating = true;
        // values.power = (scrollY - values.scrollBefore) / 10.0;
        let current_power = (scrollY - values.scrollBefore) / 20.0;
        TweenMax.to(values, 0.1, { power: current_power, ease: Expo.easeInOut, onComplete: () => {
            TweenMax.to(values, 0.75, { power: 0, ease: Expo.easeInout})
            isAnimating = false;
        }});
        values.scrollBefore = scrollY;
    }
    
    function init() {
        listeners();

        TweenMax.ticker.addEventListener('tick', render);
    }
    
    init();
}

main();

