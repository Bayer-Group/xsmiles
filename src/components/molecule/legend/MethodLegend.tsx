import { Method } from "src/types/molecule.types";
import { shortenNumber } from "../../../util";

type Props = {
    method: Method;
    colorsDomain: number[] | undefined;
};

export default function MethodLegend(props: Props) {
    const { method, colorsDomain } = props;
    return (
        <div className="row justify-content-md-center" style={{ fontSize: 12, opacity: 0.6 }}>
            {method.name}, color-domain: [{colorsDomain!.map((d: number) => shortenNumber(d)).join(", ")}]
        </div>
    );
}
