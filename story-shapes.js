var UIPShapes = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var shapes_only_exports = {};
  __export(shapes_only_exports, {
    GOLD_PALETTE: () => GOLD_PALETTE,
    generateCompass: () => generateCompass,
    generateFunnel: () => generateFunnel,
    generateGrowthChart: () => generateGrowthChart,
    generateMobile: () => generateMobile,
    generateNetwork: () => generateNetwork,
    generatePadlock: () => generatePadlock,
    generatePrintedSheets: () => generatePrintedSheets,
    generateWebWindow: () => generateWebWindow
  });
  const GOLD_PALETTE = {
    gold: [0.788, 0.635, 0.294],
    // #C9A24B Rich Gold
    goldBright: [0.91, 0.81, 0.52],
    // #E4C77A Champagne
    goldWarm: [0.98, 0.88, 0.62],
    // Luminous Amber Gold
    white: [1, 1, 1],
    // Diamond Highlight
    navyDeep: [0.12, 0.18, 0.36]
    // Deep Navy #101B3D
  };
  function assignPoint(positions, colors, scales, index, x, y, z, highlightRatio = 0.5, pointScale = 1) {
    const i3 = index * 3;
    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
    const t = Math.max(0, Math.min(1, highlightRatio));
    let r, g, b;
    if (t > 0.65) {
      const k = (t - 0.65) / 0.35;
      r = GOLD_PALETTE.goldBright[0] * (1 - k) + GOLD_PALETTE.white[0] * k;
      g = GOLD_PALETTE.goldBright[1] * (1 - k) + GOLD_PALETTE.white[1] * k;
      b = GOLD_PALETTE.goldBright[2] * (1 - k) + GOLD_PALETTE.white[2] * k;
    } else if (t > 0.25) {
      const k = (t - 0.25) / 0.4;
      r = GOLD_PALETTE.gold[0] * (1 - k) + GOLD_PALETTE.goldBright[0] * k;
      g = GOLD_PALETTE.gold[1] * (1 - k) + GOLD_PALETTE.goldBright[1] * k;
      b = GOLD_PALETTE.gold[2] * (1 - k) + GOLD_PALETTE.goldBright[2] * k;
    } else {
      const k = t / 0.25;
      r = GOLD_PALETTE.navyDeep[0] * (1 - k) + GOLD_PALETTE.gold[0] * k;
      g = GOLD_PALETTE.navyDeep[1] * (1 - k) + GOLD_PALETTE.gold[1] * k;
      b = GOLD_PALETTE.navyDeep[2] * (1 - k) + GOLD_PALETTE.gold[2] * k;
    }
    colors[i3] = r;
    colors[i3 + 1] = g;
    colors[i3 + 2] = b;
    scales[index] = pointScale * (0.85 + Math.random() * 0.3);
  }
  function generateCompass(count) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const role = Math.random();
      let x = 0, y = 0, z = 0, lum = 0.5, pScale = 1;
      if (role < 0.22) {
        const bracketIdx = i % 4;
        const cornerX = bracketIdx === 0 || bracketIdx === 3 ? -1.15 : 1.15;
        const cornerY = bracketIdx === 0 || bracketIdx === 1 ? 1.15 : -1.15;
        const bracketLen = 0.35;
        const isHorizontal = Math.random() < 0.5;
        if (isHorizontal) {
          const sign = cornerX > 0 ? -1 : 1;
          x = cornerX + Math.random() * bracketLen * sign;
          y = cornerY;
        } else {
          const sign = cornerY > 0 ? -1 : 1;
          x = cornerX;
          y = cornerY + Math.random() * bracketLen * sign;
        }
        z = (Math.random() - 0.5) * 0.04;
        lum = 0.98;
        pScale = 1.35;
      } else if (role < 0.44) {
        const theta = Math.random() * Math.PI * 2;
        const ringR = 1.18;
        const isTick = Math.random() < 0.3;
        if (isTick) {
          const tickLen = Math.floor(theta / (Math.PI * 2) * 36) % 9 === 0 ? 0.12 : 0.06;
          const r = ringR - Math.random() * tickLen;
          x = Math.cos(theta) * r;
          y = Math.sin(theta) * r;
          lum = 0.95;
          pScale = 1.2;
        } else {
          x = Math.cos(theta) * ringR;
          y = Math.sin(theta) * ringR;
          lum = 0.75;
        }
        z = (Math.random() - 0.5) * 0.03;
      } else if (role < 0.78) {
        const starRay = Math.floor(Math.random() * 8);
        const angle = starRay * Math.PI / 4;
        const isMajor = starRay % 2 === 0;
        const maxLen = isMajor ? starRay === 2 ? 1.35 : 1.12 : 0.65;
        const t = Math.random();
        const rayLen = t * maxLen;
        const halfWidth = (1 - t) * (isMajor ? 0.14 : 0.08);
        const side = (Math.random() * 2 - 1) * halfWidth;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        const lx = side;
        const ly = rayLen;
        x = lx * cosA - ly * sinA;
        y = lx * sinA + ly * cosA;
        const ridge = (1 - Math.abs(side) / (halfWidth + 1e-3)) * (1 - t * 0.5);
        z = ridge * 0.22;
        lum = isMajor ? starRay === 2 ? 1 : 0.88 : 0.7;
        pScale = isMajor && starRay === 2 ? 1.3 : 1;
      } else if (role < 0.9) {
        const beaconIdx = Math.floor(Math.random() * 4);
        const beaconAngle = beaconIdx * Math.PI / 2;
        const beaconDist = 1.38;
        const bx = Math.cos(beaconAngle) * beaconDist;
        const by = Math.sin(beaconAngle) * beaconDist;
        const dSize = 0.08;
        const dAngle = Math.random() * Math.PI * 2;
        x = bx + Math.cos(dAngle) * dSize * Math.random();
        y = by + Math.sin(dAngle) * dSize * Math.random();
        z = (Math.random() - 0.5) * 0.05;
        lum = 1;
        pScale = 1.4;
      } else {
        const isRing = Math.random() < 0.6;
        if (isRing) {
          const rCore = Math.random() < 0.5 ? 0.35 : 0.16;
          const th = Math.random() * Math.PI * 2;
          x = Math.cos(th) * rCore;
          y = Math.sin(th) * rCore;
        } else {
          const isHoriz = Math.random() < 0.5;
          if (isHoriz) {
            x = (Math.random() * 2 - 1) * 0.45;
            y = (Math.random() - 0.5) * 0.02;
          } else {
            x = (Math.random() - 0.5) * 0.02;
            y = (Math.random() * 2 - 1) * 0.45;
          }
        }
        z = 0.05;
        lum = 0.95;
        pScale = 1.25;
      }
      const j = (Math.random() - 0.5) * 8e-3;
      assignPoint(positions, colors, scales, i, x + j, y + j, z + j, lum, pScale);
    }
    return { positions, colors, scales, count };
  }
  const generateFunnel = generateCompass;
  function generateNetwork(count) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const hubs = [
      [0, 0.05, 0],
      // Central master node
      [-0.85, 0.65, 0.25],
      // Top-left
      [0.85, 0.7, -0.2],
      // Top-right
      [-0.9, -0.55, -0.25],
      // Bottom-left
      [0.8, -0.6, 0.3],
      // Bottom-right
      [0, 1.15, 0.15],
      // High crown node
      [0, -0.95, -0.15],
      // Low root node
      [0.65, 0.15, 0.75],
      // Front-right
      [-0.7, -0.1, 0.7],
      // Front-left
      [0.55, -0.2, -0.8],
      // Back-right
      [-0.6, 0.25, -0.75],
      // Back-left
      [1.15, 0.05, 0]
      // Far right
    ];
    for (let i = 0; i < count; i++) {
      const mode = Math.random();
      let x = 0, y = 0, z = 0, lum = 0.5, pScale = 1;
      if (mode < 0.4) {
        const hubIdx = i % hubs.length;
        const hub = hubs[hubIdx];
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const r = 0.06 + Math.random() * 0.08;
        x = hub[0] + r * Math.sin(phi) * Math.cos(theta);
        y = hub[1] + r * Math.cos(phi);
        z = hub[2] + r * Math.sin(phi) * Math.sin(theta);
        lum = 0.95;
        pScale = 1.4;
      } else if (mode < 0.78) {
        const h1Idx = i % hubs.length;
        const h2Idx = (i * 5 + 1) % hubs.length;
        const h1 = hubs[h1Idx];
        const h2 = hubs[h2Idx];
        const t = Math.random();
        const jitter = (Math.random() - 0.5) * 0.02;
        x = h1[0] * (1 - t) + h2[0] * t + jitter;
        y = h1[1] * (1 - t) + h2[1] * t + jitter;
        z = h1[2] * (1 - t) + h2[2] * t + jitter;
        lum = 0.55 + 0.4 * Math.sin(t * Math.PI);
        pScale = 0.9;
      } else {
        const isSecondRing = i % 2 === 0;
        const ringRadius = 1.35;
        const theta = Math.random() * Math.PI * 2;
        const tilt = isSecondRing ? Math.PI / 4 : -Math.PI / 4;
        const rx = Math.cos(theta) * ringRadius;
        const rz = Math.sin(theta) * ringRadius;
        x = rx * Math.cos(tilt) - rz * Math.sin(tilt);
        y = isSecondRing ? Math.sin(theta * 2) * 0.12 : -Math.sin(theta * 2) * 0.12;
        z = rx * Math.sin(tilt) + rz * Math.cos(tilt);
        lum = 0.85;
        pScale = 1.15;
      }
      assignPoint(positions, colors, scales, i, x, y, z, lum, pScale);
    }
    return { positions, colors, scales, count };
  }
  function generatePrintedSheets(count) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const numSheets = 3;
    const pointsPerSheet = Math.floor(count / numSheets);
    for (let s = 0; s < numSheets; s++) {
      const sheetZ = (s - 1) * 0.28;
      const sheetRot = (s - 1) * 0.15;
      const cosR = Math.cos(sheetRot);
      const sinR = Math.sin(sheetRot);
      const startIdx = s * pointsPerSheet;
      const endIdx = s === numSheets - 1 ? count : startIdx + pointsPerSheet;
      for (let i = startIdx; i < endIdx; i++) {
        const mode = Math.random();
        let u = 0, v = 0, isBorder = false, isLine = false;
        if (mode < 0.35) {
          isBorder = true;
          const edge = Math.random() * 4;
          if (edge < 1) {
            u = Math.random() * 2 - 1;
            v = 1;
          } else if (edge < 2) {
            u = Math.random() * 2 - 1;
            v = -1;
          } else if (edge < 3) {
            u = -1;
            v = Math.random() * 2 - 1;
          } else {
            u = 1;
            v = Math.random() * 2 - 1;
          }
        } else if (mode < 0.7) {
          isLine = true;
          const lineIdx = Math.floor(Math.random() * 8);
          v = 0.65 - lineIdx * 0.18;
          u = -0.75 + Math.random() * 1.5;
        } else {
          u = (Math.random() * 2 - 1) * 0.55;
          v = 0.82 + (Math.random() - 0.5) * 0.08;
          isBorder = true;
        }
        const localX = u * 0.72;
        const localY = v * 1.02;
        let localZ = 0;
        if (s === 2 && u > 0.55 && v < -0.55) {
          const curl = Math.hypot(u - 0.55, v + 0.55);
          localZ += curl * 0.32;
        }
        const rx = localX * cosR - localZ * sinR;
        const rz = localX * sinR + localZ * cosR + sheetZ;
        const ry = localY;
        const lum = isBorder ? 0.98 : isLine ? 0.82 : 0.6;
        const pScale = isBorder ? 1.25 : 0.95;
        const j = (Math.random() - 0.5) * 0.01;
        assignPoint(positions, colors, scales, i, rx + j, ry + j, rz + j, lum, pScale);
      }
    }
    return { positions, colors, scales, count };
  }
  function generateWebWindow(count) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const w = 1.18;
    const h = 0.85;
    for (let i = 0; i < count; i++) {
      const role = Math.random();
      let x = 0, y = 0, z = 0, lum = 0.5, pScale = 1;
      if (role < 0.35) {
        const edge = Math.random() * 4;
        if (edge < 1) {
          x = (Math.random() * 2 - 1) * w;
          y = h;
        } else if (edge < 2) {
          x = (Math.random() * 2 - 1) * w;
          y = -h;
        } else if (edge < 3) {
          x = -w;
          y = (Math.random() * 2 - 1) * h;
        } else {
          x = w;
          y = (Math.random() * 2 - 1) * h;
        }
        z = (Math.random() - 0.5) * 0.03;
        lum = 0.98;
        pScale = 1.3;
      } else if (role < 0.45) {
        x = (Math.random() * 2 - 1) * w;
        y = 0.62;
        z = 0.01;
        lum = 0.92;
      } else if (role < 0.55) {
        const dotIdx = Math.floor(Math.random() * 3);
        const dotX = -0.92 + dotIdx * 0.12;
        const angle = Math.random() * Math.PI * 2;
        const rad = Math.random() * 0.035;
        x = dotX + Math.cos(angle) * rad;
        y = 0.74 + Math.sin(angle) * rad;
        z = 0.02;
        lum = dotIdx === 0 ? 1 : 0.85;
        pScale = 1.4;
      } else if (role < 0.68) {
        const pw = 0.45;
        const ph = 0.055;
        const py = 0.74;
        const edge = Math.random() * 4;
        if (edge < 1) {
          x = -0.15 + (Math.random() * 2 - 1) * pw;
          y = py + ph;
        } else if (edge < 2) {
          x = -0.15 + (Math.random() * 2 - 1) * pw;
          y = py - ph;
        } else if (edge < 3) {
          x = -0.15 - pw;
          y = py + (Math.random() * 2 - 1) * ph;
        } else {
          x = -0.15 + pw;
          y = py + (Math.random() * 2 - 1) * ph;
        }
        z = 0.02;
        lum = 0.9;
      } else {
        const cardIdx = Math.floor(Math.random() * 3);
        const cardCenterX = -0.68 + cardIdx * 0.68;
        const cw = 0.26;
        const ch = 0.4;
        const cCenterY = -0.15;
        const edge = Math.random() * 4;
        if (edge < 1) {
          x = cardCenterX + (Math.random() * 2 - 1) * cw;
          y = cCenterY + ch;
        } else if (edge < 2) {
          x = cardCenterX + (Math.random() * 2 - 1) * cw;
          y = cCenterY - ch;
        } else if (edge < 3) {
          x = cardCenterX - cw;
          y = cCenterY + (Math.random() * 2 - 1) * ch;
        } else {
          x = cardCenterX + cw;
          y = cCenterY + (Math.random() * 2 - 1) * ch;
        }
        z = 0.03;
        lum = 0.85;
        pScale = 1.1;
      }
      const j = (Math.random() - 0.5) * 8e-3;
      assignPoint(positions, colors, scales, i, x + j, y + j, z, lum, pScale);
    }
    return { positions, colors, scales, count };
  }
  function generateMobile(count) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const hw = 0.46;
    const hh = 0.96;
    const cr = 0.12;
    for (let i = 0; i < count; i++) {
      const role = Math.random();
      let x = 0, y = 0, z = 0, lum = 0.5, pScale = 1;
      if (role < 0.42) {
        const side = Math.random() * 4;
        const zDepth = (Math.random() - 0.5) * 0.1;
        if (side < 1) {
          x = (Math.random() * 2 - 1) * (hw - cr);
          y = hh;
        } else if (side < 2) {
          x = (Math.random() * 2 - 1) * (hw - cr);
          y = -hh;
        } else if (side < 3) {
          x = -hw;
          y = (Math.random() * 2 - 1) * (hh - cr);
        } else {
          x = hw;
          y = (Math.random() * 2 - 1) * (hh - cr);
        }
        z = zDepth;
        lum = 0.98;
        pScale = 1.3;
      } else if (role < 0.55) {
        const pillW = 0.12;
        const pillH = 0.03;
        const edge = Math.random() * 4;
        if (edge < 1) {
          x = (Math.random() * 2 - 1) * pillW;
          y = 0.8 + pillH;
        } else if (edge < 2) {
          x = (Math.random() * 2 - 1) * pillW;
          y = 0.8 - pillH;
        } else if (edge < 3) {
          x = -pillW;
          y = 0.8 + (Math.random() * 2 - 1) * pillH;
        } else {
          x = pillW;
          y = 0.8 + (Math.random() * 2 - 1) * pillH;
        }
        z = 0.05;
        lum = 1;
        pScale = 1.4;
      } else if (role < 0.65) {
        x = (Math.random() * 2 - 1) * 0.18;
        y = -0.86 + (Math.random() - 0.5) * 0.015;
        z = 0.05;
        lum = 0.95;
      } else {
        const row = Math.floor(Math.random() * 4);
        const col = Math.floor(Math.random() * 3);
        const iconX = -0.26 + col * 0.26;
        const iconY = 0.52 - row * 0.26;
        const iconSize = 0.06;
        const edge = Math.random() * 4;
        if (edge < 1) {
          x = iconX + (Math.random() * 2 - 1) * iconSize;
          y = iconY + iconSize;
        } else if (edge < 2) {
          x = iconX + (Math.random() * 2 - 1) * iconSize;
          y = iconY - iconSize;
        } else if (edge < 3) {
          x = iconX - iconSize;
          y = iconY + (Math.random() * 2 - 1) * iconSize;
        } else {
          x = iconX + iconSize;
          y = iconY + (Math.random() * 2 - 1) * iconSize;
        }
        z = 0.05;
        lum = 0.88;
        pScale = 1.1;
      }
      const j = (Math.random() - 0.5) * 8e-3;
      assignPoint(positions, colors, scales, i, x + j, y + j, z + j, lum, pScale);
    }
    return { positions, colors, scales, count };
  }
  function generateGrowthChart(count) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const numBars = 7;
    const barW = 0.18;
    const barD = 0.14;
    const barHeights = [0.42, 0.6, 0.78, 0.98, 1.18, 1.38, 1.58];
    const barSpacing = 0.32;
    const startX = -0.96;
    const arrowWaypoints = [
      [-1.2, -0.22],
      // Start bottom-left
      [-0.95, 0],
      // Climb above bar 0
      [-0.68, 0],
      // Plateau above bar 1
      [-0.28, 0.44],
      // Climb above bar 2-3
      [0.02, 0.34],
      // Consolidation dip above bar 3-4
      [0.48, 0.96]
      // Steep surge into arrowhead entry
    ];
    const segmentLengths = [];
    let totalShaftLen = 0;
    for (let s = 0; s < arrowWaypoints.length - 1; s++) {
      const dx = arrowWaypoints[s + 1][0] - arrowWaypoints[s][0];
      const dy = arrowWaypoints[s + 1][1] - arrowWaypoints[s][1];
      const len = Math.hypot(dx, dy);
      segmentLengths.push(len);
      totalShaftLen += len;
    }
    const sampleShaftPoint = (t, isUpperEdge, thickness = 0.045) => {
      let targetDist = t * totalShaftLen;
      let segIdx = 0;
      while (segIdx < segmentLengths.length - 1 && targetDist > segmentLengths[segIdx]) {
        targetDist -= segmentLengths[segIdx];
        segIdx++;
      }
      const segFrac = Math.max(0, Math.min(1, targetDist / segmentLengths[segIdx]));
      const pA = arrowWaypoints[segIdx];
      const pB = arrowWaypoints[segIdx + 1];
      const cx = pA[0] * (1 - segFrac) + pB[0] * segFrac;
      const cy = pA[1] * (1 - segFrac) + pB[1] * segFrac;
      const dx = pB[0] - pA[0];
      const dy = pB[1] - pA[1];
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const sign = isUpperEdge ? 1 : -1;
      return [cx + nx * (thickness / 2) * sign, cy + ny * (thickness / 2) * sign];
    };
    for (let i = 0; i < count; i++) {
      const role = Math.random();
      let x = 0, y = 0, z = 0, lum = 0.5, pScale = 1;
      if (role < 0.52) {
        const bIdx = Math.floor(Math.random() * numBars);
        const bh = barHeights[bIdx];
        const bx = startX + bIdx * barSpacing;
        const part = Math.random();
        if (part < 0.28) {
          const edge = Math.floor(Math.random() * 4);
          const u = (Math.random() * 2 - 1) * (barW / 2);
          if (edge === 0) {
            x = bx + u;
            y = -0.95 + bh;
            z = barD / 2;
          } else if (edge === 1) {
            x = bx + u;
            y = -0.95 + bh;
            z = -barD / 2;
          } else if (edge === 2) {
            x = bx - barW / 2;
            y = -0.95 + bh;
            z = u * (barD / barW);
          } else {
            x = bx + barW / 2;
            y = -0.95 + bh;
            z = u * (barD / barW);
          }
          lum = 0.98;
          pScale = 1.25;
        } else {
          const isCorner = Math.random() < 0.65;
          const corner = Math.floor(Math.random() * 4);
          const cx = corner === 0 || corner === 1 ? -barW / 2 : barW / 2;
          const cz = corner === 0 || corner === 3 ? barD / 2 : -barD / 2;
          x = bx + cx + (Math.random() - 0.5) * 0.01;
          y = -0.95 + Math.random() * bh;
          z = cz + (Math.random() - 0.5) * 0.01;
          lum = isCorner ? 0.6 + 0.38 * ((y + 0.95) / bh) : 0.45;
          pScale = isCorner ? 1.15 : 0.9;
        }
      } else if (role < 0.88) {
        const arrowPart = Math.random();
        if (arrowPart < 0.55) {
          const t = Math.random();
          const isUpper = Math.random() < 0.5;
          const [sx, sy] = sampleShaftPoint(t, isUpper, 0.05);
          x = sx + (Math.random() - 0.5) * 8e-3;
          y = sy + (Math.random() - 0.5) * 8e-3;
          z = 0.16 + (Math.random() - 0.5) * 0.02;
          lum = 0.95;
          pScale = 1.2;
        } else {
          const arrowSub = Math.random();
          if (arrowSub < 0.45) {
            const k = Math.random();
            x = 0.78 * (1 - k) + 0.38 * k;
            y = 1.38 * (1 - k) + 1.2 * k;
            lum = 1;
            pScale = 1.45;
          } else if (arrowSub < 0.8) {
            const k = Math.random();
            x = 0.78 * (1 - k) + 0.66 * k;
            y = 1.38 * (1 - k) + 0.88 * k;
            lum = 1;
            pScale = 1.45;
          } else {
            const isLeftNotch = Math.random() < 0.5;
            const k = Math.random();
            if (isLeftNotch) {
              x = 0.38 * (1 - k) + 0.48 * k;
              y = 1.2 * (1 - k) + 0.96 * k;
            } else {
              x = 0.66 * (1 - k) + 0.48 * k;
              y = 0.88 * (1 - k) + 0.96 * k;
            }
            lum = 0.92;
            pScale = 1.25;
          }
          z = 0.18 + (Math.random() - 0.5) * 0.02;
        }
      } else {
        x = (Math.random() * 2 - 1) * 1.3;
        y = -0.95;
        z = (Math.random() * 2 - 1) * 0.2;
        lum = 0.42;
        pScale = 0.85;
      }
      const j = (Math.random() - 0.5) * 8e-3;
      assignPoint(positions, colors, scales, i, x + j, y + j, z + j, lum, pScale);
    }
    return { positions, colors, scales, count };
  }
  function generatePadlock(count) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const bw = 0.44;
    const bh = 0.38;
    const bd = 0.16;
    for (let i = 0; i < count; i++) {
      const role = Math.random();
      let x = 0, y = 0, z = 0, lum = 0.5, pScale = 1;
      if (role < 0.42) {
        const padPart = Math.random();
        if (padPart < 0.45) {
          const edge = Math.random() * 6;
          if (edge < 1) {
            x = (Math.random() * 2 - 1) * bw;
            y = -0.32 + bh;
            z = (Math.random() * 2 - 1) * bd;
          } else if (edge < 2) {
            x = (Math.random() * 2 - 1) * bw;
            y = -0.32 - bh;
            z = (Math.random() * 2 - 1) * bd;
          } else if (edge < 3) {
            x = -bw;
            y = -0.32 + (Math.random() * 2 - 1) * bh;
            z = (Math.random() * 2 - 1) * bd;
          } else if (edge < 4) {
            x = bw;
            y = -0.32 + (Math.random() * 2 - 1) * bh;
            z = (Math.random() * 2 - 1) * bd;
          } else {
            x = (Math.random() * 2 - 1) * bw;
            y = -0.32 + (Math.random() * 2 - 1) * bh;
            z = (edge < 5 ? 1 : -1) * bd;
          }
          lum = 0.65;
        } else if (padPart < 0.85) {
          const shackleR = 0.28;
          const tubeR = 0.06;
          const t = Math.random();
          if (t < 0.6) {
            const angle = Math.random() * Math.PI;
            const tubeA = Math.random() * Math.PI * 2;
            x = Math.cos(angle) * shackleR + Math.cos(tubeA) * tubeR;
            y = 0.06 + Math.sin(angle) * shackleR + Math.sin(tubeA) * tubeR;
            z = Math.sin(tubeA) * tubeR;
          } else {
            const isLeft = Math.random() < 0.5;
            const legX = isLeft ? -shackleR : shackleR;
            const tubeA = Math.random() * Math.PI * 2;
            x = legX + Math.cos(tubeA) * tubeR;
            y = -0.32 + bh - Math.random() * 0.28;
            z = Math.sin(tubeA) * tubeR;
          }
          lum = 0.98;
          pScale = 1.3;
        } else {
          const isCircle = Math.random() < 0.55;
          if (isCircle) {
            const angle = Math.random() * Math.PI * 2;
            const r = 0.07;
            x = Math.cos(angle) * r;
            y = -0.24 + Math.sin(angle) * r;
            z = bd + 0.02;
          } else {
            const slotH = Math.random();
            const slotW = 0.025 + (1 - slotH) * 0.035;
            x = (Math.random() * 2 - 1) * slotW;
            y = -0.28 - slotH * 0.12;
            z = bd + 0.02;
          }
          lum = 1;
          pScale = 1.5;
        }
      } else {
        const isRightKnight = role >= 0.71;
        const kX = isRightKnight ? 1.15 : -1.15;
        const sideSign = isRightKnight ? 1 : -1;
        const knightPart = Math.random();
        if (knightPart < 0.24) {
          const helmH = Math.random();
          if (helmH < 0.55) {
            const th = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const rHelm = 0.13;
            x = kX + Math.sin(phi) * Math.cos(th) * rHelm;
            y = 0.42 + Math.cos(phi) * rHelm;
            z = Math.sin(phi) * Math.sin(th) * rHelm;
            lum = 0.9;
          } else if (helmH < 0.8) {
            x = kX + (Math.random() * 2 - 1) * 0.1;
            y = 0.38 + (Math.random() - 0.5) * 0.015;
            z = 0.13;
            lum = 1;
            pScale = 1.4;
          } else {
            const pT = Math.random();
            x = kX - sideSign * pT * 0.08;
            y = 0.52 + Math.sin(pT * Math.PI) * 0.18;
            z = -pT * 0.1;
            lum = 0.98;
            pScale = 1.25;
          }
        } else if (knightPart < 0.48) {
          const torsoPart = Math.random();
          if (torsoPart < 0.45) {
            const isOuterShoulder = Math.random() < 0.5;
            const sX = isOuterShoulder ? kX + sideSign * 0.22 : kX - sideSign * 0.18;
            const pTheta = Math.random() * Math.PI;
            x = sX + Math.cos(pTheta) * 0.1;
            y = 0.26 + Math.sin(pTheta) * 0.08;
            z = (Math.random() - 0.5) * 0.16;
            lum = 0.92;
            pScale = 1.2;
          } else {
            const ty = Math.random();
            const chestW = 0.1 + ty * 0.12;
            x = kX + (Math.random() * 2 - 1) * chestW;
            y = 0 + ty * 0.28;
            z = (Math.random() * 2 - 1) * 0.12;
            lum = 0.8;
          }
        } else if (knightPart < 0.76) {
          const shieldCenterX = kX + sideSign * 0.18;
          const sT = Math.random();
          const shieldTopY = 0.26;
          const shieldBottomY = -0.45;
          const curY = shieldTopY - sT * (shieldTopY - shieldBottomY);
          const maxShieldW = 0.18;
          const curShieldW = sT < 0.35 ? maxShieldW : maxShieldW * (1 - (sT - 0.35) / 0.65);
          const onBorder = Math.random() < 0.4;
          if (onBorder) {
            const signEdge = Math.random() < 0.5 ? 1 : -1;
            x = shieldCenterX + signEdge * curShieldW;
            y = curY;
            lum = 0.98;
            pScale = 1.3;
          } else {
            const isCrossH = Math.random() < 0.5;
            if (isCrossH && Math.abs(curY - 0.05) < 0.04) {
              x = shieldCenterX + (Math.random() * 2 - 1) * curShieldW * 0.8;
              y = 0.05;
              lum = 1;
              pScale = 1.4;
            } else if (!isCrossH && Math.abs(curY - 0.05) < 0.25) {
              x = shieldCenterX;
              y = curY;
              lum = 1;
              pScale = 1.4;
            } else {
              x = shieldCenterX + (Math.random() * 2 - 1) * curShieldW;
              y = curY;
              lum = 0.7;
            }
          }
          z = 0.18 + (Math.random() - 0.5) * 0.04;
        } else if (knightPart < 0.9) {
          const weaponX = kX - sideSign * 0.14;
          const isBlade = Math.random() < 0.75;
          if (isBlade) {
            x = weaponX + (Math.random() - 0.5) * 0.02;
            y = -0.55 + Math.random() * 1.45;
            z = 0.15;
            lum = 0.96;
            pScale = 1.25;
          } else {
            x = weaponX + (Math.random() * 2 - 1) * 0.1;
            y = 0.1 + (Math.random() - 0.5) * 0.02;
            z = 0.15;
            lum = 1;
            pScale = 1.35;
          }
        } else {
          const isLeftLeg = Math.random() < 0.5;
          const legX = isLeftLeg ? kX - 0.08 : kX + 0.08;
          x = legX + (Math.random() - 0.5) * 0.05;
          y = -0.88 + Math.random() * 0.88;
          z = (Math.random() - 0.5) * 0.08;
          lum = 0.65;
        }
      }
      const j = (Math.random() - 0.5) * 8e-3;
      assignPoint(positions, colors, scales, i, x + j, y + j, z + j, lum, pScale);
    }
    return { positions, colors, scales, count };
  }
  return __toCommonJS(shapes_only_exports);
})();
