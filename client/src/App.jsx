import { useEffect, useState } from 'react';

const actionCards = [
  {
    key: 'video',
    eyebrow: 'Best playback',
    title: 'Video download',
    detail: 'Merged video and audio with an MP4-first workflow for fast playback.',
  },
  {
    key: 'audio',
    eyebrow: 'Audio conversion',
    title: 'MP3 export',
    detail: 'Great for podcasts, music references, interviews, and voice notes.',
  },
  {
    key: 'original',
    eyebrow: 'Source quality',
    title: 'Original format',
    detail: 'Keeps the source container when you want the untouched upload.',
  },
];

const featureCards = [
  {
    title: 'No database required',
    detail: 'Each request is processed on demand with ephemeral temp storage and nothing is persisted after download.',
  },
  {
    title: 'Built for fast link handling',
    detail: 'Paste a public URL, inspect the title and thumbnail, then trigger the format you need from one screen.',
  },
  {
    title: 'Render-ready deployment',
    detail: 'Docker, health checks, and a single-service setup make it straightforward to ship on Render.',
  },
];

const statLabels = [
  { key: 'platform', label: 'Platform' },
  { key: 'uploader', label: 'Creator' },
  { key: 'duration', label: 'Duration' },
  { key: 'uploadDate', label: 'Published' },
  { key: 'viewCount', label: 'Views' },
];

