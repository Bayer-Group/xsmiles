import { Method } from "./molecule.types";
import { RawGradient } from "./gradient.types";

export type MoleculeViewsParamsToConfig = {
    gradient?: RawGradient;
    width?: number;
    height?: number;
    hideBarChart?: boolean;
    theme?: string;
    structureColor?: string;
    colorsRange?: string[];
    colorsDomain?: number[];
    alphaRange?: number[];
    background?: string;
    smilesAlphaRange?: number[]; // bar chart
    numerical?: boolean; //TODO set better name
    heatmap?: boolean;
    method?: Method;
};

export type MoleculeViewsConfig = {
    width: number;
    height: number;
    hideBarChart: boolean;
    hideAttributesTable: boolean;
    theme: string;
    structureColor: string;
    alphaRange: number[];
    background: string;
    smilesAlphaRange: number[]; // bar chart
    numerical: boolean; //TODO set better name
    heatmap: boolean;   
};
