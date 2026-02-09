// This interface reflects the EXACT columns found in 'Product Finder 2.xlsx - Summary.csv'
export interface RawProductCSVRow {
  Series: string;
  Part: string;
  'Syteline Status': string;
  Notes?: string;
  'On/Off': 'Mom' | 'Main' | string; // Momentary or Maintained
  Wireless?: string;
  Linear?: string; // "Yes" or empty
  Type: string; // e.g., "Electrical Pneumatic"
  'Type W/o Electrical'?: string;
  PFC?: string;
  'Electrical Pneumatic'?: string;
  'Pneumatic Flow Control'?: string;
  'PFC Config'?: string;
  'Number of Pedals': string; // Usually a string in CSV "1", "2"
  'Circuits Controlled'?: string;
  Functions?: string;
  Stages?: string;
  Configuration?: string; // SPDT, DPDT etc
  'Interior Sub'?: string;
  Microswitch?: string; // IMPORTANT: Link to Microswitch CSV
  'Microswitch Qty'?: string;
  Potentiometer?: string; // If present, implies Linear/Variable
  Guard?: string; // "Yes" or empty
  Connection?: string;
  'IP Rating'?: string;
  Gated?: string;
  Interlock?: string;
  Material?: string;
  Color?: string;
  Link?: string;
}

// This interface reflects the 'Microswitch-PCBA Info.csv'
export interface MicroswitchCSVRow {
  Microswitch: string; // The Key
  'Connection Type': string;
  Configuration: string; // SPDT, SPST
  '125VAC Rating'?: string; // Amperage! e.g., "15A"
  '250VAC Rating'?: string;
  '125VAC HP'?: string; // Horsepower
  Notes?: string;
}