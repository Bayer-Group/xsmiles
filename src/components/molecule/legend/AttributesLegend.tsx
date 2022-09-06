import { shortenNumber } from "../../../util";

type Props = {
    smilesAttributes: { [key: string]: string | number };
};

export default function AttributesLegend(props: Props) {
    const { smilesAttributes } = props;
    return (
        <div className="row justify-content-md-center" style={{ fontSize: 12, opacity: 0.6 }}>
            {Object.keys(smilesAttributes!)
                .map((name) => {
                    if (typeof smilesAttributes![name] === "number") {
                        return `${name}: ${shortenNumber(Number(smilesAttributes![name]))}`;
                    }
                    return `${name}: ${smilesAttributes![name]}`;
                })
                .join(" |  ")}
        </div>
    );
}
