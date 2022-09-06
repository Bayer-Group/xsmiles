import React, { useEffect, useRef } from "react";
import { StructureViewConfig } from "../../../../types/structure.types";
import {
    Vertex,
} from "../../../../types/molecule.types";
import {
    clearDivChildren,
    equalArrays,
    isEmptyNullUndefined,
} from "../../../../util";
import { color } from "d3-color";
import colorsService from "../../../../services/colors.service";

interface Props {

    hoverVertices: Vertex[];
    config: StructureViewConfig;
    scaleResolution: number;
}


function Highlight(props: Props) {
    const didMountRef = useRef(false);
    const divRef = React.createRef<HTMLDivElement>();

    const { config, hoverVertices, scaleResolution } = props;

    useEffect(() => {
        if (didMountRef.current && divRef.current) {
            drawCanvas(divRef.current, config, hoverVertices, scaleResolution);
        } else didMountRef.current = true;
    });

    if (isEmptyNullUndefined(hoverVertices) == null) return null;

    return (
        <div
            ref={divRef}
            className="Highlight"
            style={{
                width: config.width,
                height: config.height,
                position: "absolute",
                top: "0px",
                left: "0px",
                zIndex: 1,
            }}
        ></div>
    );
}

function areEqual(prevProps: Props, nextProps: Props) {
    if (
        isEmptyNullUndefined(prevProps.hoverVertices) &&
        isEmptyNullUndefined(nextProps.hoverVertices)
    ) {
        return true;
    }
    if (!equalArrays(prevProps.hoverVertices, nextProps.hoverVertices))
        return false;
    if (
        !equalArrays(
            prevProps.config.gradient.palette.colors,
            nextProps.config.gradient.palette.colors
        )
    )
        return false;

    return true;
}
export default React.memo(Highlight, areEqual);

const drawCircle = (
    ctx: CanvasRenderingContext2D,
    vertex: Vertex,
    color: string,
    scaleResolution: number,
    circleStrokeColor: string
) => {
    if (vertex && ctx) {
      
        ctx.strokeStyle = circleStrokeColor;
        ctx.lineWidth = 2 * scaleResolution;
        ctx.beginPath();
        ctx.arc(
            vertex.position.x,
            vertex.position.y,
            12 * scaleResolution,
            0,
            2 * Math.PI
        ); //TODO if RDKit Drawer, it should get the radius from bondLength
       
        ctx.stroke();
       
        ctx.strokeStyle = color;
        ctx.lineWidth = 2 * scaleResolution;
        ctx.beginPath();
        ctx.arc(
            vertex.position.x,
            vertex.position.y,
            10 * scaleResolution,
            0,
            2 * Math.PI
        ); //TODO if RDKit Drawer, it should get the radius from bondLength
       
        ctx.stroke();
    }
};

const drawCanvas = (
    target: HTMLDivElement,
    config: StructureViewConfig,
    hoverVertices: Vertex[],
    scaleResolution: number
) => {
    const canvas = document.createElement("canvas");
    canvas.width = config.width * scaleResolution;
    canvas.height = config.height * scaleResolution;
    canvas.style.width = `${config.width}px`;
    canvas.style.height = `${config.height}px`;

    const colors = config.gradient.palette.colors;
    
    let delta =
        colors.length <= 5
            ? 0
            : colors.length === 7
            ? 1
            : colors.length === 9
            ? 2
            : 1;
    const circleStrokeColor = colorsService.splitComplementaryFrom2Colors(
        colors[0 + delta],
        colors[colors.length - 1 - delta]
    );

    hoverVertices.forEach((vertex) => {
        const ctx = canvas.getContext("2d");
       
        if (ctx && vertex) {
            let c = color(getColor(colors, vertex.atomSmilesElement.score));
            c!.opacity = 0.6;
            drawCircle(
                ctx,
                vertex,
                c!.formatRgb(),
                scaleResolution,
                circleStrokeColor
            );
        }
    });
    clearDivChildren(target);
    target.append(canvas);
};

const getColor = (colors: string[], score: number) => {
    if (score < 0) {
        return colors[0];
    } else if (score > 0) {
        return colors[colors.length - 1];
    } else {
        return "#d1d1d1";
    }
};
