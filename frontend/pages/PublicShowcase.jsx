import React from 'react';
import './PublicShowcase.css';

// PublicShowcase
// A single-file, easy-to-read React component that provides a small
// presentation page for a mockup UI. Includes links to a Figma mockup,
// design resources and a minimal accessible layout. Original code —
// free of external proprietary content.

export default function PublicShowcase() {
  const figmaUrl = 'https://www.figma.com/file/PLACEHOLDER/Asset-Inventory-Mockup';
  const figmaPreview = 'https://via.placeholder.com/800x450.png?text=Figma+Mockup+Preview';

  return (
    <main className="ps-root" role="main">
      <header className="ps-header">
        <h1 className="ps-title">Asset Inventory — Public UI Showcase</h1>
        <p className="ps-lead">
          A clean, accessible React showcase component with links to design
          mockups (Figma), icons, and other public design resources.
        </p>
      </header>

      <section className="ps-preview" aria-labelledby="preview-heading">
        <h2 id="preview-heading">Mockup preview</h2>
        <a href={figmaUrl} target="_blank" rel="noopener noreferrer" className="ps-figma-link">
          <img src={figmaPreview} alt="Figma mockup preview" className="ps-figma-img" />
        </a>
        <p className="ps-caption">Click the image to open the Figma mockup (placeholder link).</p>
      </section>

      <section className="ps-resources" aria-labelledby="resources-heading">
        <h2 id="resources-heading">Design & development resources</h2>
        <ul className="ps-list">
          <li>
            <a href={figmaUrl} target="_blank" rel="noopener noreferrer">Figma mockup (open in new tab)</a>
          </li>
          <li>
            <a href="https://heroicons.com/" target="_blank" rel="noopener noreferrer">Heroicons — free SVG icons</a>
          </li>
          <li>
            <a href="https://fonts.google.com/" target="_blank" rel="noopener noreferrer">Google Fonts</a>
          </li>
          <li>
            <a href="https://www.figma.com/community" target="_blank" rel="noopener noreferrer">Figma Community — templates & UI kits</a>
          </li>
          <li>
            <a href="https://www.framer.com/motion/" target="_blank" rel="noopener noreferrer">Framer Motion — simple animation helpers</a>
          </li>
        </ul>
      </section>

      <section className="ps-usage" aria-labelledby="usage-heading">
        <h2 id="usage-heading">How to use this component</h2>
        <ol className="ps-steps">
          <li>Copy <code>PublicShowcase.jsx</code> and its CSS file into your React app.</li>
          <li>Update the <code>figmaUrl</code> constant to point to your Figma file.</li>
          <li>Import and route the component from your app's router, or render it in a page.</li>
        </ol>

        <div className="ps-cta-row">
          <a href={figmaUrl} className="ps-btn ps-btn-primary" target="_blank" rel="noopener noreferrer">Open Figma mockup</a>
          <a href="/" className="ps-btn ps-btn-ghost">Back to app</a>
        </div>
      </section>

      <footer className="ps-footer">
        <small>
          Copyright © {new Date().getFullYear()} — This component is original work and free to
          adapt. Replace the placeholder Figma URL with your public file link.
        </small>
      </footer>
    </main>
  );
}
