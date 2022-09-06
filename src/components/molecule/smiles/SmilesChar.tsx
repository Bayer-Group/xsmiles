import React from "react";
import { scaleLinear, max, min, color as d3Color } from "d3";
import colorsService from "../../../services/colors.service";
interface Props {
    char: string;
    updateStructure(
        hoverVertices: { smilesElementIndex: number; hover: boolean }[]
    ): void;
    index: number;
    hover: boolean;
    score: number;
    width: number;
    height: number;
    x: number;
    fontSize: number;
    colorsDomain: number[];
    colorsRange: string[];
    alphaRange: number[];
}

interface SmilesCharState {
    hover: boolean;
}

class SmilesChar extends React.Component<Props, SmilesCharState> {
    alphaScale: any;
    colorScale: any;
    barScale: any;
    maxBarSize: number;
    constructor(props: Props) {
        super(props);

        this.state = { hover: this.props.hover };

        this.maxBarSize = props.height - 4 * props.fontSize;
        this.updateAlphaScaler(props);
        this.updateColorScale(props);
        this.updateBarScale(props);
    }

    updateAlphaScaler(props: Props) {
        let positiveDomain = props.colorsDomain.map((v) => Math.abs(v)).sort();
        let alphaDomain = [0, max(positiveDomain)!];
        let scaler = scaleLinear().domain(alphaDomain).range(props.alphaRange);
        this.alphaScale = (alpha: number) => scaler(Math.abs(alpha));
    }

    updateColorScale(props: Props) {
      
        this.colorScale = (value: number) =>
            colorsService
                .interpolate(
                    props.colorsRange,
                    props.colorsDomain
                )(value)
                .hex();
    }

    updateBarScale(props: Props) {
        let positiveDomain = props.colorsDomain.map((v) => Math.abs(v)).sort();
        let alphaDomain = [0, max(positiveDomain)!];
        this.barScale = scaleLinear<number>()
            .domain(alphaDomain)
            .range([0.25, this.maxBarSize]);
    }

    // TODO check if this is run only when necessary, also change to a functional component? This was a "componentWillUpdate" which is not recommended to use
    update(nextProps: Props) {
        this.updateAlphaScaler(nextProps);
        this.updateColorScale(nextProps);
        this.updateBarScale(nextProps);
    }

    render() {
        this.update(this.props);
       
        let { width, height, score, char, x, fontSize } = this.props;

        const charY = this.maxBarSize + fontSize / 2;
        const barY1 = this.maxBarSize;

        const colorsDomain = this.props.colorsDomain;

        const maxDomain = max(colorsDomain);
        const minDomain = min(colorsDomain);
        let cScale = null;
        if (maxDomain && score > maxDomain) {
            cScale = this.colorScale(maxDomain);
        } else if (minDomain && score < minDomain) {
            cScale = this.colorScale(minDomain);
        } else if (maxDomain && minDomain) {
            cScale = this.colorScale(score);
        }
        let opacity =
            this.state.hover || this.props.hover ? 1.0 : this.alphaScale(score);

        let color = cScale; // limit the color mapping to the max range of colors - it was reaching colors outside the colorRange.

 
        //todo -bar size scale score...

        const maxDomainAbs = Math.max(
            Math.abs(maxDomain!),
            Math.abs(minDomain!)
        );
        let absScaledScore = Math.abs(score) / maxDomainAbs;
        let strokeColor = this.colorScale(score);
        const m = scaleLinear<number>()
            .domain([0, maxDomainAbs])
            .range([maxDomainAbs, maxDomainAbs / 2]);

        let deltaStrokeScore = m(absScaledScore);
        deltaStrokeScore =
            deltaStrokeScore <= maxDomainAbs / 2
                ? maxDomainAbs / 2
                : deltaStrokeScore >= maxDomainAbs
                ? maxDomainAbs
                : deltaStrokeScore;
        strokeColor =
            score < 0
                ? this.colorScale(score - deltaStrokeScore)
                : score > 0
                ? this.colorScale(score + deltaStrokeScore)
                : d3Color(this.colorScale(0))?.darker(1).formatHex();

        let style: any = {};
        if (this.state.hover || this.props.hover) {
            style = {
                backgroundColor: "black",
                opacity: 1,
                fontWeight: "bold",
                fontSize: fontSize,
                height: height,
                cursor: "default",
                filter: "drop-shadow(0px 3px 3px rgba(1, 1, 1, 0.5))"
            };
        } else {
            style = { cursor: "default" };
        }

        return (
            <g style={style} transform={`translate(${x},${0})`}>
                <g>
                    <text
                        opacity={opacity}
                        x={width / 2}
                        y={charY}
                        fill={
                                d3Color(strokeColor)?.darker(2.5).formatHex()
                        }
                        fontSize={fontSize}
                        dominantBaseline="central"
                        textAnchor="middle"
                    >
                        {char}
                    </text>
                    <g
                        transform={`translate(${width / 2},${
                            charY + 10
                        }) rotate(90)`}
                    >
                        <text
                            opacity={opacity}
                            fill={
                                    d3Color(strokeColor)?.darker(1.5).formatHex()
                            }
                            fontSize={fontSize / 1.7}
                            dominantBaseline="central"
                            fontFamily="'Courier New', monospace"
                            textAnchor="start"
                        >
                            {score === 0
                                ? `\u00A00`
                                : score > 0
                                ? `\u00A0${score.toFixed(2)}`
                                : score.toFixed(2)}
                            
                        </text>
                    </g>

                    {(this.state.hover || this.props.hover) && (
                        <line
                            x1={fontSize / 2}
                            y1={barY1}
                            x2={fontSize / 2}
                            y2={barY1 - this.barScale(Math.abs(score))}
                            stroke={"white"}
                            strokeWidth={width / 1.5}
                        />
                    )}
                  
                    <rect
                        x={fontSize / 4}
                        y={barY1 - this.barScale(Math.abs(score))}
                        width={width / 2}
                        height={this.barScale(Math.abs(score))}
                        fill={color}
                        strokeOpacity={0.35}
                        stroke={strokeColor}
                    />
                </g>
            </g>
        );
    }
}

function areEqual(prevProps: Props, nextProps: Props) {
    if (prevProps.hover !== nextProps.hover) return false;

    if (prevProps.char !== nextProps.char) return false;
    if (prevProps.width !== nextProps.width) return false;
    if (prevProps.height !== nextProps.height) return false;
    if (prevProps.updateStructure !== nextProps.updateStructure) return false;
    if (prevProps.x !== nextProps.x) return false;
    if (prevProps.fontSize !== nextProps.fontSize) return false;
    if (prevProps.colorsDomain !== nextProps.colorsDomain) return false;
    if (
        prevProps.colorsRange[0] !== nextProps.colorsRange[0] ||
        prevProps.colorsRange[2] !== nextProps.colorsRange[2]
    )
        return false;
    if (prevProps.alphaRange !== nextProps.alphaRange) return false;
    return true;
}

export default React.memo(SmilesChar, areEqual);
