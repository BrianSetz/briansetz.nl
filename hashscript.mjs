import { createHash } from 'crypto';

// The exact inline script content that will appear between <script> tags
const script = `(function(){if(window.self!==window.top){window.top.location=window.self.location;}var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}})();`;

const hash = createHash('sha256').update(script, 'utf8').digest('base64');
console.log(`sha256-${hash}`);
console.log(`Script length: ${script.length}`);
