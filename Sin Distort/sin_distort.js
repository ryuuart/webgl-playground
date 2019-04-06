function main() {
    var image = new Image();
    // requestCORSIfNotSameOrigin(image, "https://webglfundamentals.org/webgl/resources/leaves.jpg");
    image.src = "../img/Colored Long.png";
    image.onload = function() {
      render(image);
    };
  }
  
  var deltaScroll = 0.0;

  function render(image) {
    // Get A WebGL context
    var canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl");
    if (!gl) return;
    
    // Setup GLSL Program
    var program = webglUtils.createProgramFromScripts(gl, ["2d-vertex-shader", "2d-fragment-shader"]);
    
    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");
    var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
    
    // lookup uniforms
    var textureLocation = gl.getUniformLocation(program, "u_texture");
    var textureSizeLocation = gl.getUniformLocation(program, "u_textureSize");
    var timeLocation = gl.getUniformLocation(program, "u_time");
    var scrollVelocityLocation = gl.getUniformLocation(program, "u_scrollVelocity");
    
    // Create a buffer for positions
    var positionBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Set a rectangle the same size as the image.
    setRectangle(gl, 0, 0, image.width, image.height);
    
    // provide texture coordinates for the rectangle
    var texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    // 🤔 I imagine this to be the the clipspace of the image
    // 🤔 I'm thinking recursive clipspaces but I might be wrong 🤐❌
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      0.0, 1.0,
      1.0, 0.0,
      1.1, 1.1
      // 0.0, 0.0, //
      // 0.5, 0,0,
      // 0.0, 0.5,
      // 0.0, 0.5, // 
      // 0.5, 0.5, 
      // 0.5, 0.0,
      // 0.5, 0.0, //
      // 1.0, 0.0,
      // 0.5, 0.5,
      // 0.5, 0.5, //
      // 1.0, 0.0,
      // 1.0, 0.5,
      // 1.0, 0.5, //
      // 1.0, 1.0,
      // 0.5, 1.0,
      // 0.5, 1.0, //
      // 1.0, 0.5,
      // 0.5, 0.5,
      // 0.5, 0.5, //
      // 0.5, 1.0,
      // 0.0, 1.0,
      // 0.0, 1.0, //
      // 0.5, 0.5,
      // 0.0, 0.5,
    ]), gl.STATIC_DRAW);
    
    // 🖌️ Create a texture
    var texture = gl.createTexture();
    // 🌎 Bind texture to gl.TEXTURE_2D global bind point
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    
    // Upload the image into the texture
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    
    // 🔍 Lookup Uniforms
    var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    
    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Use our program
    gl.useProgram(program);

    var then = 0;
    // Handle scroll velocity
    var scrollBefore = window.scrollY;
    
    var scrollHeight = window.innerHeight * 4.0;
    var scrollOffset = 0;
    var scrollPercent = 0;
    var indicatorPosition = window.scrollY;

    requestAnimationFrame(drawScene);

    function loop() {
        scrollOffset = window.scrollY || window.scrollTop + deltaScroll;
        scrollPercent = scrollOffset/scrollHeight || 0;
        indicatorPosition += (scrollPercent - indicatorPosition)*0.05;
        // var transformString = 'translateX('+(indicatorPosition*300)+'px)';
        // console.log(indicatorPosition * 300.0)
        // console.log(deltaScroll)
        window.scrollBy(0, scrollOffset + indicatorPosition * 200.0);
        requestAnimationFrame(loop)
      }
    
    // loop();

    function drawScene(now) {
      // Handle delta time
      // Convert the time to seconds
      now *= 0.001;
      // Subtract the previous time from the current time
      var deltaTime = then - now;
      
      // deltaScroll = 0;
      window.addEventListener('wheel', (e) => {
        deltaScroll = (e.deltaY * 15.0);
        window.scrollBy({left: 0, top: deltaScroll, behavior: "smooth"})
        let scrollNow = window.scrollY;
        scrollBefore = scrollNow;
      })
      
      // Remember the current time for the next frame.
      then = now;

      

      // 🎚️ Turn on the position attribute
      gl.enableVertexAttribArray(positionLocation);
      
      // Bind the position buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      
      // Tell the position attribute how to get the dta out of positionBuffer
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      
      // ☝️ Remember we have to turn on our attributes and tell the buffer how to stream data buffer->attribute
      gl.enableVertexAttribArray(texCoordLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
      
      //
      gl.uniform2f(textureSizeLocation, image.width, image.height);
      gl.uniform1f(timeLocation, now + deltaTime);
      gl.uniform1f(scrollVelocityLocation, deltaScroll / window.innerHeight);

      // 👀 Set resolution
      gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
      
      // Draw the rectangle
      var primitiveType = gl.TRIANGLES;
      var offset = 0;
      var count = 6;
      gl.drawArrays(primitiveType, offset, count);

      requestAnimationFrame(drawScene);
  }
  
  function setRectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x1, y1,
      x2, y1,
      x1, y2,
      x1, y2,
      x2, y1,
      x2, y2
      // x1, y1,
      // x2/2, y1,
      // x1, y2/2,
      // x1, y2/2,
      // x2/2, y2/2,
      // x2/2, y1,
      // x2/2, y1,
      // x2, y1,
      // x2/2, y2/2,
      // x2/2, y2/2,
      // x2, y1,
      // x2, y2/2,
      // x2, y2/2,
      // x2, y2,
      // x2/2, y2,
      // x2/2, y2,
      // x2, y2/2,
      // x2/2, y2/2,
      // x2/2, y2/2,
      // x2/2, y2,
      // x1, y2,
      // x1, y2,
      // x2/2, y2/2,
      // x1, y2/2,
    ]), gl.STATIC_DRAW);
    }
  }
  
  main();
  
  // This is needed if the images are not on the same domain
  // NOTE: The server providing the images must give CORS permissions
  // in order to be able to use the image with WebGL. Most sites
  // do NOT give permission.
  // See: http://webglfundamentals.org/webgl/lessons/webgl-cors-permission.html
  function requestCORSIfNotSameOrigin(img, url) {
    if ((new URL(url)).origin !== window.location.origin) {
      img.crossOrigin = "";
    }
  }

  function lerp(start, end, t) {
    return start * (1 - t) + end * t;
  }