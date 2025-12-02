// pages/index.tsx

import React, { useState } from 'react';
import {
  ParsedArchitecture,
  SiteInputs,
  StructuralSchemeOption
} from '../lib/types';

const defaultSiteInputs: SiteInputs = {
  soilType: '',
  windZone: '',
  seismicZone: '',
  importanceClass: 'II',
  nationalAnnex: 'EN-199x: default (NOT SET)',
  imposedUseCategory: 'Office (Category B)'
};

export default function HomePage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [architecture, setArchitecture] = useState<ParsedArchitecture | null>(null);
  const [siteInputs, setSiteInputs] = useState<SiteInputs>(defaultSiteInputs);
  const [schemes, setSchemes] = useState<StructuralSchemeOption[]>([]);
  const [loadingParse, setLoadingParse] = useState(false);
  const [loadingSchemes, setLoadingSchemes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      setPdfFile(null);
      return;
    }
    setError(null);
    setPdfFile(file || null);
  };

  const handleParseArchitecture = async () => {
    if (!pdfFile) {
      setError('Please upload an architectural PDF first.');
      return;
    }

    setError(null);
    setArchitecture(null);
    setSchemes([]);
    setLoadingParse(true);

    try {
      const formData = new FormData();
      formData.append('archDrawing', pdfFile);

      const res = await fetch('/api/parse-architecture', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to parse architecture.');
      }

      const data = await res.json();
      setArchitecture(data.architecture);
    } catch (err: any) {
      setError(err.message || 'Failed to parse architecture.');
    } finally {
      setLoadingParse(false);
    }
  };

  const handleSiteInputChange = (field: keyof SiteInputs, value: string) => {
    setSiteInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateSchemes = async () => {
    if (!architecture) {
      setError('Parse architecture first.');
      return;
    }

    // Basic safety prompts: ensure key inputs are filled
    if (!siteInputs.soilType || !siteInputs.windZone) {
      setError('Please provide at least soil type and wind zone for safe conceptual design.');
      return;
    }

    setError(null);
    setSchemes([]);
    setLoadingSchemes(true);

    try {
      const res = await fetch('/api/generate-schemes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          architecture,
          siteInputs
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate schemes.');
      }

      const data = await res.json();
      setSchemes(data.schemes);
    } catch (err: any) {
      setError(err.message || 'Failed to generate schemes.');
    } finally {
      setLoadingSchemes(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-4">
          Structural AI Schemer (Draft)
        </h1>

        <p className="text-sm text-red-700 mb-4">
          WARNING: This is an experimental prototype. No real Eurocode checks are implemented.
          Do not use for actual design. All outputs are conceptual and for development/testing only.
        </p>

        {/* Upload section */}
        <section className="mb-6 border-b pb-4">
          <h2 className="text-lg font-semibold mb-2">1. Upload architectural drawings (PDF)</h2>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="mb-2"
          />
          <div className="flex gap-2 items-center">
            <button
              onClick={handleParseArchitecture}
              disabled={!pdfFile || loadingParse}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
            >
              {loadingParse ? 'Parsing…' : 'Extract structural data'}
            </button>
            {pdfFile && (
              <span className="text-xs text-gray-600">
                Selected: {pdfFile.name}
              </span>
            )}
          </div>
        </section>

        {/* Parsed architecture */}
        {architecture && (
          <section className="mb-6 border-b pb-4">
            <h2 className="text-lg font-semibold mb-2">2. Parsed architecture (mocked)</h2>
            <p className="text-sm text-gray-700">
              Project: <strong>{architecture.projectName}</strong> — Storeys: {architecture.storeys}
            </p>
            <h3 className="text-sm font-semibold mt-2">Spans (placeholder)</h3>
            <ul className="list-disc ml-5 text-sm">
              {architecture.spans.map(span => (
                <li key={span.id}>
                  {span.id}: {span.description}, {span.length_m.toFixed(2)} m, level {span.level}, dir {span.direction}
                </li>
              ))}
            </ul>
            <h3 className="text-sm font-semibold mt-2">Materials (placeholder)</h3>
            <p className="text-sm text-gray-700">
              Frame: {architecture.materials.frame}, Slab: {architecture.materials.slab}
            </p>
            <h3 className="text-sm font-semibold mt-2">Assumptions</h3>
            <ul className="list-disc ml-5 text-xs text-gray-600">
              {architecture.assumptions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Site inputs */}
        <section className="mb-6 border-b pb-4">
          <h2 className="text-lg font-semibold mb-2">3. Site and design inputs (user)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <label className="block mb-1 font-medium">Soil type</label>
              <input
                type="text"
                value={siteInputs.soilType}
                onChange={e => handleSiteInputChange('soilType', e.target.value)}
                placeholder="e.g. C (deep deposits of dense/medium-dense sand)"
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Wind zone</label>
              <input
                type="text"
                value={siteInputs.windZone}
                onChange={e => handleSiteInputChange('windZone', e.target.value)}
                placeholder="e.g. basic wind speed 25 m/s, Zone 2"
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Seismic zone</label>
              <input
                type="text"
                value={siteInputs.seismicZone}
                onChange={e => handleSiteInputChange('seismicZone', e.target.value)}
                placeholder="e.g. ag = 0.06g"
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Importance class</label>
              <input
                type="text"
                value={siteInputs.importanceClass}
                onChange={e => handleSiteInputChange('importanceClass', e.target.value)}
                placeholder="e.g. II (normal building)"
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">National annex</label>
              <input
                type="text"
                value={siteInputs.nationalAnnex}
                onChange={e => handleSiteInputChange('nationalAnnex', e.target.value)}
                placeholder="e.g. EN 1990–1998 with Irish NA"
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Imposed load category</label>
              <input
                type="text"
                value={siteInputs.imposedUseCategory}
                onChange={e => handleSiteInputChange('imposedUseCategory', e.target.value)}
                placeholder="e.g. Category B (office)"
                className="w-full border rounded px-2 py-1"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateSchemes}
            disabled={!architecture || loadingSchemes}
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
          >
            {loadingSchemes ? 'Generating schemes…' : 'Generate structural schemes'}
          </button>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-4 text-sm text-red-700">
            Error: {error}
          </div>
        )}

        {/* Scheme options */}
        {schemes.length > 0 && (
          <section className="mb-4">
            <h2 className="text-lg font-semibold mb-2">4. Structural scheme options (conceptual)</h2>
            {schemes.map(scheme => (
              <div key={scheme.id} className="border rounded p-3 mb-3 bg-gray-50">
                <h3 className="text-md font-semibold mb-1">{scheme.name}</h3>
                <p className="text-sm mb-1">{scheme.description}</p>
                <p className="text-xs text-gray-700 mb-1">
                  Lateral system: {scheme.lateralSystem}
                </p>
                <p className="text-xs text-gray-700 mb-1">
                  Gravity system: {scheme.gravitySystem}
                </p>
                <p className="text-xs text-gray-700 mb-1">
                  Foundations: {scheme.foundations}
                </p>

                <details className="mt-2">
                  <summary className="text-xs font-semibold cursor-pointer">Key assumptions</summary>
                  <ul className="list-disc ml-5 text-xs text-gray-700 mt-1">
                    {scheme.keyAssumptions.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </details>

                <details className="mt-2">
                  <summary className="text-xs font-semibold cursor-pointer">Member “calcs” (placeholders)</summary>
                  <ul className="list-disc ml-5 text-xs text-gray-700 mt-1">
                    {scheme.members.map(m => (
                      <li key={m.memberId}>
                        <strong>{m.memberType.toUpperCase()}</strong> {m.memberId}: {m.description}
                        <br />
                        Code: {m.designCode}
                        <br />
                        Utilisation: {m.utilisationRatio === null ? 'Not calculated (placeholder)' : m.utilisationRatio.toFixed(2)}
                        <br />
                        Warnings:
                        <ul className="list-disc ml-5">
                          {m.warnings.map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            ))}

            <p className="text-xs text-red-700 mt-2">
              All calculations above are placeholders. Implement and validate real Eurocode design
              and global analysis before any engineering use.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
