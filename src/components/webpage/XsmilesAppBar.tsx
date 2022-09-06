
import moleculesDatasetService from "../../services/molecules.dataset.service";
import {
    ProcessedMoleculeFromJson,
} from "../../types/molecule.types";

import jPackage from "../../../package.json";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import gradientsService from "../../services/gradients.service";
import Dropzone from "react-dropzone";
import appService from "../../services/app.service";
import Grid from "@mui/material/Grid";
import colorsService from "../../services/colors.service";
import PaletteView from "./PaletteView";
import { DrawerType } from "../../types/drawer.interface";

type Props = {
    selectedColorDomainType: string;
    defaultHeatmapHighlightOn: boolean;
    defaultShowScoresOnStructure: boolean;
    defaultThresholdsList: number;
    handleDataWasLoaded: (event: any) => void;
    handleColorDomainChange: (event: any) => void;
    handleRankingTypeChange: (event: any) => void;
    handleHeatmapHighlightChange: (event: any) => void;
    handleShowScoresOnStructure: (event: any) => void;
    handleHeatmapNLinesChange: (event: any) => void;
    handleColorRangeChange: (event: any) => void;
    handleDrawerChange: (event: any) => void;
    globalScoresDomain: number[]; //size 3
    defaultColorRange: string;
    defaultDrawerType: DrawerType;
    molecules: ProcessedMoleculeFromJson[];
    setStateLoadingTrue: any;
};

