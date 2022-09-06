// This code should go in the KNIME Javascript View

var def = define;
var req = require;
define = null;
require = function() {
return $;
}
// Import XSMILES (inject the code that was pasted into a table and read as a variable in tha KNIME pipeline)
$${Sxsmiles.js}$$


// Read JSON string (the string is converted into plain text, so it will look like: 
// const molecules = [{...},{...},{...}];
//, where {...} represents a molecule object from the JSON
// The string is injected as well by means of a KNIME variable.
const molecules = $${Smolecules}$$;

// Reset
define = def;
require = req;
/// END -- loaded XSMILES and Molecules


// create XSMILES "container"
const divContainer = document.createElement("div");

// Here are some data structure to remember how objects look like
// # Molecule type
//Molecule = {
//    string: string;
//    sequence?: string[] | undefined;
//    method: MolMethod;
//    attributes: {
//        [id: string]: string | number;
//    };
//}

// # Setup type
//{
//    molecule: SingleMolecule;
//    gradientConfig: ModuleGradientConfig;
//    drawerType: DrawerType;
//    width?: number | undefined;
//    height?: number | undefined;
//    bondLength?: number | undefined;
//    hideBarChart?: boolean | undefined;
//    hideAttributesTable?: boolean | undefined;
//    showScoresOnStructure?: boolean | undefined;
//}

// # GradientConfig Type
//GradientConfig = {
//    thresholds?: number[] | undefined;
//    highlight?: boolean | undefined;
//    blur?: number | undefined;
//    palette?: Palette | undefined;
//    colorDomain?: number[] | undefined;
//    opacity?: GradientOpacity | undefined;
//    radius?: GradientRadius | undefined;
//    delta?: number | undefined;
//}

const updateVis = (
  div,
  molecules
) => {


// =============== VIS SETUP ====================
  const gradientConfig = {thresholds:[], highlight:false, palette: 'PiYG_5'}; // {} = use defaults
  const hideBarChart = false;
  const hideAttributesTable = false;
  const drawerType = 'RDKitDrawer'; // 'RDKitDrawer_black' will display the structure in black
  const showScoresOnStructure = true; // show scores onto molecule structure too?


  molecules.forEach((moleculeWithMultipleMethods, i) => {
    const { string, methods, sequence, attributes } = moleculeWithMultipleMethods;

    let row = div;
    // Create 1 row per molecule (1 column per XAI method)
    if (moleculeWithMultipleMethods.methods.length > 1) {
      row = document.createElement('div');
      const row_separator = document.createElement('hr');
      div.append(row);
      div.append(row_separator);
      row.classList.add('row');
      div.classList.add('row-container');
      row_separator.classList.add('row-separator');
    }

    methods.forEach((method, mi) => {
      const molecule = { string, sequence, attributes, method };
	  // document.body.append(window.xsmiles.version);
	  
	  
      const setup = {
        molecule,
        gradientConfig,
        // width?: number | undefined;
        // height?: number | undefined;
        // colorsDomain?: number[] | undefined;
        hideBarChart,
        hideAttributesTable,
        drawerType,
        showScoresOnStructure,
      };

   	 // Create a new column in the current row (for each method)
      const col = document.createElement('div');
      row.append(col); // row = div is molecule.methods.length === 1, if > we want to separate them... so row = div.new_div

        // append visualization
        window.xsmiles.appendSingleView(col, setup);
    });
  });
};

document.body.append(divContainer);


// import RDKit and when done, call XSMILES vis
if (window.RDKit == null) {
        const script = document.createElement('script');
        script.onload = function () {
          if (window.initRDKitModule) {
            console.log('Loading RDKit...');
            window.initRDKitModule().then((RDKit) => {
            	
            window.RDKit = RDKit;

            console.log('RDKit in window', window.RDKit);
            document.body.append("RDKIT: ");
		    document.body.append(window.RDKit.version());			
		    
		    if(Object.keys(window).indexOf("xsmiles")!= -1){
                updateVis(divContainer, molecules);
		    }
			
            });
          }
        };

        script.src =
          'https://unpkg.com/@rdkit/rdkit@2021.9.3/Code/MinimalLib/dist/RDKit_minimal.js'; // <-- shorter url
        script.async = false;
        document.head.appendChild(script);
}





