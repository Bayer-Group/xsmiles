import React from "react";

import Smiles from "./smiles/Smiles";
import {
    SmilesElement,
    Method,
    Molecule,
    Vertex,
    RawMolecule,
} from "../../types/molecule.types";
import { GradientConfig } from "../../types/gradient.types";

import moleculeViewsService from "../../services/moleculeViews.service";
import { MoleculeViewsConfig } from "../../types/moleculeViews.types";
import moleculeStructureService from "../../services/molecule/molecule.structure.service";
import Legend from "./legend/Legend";
import StructureView from "./structure/StructureView";
import { DrawerConfig, DrawerType } from "../../types/drawer.interface";
import gradientsService from "../../services/gradients.service";
import KDBush from "kdbush";
import colorsService from "../../services/colors.service";
/**
 * Molecule views props
 */
export interface Props {
    id: string;

    rawMolecule: RawMolecule;
    method?: Method; //! method.scores is redefined if smilesSequence is undefined or if method.scores has a different size from smilesElements -> e.g. when graph-based scores are provided, 1 scores per atom instead of 1 scores per "smiles element" (atoms and special chars)

    width?: number;
    height?: number;

    structureColorMode: "atom" | "attribution"; // rather a different color per Atom or scaling the colorsRange to a scores (numeric) from the "method.scores" parameter.

    heatmap?: boolean;

    alphaRange?: number[];

    structureColor?: string;

    background?: string; // if the background is dark, choose the 'dark' theme, 'light' otherwise.

    theme?: "light" | "dark";

    gradientConfig: GradientConfig; //! this gradient is further stored in ViewConfig

    hideBarChart?: boolean;
    hideAttributesTable?: boolean;

    drawerType: DrawerType;

    scaleResolution?: number; // canvas width/height are multiplied by 2, but its stiles is set as half of its size, this improves the resolution of RDKit's drawing and other canvas elements.

    bondLength?: number;

    showScoresOnStructure?: boolean;
}

interface State {
    molecule: Molecule;
    mouseOverChange: boolean;
    viewsConfig: MoleculeViewsConfig;
    kdTreeForAtoms: KDBush | undefined;
    mouseOverVertices: Vertex[];
}

class MoleculeViews extends React.Component<Props, State> {
    /**
     * Creates an instance of molecule views.
     * @param props
     */
    constructor(props: Props) {
        super(props);

        this.state = this.initializeState(props);
    }

    private createMolecule(rawMolecule: RawMolecule): Molecule {
        return moleculeStructureService.preprocessSmilesElementsAndMethod(
            rawMolecule
        );
    }

    private initializeState(props: Props): State {
        const viewsConfig: MoleculeViewsConfig =
            moleculeViewsService.getConfigBasedOnPropsAndMethod(props);

        const molecule = this.createMolecule(props.rawMolecule);
        return {
            molecule,
            mouseOverChange: false,
            viewsConfig,
            kdTreeForAtoms: undefined,
            mouseOverVertices: [],
        };
    }

    switchMouseOverStateController() {
        this.setState({ mouseOverChange: !this.state.mouseOverChange });
    }

    updateStructure = () => {
        this.switchMouseOverStateController();
    };

    returnMoleculeWithVertices = (molecule: Molecule) => {
        const newState = { molecule, kdTreeForAtoms: undefined };
        if (this.state.molecule !== molecule) this.setState(newState);
        if (this.state.molecule.vertices == null) this.setState(newState);
    };

