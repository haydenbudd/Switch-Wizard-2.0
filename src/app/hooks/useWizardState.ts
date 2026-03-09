import { useState, useCallback } from 'react';

type FlowType = 'standard' | 'medical';

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
    resetWizard,
  };
}
