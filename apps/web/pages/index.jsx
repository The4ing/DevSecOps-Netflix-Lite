import { useEffect, useState } from 'react';


const styles = {
wrap: { maxWidth: 1200, margin: '0 auto', padding: 24 },
grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 16 },
card: { background: '#111', borderRadius: 12, overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,.2)' },
title: { color: '#eee', fontSize: 14, margin: '8px 10px 12px' }
};


export default function Home(){
const [movies, setMovies] = useState([]);
useEffect(() => { fetch('/catalog/catalog.json').then(r => r.json()).then(setMovies).catch(()=>setMovies([])); }, []);
return (
<div style={{ background:'#000', minHeight:'100vh' }}>
<header style={{ display:'flex', alignItems:'center', gap:16, padding:16 }}>
<img src="/logo.svg" alt="logo" height="32" />
<h1 style={{ color:'#fff', fontWeight:600, fontSize:18 }}>OrRamFlix</h1>
</header>
<main style={styles.wrap}>
<div style={styles.grid}>
{movies.map(m => (
<a key={m.id} href={`/watch/${encodeURIComponent(m.id)}`} style={{ textDecoration:'none' }}>
<div style={styles.card}>
<img src={m.poster} alt={m.title} style={{ width:'100%', display:'block', aspectRatio:'2/3', objectFit:'cover' }}/>
<div style={styles.title}>{m.title}</div>
</div>
</a>
))}
</div>
</main>
</div>
);
}