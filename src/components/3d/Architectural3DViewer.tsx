import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCw, ZoomIn, ZoomOut, RefreshCw, Box, Eye, Layers, Sun, Moon, Sparkles, Building2
} from 'lucide-react';
import { QualityTier, HouseType, ParkingTypeOption, RoomCounts, CityLocation, MaterialBrandSelection } from '../../store/useWizardStore';
import { DoorSelection, WindowSelection, PaintingSelection, ZoneFlooringSelection, WallCladdingSelection, ElectricalSelection, BathroomFittingSelection } from '../../calculation-engine/types';

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
  bikeCount = 1,
  evCharging = false,
  liftRequired = false,
  houseType,
  qualityTier = 'Premium',
  rooms,
  materialBrands,
  flooringZones,
  wallCladding,
  doors,
  windows,
  electrical,
  bathroomFittings,
  painting,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const buildingGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Default clean architectural isometric angle (45° corner perspective)
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.28, y: -0.75 });

  const numFloors = Math.max(1, Math.min(5, floors || 1));
  const isStilt = parkingType === 'Stilt';
  const hasEV = evCharging || parkingType === 'EV Charging Ready';
  const hasLift = liftRequired || numFloors >= 4;
  const isMixedUse = houseType === 'Mixed Use';
  const isRental = houseType === 'Rental Units';
  const bedroomCount = rooms?.bedrooms ?? 3;
  const balconyCount = Math.max(0, rooms?.balcony ?? (numFloors > 1 ? 1 : 0));

  // Plot aspect scaling
  const pLength = Math.max(25, Math.min(120, plotLength || 40));
  const pWidth = Math.max(20, Math.min(100, plotWidth || 30));
  const plotAspect = Math.max(0.65, Math.min(1.5, pWidth / pLength));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── 1. Dimensions & Scene Setup ──
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 240;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isNightMode ? 0x090d16 : 0xf1f5f9);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 7.5, 15.5);
    cameraRef.current = camera;

    // ── 2. WebGL Renderer with Soft Contact Shadows ──
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // ── 3. Lighting Setup (Day vs Evening Night Mode) ──
    if (isNightMode) {
      // Atmospheric Evening/Night
      const ambientNight = new THREE.AmbientLight(0x1e293b, 0.9);
      scene.add(ambientNight);

      const moonLight = new THREE.DirectionalLight(0x60a5fa, 0.6);
      moonLight.position.set(-8, 15, -10);
      scene.add(moonLight);

      // Warm interior facade illumination lights
      const warmGlow = new THREE.PointLight(0xfef08a, 2.5, 15);
      warmGlow.position.set(0, 3, 3.5);
      scene.add(warmGlow);
    } else {
      // Bright Architectural Daylight
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.72);
      scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.35);
      sunLight.position.set(10, 20, 12);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.bias = -0.0005;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 45;
      sunLight.shadow.camera.left = -9;
      sunLight.shadow.camera.right = 9;
      sunLight.shadow.camera.top = 9;
      sunLight.shadow.camera.bottom = -9;
      scene.add(sunLight);

      const skyLight = new THREE.DirectionalLight(0xbfdbfe, 0.4);
      skyLight.position.set(-10, 10, -8);
      scene.add(skyLight);
    }

    // ── 4. Architectural Building Root Group ──
    const buildingGroup = new THREE.Group();
    buildingGroupRef.current = buildingGroup;
    scene.add(buildingGroup);

    // ── 5. Dynamic Site Landscaping & Pod ──
    const groundW = 9.6 * Math.max(0.85, plotAspect);
    const groundD = 9.0 / Math.max(0.85, plotAspect);

    // Lawn Baseplate
    const lawnColor = isNightMode ? 0x064e3b : (qualityTier === 'Luxury' ? 0xbbf7d0 : 0xdcfce7);
    const groundGeo = new THREE.BoxGeometry(groundW, 0.15, groundD);
    const groundMat = new THREE.MeshStandardMaterial({ color: lawnColor, roughness: 0.85 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.075;
    ground.receiveShadow = true;
    buildingGroup.add(ground);

    // Paved Stone Driveway & Entrance Pathway (Materials reactive)
    let paveColor = 0xe2e8f0;
    if (flooringZones?.living === 'Italian Marble' || qualityTier === 'Luxury') {
      paveColor = 0x334155; // Premium slate granite paving
    } else if (flooringZones?.living === 'Granite Slab') {
      paveColor = 0x475569; // Polished dark granite
    }
    const paveW = 4.2 * Math.max(0.85, plotAspect);
    const paveD = groundD - 0.6;
    const paveGeo = new THREE.BoxGeometry(paveW, 0.16, paveD);
    const paveMat = new THREE.MeshStandardMaterial({ color: paveColor, roughness: 0.6 });
    const pave = new THREE.Mesh(paveGeo, paveMat);
    pave.position.set(1.4, -0.065, 0);
    pave.receiveShadow = true;
    buildingGroup.add(pave);

    // Plot Boundary Line
    const boundaryGeo = new THREE.BufferGeometry();
    const bx = (groundW - 0.8) / 2;
    const bz = (groundD - 0.8) / 2;
    const boundaryPoints = [
      new THREE.Vector3(-bx, 0.02, -bz),
      new THREE.Vector3(bx, 0.02, -bz),
      new THREE.Vector3(bx, 0.02, bz),
      new THREE.Vector3(-bx, 0.02, bz),
      new THREE.Vector3(-bx, 0.02, -bz),
    ];
    boundaryGeo.setFromPoints(boundaryPoints);
    const boundaryMat = new THREE.LineDashedMaterial({ color: 0x2563eb, dashSize: 0.35, gapSize: 0.18 });
    const boundaryLine = new THREE.Line(boundaryGeo, boundaryMat);
    boundaryLine.computeLineDistances();
    buildingGroup.add(boundaryLine);

    // Minimalist Landscape Trees
    const addTree = (tx: number, tz: number, scale = 1) => {
      const treeGroup = new THREE.Group();
      const trunkGeo = new THREE.CylinderGeometry(0.06 * scale, 0.08 * scale, 0.7 * scale, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.35 * scale;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      const foliageColor = isNightMode ? 0x064e3b : (qualityTier === 'Luxury' ? 0x047857 : 0x16a34a);
      const foliageGeo = new THREE.DodecahedronGeometry(0.45 * scale, 1);
      const foliageMat = new THREE.MeshStandardMaterial({ color: foliageColor, roughness: 0.75, flatShading: true });
      const foliage = new THREE.Mesh(foliageGeo, foliageMat);
      foliage.position.y = 0.85 * scale;
      foliage.castShadow = true;
      treeGroup.add(foliage);

      treeGroup.position.set(tx, 0, tz);
      buildingGroup.add(treeGroup);
    };

    addTree(-bx + 0.6, bz - 0.8, 1.1);
    addTree(-bx + 0.5, -bz + 0.8, 0.95);

    // ── 6. Vehicles (Cars & Bikes) ──
    const addCar = (cx: number, cz: number, color = 0x0284c7) => {
      const carGroup = new THREE.Group();
      const carBodyGeo = new THREE.BoxGeometry(1.3, 0.42, 2.3);
      const carBodyMat = new THREE.MeshStandardMaterial({ color, metalness: 0.7, roughness: 0.25 });
      const carBody = new THREE.Mesh(carBodyGeo, carBodyMat);
      carBody.position.y = 0.28;
      carBody.castShadow = true;
      carGroup.add(carBody);

      const carCabinGeo = new THREE.BoxGeometry(1.15, 0.34, 1.3);
      const carCabinMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
      const carCabin = new THREE.Mesh(carCabinGeo, carCabinMat);
      carCabin.position.set(0, 0.62, -0.1);
      carGroup.add(carCabin);

      carGroup.position.set(cx, 0, cz);
      buildingGroup.add(carGroup);
    };

    if (isStilt) {
      addCar(-0.4, 0.2, 0x0284c7);
      if ((carCount || 1) >= 2) addCar(1.2, 0.2, 0xd97706);
    } else if ((carCount || 0) > 0) {
      // Parked on driveway
      addCar(1.4, bz - 1.8, 0x0284c7);
    }

    // ── 7. EV Charging Station ──
    if (hasEV) {
      const evGroup = new THREE.Group();
      const postGeo = new THREE.BoxGeometry(0.2, 0.85, 0.2);
      const postMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.y = 0.42;
      post.castShadow = true;
      evGroup.add(post);

      const ledGeo = new THREE.BoxGeometry(0.08, 0.15, 0.05);
      const ledMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(0, 0.55, 0.11);
      evGroup.add(led);

      evGroup.position.set(2.8, 0, bz - 1.2);
      buildingGroup.add(evGroup);
    }

    // ── 8. Materials Reactive to Selections ──
    // Facade Palette
    let facadeHex = 0xffffff;
    if (painting?.brand === 'Asian Paints' || painting?.internalPaint === 'Royale Luxury Emulsion') {
      facadeHex = 0xfdfbf7; // Warm Italian Ivory
    } else if (city === 'Mysore') {
      facadeHex = 0xffedd5; // Warm Heritage Terracotta Tone
    } else if (qualityTier === 'Luxury') {
      facadeHex = 0xf8fafc;
    }

    // Accent Slat / Column Finish
    let accentHex = 0x1e293b;
    if (materialBrands?.steel === 'Tata Tiscon') {
      accentHex = 0x0f172a; // High tensile dark metallic
    } else if (qualityTier === 'Luxury') {
      accentHex = 0x0f172a;
    }

    // Main Door Finish
    let doorHex = 0xb45309; // Natural Honey Teak
    if (doors?.mainDoor === 'Premium Teak') {
      doorHex = 0x78350f; // Deep Burma Teak
    }

    // Window Frame Finish
    let frameHex = 0x1e293b;
    if (windows?.primaryMaterial === 'Wood') {
      frameHex = 0xa16207; // Natural Teak Timber
    } else if (windows?.primaryMaterial === 'uPVC') {
      frameHex = 0xf1f5f9; // Pure White uPVC
    }

    // Glass Reflection & Light
    const glassColor = isNightMode ? 0xfef08a : (qualityTier === 'Luxury' ? 0x7dd3fc : 0xbae6fd);
    const glassOpacity = isNightMode ? 0.9 : 0.65;

    const facadeMat  = new THREE.MeshStandardMaterial({ color: facadeHex, roughness: 0.4 });
    const accentMat  = new THREE.MeshStandardMaterial({ color: accentHex, roughness: 0.35 });
    const doorMat    = new THREE.MeshStandardMaterial({ color: doorHex, roughness: 0.5 });
    const slabMat    = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.5 });
    const frameMat   = new THREE.MeshStandardMaterial({ color: frameHex, roughness: 0.3 });
    const glassMat   = new THREE.MeshPhysicalMaterial({
      color: glassColor,
      transparent: true,
      opacity: glassOpacity,
      roughness: 0.05,
      metalness: 0.1,
      clearcoat: 1.0,
    });
    const railingMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });

    // Proportions
    const bWidth = 4.8 * Math.max(0.85, Math.min(1.3, plotAspect));
    const bDepth = 4.0 / Math.max(0.85, Math.min(1.3, plotAspect));
    const floorH = 1.35;

    // ── 9. Floor-by-Floor Construction ──
    for (let f = 0; f < numFloors; f++) {
      const yBase = f * floorH;

      // Concrete Floor Slab
      const slabGeo = new THREE.BoxGeometry(bWidth + 0.35, 0.12, bDepth + 0.35);
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.set(0, yBase + 0.06, 0);
      slab.castShadow = true;
      slab.receiveShadow = true;
      buildingGroup.add(slab);

      if (f === 0 && isStilt) {
        // Stilt Parking Floor
        const colGeo = new THREE.BoxGeometry(0.3, floorH, 0.3);
        const colPositions = [
          [-bWidth / 2 + 0.5, yBase + floorH / 2, -bDepth / 2 + 0.5],
          [bWidth / 2 - 0.5, yBase + floorH / 2, -bDepth / 2 + 0.5],
          [-bWidth / 2 + 0.5, yBase + floorH / 2, bDepth / 2 - 0.5],
          [bWidth / 2 - 0.5, yBase + floorH / 2, bDepth / 2 - 0.5],
          [0, yBase + floorH / 2, -bDepth / 2 + 0.5],
        ];
        colPositions.forEach(([cx, cy, cz]) => {
          const col = new THREE.Mesh(colGeo, accentMat);
          col.position.set(cx, cy, cz);
          col.castShadow = true;
          buildingGroup.add(col);
        });

        // Entrance Lobby in Stilt
        const coreGeo = new THREE.BoxGeometry(1.8, floorH - 0.12, 1.8);
        const core = new THREE.Mesh(coreGeo, facadeMat);
        core.position.set(bWidth / 2 - 1.1, yBase + floorH / 2, -bDepth / 2 + 1.1);
        core.castShadow = true;
        buildingGroup.add(core);
      } else if (f === 0 && isMixedUse) {
        // Mixed Use Commercial Storefront
        const storeWall = new THREE.Mesh(new THREE.BoxGeometry(bWidth, floorH - 0.12, bDepth), facadeMat);
        storeWall.position.set(0, yBase + floorH / 2, 0);
        storeWall.castShadow = true;
        buildingGroup.add(storeWall);

        const storefront = new THREE.Mesh(new THREE.BoxGeometry(bWidth - 0.8, floorH - 0.25, 0.08), glassMat);
        storefront.position.set(0, yBase + floorH / 2, bDepth / 2 + 0.05);
        buildingGroup.add(storefront);
      } else {
        // Residential Living Floors
        const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(bWidth, floorH - 0.12, bDepth), facadeMat);
        wallMesh.position.set(0, yBase + floorH / 2, 0);
        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;
        buildingGroup.add(wallMesh);

        // Modern Vertical Architectural Fin
        const fin = new THREE.Mesh(new THREE.BoxGeometry(0.22, floorH - 0.12, bDepth + 0.15), accentMat);
        fin.position.set(-bWidth / 3.8, yBase + floorH / 2, 0);
        fin.castShadow = true;
        buildingGroup.add(fin);

        // Window creation
        const createWindow = (wx: number, wy: number, wz: number, wW: number, wH: number) => {
          const winGroup = new THREE.Group();
          const frame = new THREE.Mesh(new THREE.BoxGeometry(wW + 0.08, wH + 0.08, 0.08), frameMat);
          winGroup.add(frame);
          const glass = new THREE.Mesh(new THREE.BoxGeometry(wW, wH, 0.04), glassMat);
          winGroup.add(glass);
          winGroup.position.set(wx, wy, wz);
          buildingGroup.add(winGroup);
        };

        // Front Windows (Scaled with bedroom count)
        createWindow(-1.1, yBase + floorH / 2 + 0.05, bDepth / 2 + 0.04, 1.3, 0.8);
        createWindow(1.2, yBase + floorH / 2 + 0.05, bDepth / 2 + 0.04, 1.3, 0.8);

        // Extra side window if more than 3 bedrooms
        if (bedroomCount >= 4) {
          const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.75, 1.1), glassMat);
          sideGlass.position.set(bWidth / 2 + 0.02, yBase + floorH / 2 + 0.05, 0);
          buildingGroup.add(sideGlass);
        }

        // Main Door on Ground Floor
        if (f === 0) {
          const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.15, 0.1), frameMat);
          doorFrame.position.set(0, 0.6, bDepth / 2 + 0.05);
          buildingGroup.add(doorFrame);

          const door = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.05, 0.08), doorMat);
          door.position.set(0, 0.58, bDepth / 2 + 0.07);
          door.castShadow = true;
          buildingGroup.add(door);
        }

        // Balconies (Driven by rooms.balcony)
        if (f > 0 && f <= balconyCount) {
          const bSlab = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.1, 0.8), slabMat);
          bSlab.position.set(0.65, yBase + 0.05, bDepth / 2 + 0.4);
          bSlab.castShadow = true;
          buildingGroup.add(bSlab);

          const rGlass = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.38, 0.04), glassMat);
          rGlass.position.set(0.65, yBase + 0.28, bDepth / 2 + 0.78);
          buildingGroup.add(rGlass);

          const hRail = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.04, 0.05), railingMat);
          hRail.position.set(0.65, yBase + 0.48, bDepth / 2 + 0.78);
          buildingGroup.add(hRail);
        }
      }

      // External Stairs for Rental Units
      if (isRental && f > 0) {
        const stairSlab = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 1.4), slabMat);
        stairSlab.position.set(-bWidth / 2 - 0.45, yBase, 0);
        stairSlab.castShadow = true;
        buildingGroup.add(stairSlab);
      }
    }

    // ── 10. Terrace Roof Level ──
    const terraceY = numFloors * floorH;

    // Roof Slab
    const roof = new THREE.Mesh(new THREE.BoxGeometry(bWidth + 0.4, 0.14, bDepth + 0.4), slabMat);
    roof.position.set(0, terraceY + 0.07, 0);
    roof.castShadow = true;
    buildingGroup.add(roof);

    // Parapet Wall
    const pHeight = 0.38;
    const pMat = new THREE.MeshStandardMaterial({ color: facadeHex, roughness: 0.5 });
    
    const pFront = new THREE.Mesh(new THREE.BoxGeometry(bWidth + 0.4, pHeight, 0.1), pMat);
    pFront.position.set(0, terraceY + pHeight / 2 + 0.14, bDepth / 2 + 0.15);
    buildingGroup.add(pFront);

    const pBack = new THREE.Mesh(new THREE.BoxGeometry(bWidth + 0.4, pHeight, 0.1), pMat);
    pBack.position.set(0, terraceY + pHeight / 2 + 0.14, -bDepth / 2 - 0.15);
    buildingGroup.add(pBack);

    const pLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, pHeight, bDepth + 0.2), pMat);
    pLeft.position.set(-bWidth / 2 - 0.15, terraceY + pHeight / 2 + 0.14, 0);
    buildingGroup.add(pLeft);

    const pRight = new THREE.Mesh(new THREE.BoxGeometry(0.1, pHeight, bDepth + 0.2), pMat);
    pRight.position.set(bWidth / 2 + 0.15, terraceY + pHeight / 2 + 0.14, 0);
    buildingGroup.add(pRight);

    // Staircase Headroom / Lift Core Cabin on Terrace
    const cabinH = hasLift ? 1.6 : 1.15;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, cabinH, 1.8), facadeMat);
    cabin.position.set(-bWidth / 2 + 1.2, terraceY + cabinH / 2 + 0.14, -bDepth / 2 + 1.2);
    cabin.castShadow = true;
    buildingGroup.add(cabin);

    // Overhead Water Tank (Sintex or SS Tank based on sanitaryTier)
    const isSSTank = bathroomFittings?.sanitaryTier === 'Luxury (Toto / Duravit)';
    const tankColor = isSSTank ? 0x94a3b8 : 0x1e293b;
    const tankMat = new THREE.MeshStandardMaterial({ color: tankColor, roughness: isSSTank ? 0.2 : 0.4, metalness: isSSTank ? 0.8 : 0 });
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.75, 16), tankMat);
    tank.position.set(-bWidth / 2 + 1.2, terraceY + cabinH + 0.5, -bDepth / 2 + 1.2);
    tank.castShadow = true;
    buildingGroup.add(tank);

    // Terrace Pergola Louvres
    const pergolaMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    for (let i = 0; i < 4; i++) {
      const louvre = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 0.08), pergolaMat);
      louvre.position.set(1.1, terraceY + 1.0, -0.6 + i * 0.4);
      buildingGroup.add(louvre);
    }

    // Solar Water Heater Panel on Roof (if Premium/Luxury)
    if (qualityTier !== 'Essential') {
      const solarGroup = new THREE.Group();
      const panel = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 1.0), new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.8, roughness: 0.1 }));
      panel.rotation.x = -0.3;
      solarGroup.add(panel);
      solarGroup.position.set(1.0, terraceY + 0.35, 0.8);
      buildingGroup.add(solarGroup);
    }

    // Center camera on building mid-height
    const centerY = (numFloors * floorH) / 2 + 0.2;
    camera.lookAt(0, centerY, 0);

    buildingGroup.rotation.x = rotationRef.current.x;
    buildingGroup.rotation.y = rotationRef.current.y;

    // ── 11. Render Animation Loop ──
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

    // ── 12. Resize Observer ──
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
    };
  }, [
    numFloors,
    isStilt,
    carCount,
    bikeCount,
    hasEV,
    hasLift,
    isMixedUse,
    isRental,
    bedroomCount,
    balconyCount,
    plotLength,
    plotWidth,
    qualityTier,
    city,
    materialBrands?.steel,
    materialBrands?.cement,
    flooringZones?.living,
    doors?.mainDoor,
    windows?.primaryMaterial,
    bathroomFittings?.sanitaryTier,
    painting?.brand,
    painting?.internalPaint,
    isAutoRotating,
    isNightMode,
  ]);

  // ── Drag to Orbit Controls ──
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
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 7.5, 15.5);
      setZoomLevel(1);
    }
  };

  const handleZoom = (factor: number) => {
    if (!cameraRef.current) return;
    const newZoom = Math.max(0.6, Math.min(1.8, zoomLevel * factor));
    setZoomLevel(newZoom);
    cameraRef.current.position.set(0, 7.5 / newZoom, 15.5 / newZoom);
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 select-none shadow-soft-md ${className}`}>
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
        className="w-full h-52 cursor-grab active:cursor-grabbing"
      />

      {/* Floating 3D Badge & City */}
      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 text-white pointer-events-none">
        <Box className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-[10px] font-black uppercase tracking-wider">
          {city || 'Bangalore'} &bull; {houseType || 'Duplex'}
        </span>
      </div>

      {/* Floating Floor & Spec Badge */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
        <span className="bg-blue-600/90 backdrop-blur-md px-2 py-0.5 rounded-md text-white text-[10px] font-black shadow-xs pointer-events-none">
          {floors === 1 ? 'Ground Level' : `G+${(floors || 2) - 1}`}
        </span>
      </div>

      {/* 3D Control Action Bar (Rotate, Day/Night, Zoom, Reset) */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80">
        <button
          type="button"
          onClick={() => setIsNightMode(!isNightMode)}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            isNightMode ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title={isNightMode ? 'Switch to Day Sunlight' : 'Switch to Evening Architectural Lighting'}
        >
          {isNightMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
        </button>

        <button
          type="button"
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            isAutoRotating ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title={isAutoRotating ? 'Stop 360° Rotation' : 'Start 360° Turntable Rotation'}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-spin' : ''}`} />
        </button>

        <button
          type="button"
          onClick={() => handleZoom(1.15)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => handleZoom(0.85)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={handleResetView}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition-colors cursor-pointer"
          title="Reset to Front Isometric Angle"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* User Drag Hint */}
      <div className="absolute bottom-2.5 left-2.5 text-[9.5px] text-slate-400 font-bold pointer-events-none flex items-center gap-1">
        <Eye className="w-3 h-3 text-slate-400" />
        <span>Drag to rotate 360°</span>
      </div>
    </div>
  );
};
