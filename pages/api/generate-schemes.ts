// pages/api/generate-schemes.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  ParsedArchitecture,
  SiteInputs,
  StructuralSchemeOption
} from '../../lib/types';
import {
  eurocodeBeamPlaceholder,
  eurocodeColumnPlaceholder,
  eurocodeSlabPlaceholder
} from '../../lib/eurocode';

type GenerateBody = {
  architecture: ParsedArchitecture;
  siteInputs: SiteInputs;
};

function generateSchemeOptions(architecture: ParsedArchitecture, siteInputs: SiteInputs): StructuralSchemeOption[] {
  const baseAssumptions = [
    `Design basis: Eurocodes with national annex: ${siteInputs.nationalAnnex || 'NOT SET'}.`,
    `Imposed load category: ${siteInputs.imposedUseCategory || 'NOT SET'}.`,
    `Soil type (user input): ${siteInputs.soilType || 'NOT SET'}.`,
    `Wind zone (user input): ${siteInputs.windZone || 'NOT SET'}.`,
    `Seismic zone (user input): ${siteInputs.seismicZone || 'NOT SET'}.`,
    `Importance class: ${siteInputs.importanceClass || 'NOT SET'}.`,
    'Global analysis, load combinations, and detailed Eurocode checks NOT implemented yet.',
    'Member design outputs below are placeholders only.'
  ];

  const typicalBeam = architecture.spans[0]?.id || 'span-1';

  const scheme1: StructuralSchemeOption = {
    id: 'scheme-rc-flat-slab',
    name: 'RC frame with flat slab, core walls for stability',
    description:
      'Reinforced concrete frame in both directions with flat slabs and RC core walls providing lateral stability.',
    lateralSystem: 'RC cores and shear walls around lift/stair cores.',
    gravitySystem: 'RC columns and flat slabs spanning between columns.',
    foundations: 'Pad footings under columns with strip footings/walls under cores (placeholder).',
    keyAssumptions: [
      ...baseAssumptions,
      'Frame and slabs designed to EN 1992-1-1 (not yet implemented).',
      'Lateral stability checked via elastic global analysis (not yet implemented).'
    ],
    members: [
      eurocodeBeamPlaceholder(typicalBeam, 'Typical RC beam along main span (placeholder design).'),
      eurocodeColumnPlaceholder('col-typ-1', 'Typical RC column internal (placeholder design).'),
      eurocodeSlabPlaceholder('slab-typ-1', 'Typical flat slab panel (placeholder design).')
    ]
  };

  const scheme2: StructuralSchemeOption = {
    id: 'scheme-composite-steel',
    name: 'Steel composite frame with concrete core',
    description:
      'Steel beam-and-column frame with composite metal deck slab, concrete cores for stability.',
    lateralSystem: 'RC concrete cores plus some steel bracing (placeholder).',
    gravitySystem: 'Steel beams supporting composite deck slabs, supported on steel columns.',
    foundations: 'Pile caps beneath major columns and cores (placeholder).',
    keyAssumptions: [
      ...baseAssumptions,
      'Steel members designed to EN 1993-1-1 (not yet implemented).',
      'Composite slabs designed to EN 1994-1-1 (not yet implemented).'
    ],
    members: [
      eurocodeBeamPlaceholder(typicalBeam, 'Typical steel composite beam (placeholder design).'),
      eurocodeColumnPlaceholder('col-typ-2', 'Typical steel column (placeholder design).'),
      eurocodeSlabPlaceholder('slab-typ-2', 'Typical composite slab panel (placeholder design).')
    ]
  };

  return [scheme1, scheme2];
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body as GenerateBody;

    if (!body.architecture || !body.siteInputs) {
      return res.status(400).json({ error: 'architecture and siteInputs must be provided.' });
    }

    const schemes = generateSchemeOptions(body.architecture, body.siteInputs);
    return res.status(200).json({ schemes });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to generate structural schemes.', details: error?.message });
  }
}
