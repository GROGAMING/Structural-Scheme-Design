// lib/types.ts

export type ParsedSpan = {
  id: string;
  description: string;
  direction: 'x' | 'y';
  length_m: number;
  level: string;
};

export type ParsedMaterialSystem = {
  frame: 'reinforced_concrete' | 'steel' | 'unknown';
  slab: 'flat_slab' | 'one_way_slab' | 'composite' | 'unknown';
};

export type ParsedArchitecture = {
  projectName: string;
  storeys: number;
  spans: ParsedSpan[];
  materials: ParsedMaterialSystem;
  assumptions: string[];
};

export type SiteInputs = {
  soilType: string;
  windZone: string;
  seismicZone: string;
  importanceClass: string;
  nationalAnnex: string;
  imposedUseCategory: string;
};

export type MemberCalcPlaceholder = {
  memberId: string;
  memberType: 'beam' | 'column' | 'slab' | 'wall' | 'foundation';
  description: string;
  designCode: string;
  utilisationRatio: number | null;
  warnings: string[];
};

export type StructuralSchemeOption = {
  id: string;
  name: string;
  description: string;
  lateralSystem: string;
  gravitySystem: string;
  foundations: string;
  keyAssumptions: string[];
  members: MemberCalcPlaceholder[];
};
