/**
 * Custom GLSL Shaders for the 3D Circuit-Board Valley Environment
 * Supports real-time multi-speed optical packet flow, interactive river hover ripples,
 * sequential circuit activation, emerald forest light curtains, rim-lit mountain ridges,
 * and descending vertical sky binary streams.
 */

export const RIVER_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPosition.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const RIVER_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vNormal;

  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uPulseOrigin;
  uniform float uPulseTime;
  uniform vec3 uPulseColor;
  uniform vec3 uHoveredPos;
  uniform vec3 uSelectedPos;
  uniform float uRiverHoverZ;
  uniform float uRiverHoverBoost;
  uniform vec3 uSunPosition;
  uniform vec3 uCameraPos;

  float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
  }

  float hash21(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  void main() {
    float u = (vUv.x - 0.5) * 2.0;
    float absU = abs(u);
    float v = vUv.y;

    // Smooth 45-degree PCB chamfer routing jogs
    float zScaled = v * 22.0;
    float seg0 = floor(zScaled);
    float seg1 = seg0 + 1.0;
    float frac = smoothstep(0.28, 0.72, fract(zScaled));
    float chamferShift = mix(hash11(seg0) - 0.5, hash11(seg1) - 0.5, frac) * 0.11;
    float routedU = u + chamferShift * smoothstep(0.08, 0.55, absU);

    // Multi-frequency parallel PCB trace lanes
    float laneFreq1 = 42.0;
    float laneFreq2 = 108.0;
    float laneFreq3 = 220.0;

    float laneId1 = floor((routedU + 1.0) * 0.5 * laneFreq1);
    float laneId2 = floor((routedU + 1.0) * 0.5 * laneFreq2);

    float laneFract1 = abs(fract((routedU + 1.0) * 0.5 * laneFreq1) - 0.5) * 2.0;
    float laneFract2 = abs(fract((routedU + 1.0) * 0.5 * laneFreq2) - 0.5) * 2.0;
    float laneFract3 = abs(fract((routedU + 1.0) * 0.5 * laneFreq3) - 0.5) * 2.0;

    float traceMask1 = step(0.22, hash11(laneId1 * 1.9 + 0.3));
    float traceLine1 = (1.0 - smoothstep(0.10, 0.28, laneFract1)) * traceMask1;
    float traceLine2 = 1.0 - smoothstep(0.12, 0.34, laneFract2);
    float fineFiber = 1.0 - smoothstep(0.15, 0.42, laneFract3);

    // Multi-speed optical light packets traveling along the river curves
    float speed1 = 0.28 + hash11(laneId1 * 1.37) * 0.65;
    float dir1 = (mod(laneId1, 3.0) < 1.0) ? -1.0 : 1.0;
    float packet1 = pow(0.5 + 0.5 * sin((v * 20.0 + uTime * speed1 * dir1) * 6.28318 + hash11(laneId1) * 6.28), 5.0);

    float speed2 = 0.45 + hash11(laneId2 * 2.71) * 0.85;
    float packet2 = pow(0.5 + 0.5 * sin((v * 42.0 - uTime * speed2) * 6.28318 + hash11(laneId2) * 6.28), 7.0);

    // Circular PCB solder via pads (o-o connection terminals)
    vec2 viaGrid = vec2(routedU * 20.0, v * 58.0);
    vec2 viaId = floor(viaGrid);
    vec2 viaLocal = fract(viaGrid) - 0.5;
    float viaRand = hash21(viaId);
    float viaDist = length(viaLocal);
    float viaRing = (viaRand > 0.77) ? (smoothstep(0.34, 0.25, viaDist) - smoothstep(0.16, 0.09, viaDist)) : 0.0;
    float viaDot = (viaRand > 0.77) ? smoothstep(0.09, 0.03, viaDist) : 0.0;

    // Cyan, turquoise, and emerald flowing light streams with bronze edge traces
    float mainStreamPos = 0.08 * sin(v * 9.0);
    float centerCore = exp(-pow((routedU - mainStreamPos) * 3.8, 2.0));
    float leftStream = exp(-pow((routedU + 0.38) * 5.2, 2.0));
    float rightStream = exp(-pow((routedU - 0.46) * 5.5, 2.0));
    float midGlow = exp(-absU * absU * 2.2);
    float outerMargin = smoothstep(0.52, 0.88, absU) * (1.0 - smoothstep(0.92, 1.0, absU));

    vec3 darkSubstrate = vec3(0.008, 0.028, 0.058);
    vec3 deepCobalt = vec3(0.015, 0.26, 0.62);
    vec3 electricCyan = vec3(0.04, 0.88, 1.0);
    vec3 emeraldTurquoise = vec3(0.08, 0.94, 0.68);
    vec3 hotWhite = vec3(0.92, 0.99, 1.0);
    vec3 bronzeEdge = vec3(0.76, 0.64, 0.28);

    vec3 col = mix(darkSubstrate, deepCobalt, midGlow * 0.55 + (centerCore + leftStream * 0.6 + rightStream * 0.6) * 0.45);

    float activeTrace = traceLine1 * 0.65 + traceLine2 * 0.45 + fineFiber * 0.25 * centerCore;
    vec3 streamTint = mix(electricCyan, emeraldTurquoise, 0.35 * sin(v * 12.0 + u * 3.0));
    col += streamTint * activeTrace * (0.35 + 0.85 * (midGlow + leftStream + rightStream));
    col += hotWhite * centerCore * (0.32 + 0.85 * traceLine2 + 0.45 * fineFiber);

    // Interactive River Checkpoint Hover / Approach Ripple & Emphasis
    float zDistToRiverHover = abs(vWorldPos.z - uRiverHoverZ);
    float riverSegEmphasis = exp(-zDistToRiverHover * 0.075) * uRiverHoverBoost;
    float riverRipple = (0.5 + 0.5 * sin(zDistToRiverHover * 0.85 - uTime * 7.5)) * exp(-zDistToRiverHover * 0.05) * uRiverHoverBoost;

    // Flowing optical data packets
    float packetBoost = 1.0 + riverSegEmphasis * 1.4;
    col += streamTint * traceLine1 * packet1 * 1.1 * packetBoost;
    col += hotWhite * traceLine2 * packet2 * (centerCore + leftStream * 0.5 + rightStream * 0.5) * 1.25 * packetBoost;
    col += vec3(0.25, 0.98, 0.92) * riverRipple * (0.45 + 0.55 * traceLine1);

    // Outer bronze-metallic & cyan PCB traces and circular solder via rings
    col += mix(electricCyan, bronzeEdge, smoothstep(0.32, 0.78, absU)) * (viaRing * 1.55 + viaDot * 1.1);
    col += bronzeEdge * outerMargin * (traceLine1 * 0.95 + traceLine2 * 0.40);

    // Recessed river channel bank shadow
    float bankEdge = smoothstep(0.88, 0.99, absU);
    col = mix(col, vec3(0.02, 0.05, 0.06), bankEdge * 0.85);

    // Distant solar horizon reflection on the upper river channel
    float horizonGlow = smoothstep(0.45, 0.98, v) * exp(-absU * absU * 3.2);
    vec3 sunColor = vec3(1.0, 0.95, 0.76);
    col = mix(col, sunColor, horizonGlow * 0.84);

    // Interactive radial pulse wave when any object is selected
    float pulseDist = length(vWorldPos - uPulseOrigin);
    float pulseRadius = uPulseTime * 48.0;
    float pulseRing = exp(-pow((pulseDist - pulseRadius) * 0.22, 2.0)) * smoothstep(6.0, 0.0, uPulseTime);
    col += uPulseColor * pulseRing * 1.45;

    // Proximity glow from hovered or selected 3D objects
    float nearHover = exp(-length(vWorldPos - uHoveredPos) * 0.14);
    float nearSelect = exp(-length(vWorldPos - uSelectedPos) * 0.12);
    col += electricCyan * (nearHover * 0.45 + nearSelect * 0.75);

    // Atmospheric distance mist blending toward horizon
    vec3 horizonFog = mix(vec3(0.08, 0.28, 0.30), vec3(0.95, 0.92, 0.74), smoothstep(0.55, 1.0, v));
    float fogFactor = smoothstep(0.68, 1.0, v) * 0.62;
    col = mix(col * uIntensity, horizonFog, fogFactor);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const TERRACE_VERTEX_SHADER = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const TERRACE_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec2 vUv;

  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uPulseOrigin;
  uniform float uPulseTime;
  uniform vec3 uPulseColor;
  uniform vec3 uHoveredPos;
  uniform vec3 uSelectedPos;

  float hash21(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  void main() {
    vec3 n = normalize(vNormal);
    float isHorizontal = smoothstep(0.45, 0.85, abs(n.y));

    vec3 darkGunmetal = vec3(0.035, 0.055, 0.06);
    vec3 oliveBronze = vec3(0.11, 0.12, 0.085);
    vec3 col = mix(darkGunmetal, oliveBronze, isHorizontal * 0.68);

    float stepBevel = 1.0 - smoothstep(0.04, 0.16, abs(fract(vWorldPos.y * 0.82) - 0.5));

    if (isHorizontal > 0.35) {
      vec2 gridMajor = vec2(vWorldPos.x * 0.55, vWorldPos.z * 0.35);
      vec2 gridMinor = vec2(vWorldPos.x * 1.85, vWorldPos.z * 1.15);

      vec2 fMajor = abs(fract(gridMajor) - 0.5);
      vec2 fMinor = abs(fract(gridMinor) - 0.5);

      float lineZ = 1.0 - smoothstep(0.015, 0.05, fMajor.x);
      float lineX = (1.0 - smoothstep(0.015, 0.05, fMajor.y)) * step(0.45, hash21(floor(gridMajor)));
      float fineTrace = (1.0 - smoothstep(0.02, 0.065, min(fMinor.x, fMinor.y))) * step(0.62, hash21(floor(gridMinor)));

      float cellHash = hash21(floor(gridMajor));
      float riverProx = exp(-abs(vWorldPos.x) * 0.048);

      vec3 cyanTrace = vec3(0.08, 0.86, 0.98);
      vec3 copperGold = vec3(0.64, 0.54, 0.25);
      vec3 traceCol = mix(copperGold, cyanTrace, riverProx * 0.75 + cellHash * 0.25);

      float flowPulse = 0.5 + 0.5 * sin(vWorldPos.z * 0.18 - uTime * 1.6 + cellHash * 6.28);
      col += traceCol * (lineZ * 0.42 + lineX * 0.28 + fineTrace * 0.22) * (0.45 + 0.55 * flowPulse);

      col += mix(copperGold, cyanTrace, riverProx) * stepBevel * 0.45;

      float westGroveBounce = exp(-pow((vWorldPos.x + 36.0) * 0.048, 2.0) - pow((vWorldPos.z + 42.0) * 0.020, 2.0));
      float eastGroveBounce = exp(-pow((vWorldPos.x - 36.0) * 0.048, 2.0) - pow((vWorldPos.z + 42.0) * 0.020, 2.0));
      col += vec3(0.05, 0.52, 0.28) * (westGroveBounce + eastGroveBounce) * 0.68;
    } else {
      // Vertical illumination slots on stepped PCB terrace risers
      float riserSlot = 1.0 - smoothstep(0.06, 0.18, abs(fract(vWorldPos.y * 3.6) - 0.5));
      float dashMask = step(0.38, fract(vWorldPos.z * 0.65 + floor(vWorldPos.y * 3.6) * 0.41));
      float riverProx = exp(-abs(vWorldPos.x) * 0.05);
      vec3 slotCol = mix(vec3(0.65, 0.55, 0.26), vec3(0.06, 0.88, 1.0), riverProx);
      col = darkGunmetal * 0.7 + slotCol * riserSlot * dashMask * 0.82;
    }

    vec3 lightDir = normalize(vec3(0.0, 14.0, -280.0) - vWorldPos);
    float diff = max(0.0, dot(n, lightDir));
    col += vec3(0.36, 0.42, 0.32) * diff * 0.38;

    float hoverHighlight = exp(-length(vWorldPos - uHoveredPos) * 0.16);
    float selectHighlight = exp(-length(vWorldPos - uSelectedPos) * 0.14);
    float pulseDist = length(vWorldPos - uPulseOrigin);
    float pulseWave = exp(-pow((pulseDist - uPulseTime * 48.0) * 0.2, 2.0)) * smoothstep(6.0, 0.0, uPulseTime);

    col += vec3(0.1, 0.95, 0.75) * (hoverHighlight * 0.55 + selectHighlight * 0.85);
    col += uPulseColor * pulseWave * 0.95;

    float depthFactor = smoothstep(15.0, -260.0, vWorldPos.z);
    vec3 mistColor = mix(vec3(0.06, 0.20, 0.22), vec3(0.72, 0.78, 0.64), pow(depthFactor, 1.6));
    col = mix(col * uIntensity, mistColor, depthFactor * 0.72);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const FOREST_HOLOGRAM_VERTEX_SHADER = /* glsl */ `
  attribute float aTreeSeed;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vSeed;

  void main() {
    vUv = uv;
    vSeed = aTreeSeed;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const FOREST_HOLOGRAM_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vSeed;

  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uPulseOrigin;
  uniform float uPulseTime;
  uniform vec3 uHoveredPos;
  uniform vec3 uSelectedPos;

  float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
  }

  void main() {
    float colIndex = floor(vUv.x * 64.0);
    float colFract = abs(fract(vUv.x * 64.0) - 0.5) * 2.0;
    float streak = 1.0 - smoothstep(0.12, 0.68, colFract);

    float speed = 0.30 + hash11(colIndex + vSeed * 19.0) * 0.55;
    float phase = hash11(colIndex * 3.1 + vSeed * 7.3);

    float bitStream = 0.55 + 0.45 * sin((vUv.y * 8.0 - uTime * speed + phase) * 6.28318);
    float fineParticles = pow(0.5 + 0.5 * sin((vUv.y * 32.0 - uTime * speed * 2.2 + phase * 12.0) * 6.28318), 4.0);

    float verticalFade = smoothstep(0.02, 0.22, vUv.y) * pow(1.0 - vUv.y, 1.65);
    float edgeSoftness = pow(sin(vUv.x * 3.14159265), 0.65);

    vec3 deepEmerald = vec3(0.02, 0.45, 0.24);
    vec3 neonGreen = vec3(0.18, 0.98, 0.54);
    vec3 cyanMint = vec3(0.72, 1.0, 0.88);

    vec3 col = mix(deepEmerald, neonGreen, bitStream);
    col = mix(col, cyanMint, fineParticles * verticalFade * 0.58);

    float nodeBoost =
      exp(-length(vWorldPos - uHoveredPos) * 0.09) * 0.65 +
      exp(-length(vWorldPos - uSelectedPos) * 0.08) * 0.95;
    float pulseDist = length(vWorldPos - uPulseOrigin);
    float pulseWave = exp(-pow((pulseDist - uPulseTime * 48.0) * 0.16, 2.0)) * smoothstep(6.0, 0.0, uPulseTime);

    float alpha = verticalFade * edgeSoftness * (0.14 + 0.36 * streak * bitStream + 0.18 * fineParticles);
    alpha *= (1.0 + nodeBoost + pulseWave * 0.9) * uIntensity;

    gl_FragColor = vec4(col * (1.0 + nodeBoost + pulseWave), clamp(alpha, 0.0, 0.78));
  }
`;

export const MOUNTAIN_VERTEX_SHADER = /* glsl */ `
  attribute float aRidgeFactor;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying float vRidge;

  void main() {
    vRidge = aRidgeFactor;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const MOUNTAIN_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying float vRidge;

  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uSunPosition;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 toSun = normalize(uSunPosition - vWorldPos);
    vec3 toCenter = normalize(vec3(0.0, vWorldPos.y + 4.0, vWorldPos.z - 25.0) - vWorldPos);

    float rockDetail1 = sin(vWorldPos.x * 0.85 + vWorldPos.y * 1.35 + vWorldPos.z * 0.45);
    float rockDetail2 = cos(vWorldPos.x * 2.1 - vWorldPos.y * 2.8 + vWorldPos.z * 1.1);
    float microFacet = 0.5 + 0.3 * rockDetail1 + 0.2 * rockDetail2;

    vec3 shadowRock = vec3(0.025, 0.065, 0.085);
    vec3 midTealRock = vec3(0.07, 0.17, 0.18);
    vec3 sunRimColor = vec3(0.88, 0.94, 0.74);
    vec3 emeraldBounce = vec3(0.06, 0.52, 0.32);

    float sunDiffuse = max(0.0, dot(n, toSun));
    float valleyFacing = max(0.0, dot(n, toCenter));
    float ridgeCrest = smoothstep(0.38, 0.92, vRidge * (0.75 + 0.25 * microFacet));

    vec3 col = mix(shadowRock, midTealRock, sunDiffuse * 0.65 + microFacet * 0.35);

    // Emerald & teal illuminated ridge edges + golden solar rim lighting
    float rimIntensity = pow(sunDiffuse, 1.35) * (0.40 + 0.60 * ridgeCrest) + valleyFacing * ridgeCrest * 0.65 * microFacet;
    col = mix(col, sunRimColor, clamp(rimIntensity * 0.88, 0.0, 0.94));
    col += vec3(0.05, 0.62, 0.52) * ridgeCrest * (1.0 - sunDiffuse * 0.5) * 0.25;

    float baseBounce = smoothstep(24.0, 4.0, vWorldPos.y) * smoothstep(-145.0, -10.0, vWorldPos.z);
    col += emeraldBounce * baseBounce * valleyFacing * 0.48;

    float mistHeight = smoothstep(14.0, 2.0, vWorldPos.y);
    float distFactor = smoothstep(-35.0, -280.0, vWorldPos.z);
    vec3 mistCol = mix(vec3(0.10, 0.32, 0.32), vec3(0.88, 0.90, 0.70), pow(distFactor, 1.4));

    col = mix(col * uIntensity, mistCol, clamp(mistHeight * 0.38 + distFactor * 0.60, 0.0, 0.86));

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const SKY_DATA_VERTEX_SHADER = /* glsl */ `
  attribute float aStreamSeed;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vSeed;

  void main() {
    vUv = uv;
    vSeed = aStreamSeed;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const SKY_DATA_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vSeed;

  uniform float uTime;
  uniform float uIntensity;

  float hash21(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  void main() {
    float centerSpine = 1.0 - smoothstep(0.05, 0.22, abs(vUv.x - 0.5));

    float cellY = vUv.y * 34.0 + uTime * (0.40 + mod(vSeed, 0.65));
    float cellId = floor(cellY);
    vec2 cellUv = vec2((vUv.x - 0.5) * 3.4, fract(cellY) - 0.5);

    float glyphRand = hash21(vec2(cellId, floor(vSeed * 100.0)));
    float isOne = step(0.5, glyphRand);
    float barGlyph = (1.0 - smoothstep(0.10, 0.24, abs(cellUv.x))) * (1.0 - smoothstep(0.26, 0.40, abs(cellUv.y)));
    float ringDist = length(cellUv * vec2(1.25, 0.95));
    float zeroGlyph = smoothstep(0.36, 0.26, ringDist) - smoothstep(0.18, 0.09, ringDist);

    float glyphPattern = mix(zeroGlyph, barGlyph, isOne) * step(0.30, glyphRand);
    float bottomNode = exp(-pow((vUv.y - 0.06) * 24.0, 2.0)) * (1.0 - smoothstep(0.12, 0.36, abs(vUv.x - 0.5)));

    float verticalEnvelope = smoothstep(0.01, 0.08, vUv.y) * smoothstep(1.0, 0.78, vUv.y);
    float pulse = 0.65 + 0.35 * sin(vUv.y * 8.0 + uTime * 1.6 + vSeed * 6.28);

    vec3 cyanTint = vec3(0.30, 0.90, 0.95);
    vec3 mintTint = vec3(0.42, 0.96, 0.76);
    vec3 col = mix(cyanTint, mintTint, fract(vSeed * 3.7));

    float alpha = verticalEnvelope * (centerSpine * 0.26 + glyphPattern * 0.72 + bottomNode * 0.65) * pulse * uIntensity;
    if (alpha < 0.02) discard;

    gl_FragColor = vec4(col * (1.0 + bottomNode * 0.5), clamp(alpha, 0.0, 0.82));
  }
`;
