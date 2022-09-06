import { RawMolecule } from "../types/molecule.types";
import {
    RawGradient,
    GradientColorMap,
    GradientConfig,
    GradientOpacity,
    GradientRadius,
    Gradient,
    GradientConfigOverwriteDefaults,
} from "../types/gradient.types";
import { Colors } from "./assets/colorPalettes";
import colorsService from "./colors.service";
import moleculeStructureService from "./molecule/molecule.structure.service";
import { absoluteMaxFromVector } from "../util";

class GradientService {
    public getColorDomainWithDefaultIfEmpty(
        gradientConfig: GradientConfig,
        scores: number[]
    ) {
        if (gradientConfig.colorDomain.length === 3) {
            return [...gradientConfig.colorDomain];
        } else {
            const positiveMax = absoluteMaxFromVector(scores);
            return [-positiveMax, 0, positiveMax];
        }
    }

    //this was used when molecules had different sizes...
    public optimizeMinMaxRadius(
        molecule: RawMolecule,
        gradientConfig: GradientConfig
    ) {
        const radius = gradientConfig.radius;

        const nAtoms: number =
            moleculeStructureService.getNAtomsFromSmilesString(molecule.string);

        if (nAtoms > 20) {
            return { min: radius.min * 1.5, max: radius.max * 1.07 };
        } else {
            if (nAtoms > 15) {
                return { min: radius.min * 1.2, max: radius.max * 1.15 };
            } else {
                return { min: radius.min * 1.2, max: radius.max * 1.2 };
            }
        }
    }

    getThresholds(arg0: number): any {
        throw new Error("Method not implemented.");
    }
    cloneGradientConfig(gradientConfig: GradientConfig) {
        return {
            ...gradientConfig,
            thresholds: [...gradientConfig.thresholds],
            colorDomain: [...gradientConfig.colorDomain],
            opacity: { ...gradientConfig.opacity },
            radius: { ...gradientConfig.radius },
        };
    }
    public getGradient = (gradientConfig: GradientConfig): Gradient => {
        const { thresholds, highlight, palette, opacity, radius, delta } =
            gradientConfig;
        //set mid color to gray
        const colors = colorsService.setMidColorGray(palette.colors);
        const interpolator = colorsService.interpolate(colors);
        return {
            ...this.createGradient(
                thresholds,
                [0, ...thresholds, 1.0].map((threshold) =>
                    interpolator(
                        this.adjustedThresForInterpolator(-threshold)
                    ).hex()
                ),
                [0, ...thresholds, 1.0].map((threshold) =>
                    interpolator(
                        this.adjustedThresForInterpolator(threshold)
                    ).hex()
                ),
                highlight ? Array(thresholds.length).fill(Colors.white) : [],
                opacity,
                radius,
                delta
            ),
            ...gradientConfig,
        };
    };

    /**
     * Creates a Gradient object.
     * @param thresholds Vector of thresholds where `threshold-delta > 0.0` and `threshold+delta < 1.0`.
     * @param negativeColors
     * @param positiveColors
     * @param linesColors
     * @param opacity
     * @param radius
     * @param delta
     */
    public createGradient = (
        thresholds: number[],
        negativeColors: string[],
        positiveColors: string[],
        linesColors: string[],
        opacity: GradientOpacity,
        radius: GradientRadius,
        delta: number = 0.01
    ): RawGradient => {
        this.validation(
            thresholds,
            negativeColors,
            positiveColors,
            linesColors,
            opacity,
            radius,
            delta
        );
        const gradient: RawGradient = {
            colors: {
                negative: this.colorMap(
                    negativeColors,
                    linesColors,
                    thresholds,
                    delta
                ),
                positive: this.colorMap(
                    positiveColors,
                    linesColors,
                    thresholds,
                    delta
                ),
            },
            opacity,
            radius,
        };
        return gradient;
    };

    public adjustedThresForInterpolator = (signedThreshold: number) => {
        let adjusted = 0.5 + signedThreshold / 2;
        return adjusted;
    };

