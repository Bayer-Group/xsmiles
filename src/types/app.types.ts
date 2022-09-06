export type StructureColorMode = "atom" | "attribution";

export type RankingType = "ORIGINAL" | "AVERAGE" | "STD" | "INNER_STD";

export type ColorDomainType = "COL" | "GLOBAL" | "ROW" | "MONE_TO_ONE" | "HALF" | "ONE_THIRD" | "ROW_COL" | "ONE_TEN" | "ONLY_SIGNAL";

declare global {
    interface Window {
        initRDKitModule:any;
        RDKit:any;
    }
}