    render() {
        const molecule = this.state.molecule;
        if (molecule == null) return null;

        const { id, drawerType, gradientConfig } = this.props;
        const { scaleResolution = 2 } = this.props; //TODO if you change scaleResolution to 4, it will make the diagram smaller. The correct behavior should be to keep the size but increase resolution.
        const { bondLength = 50 } = this.props;
        const { showScoresOnStructure = false } = this.props;

        const { gradient, colorDomain, colorsRange } = this.updateColorMaps(
            gradientConfig,
            molecule
        );

        const {
            width,
            height,
            hideBarChart,
            hideAttributesTable,
            structureColor,
        } = this.state.viewsConfig;


        const drawerConfig: DrawerConfig = {
            width: width,
            height: height,
            structureColor: structureColor,
            method: molecule.method,
            drawerType: drawerType,
            scaleResolution,
            bondLength,
            showScoresOnStructure,
        };

  

        const structureViewConfig = { gradient, width, height };


        return (
            <div className="MoleculeView smiles-vis  py-0 my-3">
                <div className="row justify-content-center">
                    <StructureView
                        id={this.props.id}
                        molecule={molecule}
                        drawerConfig={drawerConfig} //molecule is here
                        config={structureViewConfig}
                        onMouseMove={(event) =>
                            this.onMouseMoveOverStructure(
                                event,
                                molecule,
                                scaleResolution
                            )
                        }
                        returnMoleculeWithVertices={
                            this.returnMoleculeWithVertices
                        }
                    />
                </div>

                <div className="row justify-content-md-center">
                    {hideBarChart === false && (
                        <Smiles
                            key={"smiles" + id}
                            id={id}
                            smilesString={molecule.string}
                            smilesScores={molecule.method.scores}
                            updateStructure={this.updateStructure}
                            colorsDomain={colorDomain!} // if colorsDomain is undefined, showBarChart is false
                            colorsRange={colorsRange}
                            smilesElements={molecule.smilesElements!} //TODO now smilesElements contains scores, chars, etc... so this component's properties can be compacted
                            alphaRange={this.state.viewsConfig.smilesAlphaRange}
                            thresholds={
                                gradientConfig.thresholds.length
                                    ? gradientConfig.thresholds
                                    : [0.5, 1.0]
                            }
                        />
                    )}
                </div>

                {hideAttributesTable === false && (
                    <Legend
                        maxWidth={this.state.viewsConfig.width}
                        method={molecule.method}
                        colorsDomain={colorDomain}
                        smilesAttributes={molecule.attributes}
                        methodAttributes={
                            molecule.method.attributes
                                ? molecule.method.attributes
                                : {}
                        }
                    />
                )}
            </div>
        );
    }

    onMouseMoveOverStructure = (
        event: any,
        molecule: Molecule,
        scaleResolution: number
    ) => {
   
        if (molecule.vertices) {
            
            const rect = event.target.getBoundingClientRect();
            const x = (event.clientX - rect.left) * scaleResolution; //x position within the element.
            const y = (event.clientY - rect.top) * scaleResolution; //y position within the element.
            const kd = this.state.kdTreeForAtoms;
            if (kd != null) {
               
                const ids = kd.within(x, y, 15);
                if (ids.length === 0) {
                    
                    molecule.vertices.forEach((v) => (v.hover = false));
                    
                    this.setState({ mouseOverVertices: [] });
                } else {
                    
                    const hoverVertices = ids.map((i) => molecule.vertices![i]);
                   
                    hoverVertices.forEach((v) => (v.hover = true));
                    this.setState({ mouseOverVertices: hoverVertices });
                }
            } else {
               
                const index = new KDBush(
                    molecule.vertices.length,
                    1,
                    Int16Array //vertices,
                );

                for (const {position} of molecule.vertices) index.add(position.x, position.y);
                index.finish();
                this.setState({ kdTreeForAtoms: index });
            }
        }
    };

    private updateColorMaps(
        gradientConfig: GradientConfig,
        molecule: Molecule
    ) {
        const colorDomain = gradientsService.getColorDomainWithDefaultIfEmpty(
            gradientConfig,
            molecule.method.scores
        );
        gradientConfig.colorDomain = colorDomain;
        // colorDomain can be empty [] in the gradientConfig, here we want then to set a default behavior: calculate max |scores| and set it to -max, 0, max.
        // can be different from the actual domain of molecule.scores. if the gradient.domain is shorter than the molecule.scores values range, this will highlight the scores that are above/below the gradient.domain

        const gradient = gradientsService.getGradient(gradientConfig);
        const colorsRange = colorsService.setMidColorGray(
            gradient.palette.colors
        );
     // TODO move this to viewsConfig?
        return { gradient, colorDomain, colorsRange };
    }

    private validate(indexedSmilesElements: SmilesElement[], method?: Method) {
        if (method && indexedSmilesElements.length !== method.scores.length) {
            throw new Error(
                "Number of scores is different than number of items in the smiles vector."
            );
        }
    }
}

export default MoleculeViews;
