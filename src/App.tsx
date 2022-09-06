import React from "react";
import "./App.css";
import LoadingOverlay from "react-loading-overlay-ts";

import {
    DomainByModelHash,
    MoleculeFromJson,
    MoleculesDataset,
    ProcessedMoleculeFromJson,
} from "./types/molecule.types";

import moleculesDatasetService from "./services/molecules.dataset.service";
import MethodsComparisonRow from "./components/webpage/ComparisonRow";
import {
    ColorDomainType,
    RankingType,
    StructureColorMode,
} from "./types/app.types";
import XsmilesAppBar from "./components/webpage/XsmilesAppBar";
import moleculeMethodService from "./services/molecule/molecule.method.service";
import gradientsService from "./services/gradients.service";
import { GradientConfig } from "./types/gradient.types";
import colorsService from "./services/colors.service";
import { DrawerType } from "./types/drawer.interface";

type State = {
    molecules: ProcessedMoleculeFromJson[];
    colorDomainType: ColorDomainType;
    rankingType: RankingType;
    structureColorMode: StructureColorMode;
    scoresDomain: { global: number[]; hashByMethod: DomainByModelHash };
    gradientConfig: GradientConfig;
    colorRangeName: string;
    isLoading: boolean;
    drawerType: DrawerType;
    bondLength: number;
    showScoresOnStructure: boolean;
};
type Props = {};

/**
 * App The main Web application.
 *
 * It is a webpage that takes as input a json file and show structures line-by-line and side-by-side.
 * The idea is that users can input different perspectives (columns) of different molecules (lines).
 */
class App extends React.Component<Props, State> {
    examples: MoleculesDataset = [];
    defaultColorRange: string = "";
    defaultDrawerType: DrawerType = "RDKitDrawer_black";

    constructor(props: Props) {
        super(props);

        const exampleMolecules = moleculesDatasetService.preprocess(
            moleculesDatasetService.getSmallExample()
        );

        const defaultPaletteSimpleName = "PRGn";

        const bondLength = 50;

        const showScoresOnStructure = false;

        const gradientConfig: GradientConfig =
            gradientsService.getGradientConfig(
                {
                    palette: colorsService.getPaletteByName(
                        defaultPaletteSimpleName,
                        5,
                        true
                    ),
                },
                bondLength
            );

        this.defaultColorRange = gradientConfig.palette.name;

        this.state = {
            molecules: exampleMolecules,
            colorDomainType: "ROW_COL",
            rankingType: "ORIGINAL",
            structureColorMode: "attribution",
            scoresDomain: {
                global: moleculeMethodService.getDomainFromDataset(
                    exampleMolecules
                ),
                hashByMethod:
                    moleculeMethodService.getDomainByModelHash(
                        exampleMolecules
                    ),
            },
            gradientConfig,
            colorRangeName: this.defaultColorRange,
            isLoading: false,
            drawerType: this.defaultDrawerType,
            bondLength,
            showScoresOnStructure,
        };
    }

    handleColorDomainChange = (event: any) => {
        this.setState({
            colorDomainType: event.target.value,
            scoresDomain: {
                global: moleculeMethodService.getDomainFromDataset(
                    this.state.molecules
                ),
                hashByMethod: moleculeMethodService.getDomainByModelHash(
                    this.state.molecules
                ),
            },
        });
    };

    handleRankingType = (event: any) => {
        //TODO when ranking we don't need to re-render the visualizations... only sort the rows. Q: Is it still rerendering?
        const molecules = moleculesDatasetService.sortRowsByRankingType(
            this.state.molecules,
            this.state.rankingType
        );
        this.setState({ molecules, rankingType: event.target.value });
    };

    handleDataWasLoaded = (molecules: MoleculeFromJson[]) => {
        this.setState(
            { molecules: moleculesDatasetService.preprocess(molecules) },
            () => {
                this.setStateLoadingFalse();
            }
        );
    };

    setStateLoadingFalse = (callback: any = () => {}) =>
        this.setState({ isLoading: false }, callback);
    setStateLoadingTrue = (callback: any = () => {}) =>
        this.setState({ isLoading: true }, callback);