    public sortGradientColorMap = (unsorted: GradientColorMap) => {
        const keys = Object.keys(unsorted).map((key) => parseFloat(key));
        keys.sort();

        const map: GradientColorMap = {};
        keys.forEach((key) => {
            map[key] = unsorted[key];
        });

        return map;
    };

    colorMap(
        colors: string[],
        linesColors: string[],
        thresholds: number[],
        delta: number
    ) {
        const map: GradientColorMap = {};
        map[0.0] = colors[0]; //"rgb(255,255,255)";
        thresholds.sort();
        if (thresholds.length > 0) {
            //! we move the white line a little under the threshold...
            // so instead of doing it on the line 0.5
            // we do it on the line 0.5-delta/2
            // so to give more color to what is above 0.5
            // when the circle is small, even if the value is 0.5.. then it doesn't get so much highlight, that would be the reason to shift it
            thresholds.forEach((t, i) => {
                map[t - delta] = colors[i + 1];
                if (linesColors.length === thresholds.length)
                    map[t] = linesColors[i];
                map[t + delta] = colors[i + 2];
            });
        }
        map[1.0] = colors[colors.length - 1];
        return map;
    }

    equalColorMaps = (m1: GradientColorMap, m2: GradientColorMap): boolean => {
        return Object.keys(m1).every(
            (key: string) => m1[parseFloat(key)] === m2[parseFloat(key)]
        );
    };

    validation = (
        thresholds: number[],
        negativeColors: string[],
        positiveColors: string[],
        linesColors: string[],
        opacity: GradientOpacity,
        radius: GradientRadius,
        delta: number
    ) => {
        if (!this.validDelta(delta)) throw new Error("Invalid Delta.");

        if (!this.validThresholds(thresholds, delta))
            throw new Error("Invalid thresholds vector.");

        if (
            !this.validColors(negativeColors, thresholds) ||
            !this.validColors(negativeColors, thresholds)
        )
            throw new Error(
                `Invalid colors vector. ${thresholds.length} thresholds. ${negativeColors.length} neg colors. ${positiveColors.length} pos colors. Thresholds: ${thresholds}. Colors: ${negativeColors}`
            );
    };

    validDelta = (delta: number) => delta > 0 && delta < 1;

    validThresholds = (thresholds: number[], delta: number) => {
        if (thresholds.length === 0) return true;
        return (
            thresholds[0] - delta > 0 &&
            thresholds[thresholds.length - 1] + delta < 1
        );
    };

    validColors = (colors: string[], thresholds: number[]) =>
        colors.length === thresholds.length + 2; // three threshold colors, plus color at 0.0, and at 1.0

    public getThresholdsList = () => {
        return [
            [],
            [0.25],
            [0.5],
            [0.75],
            [0.25, 0.5],
            [0.5, 0.75],
            [0.25, 0.75],
            [0.25, 0.5, 0.75],
        ];
    };

    public getGradientConfig = (
        config?: GradientConfigOverwriteDefaults,
        bondLength?: number
    ): GradientConfig => {
        if (config == null) {
            return this.defaultConfig;
        }

        if (config.palette && typeof config.palette === "string") {
            config.palette = colorsService.getPaletteByName(config.palette);
        }

        const finalConfig: GradientConfig = {
            ...this.defaultConfig,
            ...config,
        };

        if (bondLength) {
            finalConfig.radius = {
                min: 20,
                max: bondLength * 0.9,
            };
        }
        return finalConfig;
    };

    defaultConfig: GradientConfig = {
        thresholds: [],
        colorDomain: [],
        palette: colorsService.getPaletteByName("PRGn", 5, false),
        highlight: false,
        blur: 0.7,
        opacity: { min: 0.6, max: 1 },
        radius: { min: 15, max: 40 }, // the function getGradientConfig adjusts
        delta: 0.05,
    };
}

export default new GradientService();
