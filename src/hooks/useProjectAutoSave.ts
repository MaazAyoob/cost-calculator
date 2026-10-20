// ==============================================================================
// Hutty Project Auto-Save & Synchronization Hook
// Progressively persists homeowner calculator inputs and calculation snapshots
// to PostgreSQL with debounced auto-save and refresh recovery.
// ==============================================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { useCustomerAuthStore } from '../store/useCustomerAuthStore';
import { useWizardStore } from '../store/useWizardStore';
import { useProjectStore } from '../store/useProjectStore';
import { useArea, useQuantities, useBudgetResult } from '../store/useCalculationStore';
import {
  persistProject,
  updateProject,
  fetchProjectById,
  getCachedProjectId,
  setCachedProjectId,
} from '../services/projectApi';

export type AutoSaveStatus = 'IDLE' | 'SAVING' | 'SAVED' | 'ERROR';

export function useProjectAutoSave() {
  const { isAuthenticated, user } = useCustomerAuthStore();
  const wizard = useWizardStore();
  const area = useArea();
  const quantities = useQuantities();
  const budget = useBudgetResult();

  const [status, setStatus] = useState<AutoSaveStatus>('IDLE');
  const [projectId, setProjectId] = useState<string | null>(getCachedProjectId());
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = useRef<boolean>(true);
  const lastSavedPayloadHashRef = useRef<string>('');
  const isSavingRef = useRef<boolean>(false);
  const pendingSaveRef = useRef<boolean>(false);

  // 1. Initial Load & Recovery on Mount
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;

    async function initializeProjectSession() {
      const cachedId = getCachedProjectId();

      if (cachedId) {
        try {
          const remoteProj = await fetchProjectById(cachedId);
          if (remoteProj && isMounted) {
            setProjectId(remoteProj.id);

            const cfg = remoteProj.configuration;
            const mb = (cfg.materialBrands || {}) as any;
            if (cfg && !wizard.hasStartedSelection) {
              useProjectStore.getState().updateProjectDetails({ name: remoteProj.name });
              useWizardStore.setState({
                city: (remoteProj.city as any) || 'Bangalore',
                authority: (remoteProj.authority as any) || 'BBMP/BDA',
                plotLength: cfg.plotLength || 30,
                plotWidth: cfg.plotWidth || 40,
                floors: cfg.floors || 2,
                houseType: cfg.houseType || 'Duplex',
                parkingType: cfg.parkingType || 'Normal Ground',
                carCount: cfg.carCount || 1,
                bikeCount: cfg.bikeCount || 2,
                evCharging: Boolean(cfg.evCharging),
                liftRequired: Boolean(cfg.liftRequired),
                rooms: cfg.roomsJson || cfg.rooms || {},
                qualityTier: cfg.qualityTier || 'Premium',
                materialBrands: cfg.materialBrands || {},
                ...(mb.doorsDetail ? { doors: mb.doorsDetail } : {}),
                ...(mb.windowsDetail ? { windows: mb.windowsDetail } : {}),
                ...(mb.flooringZones ? { flooringZones: mb.flooringZones } : {}),
                ...(mb.wallCladding ? { wallCladding: mb.wallCladding } : {}),
                ...(mb.electricalDetail
                  ? { electrical: mb.electricalDetail }
                  : mb.electrical
                  ? { electrical: { conduit: 'Heavy-Duty ISI Marked PVC', wireTier: mb.electrical } }
                  : {}),
                ...(mb.bathroomFittings ? { bathroomFittings: mb.bathroomFittings } : {}),
                ...(mb.paintingDetail ? { painting: mb.paintingDetail } : {}),
                hasStartedSelection: true,
              });
            }

            setStatus('SAVED');
            setLastSaved(new Date(remoteProj.updatedAt || Date.now()));
            isInitializingRef.current = false;
            return;
          }
        } catch (err) {
          console.warn('[AutoSave] Failed to recover cached project, provisioning fresh project:', err);
          setProjectId(null);
          setCachedProjectId(null);
        }
      }

      // Provision a fresh project record for this authenticated session
      try {
        const projectName = useProjectStore.getState().project.name || `${wizard.houseType || 'Residential'} Construction Project`;
        const created = await persistProject({
          name: projectName,
          leadEmail: user?.email,
          leadName: user?.name,
          city: wizard.city || 'Bangalore',
          authority: wizard.authority || 'BBMP/BDA',
          configuration: {
            plotLength: wizard.plotLength || 30,
            plotWidth: wizard.plotWidth || 40,
            floors: wizard.floors || 2,
            houseType: wizard.houseType || 'Duplex',
            parkingType: wizard.parkingType || 'Normal Ground',
            carCount: wizard.carCount || 1,
            bikeCount: wizard.bikeCount || 2,
            evCharging: Boolean(wizard.evCharging),
            liftRequired: Boolean(wizard.liftRequired),
            rooms: wizard.rooms || {},
            qualityTier: wizard.qualityTier || 'Premium',
            materialBrands: {
              ...(wizard.materialBrands || {}),
              doorsDetail: wizard.doors,
              windowsDetail: wizard.windows,
              flooringZones: wizard.flooringZones,
              wallCladding: wizard.wallCladding,
              electricalDetail: wizard.electrical,
              bathroomFittings: wizard.bathroomFittings,
              paintingDetail: wizard.painting,
              electrical: wizard.electrical?.wireTier || wizard.materialBrands?.electrical,
            },
          },
        });

        if (isMounted && created) {
          setProjectId(created.id);
          setCachedProjectId(created.id);
          setStatus('SAVED');
          setLastSaved(new Date());
        }
      } catch (err) {
        if (isMounted) setStatus('ERROR');
      } finally {
        isInitializingRef.current = false;
      }
    }

    initializeProjectSession();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.email]);

  // 2. Debounced Auto-Save on Input / Calculation Changes
  const triggerAutoSave = useCallback(async (isRetry: boolean = false) => {
    if (!isAuthenticated || isInitializingRef.current) return;

    if (isSavingRef.current) {
      pendingSaveRef.current = true;
      return;
    }

    const currentProjectName = useProjectStore.getState().project.name || `${wizard.houseType || 'Residential'} Construction Project`;

    // Build payload including all step selections (including Step 8 Electrical & MEP)
    const payload = {
      name: currentProjectName,
      city: wizard.city || 'Bangalore',
      authority: wizard.authority || 'BBMP/BDA',
      configuration: {
        plotLength: wizard.plotLength,
        plotWidth: wizard.plotWidth,
        floors: wizard.floors,
        houseType: wizard.houseType || 'Duplex',
        parkingType: wizard.parkingType || 'Normal Ground',
        carCount: wizard.carCount,
        bikeCount: wizard.bikeCount,
        evCharging: wizard.evCharging,
        liftRequired: wizard.liftRequired,
        rooms: wizard.rooms,
        qualityTier: wizard.qualityTier,
        materialBrands: {
          ...(wizard.materialBrands || {}),
          doorsDetail: wizard.doors,
          windowsDetail: wizard.windows,
          flooringZones: wizard.flooringZones,
          wallCladding: wizard.wallCladding,
          electricalDetail: wizard.electrical,
          bathroomFittings: wizard.bathroomFittings,
          paintingDetail: wizard.painting,
          electrical: wizard.electrical?.wireTier || wizard.materialBrands?.electrical,
        },
      },
      calculation: {
        totalBUASqFt: area.totalBUASqFt,
        totalCostINR: budget.totalProjectCost,
        costPerSqFt: area.totalBUASqFt > 0 ? Math.round(budget.totalProjectCost / area.totalBUASqFt) : 2000,
        steelTonnes: quantities.steelTonnes,
        cementBags: quantities.cementBags,
        concreteCuM: quantities.rccConcreteTotalCuM,
        timelineMonths: 12,
        budgetBreakdown: budget.heads,
        quantitiesJson: quantities,
      },
    };

    // Fast change detection to avoid duplicate writes unless forced by retry
    const payloadHash = JSON.stringify(payload);
    if (!isRetry && payloadHash === lastSavedPayloadHashRef.current && status === 'SAVED') {
      return;
    }

    isSavingRef.current = true;
    setStatus('SAVING');

    try {
      if (!projectId) {
        // Project ID was not yet created or failed earlier; provision now
        const created = await persistProject({
          name: payload.name,
          leadEmail: user?.email,
          leadName: user?.name,
          city: payload.city,
          authority: payload.authority,
          configuration: payload.configuration,
          calculation: payload.calculation,
        });
        if (created) {
          setProjectId(created.id);
          setCachedProjectId(created.id);
          lastSavedPayloadHashRef.current = payloadHash;
          setStatus('SAVED');
          setLastSaved(new Date());
        }
      } else {
        try {
          await updateProject(projectId, payload);
          lastSavedPayloadHashRef.current = payloadHash;
          setStatus('SAVED');
          setLastSaved(new Date());
        } catch (updateErr: any) {
          const msg = updateErr?.message || '';
          if (msg.includes('not found') || msg.includes('404')) {
            console.warn('[AutoSave] Stale project ID not found on server, provisioning fresh project:', projectId);
            setProjectId(null);
            setCachedProjectId(null);
            const created = await persistProject({
              name: payload.name,
              leadEmail: user?.email,
              leadName: user?.name,
              city: payload.city,
              authority: payload.authority,
              configuration: payload.configuration,
              calculation: payload.calculation,
            });
            if (created) {
              setProjectId(created.id);
              setCachedProjectId(created.id);
              lastSavedPayloadHashRef.current = payloadHash;
              setStatus('SAVED');
              setLastSaved(new Date());
            }
          } else {
            throw updateErr;
          }
        }
      }
    } catch (err) {
      console.warn('[AutoSave] Persistence attempt failed:', err);
      setStatus('ERROR');
    } finally {
      isSavingRef.current = false;
      if (pendingSaveRef.current) {
        pendingSaveRef.current = false;
        triggerAutoSave();
      }
    }
  }, [
    isAuthenticated,
    projectId,
    status,
    user?.email,
    user?.name,
    wizard.city,
    wizard.authority,
    wizard.plotLength,
    wizard.plotWidth,
    wizard.floors,
    wizard.houseType,
    wizard.parkingType,
    wizard.carCount,
    wizard.bikeCount,
    wizard.evCharging,
    wizard.liftRequired,
    wizard.rooms,
    wizard.qualityTier,
    wizard.materialBrands,
    wizard.doors,
    wizard.windows,
    wizard.flooringZones,
    wizard.wallCladding,
    wizard.electrical,
    wizard.bathroomFittings,
    wizard.painting,
    area.totalBUASqFt,
    budget.totalProjectCost,
    budget.heads,
    quantities,
  ]);

  const handleRetry = useCallback(() => {
    lastSavedPayloadHashRef.current = '';
    triggerAutoSave(true);
  }, [triggerAutoSave]);

  useEffect(() => {
    if (!isAuthenticated || isInitializingRef.current) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      triggerAutoSave();
    }, 1200);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [triggerAutoSave, isAuthenticated]);

  return {
    status,
    projectId,
    lastSaved,
    triggerAutoSave: handleRetry,
    retryAutoSave: handleRetry,
  };
}
