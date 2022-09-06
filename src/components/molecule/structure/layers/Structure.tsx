import React from "react";
import { Molecule } from "../../../../types/molecule.types";
import {
    Drawer,
    DrawerConfig,
} from "../../../../types/drawer.interface";
import { isEmptyNullUndefined } from "../../../../util";
import drawerService from "../../../../services/drawers/drawer.service";

import moleculeStructureService from "../../../../services/molecule/molecule.structure.service";
import RDKitDrawer from "src/services/drawers/rdkitDrawer";
interface Props {
    id: string;
    width?: number;
    height?: number;
    drawerConfig: DrawerConfig;
    returnMoleculeWithVertices: (molecule: Molecule) => void;
    molecule: Molecule;
}
type State = {
    drawer: Drawer | null;
    molecule: Molecule;
};
class Structure extends React.PureComponent<Props, State> {
    ref: any;

    constructor(props: Props) {
        super(props);
        this.state = { drawer: null, molecule: this.props.molecule };
        this.ref = React.createRef<HTMLDivElement>();
    }

    componentDidMount() {
        const auxMolecule = moleculeStructureService.cloneMolecule(
            this.props.molecule
        );
        const drawer = drawerService.createDrawer(
            this.props.id,
            this.props.molecule,
            this.props.drawerConfig
        ) as Drawer;
        this.setState({ drawer, molecule: auxMolecule });
    }

    resetCanvas = (canvas: HTMLCanvasElement) => {
        const context = canvas.getContext("2d");
        context!.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.width = "";
        canvas.style.height = "";
        canvas.width = this.props.drawerConfig.width;
        canvas.height = this.props.drawerConfig.height;
    };

    componentDidUpdate() {
     
        let drawer = this.state.drawer;
        const { molecule } = this.state;

        if (
            drawer !== null &&
            (this.props.drawerConfig.drawerType !== drawer.type || (this.props.drawerConfig.drawerType.includes("RDKit") && this.props.drawerConfig.showScoresOnStructure !== (drawer as RDKitDrawer).showScoresOnStructure))
        ) {
            const canvas = this.ref.current;
           
            this.resetCanvas(canvas);
            drawer = drawerService.createDrawer(
                this.props.id,
                molecule,
                this.props.drawerConfig
            ) as Drawer;

            drawer.updateMoleculeWithOldDrawerVertices(molecule);
            const newMolecule = drawer.getMolecule();
            this.props.returnMoleculeWithVertices(newMolecule);

            this.setState({ drawer, molecule: newMolecule }); //cloned molecule
            return;
        }

        if (drawer) {
            if (isEmptyNullUndefined(molecule.vertices)) {
                //! IMPORTANT - this method will refill the molecule with the vertex of the drawer that was created initially. UNfortunately when we use the web interface and change the color scale, a new molecule object is created for each method (cloned)... and this is resetting the smilesElements vector, with new SmilesElement, meaning that smilesElement.vertex === null. This method calls  the initial drawer to refill the vertices without recreating the graph/tree nor processing the smiles string again.
                drawer.updateMoleculeWithOldDrawerVertices(molecule);
                if (!isEmptyNullUndefined(molecule.vertices)) {
                    const moleculeWithVertices = drawer.getMolecule();
                    this.props.returnMoleculeWithVertices(moleculeWithVertices); //! we need to notify StructureView, so that it can draw the Heatmap and Highlight based on the vertices (x,y) that the drawer created (graph with vertices and edges) to draw the molecule.
                    this.setState({ molecule: moleculeWithVertices }); //cloned molecule
                    return;
                }
            }
        }
    }

    // this drawing does not need to update... only if smiles string change
    // of if type of drawer updates
    render() {
        return (
            <canvas
                ref={this.ref}
                id={this.props.id}
                width={this.props.drawerConfig.width}
                height={this.props.drawerConfig.height}
                style={{ zIndex: 4, position: "relative" }}
            ></canvas>
        );
    }
}

function areEqual(prevProps: Props, nextProps: Props) {
    if (prevProps.molecule !== nextProps.molecule) return false;
    if (prevProps.id !== nextProps.id) return false;
    if (prevProps.width !== nextProps.width) return false;
    if (prevProps.height !== nextProps.height) return false;
    if (prevProps.drawerConfig.drawerType !== nextProps.drawerConfig.drawerType)
        return false;
    if (prevProps.drawerConfig.drawerType !== nextProps.drawerConfig.drawerType)
        return false;
    if (prevProps.drawerConfig.method !== nextProps.drawerConfig.method)
        return false;
    if (
        prevProps.drawerConfig.structureColor !==
        nextProps.drawerConfig.structureColor
    )
        return false;
    if (prevProps.drawerConfig.width !== nextProps.drawerConfig.width)
        return false;
    if (
        prevProps.drawerConfig.showScoresOnStructure !==
        nextProps.drawerConfig.showScoresOnStructure
    )
        return false;
    if (prevProps.drawerConfig.height !== nextProps.drawerConfig.height)
        return false;

    return true;
}

export default React.memo(Structure, areEqual);
