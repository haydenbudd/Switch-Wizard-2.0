import { createElement, type ElementType, type SVGProps } from 'react';
import {
  Factory,
  Heart,
  Car,
  Hammer,
  Palette,
  Coffee,
  Zap,
  Wind,
  Radio,
  CircleDot,
  ToggleLeft,
  Gauge,
  Building2,
  Briefcase,
  ShieldCheck,
  ShieldOff,
  Anvil,
  Box,
  Layers,
  Circle,
  Feather,
  Scale,
  Wrench,
  Leaf,
  Shield,
  Sun,
  CloudRain,
  Droplets,
  Minus,
  Cable,
  Plug,
  Unplug,
  Sparkles,
} from 'lucide-react';

// Factory that creates a Lucide-compatible SVG icon component displaying a number
function NumberIcon(n: number): ElementType {
  const component = (props: SVGProps<SVGSVGElement>) =>
    createElement('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round' as const,
      strokeLinejoin: 'round' as const,
      ...props,
    },
      createElement('circle', { cx: 12, cy: 12, r: 10, strokeWidth: 1.5 }),
      createElement('text', {
        x: 12,
        y: 12,
        textAnchor: 'middle',
        dominantBaseline: 'central',
        fill: 'currentColor',
        stroke: 'none',
        fontSize: '12',
        fontWeight: '700',
        fontFamily: 'system-ui, sans-serif',
      }, String(n)),
    );
  component.displayName = `NumberIcon${n}`;
  return component;
}

export interface Option {
  id: string;
  label: string;
  icon?: ElementType;
  description: string;
  isMedical?: boolean;
  availableFor?: string[];
  hideFor?: string[];
  parentCategory?: string;
  sortOrder?: number;
}

export const categories: Option[] = [
  {
    id: 'industrial',
    label: 'Industrial & Manufacturing',
    icon: Building2,
    description: 'Heavy-duty, rugged industrial environments',
  },
  {
    id: 'medical',
    label: 'Medical & Healthcare',
    icon: Heart,
    description: 'Surgical, diagnostic, patient care equipment',
    isMedical: true,
  },
  {
    id: 'commercial',
    label: 'Commercial & Specialty',
    icon: Briefcase,
    description: 'Automotive, creative, and general-purpose applications',
  },
];

export const applications: Option[] = [
  // Industrial sub-applications
  {
    id: 'manufacturing',
    label: 'Manufacturing',
    icon: Factory,
    description: 'CNC, assembly lines, woodworking, heavy machinery',
    parentCategory: 'industrial',
  },
  {
    id: 'automotive',
    label: 'Automotive',
    icon: Car,
    description: 'Lifts, paint booths, tire changers, body shops',
    parentCategory: 'industrial',
  },
  {
    id: 'construction',
    label: 'Construction',
    icon: Hammer,
    description: 'Heavy equipment, welding, fabrication',
    parentCategory: 'industrial',
  },
  {
    id: 'utilities',
    label: 'Utilities',
    icon: Wrench,
    description: 'Power plants, water treatment, infrastructure',
    parentCategory: 'industrial',
  },
  {
    id: 'agriculture',
    label: 'Agriculture',
    icon: Leaf,
    description: 'Farm equipment, processing, packaging',
    parentCategory: 'industrial',
  },
  {
    id: 'defense',
    label: 'Defense',
    icon: Shield,
    description: 'Military, government, security applications',
    parentCategory: 'industrial',
  },
  // Medical
  {
    id: 'medical',
    label: 'Medical & Healthcare',
    icon: Heart,
    description: 'Surgical, diagnostic, patient care',
    isMedical: true,
    parentCategory: 'medical',
  },
  // Commercial sub-applications
  {
    id: 'tattoo',
    label: 'Tattoo & Body Art',
    icon: Palette,
    description: 'Precision control for artists',
    parentCategory: 'commercial',
  },
  {
    id: 'general',
    label: 'General / Other',
    icon: Coffee,
    description: 'Office, consumer, specialty',
    parentCategory: 'commercial',
  },
];

