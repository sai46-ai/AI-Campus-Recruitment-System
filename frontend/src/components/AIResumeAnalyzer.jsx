import { useMemo, useState } from 'react';
import { applicationsAPI } from '../services/api';

/**
 * AI Resume Analyzer Component
 * 
 * CRITICAL: Handles partial/degraded AI responses gracefully.
 * 
 * The backend AI service may run in "degraded mode" on Python 3.14:
 * - No spaCy → Uses regex extraction (still works)
 * - No transformers → Uses string matching (still works)
 * - No NLP model → Basic skill matching (still works)
 * 
 * This component displays whatever data is available.
 */
export default function AIResumeAnalyzer({ applicationId, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [open, setOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);  // Track AI service status

  const chipStyle = useMemo(
    () => ({
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 10px',
      borderRadius: 999,
      fontSize: 12.5,
      fontWeight: 600,
      border: '1px solid rgba(255,255,255,0.12)',
      background: 'rgba(255,255,255,0.05)',
      color: 'rgba(255,255,255,0.9)',
      lineHeight: 1.1
    }),
    []
  );

  const subLabelStyle = useMemo(
    () => ({ fontSize: 12.5, color: 'rgba(226, 232, 240, 0.85)', marginBottom: 6 }),
    []
  );

  const handleAnalyze = async () => {
    if (!applicationId) return;
    setLoading(true);
    setError('');
    setSuccess('');
    setAiStatus(null);
    
    try {
      const res = await applicationsAPI.recomputeAiScore(applicationId);
      const data = res.data?.data || res.data;
      const updated = data?.application;
      const aiScore = data?.aiScore;
      const nextAnalysis = data?.analysis;
      
      // Check if response indicates degraded mode
      if (data?.mode === 'fallback' || data?.status === 'degraded') {
        setAiStatus({
          mode: 'degraded',
          message: 'AI running in basic mode (some features unavailable)'
        });
      }
      
      // Handle partial analysis
      setAnalysis(nextAnalysis || null);
      setOpen(Boolean(nextAnalysis));
      onUpdated?.(updated, aiScore, nextAnalysis);
      
      const shownScore = updated?.aiScore ?? aiScore;
      if (typeof shownScore === 'number') {
        setSuccess(`AI score updated to ${shownScore}%`);
      } else if (nextAnalysis) {
        setSuccess('AI analysis completed');
      } else {
        setSuccess('Score updated (basic matching)');
      }
    } catch (e) {
      // Enhanced error handling with meaningful messages
      const errorMsg = e?.response?.data?.error 
        || e?.response?.data?.message 
        || e?.userMessage 
        || e?.message 
        || 'Failed to analyze resume';
      
      // Check for specific error types
      if (errorMsg.includes('AI service') || errorMsg.includes('connection')) {
        setError('AI service unavailable. Basic matching used instead.');
        setAiStatus({ mode: 'offline', message: 'AI service not running' });
      } else if (errorMsg.includes('resume') || errorMsg.includes('PDF')) {
        setError('Could not parse resume. Please re-upload in PDF format.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 10 }}>
      <button
        type="button"
        onClick={handleAnalyze}
        disabled={loading || !applicationId}
        style={{
          padding: '10px 12px',
          borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.06)',
          color: '#fff',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Analyzing…' : 'Analyze (AI)'}
      </button>

      {analysis ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{
            marginLeft: 10,
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.10)',
            background: 'rgba(255,255,255,0.03)',
            color: 'rgba(255,255,255,0.9)',
            cursor: 'pointer'
          }}
        >
          {open ? 'Hide details' : 'View details'}
        </button>
      ) : null}

      {error ? (
        <div style={{ marginTop: 8, color: '#f87171', fontSize: 13 }}>{error}</div>
      ) : null}
      
      {/* AI Status indicator for degraded/offline mode */}
      {aiStatus && !error ? (
        <div style={{ 
          marginTop: 8, 
          color: aiStatus.mode === 'degraded' ? '#fbbf24' : '#94a3b8', 
          fontSize: 12,
          fontStyle: 'italic' 
        }}>
          ⚠️ {aiStatus.message}
        </div>
      ) : null}
      {!error && success ? (
        <div style={{ marginTop: 8, color: '#86efac', fontSize: 13 }}>{success}</div>
      ) : null}

      {analysis && open ? (
        <div
          style={{
            marginTop: 10,
            padding: 12,
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.10)',
            background: 'rgba(2, 11, 24, 0.55)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ ...chipStyle, background: 'rgba(77, 208, 225, 0.10)', borderColor: 'rgba(77, 208, 225, 0.22)' }}>
              Coverage: {analysis?.results?.coveragePercent ?? 0}%
            </div>
            <div style={{ ...chipStyle, background: 'rgba(124, 77, 255, 0.10)', borderColor: 'rgba(124, 77, 255, 0.22)' }}>
              Base: {analysis?.scoring?.baseScore ?? 0}%
            </div>
            <div style={{ ...chipStyle, background: 'rgba(0, 230, 118, 0.10)', borderColor: 'rgba(0, 230, 118, 0.22)' }}>
              Resume bonus: +{analysis?.scoring?.resumeBonus ?? 0}
            </div>
            <div style={{ ...chipStyle, background: 'rgba(255, 255, 255, 0.06)' }}>
              Final: {analysis?.scoring?.finalScore ?? 0}%
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={subLabelStyle}>Matched skills</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(analysis?.results?.matchedSkills || []).slice(0, 10).map((s) => (
                <span
                  key={`m-${s}`}
                  style={{
                    ...chipStyle,
                    background: 'rgba(0, 230, 118, 0.10)',
                    borderColor: 'rgba(0, 230, 118, 0.22)'
                  }}
                >
                  {s}
                </span>
              ))}
              {(analysis?.results?.matchedSkills || []).length === 0 ? (
                <span style={{ fontSize: 13, color: 'rgba(226, 232, 240, 0.8)' }}>No matched skills detected.</span>
              ) : null}
              {(analysis?.results?.matchedSkills || []).length > 10 ? (
                <span style={chipStyle}>+{(analysis.results.matchedSkills || []).length - 10} more</span>
              ) : null}
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={subLabelStyle}>Missing skills</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(analysis?.results?.missingSkills || []).slice(0, 10).map((s) => (
                <span
                  key={`x-${s}`}
                  style={{
                    ...chipStyle,
                    background: 'rgba(255, 82, 82, 0.10)',
                    borderColor: 'rgba(255, 82, 82, 0.22)'
                  }}
                >
                  {s}
                </span>
              ))}
              {(analysis?.results?.missingSkills || []).length === 0 ? (
                <span style={{ fontSize: 13, color: 'rgba(226, 232, 240, 0.8)' }}>No missing skills (great fit).</span>
              ) : null}
              {(analysis?.results?.missingSkills || []).length > 10 ? (
                <span style={chipStyle}>+{(analysis.results.missingSkills || []).length - 10} more</span>
              ) : null}
            </div>
          </div>

          {(analysis?.recommendations || []).length ? (
            <div style={{ marginTop: 12 }}>
              <div style={subLabelStyle}>Recommendations</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: 'rgba(226, 232, 240, 0.9)', fontSize: 13, lineHeight: 1.55 }}>
                {(analysis.recommendations || []).slice(0, 3).map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
