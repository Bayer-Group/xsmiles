import {
    Molecule,
    SmilesElement,
    Vertex,
} from "../types/molecule.types";
import { isEmptyNullUndefined, isEven, mean } from "../util";
import RDKitDrawer, { GVertex } from "./drawers/rdkitDrawer";
import moleculeStructureService from "./molecule/molecule.structure.service";
import getBounds from "svg-path-bounds";

const cmdRegEx = /[a-z][^a-z]*/gi;

type SVGVertex = {
    index: number;
    x: number;
    y: number;
};

type SVGEdge = {
    source: SVGVertex;
    target: SVGVertex;
};

class RDKitServices {
    public setVerticesInMolecule(molecule: Molecule, rdkitDrawer: RDKitDrawer) {
        moleculeStructureService.setVerticesInSmilesElements(
            molecule.smilesElements!,
            rdkitDrawer,
            this.findGVertex,
            this.createVertex
        );
        molecule.vertices =
            moleculeStructureService.getVerticesFromMolecule(molecule);
    }

    private findGVertex = (
        gVertices: GVertex[],
        smilesElement: SmilesElement
    ) => {
        return gVertices.find(
            (v: GVertex) => v.smilesIndex === smilesElement.smilesIndex
        );
    };

    private createVertex = (
        smilesElement: SmilesElement,
        gVertex: any
    ): Vertex | null => {
        if (gVertex == null) return null;
        const atomIndex = gVertex.index;
        const position = { x: gVertex.x, y: gVertex.y };
        return {
            atomIndex,
            position,
            atomSmilesElement: smilesElement,
            hover: false,
        };
    };

    public getMoleculeSVG(
        smiles: string,
        config: { width: number; height: number }
    ) {
        const mol = window.RDKit.get_mol(smiles);
        const drawOpts = {
            noAtomLabels: true,
            width: config.width,
            height: config.height,
        };
        return mol.get_svg_with_highlights(JSON.stringify(drawOpts)) as string;
    }

    public drawMoleculeCanvas(
        smiles: string,
        config: { width: number; height: number }
    ) {
        const mol = window.RDKit.get_mol(smiles);
        const drawOpts = {
            noAtomLabels: true,
            width: config.width,
            height: config.height,
        };
        return mol.get_svg_with_highlights(JSON.stringify(drawOpts)) as string;
    }

    private getCommands(pathD: string): string[] {
        return pathD.match(cmdRegEx)!;
    }

    private getMCommand(pathD: string): string {
        const command = this.getCommands(pathD).find((command: string) =>
            command.includes("M")
        );
        return command ? command.trim() : "M NaN,NaN";
    }

    private getLCommand(pathD: string) {
        const command = this.getCommands(pathD).find((command: string) =>
            command.includes("L")
        );
        return command ? command.trim() : "L NaN,NaN";
    }

    private getSource(linePath: SVGPathElement) {
        const pathD = linePath.getAttribute("d")!;

        const xy = this.getMCommand(pathD)
            .split(",")
            .map((d) => parseFloat(d.replace("M ", "")));

        const index = parseInt(
            linePath.classList.item(1)!.replace("atom-", "").trim()
        );
        return { index, x: xy[0], y: xy[1] };
    }

    private getTarget(linePath: SVGPathElement) {
        const pathD = linePath.getAttribute("d")!;

        const xy = this.getLCommand(pathD)
            .split(",")
            .map((d) => parseFloat(d.replace("L ", "")));

        const index = parseInt(
            linePath.classList.item(2)!.replace("atom-", "").trim()
        );
        return { index, x: xy[0], y: xy[1] };
    }

    private getCoordinatesFromEdge(path: SVGPathElement) {
        return {
            source: this.getSource(path),
            target: this.getTarget(path),
        };
    }

    private getPointsFromPath(path: SVGPathElement) {
        let [left, top, right, bottom] = getBounds(path.getAttribute("d")!);
        return [
            { x: left, y: top },
            { x: right, y: top },
            { x: left, y: bottom },
            { x: right, y: bottom },
        ];
    }