export const technologies: Option[] = [
  {
    id: 'electrical',
    label: 'Electrical',
    icon: Zap,
    description: 'Standard wired connection.',
    availableFor: ['manufacturing', 'automotive', 'construction', 'utilities', 'agriculture', 'defense', 'tattoo', 'general'],
  },
  {
    id: 'pneumatic',
    label: 'Pneumatic (Air)',
    icon: Wind,
    description: 'Uses compressed air.',
    availableFor: ['manufacturing', 'automotive', 'construction', 'utilities', 'agriculture', 'general'],
  },
  {
    id: 'wireless',
    label: 'RF Wireless',
    icon: Radio,
    description: 'Cord-free operation.',
    availableFor: ['manufacturing', 'automotive', 'construction', 'utilities', 'agriculture', 'defense', 'general'],
  },
];

export const actions: Option[] = [
  {
    id: 'momentary',
    label: 'Momentary',
    icon: CircleDot,
    description: 'Active while pressed.',
    availableFor: ['electrical', 'pneumatic', 'wireless'],
  },
  {
    id: 'maintained',
    label: 'Maintained',
    icon: ToggleLeft,
    description: 'Press ON, press again OFF.',
    availableFor: ['electrical', 'pneumatic'],
  },
  {
    id: 'variable',
    label: 'Variable Speed',
    icon: Gauge,
    description: 'Speed varies with pressure.',
    availableFor: ['electrical', 'pneumatic'],
  },
];

export const environments: Option[] = [
  {
    id: 'open',
    label: 'Open / Unprotected',
    icon: Sparkles,
    description: 'IPXX — basic or no ingress protection.',
  },
  {
    id: 'dry',
    label: 'Dry / Indoor',
    icon: Sun,
    description: 'IP20 — protected from solid objects.',
  },
  {
    id: 'damp',
    label: 'Damp / Splash',
    icon: CloudRain,
    description: 'IP56 — splash and dust proof.',
  },
  {
    id: 'wet',
    label: 'Wet / Washdown',
    icon: Droplets,
    description: 'IP68 — fully submersible.',
  },
  {
    id: 'any',
    label: 'No Preference',
    icon: Minus,
    description: 'Show all IP ratings.',
  },
];

export const features: Option[] = [
  {
    id: 'shield',
    label: 'Safety Guard/Shield',
    description: 'Prevents accidental activation.',
  },
  {
    id: 'multi_stage',
    label: 'Multi-Stage',
    description: '2 or 3 actuation points.',
  },
  {
    id: 'twin',
    label: 'Twin Pedal',
    description: 'Two independent pedals.',
  },
  {
    id: 'custom_cable',
    label: 'Custom Cable Length',
    description: 'Non-standard cord length.',
    hideFor: ['wireless', 'pneumatic'],
  },
  {
    id: 'custom_connector',
    label: 'Custom Connector',
    description: 'Specific plug type.',
  },
];

export const consoleStyles: Option[] = [
  {
    id: 'aero',
    label: 'Aero Channel',
    description: 'Low-profile, streamlined design.',
  },
  {
    id: 'custom',
    label: 'Custom Design',
    description: 'Unique housing tailored to your needs.',
  },
];

export const pedalCounts: Option[] = [
  { id: '1', label: 'Single', description: 'One function' },
  { id: '2', label: 'Dual', description: 'Two functions' },
  { id: '3', label: 'Triple', description: 'Three functions' },
  { id: '4+', label: 'Multi', description: '4+ controls' },
];

export const medicalTechnicalFeatures: Option[] = [
  {
    id: 'wireless',
    label: 'RF Wireless',
    description: 'No cords in the OR.',
  },
  {
    id: 'linear',
    label: 'Variable Speed',
    description: 'Proportional control.',
  },
  {
    id: 'sealed',
    label: 'Sealed / Washdown',
    description: 'IP68 for sterilization.',
  },
];

export const accessories: Option[] = [
  {
    id: 'toe_loops',
    label: 'Toe Loops',
    description: 'Secure foot positioning.',
  },
  {
    id: 'guards',
    label: 'Pedal Guards',
    description: 'Prevent accidental activation.',
  },
  {
    id: 'labels',
    label: 'Custom Labels/Marking',
    description: 'Branding or identification.',
  },
  {
    id: 'color',
    label: 'Custom Color',
    description: 'Match your device.',
  },
];

