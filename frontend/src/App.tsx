import { useEffect, useState, useCallback } from 'react';
import { Sidebar, type ActiveScreen } from './components/Navigation/Sidebar';
import { Header } from './components/Navigation/Header';

// Screen Views
import { CommandCenterView } from './views/CommandCenterView';
import { FleetView } from './views/FleetView';
import { NetworkView } from './views/NetworkView';
import { AiRoutingView } from './views/AiRoutingView';
import { SupplyContinuityView } from './views/SupplyContinuityView';
import { FieldOperationsView } from './views/FieldOperationsView';
import { AlertsView } from './views/AlertsView';
import { AnalyticsView } from './views/AnalyticsView';
import { AdministrationView } from './views/AdministrationView';

// Modals
import { FieldReportModal } from './components/Dashboard/FieldReportModal';
import { AlertCenter } from './components/Dashboard/AlertCenter';
import { MultilingualAlertModal } from './components/Dashboard/MultilingualAlertModal';
import { DemoChecklistModal } from './components/Dashboard/DemoChecklistModal';
import { WhatIfSimulatorModal } from './components/Dashboard/WhatIfSimulatorModal';
import { JudgeDifferentiationModal } from './components/Dashboard/JudgeDifferentiationModal';

// Hooks & Utilities
import { useSimulationSocket } from './hooks/useSimulationSocket';
import { offlineQueue } from './utils/offlineQueue';
import {
  fetchRoads,
  fetchBridges,
  fetchVehicles,
  fetchRoutes,
  fetchHazards,
  fetchSimulationStatus,
  fetchTimeline,
  fetchWeather,
  fetchFieldReports,
  fetchAlerts,
  fetchSupplyAssessment,
  fetchSupplyImpact,
  fetchDecisions,
  fetchScenarios,
  stepScenario,
  resetScenario,
  triggerFloodScenario,
  resetSimulation,
} from './api/client';
import type {
  Road,
  Bridge,
  Vehicle,
  RouteData,
  Hazard,
  SimulationStatus,
  WeatherObservation,
  FieldReport,
  AlertItem,
  DistrictAssessment,
  SupplyImpactGraph,
  StrategyResult,
} from './types';

