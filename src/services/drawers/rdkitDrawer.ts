import { Molecule } from "../../types/molecule.types";
import { Drawer, DrawerConfig, DrawerType } from "../../types/drawer.interface";
import rdkitService from "../rdkit.service";
import moleculeStructureService from "../molecule/molecule.structure.service";

export type GVertex = {
    index: number;
    smilesIndex: number;
    x: number;
    y: number;
};

const coordinatesFactory: {
    [key: string]: {
        x: number;
        y: number;
        index: number;
    }[];
} = {};


export default class RDKitDrawer implements Drawer {
    gVertices: GVertex[];
    canvas: HTMLCanvasElement;
    molecule: Molecule;
    type: DrawerType; // this is used to control if the drawer should redraw in the Structure.tsx
    showScoresOnStructure: boolean; // this is used to control if the drawer should redraw in the Structure.tsx

    constructor(canvasID: string, molecule: Molecule, config: DrawerConfig) {
        
        const rdkitMol = config.showScoresOnStructure
            ? this.getRDKitMolWithAtomNotes(molecule)
            : window.RDKit.get_mol(molecule.string);

        this.type = config.drawerType;
        this.showScoresOnStructure = config.showScoresOnStructure;

        const canvasScale = config.scaleResolution;

        let drawOpts: any = {
            // https://michelml.github.io/rdkit-js/examples/vanilla-javascript/#drawing-molecules-options
            noAtomLabels: false,
            width: config.width * canvasScale,
            height: config.height * canvasScale,
            backgroundColour: [1, 1, 1, 0],
            padding: 0.05,
            minFontSize: 16,
            bondLineWidth: 3,
            addAtomIndices: false,
            fixedBondLength: config.bondLength, //try to set bondLength -> but this may change if RDKit can't fit the molecule in the image
            // includeMetadata: true,
        };

        this.molecule = molecule;

        const drawOptsString = JSON.stringify(drawOpts);
        const coordinatesFactoryID = molecule.string + drawOptsString;
        
        var coordinates = coordinatesFactory[coordinatesFactoryID];

        // if coordinates for this molecule (positions of atoms) is unknown
        if (coordinates == null) {
            const svg = rdkitMol.get_svg_with_highlights(drawOptsString);
            coordinates = rdkitService.getAtomsCoordinatesFromSVG(svg);

            //TODO const maxEdgeLength = rdkitService.getMaxEdgeLength(svg);
            //TODO max gradient Radius = maxEdgeLength/2*1.1
        }

        if (this.type.indexOf("black") !== -1) {
            let atomColourPalette: { [key: number]: number[] } = {};
            for (let i = 0; i < 119; i++) {
                atomColourPalette[i] = [0, 0, 0];
            }
            drawOpts = { ...drawOpts, atomColourPalette };
        }
    

        this.canvas = document.getElementById(canvasID) as HTMLCanvasElement;
        this.canvas.width = drawOpts.width;
        this.canvas.height = drawOpts.height;
        rdkitMol.draw_to_canvas_with_highlights(
            this.canvas,
            JSON.stringify({
                ...drawOpts,
                // atomLabels
            })
        );

        this.gVertices = [];
        this.canvas.style.width = `${config.width}px`;
        this.canvas.style.height = `${config.height}px`;

        this.setOriginalVerticesFromExternalDrawer(coordinates);

        this.updateMoleculeWithVertices(molecule);
        this.molecule = moleculeStructureService.cloneMolecule(molecule);
    }

    getRDKitMolWithAtomNotes(molecule: Molecule) {
        const cxSmiles =
            moleculeStructureService.getCxSmilesWithScores(molecule);
        return window.RDKit.get_mol(cxSmiles);
    }

    scoresToRDKitLabels(atomScores: number[]) {
        const labels: { [id: number]: string } = {};
        atomScores.forEach(
            (score, i: number) => (labels[i] = score.toFixed(2))
        );
        return labels;
    }

    updateMoleculeWithVertices(molecule: Molecule) {
        rdkitService.setVerticesInMolecule(molecule, this);
    }

    updateMoleculeWithOldDrawerVertices(molecule: Molecule) {
        this.updateMoleculeWithVertices(molecule);
        this.molecule = moleculeStructureService.cloneMolecule(molecule);
    }

    draw = (div: HTMLDivElement) => {
        // clearDivChildren(div);
        console.warn("rdKit.draw() is not set up to redraw");
    };

    getMolecule = () => {
        return this.molecule;
    };

    setOriginalVerticesFromExternalDrawer = (
        coordinates: {
            x: number;
            y: number;
            index: number;
        }[]
    ) => {
        const smilesElements = this.molecule.smilesElements;

        const vertices: GVertex[] = [];

        let index: number = 0;
        smilesElements.forEach((smilesElement) => {
            if (moleculeStructureService.smilesElementIsAtom(smilesElement)) {
                const coord = coordinates.find(
                    (coord) => coord.index === index
                )!;
                vertices.push({
                    ...coord,
                    smilesIndex: smilesElement.smilesIndex,
                });
                index += 1;
            }
        });

        this.gVertices = vertices;
    };

    getOriginalVerticesFromExternalDrawer = (): any[] => {
        return this.gVertices;
    };
}
