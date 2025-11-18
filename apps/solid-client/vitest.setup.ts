import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@solidjs/testing-library";

// Cleanup after each test
afterEach(() => {
	cleanup();
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
	constructor() {}
	disconnect() {}
	observe() {}
	takeRecords() {
		return [];
	}
	unobserve() {}
	root = null;
	rootMargin = "";
	thresholds = [];
};

// Mock HTMLCanvasElement
HTMLCanvasElement.prototype.getContext = vi.fn((contextType: string) => {
	if (contextType === "2d") {
		return {
			canvas: null,
			fillStyle: "",
			strokeStyle: "",
			lineWidth: 1,
			lineCap: "butt",
			lineJoin: "miter",
			miterLimit: 10,
			lineDashOffset: 0,
			shadowOffsetX: 0,
			shadowOffsetY: 0,
			shadowBlur: 0,
			shadowColor: "rgba(0, 0, 0, 0)",
			globalAlpha: 1,
			globalCompositeOperation: "source-over",
			font: "10px sans-serif",
			textAlign: "start",
			textBaseline: "alphabetic",
			direction: "ltr",
			fillRect: vi.fn(),
			clearRect: vi.fn(),
			strokeRect: vi.fn(),
			getImageData: vi.fn(() => ({
				data: new Uint8ClampedArray(4),
				width: 1,
				height: 1,
			})),
			putImageData: vi.fn(),
			createImageData: vi.fn(() => ({
				data: new Uint8ClampedArray(4),
				width: 1,
				height: 1,
			})),
			setTransform: vi.fn(),
			resetTransform: vi.fn(),
			getTransform: vi.fn(),
			transform: vi.fn(),
			translate: vi.fn(),
			rotate: vi.fn(),
			scale: vi.fn(),
			drawImage: vi.fn(),
			save: vi.fn(),
			restore: vi.fn(),
			beginPath: vi.fn(),
			closePath: vi.fn(),
			moveTo: vi.fn(),
			lineTo: vi.fn(),
			bezierCurveTo: vi.fn(),
			quadraticCurveTo: vi.fn(),
			arc: vi.fn(),
			arcTo: vi.fn(),
			ellipse: vi.fn(),
			rect: vi.fn(),
			fill: vi.fn(),
			stroke: vi.fn(),
			clip: vi.fn(),
			isPointInPath: vi.fn(() => false),
			isPointInStroke: vi.fn(() => false),
			measureText: vi.fn((text: string) => ({
				width: text.length * 7,
				actualBoundingBoxLeft: 0,
				actualBoundingBoxRight: text.length * 7,
				actualBoundingBoxAscent: 10,
				actualBoundingBoxDescent: 2,
				fontBoundingBoxAscent: 10,
				fontBoundingBoxDescent: 2,
				alphabeticBaseline: 0,
				hangingBaseline: 0,
				ideographicBaseline: 0,
			})),
			fillText: vi.fn(),
			strokeText: vi.fn(),
			drawFocusIfNeeded: vi.fn(),
			scrollPathIntoView: vi.fn(),
			createLinearGradient: vi.fn(() => ({
				addColorStop: vi.fn(),
			})),
			createRadialGradient: vi.fn(() => ({
				addColorStop: vi.fn(),
			})),
			createPattern: vi.fn(() => null),
			setLineDash: vi.fn(),
			getLineDash: vi.fn(() => []),
		};
	}
	return null;
}) as any;

// Add width and height properties to canvas
Object.defineProperty(HTMLCanvasElement.prototype, "width", {
	get() {
		return 300;
	},
	set() {},
});

Object.defineProperty(HTMLCanvasElement.prototype, "height", {
	get() {
		return 150;
	},
	set() {},
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});
