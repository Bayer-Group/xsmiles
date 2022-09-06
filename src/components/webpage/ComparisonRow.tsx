import {
    DomainByModelHash,
    ProcessedMoleculeFromJson,
} from "../../types/molecule.types";
import MoleculeViews from "../molecule/MoleculeViews";
import { ColorDomainType, StructureColorMode } from "../../types/app.types";
import moleculeMethodService from "../../services/molecule/molecule.method.service";
import React, { useRef } from "react";
import {
    GradientConfig,
} from "../../types/gradient.types";

import Paper from "@mui/material/Paper";
import moleculeStructureService from "../../services/molecule/molecule.structure.service";
import gradientsService from "../../services/gradients.service";
import { DrawerType } from "../../types/drawer.interface";

type Props = {
    molecule: ProcessedMoleculeFromJson;
    structureColorMode: StructureColorMode;
    colorDomainType: ColorDomainType;
    scoresDomainByModel: DomainByModelHash;
    globalScoresDomain: number[];
    gradientConfig: GradientConfig;
    drawerType: DrawerType;
    bondLength: number;
    showScoresOnStructure: boolean;
};

function MethodsComparisonRow(props: Props) {
    const comparisonMolecules = createMolecules(props.molecule);
    const _moleculeRef = useRef(comparisonMolecules); //? try? to set up the array of molecules only when creating component. When users change the dataset, the component key will change too, it is computed based on molecule.id, which should be based on timestamp, index and smiles string.

    const {
        molecule: processedJsonMolecule,
        scoresDomainByModel,
        globalScoresDomain,
        gradientConfig: originalGradientConfig,
        showScoresOnStructure
    } = props;
    const { colorDomainType = "ROW_COL" } = props;
    const { structureColorMode = "attribution" } = props;
    const { drawerType = "RDKitDrawer_black" } = props;
    const { bondLength } = props;

    if (_moleculeRef.current)
        return (
            <div>
                {/* TODO remove bootstrap and use only MUI.. (className = row) */}
                <Paper
                    elevation={2}
                    className="row text-center"
                    style={{ marginTop: 7, marginBottom: 7 }}
                >
                    {_moleculeRef.current.map((molecule, j) => {
                        const colorDomain =
                            colorDomainType === "ROW_COL"
                                ? []
                                : moleculeMethodService.getColorDomainByType(
                                      colorDomainType,
                                      globalScoresDomain,
                                      scoresDomainByModel,
                                      molecule.method,
                                      processedJsonMolecule
                                  );

                        const gradientConfig =
                            gradientsService.cloneGradientConfig(
                                originalGradientConfig
                            );
                            
                        gradientConfig.colorDomain = colorDomain;

                        return (
                            <div
                                className="col"
                                style={{
                                    marginLeft: "15px",
                                    marginRight: "15px",
                                }}
                                key={j}
                            >
                                <MoleculeViews
                                    id={`${molecule.id}_${j}`}
                                    rawMolecule={molecule}
                                    method={molecule.method} // TODO remove this, method is in molecule already
                                    structureColorMode={structureColorMode}
                                    structureColor={"#333333"}
                                    gradientConfig={gradientConfig}
                                    drawerType={drawerType}
                                    bondLength={bondLength}
                                    showScoresOnStructure={showScoresOnStructure}
                                />
                            </div>
                        );
                    })}
                </Paper>
            </div>
        );
    else return null;
}

const createMolecules = (processedJsonMolecule: ProcessedMoleculeFromJson) => {
    return processedJsonMolecule.methods.map((method) =>
        moleculeStructureService.createRawMolecule(
            processedJsonMolecule,
            method
        )
    );
    //! molecule now has only 1 method, not methods. It also "cloned" it... so in the multiple MoleculeViews that are being created here, each one deals with a different molecule object. Molecule object is changed all the time in place, because it is built along the rendering of all components. Some nested components add information in this molecule. If molecules is already set in this component (row of molecules), then we try not to change this vector... so that the "state-molecule" that are passed to the children is the same as before. For example, when changing color, or ranking rows, we don't want to update molecule itself.
};

function areEqual(prevProps: Props, nextProps: Props) {
    if (prevProps.molecule !== nextProps.molecule) return false;
    if (prevProps.gradientConfig !== nextProps.gradientConfig) return false;
    if (prevProps.structureColorMode !== nextProps.structureColorMode)
        return false;
    if (prevProps.colorDomainType !== nextProps.colorDomainType) return false;
    if (prevProps.scoresDomainByModel !== nextProps.scoresDomainByModel)
        return false;
    if (prevProps.globalScoresDomain !== nextProps.globalScoresDomain)
        return false;
    if (prevProps.drawerType !== nextProps.drawerType) return false;
    if(prevProps.showScoresOnStructure!==nextProps.showScoresOnStructure) return false;
    return true;
    
}

export default React.memo(MethodsComparisonRow, areEqual);