export function App() {
  const [roads, setRoads] = useState<Road[]>([]);
  const [bridges, setBridges] = useState<Bridge[]>([]);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [vehiclesList, setVehiclesList] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [weather, setWeather] = useState<WeatherObservation[]>([]);
  const [fieldReports, setFieldReports] = useState<FieldReport[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [assessments, setAssessments] = useState<DistrictAssessment[]>([]);
  const [supplyImpact, setSupplyImpact] = useState<SupplyImpactGraph | null>(null);
  const [simulation, setSimulation] = useState<SimulationStatus | null>(null);
  const [previewRoute, setPreviewRoute] = useState<StrategyResult | null>(null);

  // Active Screen View
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('command-center');
  const [activeRole, setActiveRole] = useState<string>(
    () => localStorage.getItem('sih26002_active_role') || 'ADMIN'
  );

  // Modals & Offline state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isMultilingualModalOpen, setIsMultilingualModalOpen] = useState(false);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [isWhatIfModalOpen, setIsWhatIfModalOpen] = useState(false);
  const [isJudgeModalOpen, setIsJudgeModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueueCount, setOfflineQueueCount] = useState(offlineQueue.getQueueLength());

  // Load initial backend data
  const loadData = useCallback(async () => {
    try {
      const [
        rData,
        bData,
        vData,
        rtData,
        hData,
        simData,
        ,
        wData,
        frData,
        aData,
        assessData,
        impData,
        ,
        ,
      ] = await Promise.all([
        fetchRoads().catch(() => []),
        fetchBridges().catch(() => []),
        fetchVehicles().catch(() => []),
        fetchRoutes().catch(() => []),
        fetchHazards().catch(() => []),
        fetchSimulationStatus().catch(() => null),
        fetchTimeline().catch(() => []),
        fetchWeather().catch(() => []),
        fetchFieldReports().catch(() => []),
        fetchAlerts().catch(() => []),
        fetchSupplyAssessment().catch(() => []),
        fetchSupplyImpact().catch(() => null),
        fetchDecisions().catch(() => []),
        fetchScenarios().catch(() => null),
      ]);

      setRoads(rData);
      setBridges(bData);
      setVehiclesList(vData);
      setRoutes(rtData);
      setHazards(hData);
      setSimulation(simData);
      setWeather(wData);
      setFieldReports(frData);
      setAlerts(aData);
      setAssessments(assessData);
      setSupplyImpact(impData);

      if (vData && vData.length > 0) {
        setVehicle(vData[0]);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Network Online/Offline state & auto queue sync
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      if (offlineQueue.getQueueLength() > 0) {
        await offlineQueue.syncPendingReports();
        setOfflineQueueCount(offlineQueue.getQueueLength());
        loadData();
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadData]);

  // Real-time WebSocket Live Feed
  const handleVehicleTick = useCallback((status: SimulationStatus) => {
    setSimulation(status);
  }, []);

  const handleFullStateUpdate = useCallback((status: SimulationStatus) => {
    setSimulation(status);
    loadData();
  }, [loadData]);

  const { isConnected: wsConnected } = useSimulationSocket({
    onVehicleTick: handleVehicleTick,
    onFullStateUpdate: handleFullStateUpdate,
    onRoadUpdate: loadData,
    onHazardDetected: loadData,
  });

  // Scenario Handlers
  const handleStepScenario = async () => {
    try {
      await stepScenario();
      await loadData();
    } catch (e) {
      console.error('Step scenario failed', e);
    }
  };

  const handleTriggerFlood = async () => {
    try {
      await triggerFloodScenario();
      await loadData();
    } catch (e) {
      console.error('Trigger flood failed', e);
    }
  };

  const handleResetScenario = async () => {
    try {
      await resetScenario();
      await resetSimulation();
      await loadData();
    } catch (e) {
      console.error('Reset scenario failed', e);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9ff] text-[#0b1c30]">
      {/* 1. PERSISTENT LEFT COMMAND RAIL (SIDEBAR) */}
      <Sidebar
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
        activeAlertsCount={alerts.length}
        wsConnected={wsConnected}
        activeRole={activeRole}
        offlineQueueCount={offlineQueueCount}
      />

      {/* 2. MAIN APPLICATION CONTENT AREA */}
      <div className="flex-1 pl-72 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          activeScreen={activeScreen}
          wsConnected={wsConnected}
          isOnline={isOnline}
          offlineQueueCount={offlineQueueCount}
          activeAlertsCount={alerts.length}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onOpenAlertsModal={() => setIsAlertsModalOpen(true)}
          onOpenMultilingualModal={() => setIsMultilingualModalOpen(true)}
          onOpenChecklistModal={() => setIsChecklistModalOpen(true)}
          onOpenWhatIfModal={() => setIsWhatIfModalOpen(true)}
          onOpenJudgeModal={() => setIsJudgeModalOpen(true)}
          onTriggerDemo={handleTriggerFlood}
          onResetDemo={handleResetScenario}
          activeRole={activeRole}
          onRoleChange={(role) => {
            setActiveRole(role);
            // Reset to command-center if current screen not accessible in new role
            setActiveScreen('command-center');
          }}
        />

        {/* Workspace Body */}
        <main className="pt-16 flex-1 flex flex-col w-full min-h-[calc(100vh-64px)]">
          {activeScreen === 'command-center' && (
            <CommandCenterView
              roads={roads}
              bridges={bridges}
              vehicle={vehicle}
              routes={routes}
              hazards={hazards}
              weather={weather}
              fieldReports={fieldReports}
              alerts={alerts}
              simulation={simulation}
              previewRoute={previewRoute}
              onStepScenario={handleStepScenario}
              onTriggerFlood={handleTriggerFlood}
              onResetScenario={handleResetScenario}
              onSelectRouteMode={(mode) => console.log(mode)}
            />
          )}

          {activeScreen === 'fleet-and-deliveries' && (
            <FleetView
              vehicles={vehiclesList}
              simulation={simulation}
              onSelectVehicle={(v) => {
                setVehicle(v);
                setActiveScreen('command-center');
              }}
            />
          )}

          {activeScreen === 'network-accessibility' && (
            <NetworkView
              roads={roads}
              bridges={bridges}
            />
          )}

          {activeScreen === 'ai-routing' && (
            <AiRoutingView
              onPreviewRoute={(r) => {
                setPreviewRoute(r);
                setActiveScreen('command-center');
              }}
              onOpenJudgeModal={() => setIsJudgeModalOpen(true)}
            />
          )}

          {activeScreen === 'supply-continuity' && (
            <SupplyContinuityView
              assessments={assessments}
              supplyImpact={supplyImpact}
            />
          )}

          {activeScreen === 'field-operations' && (
            <FieldOperationsView
              fieldReports={fieldReports}
              isOnline={isOnline}
              offlineQueueCount={offlineQueueCount}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onRefreshReports={loadData}
            />
          )}

          {activeScreen === 'alerts' && (
            <AlertsView
              alerts={alerts}
              onOpenMultilingualModal={() => setIsMultilingualModalOpen(true)}
            />
          )}

          {activeScreen === 'analytics' && <AnalyticsView />}

          {activeScreen === 'administration' && <AdministrationView />}
        </main>
      </div>

      {/* 3. APPLICATION MODALS */}
      <FieldReportModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setOfflineQueueCount(offlineQueue.getQueueLength());
        }}
        onReportSubmitted={() => {
          loadData();
          setOfflineQueueCount(offlineQueue.getQueueLength());
        }}
        isOnline={isOnline}
      />

      <AlertCenter
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        alerts={alerts}
      />

      <MultilingualAlertModal
        isOpen={isMultilingualModalOpen}
        onClose={() => setIsMultilingualModalOpen(false)}
        initialAlertId={alerts[0]?.id}
      />

      <DemoChecklistModal
        isOpen={isChecklistModalOpen}
        onClose={() => setIsChecklistModalOpen(false)}
      />

      <WhatIfSimulatorModal
        isOpen={isWhatIfModalOpen}
        onClose={() => setIsWhatIfModalOpen(false)}
        onApplyRecommendedRoute={() => {
          handleTriggerFlood();
        }}
      />

      <JudgeDifferentiationModal
        isOpen={isJudgeModalOpen}
        onClose={() => setIsJudgeModalOpen(false)}
        onLaunchHeroSimulation={handleTriggerFlood}
      />
    </div>
  );
}

export default App;
