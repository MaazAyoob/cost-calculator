import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCw, ZoomIn, ZoomOut, RefreshCw, Box, Eye, Sun, Moon
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
  evCharging = false,
  liftRequired = false,
  houseType,
  qualityTier = 'Premium',
  rooms,
  materialBrands,
  flooringZones,
  doors,
  windows,
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

  const pLength = Math.max(25, Math.min(120, plotLength || 40));
  const pWidth = Math.max(20, Math.min(100, plotWidth || 30));
  const plotAspect = Math.max(0.65, Math.min(1.5, pWidth / pLength));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isNightMode ? 0x132C25 : 0xF8F8F6);
    sceneRef.current = scene;

    const floorH = 1.35;
    const centerY = (numFloors * floorH) / 2 + 0.2;
    const cameraDistZ = 13.0 + (numFloors - 1) * 1.4 + Math.max(0, (plotAspect - 1) * 2.2);
    const cameraDistY = centerY + 3.4;

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 120);
    camera.position.set(0, cameraDistY, cameraDistZ);
    camera.lookAt(0, centerY, 0);
    cameraRef.current = camera;

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

    if (isNightMode) {
      const ambientNight = new THREE.AmbientLight(0x1B3D34, 1.2);
      scene.add(ambientNight);

      const moonLight = new THREE.DirectionalLight(0xE5E7EB, 0.8);
      moonLight.position.set(-8, 15, -10);
      scene.add(moonLight);

      const warmGlow = new THREE.PointLight(0xF28C28, 2.2, 16);
      warmGlow.position.set(0, 3, 3.5);
      scene.add(warmGlow);
    } else {
      const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.85);
      scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xFFFFFF, 1.2);
      sunLight.position.set(10, 20, 12);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.bias = -0.0005;
      scene.add(sunLight);

      const fillLight = new THREE.DirectionalLight(0xF8F8F6, 0.4);
      fillLight.position.set(-10, 10, -8);
      scene.add(fillLight);
    }

    const buildingGroup = new THREE.Group();
    buildingGroupRef.current = buildingGroup;
    scene.add(buildingGroup);

    // Site Landscaping
    const groundW = 9.6 * Math.max(0.85, plotAspect);
    const groundD = 9.0 / Math.max(0.85, plotAspect);

    // Baseplate (Hutty architectural ground)
    const groundColor = isNightMode ? 0x0E211C : 0xEFEFEA;
    const groundGeo = new THREE.BoxGeometry(groundW, 0.15, groundD);
    const groundMat = new THREE.MeshStandardMaterial({ color: groundColor, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.075;
    ground.receiveShadow = true;
    buildingGroup.add(ground);

    // Paved Pathway
    const paveColor = isNightMode ? 0x1B3D34 : 0xDFE3E1;
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
    const boundaryMat = new THREE.LineDashedMaterial({ color: 0x1B3D34, dashSize: 0.35, gapSize: 0.18 });
    const boundaryLine = new THREE.Line(boundaryGeo, boundaryMat);
    boundaryLine.computeLineDistances();
    buildingGroup.add(boundaryLine);

    // Materials
    const facadeHex = isNightMode ? 0x1E4239 : 0xFFFFFF;
    const accentHex = 0x1B3D34; // Hutty Deep Green Frame
    const doorHex   = 0x4B5563;
    const roofHex   = 0xF28C28; // Orange roof highlight

    const facadeMat  = new THREE.MeshStandardMaterial({ color: facadeHex, roughness: 0.4 });
    const accentMat  = new THREE.MeshStandardMaterial({ color: accentHex, roughness: 0.35 });
    const doorMat    = new THREE.MeshStandardMaterial({ color: doorHex, roughness: 0.5 });
    const slabMat    = new THREE.MeshStandardMaterial({ color: isNightMode ? 0x1B3D34 : 0xE5E7EB, roughness: 0.5 });
    const frameMat   = new THREE.MeshStandardMaterial({ color: 0x1B3D34, roughness: 0.3 });
    const glassMat   = new THREE.MeshPhysicalMaterial({
      color: isNightMode ? 0xF28C28 : 0x1B3D34,
      transparent: true,
      opacity: isNightMode ? 0.85 : 0.45,
      roughness: 0.05,
      metalness: 0.1,
    });
    const railingMat = new THREE.MeshStandardMaterial({ color: 0x1B3D34, metalness: 0.8, roughness: 0.2 });

    const bWidth = 4.8 * Math.max(0.85, Math.min(1.3, plotAspect));
    const bDepth = 4.0 / Math.max(0.85, Math.min(1.3, plotAspect));

    // Floor by Floor Construction
    for (let f = 0; f < numFloors; f++) {
      const yBase = f * floorH;

      // Slab
      const slabGeo = new THREE.BoxGeometry(bWidth + 0.35, 0.12, bDepth + 0.35);
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.set(0, yBase + 0.06, 0);
      slab.castShadow = true;
      slab.receiveShadow = true;
      buildingGroup.add(slab);

      if (f === 0 && isStilt) {
        // Stilt Columns
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
      } else {
        // Walls
        const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(bWidth, floorH - 0.12, bDepth), facadeMat);
        wallMesh.position.set(0, yBase + floorH / 2, 0);
        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;
        buildingGroup.add(wallMesh);

        // Architectural Fin
        const fin = new THREE.Mesh(new THREE.BoxGeometry(0.18, floorH - 0.12, bDepth + 0.15), accentMat);
        fin.position.set(-bWidth / 3.8, yBase + floorH / 2, 0);
        fin.castShadow = true;
        buildingGroup.add(fin);

        // Windows
        const createWindow = (wx: number, wy: number, wz: number, wW: number, wH: number) => {
          const winGroup = new THREE.Group();
          const frame = new THREE.Mesh(new THREE.BoxGeometry(wW + 0.08, wH + 0.08, 0.08), frameMat);
          winGroup.add(frame);
          const glass = new THREE.Mesh(new THREE.BoxGeometry(wW, wH, 0.04), glassMat);
          winGroup.add(glass);
          winGroup.position.set(wx, wy, wz);
          buildingGroup.add(winGroup);
        };

        createWindow(-1.1, yBase + floorH / 2 + 0.05, bDepth / 2 + 0.04, 1.3, 0.8);
        createWindow(1.2, yBase + floorH / 2 + 0.05, bDepth / 2 + 0.04, 1.3, 0.8);

        if (f === 0) {
          const door = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.05, 0.08), doorMat);
          door.position.set(0, 0.58, bDepth / 2 + 0.07);
          door.castShadow = true;
          buildingGroup.add(door);
        }

        // Balconies
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
    }

    // Terrace Level
    const terraceY = numFloors * floorH;
    const roof = new THREE.Mesh(new THREE.BoxGeometry(bWidth + 0.4, 0.14, bDepth + 0.4), slabMat);
    roof.position.set(0, terraceY + 0.07, 0);
    roof.castShadow = true;
    buildingGroup.add(roof);

    // Orange Roof Ridge Accent (Hutty signature detail)
    const ridgeGeo = new THREE.BoxGeometry(bWidth + 0.44, 0.08, 0.08);
    const ridgeMat = new THREE.MeshStandardMaterial({ color: roofHex, roughness: 0.3 });
    const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
    ridge.position.set(0, terraceY + 0.16, bDepth / 2 + 0.2);
    buildingGroup.add(ridge);

    // Parapet Wall
    const pHeight = 0.38;
    const pMat = new THREE.MeshStandardMaterial({ color: facadeHex, roughness: 0.5 });
    const pFront = new THREE.Mesh(new THREE.BoxGeometry(bWidth + 0.4, pHeight, 0.1), pMat);
    pFront.position.set(0, terraceY + pHeight / 2 + 0.14, bDepth / 2 + 0.15);
    buildingGroup.add(pFront);

    // Staircase Headroom Cabin on Terrace
    const cabinH = hasLift ? 1.5 : 1.1;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, cabinH, 1.8), facadeMat);
    cabin.position.set(-bWidth / 2 + 1.2, terraceY + cabinH / 2 + 0.14, -bDepth / 2 + 1.2);
    cabin.castShadow = true;
    buildingGroup.add(cabin);

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
    };
  }, [
    numFloors,
    isStilt,
    carCount,
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
    isAutoRotating,
    isNightMode,
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
    if (cameraRef.current) {
      const centerY = (numFloors * 1.35) / 2 + 0.2;
      const cameraDistZ = 13.0 + (numFloors - 1) * 1.4 + Math.max(0, (plotAspect - 1) * 2.2);
      const cameraDistY = centerY + 3.4;
      cameraRef.current.position.set(0, cameraDistY, cameraDistZ);
      cameraRef.current.lookAt(0, centerY, 0);
      setZoomLevel(1);
    }
  };

  const handleZoom = (factor: number) => {
    if (!cameraRef.current) return;
    const newZoom = Math.max(0.6, Math.min(1.8, zoomLevel * factor));
    setZoomLevel(newZoom);
    const centerY = (numFloors * 1.35) / 2 + 0.2;
    const cameraDistZ = (13.0 + (numFloors - 1) * 1.4 + Math.max(0, (plotAspect - 1) * 2.2)) / newZoom;
    const cameraDistY = (centerY + 3.4) / newZoom;
    cameraRef.current.position.set(0, cameraDistY, cameraDistZ);
    cameraRef.current.lookAt(0, centerY, 0);
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
        className="w-full h-72 sm:h-80 lg:h-[360px] xl:h-[400px] cursor-grab active:cursor-grabbing"
      />

      {/* Floating Badges */}
      <div className="absolute top-3 left-3 flex items-center gap-2 bg-[#1B3D34]/90 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-white pointer-events-none">
        <Box className="w-3.5 h-3.5 text-[#F28C28]" />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {city || 'Bangalore'} &bull; {houseType || 'Duplex'}
        </span>
      </div>

      <div className="absolute top-3 right-3 flex items-center gap-1">
        <span className="bg-[#F28C28] px-2.5 py-0.5 rounded-md text-[#1B3D34] text-[10px] font-extrabold shadow-xs pointer-events-none">
          {floors === 1 ? 'Ground Level' : `G+${(floors || 2) - 1}`}
        </span>
      </div>

      {/* 3D Controls */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-[#1B3D34]/90 backdrop-blur-md p-1 rounded-xl border border-white/15">
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