    private getMidPointFromPath(path: SVGPathElement) {
        let [left, top, right, bottom] = getBounds(path.getAttribute("d")!);
        return { x: (left + right) / 2, y: (top + bottom) / 2 };
    }

    private getCoordinatesFromVertex(paths: SVGPathElement[]) {
        let points: { x: number; y: number }[] = [];
        paths.forEach((path) => {
            points = [...points, ...this.getPointsFromPath(path)];
        });
        return this.getCentroidFromPoints(points);
    }

    private getBBox(points: { x: number; y: number }[]) {
        const x = points.map((p) => p.x);
        const left = Math.min(...x);
        const right = Math.max(...x);

        const y = points.map((p) => p.y);
        const bottom = Math.min(...y);
        const top = Math.max(...y);

        return { left, right, top, bottom };
    }


    private getCentroidFromPoints(points: { x: number; y: number }[]) {
        var box = this.getBBox(points);
        const center = {
            x: (box.right + box.left) / 2,
            y: (box.top + box.bottom) / 2,
        };
        // console.log(points, box, center);
        return center;
    }

    private getVertex(index: number, pathNodes: NodeListOf<SVGPathElement>) {
        let candidatePathList = [...Array.from(pathNodes)].filter(
            (path) => path.classList.contains(`atom-${index}`)
        
        );

        let paths = candidatePathList
            .filter((path) => path.classList.length === 1)
            .filter((path) => path.classList.item(0) === `atom-${index}`);
        if (!isEmptyNullUndefined(paths)) {
            // if atom is represented by a single path, like O, Cl, N..
            // console.log("Vertex path", index, paths);
            return { index, ...this.getCoordinatesFromVertex(paths) };
        } else {
            const candidatePaths = this.getCandidatePaths(candidatePathList);

            if (candidatePaths.length === 0)
                throw new Error("Empty candidatePaths vector.");

            // if only one path
            if (candidatePaths.length === 1) {
                const candidate = candidatePaths[0].edge;
            
                return this.getVertexFromIndexedPath(candidate, index);
            } else {
                // give preference to identify long edges from rings...
                if (candidatePaths.length === 2) {
                    const c0 = candidatePaths[0];
                    const c1 = candidatePaths[1];
                    const l0 = this.getEdgeLength(c0.edge);
                    const l1 = this.getEdgeLength(c1.edge);
                    const ratio = l0 < l1 ? l0 / l1 : l1 / l0;
                    if (ratio < 0.99 && l0 > l1) {
                        
                        return this.getVertexFromIndexedPath(c0.edge, index);
                    } else if (ratio < 0.99 && l1 > l0) {
                       
                        return this.getVertexFromIndexedPath(c1.edge, index);
                    }
                }
                // if (candidatePaths.length >= 2) {
                let vertices = [];
                for (let i = 0; i < candidatePaths.length; i += 2) {
                    let part1 = candidatePaths[i];
                    let part2 = candidatePaths[i + 1];
                    if (
                        isEven(candidatePaths.length) &&
                        this.isConnecting(part1.edge.target, part2.edge.source)
                    ) {
                        const edge = {
                            source: part1.edge.source,
                            target: part2.edge.target,
                        };
                        const vertex = this.getVertexFromIndexedPath(
                            edge,
                            index
                        );
                        vertices.push(vertex);
                    } else {
                        vertices.push(
                            this.getVertexFromIndexedPath(part1.edge, index)
                        );
                        isEven(candidatePaths.length) &&
                            vertices.push(
                                this.getVertexFromIndexedPath(part2.edge, index)
                            );
                    }
                }

                const xs = vertices.map((v) => v.x);
                const ys = vertices.map((v) => v.y);

                return {
                    index,
                    x: mean(xs),
                    y: mean(ys),
                };
            }
        }
    }

    private getCandidatePaths(candidatePathList: SVGPathElement[]) {
        const indexedPathList = this.getIndexedPathList(candidatePathList);

        const bonds = this.getBondsNames(indexedPathList);

        const selectedBond = this.getBestBond(bonds, indexedPathList);

        const candidatePaths = indexedPathList.filter(
            (p) => p.bond.trim() === selectedBond.trim()
        );
        return candidatePaths;
    }

