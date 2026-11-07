import React, { useState } from 'react';
import { Award, BookOpen, Code, Copy, Check } from 'lucide-react';
import { Button } from '../../shared/components/ui/Button';

export const AcademicCitation: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const bibtexCode = `@software{ai_campus_recruitment_2026,
  author = {AI Campus Recruitment Architecture Team},
  title = {AI-Powered Campus Recruitment System: A Verifiable, Multi-Role Web Platform for Institutional Placement},
  year = {2026},
  version = {2.0.0},
  url = {https://github.com/campus-recruitment/ai-recruitment-system}
}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bibtexCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center space-x-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/35 flex items-center justify-center text-[#0A7D6E]">
          <Award className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[#344942] tracking-tight font-headline">Academic Citation &amp; Research Reference</h1>
          <p className="text-sm text-[#516861]">Architectural lineage and institutional accreditation specifications</p>
        </div>
      </div>

      <div className="bg-tideglass-surface rounded-3xl border border-[#D4DED3] p-8 shadow-2xl space-y-8 text-[#344942] leading-relaxed text-sm backdrop-blur-xl">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#344942] flex items-center space-x-2 font-headline">
              <BookOpen className="w-4 h-4 text-[#0A7D6E]" />
              <span>BibTeX Citation</span>
            </h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              className="text-xs font-mono"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#0A7D6E] mr-1.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  <span>Copy BibTeX</span>
                </>
              )}
            </Button>
          </div>
          <div className="bg-[#E2EFEA] text-[#344942] border border-[#D4DED3] p-5 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner">
            <pre>{bibtexCode}</pre>
          </div>
        </section>

        <section className="space-y-3 pt-6 border-t border-[#D4DED3]">
          <h2 className="text-lg font-bold text-[#344942] flex items-center space-x-2 font-headline">
            <Code className="w-4 h-4 text-[#2879AD]" />
            <span>Institutional Accreditation Alignment</span>
          </h2>
          <p className="text-[#516861]">
            This software architecture maps student placement data directly to institutional graduation outcomes and placement metrics. All placement metrics are computed from verified application database records without synthetic imputation.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AcademicCitation;
