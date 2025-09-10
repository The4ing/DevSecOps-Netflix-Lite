// apps/web/pages/watch/[id].jsx
import fs from 'fs';
import path from 'path';
import { useEffect, useRef, useState } from 'react';

// --- Static generation from public/catalog/catalog.json ---
export async function getStaticPaths() {
  const file = path.join(process.cwd(), 'public', 'catalog', 'catalog.json');
  const movies = JSON.parse(fs.readFileSync(file, 'utf-8'));
  return { paths: movies.map(m => ({ params: { id: m.id } })), fallback: false };
}

export async function getStaticProps({ params }) {
  const file = path.join(process.cwd(), 'public', 'catalog', 'catalog.json');
  const movies = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const movie = movies.find(m => m.id === params.id) || null;
  return { props: { movie } };
}

// --- Simple inline styles (no CSS setup needed) ---
const styles = {
  page: { background: '#000', minHeight: '100vh', color: '#fff' },
  header: {
    padding: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1200,
    margin: '0 auto',
  },
  back: { color: '#e50914', textDecoration: 'none', fontWeight: 600 },
  main: { maxWidth: 960, margin: '0 auto', padding: '0 16px 60px' }, // שנה 960 ל-800/1200 לפי הטעם
  title: { fontSize: 24, margin: '8px 0 16px' },

  // Container that enforces a 16:9 box that never gets too tall
  playerBox: {
    position: 'relative',
    width: '100%',
    aspectRatio: '16 / 9',                 // שומר יחס 16:9
    maxHeight: 'calc(100vh - 120px)',      // לא לעבור גובה מסך (כולל הכותרת והמרווחים)
    background: '#111',
    borderRadius: 12,
    overflow: 'hidden',
  },
  video: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
  },
  desc: { opacity: 0.8, marginTop: 12, lineHeight: 1.45 },
};

export default function Watch({ movie }) {
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);

  // Load Hls.js from CDN
  useEffect(() => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/hls.js@1';
    s.onload = () => setReady(true);
    document.body.appendChild(s);
    return () => { try { document.body.removeChild(s); } catch (_) {} };
  }, []);

  // Attach Hls to <video>
  useEffect(() => {
    if (!ready || !videoRef.current || !movie?.hls) return;

    const H = window.Hls;
    if (H && H.isSupported()) {
      const hls = new H({
        startLevel: 1,              // התחל ב-720p (0=הכי גבוה, 1=בינוני, 2=נמוך)
        capLevelToPlayerSize: true, // אל תבחר איכות גבוהה מגודל הנגן
        maxBufferLength: 10,        // באפר קצר יותר → התחלה מהירה
      });

      hls.on(H.Events.ERROR, (_evt, data) => {
        // יעזור לדיבאג אם יש בעיות טעינה
        // console.log('HLS ERROR', data.type, data.details, data.fatal);
      });

      hls.on(H.Events.MANIFEST_PARSED, () => {
        // console.log('HLS MANIFEST OK');
      });

      hls.loadSource(movie.hls);
      hls.attachMedia(videoRef.current);
      return () => hls.destroy();
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari
      videoRef.current.src = movie.hls;
    }
  }, [ready, movie]);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <a href="/" style={styles.back}>← Back</a>
      </header>

      <main style={styles.main}>
        <h1 style={styles.title}>{movie.title}</h1>

        <div style={styles.playerBox}>
          <video
            ref={videoRef}
            controls
            style={styles.video}
            poster={movie.poster}
          />
        </div>

        {movie.description && <p style={styles.desc}>{movie.description}</p>}
      </main>
    </div>
  );
}
