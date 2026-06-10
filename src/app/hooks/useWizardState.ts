import { useState, useCallback } from 'react';

type FlowType = 'standard' | 'medical';

/**
 * The serializable slice of wizard state — used by localStorage persistence
 * (and restorable from share URLs via applyPartial). Adding a wizard field?
 * Update this interface, takeSnapshot, and applyPartial — all in this file.
 */
export interface WizardSnapshot {
  step: number;
  flow: FlowType;
  selectedCategory: string;
  selectedApplication: string;
  selectedTechnology: string;
  selectedAction: string;
  selectedEnvironment: string;
  selectedDuty: string;
  selectedMaterial: string;
  selectedConnection: string;
  selectedCircuitCount: string;
  selectedGuard: string;
  selectedFeatures: string[];
  // Medical flow + custom builder
  selectedMedicalPath: string;
  selectedConsoleStyle: string;
  selectedPedalCount: string;
  selectedMedicalFeatures: string[];
  selectedAccessories: string[];
  selectedChannel: string;
  selectedPedalDesign: string;
  selectedButtonCount: string;
  selectedOutputType: string;
  selectedWiredWireless: string;
  selectedToeLoop: string;
  selectedTreadleType: string;
  selectedCustomLabeling: string;
  selectedLEDs: string;
}

/** Extract the persistable slice of the live wizard state. */
export function takeSnapshot(state: WizardState): WizardSnapshot {
  return {
    step: state.step,
    flow: state.flow,
    selectedCategory: state.selectedCategory,
    selectedApplication: state.selectedApplication,
    selectedTechnology: state.selectedTechnology,
    selectedAction: state.selectedAction,
    selectedEnvironment: state.selectedEnvironment,
    selectedDuty: state.selectedDuty,
    selectedMaterial: state.selectedMaterial,
    selectedConnection: state.selectedConnection,
    selectedCircuitCount: state.selectedCircuitCount,
    selectedGuard: state.selectedGuard,
    selectedFeatures: state.selectedFeatures,
    selectedMedicalPath: state.selectedMedicalPath,
    selectedConsoleStyle: state.selectedConsoleStyle,
    selectedPedalCount: state.selectedPedalCount,
    selectedMedicalFeatures: state.selectedMedicalFeatures,
    selectedAccessories: state.selectedAccessories,
    selectedChannel: state.selectedChannel,
    selectedPedalDesign: state.selectedPedalDesign,
    selectedButtonCount: state.selectedButtonCount,
    selectedOutputType: state.selectedOutputType,
    selectedWiredWireless: state.selectedWiredWireless,
    selectedToeLoop: state.selectedToeLoop,
    selectedTreadleType: state.selectedTreadleType,
    selectedCustomLabeling: state.selectedCustomLabeling,
    selectedLEDs: state.selectedLEDs,
  };
}

export interface WizardState {
  flow: FlowType;
  step: number;
  selectedCategory: string; // New top-level selection
  selectedApplication: string;
  selectedTechnology: string;
  selectedAction: string;
  selectedEnvironment: string;
  selectedDuty: string;
  selectedMaterial: string;
  selectedConnection: string;
  selectedCircuitCount: string;
  selectedGuard: string;
  selectedPedalConfig: string;
  selectedFeatures: string[];
  // Medical flow
  selectedMedicalPath: string;
  selectedConsoleStyle: string;
  selectedPedalCount: string;
  selectedMedicalFeatures: string[];
  selectedAccessories: string[];
  // Custom switch builder
  selectedChannel: string;
  selectedPedalDesign: string;
  selectedButtonCount: string;
  selectedOutputType: string;
  selectedWiredWireless: string;
  selectedToeLoop: string;
  selectedTreadleType: string;
  selectedCustomLabeling: string;
  selectedLEDs: string;
  // Setters
  setFlow: (flow: FlowType) => void;
  setStep: (step: number) => void;
  setSelectedCategory: (id: string) => void; // New
  setSelectedApplication: (id: string) => void;
  setSelectedTechnology: (id: string) => void;
  setSelectedAction: (id: string) => void;
  setSelectedEnvironment: (id: string) => void;
  setSelectedDuty: (id: string) => void;
  setSelectedMaterial: (id: string) => void;
  setSelectedConnection: (id: string) => void;
  setSelectedCircuitCount: (id: string) => void;
  setSelectedGuard: (id: string) => void;
  setSelectedPedalConfig: (id: string) => void;
  setSelectedFeatures: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedMedicalPath: (id: string) => void;
  setSelectedConsoleStyle: (id: string) => void;
  setSelectedPedalCount: (id: string) => void;
  setSelectedMedicalFeatures: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedAccessories: React.Dispatch<React.SetStateAction<string[]>>;
  // Custom switch builder setters
  setSelectedChannel: (id: string) => void;
  setSelectedPedalDesign: (id: string) => void;
  setSelectedButtonCount: (id: string) => void;
  setSelectedOutputType: (id: string) => void;
  setSelectedWiredWireless: (id: string) => void;
  setSelectedToeLoop: (id: string) => void;
  setSelectedTreadleType: (id: string) => void;
  setSelectedCustomLabeling: (id: string) => void;
  setSelectedLEDs: (id: string) => void;
  /** Apply a restored snapshot (share URL / localStorage). Skips empty values. */
  applyPartial: (partial: Partial<WizardSnapshot>) => void;
  resetWizard: () => void;
}

