# Public UI file: PublicShowcase (React)

This repository includes a small, self-contained React page component intended for public-facing marketing or documentation pages. It is original, easy to adapt, and intentionally free of copyrighted third-party UI code.

Files added:

- `frontend/src/pages/PublicShowcase.jsx` — a brief, accessible React component that shows a mockup preview image, links to a Figma mockup (placeholder), and curated resource links.
- `frontend/src/pages/PublicShowcase.css` — scoped styles for the component.

How to use

1. Copy the two files into your React project (they live in `frontend/src/pages/` in this repo).
2. Update the `figmaUrl` constant inside `PublicShowcase.jsx` to point at your public Figma file. Example placeholder:

   https://www.figma.com/file/PLACEHOLDER/Asset-Inventory-Mockup

3. Import and render the component from your router or a parent page. Example:

```jsx
import PublicShowcase from './pages/PublicShowcase';

function App() {
  return (
    <div>
      <PublicShowcase />
    </div>
  );
}
```

Design & Resources

- Figma: replace the placeholder URL with your project's Figma link. If you want to share a public prototype or design, make sure the file permissions in Figma are set to allow viewers.
- Icon sets: Heroicons (https://heroicons.com/) and other open-source SVG sets are recommended.
- Fonts: use Google Fonts or locally hosted fonts for consistent licensing.

License & attribution

The component added here is original code authored for this repository. Use it freely under the repository's license. If you incorporate third-party assets (fonts, icon sets, images), ensure you follow their respective licenses.