    private getEdgeLength(path: SVGEdge) {
        const source = path.source;
        const target = path.target;
        const width =
            source.x > target.x ? source.x - target.x : target.x - source.x;
        const height =
            source.y > target.y ? source.y - target.y : target.y - source.y;
        return Math.hypot(width, height);
    }

    private isConnecting(vertex1: SVGVertex, vertex2: SVGVertex) {
        return vertex1.x === vertex2.x && vertex1.y === vertex2.y;
    }

    private getVertexFromIndexedPath(candidate: SVGEdge, index: number) {
        return candidate.source.index === index
            ? candidate.source
            : candidate.target;
    }

    private getBestBond(
        bonds: string[],
        indexedPathList: {
            path: SVGPathElement;
            bond: string;
            edge: {
                source: { index: number; x: number; y: number };
                target: { index: number; x: number; y: number };
            };
            // length: number;
        }[]
    ) {
        const bondSizes = [];
        for (let i = 0; i < bonds.length; i++) {
            bondSizes.push(
                indexedPathList.filter((p) => p.bond === bonds[i]).length
            );
        }

        const minSize = Math.min(...bondSizes);
        const index = bondSizes.indexOf(minSize)!;

        return bonds[index];
    }

    private getBondsNames(
        indexedPathList: {
            path: SVGPathElement;
            bond: string;
            edge: {
                source: { index: number; x: number; y: number };
                target: { index: number; x: number; y: number };
            };
            // length: number;
        }[]
    ) {
        return Array.from(new Set<string>(indexedPathList.map((p) => p.bond)));
    }

    private getIndexedPathList(candidatePathList: SVGPathElement[]) {
        return candidatePathList.map((path) => {
            return {
                path,
                bond: path.classList.item(0)!,
                edge: this.getCoordinatesFromEdge(path),
            };
        });
    }

    public getMaxEdgeLength = (svg: string) => {
        const pathNodes = this.getPathNodesFromSVG(svg);
        const indexes = this.getAtomsIndexes(pathNodes);
        return Math.max(
            ...indexes.map((index) =>
                this.getMaxEdgeLengthFromVertex(index, pathNodes)
            )
        );
    };

    private getMaxEdgeLengthFromVertex = (
        index: number,
        pathNodes: NodeListOf<SVGPathElement>
    ) => {
        let candidatePathList = [...Array.from(pathNodes)].filter(
            (path) => path.classList.contains(`atom-${index}`)
            //  &&
            // path.classList.length > 1
        );
        let paths = candidatePathList
            .filter((path) => path.classList.length === 1)
            .filter((path) => path.classList.item(0) === `atom-${index}`);
        let edgesLengths = [20];
        if (isEmptyNullUndefined(paths)) {
            const candidatePaths = this.getCandidatePaths(candidatePathList);
            edgesLengths = candidatePaths.map((path) => {
                return this.getEdgeLength(path.edge);
            });
        }

        return Math.max(...edgesLengths);
    };

    public getAtomsCoordinatesFromSVG(svg: string) {
        const pathNodes = this.getPathNodesFromSVG(svg);
        const indexes = this.getAtomsIndexes(pathNodes);
        return indexes.map((index) => this.getVertex(index, pathNodes));
    }

    private getAtomsIndexes(pathNodes: NodeListOf<SVGPathElement>) {
        const indexSet = new Set<number>();
        for (let i = 0; i < pathNodes.length; i++) {
            const path = pathNodes.item(i);
            path.classList.forEach((e) => {
                if (e.includes("atom")) {
                    indexSet.add(parseInt(e.replace("atom-", "")));
                }
            });
        }
        const indexes = Array.from(indexSet);
        indexes.sort((a, b) => a - b);
        return indexes;
    }

    private getPathNodesFromSVG(svg: string) {
        const parser = new DOMParser();
        const svgXml = parser.parseFromString(svg, "text/xml");
        const pathNodes = svgXml.querySelectorAll("path");
        return pathNodes;
    }

    public test(smiles: string) {
        const mol = this.getMoleculeSVG(smiles, { width: 200, height: 200 });
        const coordinates = this.getAtomsCoordinatesFromSVG(mol);
    }
}

export default new RDKitServices();
