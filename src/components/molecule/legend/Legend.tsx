import { Method } from "src/types/molecule.types";
import { shortenNumber } from "../../../util";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

type Props = {
    smilesAttributes: { [key: string]: string | number };
    methodAttributes: { [key: string]: string | number };
    method: Method;
    colorsDomain: number[] | undefined;
    maxWidth: number;
};

type Attribute = { [key: string]: string | number };

const createDataTable = (props: Props) => {
    const { smilesAttributes, method, colorsDomain, methodAttributes } = props;

    const columns: Attribute[] = [];

    var row: Attribute = {};
    
    columns.push({ name: "Atom scores", key: "method" });
    row["method"] = method.name;

    Object.keys(methodAttributes!).forEach((name: string) => {
        if (typeof methodAttributes![name] === "number") {
            row[name] = shortenNumber(Number(methodAttributes[name]));
        } else {
            row[name] = methodAttributes[name];
        }
        columns.push({ name, key: name });
    });

    Object.keys(smilesAttributes!).forEach((name: string) => {
        if (typeof smilesAttributes![name] === "number") {
            row[name] = shortenNumber(Number(smilesAttributes[name]));
        } else {
            row[name] = smilesAttributes[name];
        }
        columns.push({ name, key: name });
    });

    columns.push({ name: "Color domain", key: "colorDomain" });
    row["colorDomain"] = `[${colorsDomain!.map((d: number) => shortenNumber(d)).join(", ")}]`;
    return { columns, row };
};

export default function Legend(props: Props) {
    const dataTable = createDataTable(props);
    const maxWidth = props.maxWidth;
    return (
        <div className="xsmiles-table row justify-content-md-center" style={{ opacity: 0.6 }} >           
            <TableContainer
                className="xsmiles-table-container justify-content-md-center"
                sx={{
                    margin: "auto",
                }}
                xsmiles-method-name={props.method.name}
            >
                <Table
                    sx={{
                        // maxWidth: (25 + 6) * dataTable.columns.length + 150,
                        width: (25 + 6) * dataTable.columns.length + 350,
                        minWidth: (25 + 6) * dataTable.columns.length + 350,
                        margin: "auto",
                    }}
                    size="small"
                    aria-label="a dense table"
                >
                    <TableHead>
                        <TableRow>
                            {dataTable.columns.map((column) => {
                                if (column.key === "method" || column.key === "colorDomain") {
                                    return (
                                        <TableCell
                                            align="center"
                                            padding="none"
                                            key={column.key}
                                            style={{
                                                whiteSpace: "normal",
                                                wordWrap: "break-word",
                                                minWidth: "110px",
                                                paddingLeft: "3px",
                                                paddingRight: "3px",
                                                fontSize: "10px",
                                            }}
                                        >
                                            {column.name}
                                        </TableCell>
                                    );
                                } else {
                                    return (
                                        <TableCell
                                            align="center"
                                            padding="none"
                                            key={column.key}
                                            style={{
                                                whiteSpace: "normal",
                                                wordWrap: "break-word",
                                                width: "25px",
                                                maxWidth: "25px",
                                                paddingLeft: "3px",
                                                paddingRight: "3px",
                                                fontSize: "10px",
                                            }}
                                        >
                                            {column.name}
                                        </TableCell>
                                    );
                                }
                            })}

                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                            {dataTable.columns.map((column) => (
                                <TableCell
                                    key={column.key}
                                    style={{
                                        wordWrap: "break-word",
                                        fontSize: "12px",
                                    }}
                                    align="center"
                                >
                                    {dataTable.row[column.key]}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}