function App() {
  const [url, setUrl] = useState('');
  const [details, setDetails] = useState(null);
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [downloadingMode, setDownloadingMode] = useState('');
  const [notice, setNotice] = useState('');
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setNotice('');
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    setPreviewFailed(false);
  }, [details?.previewUrl]);

  async function handleAnalyze(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setDetails(null);

    if (!url.trim()) {
      setError('Paste a YouTube or Instagram video link to continue.');
      return;
    }

    setAnalyzing(true);

    try {
      const response = await fetch('/api/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Unable to inspect that link.');
      }

      setDetails(payload);
      setNotice('Link processed successfully. Choose the output you want.');
    } catch (requestError) {
      setError(getFriendlyErrorMessage(requestError));
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleDownload(mode) {
    if (!details) {
      return;
    }

    setError('');
    setNotice('');
    setDownloadingMode(mode);

    try {
      const response = await fetch(
        `/api/download?url=${encodeURIComponent(details.url)}&mode=${encodeURIComponent(mode)}`,
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message || 'Download failed.');
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const filename = extractFilename(response.headers.get('content-disposition'), details.title, mode);

      anchor.href = objectUrl;
      anchor.download = filename;
      anchor.click();

      window.URL.revokeObjectURL(objectUrl);
      setNotice(`Your ${mode} file is ready.`);
    } catch (requestError) {
      setError(getFriendlyErrorMessage(requestError));
    } finally {
      setDownloadingMode('');
    }
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      <main className="page">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">FrameFlow</span>
            <h1>Transform video links into ready-to-use downloads in seconds.</h1>
            <p className="lede">
              A polished, no-database web app for public YouTube and Instagram video links.
              Preview the title and thumbnail instantly, then download the best video,
              export MP3 audio, or keep the original format.
            </p>

            <div className="hero-badges">
              <span>Dark premium UI</span>
              <span>YouTube + Instagram</span>
              <span>Render-ready</span>
            </div>
          </div>

          <div className="hero-panel glass-card">
            <div className="panel-header">
              <div>
                <span className="panel-label">Quick processor</span>
                <h2>Paste a public video link</h2>
              </div>
              <span className="status-dot" />
            </div>

            <form className="processor-form" onSubmit={handleAnalyze}>
              <label className="field-label" htmlFor="video-url">
                Video URL
              </label>
              <input
                id="video-url"
                className="link-input"
                type="url"
                placeholder="https://www.youtube.com/watch?v=... or https://www.instagram.com/reel/..."
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                autoComplete="off"
              />
              <button className="primary-button" type="submit" disabled={analyzing}>
                {analyzing ? 'Inspecting link...' : 'Analyze link'}
              </button>
            </form>

            <p className="helper-text">
              Use only content you own or have permission to download. Private, restricted,
              or region-locked posts may not be available.
            </p>
          </div>
        </section>

        {(error || notice) && (
          <section className="message-stack">
            {error ? <div className="message error">{error}</div> : null}
            {notice ? <div className="message success">{notice}</div> : null}
          </section>
        )}

        <section className="feature-grid">
          {featureCards.map((feature) => (
            <article className="glass-card feature-card" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.detail}</p>
            </article>
          ))}
        </section>

        <section className="workspace-grid">
          <article className="glass-card preview-card">
            <div className="card-headline">
              <div>
                <span className="panel-label">Preview</span>
                <h2>Video details</h2>
              </div>
              {details ? <span className="platform-badge">{details.platform}</span> : null}
            </div>

            {analyzing ? (
              <div className="preview-skeleton" aria-hidden="true">
                <div className="skeleton-thumb" />
                <div className="skeleton-line large" />
                <div className="skeleton-line" />
                <div className="skeleton-grid">
                  <div className="skeleton-pill" />
                  <div className="skeleton-pill" />
                  <div className="skeleton-pill" />
                  <div className="skeleton-pill" />
                </div>
              </div>
            ) : details ? (
              <div className="preview-content">
                <div className="thumbnail-wrap">
                  {details.previewUrl && !previewFailed ? (
                    <video
                      key={details.previewUrl}
                      className="preview-video"
                      controls
                      playsInline
                      preload="metadata"
                      poster={details.thumbnail || undefined}
                      onError={() => setPreviewFailed(true)}
                    >
                      <source
                        src={details.previewUrl}
                        type={details.previewMimeType || 'video/mp4'}
                      />
                    </video>
                  ) : details.thumbnail ? (
                    <img src={details.thumbnail} alt={details.title} className="thumbnail" />
                  ) : (
                    <div className="thumbnail-fallback">
                      <span>No thumbnail</span>
                    </div>
                  )}
                </div>

                <div className="metadata-block">
                  <h3>{details.title}</h3>
                  <p className="metadata-description">
                    {details.description || 'The clip is ready to download or convert using one of the quick actions on the right.'}
                  </p>
                </div>

                <dl className="stats-grid">
                  {statLabels.map((item) => {
                    const value = formatDetail(item.key, details[item.key]);

                    if (!value) {
                      return null;
                    }

                    return (
                      <div className="stat-card" key={item.key}>
                        <dt>{item.label}</dt>
                        <dd>{value}</dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            ) : (
              <div className="empty-state">
                <p>Analyze a supported link to preview the title, thumbnail, creator, and timing details.</p>
              </div>
            )}
          </article>

          <aside className="glass-card action-panel">
            <div className="card-headline">
              <div>
                <span className="panel-label">Output options</span>
                <h2>Download or convert</h2>
              </div>
            </div>

            <div className="action-list">
              {actionCards.map((card) => (
                <button
                  key={card.key}
                  className="action-card"
                  disabled={!details || Boolean(downloadingMode)}
                  onClick={() => handleDownload(card.key)}
                  type="button"
                >
                  <span className="action-eyebrow">{card.eyebrow}</span>
                  <strong>{card.title}</strong>
                  <span>{card.detail}</span>
                  <span className="action-cta">
                    {downloadingMode === card.key ? 'Preparing file...' : 'Start'}
                  </span>
                </button>
              ))}
            </div>

            <div className="mini-note">
              <p>
                Large files can take longer to prepare, especially on lower-tier Render plans.
                This build is tuned for quick, public-link workflows.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

function extractFilename(contentDisposition, title, mode) {
  if (contentDisposition) {
    const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);

    if (utfMatch?.[1]) {
      return decodeURIComponent(utfMatch[1]);
    }

    const plainMatch = contentDisposition.match(/filename="([^"]+)"/i);

    if (plainMatch?.[1]) {
      return plainMatch[1];
    }
  }

  const safeTitle = (title || 'frameflow-download')
    .replace(/[\\/:*?"<>|]+/g, '')
    .trim()
    .slice(0, 120);

  if (mode === 'audio') {
    return `${safeTitle || 'frameflow-download'}.mp3`;
  }

  if (mode === 'video') {
    return `${safeTitle || 'frameflow-download'}.mp4`;
  }

  return safeTitle || 'frameflow-download';
}

function formatDetail(key, value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  if (key === 'duration') {
    return formatDuration(value);
  }

  if (key === 'viewCount') {
    return Number(value).toLocaleString();
  }

  return value;
}

function formatDuration(totalSeconds) {
  const seconds = Number(totalSeconds);

  if (!Number.isFinite(seconds)) {
    return '';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  }

  return `${minutes}m ${String(remainingSeconds).padStart(2, '0')}s`;
}

function getFriendlyErrorMessage(error) {
  const message = error instanceof Error ? error.message : String(error || '');

  if (
    error instanceof TypeError ||
    message.toLowerCase().includes('failed to fetch')
  ) {
    return 'The app could not reach the backend API. Make sure the server is running on port 3001, then refresh and try again.';
  }

  return message || 'Something went wrong while processing the link.';
}

export default App;
