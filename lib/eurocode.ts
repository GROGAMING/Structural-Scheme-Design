// lib/eurocode.ts

import { MemberCalcPlaceholder } from './types';

// WARNING: These are placeholders. No real Eurocode design is implemented.
// Replace with properly validated implementations before any real use.

export function eurocodeBeamPlaceholder(memberId: string, description: string): MemberCalcPlaceholder {
  return {
    memberId,
    memberType: 'beam',
    description,
    designCode: 'EN 1992-1-1 (placeholder only)',
    utilisationRatio: null,
    warnings: [
      'Eurocode beam design not implemented. This is a placeholder.',
      'Implement real design checks before engineering use.'
    ]
  };
}

export function eurocodeColumnPlaceholder(memberId: string, description: string): MemberCalcPlaceholder {
  return {
    memberId,
    memberType: 'column',
    description,
    designCode: 'EN 1992-1-1 (placeholder only)',
    utilisationRatio: null,
    warnings: [
      'Eurocode column design not implemented. This is a placeholder.',
      'Implement real design checks before engineering use.'
    ]
  };
}

export function eurocodeSlabPlaceholder(memberId: string, description: string): MemberCalcPlaceholder {
  return {
    memberId,
    memberType: 'slab',
    description,
    designCode: 'EN 1992-1-1 (placeholder only)',
    utilisationRatio: null,
    warnings: [
      'Eurocode slab design not implemented. This is a placeholder.',
      'Implement real design checks before engineering use.'
    ]
  };
}
