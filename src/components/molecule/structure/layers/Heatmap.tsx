import React from "react";
import { StructureViewConfig } from "../../../../types/structure.types";
import { Molecule, Vertex } from "../../../../types/molecule.types";
import heatmapService from "../../../../services/heatmap.service";
import { clearDivChildren, equalArrays, isEmptyNullUndefined } from "../../../../util";
import gradientsService from "../../../../services/gradients.service";
import colorsService from "../../../../services/colors.service";

interface Props {
    molecule: Molecule;
    vertices: Vertex[] | undefined; // workaround to control rerender
    config: StructureViewConfig;
    scaleResolution: number;
}
interface State {}

class Heatmap extends React.PureComponent<Props, State> {
    private divRef = React.createRef<HTMLDivElement>();
    state = { vertices: [] };

    updateHeatmap() {
        const div = this.divRef.current;
        const { molecule, config, scaleResolution } = this.props;
               
        if (div && !isEmptyNullUndefined(molecule.vertices)) {                      
            
            clearDivChildren(div);
            heatmapService.appendHeatmap(div, molecule, config.gradient, scaleResolution);
            
            this.setState({ vertices: molecule.vertices! });

        }
    }

    componentDidMount() {
        this.updateHeatmap();
    }
    componentDidUpdate() {
        this.updateHeatmap();
    }

    render() {
        const { width, height } = this.props.config;
        return (
            <div
                ref={this.divRef}
                className="Heatmap"
                style={{ width: width, height: height, position: "absolute", top: "0px", left: "0px", zIndex: 0 }}
            ></div>
        );
    }
}

function areEqual(prevProps: Props, nextProps: Props) {
    const pGrad = prevProps.config.gradient;
    const nGrad = nextProps.config.gradient;
    const equalColorDomain = equalArrays(pGrad.colorDomain, nGrad.colorDomain);
    const equalThresholds = equalArrays(pGrad.thresholds, nGrad.thresholds);
    const equalNegColors = gradientsService.equalColorMaps(pGrad.colors.negative, nGrad.colors.negative);
    const equalPosColors = gradientsService.equalColorMaps(pGrad.colors.positive, nGrad.colors.positive);
    const equalHighlight = pGrad.highlight === nGrad.highlight;
    const equalPalette = colorsService.equalPalettes(pGrad.palette, nGrad.palette);
    const equalBlur = pGrad.blur === nGrad.blur;
    const equalOpacity = pGrad.opacity === nGrad.opacity;

    return (
        prevProps.vertices === nextProps.vertices &&
        nextProps.vertices != null &&
        equalArrays(prevProps.vertices!, nextProps.vertices!) &&
        equalColorDomain &&
        equalThresholds &&
        equalNegColors &&
        equalPosColors &&
        equalHighlight &&
        equalPalette &&
        equalBlur &&
        equalOpacity
    );
}

export default React.memo(Heatmap, areEqual);

