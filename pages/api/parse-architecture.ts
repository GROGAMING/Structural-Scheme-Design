// pages/api/parse-architecture.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import { ParsedArchitecture } from '../../lib/types';

export const config = {
  api: {
    bodyParser: false
  }
};

type FormidableFiles = { [field: string]: File | File[] };

function parseForm(req: NextApiRequest): Promise<{ fields: formidable.Fields; files: FormidableFiles }> {
  const form = formidable({ multiples: false });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files: files as FormidableFiles });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { files } = await parseForm(req);

    const pdf = files.archDrawing as File;
    if (!pdf) {
      return res.status(400).json({ error: 'No architectural drawing PDF uploaded (field name: archDrawing).' });
    }

    // TODO: Plug in real AI parsing here.
    // For now, return mocked architecture data so the rest of the app works.

    const mockArchitecture: ParsedArchitecture = {
      projectName: pdf.originalFilename || 'Untitled project',
      storeys: 5,
      spans: [
        {
          id: 'span-L1-01',
          description: 'Typical span grid A–B, Level 1',
          direction: 'x',
          length_m: 7.5,
          level: 'Level 1'
        },
        {
          id: 'span-L1-02',
          description: 'Typical span grid B–C, Level 1',
          direction: 'x',
          length_m: 8.0,
          level: 'Level 1'
        },
        {
          id: 'span-L2-01',
          description: 'Typical span grid A–B, Level 2',
          direction: 'x',
          length_m: 7.5,
          level: 'Level 2'
        }
      ],
      materials: {
        frame: 'reinforced_concrete',
        slab: 'flat_slab'
      },
      assumptions: [
        'Architecture parsed with placeholder logic; no real AI parsing yet.',
        'Spans and materials are mocked for demonstration.',
        'Replace with actual AI-based PDF/BIM parsing before real use.'
      ]
    };

    return res.status(200).json({ architecture: mockArchitecture });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to parse architectural drawing.', details: error?.message });
  }
}