    changeState = (state: {}) => {
        this.setStateLoadingTrue(() =>
            this.setState(state, () => this.setStateLoadingFalse())
        );
    };

    handleHeatmapHighlightChange = (event: any) => {
        // change heatmap gradient
        const highlight: boolean = event.target.checked;
        const gradientConfig = { ...this.state.gradientConfig, highlight };
        this.setState({ gradientConfig });
    };
    handleShowScoresOnStructureChange = (event: any) => {
        const showScoresOnStructure: boolean = event.target.checked;
        this.setState({ showScoresOnStructure });
    };

    handleThresholdsListChange = (event: any) => {
        // change heatmap gradient
        const index: number = parseInt(event.target.value);
        const thresholdsList = gradientsService.getThresholdsList();
        const thresholds = thresholdsList[index];
        this.setState({
            gradientConfig: { ...this.state.gradientConfig, thresholds },
        });
    };

    handleColorRangeChange = (event: any) => {
        const colorRangeName: string = event.target.value;
        const gradientConfig = {
            ...this.state.gradientConfig,
            palette: colorsService.getPaletteByName(colorRangeName),
        };
        this.setState({ gradientConfig, colorRangeName });
    };

    handleDrawerChange = (event: any) => {
        const drawerType = event.target.value as DrawerType;
        this.setState({ drawerType });
    };

    render() {
        var { molecules, bondLength } = this.state;
        
        if (molecules == null || molecules.length === 0) {
            return null;
        }

        const {
            structureColorMode,
            colorDomainType,
            scoresDomain,
            gradientConfig,
            drawerType,
            showScoresOnStructure
        } = this.state;

        // console.log("Molecules to render: ", molecules);
        return (
            <div key="app" className="App" style={{ marginBottom: "50px" }}>
                <XsmilesAppBar
                    selectedColorDomainType={colorDomainType}
                    globalScoresDomain={scoresDomain.global}
                    handleColorDomainChange={this.handleColorDomainChange}
                    handleDataWasLoaded={this.handleDataWasLoaded}
                    handleRankingTypeChange={this.handleRankingType}
                    molecules={molecules}
                    defaultHeatmapHighlightOn={false}
                    defaultShowScoresOnStructure={false}
                    handleHeatmapHighlightChange={
                        this.handleHeatmapHighlightChange
                    }
                    handleShowScoresOnStructure={this.handleShowScoresOnStructureChange}
                    handleHeatmapNLinesChange={this.handleThresholdsListChange}
                    defaultColorRange={this.defaultColorRange}
                    handleColorRangeChange={this.handleColorRangeChange}
                    defaultThresholdsList={0} //!position of default theshold value in the thresholds vector, you currently need to sync this in the website with the default threshold passed to gradient
                    setStateLoadingTrue={this.setStateLoadingTrue}
                    handleDrawerChange={this.handleDrawerChange}
                    defaultDrawerType={this.defaultDrawerType}
                />

                <LoadingOverlay
                    active={this.state.isLoading}
                    spinner
                    text="Rendering molecules..."
                >
                    <div
                        key={5}
                        className="row"
                        style={{
                            marginTop: "120px",
                            marginLeft: "25px",
                            marginRight: "25px",
                        }}
                    >
                        <div>
                            {molecules &&
                                molecules.map(
                                    (molecule, i) =>
                                        molecule != null && (
                                            <MethodsComparisonRow
                                                key={`${molecule.id}`}
                                                molecule={molecule}
                                                globalScoresDomain={
                                                    scoresDomain.global
                                                }
                                                scoresDomainByModel={
                                                    scoresDomain.hashByMethod
                                                }
                                                structureColorMode={
                                                    structureColorMode
                                                }
                                                colorDomainType={
                                                    colorDomainType
                                                }
                                                gradientConfig={gradientConfig}
                                                drawerType={drawerType}
                                                bondLength={bondLength}
                                                showScoresOnStructure={showScoresOnStructure}
                                            />
                                        )
                                )}
                        </div>
                    </div>
                </LoadingOverlay>
            </div>
        );
    }
}

export default App;
