import { Palette } from "../services/colors.service";

export type GradientOpacity = {
    min: number;
    max: number;
};

export type GradientRadius = {
    min: number;
    max: number;
};

export type GradientColorMap = { [id: string]: string };

export type RawGradient = {
    colors: {
        negative: GradientColorMap;
        positive: GradientColorMap;
    };
    opacity: GradientOpacity;
    radius: GradientRadius;
};

export interface Gradient extends RawGradient {
    thresholds: number[];
    highlight: boolean;
    blur: number;
    palette: Palette;
    colorDomain: number[];
    delta: number;
}

export type GradientConfig = {
    thresholds: number[];
    highlight: boolean;
    blur: number;
    palette: Palette;
    colorDomain: number[];
    opacity: GradientOpacity;
    radius: GradientRadius;
    delta: number;
};

export type GradientConfigOverwriteDefaults = {
    thresholds?: number[];
    highlight?: boolean;
    blur?: number;
    palette?: Palette;
    colorDomain?: number[];
    opacity?: GradientOpacity;
    radius?: GradientRadius;
    delta?: number;
};