export const guards: Option[] = [
  {
    id: 'yes',
    label: 'Yes, Add Guard',
    icon: ShieldCheck,
    description: 'Safety guard prevents accidental activation.',
  },
  {
    id: 'no',
    label: 'No Guard Needed',
    icon: ShieldOff,
    description: 'No safety guard required.',
  },
];

export const duties: Option[] = [
  {
    id: 'light',
    label: 'Light Duty',
    icon: Feather,
    description: 'Compact and portable. Polymer construction for lighter tasks and general use.',
    sortOrder: 0
  },
  {
    id: 'medium',
    label: 'Medium Duty',
    icon: Scale,
    description: 'Balanced durability and weight. Polymer or stamped metal for everyday industrial use.',
    sortOrder: 1
  },
  {
    id: 'heavy',
    label: 'Heavy Duty',
    icon: Anvil,
    description: 'Maximum stability. Cast metal construction stays firmly in place. Best for machinery and high-force applications.',
    sortOrder: 2
  },
];

export const materials: Option[] = [
  {
    id: 'Cast Iron',
    label: 'Cast Iron',
    icon: Anvil,
    description: 'Heaviest and most stable. Classic industrial choice.',
    sortOrder: 0
  },
  {
    id: 'Cast Aluminum',
    label: 'Cast Aluminum',
    icon: Box,
    description: 'Lighter than iron with good corrosion resistance.',
    sortOrder: 1
  },
  {
    id: 'Formed Steel',
    label: 'Formed Steel',
    icon: Layers,
    description: 'Cost-effective metal construction.',
    sortOrder: 2
  },
  {
    id: 'Cast Zinc',
    label: 'Cast Zinc',
    icon: Circle,
    description: 'Compact metal. Smooth omnidirectional design.',
    sortOrder: 3
  },
  {
    id: 'Polymeric',
    label: 'Polymeric',
    icon: Feather,
    description: 'Lightweight plastic. Easy to reposition.',
    sortOrder: 4
  },
  {
    id: 'Stainless Steel',
    label: 'Stainless Steel',
    icon: Sparkles,
    description: 'Corrosion-resistant. Ideal for washdown environments.',
    sortOrder: 5
  },
  {
    id: 'Vinyl Bulb',
    label: 'Vinyl Bulb',
    icon: Circle,
    description: 'Soft, flexible actuator for light-touch applications.',
    sortOrder: 6
  },
];

export const circuitCounts: Option[] = [
  {
    id: '1',
    label: 'Single Circuit',
    icon: NumberIcon(1),
    description: 'Controls one circuit.',
    sortOrder: 0,
  },
  {
    id: '2',
    label: 'Two Circuits',
    icon: NumberIcon(2),
    description: 'Controls two independent circuits.',
    sortOrder: 1,
  },
  {
    id: '3',
    label: 'Three Circuits',
    icon: NumberIcon(3),
    description: 'Controls three independent circuits.',
    sortOrder: 2,
  },
  {
    id: '4',
    label: 'Four Circuits',
    icon: NumberIcon(4),
    description: 'Controls four independent circuits.',
    sortOrder: 3,
  },
  {
    id: 'no_preference',
    label: 'No Preference',
    icon: Minus,
    description: 'Show all options.',
    sortOrder: 99,
  },
];

export const connections: Option[] = [
  {
    id: 'screw-terminal',
    label: 'Screw Terminal',
    icon: Unplug,
    description: 'Standard screw-down wire terminals for permanent wiring.',
    sortOrder: 0
  },
  {
    id: 'quick-connect',
    label: 'Quick Connect',
    icon: Plug,
    description: 'Snap-fit connectors for fast installation and replacement.',
    sortOrder: 1
  },
  {
    id: 'pre-wired',
    label: 'Pre-Wired Cable',
    icon: Cable,
    description: 'Factory-attached cable ready for direct connection.',
    sortOrder: 2
  },
];
