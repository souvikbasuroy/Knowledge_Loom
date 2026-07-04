import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Tv, 
  FileText, 
  Layers, 
  ShieldCheck, 
  Download, 
  AlertTriangle, 
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Video,
  Award
} from 'lucide-react';


const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Robust parsing utility to extract sections and render them as native React components
function extractReportData(reportText) {
  if (!reportText) return null;

  let overviewText = '';
  const videos = [];
  const papers = [];

  // Split report into lines
  const lines = reportText.split('\n');
  let currentSection = ''; // 'overview', 'videos', 'papers'

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect section headers
    if (line.toLowerCase().includes('## overview')) {
      currentSection = 'overview';
      continue;
    } else if (line.toLowerCase().includes('## recommended videos')) {
      currentSection = 'videos';
      continue;
    } else if (line.toLowerCase().includes('## research paper suggestions') || line.toLowerCase().includes('## paper suggestions')) {
      currentSection = 'papers';
      continue;
    } else if (line.startsWith('# ') || line.startsWith('---')) {
      continue; // Skip main title and horizontal lines
    }

    // Process line based on current section
    if (currentSection === 'overview') {
      overviewText += line + '\n';
    } 
    else if (currentSection === 'videos') {
      // Format: - [Title](URL) - Channel
      const match = line.match(/^-\s+\[([^\]]+)\]\(([^)]+)\)\s*-\s*(.+)$/);
      if (match) {
        videos.push({
          title: match[1],
          url: match[2],
          channel: match[3]
        });
      } else {
        // Fallback simple line
        if (line.startsWith('- ')) {
          videos.push({ title: line.substring(2), url: '#', channel: 'Educational resource' });
        }
      }
    } 
    else if (currentSection === 'papers') {
      // Format: - **Title** (Year) - Authors - Citations citations. [Link](URL)
      const match = line.match(/^-\s+\*\*([^*]+)\*\*\s*\(([^)]+)\)\s*-\s*([^-]+)-\s*([^\s]+)\s+citations\.\s+\[[^\]]+\]\(([^)]+)\)/);
      if (match) {
        papers.push({
          title: match[1].trim(),
          year: match[2].trim(),
          authors: match[3].trim(),
          citations: match[4].trim(),
          url: match[5].trim()
        });
      } else {
        // Less strict fallback match
        const simpleMatch = line.match(/^-\s+\*\*([^*]+)\*\*\s*-\s*\[[^\]]+\]\(([^)]+)\)/);
        if (simpleMatch) {
          papers.push({
            title: simpleMatch[1].trim(),
            year: 'N/A',
            authors: 'Academic authors',
            citations: '0',
            url: simpleMatch[2].trim()
          });
        }
      }
    }
  }

  return {
    overview: overviewText.trim(),
    videos,
    papers
  };
}

