# Distribution

**Requirement**: RDKit MinimalLib needs to be loaded as in `window.RDKit = RDKit;` before any XSMILES functionality is used.
For the Demo Website of this project, you can see how we loaded it on files `src/index.tsx` and `public/index.html`.
Depending on the project, you may need to load it in different ways.
Another example is shown in `dist/knime/GenericJavascriptView.js`, where we load RDKit directly from an URL.
Please refer to https://github.com/rdkit/rdkit-js to learn how to load RDKit.
*In future versions we want to include the dependency in the npm package, so you won't need to worry about it.*

## Module

This folder  contains the npm module. This is used in the Jupyter Lab plugin. There you find examples of usage in Notebooks.

## Web

This folder contains the React website with a demonstration of how XSMILES can be used for exploratory visualization of multiple molecules and XAI methods or models.

## Plain

This is a Javascript version that can be loaded in any website just by importing the file, e.g., into the `index.html` or using `document.createElement('script')` and `script.onload(...)`. This approach is used to import XSMILES into the JavascriptView from KNIME.

## Knime

Once you have Plain into a table in Knime and exporting it as  a variable to connect to the JavascriptView (Knime), you can use this code in the JavascriptView. You will also need to add to the JavascriptView the CSS from here: [widget.css](https://github.com/Bayer-Group/xsmiles-jupyterlab/blob/main/css/widget.css)