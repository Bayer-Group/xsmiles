import { equalArrays } from "../util";
import {
    colorblindSafeColorBrewerPalettes,
    ColorBrewerPalettes,
    BayerDivergingPalettes5Colors,
} from "./assets/colorPalettes";
import chroma from "chroma-js";

export type Palette = { name: string; colors: string[] };

export type ColorSpace = {
    colorRange: string[];
    colorDomain: number[];
};

class ColorsService {
    public mid = (colors: string[]) => {
        return Math.floor(colors.length / 2);
    };

    public correctColors = (colors: string[]) =>
        chroma.bezier(colors).scale().correctLightness().colors(colors.length);

    public splitComplementaryFrom2Colors = (color1: string, color2: string) => {
        const hsl1 = chroma(color1).hsl();
        const hsl2 = chroma(color2).hsl();

        // get mid angle
        const maxAngle = Math.max(hsl1[0], hsl2[0]);
        const minAngle = Math.min(hsl1[0], hsl2[0]);
        const diffAngle = maxAngle - minAngle;
        let midAngle = maxAngle - diffAngle / 2;
        if (diffAngle < 180) {
            // small arc -> get the opposite
            midAngle += 180;
        }

        console.log("HSL", hsl1, hsl2, maxAngle, minAngle, diffAngle, midAngle);
        return chroma
            .hsl(midAngle, (hsl1[1] + hsl2[1]) / 2, (hsl1[2] + hsl2[2]) / 2)
            .hex();
    };

    interpolate(colors: string[], domain: number[] = [0, 1]) {
        const leftColors = colors.filter((color, i) => i <= this.mid(colors));
        const rightColors = colors.filter((color, i) => i >= this.mid(colors));

        const correctedColors = [
            ...this.correctColors(leftColors),
            ...this.correctColors(rightColors),
        ];

        return chroma.scale(correctedColors).mode("lab").domain(domain);

    }

    public setMidColorGray = (colors: string[]) => {
        const newColors = [...colors];
        newColors[this.mid(colors)] = "#f1f1f1";
        return newColors;
    };

    public sortPalettes = (palettes: Palette[]): Palette[] => {
        const sortedPalettes = [...palettes];
        sortedPalettes.sort((paletteA, paletteB) =>
            paletteA.name.localeCompare(paletteB.name)
        );
        return sortedPalettes;
    };

    public getDivergingColorblindSafePalettes = (
        sizes: number[] = [3, 5, 7, 9],
        includeReverse: boolean = true
    ): Palette[] => {
        var palettes: Palette[] = [];
        sizes.forEach((size) => {
            colorblindSafeColorBrewerPalettes.forEach((paletteName: string) => {
                palettes.push({
                    name: `${paletteName}_${size}`,
                    colors: ColorBrewerPalettes[paletteName][size],
                });
            });
        });

        Object.keys(BayerDivergingPalettes5Colors).forEach(
            (paletteName: string) => {
                palettes.push({
                    name: `${paletteName}_${BayerDivergingPalettes5Colors[paletteName].length}`,
                    colors: BayerDivergingPalettes5Colors[paletteName],
                });
            }
        );

        if (includeReverse) {
            palettes = this.appendReversePalettes(palettes);
        }

        return this.sortPalettes(palettes);
    };

    public getPaletteByName = (
        name: string,
        size: number = 7,
        reverse: boolean = false
    ) => {
        if (name.includes("_")) {
            const nameSplit = name.split("_");
            if (nameSplit.length > 1) {
                size = parseInt(nameSplit[1]);
            }
            if (nameSplit.length > 2) {
                reverse = name.includes("reverse");
            }
            name = nameSplit[0];
        }
        // console.log("getPaletteByName", name, size, reverse);
        if (Object.keys(ColorBrewerPalettes).includes(name)) {
            if (reverse)
                return {
                    name: `${name}_${size}_reverse`,
                    colors: this.reverse(ColorBrewerPalettes[name][size]),
                };
            else
                return {
                    name: `${name}_${size}`,
                    colors: ColorBrewerPalettes[name][size],
                };
        } else {
            if (Object.keys(BayerDivergingPalettes5Colors).includes(name)) {
                if (reverse)
                    return {
                        name: `${name}_${BayerDivergingPalettes5Colors[name].length}_reverse`,
                        colors: this.reverse(
                            BayerDivergingPalettes5Colors[name]
                        ),
                    };
                else {
                    return {
                        name: `${name}_${BayerDivergingPalettes5Colors[name].length}`,
                        colors: BayerDivergingPalettes5Colors[name],
                    };
                }
            } else {
                return {
                    name: "bayerBlRd",
                    colors: BayerDivergingPalettes5Colors["BlRd"],
                };
            }
        }
    };

    public equalPalettes = (p1: Palette, p2: Palette) => {
        if (p1.name !== p2.name) return false;
        return equalArrays(p1.colors, p2.colors);
    };

    public domain3to5 = (domain: number[]) => {
        let minScore = Math.min(...domain);
        let maxScore = Math.max(...domain);
        let minMid = (minScore + domain[1]) / 2;
        let maxMid = (maxScore + domain[1]) / 2;

        // return domain
        if (minScore <= 0 && maxScore >= 0) {
            return [minScore, minMid, 0, maxMid, maxScore];
        }
        if (minScore > 0) {
            return [minScore, minScore, minScore, maxMid, maxScore];
        }
        if (maxScore < 0) {
            return [minScore, minMid, maxScore, maxScore, maxScore];
        }
    };

    private reverse(colors: string[]) {
        let reversed = [...colors];
        reversed.reverse();
        return reversed;
    }
    private appendReversePalettes(palettes: Palette[]) {
        const palettesAndReverse = [...palettes];
        palettes.forEach((palette) => {
            palettesAndReverse.push({
                name: palette.name + "_reverse",
                colors: this.reverse(palette.colors),
            });
        });
        return palettesAndReverse;
    }
}

export default new ColorsService();
