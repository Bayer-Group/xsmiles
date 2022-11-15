import { SingleView, appendSingleView, Props as SProps, Molecule as SingleMolecule, MoleculeWithMethods as MWM  } from "./modules/SingleView";
import { Method as MolMethod } from "./types/molecule.types";
import {GradientConfigOverwriteDefaults as ModuleGradientConfig } from "./types/gradient.types";
import colorsService, {Palette as PaletteImported} from "./services/colors.service";

// workaround to generate type...TODO do it the right way -> when exporting the module, types must be declared
declare module "xsmiles";

/**
 * Correct color lightness and interpolate.
 * @param hexColors colors vector to be corrected, in hex
 * @returns corrected colors
 */
const interpolate = (hexColors: string[]) => colorsService.interpolate(hexColors);


/**
 * 
 * @returns All color palettes defined by XSMILES, including reversed.
 */
const getColorPalettes = () => colorsService.getDivergingColorblindSafePalettes();

export type SingleViewProps = SProps;
export type Molecule = SingleMolecule;
export type MoleculeWithMethods = MWM;
export type Method = MolMethod;
export type GradientConfig = ModuleGradientConfig;
export type Palette = PaletteImported;
export { SingleView, appendSingleView, interpolate, getColorPalettes };
