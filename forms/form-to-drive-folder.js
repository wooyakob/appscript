// Customer:
// If can start with google forms that’d be great
// Everything is attached to a Property Address
// Once status of a house goes “Under Contract” I will use x as an example

// Creates folder in "Google Drive”
// Is there a way to auto make folders inside the “property address” such as the 1 Frontside, 2 Middle, 3 Backside?
// Put copies of google sheet templates on Frontside “Property Analysis“ ,  “Rehab budget”


// Developer:
// When Google Form submitted, with status "Under Contract"
// Creates Folder using Google Form name (property address: 1120 Ashland Mesquite)
// Creates subfolders: 1 Frontside, 2 Middle, 3 Backside
// Copies two template Google Sheets (Property Analysis and Rehab Budget) into the 1 Frontside folder

// Appscript in google sheet where form responses go

const SUBFOLDERS = ["1 Frontside", "2 Middle", "3 Backside"];

function onFormSubmit(e) {
  const status = e.namedValues["What is the current status of the property?"]?.[0];
  const address = e.namedValues["Property Address"]?.[0]; 

  if (status !== "Under Contract" || !address) return;

  const rootFolder = DriveApp.createFolder(address);

  SUBFOLDERS.forEach(name => {
    rootFolder.createFolder(name);
  });
}