import { Palette } from "src/services/colors.service";
import paletteViewService from "../../services/paletteView.service";

type Props = {
    palette: Palette;
};

export default function PaletteView(props: Props) {
    const { palette } = props;

    return (
        <div className="PaletteView">
            <img
                style={{ height: "25px", width: "100%", padding: 0, margin: 0 }}
                src={paletteViewService.ramp(palette.colors).toDataURL()}
                alt="screenshot"
                title={`${
                    palette.name.includes("Bayer")
                        ? palette.name.replace("_" + palette.colors.length, "")
                        : palette.name
                }`}
            />
        </div>
    );
}
