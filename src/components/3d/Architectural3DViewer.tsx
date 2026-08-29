import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Box,
  Eye,
  Sun,
  Moon,
  Layers,
  Sparkles,
  PaintBucket,
} from 'lucide-react';
import {
  QualityTier,
  HouseType,
  ParkingTypeOption,
  RoomCounts,
  CityLocation,
  MaterialBrandSelection,
} from '../../store/useWizardStore';
import {
  DoorSelection,
  WindowSelection,
  PaintingSelection,
  ZoneFlooringSelection,
  WallCladdingSelection,
  ElectricalSelection,
  BathroomFittingSelection,
} from '../../calculation-engine/types';

interface Architectural3DViewerProps {
  city?: CityLocation | null;
  plotLength: number;
  plotWidth: number;
  floors: number;
  parkingType?: ParkingTypeOption | null;
  carCount?: number;
  bikeCount?: number;
  evCharging?: boolean;
  liftRequired?: boolean;
  houseType?: HouseType | null;
  qualityTier?: QualityTier;
  rooms?: RoomCounts;
  materialBrands?: MaterialBrandSelection;
  flooringZones?: ZoneFlooringSelection;
  wallCladding?: WallCladdingSelection;
  doors?: DoorSelection;
  windows?: WindowSelection;
  electrical?: ElectricalSelection;
  bathroomFittings?: BathroomFittingSelection;
  painting?: PaintingSelection;
  className?: string;
}

