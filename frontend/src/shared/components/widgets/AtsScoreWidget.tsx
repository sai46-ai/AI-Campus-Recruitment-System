import React from 'react';
import { Award, CheckCircle2, AlertCircle } from 'lucide-react';

interface AtsScoreWidgetProps {
  score: number;
  suggestions?: string[];
}

export const AtsScoreWidget: React.FC<AtsScoreWidgetProps> = ({ score, suggestions = [] }) => {
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-400 stroke-green-400';
    if (s >= 60) return 'text-yellow-400 stroke-yellow-400';
    return 'text-red-400 stroke-red-400';
  };

  const strokeDashoffset = 283 - (283 * score) / 100;

  return (
    <div className="glass-panel p-6 rounded-xl border border-[#D4DED3] bg-tideglass-surface backdrop-blur-[6px] shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <Award className="w-5 h-5 text-[#0A7D6E]" />
        <h3 className="text-base font-semibold text-[#1E2D27]">Gemini ATS Score Index</h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        {/* Radial Progress Ring */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              className="stroke-[#D4DED3] fill-none"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              className={`fill-none transition-all duration-1000 ease-out ${getScoreColor(score)}`}
              strokeWidth="8"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-3xl font-bold text-[#1E2D27] tabular-nums">{score}</span>
            <span className="text-[10px] block font-medium text-[#6D858A] uppercase">Score</span>
          </div>
        </div>

        <div className="flex-1">
          <h4 className="text-sm font-semibold text-[#1E2D27]">
            {score >= 80 ? 'Excellent Resume Formatting' : score >= 60 ? 'Good ATS Compatibility' : 'Needs Optimization'}
          </h4>
          <p className="text-xs text-[#516861] mt-1 leading-relaxed">
            Calculated by Google Gemini LLM using industry ATS compliance benchmarks and keyword density analysis.
          </p>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-[#D4DED3]">
          <h4 className="text-xs font-semibold text-[#516861] mb-2.5">
            AI improvement suggestions
          </h4>
          <div className="space-y-2">
            {suggestions.map((suggestion, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-xs text-[#516861]">
                <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