function parseInlineBold(text) {
  if (!text) return '';
  const regex = /\*\*([^*]+)\*\*/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(<strong key={match.index} style={{ fontWeight: '700', color: 'var(--accent-forest)' }}>{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}

function renderWebOverview(overviewText) {
  if (!overviewText) return null;
  const lines = overviewText.split('\n');
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return null;

    // Detect ### subheadings: "### Why it matters" or "### **Why it matters**"
    if (trimmed.startsWith('###')) {
      const headingText = trimmed.replace(/^###\s*/, '').trim();
      return (
        <h4 key={idx} style={{ fontSize: '1.25rem', color: 'var(--accent-forest)', fontWeight: '700', fontFamily: 'var(--font-sans)', marginTop: '2rem', marginBottom: '0.75rem', display: 'block' }}>
          {parseInlineBold(headingText)}
        </h4>
      );
    }

    // Detect numbered sections: "1. **What it is** text"
    const subHeadingMatch = trimmed.match(/^(\d+)\.\s+\*\*([^*]+)\*\*(.*)$/);
    if (subHeadingMatch) {
      return (
        <div key={idx} style={{ marginTop: '2rem', marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '1.2rem', color: 'var(--accent-forest)', fontWeight: '700', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--accent-forest-light)', color: 'var(--accent-forest)', fontSize: '0.9rem', fontWeight: 'bold' }}>
              {subHeadingMatch[1]}
            </span>
            {subHeadingMatch[2]}
          </h4>
          <p style={{ marginLeft: 'clamp(0rem, 4vw, 2.5rem)', fontSize: '1.02rem', lineHeight: '1.75', color: '#1a1a1a' }}>
            {parseInlineBold(subHeadingMatch[3].trim())}
          </p>
        </div>
      );
    }

    // Detect bullet items: "- **Concept** description"
    const bulletMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      return (
        <div key={idx} style={{ display: 'flex', gap: '0.75rem', marginLeft: 'clamp(0rem, 3vw, 2rem)', marginBottom: '0.75rem', fontSize: '1.02rem', color: '#1a1a1a', lineHeight: '1.6' }}>
          <span style={{ color: 'var(--accent-gold)', fontSize: '1.2rem', lineHeight: '1' }}>•</span>
          <span>{parseInlineBold(bulletMatch[1])}</span>
        </div>
      );
    }

    // Fallback simple paragraph
    return (
      <p key={idx} style={{ fontSize: '1.05rem', lineHeight: '1.75', color: '#1a1a1a', marginBottom: '1rem', marginLeft: trimmed.startsWith('>') ? '2.5rem' : '0' }}>
        {parseInlineBold(trimmed.startsWith('>') ? trimmed.substring(1).trim() : trimmed)}
      </p>
    );
  });
}



export default function App() {
  const [topic, setTopic] = useState('');
  const [healthStatus, setHealthStatus] = useState({ ok: true, missing: [] });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [backendError, setBackendError] = useState(null);

  // Check backend health on mount
  useEffect(() => {
    fetch(`${BACKEND_URL}/health`)
      .then(res => res.json())
      .then(data => {
        setHealthStatus({
          ok: data.missing_required_keys.length === 0,
          missing: data.missing_required_keys
        });
        setBackendError(null);
      })
      .catch(err => {
        console.error("Backend unreachable", err);
        setHealthStatus({ ok: false, missing: [] });
        setBackendError("FastAPI Backend is offline. Please make sure it is running on port 8000.");
      });
  }, []);

  const handleResearch = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setResult(null);
    setBackendError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setBackendError("Could not complete research. The backend server might be offline or encountered an internal error.");
    } finally {
      setLoading(false);
    }
  };

  const downloadMarkdownFile = () => {
    if (!result || !result.report) return;
    const element = document.createElement("a");
    // Download as a proper markdown file (.md)
    const file = new Blob([result.report], { type: 'text/markdown;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${topic.trim().replace(/\s+/g, '_')}_study_guide.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };


  // Convert the markdown report structure into structured website components
  const parsedData = result && result.status === 'success' ? extractReportData(result.report) : null;

  return (
    <div className="app-wrapper">
      {/* Hero Banner Section */}
      <div className="hero-banner"></div>

      {/* Title Section (below banner) */}
      <div className="hero-title-section">
        <div className="banner-logo">🎓</div>
        <h1 className="banner-title">Knowledge Loom</h1>
        <div className="banner-subtitle">Intellectual Synthesis Pipeline</div>
      </div>

      <div className="container">
        {/* Project Overview Section */}
        <section className="overview-section">
          <span className="section-label">System Architecture</span>
          <h2 className="section-title">Overview of the Research Platform</h2>
          <p className="overview-desc">
            Knowledge Loom is a high-performance orchestration system engineered to synthesize academic knowledge. 
            By breaking down your query into specialized parameters, the system dispatches five coordinated agents to build 
            a comprehensive study guide in parallel.
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Sparkles size={20} />
              </div>
              <h3>1. Overview Agent</h3>
              <p>Harnesses Google Gemini with real-time web search grounding to generate comprehensive foundational summaries of the topic.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Tv size={20} />
              </div>
              <h3>2. Video Agent</h3>
              <p>Interfaces with the YouTube Data API to source highly relevant, top-rated, and educational videos for visual context.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <FileText size={20} />
              </div>
              <h3>3. Paper Agent</h3>
              <p>Queries the open academic directory OpenAlex to pull high-impact peer-reviewed journals, citations, and abstracts.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Layers size={20} />
              </div>
              <h3>4. Aggregator Agent</h3>
              <p>Synthesizes the individual pipelines into a polished, structured study guide with precise citations and links.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <ShieldCheck size={20} />
              </div>
              <h3>5. Safety Gate</h3>
              <p>Conducts a strict real-time LLM-based safety and content check on the final report before it is released.</p>
            </div>
          </div>
        </section>

        {/* System Configuration status */}
        <div className="system-status-indicator">
          {backendError ? (
            <>
              <div className="status-dot warning"></div>
              <span style={{ color: 'var(--text-secondary)' }}>
                <strong>API Offline:</strong> {backendError}
              </span>
            </>
          ) : healthStatus.missing.length > 0 ? (
            <>
              <div className="status-dot warning"></div>
              <span style={{ color: 'var(--text-secondary)' }}>
                <strong>Configuration Warning:</strong> Missing keys: <code>{healthStatus.missing.join(', ')}</code>. Set them in your backend <code>.env</code> file.
              </span>
            </>
          ) : (
            <>
              <div className="status-dot success"></div>
              <span style={{ color: 'var(--text-secondary)' }}>
                <strong>Active System:</strong> FastAPI Backend connected. All specialist keys configured successfully.
              </span>
            </>
          )}
        </div>

        {/* Input Query */}
        <div className="search-container">
          <div className="search-label-box">
            <span className="section-label">Input Query</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Parallel execution enabled</span>
          </div>

          <form onSubmit={handleResearch} className="search-box">
            <input 
              type="text" 
              className="search-input" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. AI in space exploration"
              disabled={loading}
            />
            <button type="submit" className="search-button" disabled={loading || !topic.trim()}>
              <Search size={18} />
              {loading ? 'Synthesizing...' : 'Research'}
            </button>
          </form>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="loader-wrapper">
            <div className="spinner"></div>
            <p className="loader-text">Coordinating Agent Clusters</p>
            <p className="loader-subtext">Dispatching Overview, Video, and Paper agents in parallel...</p>
          </div>
        )}

        {/* System Logs */}
        {result && result.agent_log && (
          <div className="pipeline-logs">
            <div className="pipeline-logs-header">
              <span>Agent Cluster Logs</span>
              <span>Status: {result.status}</span>
            </div>
            {result.agent_log.map((logLine, idx) => (
              <div key={idx} className="log-entry">
                <ArrowRight size={12} style={{ color: 'var(--accent-gold)' }} />
                <span>{logLine}</span>
              </div>
            ))}
          </div>
        )}

        {/* Alert Panels */}
        {result && result.status === 'blocked' && (
          <div className="alert-panel blocked">
            <div className="alert-panel-title">
              <AlertTriangle size={20} />
              <span>Orchestration Terminated by Safety Gate</span>
            </div>
            <p>Reason: {result.reason}</p>
          </div>
        )}

        {result && result.status === 'error' && (
          <div className="alert-panel error">
            <div className="alert-panel-title">
              <AlertTriangle size={20} />
              <span>Pipeline Compilation Error</span>
            </div>
            <p>Reason: {result.reason}</p>
          </div>
        )}

        {/* Website Style Output Display */}
        {result && result.status === 'success' && parsedData && (
          <div className="report-container">
            <header className="report-header">
              <div className="report-title-meta">
                <h2 style={{ fontSize: 'clamp(1.3rem, 4vw, 2.2rem)', letterSpacing: '-0.5px', lineHeight: '1.25', wordBreak: 'break-word' }}>{topic}</h2>
                <p>Synthesized Guide &bull; Live Research Engine</p>
              </div>
              <button onClick={downloadMarkdownFile} className="btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>
                <Download size={16} />
                Download Report (.md)
              </button>
            </header>

            {/* Overview Component */}
            {parsedData.overview && (
              <section style={{ marginBottom: '3.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <BookOpen size={20} style={{ color: 'var(--accent-forest)' }} />
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.3rem', color: 'var(--accent-forest)' }}>Topic Overview</h3>
                </div>
                <div 
                  style={{
                    backgroundColor: '#ffffff',
                    padding: 'clamp(1.25rem, 4vw, 3rem)',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-light)',
                    boxShadow: '0 10px 30px rgba(42, 60, 53, 0.04)',
                    lineHeight: '1.75',
                    overflowX: 'hidden'
                  }}
                >
                  {renderWebOverview(parsedData.overview)}
                </div>
              </section>
            )}

            {/* Video Cards Grid */}
            {parsedData.videos && parsedData.videos.length > 0 && (
              <section style={{ marginBottom: '3.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <Video size={20} style={{ color: 'var(--accent-forest)' }} />
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.3rem', color: 'var(--accent-forest)' }}>Recommended Videos</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '1.25rem' }}>
                  {parsedData.videos.map((vid, idx) => (
                    <a 
                      key={idx}
                      href={vid.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '1.5rem',
                        backgroundColor: '#ffffff',
                        border: '1.5px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'var(--transition-smooth)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-forest)';
                        e.currentTarget.style.transform = 'translateY(-3px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-light)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div>
                        <div style={{ display: 'inline-flex', alignSelf: 'flex-start', padding: '0.4rem 0.8rem', backgroundColor: '#fff0f0', color: '#c53939', fontSize: '0.75rem', fontWeight: 700, borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>
                          YouTube Channel
                        </div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 600, lineHeight: '1.4', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{vid.title}</h4>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{vid.channel}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-forest)' }}>
                          Play Video <ExternalLink size={12} />
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Academic Papers List */}
            {parsedData.papers && parsedData.papers.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <Award size={20} style={{ color: 'var(--accent-forest)' }} />
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.3rem', color: 'var(--accent-forest)' }}>Research Paper Suggestions</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {parsedData.papers.map((paper, idx) => (
                    <div 
                      key={idx}
                      style={{
                        padding: '1.75rem 2rem',
                        backgroundColor: '#ffffff',
                        border: '1.5px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                        <span style={{ padding: '0.3rem 0.6rem', backgroundColor: 'var(--accent-forest-light)', color: 'var(--accent-forest)', fontSize: '0.75rem', fontWeight: 700, borderRadius: '4px' }}>
                          Published: {paper.year}
                        </span>
                        <span style={{ padding: '0.3rem 0.6rem', backgroundColor: 'var(--accent-gold-light)', color: '#a07c50', fontSize: '0.75rem', fontWeight: 700, borderRadius: '4px' }}>
                          Citations: {paper.citations}
                        </span>
                      </div>

                      <div>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: '1.4' }}>{paper.title}</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Authors: {paper.authors}</p>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                        <a 
                          href={paper.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary"
                          style={{
                            fontSize: '0.8rem',
                            padding: '0.5rem 1rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            textDecoration: 'none'
                          }}
                        >
                          Read Paper <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