export function useWizardState(): WizardState {
  const [flow, setFlow] = useState<FlowType>('standard');
  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedApplication, setSelectedApplication] = useState('');
  const [selectedTechnology, setSelectedTechnology] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedEnvironment, setSelectedEnvironment] = useState('');
  const [selectedDuty, setSelectedDuty] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedConnection, setSelectedConnection] = useState('');
  const [selectedCircuitCount, setSelectedCircuitCount] = useState('');
  const [selectedGuard, setSelectedGuard] = useState('');
  const [selectedPedalConfig, setSelectedPedalConfig] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  // Medical flow
  const [selectedMedicalPath, setSelectedMedicalPath] = useState('');
  const [selectedConsoleStyle, setSelectedConsoleStyle] = useState('');
  const [selectedPedalCount, setSelectedPedalCount] = useState('');
  const [selectedMedicalFeatures, setSelectedMedicalFeatures] = useState<string[]>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  // Custom switch builder
  const [selectedChannel, setSelectedChannel] = useState('');
  const [selectedPedalDesign, setSelectedPedalDesign] = useState('');
  const [selectedButtonCount, setSelectedButtonCount] = useState('');
  const [selectedOutputType, setSelectedOutputType] = useState('');
  const [selectedWiredWireless, setSelectedWiredWireless] = useState('');
  const [selectedToeLoop, setSelectedToeLoop] = useState('');
  const [selectedTreadleType, setSelectedTreadleType] = useState('');
  const [selectedCustomLabeling, setSelectedCustomLabeling] = useState('');
  const [selectedLEDs, setSelectedLEDs] = useState('');

  const applyPartial = useCallback((partial: Partial<WizardSnapshot>) => {
    if (partial.selectedCategory) setSelectedCategory(partial.selectedCategory);
    if (partial.selectedApplication) setSelectedApplication(partial.selectedApplication);
    if (partial.selectedTechnology) setSelectedTechnology(partial.selectedTechnology);
    if (partial.selectedAction) setSelectedAction(partial.selectedAction);
    if (partial.selectedEnvironment) setSelectedEnvironment(partial.selectedEnvironment);
    if (partial.selectedDuty) setSelectedDuty(partial.selectedDuty);
    if (partial.selectedMaterial) setSelectedMaterial(partial.selectedMaterial);
    if (partial.selectedConnection) setSelectedConnection(partial.selectedConnection);
    if (partial.selectedCircuitCount) setSelectedCircuitCount(partial.selectedCircuitCount);
    if (partial.selectedGuard) setSelectedGuard(partial.selectedGuard);
    if (Array.isArray(partial.selectedFeatures) && partial.selectedFeatures.length) setSelectedFeatures(partial.selectedFeatures);
    if (partial.selectedMedicalPath) setSelectedMedicalPath(partial.selectedMedicalPath);
    if (partial.selectedConsoleStyle) setSelectedConsoleStyle(partial.selectedConsoleStyle);
    if (partial.selectedPedalCount) setSelectedPedalCount(partial.selectedPedalCount);
    if (Array.isArray(partial.selectedMedicalFeatures) && partial.selectedMedicalFeatures.length) setSelectedMedicalFeatures(partial.selectedMedicalFeatures);
    if (Array.isArray(partial.selectedAccessories) && partial.selectedAccessories.length) setSelectedAccessories(partial.selectedAccessories);
    if (partial.selectedChannel) setSelectedChannel(partial.selectedChannel);
    if (partial.selectedPedalDesign) setSelectedPedalDesign(partial.selectedPedalDesign);
    if (partial.selectedButtonCount) setSelectedButtonCount(partial.selectedButtonCount);
    if (partial.selectedOutputType) setSelectedOutputType(partial.selectedOutputType);
    if (partial.selectedWiredWireless) setSelectedWiredWireless(partial.selectedWiredWireless);
    if (partial.selectedToeLoop) setSelectedToeLoop(partial.selectedToeLoop);
    if (partial.selectedTreadleType) setSelectedTreadleType(partial.selectedTreadleType);
    if (partial.selectedCustomLabeling) setSelectedCustomLabeling(partial.selectedCustomLabeling);
    if (partial.selectedLEDs) setSelectedLEDs(partial.selectedLEDs);
    if (partial.flow === 'standard' || partial.flow === 'medical') setFlow(partial.flow);
    // step 0 is legitimate — guard on type, not truthiness
    if (typeof partial.step === 'number') setStep(partial.step);
  }, []);

  const resetWizard = useCallback(() => {
    setFlow('standard');
    setStep(0);
    setSelectedCategory('');
    setSelectedApplication('');
    setSelectedTechnology('');
    setSelectedAction('');
    setSelectedEnvironment('');
    setSelectedDuty('');
    setSelectedMaterial('');
    setSelectedConnection('');
    setSelectedCircuitCount('');
    setSelectedGuard('');
    setSelectedPedalConfig('');
    setSelectedFeatures([]);
    setSelectedMedicalPath('');
    setSelectedConsoleStyle('');
    setSelectedPedalCount('');
    setSelectedMedicalFeatures([]);
    setSelectedAccessories([]);
    setSelectedChannel('');
    setSelectedPedalDesign('');
    setSelectedButtonCount('');
    setSelectedOutputType('');
    setSelectedWiredWireless('');
    setSelectedToeLoop('');
    setSelectedTreadleType('');
    setSelectedCustomLabeling('');
    setSelectedLEDs('');
  }, []);

  return {
    flow,
    step,
    selectedCategory,
    selectedApplication,
    selectedTechnology,
    selectedAction,
    selectedEnvironment,
    selectedDuty,
    selectedMaterial,
    selectedConnection,
    selectedCircuitCount,
    selectedGuard,
    selectedPedalConfig,
    selectedFeatures,
    selectedMedicalPath,
    selectedConsoleStyle,
    selectedPedalCount,
    selectedMedicalFeatures,
    selectedAccessories,
    setFlow,
    setStep,
    setSelectedCategory,
    setSelectedApplication,
    setSelectedTechnology,
    setSelectedAction,
    setSelectedEnvironment,
    setSelectedDuty,
    setSelectedMaterial,
    setSelectedConnection,
    setSelectedCircuitCount,
    setSelectedGuard,
    setSelectedPedalConfig,
    setSelectedFeatures,
    setSelectedMedicalPath,
    setSelectedConsoleStyle,
    setSelectedPedalCount,
    setSelectedMedicalFeatures,
    setSelectedAccessories,
    selectedChannel,
    selectedPedalDesign,
    selectedButtonCount,
    selectedOutputType,
    selectedWiredWireless,
    selectedToeLoop,
    selectedTreadleType,
    selectedCustomLabeling,
    selectedLEDs,
    setSelectedChannel,
    setSelectedPedalDesign,
    setSelectedButtonCount,
    setSelectedOutputType,
    setSelectedWiredWireless,
    setSelectedToeLoop,
    setSelectedTreadleType,
    setSelectedCustomLabeling,
    setSelectedLEDs,
    applyPartial,
    resetWizard,
  };
}
