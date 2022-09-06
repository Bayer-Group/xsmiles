import { Component, MouseEvent } from "react";
import SmilesChar from "./SmilesChar";
import "./Smiles.css";
import { SmilesElement } from "../../../types/molecule.types";
import moleculeGraphicService from "../../../services/molecule/molecule.graphic.service";
import { scaleLinear } from "d3";
interface SmilesProps {
    smilesString: string;
    id: string;
    updateStructure(): void;
    smilesScores: number[];
    colorsDomain: number[];
    colorsRange: string[];
    alphaRange: number[];
    smilesElements: SmilesElement[];
    thresholds?: number[];
}

interface SmilesState {
    hoverController: boolean;
}

class Smiles extends Component<SmilesProps, SmilesState> {
    constructor(props: SmilesProps) {
        super(props);
        this.state = { hoverController: true };
    }

    updateComponent = () => {
        this.setState({ hoverController: !this.state.hoverController });
    };

    getBarScale(maxBarSize: number) {
        return scaleLinear<number>().domain([0, 1]).range([0.25, maxBarSize]);
    }

    onMouseOver = (smilesElement: SmilesElement) => {
        const smilesElements = this.props.smilesElements;
        moleculeGraphicService.setVerticesHoverStateBasedOnType(
            smilesElements,
            [smilesElement],
            true
        );
        this.props.updateStructure();
        this.updateComponent();
    };

    onMouseOut = (smilesElement: SmilesElement) => {
        const smilesElements = this.props.smilesElements;
        moleculeGraphicService.setVerticesHoverStateBasedOnType(
            smilesElements,
            [smilesElement],
            false
        );
        this.props.updateStructure();
        this.updateComponent();
    };

    render() {
        const { colorsDomain, colorsRange, alphaRange } = this.props;

        const { thresholds = [0.5, 1] } = this.props;

        const padding = 5;
        const charWidth = 16;
        const height = 100;
        const fontSize = 16;

        const paddingControl = 0.7;
        const graphicWidth =
            charWidth * paddingControl * this.props.smilesString.length +
            4 * padding;

        const maxBarSize = height - 4 * fontSize;
        const barThresholdsScale01 = this.getBarScale(maxBarSize);

        return (
            <div className="smiles-view" style={{ lineHeight: height + "px" }}>
                <svg
                    style={{
                        width: graphicWidth,
                        height,
                    }}
                >
                    <g transform={`translate(${2 * padding},0)`}>
                        <g>
                            {thresholds.map((threshold) => (
                                <line
                                    key={threshold}
                                    x1={-padding + fontSize / 4}
                                    y1={
                                        maxBarSize -
                                        barThresholdsScale01(threshold)
                                    }
                                    x2={
                                        charWidth *
                                            paddingControl *
                                            this.props.smilesElements.length +
                                        padding
                                    }
                                    y2={
                                        maxBarSize -
                                        barThresholdsScale01(threshold)
                                    }
                                    stroke={"black"}
                                    // strokeWidth={width / 2}
                                    opacity={0.1}
                                />
                            ))}
                        </g>
                        {this.props.smilesElements.map((smilesElement, i) => {
                            return (
                                <g
                                    key={i}
                                    onMouseOver={(event: MouseEvent) =>
                                        this.onMouseOver(smilesElement)
                                    }
                                    onMouseOut={(event: MouseEvent) =>
                                        this.onMouseOut(smilesElement)
                                    }
                                >
                                    <SmilesChar
                                        char={smilesElement.chars}
                                        index={smilesElement.smilesIndex}
                                        hover={
                                            smilesElement.vertex
                                                ? smilesElement.vertex.hover
                                                : false
                                        }
                                        updateStructure={
                                            this.props.updateStructure
                                        }
                                        score={this.props.smilesScores[i]}
                                        width={charWidth}
                                        height={height}
                                        x={i * (charWidth * paddingControl)}
                                        fontSize={fontSize}
                                        colorsDomain={colorsDomain}
                                        colorsRange={colorsRange}
                                        alphaRange={alphaRange}
                                    />
                                </g>
                            );
                        })}
                    </g>
                </svg>
            </div>
        );
    }
}

export default Smiles;
