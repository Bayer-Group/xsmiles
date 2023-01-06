# Molecular structures and SMILES visualization

XSMILES is a JavaScript tool to visualize atom and non-atom attributions and SMILES strings through interactive coordinated visualizations.

It is also distributed as a plugin to be used within Jupyter Lab notebooks, as a website where users can input molecules using a JSON format, and as a KNIME plugin.

XSMILES uses the [RDKit MinimalLib](https://github.com/rdkit/rdkit) to draw the molecule structures.

To create the JSON file that can be used with the `demonstration website`, please check the "Jupyter Lab" and "Use Cases" related notebooks cited in section `Availability and examples` of this repository.

XSMILES was tested with RDKit Canonical SMILES.

## Please Cite

If you use XSMILES, the use cases, its code, or the generated explanations, please cite our article:

https://jcheminf.biomedcentral.com/articles/10.1186/s13321-022-00673-w

```
Heberle, H., Zhao, L., Schmidt, S. et al. XSMILES: interactive visualization for molecules, SMILES and XAI attribution scores. J Cheminform 15, 2 (2023). https://doi.org/10.1186/s13321-022-00673-w
```

```BibTeX
@article{Heberle2023XSMILES,
author={Heberle, Henry and Zhao, Linlin and Schmidt, Sebastian and Wolf, Thomas and Heinrich, Julian},
title={XSMILES: interactive visualization for molecules, SMILES and XAI attribution scores},
journal={Journal of Cheminformatics},
year={2023},
month={Jan},
day={06},
volume={15},
number={1},
pages={2},
abstract={Explainable artificial intelligence (XAI) methods have shown increasing applicability in chemistry. In this context, visualization techniques can highlight regions of a molecule to reveal their influence over a predicted property. For this purpose, some XAI techniques calculate attribution scores associated with tokens of SMILES strings or with atoms of a molecule. While an association of a score with an atom can be directly visually represented on a molecule diagram, scores computed for SMILES non-atom tokens cannot. For instance, a substring [N+] contains 3 non-atom tokens, i.e., [, {\$}{\$}+{\$}{\$}, and ], and their attributions, depending on the model, are not necessarily revealing an influence of the nitrogen atom over the predicted property; for that reason, it is not possible to represent the scores on a molecule diagram. Moreover, SMILES's notation is complex, foregrounding the need for techniques to facilitate the analysis of explanations associated with their tokens.},
issn={1758-2946},
doi={10.1186/s13321-022-00673-w},
url={https://doi.org/10.1186/s13321-022-00673-w}
}


```

## Availability and examples

- [Demonstration website](https://bayer-group.github.io/xsmiles/dist/web/)

- [How to use XSMILES (JupyterLab notebook)](https://github.com/Bayer-Group/xsmiles-jupyterlab/tree/main/examples)

- [Use cases: from model training to explanations (JupyterLab notebook)](https://github.com/Bayer-Group/xsmiles-use-cases)

- [JupyterLab plugin](https://github.com/Bayer-Group/xsmiles-jupyterlab/)

- [TBD: KNIME pipeline example](http://)


<!-- ![XSMILES](img/vis-example.png?raw=true | width=300) -->
<img src="img/vis-example.png?raw=true" width="500" />
<img src="img/interactivity.png?raw=true" width="500" />
<!-- ![XSMILES](img/interactivity.png?raw=true | width=300) -->

## Distributions formats
 
XSMILES (Javascript) is distributed in 3 main formats and they are available in the `dist` folder.
Please go to the Readme from that folder for Details.

## Simplest usage of XSMILES

If you just want to use XSMILES, for example, as a Machine Learning expert, you may be interested in the [JupyterLab plugin](https://github.com/Bayer-Group/xsmiles-jupyterlab/) or [Demo website](https://bayer-group.github.io/xsmiles/dist/web/).

## Using XSMILES as npm package 

If you are a web-developer, the npm package may be your option.

**Requirement**: RDKit MinimalLib needs to be loaded as in `window.RDKit = RDKit;` before any XSMILES functionality is used.
For the Demo Website of this project, you can see how we loaded it on files `src/index.tsx` and `public/index.html`.
Depending on the project, you may need to load it in different ways.
Another example is shown in `dist/knime/GenericJavascriptView.js`, where we load RDKit directly from an URL.
Please refer to https://github.com/rdkit/rdkit-js to learn how to load RDKit.
*In future versions we want to include the dependency in the npm package, so you won't need to worry about it.*

Run `npm install xsmiles` (unofficial) to install the module package and use XSMILES in another web-based system.

If `xsmiles` is not in the `npm repository`, please download the one of the released versions from this repository and run the code below, changing the version accordingly:

`npm install xsmiles-0.5.7.tgz`


## Using XSMILES as Plain javascript

**Required**: RDKit MinimalLib, as explained in the section above.

You can use XSMILES from our `index.js` available at `dist/plain`.

Once your webpage loads it, it will be available through the `window` global variable:

```javascript
window.xsmiles.appendSingleView(div, setup);
```

Please check `dist/knime` for an example of how it can be used within a Javascript code.
In that example, we have XSMILES working in a KNIME's Javascript View.
The `xsmiles.js` is injected in the View through a "table" that is converted to a "variable".
For more details, please refer to the KNIME example referred at the top of this page.

## Running the Demonstration website locally

```bash
npm install
npm start
```

## Development

It builds a module that export functions (defined in `src/modules`) and a web-system (defined in `src/webpage`) that provides a GUI to input a .json file and display smiles strings - their XAI scores in the form of coordinated bar charts and molecular structure.

The **module functions** are exported into `dist/modules` and the **website** to be served is exported into `dist/web`.

Components were created to be exported and used in the [
xsmiles-jupyterlab](https://github.com/Bayer-Group/xsmiles-jupyterlab) project, so that it can be used in Jupyter Lab notebooks.

Run `npm install` to install all dependencies.

### Starting the website in development mode

`npm start`

### Building modules (npm, plain javascript) and website

`npm run build`

### Packing the XSMILES to use with `npm install`

`npm run build`

`npm pack`
