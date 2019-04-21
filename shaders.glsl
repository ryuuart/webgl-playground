////////////////////////////////////////
// From Gucci Kids Spring Summer 2019 //
////////////////////////////////////////
// Fragment Shaders
precision mediump float;
#define GLSLIFY 1

varying vec2 vTextureCoord;

uniform float uTime;
uniform vec2 uResolution;
uniform float uDelta;
uniform sampler2D uSampler;

void main()
{
  vec2 newVec = vTextureCoord;

  float multiplier = clamp(uDelta * 0.0003, -0.1, 0.1);

  vec2 st = gl_FragCoord.xy / uResolution;

  newVec.y += sin((st.x * 3.14) * 1.0) * multiplier;

  vec4 texture = texture2D(uSampler, newVec);

  gl_FragColor = texture;
}

// Vertex Shader
precision mediump float;
#define GLSLIFY 1

attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;
uniform mat3 filterMatrix;
uniform vec2 uResolution;
uniform float uTime;
uniform float uDelta;

varying vec2 vTextureCoord;
varying vec2 vFilterCoord;

void main(void){
  vec2 position = (projectionMatrix * vec3(aVertexPosition, 1.0)).xy;

  gl_Position = vec4(position, 0.0, 1.0);

  vFilterCoord = ( filterMatrix * vec3( aTextureCoord, 1.0)  ).xy;

  vTextureCoord = aTextureCoord;
}
////////////////////////
// Robin Mastromarino //
////////////////////////
// Vertex Shader
#define GLSLIFY 1
void texcoords(vec2 fragCoord, vec2 resolution,
			out vec2 v_rgbNW, out vec2 v_rgbNE,
			out vec2 v_rgbSW, out vec2 v_rgbSE,
			out vec2 v_rgbM) {
	vec2 inverseVP = 1.0 / resolution.xy;
	v_rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseVP;
	v_rgbNE = (fragCoord + vec2(1.0, -1.0)) * inverseVP;
	v_rgbSW = (fragCoord + vec2(-1.0, 1.0)) * inverseVP;
	v_rgbSE = (fragCoord + vec2(1.0, 1.0)) * inverseVP;
	v_rgbM = vec2(fragCoord * inverseVP);
}

uniform vec2 uResolution;

varying vec2 vUv;
varying vec2 vrgbNW;
varying vec2 vrgbNE;
varying vec2 vrgbSW;
varying vec2 vrgbSE;
varying vec2 vrgbM;

void main() {
  vUv = uv;

  vec2 fragCoord = uv * uResolution;
  texcoords(fragCoord, uResolution, vrgbNW, vrgbNE, vrgbSW, vrgbSE, vrgbM);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// Fragment Shaders
#define GLSLIFY 1
vec4 fxaa(sampler2D tex, vec2 fragCoord, vec2 resolution,
            vec2 v_rgbNW, vec2 v_rgbNE, 
            vec2 v_rgbSW, vec2 v_rgbSE, 
            vec2 v_rgbM) {
    vec4 color;
    mediump vec2 inverseVP = vec2(1.0 / resolution.x, 1.0 / resolution.y);
    vec3 rgbNW = texture2D(tex, v_rgbNW).xyz;
    vec3 rgbNE = texture2D(tex, v_rgbNE).xyz;
    vec3 rgbSW = texture2D(tex, v_rgbSW).xyz;
    vec3 rgbSE = texture2D(tex, v_rgbSE).xyz;
    vec4 texColor = texture2D(tex, v_rgbM);
    vec3 rgbM  = texColor.xyz;
    vec3 luma = vec3(0.299, 0.587, 0.114);
    float lumaNW = dot(rgbNW, luma);
    float lumaNE = dot(rgbNE, luma);
    float lumaSW = dot(rgbSW, luma);
    float lumaSE = dot(rgbSE, luma);
    float lumaM  = dot(rgbM,  luma);
    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));
    
    mediump vec2 dir;
    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));
    
    float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *
                          (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);
    
    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
    dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),
              max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
              dir * rcpDirMin)) * inverseVP;
    
    vec3 rgbA = 0.5 * (
        texture2D(tex, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)).xyz +
        texture2D(tex, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)).xyz);
    vec3 rgbB = rgbA * 0.5 + 0.25 * (
        texture2D(tex, fragCoord * inverseVP + dir * -0.5).xyz +
        texture2D(tex, fragCoord * inverseVP + dir * 0.5).xyz);

    float lumaB = dot(rgbB, luma);
    if ((lumaB < lumaMin) || (lumaB > lumaMax))
        color = vec4(rgbA, texColor.a);
    else
        color = vec4(rgbB, texColor.a);
    return color;
}

uniform sampler2D tDiffuse;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec2 vrgbNW;
varying vec2 vrgbNE;
varying vec2 vrgbSW;
varying vec2 vrgbSE;
varying vec2 vrgbM;

void main() {
  vec2 fragCoord = vUv * uResolution;
  vec4 color = fxaa(tDiffuse, fragCoord, uResolution, vrgbNW, vrgbNE, vrgbSW, vrgbSE, vrgbM);

  gl_FragColor = color;
}
////////////////////////////////
// Crafted by Green Chameleon //
////////////////////////////////
// Shader for the Circle Thing?
// Vertex Shader Desktop
precision mediump float;

attribute vec3 position;
attribute vec2 texcoord;

uniform mat4 uMatrix;
uniform mat4 uTMatrix; 

