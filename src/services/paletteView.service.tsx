import colorsService from "./colors.service";

class PaletteViewService {
    public swatches = (colors: string[]) => {
        const n = colors.length;
        return (
            <svg
                viewBox={`0 0 ${n} 1`}
                style={{ display: "block", width: `${n * 33}px`, height: "33px", margin: "0 -14px", cursor: "pointer" }}
            >
                {colors.map((c, i) => (
                    <rect x={i} width={1} height={1} fill={c}></rect>
                ))}
            </svg>
        );
    };

    public ramp = (colors: string[], n: number = 300) => {
        const interpolate = colorsService.interpolate(colors);
        colors = [];

        for (let i = 0; i < n; ++i) {
            const color = interpolate(i / (n - 1)).hex();
            colors.push(color);
        }

        const canvas = document.createElement("canvas");
        canvas.width = n;
        canvas.height = 1;
        const context = canvas.getContext("2d");
        canvas.style.margin = "0 -14px";
        canvas.style.width = "calc(100% + 28px)";
        canvas.style.height = "33px";
        canvas.style.cursor = "pointer";
        for (let i = 0; i < n; ++i) {
            context!.fillStyle = colors[i];
            context!.fillRect(i, 0, 1, 1);
        }    
        return canvas;
    };
}
export default new PaletteViewService();