export default function XsmilesAppBar(props: Props) {
    const {
        handleColorDomainChange,
        handleRankingTypeChange,
        handleDataWasLoaded,
        handleHeatmapHighlightChange: handleHighlightChange,
        handleShowScoresOnStructure,
        handleColorRangeChange,
        handleDrawerChange,
        selectedColorDomainType: defaultColorDomainType,
        globalScoresDomain,
        molecules,
        defaultThresholdsList,
        defaultHeatmapHighlightOn: defaultHighlight,
        defaultShowScoresOnStructure,
        defaultColorRange,
        handleHeatmapNLinesChange,
        defaultDrawerType,
    } = props;

    return (
        <AppBar style={{ backgroundColor: "#2e2d2b" }}>
            <Toolbar>
                <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Grid xs={1} item>
                        <Box display="flex" flexGrow={1}>
                            <Typography
                                variant="h6"
                                noWrap
                                component="div"
                                sx={{
                                    flexGrow: 1,
                                    display: { xs: "none", sm: "block" },
                                }}
                            >
                                <span>XSMILES</span>
                                <span style={{ fontSize: 10 }}>
                                    {" "}
                                    {jPackage.version}
                                </span>
                            </Typography>
                        </Box>
                    </Grid>
                   
                    <Grid xs={1} item>
                        <Box sx={{ minWidth: 180, m: 1, p: 0 }}>
                            <FormControl variant="standard" fullWidth>
                                <InputLabel
                                    style={{ color: "lightgray" }}
                                    id="drawerType-select-label"
                                >
                                    Drawer
                                </InputLabel>
                           
                                <Select
                                    style={{ color: "lightgray" }}
                                    labelId="drawerType"
                                    defaultValue={defaultDrawerType}
                                    id="drawerType-select"
                                    label="Drawer"
                                    onChange={handleDrawerChange}
                                >
                                    <MenuItem value={"RDKitDrawer"}>
                                        RDKit drawer
                                    </MenuItem>
                                    <MenuItem value={"RDKitDrawer_black"}>
                                        RDKit drawer (black)
                                    </MenuItem>
                              
                                </Select>
                               
                            </FormControl>
                        </Box>
                    </Grid>
                    <Grid xs={1} item>
                        <Box sx={{ minWidth: 150, m: 1, p: 0 }}>
                            <FormControl variant="standard" fullWidth>
                                <InputLabel
                                    style={{ color: "lightgray" }}
                                    id="colorRange-select-label"
                                >
                                    Color Range
                                </InputLabel>

                                <Select
                                    style={{ color: "lightgray" }}
                                    labelId="colorRangeType"
                                    defaultValue={defaultColorRange}
                                    id="colorRange-select"
                                    label="Color Range"
                                    onChange={handleColorRangeChange}
                                >
                                    {colorsService
                                        .getDivergingColorblindSafePalettes()
                                        .map((palette) => {
                                            return {
                                                ...palette,
                                                colors: colorsService.setMidColorGray(
                                                    palette.colors
                                                ),
                                            };
                                        })
                                        .map((palette) => (
                                            <MenuItem
                                                style={{ width: "300px" }}
                                                key={palette.name}
                                                value={palette.name}
                                            >
                                                <PaletteView
                                                    palette={palette}
                                                />
                                            </MenuItem>
                                        ))}
                                </Select>
                               
                            </FormControl>
                        </Box>
                    </Grid>
                    <Grid xs={1} item>
                        <Box sx={{ minWidth: 180, m: 1, p: 0 }}>
                            <FormControl variant="standard" fullWidth>
                                <InputLabel
                                    style={{ color: "lightgray" }}
                                    id="colorDomainType-select-label"
                                >
                                    Color Domain
                                </InputLabel>
      
                                <Select
                                    style={{ color: "lightgray" }}
                                    labelId="colorDomainType"
                                    defaultValue={defaultColorDomainType}
                                    id="colorDomainType-select"
                                    label="Color Domain"
                                    onChange={handleColorDomainChange}
                                >
                                    <MenuItem value={"GLOBAL"}>
                                        [-m, 0, m] globally
                                    </MenuItem>
                                    <MenuItem value={"COL"}>
                                        [-m, 0, m] per column
                                    </MenuItem>
                                    <MenuItem value={"ROW"}>
                                        [-m, 0, m] per row
                                    </MenuItem>
                                    <MenuItem value={"ROW_COL"}>
                                        [-m, 0, m] per item
                                    </MenuItem>
                                    <MenuItem value={"MONE_TO_ONE"}>
                                        [-1, 0, 1]
                                    </MenuItem>
                                    <MenuItem value={"HALF"}>
                                        [-0.50, 0, 0.50]
                                    </MenuItem>
                                    <MenuItem value={"ONE_THIRD"}>
                                        [-0.33, 0, 0.33]
                                    </MenuItem>
                                    <MenuItem value={"ONE_TEN"}>
                                        [-0.10, 0, 0.10]
                                    </MenuItem>
                                    <MenuItem value={"ONLY_SIGNAL"}>
                                        Signal -/+ only
                                    </MenuItem>
                                </Select>
                            
                            </FormControl>
                        </Box>
                    </Grid>

                    <Grid>
                       
                        <Box sx={{ minWidth: 150, m: 1, p: 0 }}>
                            <FormControl variant="standard" fullWidth>
                                <InputLabel
                                    style={{ color: "lightgray" }}
                                    id="rankingType-select-label"
                                >
                                    Sorting
                                </InputLabel>
                                <Select
                                    style={{ color: "lightgray" }}
                                    labelId="rankingType"
                                    id="rankingType-select"
                                    label="Ranking"
                                    defaultValue="ORIGINAL"
                                    onChange={handleRankingTypeChange}
                                >
                                    <MenuItem value={"INNER_STD"}>
                                        max(std(col_i))
                                    </MenuItem>
                                    <MenuItem value={"AVERAGE"}>
                                        mean(abs(cols))
                                    </MenuItem>
                                    <MenuItem value={"STD"}>std(cols)</MenuItem>
                                    {moleculesDatasetService
                                        .getAttributesNames(molecules)
                                        .map((name, i) => (
                                            <MenuItem key={i} value={name}>
                                                {name}
                                            </MenuItem>
                                        ))}
                                    <MenuItem value={"ORIGINAL"}>
                                        original
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                       
                    </Grid>
                    <Grid
                        item
                        xs={2}
                        container
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Grid item xs={12} md={6}>
                            <Box
                                sx={{
                                    minWidth: 100,
                                    m: 1,
                                    marginLeft: "50px",
                                    marginRight: 0,
                                    p: 0,
                                }}
                            >
                               
                                <FormControl variant="standard" fullWidth>
                                    <InputLabel
                                        style={{ color: "lightgray" }}
                                        id="heatmapNLines-select-label"
                                    >
                                        Heatmap thresholds
                                    </InputLabel>
                                    <Select
                                        style={{ color: "lightgray" }}
                                        labelId="heatmapNLines"
                                        id="heatmapNLines-select"
                                        label="Heatmap thresholds"
                                        defaultValue={`${defaultThresholdsList}`}
                                        onChange={handleHeatmapNLinesChange}
                                    >
                                        {gradientsService
                                            .getThresholdsList()
                                            .map((thresholdList, i: number) => {
                                                return (
                                                    <MenuItem
                                                        key={i}
                                                        value={i}
                                                    >{`[${thresholdList
                                                        .map((n) =>
                                                            n.toFixed(2)
                                                        )
                                                        .join(
                                                            ", "
                                                        )}]`}</MenuItem>
                                                );
                                            })}
                                    </Select>
                                </FormControl>
                                {/* </Tooltip> */}
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Box
                                sx={{
                                    minWidth: 150,
                                    m: 1,
                                    p: 0,
                                    marginLeft: 0,
                                    marginTop: "25px",
                                }}
                            >
                       
                                <FormControlLabel
                                    style={{ color: "lightgray" }}
                                    control={
                                        <Checkbox
                                            defaultChecked={
                                                defaultHighlight == null
                                                    ? true
                                                    : defaultHighlight
                                            }
                                            style={{ color: "lightgray" }}
                                            onChange={handleHighlightChange}
                                            inputProps={{
                                                "aria-label": "controlled",
                                            }}
                                        />
                                    }
                                    label="Highlight"
                                />
                              
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Box
                                sx={{
                                    minWidth: 150,
                                    m: 1,
                                    p: 0,
                                    marginLeft: 0,
                                    marginTop: "25px",
                                }}
                            >
                                <FormControlLabel
                                    style={{ color: "lightgray" }}
                                    control={
                                        <Checkbox
                                            defaultChecked={
                                                defaultShowScoresOnStructure ==
                                                null
                                                    ? false
                                                    : defaultShowScoresOnStructure
                                            }
                                            style={{ color: "lightgray" }}
                                            onChange={
                                                handleShowScoresOnStructure
                                            }
                                            inputProps={{
                                                "aria-label": "controlled",
                                            }}
                                        />
                                    }
                                    label="Scores"
                                />
                            </Box>
                        </Grid>
                    </Grid>
                    <Box>
                        <div className="dropzone row">
                            <Dropzone
                                onDrop={(files: any[]) => {
                                    props.setStateLoadingTrue();
                                    return appService.loadData(
                                        files,
                                        handleDataWasLoaded
                                    );
                                }}
                                accept={{"application/json":[".json", ".JSON"]}}
                                maxFiles={1}
                                validator={(file: File) => {
                                    return null;
                                }}
                            >
                                {({ getRootProps, getInputProps }) => (
                                    <section>
                                        <div {...getRootProps()}>
                                            <input {...getInputProps()} />
                                            <p>Upload JSON</p>
                                        </div>
                                    </section>
                                )}
                            </Dropzone>
                        </div>
                    </Box>
                </Grid>
            
            </Toolbar>
        </AppBar>
    );
}
