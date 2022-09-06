import { SingleView, appendSingleView, Props as SProps, Molecule as SingleMolecule, MoleculeWithMethods as MWM  } from "./modules/SingleView";
import { Method as MolMethod } from "./types/molecule.types";
import {GradientConfigOverwriteDefaults as ModuleGradientConfig } from "./types/gradient.types";

// workaround to generate type...TODO do it the right way -> when exporting the module, types must be declared
declare module "xsmiles";

export type SingleViewProps = SProps;
export type Molecule = SingleMolecule;
export type MoleculeWithMethods = MWM;
export type Method = MolMethod;
export type GradientConfig = ModuleGradientConfig;
export { SingleView, appendSingleView };
