// Light geometric canvas background patterns extracted from vendors/patterns/data/patterns.ts
// Source category: "geometric" — light variants only (dark variants excluded).

export interface CanvasPattern {
	id: string;
	name: string;
	group: string;
	backgroundColor: string;
	backgroundImage: string | null;
	backgroundSize: string | null;
	backgroundPosition: string | null;
	maskImage: string | null;
	maskComposite: string | null;
}

export interface CanvasPatternGroup {
	label: string;
	patterns: CanvasPattern[];
}

const allPatterns: CanvasPattern[] = [
	{
		"id": "purple-gradient-grid-right",
		"name": "Purple Gradient Grid Right",
		"group": "Gradient Glow",
		"backgroundColor": "#ffffff",
		"backgroundImage": "linear-gradient(to right, #f0f0f0 1px, transparent 1px),\n      linear-gradient(to bottom, #f0f0f0 1px, transparent 1px),\n      radial-gradient(circle 800px at 100% 200px, #d5c5ff, transparent)",
		"backgroundSize": "96px 64px, 96px 64px, 100% 100%",
		"backgroundPosition": null,
		"maskImage": null,
		"maskComposite": null
	},
	{
		"id": "purple-gradient-grid-left",
		"name": "Purple Gradient Grid Left",
		"group": "Gradient Glow",
		"backgroundColor": "#ffffff",
		"backgroundImage": "linear-gradient(to right, #f0f0f0 1px, transparent 1px),\n      linear-gradient(to bottom, #f0f0f0 1px, transparent 1px),\n      radial-gradient(circle 800px at 0% 200px, #d5c5ff, transparent)",
		"backgroundSize": "96px 64px, 96px 64px, 100% 100%",
		"backgroundPosition": null,
		"maskImage": null,
		"maskComposite": null
	},
	{
		"id": "dual-gradient-overlay-strong",
		"name": "Dual Gradient Overlay",
		"group": "Gradient Glow",
		"backgroundColor": "#ffffff",
		"backgroundImage": "linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),\n      linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),\n      radial-gradient(circle 500px at 20% 80%, rgba(139,92,246,0.3), transparent),\n      radial-gradient(circle 500px at 80% 20%, rgba(59,130,246,0.3), transparent)",
		"backgroundSize": "48px 48px, 48px 48px, 100% 100%, 100% 100%",
		"backgroundPosition": null,
		"maskImage": null,
		"maskComposite": null
	},
	{
		"id": "dual-gradient-overlay-strong-swapped",
		"name": "Dual Gradient Overlay Swapped",
		"group": "Gradient Glow",
		"backgroundColor": "#ffffff",
		"backgroundImage": "linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),\n      linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),\n      radial-gradient(circle 500px at 20% 20%, rgba(139,92,246,0.3), transparent),\n      radial-gradient(circle 500px at 80% 80%, rgba(59,130,246,0.3), transparent)",
		"backgroundSize": "48px 48px, 48px 48px, 100% 100%, 100% 100%",
		"backgroundPosition": null,
		"maskImage": null,
		"maskComposite": null
	},
	{
		"id": "dual-gradient-overlay-top",
		"name": "Dual Gradient Overlay (Top)",
		"group": "Gradient Glow",
		"backgroundColor": "#ffffff",
		"backgroundImage": "linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),\n      linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),\n      radial-gradient(circle 500px at 0% 20%, rgba(139,92,246,0.3), transparent),\n      radial-gradient(circle 500px at 100% 0%, rgba(59,130,246,0.3), transparent)",
		"backgroundSize": "48px 48px, 48px 48px, 100% 100%, 100% 100%",
		"backgroundPosition": null,
		"maskImage": null,
		"maskComposite": null
	},
	{
		"id": "dual-gradient-overlay-bottom",
		"name": "Dual Gradient Overlay (Bottom)",
		"group": "Gradient Glow",
		"backgroundColor": "#ffffff",
		"backgroundImage": "linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),\n      linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),\n      radial-gradient(circle 500px at 20% 100%, rgba(139,92,246,0.3), transparent),\n      radial-gradient(circle 500px at 100% 80%, rgba(59,130,246,0.3), transparent)",
		"backgroundSize": "48px 48px, 48px 48px, 100% 100%, 100% 100%",
		"backgroundPosition": null,
		"maskImage": null,
		"maskComposite": null
	},
	{
		"id": "purple-corner-grid",
		"name": "Purple Corner Grid",
		"group": "Gradient Glow",
		"backgroundColor": "#ffffff",
		"backgroundImage": "linear-gradient(to right, #f0f0f0 1px, transparent 1px),\n     linear-gradient(to bottom, #f0f0f0 1px, transparent 1px),\n     radial-gradient(circle 600px at 0% 200px, #d5c5ff, transparent),\n     radial-gradient(circle 600px at 100% 200px, #d5c5ff, transparent)",
		"backgroundSize": "20px 20px, 20px 20px, 100% 100%, 100% 100%",
		"backgroundPosition": null,
		"maskImage": null,
		"maskComposite": null
	},
	{
		"id": "grid-dual-purple-glow",
		"name": "Grid Dual Purple Glow",
		"group": "Gradient Glow",
		"backgroundColor": "#ffffff",
		"backgroundImage": "linear-gradient(to right, #f0f0f0 1px, transparent 1px),\n     linear-gradient(to bottom, #f0f0f0 1px, transparent 1px),\n     radial-gradient(circle 600px at 0% 200px, #d5c5ff, transparent),\n     radial-gradient(circle 600px at 100% 200px, #d5c5ff, transparent)",
		"backgroundSize": "96px 64px,    \n     96px 64px,    \n     100% 100%,    \n     100% 100%",
		"backgroundPosition": null,
		"maskImage": null,
		"maskComposite": null
	},
	{
		"id": "grid-quad-purple-glow",
		"name": "Grid Quad Purple Glow",
		"group": "Gradient Glow",
		"backgroundColor": "#ffffff",
		"backgroundImage": "linear-gradient(to right, #f0f0f0 1px, transparent 1px),\n     linear-gradient(to bottom, #f0f0f0 1px, transparent 1px),\n     radial-gradient(circle 600px at 0% 200px, #d5c5ff, transparent),     /* Left */\n     radial-gradient(circle 600px at 100% 200px, #d5c5ff, transparent),  /* Right */\n     radial-gradient(circle 600px at 50% 0px, #d5c5ff, transparent),     /* Top */\n     radial-gradient(circle 600px at 50% 100%, #d5c5ff, transparent)     /* Bottom */",
		"backgroundSize": "96px 64px,    \n     96px 64px,    \n     100% 100%,    \n     100% 100%,\n     100% 100%,\n     100% 100%",
		"backgroundPosition": null,
		"maskImage": null,
		"maskComposite": null
	},
	{
		"id": "top-fade-grid",
		"name": "Top Fade Grid",
		"group": "Fade Grids",
		"backgroundColor": "#f8fafc",
		"backgroundImage": "linear-gradient(to right, #e2e8f0 1px, transparent 1px),\n      linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)",
		"backgroundSize": "20px 30px",
		"backgroundPosition": null,
		"maskImage": "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
		"maskComposite": null
	},
	{
		"id": "bottom-fade-grid",
		"name": "Bottom Fade Grid",
		"group": "Fade Grids",
		"backgroundColor": "#f8fafc",
		"backgroundImage": "linear-gradient(to right, #e2e8f0 1px, transparent 1px),\n        linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)",
		"backgroundSize": "20px 30px",
		"backgroundPosition": null,
		"maskImage": "radial-gradient(ellipse 70% 60% at 50% 100%, #000 60%, transparent 100%)",
		"maskComposite": null
	},
	{
		"id": "diagonal-fade-grid-left",
		"name": "Diagonal Fade Grid Left",
		"group": "Fade Grids",
		"backgroundColor": "#f9fafb",
		"backgroundImage": "linear-gradient(to right, #d1d5db 1px, transparent 1px),\n        linear-gradient(to bottom, #d1d5db 1px, transparent 1px)",
		"backgroundSize": "32px 32px",
		"backgroundPosition": null,
		"maskImage": "radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)",
		"maskComposite": null
	},
	{
		"id": "diagonal-fade-grid-right",
		"name": "Diagonal Fade Grid Right",
		"group": "Fade Grids",
		"backgroundColor": "#f9fafb",
		"backgroundImage": "linear-gradient(to right, #d1d5db 1px, transparent 1px),\n      linear-gradient(to bottom, #d1d5db 1px, transparent 1px)",
		"backgroundSize": "32px 32px",
		"backgroundPosition": null,
		"maskImage": "radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)",
		"maskComposite": null
	},
	{
		"id": "diagonal-fade-bottom-grid-Left",
		"name": "Diagonal Fade Bottom Grid Left",
		"group": "Fade Grids",
		"backgroundColor": "#f9fafb",
		"backgroundImage": "linear-gradient(to right, #d1d5db 1px, transparent 1px),\n      linear-gradient(to bottom, #d1d5db 1px, transparent 1px)",
		"backgroundSize": "32px 32px",
		"backgroundPosition": null,
		"maskImage": "radial-gradient(ellipse 80% 80% at 0% 100%, #000 50%, transparent 90%)",
		"maskComposite": null
	},
	{
		"id": "diagonal-fade-bottom-grid-right",
		"name": "Diagonal Fade Bottom Grid Right",
		"group": "Fade Grids",
		"backgroundColor": "#f9fafb",
		"backgroundImage": "linear-gradient(to right, #d1d5db 1px, transparent 1px),\n      linear-gradient(to bottom, #d1d5db 1px, transparent 1px)",
		"backgroundSize": "32px 32px",
		"backgroundPosition": null,
		"maskImage": "radial-gradient(ellipse 80% 80% at 100% 100%, #000 50%, transparent 90%)",
		"maskComposite": null
	},
	{
		"id": "diagonal-fade-center-grid",
		"name": "Diagonal Fade Center Grid",
		"group": "Fade Grids",
		"backgroundColor": "#f9fafb",
		"backgroundImage": "linear-gradient(to right, #d1d5db 1px, transparent 1px),\n      linear-gradient(to bottom, #d1d5db 1px, transparent 1px)",
		"backgroundSize": "32px 32px",
		"backgroundPosition": null,
		"maskImage": "radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)",
		"maskComposite": null
	},
	{
		"id": "diagonal-cross-grid",
		"name": "Diagonal Cross Grid",
		"group": "Diagonal Cross",
		"backgroundColor": "white",
		"backgroundImage": "linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),\n      linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)",
		"backgroundSize": "40px 40px",
		"backgroundPosition": null,
		"maskImage": null,
		"maskComposite": null
	},
	{
		"id": "diagonal-cross-grid-top",
		"name": "Diagonal Cross Grid Top",
		"group": "Diagonal Cross",
		"backgroundColor": "white",
		"backgroundImage": "linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),\n      linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)",
		"backgroundSize": "40px 40px",
		"backgroundPosition": null,
		"maskImage": "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
		"maskComposite": null
	},
	{
		"id": "diagonal-cross-grid-bottom",
		"name": "Diagonal Cross Grid Bottom",
		"group": "Diagonal Cross",
		"backgroundColor": "white",
		"backgroundImage": "linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),\n      linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)",
		"backgroundSize": "40px 40px",
		"backgroundPosition": null,
		"maskImage": "radial-gradient(ellipse 100% 80% at 50% 100%, #000 50%, transparent 90%)",
		"maskComposite": null
	},
	{
		"id": "diagonal-cross-top-right-fade-grid",
		"name": "Diagonal Cross Top Right Fade Grid",
		"group": "Diagonal Cross",
		"backgroundColor": "white",
		"backgroundImage": "linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),\n      linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)",
		"backgroundSize": "40px 40px",
		"backgroundPosition": null,
		"maskImage": "radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)",
		"maskComposite": null
	},
	{
		"id": "diagonal-cross-top-left-fade-grid",
		"name": "Diagonal Cross Top Left Fade Grid",
		"group": "Diagonal Cross",
		"backgroundColor": "white",
		"backgroundImage": "linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),\n      linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)",
		"backgroundSize": "40px 40px",
		"backgroundPosition": null,
		"maskImage": "radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)",
		"maskComposite": null
	},
	{
		"id": "diagonal-cross-Bottom-right-fade-grid",
		"name": "Diagonal Cross Bottom Right Fade Grid",
		"group": "Diagonal Cross",
		"backgroundColor": "white",
		"backgroundImage": "linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),\n      linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)",
		"backgroundSize": "40px 40px",
		"backgroundPosition": null,
		"maskImage": "radial-gradient(ellipse 80% 80% at 0% 100%, #000 50%, transparent 90%)",
		"maskComposite": null
	},
	{
		"id": "diagonal-cross-Bottom-left-fade-grid",
		"name": "Diagonal Cross Bottom Left Fade Grid",
		"group": "Diagonal Cross",
		"backgroundColor": "white",
		"backgroundImage": "linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),\n      linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)",
		"backgroundSize": "40px 40px",
		"backgroundPosition": null,
		"maskImage": "radial-gradient(ellipse 80% 80% at 100% 100%, #000 50%, transparent 90%)",
		"maskComposite": null
	},
	{
		"id": "diagonal-cross-center-fade-grid",
		"name": "Diagonal Cross Center Fade Grid",
		"group": "Diagonal Cross",
		"backgroundColor": "white",
		"backgroundImage": "linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),\n      linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)",
		"backgroundSize": "40px 40px",
		"backgroundPosition": null,
		"maskImage": "radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)",
		"maskComposite": null
	},
	{
		"id": "dashed-grid-light",
		"name": "Dashed Grid Light",
		"group": "Dashed Grids",
		"backgroundColor": "#ffffff",
		"backgroundImage": "linear-gradient(to right, #e7e5e4 1px, transparent 1px),\n        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)",
		"backgroundSize": "20px 20px",
		"backgroundPosition": "0 0, 0 0",
		"maskImage": "repeating-linear-gradient(\n          to right,\n          black 0px,\n          black 3px,\n          transparent 3px,\n          transparent 8px\n        ),\n        repeating-linear-gradient(\n          to bottom,\n          black 0px,\n          black 3px,\n          transparent 3px,\n          transparent 8px\n        )",
		"maskComposite": "intersect"
	},
	{
		"id": "dashed-top-fade-grid",
		"name": "Dashed Top Fade Grid",
		"group": "Dashed Grids",
		"backgroundColor": "#ffffff",
		"backgroundImage": "linear-gradient(to right, #e7e5e4 1px, transparent 1px),\n        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)",
		"backgroundSize": "20px 20px",
		"backgroundPosition": "0 0, 0 0",
		"maskImage": "repeating-linear-gradient(\n              to right,\n              black 0px,\n              black 3px,\n              transparent 3px,\n              transparent 8px\n            ),\n            repeating-linear-gradient(\n              to bottom,\n              black 0px,\n              black 3px,\n              transparent 3px,\n              transparent 8px\n            ),\n            radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
		"maskComposite": "intersect"
	},
	{
		"id": "dashed-bottom-fade-grid",
		"name": "Dashed Bottom Fade Grid",
		"group": "Dashed Grids",
		"backgroundColor": "#ffffff",
		"backgroundImage": "linear-gradient(to right, #e7e5e4 1px, transparent 1px),\n        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)",
		"backgroundSize": "20px 20px",
		"backgroundPosition": "0 0, 0 0",
		"maskImage": "repeating-linear-gradient(\n              to right,\n              black 0px,\n              black 3px,\n              transparent 3px,\n              transparent 8px\n            ),\n            repeating-linear-gradient(\n              to bottom,\n              black 0px,\n              black 3px,\n              transparent 3px,\n              transparent 8px\n            ),\n            radial-gradient(ellipse 100% 80% at 50% 100%, #000 50%, transparent 90%)",
		"maskComposite": "intersect"
	},
	{
		"id": "dashed-top-left-fade-grid",
		"name": "Dashed Top Left Fade Grid",
		"group": "Dashed Grids",
		"backgroundColor": "#ffffff",
		"backgroundImage": "linear-gradient(to right, #e7e5e4 1px, transparent 1px),\n        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)",
		"backgroundSize": "20px 20px",
		"backgroundPosition": "0 0, 0 0",
		"maskImage": "repeating-linear-gradient(\n              to right,\n              black 0px,\n              black 3px,\n              transparent 3px,\n              transparent 8px\n            ),\n            repeating-linear-gradient(\n              to bottom,\n              black 0px,\n              black 3px,\n              transparent 3px,\n              transparent 8px\n            ),\n            radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)",
		"maskComposite": "intersect"
	},
	{
		"id": "dashed-top-right-fade-grid",
		"name": "Dashed Top Right Fade Grid",
		"group": "Dashed Grids",
		"backgroundColor": "#ffffff",
		"backgroundImage": "linear-gradient(to right, #e7e5e4 1px, transparent 1px),\n        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)",
		"backgroundSize": "20px 20px",
		"backgroundPosition": "0 0, 0 0",
		"maskImage": "repeating-linear-gradient(\n              to right,\n              black 0px,\n              black 3px,\n              transparent 3px,\n              transparent 8px\n            ),\n            repeating-linear-gradient(\n              to bottom,\n              black 0px,\n              black 3px,\n              transparent 3px,\n              transparent 8px\n            ),\n            radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)",
		"maskComposite": "intersect"
	},
	{
		"id": "dashed-bottom-right-fade-grid",
		"name": "Dashed Bottom Right Fade Grid",
		"group": "Dashed Grids",
		"backgroundColor": "#ffffff",
		"backgroundImage": "linear-gradient(to right, #e7e5e4 1px, transparent 1px),\n        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)",
		"backgroundSize": "20px 20px",
		"backgroundPosition": "0 0, 0 0",
		"maskImage": "repeating-linear-gradient(\n              to right,\n              black 0px,\n              black 3px,\n              transparent 3px,\n              transparent 8px\n            ),\n            repeating-linear-gradient(\n              to bottom,\n              black 0px,\n              black 3px,\n              transparent 3px,\n              transparent 8px\n            ),\n            radial-gradient(ellipse 80% 80% at 0% 100%, #000 50%, transparent 90%)",
		"maskComposite": "intersect"
	},
	{
		"id": "dashed-bottom-left-fade-grid",
		"name": "Dashed Bottom Left Fade Grid",
		"group": "Dashed Grids",
		"backgroundColor": "#ffffff",
		"backgroundImage": "linear-gradient(to right, #e7e5e4 1px, transparent 1px),\n        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)",
		"backgroundSize": "20px 20px",
		"backgroundPosition": "0 0, 0 0",
		"maskImage": "repeating-linear-gradient(\n              to right,\n              black 0px,\n              black 3px,\n              transparent 3px,\n              transparent 8px\n            ),\n            repeating-linear-gradient(\n              to bottom,\n              black 0px,\n              black 3px,\n              transparent 3px,\n              transparent 8px\n            ),\n           radial-gradient(ellipse 80% 80% at 100% 100%, #000 50%, transparent 90%)",
		"maskComposite": "intersect"
	},
	{
		"id": "dashed-center-fade-grid",
		"name": "Dashed Center Fade Grid",
		"group": "Dashed Grids",
		"backgroundColor": "#ffffff",
		"backgroundImage": "linear-gradient(to right, #e7e5e4 1px, transparent 1px),\n        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)",
		"backgroundSize": "20px 20px",
		"backgroundPosition": "0 0, 0 0",
		"maskImage": "repeating-linear-gradient(\n              to right,\n              black 0px,\n              black 3px,\n              transparent 3px,\n              transparent 8px\n            ),\n            repeating-linear-gradient(\n              to bottom,\n              black 0px,\n              black 3px,\n              transparent 3px,\n              transparent 8px\n            ),\n          radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 70%)",
		"maskComposite": "intersect"
	},
	{
		"id": "left-masked-basic-grid",
		"name": "Left Masked Basic Grid",
		"group": "Masked",
		"backgroundColor": "#ffffff",
		"backgroundImage": "linear-gradient(to right, #e5e7eb 1px, transparent 1px),\n        linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)",
		"backgroundSize": "40px 40px",
		"backgroundPosition": null,
		"maskImage": "linear-gradient(to left, #000 0%, #000 50%, transparent 50%, transparent 100%)",
		"maskComposite": null
	},
	{
		"id": "right-masked-basic-grid",
		"name": "Right Masked Basic Grid",
		"group": "Masked",
		"backgroundColor": "#ffffff",
		"backgroundImage": "linear-gradient(to right, #e5e7eb 1px, transparent 1px),\n        linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)",
		"backgroundSize": "40px 40px",
		"backgroundPosition": null,
		"maskImage": "linear-gradient(to right, #000 0%, #000 50%, transparent 20%, transparent 100%)",
		"maskComposite": null
	},
	{
		"id": "left-masked-diagonal-cross-grid",
		"name": "Left Masked Diagonal Cross Grid",
		"group": "Masked",
		"backgroundColor": "white",
		"backgroundImage": "linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),\n      linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)",
		"backgroundSize": "40px 40px",
		"backgroundPosition": null,
		"maskImage": "linear-gradient(to left, #000 0%, #000 50%, transparent 50%, transparent 100%)",
		"maskComposite": null
	},
	{
		"id": "right-masked-diagonal-cross-grid",
		"name": "Right Masked Diagonal Cross Grid",
		"group": "Masked",
		"backgroundColor": "white",
		"backgroundImage": "linear-gradient(45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%),\n      linear-gradient(-45deg, transparent 49%, #e5e7eb 49%, #e5e7eb 51%, transparent 51%)",
		"backgroundSize": "40px 40px",
		"backgroundPosition": null,
		"maskImage": "linear-gradient(to right, #000 0%, #000 50%, transparent 50%, transparent 100%)",
		"maskComposite": null
	},
	{
		"id": "left-masked-dashed-grid-light",
		"name": "Left Masked Dashed Grid Light",
		"group": "Masked",
		"backgroundColor": "#ffffff",
		"backgroundImage": "linear-gradient(to right, #e7e5e4 1px, transparent 1px),\n        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)",
		"backgroundSize": "20px 20px",
		"backgroundPosition": "0 0, 0 0",
		"maskImage": "linear-gradient(to left, black 0%, black 50%, transparent 50%, transparent 100%),\n            repeating-linear-gradient(\n              to right,\n              black 0px,\n              black 3px,\n              transparent 3px,\n              transparent 8px\n            ),\n            repeating-linear-gradient(\n              to bottom,\n              black 0px,\n              black 3px,\n              transparent 3px,\n              transparent 8px\n            )",
		"maskComposite": "intersect"
	},
	{
		"id": "right-masked-dashed-grid-light",
		"name": "Right Masked Dashed Grid Light",
		"group": "Masked",
		"backgroundColor": "#ffffff",
		"backgroundImage": "linear-gradient(to right, #e7e5e4 1px, transparent 1px),\n        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)",
		"backgroundSize": "20px 20px",
		"backgroundPosition": "0 0, 0 0",
		"maskImage": "linear-gradient(to right, black 0%, black 50%, transparent 50%, transparent 100%),\n            repeating-linear-gradient(\n              to right,\n              black 0px,\n              black 3px,\n              transparent 3px,\n              transparent 8px\n            ),\n            repeating-linear-gradient(\n              to bottom,\n              black 0px,\n              black 3px,\n              transparent 3px,\n              transparent 8px\n            )",
		"maskComposite": "intersect"
	},
	{
		"id": "left-masked-concentric-squares-light",
		"name": "Left Masked Concentric Squares - Light",
		"group": "Masked",
		"backgroundColor": "#ffffff",
		"backgroundImage": "repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(75, 85, 99, 0.06) 5px, rgba(75, 85, 99, 0.06) 6px, transparent 6px, transparent 15px),\n      repeating-linear-gradient(90deg, transparent, transparent 5px, rgba(75, 85, 99, 0.06) 5px, rgba(75, 85, 99, 0.06) 6px, transparent 6px, transparent 15px),\n      repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(107, 114, 128, 0.04) 10px, rgba(107, 114, 128, 0.04) 11px, transparent 11px, transparent 30px),\n      repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(107, 114, 128, 0.04) 10px, rgba(107, 114, 128, 0.04) 11px, transparent 11px, transparent 30px)",
		"backgroundSize": null,
		"backgroundPosition": null,
		"maskImage": "linear-gradient(to left, #000 0%, #000 50%, transparent 20%, transparent 100%)",
		"maskComposite": null
	},
	{
		"id": "right-masked-concentric-squares-light",
		"name": "Right Masked Concentric Squares - Light",
		"group": "Masked",
		"backgroundColor": "#ffffff",
		"backgroundImage": "repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(75, 85, 99, 0.06) 5px, rgba(75, 85, 99, 0.06) 6px, transparent 6px, transparent 15px),\n      repeating-linear-gradient(90deg, transparent, transparent 5px, rgba(75, 85, 99, 0.06) 5px, rgba(75, 85, 99, 0.06) 6px, transparent 6px, transparent 15px),\n      repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(107, 114, 128, 0.04) 10px, rgba(107, 114, 128, 0.04) 11px, transparent 11px, transparent 30px),\n      repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(107, 114, 128, 0.04) 10px, rgba(107, 114, 128, 0.04) 11px, transparent 11px, transparent 30px)",
		"backgroundSize": null,
		"backgroundPosition": null,
		"maskImage": "linear-gradient(to right, #000 0%, #000 50%, transparent 20%, transparent 100%)",
		"maskComposite": null
	},
	{
		"id": "left-masked-circuit-board-light",
		"name": "Left Masked Circuit Board - Light",
		"group": "Masked",
		"backgroundColor": "#ffffff",
		"backgroundImage": "repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(75, 85, 99, 0.08) 19px, rgba(75, 85, 99, 0.08) 20px, transparent 20px, transparent 39px, rgba(75, 85, 99, 0.08) 39px, rgba(75, 85, 99, 0.08) 40px),\n      repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(75, 85, 99, 0.08) 19px, rgba(75, 85, 99, 0.08) 20px, transparent 20px, transparent 39px, rgba(75, 85, 99, 0.08) 39px, rgba(75, 85, 99, 0.08) 40px),\n      radial-gradient(circle at 20px 20px, rgba(55, 65, 81, 0.12) 2px, transparent 2px),\n      radial-gradient(circle at 40px 40px, rgba(55, 65, 81, 0.12) 2px, transparent 2px)",
		"backgroundSize": "40px 40px, 40px 40px, 40px 40px, 40px 40px",
		"backgroundPosition": null,
		"maskImage": "linear-gradient(to left, #000 0%, #000 50%, transparent 20%, transparent 100%)",
		"maskComposite": null
	},
	{
		"id": "right-masked-circuit-board-light",
		"name": "Right Masked Circuit Board - Light",
		"group": "Masked",
		"backgroundColor": "#ffffff",
		"backgroundImage": "repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(75, 85, 99, 0.08) 19px, rgba(75, 85, 99, 0.08) 20px, transparent 20px, transparent 39px, rgba(75, 85, 99, 0.08) 39px, rgba(75, 85, 99, 0.08) 40px),\n      repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(75, 85, 99, 0.08) 19px, rgba(75, 85, 99, 0.08) 20px, transparent 20px, transparent 39px, rgba(75, 85, 99, 0.08) 39px, rgba(75, 85, 99, 0.08) 40px),\n      radial-gradient(circle at 20px 20px, rgba(55, 65, 81, 0.12) 2px, transparent 2px),\n      radial-gradient(circle at 40px 40px, rgba(55, 65, 81, 0.12) 2px, transparent 2px)",
		"backgroundSize": "40px 40px, 40px 40px, 40px 40px, 40px 40px",
		"backgroundPosition": null,
		"maskImage": "linear-gradient(to right, #000 0%, #000 50%, transparent 20%, transparent 100%)",
		"maskComposite": null
	},
	{
		"id": "left-masked-circuit-board",
		"name": "Left Masked Circuit Board",
		"group": "Masked",
		"backgroundColor": "#f8fafc",
		"backgroundImage": "linear-gradient(90deg, #e2e8f0 1px, transparent 1px),\n        linear-gradient(180deg, #e2e8f0 1px, transparent 1px),\n        linear-gradient(90deg, #cbd5e1 1px, transparent 1px),\n        linear-gradient(180deg, #cbd5e1 1px, transparent 1px)",
		"backgroundSize": "50px 50px, 50px 50px, 10px 10px, 10px 10px",
		"backgroundPosition": null,
		"maskImage": "linear-gradient(to left, #000 0%, #000 50%, transparent 20%, transparent 100%)",
		"maskComposite": null
	},
	{
		"id": "right-masked-circuit-board",
		"name": "Right Masked Circuit Board",
		"group": "Masked",
		"backgroundColor": "#f8fafc",
		"backgroundImage": "linear-gradient(90deg, #e2e8f0 1px, transparent 1px),\n        linear-gradient(180deg, #e2e8f0 1px, transparent 1px),\n        linear-gradient(90deg, #cbd5e1 1px, transparent 1px),\n        linear-gradient(180deg, #cbd5e1 1px, transparent 1px)",
		"backgroundSize": "50px 50px, 50px 50px, 10px 10px, 10px 10px",
		"backgroundPosition": null,
		"maskImage": "linear-gradient(to right, #000 0%, #000 50%, transparent 20%, transparent 100%)",
		"maskComposite": null
	},
	{
		"id": "left-masked-white-grid-with-dots",
		"name": "Left Masked White Grid with Dots",
		"group": "Masked",
		"backgroundColor": "#ffffff",
		"backgroundImage": "linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px),\n      linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px),\n      radial-gradient(circle, rgba(51,65,85,0.4) 1px, transparent 1px)",
		"backgroundSize": "20px 20px, 20px 20px, 20px 20px",
		"backgroundPosition": "0 0, 0 0, 0 0",
		"maskImage": "linear-gradient(to left, #000 0%, #000 50%, transparent 20%, transparent 100%)",
		"maskComposite": null
	},
	{
		"id": "right-masked-white-grid-with-dots",
		"name": "Right Masked White Grid with Dots",
		"group": "Masked",
		"backgroundColor": "#ffffff",
		"backgroundImage": "linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px),\n      linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px),\n      radial-gradient(circle, rgba(51,65,85,0.4) 1px, transparent 1px)",
		"backgroundSize": "20px 20px, 20px 20px, 20px 20px",
		"backgroundPosition": "0 0, 0 0, 0 0",
		"maskImage": "linear-gradient(to right, #000 0%, #000 50%, transparent 20%, transparent 100%)",
		"maskComposite": null
	},
	{
		"id": "left-masked-noise-texture-darker-dots",
		"name": "Left Masked Noise Texture (Darker Dots)",
		"group": "Masked",
		"backgroundColor": "#ffffff",
		"backgroundImage": "radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.35) 1px, transparent 0)",
		"backgroundSize": "20px 20px",
		"backgroundPosition": null,
		"maskImage": "linear-gradient(to left, #000 0%, #000 50%, transparent 20%, transparent 100%)",
		"maskComposite": null
	},
	{
		"id": "right-masked-noise-texture-darker-dots",
		"name": "Right Masked Noise Texture (Darker Dots)",
		"group": "Masked",
		"backgroundColor": "#ffffff",
		"backgroundImage": "radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.35) 1px, transparent 0)",
		"backgroundSize": "20px 20px",
		"backgroundPosition": null,
		"maskImage": "linear-gradient(to right, #000 0%, #000 50%, transparent 20%, transparent 100%)",
		"maskComposite": null
	},
	{
		"id": "paper-texture",
		"name": "Paper Texture",
		"group": "Textures & Lines",
		"backgroundColor": "#faf9f6",
		"backgroundImage": "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.08) 1px, transparent 0),\n        repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px),\n        repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px)",
		"backgroundSize": "8px 8px, 32px 32px, 32px 32px",
		"backgroundPosition": null,
		"maskImage": null,
		"maskComposite": null
	},
	{
		"id": "diagonal-lines",
		"name": "Diagonal Stripes",
		"group": "Textures & Lines",
		"backgroundColor": "#ffffff",
		"backgroundImage": "repeating-linear-gradient(45deg, transparent, transparent 2px, #f3f4f6 2px, #f3f4f6 4px)",
		"backgroundSize": null,
		"backgroundPosition": null,
		"maskImage": null,
		"maskComposite": null
	},
	{
		"id": "diagonal-light",
		"name": "Diagonal Grid - Light",
		"group": "Textures & Lines",
		"backgroundColor": "#fafafa",
		"backgroundImage": "repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.1) 0, rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 20px),\n        repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.1) 0, rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 20px)",
		"backgroundSize": "40px 40px",
		"backgroundPosition": null,
		"maskImage": null,
		"maskComposite": null
	},
	{
		"id": "diagonal-light-green",
		"name": "Diagonal Grid - Electric",
		"group": "Textures & Lines",
		"backgroundColor": "#fafafa",
		"backgroundImage": "repeating-linear-gradient(45deg, rgba(255, 0, 100, 0.1) 0, rgba(255, 0, 100, 0.1) 1px, transparent 1px, transparent 20px),\n        repeating-linear-gradient(-45deg, rgba(255, 0, 100, 0.1) 0, rgba(255, 0, 100, 0.1) 1px, transparent 1px, transparent 20px)",
		"backgroundSize": "40px 40px",
		"backgroundPosition": null,
		"maskImage": null,
		"maskComposite": null
	},
	{
		"id": "zigzag-lightning-light",
		"name": "Zigzag Lightning - Light",
		"group": "Textures & Lines",
		"backgroundColor": "#ffffff",
		"backgroundImage": "repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(75, 85, 99, 0.08) 20px, rgba(75, 85, 99, 0.08) 21px),\n      repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(107, 114, 128, 0.06) 30px, rgba(107, 114, 128, 0.06) 31px),\n      repeating-linear-gradient(60deg, transparent, transparent 40px, rgba(55, 65, 81, 0.05) 40px, rgba(55, 65, 81, 0.05) 41px),\n      repeating-linear-gradient(150deg, transparent, transparent 35px, rgba(31, 41, 55, 0.04) 35px, rgba(31, 41, 55, 0.04) 36px)",
		"backgroundSize": null,
		"backgroundPosition": null,
		"maskImage": null,
		"maskComposite": null
	},
	{
		"id": "circuit-board-light",
		"name": "Circuit Board - Light",
		"group": "Textures & Lines",
		"backgroundColor": "#ffffff",
		"backgroundImage": "repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(75, 85, 99, 0.08) 19px, rgba(75, 85, 99, 0.08) 20px, transparent 20px, transparent 39px, rgba(75, 85, 99, 0.08) 39px, rgba(75, 85, 99, 0.08) 40px),\n      repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(75, 85, 99, 0.08) 19px, rgba(75, 85, 99, 0.08) 20px, transparent 20px, transparent 39px, rgba(75, 85, 99, 0.08) 39px, rgba(75, 85, 99, 0.08) 40px),\n      radial-gradient(circle at 20px 20px, rgba(55, 65, 81, 0.12) 2px, transparent 2px),\n      radial-gradient(circle at 40px 40px, rgba(55, 65, 81, 0.12) 2px, transparent 2px)",
		"backgroundSize": "40px 40px, 40px 40px, 40px 40px, 40px 40px",
		"backgroundPosition": null,
		"maskImage": null,
		"maskComposite": null
	},
	{
		"id": "concentric-squares-light",
		"name": "Concentric Squares - Light",
		"group": "Textures & Lines",
		"backgroundColor": "#ffffff",
		"backgroundImage": "repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(75, 85, 99, 0.06) 5px, rgba(75, 85, 99, 0.06) 6px, transparent 6px, transparent 15px),\n      repeating-linear-gradient(90deg, transparent, transparent 5px, rgba(75, 85, 99, 0.06) 5px, rgba(75, 85, 99, 0.06) 6px, transparent 6px, transparent 15px),\n      repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(107, 114, 128, 0.04) 10px, rgba(107, 114, 128, 0.04) 11px, transparent 11px, transparent 30px),\n      repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(107, 114, 128, 0.04) 10px, rgba(107, 114, 128, 0.04) 11px, transparent 11px, transparent 30px)",
		"backgroundSize": null,
		"backgroundPosition": null,
		"maskImage": null,
		"maskComposite": null
	},
	{
		"id": "woven-fabric-light",
		"name": "Woven Fabric - Light",
		"group": "Textures & Lines",
		"backgroundColor": "#ffffff",
		"backgroundImage": "repeating-linear-gradient(0deg, rgba(75, 85, 99, 0.08), rgba(75, 85, 99, 0.08) 2px, transparent 2px, transparent 6px),\n      repeating-linear-gradient(90deg, rgba(107, 114, 128, 0.06), rgba(107, 114, 128, 0.06) 2px, transparent 2px, transparent 6px),\n      repeating-linear-gradient(0deg, rgba(55, 65, 81, 0.04), rgba(55, 65, 81, 0.04) 1px, transparent 1px, transparent 12px),\n      repeating-linear-gradient(90deg, rgba(55, 65, 81, 0.04), rgba(55, 65, 81, 0.04) 1px, transparent 1px, transparent 12px)",
		"backgroundSize": null,
		"backgroundPosition": null,
		"maskImage": null,
		"maskComposite": null
	},
	{
		"id": "crosshatch-art-light",
		"name": "Crosshatch Art - Light",
		"group": "Textures & Lines",
		"backgroundColor": "#ffffff",
		"backgroundImage": "repeating-linear-gradient(22.5deg, transparent, transparent 2px, rgba(75, 85, 99, 0.06) 2px, rgba(75, 85, 99, 0.06) 3px, transparent 3px, transparent 8px),\n      repeating-linear-gradient(67.5deg, transparent, transparent 2px, rgba(107, 114, 128, 0.05) 2px, rgba(107, 114, 128, 0.05) 3px, transparent 3px, transparent 8px),\n      repeating-linear-gradient(112.5deg, transparent, transparent 2px, rgba(55, 65, 81, 0.04) 2px, rgba(55, 65, 81, 0.04) 3px, transparent 3px, transparent 8px),\n      repeating-linear-gradient(157.5deg, transparent, transparent 2px, rgba(31, 41, 55, 0.03) 2px, rgba(31, 41, 55, 0.03) 3px, transparent 3px, transparent 8px)",
		"backgroundSize": null,
		"backgroundPosition": null,
		"maskImage": null,
		"maskComposite": null
	},
	{
		"id": "white-grid-with-dots",
		"name": "White Grid with Dots",
		"group": "Textures & Lines",
		"backgroundColor": "#ffffff",
		"backgroundImage": "linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px),\n      linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px),\n      radial-gradient(circle, rgba(51,65,85,0.4) 1px, transparent 1px)",
		"backgroundSize": "20px 20px, 20px 20px, 20px 20px",
		"backgroundPosition": "0 0, 0 0, 0 0",
		"maskImage": null,
		"maskComposite": null
	},
	{
		"id": "noise-texture-darker-dots",
		"name": "Noise Texture (Darker Dots)",
		"group": "Textures & Lines",
		"backgroundColor": "#ffffff",
		"backgroundImage": "radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.35) 1px, transparent 0)",
		"backgroundSize": "20px 20px",
		"backgroundPosition": null,
		"maskImage": null,
		"maskComposite": null
	},
	{
		"id": "circuit-board",
		"name": "Circuit Board",
		"group": "Textures & Lines",
		"backgroundColor": "#f8fafc",
		"backgroundImage": "linear-gradient(90deg, #e2e8f0 1px, transparent 1px),\n        linear-gradient(180deg, #e2e8f0 1px, transparent 1px),\n        linear-gradient(90deg, #cbd5e1 1px, transparent 1px),\n        linear-gradient(180deg, #cbd5e1 1px, transparent 1px)",
		"backgroundSize": "50px 50px, 50px 50px, 10px 10px, 10px 10px",
		"backgroundPosition": null,
		"maskImage": null,
		"maskComposite": null
	},
	{
		"id": "basic-grid",
		"name": "Basic Grid",
		"group": "Textures & Lines",
		"backgroundColor": "#ffffff",
		"backgroundImage": "linear-gradient(to right, #e5e7eb 1px, transparent 1px),\n        linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)",
		"backgroundSize": "40px 40px",
		"backgroundPosition": null,
		"maskImage": null,
		"maskComposite": null
	},
	{
		"id": "white-sphere-grid",
		"name": "White Sphere Grid",
		"group": "Textures & Lines",
		"backgroundColor": "white",
		"backgroundImage": "linear-gradient(to right, rgba(71,85,105,0.3) 1px, transparent 1px),\n     linear-gradient(to bottom, rgba(71,85,105,0.3) 1px, transparent 1px),\n     radial-gradient(circle at 50% 50%, rgba(139,92,246,0.25) 0%, rgba(139,92,246,0.1) 40%, transparent 80%)",
		"backgroundSize": "32px 32px, 32px 32px, 100% 100%",
		"backgroundPosition": null,
		"maskImage": null,
		"maskComposite": null
	},
	{
		"id": "magenta-orb-grid-light",
		"name": "Magenta Orb Grid Light",
		"group": "Textures & Lines",
		"backgroundColor": "white",
		"backgroundImage": "linear-gradient(to right, rgba(71,85,105,0.15) 1px, transparent 1px),\n   linear-gradient(to bottom, rgba(71,85,105,0.15) 1px, transparent 1px),\n   radial-gradient(circle at 50% 60%, rgba(236,72,153,0.15) 0%, rgba(168,85,247,0.05) 40%, transparent 70%)",
		"backgroundSize": "40px 40px, 40px 40px, 100% 100%",
		"backgroundPosition": null,
		"maskImage": null,
		"maskComposite": null
	},
	{
		"id": "diagonal-striped-grid",
		"name": "Diagonal Striped Grid",
		"group": "Textures & Lines",
		"backgroundColor": "#ffffff",
		"backgroundImage": "linear-gradient(90deg, rgba(16,185,129,0.25) 1px, transparent 0),\n        linear-gradient(180deg, rgba(16,185,129,0.25) 1px, transparent 0),\n        repeating-linear-gradient(45deg, rgba(16,185,129,0.2) 0 2px, transparent 2px 6px)",
		"backgroundSize": "24px 24px, 24px 24px, 24px 24px",
		"backgroundPosition": null,
		"maskImage": null,
		"maskComposite": null
	}
];

const groupOrder = ["Gradient Glow","Fade Grids","Diagonal Cross","Dashed Grids","Masked","Textures & Lines"];

export const canvasPatterns: CanvasPattern[] = allPatterns;

export const canvasPatternGroups: CanvasPatternGroup[] = groupOrder
	.map((label) => ({ label, patterns: allPatterns.filter((pattern) => pattern.group === label) }))
	.filter((group) => group.patterns.length > 0);

export function canvasPatternById(id: string | null): CanvasPattern | null {
	return allPatterns.find((pattern) => pattern.id === id) ?? null;
}