uniform vec2 uOffset;

uniform float uTime;
uniform float uDiff;

varying vec2 vTexcoord;

void main() {
  vec3 pos = position.xzy;

  gl_Position = uMatrix * vec4(pos, 1.0);
  vTexcoord = (uTMatrix * vec4(texcoord - vec2(.5), 0, 1)).xy + vec2(.5);
}   
// Vertex Shader Mobile ?
precision mediump float;

attribute vec3 position;
attribute vec2 texcoord;

uniform mat4 uMatrix;
uniform mat4 uTMatrix;

uniform vec2 uOffset;

uniform float uDiff;
uniform float uTime;

varying vec2 vTexcoord;

void main() {
  vec3 pos = position.xzy;
  vec2 uv = vTexcoord;

  float bending = (cos(uTime * .0015 + pos.x * 3.025) + sin(uTime * .01 + pos.y *
    12.30)) * 2.;
  float effect = bending * uDiff;

  pos.y += effect / 11. * cos(pos.y) * sin(pos.y);

  gl_Position = uMatrix * vec4(pos, 1.0);
  vTexcoord = (uTMatrix * vec4(texcoord - vec2(.5), 0, 1)).xy + vec2(.5);
}  

// Vertex Shader 2
  precision mediump float;

  attribute vec3 position;
  attribute vec2 texcoord;

  uniform mat4 uMatrix;
  uniform mat4 uTMatrix;

  uniform vec2 uOffset;

  uniform float uTime;
  uniform float uDiff;

  varying vec2 vTexcoord;
  varying vec2 vMouseDist;

  void main() {
    vec3 pos = position.xzy;
    vec2 uv = vTexcoord;

    float mousePos = distance(uOffset, uv);
    mousePos = 1.0 - mousePos;

    vMouseDist = vec2(mousePos, 1.0);

    gl_Position = uMatrix * vec4(pos, 1.0);
    vTexcoord = (uTMatrix * vec4(texcoord - vec2(.5), 0, 1)).xy + vec2(.5);
  }

// Fragment Shader
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

float cnoise(vec3 P) {
  vec3 Pi0 = floor(P);
  vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

float pnoise(vec3 P, vec3 rep) {
  vec3 Pi0 = mod(floor(P), rep);
  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep);
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

float rand(vec2 n) {
  return 0.5 + 0.5 * fract(sin(dot(n.xy, vec2(12.9898, 78.233)))* 43758.5453);
}


  uniform sampler2D uTex;
  uniform float uRadius;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uDiff;
  uniform vec2 uRes;
  
  varying vec2 vTexcoord;
  varying vec2 vMouseDist;

  float smoothEdge = .005;

  void main() {
    vec2 uv = vTexcoord;

    vec4 backgroundColor = vec4(0.);

    vec2 center = vec2(.5) * uRes;
    vec2 fragCoord = uv * uRes;
    float dist = length(fragCoord - center);

    float diagonal = length(uRes / 3.5);
    float radius = diagonal * uRadius;

    float circle = 1. - smoothstep(
      radius - (radius * smoothEdge),
      radius + (radius * smoothEdge),
      dist
    );

    vec3 noisePos = vec3(uv.xy * 75., 0.0);
    float gradient = pnoise(.1 * noisePos + vec3(1.0, uTime * 0.02, 0), vec3(100.0)) * 1.0;
    float texMix = gradient * .05 + .05;
    vec2 dispPos = uv + texMix * (vMouseDist * 3.);

    vec4 tex = texture2D(uTex, dispPos);

    vec4 outputColor = mix(backgroundColor, tex, circle);

    gl_FragColor = outputColor;
  } 

// Main Shaders
precision mediump float;

  attribute vec3 position;
  attribute vec2 texcoord;

  uniform mat4 uMatrix;
  uniform mat4 uTMatrix; 

  uniform vec2 uOffset;

  uniform float uTime;
  uniform float uDiff;

  varying vec2 vTexcoord;

  void main() {
    vec3 pos = position.xzy;

    gl_Position = uMatrix * vec4(pos, 1.0);
    vTexcoord = (uTMatrix * vec4(texcoord - vec2(.5), 0, 1)).xy + vec2(.5);
  }   

  precision mediump float;

  attribute vec3 position;
  attribute vec2 texcoord;

  uniform mat4 uMatrix;
  uniform mat4 uTMatrix;

  uniform vec2 uOffset;

  uniform float uDiff;
  uniform float uTime;

  varying vec2 vTexcoord;

  void main() {
    vec3 pos = position.xzy;
    vec2 uv = vTexcoord;

    float bending = (cos(uTime * .0015 + pos.x * 3.025) + sin(uTime * .01 + pos.y *
  12.30)) * 2.;
    float effect = bending * uDiff;

    pos.y += effect / 11. * cos(pos.y) * sin(pos.y);

    gl_Position = uMatrix * vec4(pos, 1.0);
    vTexcoord = (uTMatrix * vec4(texcoord - vec2(.5), 0, 1)).xy + vec2(.5);
  }  

  precision mediump float;

  uniform sampler2D uTex;
  uniform float uFragScale;

  varying vec2 vTexcoord;

  void main() {
    vec2 uv = vTexcoord;

    vec2 texCenter = vec2(0.5);
    vec2 texScale = (uv - texCenter) * uFragScale + texCenter;
    vec4 tex = texture2D(uTex, texScale);

    gl_FragColor = tex;
  }
