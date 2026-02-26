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
    resetWizard,
  };
}
