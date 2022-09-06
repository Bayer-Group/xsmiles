import { Method, Molecule } from "./molecule.types";

export type DrawerConfig = {
    width: number;
    height: number;
    structureColor: string;
    method: Method;
    drawerType: DrawerType;
    scaleResolution: number; // canvas width/height are multiplied by 2, but its stiles is set as half of its size, this improves the resolution of RDKit's drawing and other canvas elements.
    bondLength: number;
    showScoresOnStructure: boolean;
};

export type DrawerType = "RDKitDrawer" | "RDKitDrawer_black";

export interface Drawer {
    type: DrawerType;
    draw(div: HTMLDivElement): any;
    getOriginalVerticesFromExternalDrawer(): any[];
    getMolecule(): Molecule; //returns the modified Molecule with Vertices and positions x,y
    updateMoleculeWithOldDrawerVertices(molecule: Molecule): any;
}