// ==== OPTIONAL =====
// Some extra hacks to change the style of XSMILES within the KNIME Javascript Viewer

var changedCSS = false;
function tryToChangeCSS() {
    const elements = $("section>div.grid-container");
    if(elements.length){
      elements.each(function(){	 
        const element = $(this);
        if (element && !changedCSS) {
          element.attr("style", "max-width: 100% !important");        
        }        
        console.log("Element?", element);
      });  
      changedCSS = true; 
      clearInterval(cssInterval);
    }       
}


var changedTables = false;
function tryToChangeTables(){
  if(!changedTables){
    const elements = $(".xsmiles-table-container");
    if(elements.length){ 
      elements.each(function(){	 
      const element = $( this );
        const methodName = element.attr("xsmiles-method-name");   
   
        element.empty();
        element.append("<font size='14' color='black' opacity='1' font-weight='bold'>"+methodName+"</font>");
      });
      changedTables=true;
      clearInterval(tablesInterval);
    }
  }
}


var cssInterval = setInterval(tryToChangeCSS, 200);
var tablesInterval = setInterval(tryToChangeTables, 200);


export default new TableService();

var changedCSS = false;
function tryToChangeCSS() {
    const elements = $("section>div.grid-container").get();
    console.log("Elements?", elements);
    if(elements){
      if(elements.length){
        elements.each(function(){	 
          const element = $(this);
          console.log("Element1", element);
          if (element && !changedCSS) {
            element.attr("style", "max-width: 100% !important");        
          }                
        });  
        changedCSS = true; 
        clearInterval(cssInterval);
      } else {
        try {
          console.log("Trying elements.get()");
          const nodes = elements.get();
          console.log("node.get() worked");
          if(nodes.length){
            console.log("Elements.get().length", nodes.length);
            $(nodes[0]).attr("style", "max-width: 100% !important");
            return;
          }
        } catch (error) {
          console.log("error3", elements)       
        }      
        console.log("Elements2", elements);

          try {
            console.log("Trying elements.next()");
            const node = elements.next();
            console.log("node.next() worked")
            if(node){
              try {
                console.log("$(node) from next()");
                $(node).attr("style", "max-width: 100% !important"); 
                console.log("$(node) from next(0 worked");
              } catch (error) {
                console.log("node.setAttribute from next()");
                node.setAttribute("style", "max-width: 100% !important"); 
                console.log("node.setAttribute worked");
              }   
            }
          } catch (error) {
            console.log("elements.next() doesn't work")
          }
          try {
            console.log("try elements.attr directly");
            elements.attr("style", "max-width: 100% !important"); 
          } catch (error) {
            console.log("elements.attr doesn't work... tries elements.setAttribute")
            elements.setAttribute("style", "max-width: 100% !important"); 
            console.log("Elements.setAttribute works... ", elements);
          }              
        // }   
      }       
    }    
}

var cssInterval = setInterval(tryToChangeCSS, 200);


var changedTables = false;
function tryToChangeTables(){
  if(!changedTables){
    const elements = $(".xsmiles-table-container");
    if(elements.length){ 
      elements.each(function(){	 
      const element = $( this );
        const methodName = element.attr("xsmiles-method-name");   
  
        element.empty();
        element.append("<font size='14' color='black' opacity='1' font-weight='bold'>"+methodName.replace("perturb","")+"</font>");
      });
      changedTables=true;
      clearInterval(tablesInterval);
    }
  }
}


var tablesInterval = setInterval(tryToChangeTables, 200);

