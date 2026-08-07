export interface Pattern {
  id: string;
  name: string;
  style: {
    background?: string;
    'background-image'?: string;
    'background-size'?: string;
    'background-position'?: string;
    [key: string]: string | undefined;
  };
}

/** Flattens a Pattern's style record into a CSS string for an inline
 *  `style` attribute (e.g. `.canvas-grid`'s background is driven entirely
 *  by the active pattern, not Sass — see _canvas.sass). */
export function patternToStyle(pattern: Pattern): string {
  return Object.entries(pattern.style)
    .filter(([, v]) => v != null)
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');
}

export const gridPatterns: Pattern[] = [
  {
    id: "fractalbuilder-default-grid",
    name: "Fractalbuilder Default Grid",
    style: {
      background: "#ffffff",
      'background-image': `radial-gradient(circle, #e2e2e2 1px, transparent 1.1px), radial-gradient(circle, #c4c4c4 1.4px, transparent 1.5px)`,
      'background-size': "16px 16px, 48px 48px",
      'background-position': "16px 16px, 64px 64px",
    },
  },
  {
    id: "purple-gradient-grid-right",
    name: "Purple Gradient Grid Right",
    style: {
      background: "#ffffff",
      'background-image': `linear-gradient(to right, #f0f0f0 1px, transparent 1px),
      linear-gradient(to bottom, #f0f0f0 1px, transparent 1px),
      radial-gradient(circle 800px at 100% 200px, #d5c5ff, transparent)`,
      'background-size': "96px 64px, 96px 64px, 100% 100%",
    },
  },
  {
    id: "purple-gradient-grid-left",
    name: "Purple Gradient Grid Left",
    style: {
      background: "#ffffff",
      'background-image': `linear-gradient(to right, #f0f0f0 1px, transparent 1px),
      linear-gradient(to bottom, #f0f0f0 1px, transparent 1px),
      radial-gradient(circle 800px at 0% 200px, #d5c5ff, transparent)`,
      'background-size': "96px 64px, 96px 64px, 100% 100%",
    },
  },
  {
    id: "dual-gradient-overlay-strong",
    name: "Dual Gradient Overlay",
    style: {
      background: "#ffffff",
      'background-image': `linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
      radial-gradient(circle 500px at 20% 80%, rgba(139,92,246,0.3), transparent),
      radial-gradient(circle 500px at 80% 20%, rgba(59,130,246,0.3), transparent)`,
      'background-size': "48px 48px, 48px 48px, 100% 100%, 100% 100%",
    },
  },
  {
    id: "dual-gradient-overlay-strong-swapped",
    name: "Dual Gradient Overlay Swapped",
    style: {
      background: "#ffffff",
      'background-image': `linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
      radial-gradient(circle 500px at 20% 20%, rgba(139,92,246,0.3), transparent),
      radial-gradient(circle 500px at 80% 80%, rgba(59,130,246,0.3), transparent)`,
      'background-size': "48px 48px, 48px 48px, 100% 100%, 100% 100%",
    },
  },
  {
    id: "dual-gradient-overlay-top",
    name: "Dual Gradient Overlay (Top)",
    style: {
      background: "#ffffff",
      'background-image': `linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
      radial-gradient(circle 500px at 0% 20%, rgba(139,92,246,0.3), transparent),
      radial-gradient(circle 500px at 100% 0%, rgba(59,130,246,0.3), transparent)`,
      'background-size': "48px 48px, 48px 48px, 100% 100%, 100% 100%",
    },
  },
  {
    id: "dual-gradient-overlay-bottom",
    name: "Dual Gradient Overlay (Bottom)",
    style: {
      background: "#ffffff",
      'background-image': `linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
      radial-gradient(circle 500px at 20% 100%, rgba(139,92,246,0.3), transparent),
      radial-gradient(circle 500px at 100% 80%, rgba(59,130,246,0.3), transparent)`,
      'background-size': "48px 48px, 48px 48px, 100% 100%, 100% 100%",
    },
  },
  {
    id: "purple-corner-grid",
    name: "Purple Corner Grid",
    style: {
      background: "#ffffff",
      'background-image': `linear-gradient(to right, #f0f0f0 1px, transparent 1px),
     linear-gradient(to bottom, #f0f0f0 1px, transparent 1px),
     radial-gradient(circle 600px at 0% 200px, #d5c5ff, transparent),
     radial-gradient(circle 600px at 100% 200px, #d5c5ff, transparent)`,
      'background-size': "20px 20px, 20px 20px, 100% 100%, 100% 100%",
    },
  },
  {
    id: "grid-dual-purple-glow",
    name: "Grid Dual Purple Glow",
    style: {
      background: "#ffffff",
      'background-image': `linear-gradient(to right, #f0f0f0 1px, transparent 1px),
     linear-gradient(to bottom, #f0f0f0 1px, transparent 1px),
     radial-gradient(circle 600px at 0% 200px, #d5c5ff, transparent),
     radial-gradient(circle 600px at 100% 200px, #d5c5ff, transparent)`,
      'background-size': `96px 64px,    
     96px 64px,    
     100% 100%,    
     100% 100%`,
    },
  },
  {
    id: "grid-quad-purple-glow",
    name: "Grid Quad Purple Glow",
    style: {
      background: "#ffffff",
      'background-image': `linear-gradient(to right, #f0f0f0 1px, transparent 1px),
     linear-gradient(to bottom, #f0f0f0 1px, transparent 1px),
     radial-gradient(circle 600px at 0% 200px, #d5c5ff, transparent),     /* Left */
     radial-gradient(circle 600px at 100% 200px, #d5c5ff, transparent),  /* Right */
     radial-gradient(circle 600px at 50% 0px, #d5c5ff, transparent),     /* Top */
     radial-gradient(circle 600px at 50% 100%, #d5c5ff, transparent)     /* Bottom */`,
      'background-size': `96px 64px,    
     96px 64px,    
     100% 100%,    
     100% 100%,
     100% 100%,
     100% 100%`,
    },
  },
  {
    id: "top-fade-grid",
    name: "Top Fade Grid",
    style: {
      background: "#f8fafc",
      'background-image': `linear-gradient(to right, #e2e8f0 1px, transparent 1px),
      linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)`,
      'background-size': "20px 30px",
    },
  },
  {
    id: "bottom-fade-grid",
    name: "Bottom Fade Grid",
    style: {
      background: "#f8fafc",
      'background-image': `linear-gradient(to right, #e2e8f0 1px, transparent 1px),
        linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)`,
      'background-size': "20px 30px",
    },
  },
  {
    id: "diagonal-fade-grid-left",
    name: "Diagonal Fade Grid Left",
    style: {
      background: "#f9fafb",
      'background-image': `linear-gradient(to right, #d1d5db 1px, transparent 1px),
        linear-gradient(to bottom, #d1d5db 1px, transparent 1px)`,
      'background-size': "32px 32px",
    },
  },
  {
    id: "diagonal-fade-grid-right",
    name: "Diagonal Fade Grid Right",
    style: {
      background: "#f9fafb",
      'background-image': `linear-gradient(to right, #d1d5db 1px, transparent 1px),
      linear-gradient(to bottom, #d1d5db 1px, transparent 1px)`,
      'background-size': "32px 32px",
    },
  },
  {
    id: "diagonal-fade-bottom-grid-Left",
    name: "Diagonal Fade Bottom Grid Left",
    style: {
      background: "#f9fafb",
      'background-image': `linear-gradient(to right, #d1d5db 1px, transparent 1px),
      linear-gradient(to bottom, #d1d5db 1px, transparent 1px)`,
      'background-size': "32px 32px",
    },
  },
  {
    id: "diagonal-fade-bottom-grid-right",
    name: "Diagonal Fade Bottom Grid Right",
    style: {
      background: "#f9fafb",
      'background-image': `linear-gradient(to right, #d1d5db 1px, transparent 1px),
      linear-gradient(to bottom, #d1d5db 1px, transparent 1px)`,
      'background-size': "32px 32px",
    },
  },
  {
    id: "diagonal-fade-center-grid",
    name: "Diagonal Fade Center Grid",
    style: {
      background: "#f9fafb",
      'background-image': `linear-gradient(to right, #d1d5db 1px, transparent 1px),
      linear-gradient(to bottom, #d1d5db 1px, transparent 1px)`,
      'background-size': "32px 32px",
    },
  },
  {
    id: "diagonal-cross-grid",
    name: "Diagonal Cross Grid",
    style: {
      background: "white",
      'background-image': `linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),
      linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)`,
      'background-size': "40px 40px",
    },
  },
  {
    id: "diagonal-cross-grid-top",
    name: "Diagonal Cross Grid Top",
    style: {
      background: "white",
      'background-image': `linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),
      linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)`,
      'background-size': "40px 40px",
    },
  },
  {
    id: "diagonal-cross-grid-bottom",
    name: "Diagonal Cross Grid Bottom",
    style: {
      background: "white",
      'background-image': `linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),
      linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)`,
      'background-size': "40px 40px",
    },
  },
  {
    id: "diagonal-cross-top-right-fade-grid",
    name: "Diagonal Cross Top Right Fade Grid",
    style: {
      background: "white",
      'background-image': `linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),
      linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)`,
      'background-size': "40px 40px",
    },
  },
  {
    id: "diagonal-cross-top-left-fade-grid",
    name: "Diagonal Cross Top Left Fade Grid",
    style: {
      background: "white",
      'background-image': `linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),
      linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)`,
      'background-size': "40px 40px",
    },
  },
  {
    id: "diagonal-cross-Bottom-right-fade-grid",
    name: "Diagonal Cross Bottom Right Fade Grid",
    style: {
      background: "white",
      'background-image': `linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),
      linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)`,
      'background-size': "40px 40px",
    },
  },
  {
    id: "diagonal-cross-Bottom-left-fade-grid",
    name: "Diagonal Cross Bottom Left Fade Grid",
    style: {
      background: "white",
      'background-image': `linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),
      linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)`,
      'background-size': "40px 40px",
    },
  },
  {
    id: "diagonal-cross-center-fade-grid",
    name: "Diagonal Cross Center Fade Grid",
    style: {
      background: "white",
      'background-image': `linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),
      linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)`,
      'background-size': "40px 40px",
    },
  },
  {
    id: "dashed-grid-light",
    name: "Dashed Grid Light",
    style: {
      background: "#ffffff",
      'background-image': `linear-gradient(to right, #e7e5e4 1px, transparent 1px),
        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)`,
      'background-size': "20px 20px",
      'background-position': "0 0, 0 0",
    },
  },
  {
    id: "dashed-top-fade-grid",
    name: "Dashed Top Fade Grid",
    style: {
      background: "#ffffff",
      'background-image': `linear-gradient(to right, #e7e5e4 1px, transparent 1px),
        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)`,
      'background-size': "20px 20px",
      'background-position': "0 0, 0 0",
    },
  },
  {
    id: "dashed-bottom-fade-grid",
    name: "Dashed Bottom Fade Grid",
    style: {
      background: "#ffffff",
      'background-image': `linear-gradient(to right, #e7e5e4 1px, transparent 1px),
        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)`,
      'background-size': "20px 20px",
      'background-position': "0 0, 0 0",
    },
  },
  {
    id: "dashed-top-left-fade-grid",
    name: "Dashed Top Left Fade Grid",
    style: {
      background: "#ffffff",
      'background-image': `linear-gradient(to right, #e7e5e4 1px, transparent 1px),
        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)`,
      'background-size': "20px 20px",
      'background-position': "0 0, 0 0",
    },
  },
  {
    id: "dashed-top-right-fade-grid",
    name: "Dashed Top Right Fade Grid",
    style: {
      background: "#ffffff",
      'background-image': `linear-gradient(to right, #e7e5e4 1px, transparent 1px),
        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)`,
      'background-size': "20px 20px",
      'background-position': "0 0, 0 0",
    },
  },
  {
    id: "dashed-bottom-right-fade-grid",
    name: "Dashed Bottom Right Fade Grid",
    style: {
      background: "#ffffff",
      'background-image': `linear-gradient(to right, #e7e5e4 1px, transparent 1px),
        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)`,
      'background-size': "20px 20px",
      'background-position': "0 0, 0 0",
    },
  },
  {
    id: "dashed-bottom-left-fade-grid",
    name: "Dashed Bottom Left Fade Grid",
    style: {
      background: "#ffffff",
      'background-image': `linear-gradient(to right, #e7e5e4 1px, transparent 1px),
        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)`,
      'background-size': "20px 20px",
      'background-position': "0 0, 0 0",
    },
  },
  {
    id: "dashed-center-fade-grid",
    name: "Dashed Center Fade Grid",
    style: {
      background: "#ffffff",
      'background-image': `linear-gradient(to right, #e7e5e4 1px, transparent 1px),
        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)`,
      'background-size': "20px 20px",
      'background-position': "0 0, 0 0",
    },
  },
  {
    id: "left-masked-basic-grid",
    name: "Left Masked Basic Grid",
    style: {
      background: "#ffffff",
      'background-image': `linear-gradient(to right, #e5e7eb 1px, transparent 1px),
        linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)`,
      'background-size': "40px 40px",
    },
  },
  {
    id: "right-masked-basic-grid",
    name: "Right Masked Basic Grid",
    style: {
      background: "#ffffff",
      'background-image': `linear-gradient(to right, #e5e7eb 1px, transparent 1px),
        linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)`,
      'background-size': "40px 40px",
    },
  },
  {
    id: "left-masked-diagonal-cross-grid",
    name: "Left Masked Diagonal Cross Grid",
    style: {
      background: "white",
      'background-image': `linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),
      linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)`,
      'background-size': "40px 40px",
    },
  },
  {
    id: "right-masked-diagonal-cross-grid",
    name: "Right Masked Diagonal Cross Grid",
    style: {
      background: "white",
      'background-image': `linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),
      linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)`,
      'background-size': "40px 40px",
    },
  },
  {
    id: "left-masked-dashed-grid-light",
    name: "Left Masked Dashed Grid Light",
    style: {
      background: "#ffffff",
      'background-image': `linear-gradient(to right, #e7e5e4 1px, transparent 1px),
        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)`,
      'background-size': "20px 20px",
      'background-position': "0 0, 0 0",
    },
  },
  {
    id: "right-masked-dashed-grid-light",
    name: "Right Masked Dashed Grid Light",
    style: {
      background: "#ffffff",
      'background-image': `linear-gradient(to right, #e7e5e4 1px, transparent 1px),
        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)`,
      'background-size': "20px 20px",
      'background-position': "0 0, 0 0",
    },
  },
  {
    id: "left-masked-concentric-squares-light",
    name: "Left Masked Concentric Squares - Light",
    style: {
      background: "#ffffff",
      'background-image': `repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(75, 85, 99, 0.06) 5px, rgba(75, 85, 99, 0.06) 6px, transparent 6px, transparent 15px),
      repeating-linear-gradient(90deg, transparent, transparent 5px, rgba(75, 85, 99, 0.06) 5px, rgba(75, 85, 99, 0.06) 6px, transparent 6px, transparent 15px),
      repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(107, 114, 128, 0.04) 10px, rgba(107, 114, 128, 0.04) 11px, transparent 11px, transparent 30px),
      repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(107, 114, 128, 0.04) 10px, rgba(107, 114, 128, 0.04) 11px, transparent 11px, transparent 30px)`,
    },
  },
  {
    id: "right-masked-concentric-squares-light",
    name: "Right Masked Concentric Squares - Light",
    style: {
      background: "#ffffff",
      'background-image': `repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(75, 85, 99, 0.06) 5px, rgba(75, 85, 99, 0.06) 6px, transparent 6px, transparent 15px),
      repeating-linear-gradient(90deg, transparent, transparent 5px, rgba(75, 85, 99, 0.06) 5px, rgba(75, 85, 99, 0.06) 6px, transparent 6px, transparent 15px),
      repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(107, 114, 128, 0.04) 10px, rgba(107, 114, 128, 0.04) 11px, transparent 11px, transparent 30px),
      repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(107, 114, 128, 0.04) 10px, rgba(107, 114, 128, 0.04) 11px, transparent 11px, transparent 30px)`,
    },
  },
  {
    id: "left-masked-circuit-board-light",
    name: "Left Masked Circuit Board - Light",
    style: {
      background: "#ffffff",
      'background-image': `repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(75, 85, 99, 0.08) 19px, rgba(75, 85, 99, 0.08) 20px, transparent 20px, transparent 39px, rgba(75, 85, 99, 0.08) 39px, rgba(75, 85, 99, 0.08) 40px),
      repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(75, 85, 99, 0.08) 19px, rgba(75, 85, 99, 0.08) 20px, transparent 20px, transparent 39px, rgba(75, 85, 99, 0.08) 39px, rgba(75, 85, 99, 0.08) 40px),
      radial-gradient(circle at 20px 20px, rgba(55, 65, 81, 0.12) 2px, transparent 2px),
      radial-gradient(circle at 40px 40px, rgba(55, 65, 81, 0.12) 2px, transparent 2px)`,
      'background-size': "40px 40px, 40px 40px, 40px 40px, 40px 40px",
    },
  },
  {
    id: "right-masked-circuit-board-light",
    name: "Right Masked Circuit Board - Light",
    style: {
      background: "#ffffff",
      'background-image': `repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(75, 85, 99, 0.08) 19px, rgba(75, 85, 99, 0.08) 20px, transparent 20px, transparent 39px, rgba(75, 85, 99, 0.08) 39px, rgba(75, 85, 99, 0.08) 40px),
      repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(75, 85, 99, 0.08) 19px, rgba(75, 85, 99, 0.08) 20px, transparent 20px, transparent 39px, rgba(75, 85, 99, 0.08) 39px, rgba(75, 85, 99, 0.08) 40px),
      radial-gradient(circle at 20px 20px, rgba(55, 65, 81, 0.12) 2px, transparent 2px),
      radial-gradient(circle at 40px 40px, rgba(55, 65, 81, 0.12) 2px, transparent 2px)`,
      'background-size': "40px 40px, 40px 40px, 40px 40px, 40px 40px",
    },
  },
  {
    id: "left-masked-circuit-board",
    name: "Left Masked Circuit Board",
    style: {
      background: "#f8fafc",
      'background-image': `linear-gradient(90deg, #e2e8f0 1px, transparent 1px),
        linear-gradient(180deg, #e2e8f0 1px, transparent 1px),
        linear-gradient(90deg, #cbd5e1 1px, transparent 1px),
        linear-gradient(180deg, #cbd5e1 1px, transparent 1px)`,
      'background-size': "50px 50px, 50px 50px, 10px 10px, 10px 10px",
    },
  },
  {
    id: "right-masked-circuit-board",
    name: "Right Masked Circuit Board",
    style: {
      background: "#f8fafc",
      'background-image': `linear-gradient(90deg, #e2e8f0 1px, transparent 1px),
        linear-gradient(180deg, #e2e8f0 1px, transparent 1px),
        linear-gradient(90deg, #cbd5e1 1px, transparent 1px),
        linear-gradient(180deg, #cbd5e1 1px, transparent 1px)`,
      'background-size': "50px 50px, 50px 50px, 10px 10px, 10px 10px",
    },
  },
  {
    id: "left-masked-white-grid-with-dots",
    name: "Left Masked White Grid with Dots",
    style: {
      background: "#ffffff",
      'background-image': `linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px),
      radial-gradient(circle, rgba(51,65,85,0.4) 1px, transparent 1px)`,
      'background-size': "20px 20px, 20px 20px, 20px 20px",
      'background-position': "0 0, 0 0, 0 0",
    },
  },
  {
    id: "right-masked-white-grid-with-dots",
    name: "Right Masked White Grid with Dots",
    style: {
      background: "#ffffff",
      'background-image': `linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px),
      radial-gradient(circle, rgba(51,65,85,0.4) 1px, transparent 1px)`,
      'background-size': "20px 20px, 20px 20px, 20px 20px",
      'background-position': "0 0, 0 0, 0 0",
    },
  },
  {
    id: "left-masked-noise-texture-darker-dots",
    name: "Left Masked Noise Texture (Darker Dots)",
    style: {
      background: "#ffffff",
      'background-image': `radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.35) 1px, transparent 0)`,
      'background-size': "20px 20px",
    },
  },
  {
    id: "right-masked-noise-texture-darker-dots",
    name: "Right Masked Noise Texture (Darker Dots)",
    style: {
      background: "#ffffff",
      'background-image': `radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.35) 1px, transparent 0)`,
      'background-size': "20px 20px",
    },
  },
];
