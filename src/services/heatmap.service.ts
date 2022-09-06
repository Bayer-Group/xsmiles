import { scaleLinear } from "d3-scale";
import h337 from "heatmap.js";
import { Molecule, Vertex } from "../types/molecule.types";
import { Gradient } from "../types/gradient.types";

class HeatmapService {
    public appendHeatmap = (
        parent: HTMLElement,
        molecule: Molecule,
        gradient: Gradient,
        scaleResolution: number
    ) => {
        const { colorDomain, blur } = gradient;
        const styleBackUp = parent.style.position;

        //! heatmap does NOT need the vertex.contributions to be normalized.
        const vertices: Vertex[] = molecule.vertices!;

        let minDomain = colorDomain[0]; //!should be negative
        let midDomain = colorDomain[Math.round((colorDomain.length - 1) / 2)]; //!should be 0
        let maxDomain = colorDomain[colorDomain.length - 1]; //!should be positive

        // if all scores are zeros, it's a special case in terms of calculating the mapping function. To avoid a problem, se set the range to 0, 0.01.
        const allScoresAreZeros = molecule.method.scores.every(
            (score) => score === 0
        );
        const minOpacity = allScoresAreZeros ? 0.0 : gradient.opacity.min;
        const maxOpacity = allScoresAreZeros ? 0.01 : gradient.opacity.max;

        const minRadius = gradient.radius.min;
        const maxRadius = gradient.radius.max;

        parent.style.width = `${
            parseInt(parent.style.width.replace("px", "")) * scaleResolution
        }px`;
        parent.style.height = `${
            parseInt(parent.style.height.replace("px", "")) * scaleResolution
        }px`;

        const heatmapPos = h337.create({
            container: parent,
            minOpacity,
            maxOpacity,
            radius: 10, // elements will have their own
            blur,
            gradient: gradient.colors.positive,
        });

        let heatmapNeg = h337.create({
            container: parent,
            minOpacity,
            maxOpacity,
            radius: 10,
            blur,
            gradient: gradient.colors.negative,
        });

        let heatmapScalerPos = scaleLinear()
            .domain([midDomain, maxDomain])
            .range([0, 1]);

        function scalePos(value: number) {
            let v = heatmapScalerPos(value);
            if (v < 0) return 0;
            if (v > 1) return 1;
            return v;
        }

        let scaleRadiusPos = scaleLinear()
            .domain([midDomain, maxDomain])
            .range([minRadius, maxRadius]);
        let radiusScalerPos = (value: number) => {
            let v = scaleRadiusPos(value);
            return v <= minRadius
                ? minRadius
                : v >= maxRadius
                ? maxRadius
                : v >> 0;
        };
        let elementsPos = vertices
            .filter(
                (vertex: Vertex) => vertex.atomSmilesElement.score >= midDomain
            )
            .map((vertex: Vertex) => {
                return {
                    x: Math.round(vertex.position.x),
                    y: Math.round(vertex.position.y),
                    value: this.adaptValueToBeOverThresholds(
                        scalePos(vertex.atomSmilesElement.score),
                        gradient
                    ),
                    radius: radiusScalerPos(vertex.atomSmilesElement.score),
                };
            })
            .filter((vertex) => vertex.value !== 0);

        let heatmapScalerNeg = scaleLinear()
            .domain([minDomain, midDomain])
            .range([1, 0]);

        function scaleNeg(value: number) {
            let v = heatmapScalerNeg(value);
            if (v < 0) return 0;
            if (v > 1) return 1;
            return v;
        }

        let scaleRadiusNeg = scaleLinear()
            .domain([minDomain, midDomain])
            .range([maxRadius, minRadius]);
        let radiusScalerNeg = (value: number) => {
            let v = scaleRadiusNeg(value);
            return v <= minRadius
                ? minRadius
                : v >= maxRadius
                ? maxRadius
                : v >> 0;
        };

        let elementsNeg = vertices
            .filter((vertex) => vertex.atomSmilesElement.score < midDomain)
            .map((vertex) => {
                return {
                    x: Math.round(vertex.position.x),
                    y: Math.round(vertex.position.y),
                    value: this.adaptValueToBeOverThresholds(
                        scaleNeg(vertex.atomSmilesElement.score),
                        gradient
                    ),
                    radius: radiusScalerNeg(vertex.atomSmilesElement.score),
                };
            })
            .filter((vertex) => vertex.value !== 0);

        heatmapPos.setData({
            min: 0,
            max: 1, 
            data: elementsPos,
        });
        heatmapNeg.setData({
            min: 0,
            max: 1,
            data: elementsNeg,
        });

        // the heatmap package changes the position style. we change it back from relative to absolute, for example.
        parent.style.width = `${
            parseInt(parent.style.width.replace("px", "")) / scaleResolution
        }px`;
        parent.style.height = `${
            parseInt(parent.style.height.replace("px", "")) / scaleResolution
        }px`;
        parent.style.position = styleBackUp;

        const canvasList = parent.children;
        if (canvasList) {
            for (let i = 0; i < canvasList.length; i++) {
                const canvas = canvasList[i] as HTMLCanvasElement;
                canvas.style.width = parent.style.width;
                canvas.style.height = parent.style.height;
            }
        }
    };

    private adaptValueToBeOverThresholds(
        value: number,       
        gradient: Gradient
    ) {
        if (gradient.thresholds.length > 0) {
            const closeThreshold = gradient.thresholds.find(
                (t) =>
                    value >= t - gradient.delta && value <= t + gradient.delta
            );
            if (closeThreshold) {
                if (closeThreshold <= value) {
                    const newValue = closeThreshold + gradient.delta + 0.01;
                    return newValue > 1 ? 1 : newValue;
                } else {
                    const newValue = closeThreshold - gradient.delta - 0.01;
                    return newValue < 0 ? 0 : newValue;
                }
            }
        }
        return value;
    }
}

export default new HeatmapService();
