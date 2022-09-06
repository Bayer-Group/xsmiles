import { Props as MoleculeViewProps } from "../components/molecule/MoleculeViews";
import { MoleculeViewsConfig } from "../types/moleculeViews.types";
class MoleculeViewsService {
    public validate(props: Readonly<MoleculeViewProps> & Readonly<{ children?: import("react").ReactNode }>) {
        if (props.method == null) {
            throw new Error("Method must be defined.");
        }
    }

    public covertTo3ColorRangeForSmilesBars = (colors: string[]) => {
        return [colors[0], "#999999", colors[colors.length - 1]];
    };

    public getConfigBasedOnPropsAndMethod = (props: MoleculeViewProps): MoleculeViewsConfig => {
        const { heatmap = true } = props;

        const defaultLightAlphaRange = heatmap ? [1.0, 1.0] : [0.8, 1.0];

        const defaultDarkAlphaRange = heatmap ? [0.8, 1.0] : [0.2, 1.0];

        const { theme = "light" } = props;

        const { width = 600 } = props;
        const { height = 300 } = props;
        const { hideBarChart = false } = props;
        const { hideAttributesTable = false} = props;

        const { structureColor = theme === "light" ? "#222222" : "#ffffff" } = props;

        const { background = theme === "light" ? "#ffffff" : "#141414" } = props;
        var { alphaRange = theme === "light" ? defaultLightAlphaRange : defaultDarkAlphaRange } = props;

        // copy alphaRange for the bar chart, in case the structure vis uses a different range
        const smilesAlphaRange = [...alphaRange];

        // set a different range for the structure vis when the "atom" mode or "heatmap" are used.
        if (props.alphaRange == null) {
            if (props.structureColorMode === "atom") {
                alphaRange = [1, 1];
            } else if (heatmap) {
                alphaRange = [0.7, 0.7];
            }
        }

        var numerical: boolean = false;
        if (props.structureColorMode === "atom") {
            numerical = false;
        } else {
            numerical = true;
        }

        return {
            width,
            height,
            hideBarChart,
            hideAttributesTable,
            theme,
            structureColor,
            alphaRange,
            background,
            smilesAlphaRange,
            numerical,
            heatmap,
        };
    };

    public updateColorRange = (config: MoleculeViewsConfig) => {
        return { ...config };
    };
}

export default new MoleculeViewsService();
