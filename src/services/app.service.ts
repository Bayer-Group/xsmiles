import { MoleculesDataset } from "../types/molecule.types";
import moleculesDatasetService from "./molecules.dataset.service";

class AppService {
    public loadData = (files: any[], handleLoadedData: (molecules: MoleculesDataset) => void) => {
        files.forEach((file, i) => {
            const reader = new FileReader();

            reader.onabort = () => console.error("file reading was aborted");
            reader.onerror = () => console.error("file reading has failed");
            reader.onload = () => {
                // Do whatever you want with the file contents
                if (reader.result != null) {
                    const json: any = JSON.parse(reader.result as string);

                    let molecules: MoleculesDataset = moleculesDatasetService.getVersionControlledData(json);

                    handleLoadedData(molecules);
                }
            };
            reader.readAsBinaryString(file);
        });
    };
}
export default new AppService();
