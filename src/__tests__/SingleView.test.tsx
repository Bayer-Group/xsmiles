import React from "react";
import { render } from "@testing-library/react";
import { SingleView } from "../modules/SingleView";
import type { Props } from "../modules/SingleView";

// Mock heatmap.js (requires real Canvas 2D context not available in jsdom)
jest.mock("heatmap.js", () => ({
    create: jest.fn().mockReturnValue({
        setData: jest.fn(),
        addData: jest.fn(),
        repaint: jest.fn(),
        getData: jest.fn().mockReturnValue({ data: [] }),
        getValueAt: jest.fn().mockReturnValue(0),
    }),
}));

// Mock window.RDKit for tests (RDKit is loaded from CDN in production)
beforeAll(() => {
    // Mock canvas context for jsdom (no real canvas support)
    HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        putImageData: jest.fn(),
        getImageData: jest.fn().mockReturnValue({ data: [] }),
        createImageData: jest.fn().mockReturnValue([]),
        setTransform: jest.fn(),
        drawImage: jest.fn(),
        save: jest.fn(),
        fillText: jest.fn(),
        restore: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn(),
        stroke: jest.fn(),
        translate: jest.fn(),
        scale: jest.fn(),
        rotate: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        measureText: jest.fn().mockReturnValue({ width: 0 }),
        transform: jest.fn(),
        rect: jest.fn(),
        clip: jest.fn(),
        canvas: { width: 600, height: 300 },
    });

    const mockSvg = `<svg xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="100" cy="100" rx="10" ry="10" class="atom-0"/>
        <ellipse cx="200" cy="100" rx="10" ry="10" class="atom-1"/>
        <ellipse cx="300" cy="100" rx="10" ry="10" class="atom-2"/>
    </svg>`;

    const mockMol = {
        get_svg: () => mockSvg,
        get_svg_with_highlights: () => mockSvg,
        draw_to_canvas_with_highlights: jest.fn(),
        get_substruct_match: () => "{}",
        delete: jest.fn(),
    };

    (window as any).RDKit = {
        version: () => "mocked",
        get_mol: () => mockMol,
    };
    (window as any).initRDKitModule = jest
        .fn()
        .mockResolvedValue((window as any).RDKit);
});

const sampleProps: Props = {
    molecule: {
        string: "CCO",
        method: {
            name: "test-method",
            scores: [0.5, -0.3, 0.8],
            attributes: { pred: 0.9 },
        },
        attributes: {},
    },
    gradientConfig: {},
    drawerType: "RDKitDrawer_black",
};

describe("SingleView component", () => {
    it("renders without crashing", () => {
        const { container } = render(<SingleView {...sampleProps} />);
        expect(container.querySelector(".SingleView")).not.toBeNull();
    });

    it("renders MoleculeView structure", () => {
        const { container } = render(<SingleView {...sampleProps} />);
        expect(container.querySelector(".MoleculeView")).not.toBeNull();
    });

    it("accepts custom width and height", () => {
        const props = {
            ...sampleProps,
            width: 800,
            height: 400,
        };
        const { container } = render(<SingleView {...props} />);
        expect(container.querySelector(".SingleView")).not.toBeNull();
    });

    it("can hide bar chart", () => {
        const props = {
            ...sampleProps,
            hideBarChart: true,
        };
        const { container } = render(<SingleView {...props} />);
        expect(container.querySelector(".SingleView")).not.toBeNull();
    });

    it("can hide attributes table", () => {
        const props = {
            ...sampleProps,
            hideAttributesTable: true,
        };
        const { container } = render(<SingleView {...props} />);
        expect(container.querySelector(".SingleView")).not.toBeNull();
    });

    it("renders with different drawer types", () => {
        const props = {
            ...sampleProps,
            drawerType: "RDKitDrawer_white" as any,
        };
        const { container } = render(<SingleView {...props} />);
        expect(container.querySelector(".SingleView")).not.toBeNull();
    });
});