export const Architectural3DViewer: React.FC<Architectural3DViewerProps> = ({
  city = 'Bangalore',
  plotLength,
  plotWidth,
  floors,
  parkingType,
  carCount = 1,
  evCharging = false,
  liftRequired = false,
  houseType,
  qualityTier = 'Premium',
  rooms,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const buildingGroupRef = useRef<THREE.Group | null>(null);
  const floorGroupsRef = useRef<THREE.Group[]>([]);
  const animationFrameId = useRef<number | null>(null);

  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  const [isExplodedView, setIsExplodedView] = useState(false);
  const [isPaintedMode, setIsPaintedMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.28, y: -0.75 });

  const numFloors = Math.max(1, Math.min(5, floors || 1));
  const isStilt = parkingType === 'Stilt';
  const hasLift = liftRequired || numFloors >= 4;
  const balconyCount = Math.max(0, rooms?.balcony ?? (numFloors > 1 ? 1 : 0));

  const pLength = Math.max(15, plotLength || 40);
  const pWidth = Math.max(15, plotWidth || 30);
  const plotAspect = Math.max(0.4, Math.min(2.5, pWidth / pLength));

  // ── Procedural concrete texture generator ──────────────────────────────────
  const makeConcreteTexture = (
    size: number,
    baseR: number,
    baseG: number,
    baseB: number,
    variance: number
  ): THREE.DataTexture => {
    const data = new Uint8Array(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      const x = i % size;
      const y = Math.floor(i / size);
      const n1 = Math.sin(x * 0.31 + y * 0.47) * 0.5 + 0.5;
      const n2 = Math.sin(x * 0.87 - y * 0.23 + 1.3) * 0.5 + 0.5;
      const n3 = Math.sin(x * 0.13 + y * 0.91 - 2.1) * 0.5 + 0.5;
      const noise = (n1 * 0.5 + n2 * 0.3 + n3 * 0.2) * variance - variance * 0.5;
      const idx = i * 4;
      data[idx]     = Math.max(0, Math.min(255, Math.round(baseR + noise)));
      data[idx + 1] = Math.max(0, Math.min(255, Math.round(baseG + noise)));
      data[idx + 2] = Math.max(0, Math.min(255, Math.round(baseB + noise)));
      data[idx + 3] = 255;
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2.5, 2.5);
    tex.needsUpdate = true;
    return tex;
  };

  // ── Procedural brick texture generator ───────────────────────────────────────
  // Generates a terracotta brick pattern with mortar joints using pixel math
  const makeBrickTexture = (size: number): THREE.DataTexture => {
    const data = new Uint8Array(size * size * 4);
    const brickW = Math.round(size / 6);  // ~6 bricks wide
    const brickH = Math.round(size / 12); // ~12 rows tall
    const mortarT = 2; // mortar thickness in px
    for (let i = 0; i < size * size; i++) {
      const px = i % size;
      const py = Math.floor(i / size);
      const row = Math.floor(py / brickH);
      const offset = (row % 2) * Math.round(brickW / 2); // stagger alternate rows
      const col = Math.floor((px + offset) % brickW);
      const inMortarX = col < mortarT || col >= brickW - mortarT;
      const inMortarY = (py % brickH) < mortarT;
      const idx = i * 4;
      if (inMortarX || inMortarY) {
        // Mortar – pale sandy grey
        const m = 195 + (Math.random() * 12 - 6);
        data[idx] = m; data[idx+1] = m - 2; data[idx+2] = m - 5; data[idx+3] = 255;
      } else {
        // Brick body – warm terracotta with variation
        const noise = Math.sin(px * 0.7 + py * 1.3) * 14;
        data[idx]   = Math.min(255, Math.round(178 + noise));  // R – terracotta
        data[idx+1] = Math.min(255, Math.round(88  + noise * 0.5)); // G
        data[idx+2] = Math.min(255, Math.round(52  + noise * 0.3)); // B
        data[idx+3] = 255;
      }
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 2);
    tex.needsUpdate = true;
    return tex;
  };

  // ── Weathering / rust streak texture (tall thin drip lines) ──────────────────
  const makeStreakTexture = (size: number): THREE.DataTexture => {
    const data = new Uint8Array(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      const px = i % size;
      const py = Math.floor(i / size);
      // Vertical drip streaks – only show near random x columns
      const streakSeed = Math.sin(px * 2.71) * 0.5 + 0.5;
      const isStreak = streakSeed > 0.82; // ~18% of columns get a streak
      // Streaks stronger towards the bottom (py near size)
      const fadeDown = py / size;
      const alpha = isStreak ? Math.round(fadeDown * 110 * (streakSeed - 0.82) / 0.18) : 0;
      const idx = i * 4;
      // Dark brown-grey stain colour
      data[idx]   = 80; data[idx+1] = 68; data[idx+2] = 60; data[idx+3] = Math.min(255, alpha);
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1.5, 1.0);
    tex.needsUpdate = true;
    return tex;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    // Soft overcast sky background – concrete looks best against a cool grey sky
    scene.background = new THREE.Color(isNightMode ? 0x0E1E1A : 0xD8D8D2);
    scene.fog = isNightMode
      ? new THREE.Fog(0x0E1E1A, 18, 50)
      : new THREE.Fog(0xD8D8D2, 24, 60);
    sceneRef.current = scene;

    const floorH = 1.55;
    const explodedGap = isExplodedView ? 1.05 : 0;
    const totalBuildingH = numFloors * (floorH + explodedGap);
    const centerY = totalBuildingH / 2 + 0.2;
    const cameraDistZ = (11.8 + (numFloors - 1) * 1.3 + (isExplodedView ? 2.5 : 0) + Math.max(0, (plotAspect - 1) * 1.8)) / zoomLevel;
    const cameraDistY = (centerY + 3.0 + (isExplodedView ? 1.5 : 0)) / zoomLevel;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 140);
    camera.position.set(0, cameraDistY, cameraDistZ);
    camera.lookAt(0, centerY, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Tone mapping for a more realistic concrete render
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isNightMode ? 0.8 : 1.1;
    rendererRef.current = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // ── Lighting ─────────────────────────────────────────────────────────────
    if (isNightMode) {
      scene.add(new THREE.AmbientLight(0x1B3D34, 0.9));
      const moonLight = new THREE.DirectionalLight(0xC8D4E0, 1.0);
      moonLight.position.set(-8, 15, -10);
      moonLight.castShadow = true;
      scene.add(moonLight);
      const warmGlow = new THREE.PointLight(0xF28C28, 2.5, 14);
      warmGlow.position.set(0, 2.5, 3.5);
      scene.add(warmGlow);
    } else {
      // Overcast diffuse sky – flatters concrete beautifully
      scene.add(new THREE.AmbientLight(0xD0D8E0, 1.05));
      // Key sun – slightly warm, angled hard light to cast shadows into surface texture
      const sunLight = new THREE.DirectionalLight(0xFFF5E0, 1.6);
      sunLight.position.set(10, 22, 12);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.bias = -0.0005;
      scene.add(sunLight);
      // Cool sky fill from opposite direction
      const fillLight = new THREE.DirectionalLight(0xC5D4E0, 0.55);
      fillLight.position.set(-10, 8, -8);
      scene.add(fillLight);
      // Ground bounce – warm light reflected off concrete ground
      const bounceLight = new THREE.DirectionalLight(0xEEE8D8, 0.3);
      bounceLight.position.set(0, -5, 0);
      scene.add(bounceLight);
    }

    const buildingGroup = new THREE.Group();
    buildingGroupRef.current = buildingGroup;
    scene.add(buildingGroup);

    // ── Procedural textures ───────────────────────────────────────────────────
    // Wall concrete: medium grey with visible aggregate noise
    const wallTex  = makeConcreteTexture(128, isNightMode ? 48 : 185, isNightMode ? 56 : 183, isNightMode ? 52 : 179, isNightMode ? 28 : 38);
    // Slab concrete: slightly darker, more aggregate
    const slabTex  = makeConcreteTexture(128, isNightMode ? 38 : 158, isNightMode ? 44 : 156, isNightMode ? 40 : 152, 32);
    // Ground: sandy concrete
    const groundTex = makeConcreteTexture(256, isNightMode ? 22 : 195, isNightMode ? 32 : 192, isNightMode ? 28 : 186, 24);
    // Rough bump data (same noise, used as roughnessMap tint)
    const bumpTex  = makeConcreteTexture(128, 128, 128, 128, 60);
    // Brick texture for ground-floor plinth
    const brickTex = makeBrickTexture(256);
    // Weathering streak texture for below window sills
    const streakTex = makeStreakTexture(64);

    // ── Materials ─────────────────────────────────────────────────────────────
    // Exposed concrete facade – the star of the show
    const facadeMat = new THREE.MeshStandardMaterial({
      map: wallTex,
      roughnessMap: bumpTex,
      roughness: isNightMode ? 0.82 : 0.78,
      metalness: 0.0,
    });

    // ── Paint wash mode: warm plaster finish ─────────────────────────────────
    // Replaces raw concrete with a smooth painted plaster surface
    const plasterTex = makeConcreteTexture(128, isNightMode ? 200 : 240, isNightMode ? 195 : 234, isNightMode ? 185 : 222, isNightMode ? 12 : 10);
    const paintedFacadeMat = new THREE.MeshStandardMaterial({
      map: plasterTex,
      roughness: isNightMode ? 0.60 : 0.50, // smoother than bare concrete
      metalness: 0.0,
    });

    // Active wall material switches on paint mode
    const activeFacadeMat = isPaintedMode ? paintedFacadeMat : facadeMat;

    // Slightly darker concrete for structural columns / fins
    const concreteDarkTex = makeConcreteTexture(128, isNightMode ? 36 : 148, isNightMode ? 40 : 146, isNightMode ? 38 : 142, 28);
    const accentMat = new THREE.MeshStandardMaterial({
      map: isPaintedMode ? makeConcreteTexture(128, isNightMode ? 185 : 225, isNightMode ? 178 : 218, isNightMode ? 168 : 205, 8) : concreteDarkTex,
      roughness: isPaintedMode ? 0.55 : 0.85,
      metalness: 0.0,
    });

    // Flat concrete slab (slightly lighter, smoother surface)
    const slabMat = new THREE.MeshStandardMaterial({
      map: slabTex,
      roughness: isNightMode ? 0.75 : 0.70,
      metalness: 0.0,
    });

    // Ground-floor plinth – exposed brick (terracotta)
    const brickMat = new THREE.MeshStandardMaterial({
      map: brickTex,
      roughness: 0.88,
      metalness: 0.0,
    });

    // Weathering / rain-streak overlay plane material
    const streakMat = new THREE.MeshStandardMaterial({
      map: streakTex,
      transparent: true,
      opacity: isPaintedMode ? 0.12 : 0.22, // less visible on painted surfaces
      roughness: 1.0,
      metalness: 0.0,
      depthWrite: false,
    });

    // Wooden/steel door – keep dark charcoal
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x3A3F48, roughness: 0.6, metalness: 0.2 });

    // Window frame – dark anodised aluminium
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x2A2E35, roughness: 0.35, metalness: 0.65 });

    // Glass panels
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: isNightMode ? 0xFFB347 : 0x7BAFC8,
      transparent: true,
      opacity: isNightMode ? 0.82 : 0.38,
      roughness: 0.04,
      metalness: 0.15,
      envMapIntensity: 1.2,
    });

    // Balcony railings – steel
    const railingMat = new THREE.MeshStandardMaterial({ color: 0x3A3F48, metalness: 0.85, roughness: 0.15 });

    // Ground material
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.92,
      metalness: 0.0,
    });

    // Fake AO – soft shadow quad that sits just above the ground around wall bases
    const bWidth = 4.8 * Math.max(0.85, Math.min(1.3, plotAspect));
    const bDepth = 4.0 / Math.max(0.85, Math.min(1.3, plotAspect));
    const aoGeo = new THREE.PlaneGeometry(bWidth + 0.6, bDepth + 0.6);
    const aoMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    });
    const aoPlane = new THREE.Mesh(aoGeo, aoMat);
    aoPlane.rotation.x = -Math.PI / 2;
    aoPlane.position.set(0, 0.01, 0);
    buildingGroup.add(aoPlane);

    // Site Landscaping & Baseplate
    const groundW = 9.8 * Math.max(0.85, plotAspect);
    const groundD = 9.2 / Math.max(0.85, plotAspect);
    const groundGeo = new THREE.BoxGeometry(groundW, 0.15, groundD);
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.075;
    ground.receiveShadow = true;
    buildingGroup.add(ground);

    // Paved Pathway – smooth poured concrete
    const paveTex = makeConcreteTexture(128, isNightMode ? 30 : 168, isNightMode ? 36 : 165, isNightMode ? 33 : 160, 20);
    const paveMat = new THREE.MeshStandardMaterial({ map: paveTex, roughness: 0.65, metalness: 0.0 });
    const paveW = 4.2 * Math.max(0.85, plotAspect);
    const paveD = groundD - 0.6;
    const paveGeo = new THREE.BoxGeometry(paveW, 0.16, paveD);
    const pave = new THREE.Mesh(paveGeo, paveMat);
    pave.position.set(1.4, -0.065, 0);
    pave.receiveShadow = true;
    buildingGroup.add(pave);

    // Municipal Plot Boundary Line
    const boundaryGeo = new THREE.BufferGeometry();
    const bxLine = (groundW - 0.8) / 2;
    const bzLine = (groundD - 0.8) / 2;
    const boundaryPoints = [
      new THREE.Vector3(-bxLine, 0.02, -bzLine),
      new THREE.Vector3(bxLine, 0.02, -bzLine),
      new THREE.Vector3(bxLine, 0.02, bzLine),
      new THREE.Vector3(-bxLine, 0.02, bzLine),
      new THREE.Vector3(-bxLine, 0.02, -bzLine),
    ];
    boundaryGeo.setFromPoints(boundaryPoints);
    const boundaryMat = new THREE.LineDashedMaterial({ color: 0x1B3D34, dashSize: 0.35, gapSize: 0.18 });
    const boundaryLine = new THREE.Line(boundaryGeo, boundaryMat);
    boundaryLine.computeLineDistances();
    buildingGroup.add(boundaryLine);

    // Setback Footprint Dashed Guide on Ground
    const footprintGeo = new THREE.BufferGeometry();
    const fx = bWidth / 2 + 0.15;
    const fz = bDepth / 2 + 0.15;
    const footprintPoints = [
      new THREE.Vector3(-fx, 0.025, -fz),
      new THREE.Vector3(fx, 0.025, -fz),
      new THREE.Vector3(fx, 0.025, fz),
      new THREE.Vector3(-fx, 0.025, fz),
      new THREE.Vector3(-fx, 0.025, -fz),
    ];
    footprintGeo.setFromPoints(footprintPoints);
    const footprintMat = new THREE.LineBasicMaterial({ color: 0xF28C28, transparent: true, opacity: 0.75 });
    const footprintLine = new THREE.Line(footprintGeo, footprintMat);
    buildingGroup.add(footprintLine);

    floorGroupsRef.current = [];

    // ── Floor by Floor Construction ───────────────────────────────────────────
    for (let f = 0; f < numFloors; f++) {
      const floorGroup = new THREE.Group();
      const yBase = f * (floorH + explodedGap);
      floorGroup.position.y = yBase;

      // Concrete Slab – exposed soffit visible in exploded view
      const slabGeo = new THREE.BoxGeometry(bWidth + 0.35, 0.12, bDepth + 0.35);
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.set(0, 0.06, 0);
      slab.castShadow = true;
      slab.receiveShadow = true;
      floorGroup.add(slab);

      if (f === 0 && isStilt) {
        // Stilt Ground Columns – exposed RC concrete
        const colGeo = new THREE.BoxGeometry(0.3, floorH, 0.3);
        const colPositions = [
          [-bWidth / 2 + 0.5, floorH / 2, -bDepth / 2 + 0.5],
          [bWidth / 2 - 0.5, floorH / 2, -bDepth / 2 + 0.5],
          [-bWidth / 2 + 0.5, floorH / 2, bDepth / 2 - 0.5],
          [bWidth / 2 - 0.5, floorH / 2, bDepth / 2 - 0.5],
          [0, floorH / 2, -bDepth / 2 + 0.5],
        ];
        colPositions.forEach(([cx, cy, cz]) => {
          const col = new THREE.Mesh(colGeo, accentMat);
          col.position.set(cx, cy, cz);
          col.castShadow = true;
          floorGroup.add(col);
        });
      } else {
        // Ground-floor plinth band – exposed brick for all modes
        // A 30cm-tall brick plinth runs around the base of the wall
        const plinthH = 0.30;
        if (f === 0) {
          const plinthMesh = new THREE.Mesh(
            new THREE.BoxGeometry(bWidth + 0.02, plinthH, bDepth + 0.02),
            brickMat
          );
          plinthMesh.position.set(0, plinthH / 2, 0);
          plinthMesh.castShadow = true;
          plinthMesh.receiveShadow = true;
          floorGroup.add(plinthMesh);
        }

        // Main wall body – exposed board-formed concrete or painted plaster
        const wallH = f === 0 ? floorH - 0.12 - plinthH : floorH - 0.12;
        const wallYOffset = f === 0 ? plinthH : 0;
        const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(bWidth, wallH, bDepth), activeFacadeMat);
        wallMesh.position.set(0, wallH / 2 + wallYOffset + 0.06, 0);
        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;
        floorGroup.add(wallMesh);

        // Architectural Fin – darker concrete shear wall accent
        const fin = new THREE.Mesh(new THREE.BoxGeometry(0.18, floorH - 0.12, bDepth + 0.15), accentMat);
        fin.position.set(-bWidth / 3.8, floorH / 2, 0);
        fin.castShadow = true;
        floorGroup.add(fin);

        // Column piers at corners for realism
        const pierGeo = new THREE.BoxGeometry(0.22, floorH - 0.12, 0.22);
        const pierPositions: [number, number, number][] = [
          [bWidth / 2 - 0.11, floorH / 2, bDepth / 2 - 0.11],
          [-bWidth / 2 + 0.11, floorH / 2, bDepth / 2 - 0.11],
          [bWidth / 2 - 0.11, floorH / 2, -bDepth / 2 + 0.11],
          [-bWidth / 2 + 0.11, floorH / 2, -bDepth / 2 + 0.11],
        ];
        pierPositions.forEach(([px, py, pz]) => {
          const pier = new THREE.Mesh(pierGeo, accentMat);
          pier.position.set(px, py, pz);
          pier.castShadow = true;
          floorGroup.add(pier);
        });

        // Windows
        const createWindow = (wx: number, wy: number, wz: number, wW: number, wH: number) => {
          const winGroup = new THREE.Group();
          const frame = new THREE.Mesh(new THREE.BoxGeometry(wW + 0.08, wH + 0.08, 0.08), frameMat);
          winGroup.add(frame);
          const glass = new THREE.Mesh(new THREE.BoxGeometry(wW, wH, 0.04), glassMat);
          winGroup.add(glass);
          winGroup.position.set(wx, wy, wz);
          floorGroup.add(winGroup);

          // ── Weathering streak plane – subtle rain drip stain below each window
          const streakPlaneGeo = new THREE.PlaneGeometry(wW, 0.55);
          const streakPlane = new THREE.Mesh(streakPlaneGeo, streakMat);
          // Place just in front of wall, centred below sill
          streakPlane.position.set(wx, wy - wH / 2 - 0.27, wz + 0.06);
          floorGroup.add(streakPlane);
        };

        createWindow(-1.1, floorH / 2 + 0.05, bDepth / 2 + 0.04, 1.3, 0.8);
        createWindow(1.2, floorH / 2 + 0.05, bDepth / 2 + 0.04, 1.3, 0.8);

        if (f === 0) {
          // Door
          const door = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.05, 0.08), doorMat);
          door.position.set(0, 0.58, bDepth / 2 + 0.07);
          door.castShadow = true;
          floorGroup.add(door);
          // Door frame reveal
          const dFrame = new THREE.Mesh(new THREE.BoxGeometry(0.97, 1.14, 0.04), frameMat);
          dFrame.position.set(0, 0.58, bDepth / 2 + 0.03);
          floorGroup.add(dFrame);
        }

        // Balconies
        if (f > 0 && f <= balconyCount) {
          const bSlab = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.1, 0.8), slabMat);
          bSlab.position.set(0.65, 0.05, bDepth / 2 + 0.4);
          bSlab.castShadow = true;
          floorGroup.add(bSlab);

          const rGlass = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.38, 0.04), glassMat);
          rGlass.position.set(0.65, 0.28, bDepth / 2 + 0.78);
          floorGroup.add(rGlass);

          const hRail = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.04, 0.05), railingMat);
          hRail.position.set(0.65, 0.48, bDepth / 2 + 0.78);
          floorGroup.add(hRail);
        }
      }

      floorGroupsRef.current.push(floorGroup);
      buildingGroup.add(floorGroup);
    }

    // ── Terrace Level Roof ────────────────────────────────────────────────────
    const terraceGroup = new THREE.Group();
    const terraceY = numFloors * (floorH + explodedGap);
    terraceGroup.position.y = terraceY;

    const roof = new THREE.Mesh(new THREE.BoxGeometry(bWidth + 0.4, 0.14, bDepth + 0.4), slabMat);
    roof.position.set(0, 0.07, 0);
    roof.castShadow = true;
    roof.receiveShadow = true;
    terraceGroup.add(roof);

    // Orange Roof Ridge Accent (Hutty signature detail)
    const ridgeGeo = new THREE.BoxGeometry(bWidth + 0.44, 0.08, 0.08);
    const ridgeMat = new THREE.MeshStandardMaterial({ color: 0xF28C28, roughness: 0.35, metalness: 0.1 });
    const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
    ridge.position.set(0, 0.16, bDepth / 2 + 0.2);
    terraceGroup.add(ridge);

    // Parapet Wall – smooth poured concrete
    const pHeight = 0.38;
    const parapetTex = makeConcreteTexture(128, isNightMode ? 42 : 172, isNightMode ? 48 : 170, isNightMode ? 44 : 166, 22);
    const pMat = new THREE.MeshStandardMaterial({ map: parapetTex, roughness: 0.75, metalness: 0.0 });
    const pFront = new THREE.Mesh(new THREE.BoxGeometry(bWidth + 0.4, pHeight, 0.1), pMat);
    pFront.position.set(0, pHeight / 2 + 0.14, bDepth / 2 + 0.15);
    pFront.castShadow = true;
    terraceGroup.add(pFront);

    // Staircase Headroom Cabin on Terrace
    const cabinH = hasLift ? 1.5 : 1.1;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, cabinH, 1.8), accentMat);
    cabin.position.set(-bWidth / 2 + 1.2, cabinH / 2 + 0.14, -bDepth / 2 + 1.2);
    cabin.castShadow = true;
    terraceGroup.add(cabin);

    buildingGroup.add(terraceGroup);

    camera.lookAt(0, centerY, 0);
    buildingGroup.rotation.x = rotationRef.current.x;
    buildingGroup.rotation.y = rotationRef.current.y;

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      if (buildingGroupRef.current) {
        if (isAutoRotating && !isDraggingRef.current) {
          rotationRef.current.y += 0.005;
        }
        buildingGroupRef.current.rotation.y = rotationRef.current.y;
        buildingGroupRef.current.rotation.x = rotationRef.current.x;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      resizeObserver.disconnect();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      // Dispose procedural textures
      [wallTex, slabTex, groundTex, bumpTex, concreteDarkTex, paveTex, parapetTex, brickTex, streakTex, plasterTex].forEach(t => t.dispose());
    };
  }, [
    numFloors,
    isStilt,
    carCount,
    hasLift,
    balconyCount,
    plotLength,
    plotWidth,
    qualityTier,
    city,
    isAutoRotating,
    isNightMode,
    isExplodedView,
    isPaintedMode,
    zoomLevel,
  ]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;
    rotationRef.current.y += deltaX * 0.01;
    rotationRef.current.x = Math.max(0.08, Math.min(0.75, rotationRef.current.x + deltaY * 0.008));
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
    const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;
    rotationRef.current.y += deltaX * 0.01;
    rotationRef.current.x = Math.max(0.08, Math.min(0.75, rotationRef.current.x + deltaY * 0.008));
    previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const handleResetView = () => {
    rotationRef.current = { x: 0.28, y: -0.75 };
    setZoomLevel(1);
    setIsExplodedView(false);
  };

  const handleZoom = (factor: number) => {
    setZoomLevel((prev) => Math.max(0.6, Math.min(1.8, prev * factor)));
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-[#1B3D34] border border-[#1B3D34] select-none shadow-xs ${className}`}>
      {/* 3D Canvas Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full min-h-[160px] cursor-grab active:cursor-grabbing"
      />

      {/* Floating Badges */}
      <div className="absolute top-3 left-3 flex items-center gap-2 bg-[#1B3D34]/90 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-white pointer-events-none">
        <Box className="w-3.5 h-3.5 text-[#F28C28]" />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {city || 'Bangalore'} &bull; {houseType || 'Duplex'}
        </span>
      </div>

      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        {isExplodedView && (
          <span className="bg-[#1B3D34]/90 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[#F28C28] text-[10px] font-extrabold border border-white/10 shadow-xs pointer-events-none">
            Exploded View
          </span>
        )}
        {isPaintedMode && (
          <span className="bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[#1B3D34] text-[10px] font-extrabold border border-white/20 shadow-xs pointer-events-none">
            Painted Finish
          </span>
        )}
        <span className="bg-[#F28C28] px-2.5 py-0.5 rounded-md text-[#1B3D34] text-[10px] font-extrabold shadow-xs pointer-events-none">
          {floors === 1 ? 'Ground Level' : `G+${(floors || 2) - 1}`}
        </span>
      </div>

      {/* 3D Controls Bar */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-[#1B3D34]/90 backdrop-blur-md p-1 rounded-xl border border-white/15 z-10">
        <button
          type="button"
          onClick={() => setIsExplodedView(!isExplodedView)}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            isExplodedView ? 'bg-[#F28C28] text-[#1B3D34]' : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title="Toggle Exploded Floor Slice View"
        >
          <Layers className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => setIsPaintedMode(!isPaintedMode)}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            isPaintedMode ? 'bg-[#F28C28] text-[#1B3D34]' : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title={isPaintedMode ? 'Switch to Raw Concrete' : 'Switch to Painted Plaster'}
        >
          <PaintBucket className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => setIsNightMode(!isNightMode)}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            isNightMode ? 'bg-white/20 text-[#F28C28]' : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title={isNightMode ? 'Day Sunlight' : 'Evening Lighting'}
        >
          {isNightMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
        </button>

        <button
          type="button"
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            isAutoRotating ? 'bg-white/20 text-[#F28C28]' : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title="Toggle Turntable Rotation"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-spin' : ''}`} />
        </button>

        <button
          type="button"
          onClick={() => handleZoom(1.15)}
          className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 text-xs transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => handleZoom(0.85)}
          className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 text-xs transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={handleResetView}
          className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 text-xs transition-colors cursor-pointer"
          title="Reset View"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Drag Hint */}
      <div className="absolute bottom-3 left-3 text-[10px] text-white/70 font-medium pointer-events-none flex items-center gap-1.5 bg-[#1B3D34]/80 backdrop-blur-sm px-2 py-0.5 rounded">
        <Eye className="w-3 h-3 text-[#F28C28]" />
        <span>Drag to orbit 360°</span>
      </div>
    </div>
  );
};
