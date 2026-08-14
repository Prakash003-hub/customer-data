const CUSTOMER_DETAILS_SHEET_NAME = "Customer_Details";
const CUSTOMER_DOCUMENTS_SHEET_NAME = "Customer_Documents";
const APPLICATION_UPDATES_SHEET_NAME = "Application_Updates";
const MAIN_FOLDER_NAME = "Customer Documents";

// Helper to get Documents sheet (supports Customer_Documents, Documents, Customer Documents)
function getDocumentsSheet(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(CUSTOMER_DOCUMENTS_SHEET_NAME) || 
         ss.getSheetByName("Documents") || 
         ss.getSheetByName("Customer Documents");
}

// Helper to get Application Updates sheet
function getUpdatesSheet(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(APPLICATION_UPDATES_SHEET_NAME) ||
         ss.getSheetByName("Updates") ||
         ss.getSheetByName("Application Updates") ||
         ss.getSheetByName("Customer_Updates") ||
         ss.getSheetByName("Customer Updates");
}

// Setup function to initialize Sheets and Drive folder
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Setup Customer_Details sheet
  let detailsSheet = ss.getSheetByName(CUSTOMER_DETAILS_SHEET_NAME);
  if (!detailsSheet) {
    detailsSheet = ss.insertSheet(CUSTOMER_DETAILS_SHEET_NAME);
    detailsSheet.appendRow(["CustomerID", "Name", "AadhaarNo", "PhoneNo", "Village", "DateOfBirth", "Religion", "Caste", "Documents", "CreatedAt", "UpdatedAt"]);
    detailsSheet.setFrozenRows(1);
  }

  // Setup Customer_Documents sheet
  let docsSheet = getDocumentsSheet(ss);
  if (!docsSheet) {
    docsSheet = ss.insertSheet(CUSTOMER_DOCUMENTS_SHEET_NAME);
    docsSheet.appendRow(["DocumentID", "CustomerID", "DocumentType", "FileName", "DriveFileID", "DriveURL"]);
    docsSheet.setFrozenRows(1);
  }

  // Setup Application_Updates sheet
  let updatesSheet = getUpdatesSheet(ss);
  if (!updatesSheet) {
    updatesSheet = ss.insertSheet(APPLICATION_UPDATES_SHEET_NAME);
    updatesSheet.appendRow(["UpdateID", "CustomerID", "AadhaarNo", "Name", "PhoneNo", "Village", "Description", "Status", "CreatedAt", "UpdatedAt"]);
    updatesSheet.setFrozenRows(1);
  }

  // Setup Websites sheet
  let websitesSheet = getWebsitesSheet(ss);
  if (!websitesSheet) {
    websitesSheet = ss.insertSheet(WEBSITES_SHEET_NAME);
    websitesSheet.appendRow(["ID", "Name", "Category", "Description", "DocumentRequirements", "URLs", "PayFee", "Charges", "Notes", "CreatedAt", "UpdatedAt"]);
    websitesSheet.setFrozenRows(1);
  }

  // Setup Categories sheet
  let categoriesSheet = getCategoriesSheet(ss);
  if (!categoriesSheet) {
    categoriesSheet = ss.insertSheet(CATEGORIES_SHEET_NAME);
    categoriesSheet.appendRow(["CategoryName", "CreatedAt"]);
    categoriesSheet.setFrozenRows(1);
  }

  // Create main folder in Drive if it doesn't exist
  const folders = DriveApp.getFoldersByName(MAIN_FOLDER_NAME);
  if (!folders.hasNext()) {
    DriveApp.createFolder(MAIN_FOLDER_NAME);
  }
  
  return "Setup completed successfully!";
}


// Enable CORS
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function doPost(e) {
  return handleRequest(e, "POST");
}

function doGet(e) {
  return handleRequest(e, "GET");
}

function handleRequest(e, method) {
  try {
    let action = e.parameter.action;
    let postData = null;
    
    if (method === "POST" && e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
      if (postData.action) {
        action = postData.action;
      }
    }

    let response = {};

    switch (action) {
      case "getCustomers":
        response = getCustomers();
        break;
      case "getCustomer":
        response = getCustomer(e.parameter.customerId || (postData && postData.customerId));
        break;
      case "addCustomer":
        response = addCustomer(postData);
        break;
      case "uploadDocuments":
        response = uploadDocuments(postData);
        break;
      case "getCustomerDocuments":
        response = getCustomerDocuments(e.parameter.customerId || (postData && postData.customerId));
        break;
      case "updateCustomer":
        response = updateCustomer(postData);
        break;
      case "deleteCustomer":
        response = deleteCustomer(postData);
        break;
      case "deleteDocument":
        response = deleteDocument(postData);
        break;
      case "getUpdates":
        response = getUpdates();
        break;
      case "addUpdate":
        response = addUpdate(postData);
        break;
      case "updateUpdateStatus":
        response = updateUpdateStatus(postData);
        break;
      case "deleteUpdate":
        response = deleteUpdate(postData || e.parameter);
        break;
      case "getWebsites":
        response = getWebsites();
        break;
      case "addWebsite":
        response = addWebsite(postData);
        break;
      case "updateWebsite":
        response = updateWebsite(postData);
        break;
      case "deleteWebsite":
        response = deleteWebsite(postData || e.parameter);
        break;
      case "getCategories":
        response = getCategories();
        break;
      case "addCategory":
        response = addCategory(postData);
        break;
      case "deleteCategory":
        response = deleteCategory(postData || e.parameter);
        break;
      default:
        response = { success: false, error: "Invalid action: " + action };
    }

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getCustomers() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CUSTOMER_DETAILS_SHEET_NAME);
  if (!sheet) return { success: true, data: [] };
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, data: [] };

  const headers = data[0];
  const rows = data.slice(1);
  
  const customers = rows.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
  
  return { success: true, data: customers };
}

function getCustomer(customerId) {
  if (!customerId) return { success: false, error: "No customerId provided." };

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CUSTOMER_DETAILS_SHEET_NAME);
  if (!sheet) return { success: false, error: "Sheet not found." };

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: false, error: "No customers found." };

  const headers = data[0];
  const rows = data.slice(1);
  const idIndex = headers.indexOf("CustomerID");
  
  const customerRow = rows.find(row => String(row[idIndex]) === String(customerId));
  
  if (!customerRow) {
    return { success: false, error: "Customer not found." };
  }
  
  let customer = {};
  headers.forEach((header, index) => {
    customer[header] = customerRow[index];
  });
  
  return { success: true, data: customer };
}

function addCustomer(data) {
  if (!data) return { success: false, error: "No data provided." };

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CUSTOMER_DETAILS_SHEET_NAME);
  const sheetData = sheet.getDataRange().getValues();
  
  const aadhaar = String(data.AadhaarNo || '').trim();
  
  if (!aadhaar || !/^\d{12}$/.test(aadhaar)) {
    return { success: false, error: "Invalid Aadhaar Number. Must be exactly 12 digits." };
  }
  
  if (sheetData.length > 1) {
    const headers = sheetData[0];
    const aadhaarIndex = headers.indexOf("AadhaarNo");
    for (let i = 1; i < sheetData.length; i++) {
      if (String(sheetData[i][aadhaarIndex]).trim() === aadhaar) {
        return { success: false, error: "Customer with this Aadhaar Number already exists." };
      }
    }
  }
  
  let nextIdNum = 1;
  if (sheetData.length > 1) {
    const headers = sheetData[0];
    const idIndex = headers.indexOf("CustomerID");
    const lastRow = sheetData[sheetData.length - 1];
    const lastId = String(lastRow[idIndex]);
    const match = lastId.match(/\d+/);
    if (match) {
      nextIdNum = parseInt(match[0], 10) + 1;
    }
  }
  const customerId = "CUST" + nextIdNum.toString().padStart(5, '0');
  
  const timestamp = new Date().toISOString();
  const emptyDocs = JSON.stringify([]);
  
  const headers = sheetData[0];
  let newRow = new Array(headers.length).fill("");
  
  headers.forEach((header, i) => {
    if (header === "CustomerID") newRow[i] = customerId;
    if (header === "Name") newRow[i] = data.Name || "";
    if (header === "AadhaarNo") newRow[i] = aadhaar;
    if (header === "PhoneNo") newRow[i] = data.PhoneNo || "";
    if (header === "Village") newRow[i] = data.Village || "";
    if (header === "DateOfBirth") newRow[i] = data.DateOfBirth || "";
    if (header === "Religion") newRow[i] = data.Religion || "";
    if (header === "Caste") newRow[i] = data.Caste || "";
    if (header === "Documents") newRow[i] = emptyDocs;
    if (header === "CreatedAt") newRow[i] = timestamp;
    if (header === "UpdatedAt") newRow[i] = timestamp;
  });
  
  sheet.appendRow(newRow);
  
  return { success: true, customerId: customerId };
}

function uploadDocuments(data) {
  if (!data) return { success: false, error: "No data provided." };

  const customerId = String(data.customerId);
  const documents = data.documents;
  const customerName = data.customerName || "Unknown";
  
  if (!customerId || !documents || documents.length === 0) {
    return { success: false, error: "Missing required data for document upload." };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  let mainFolders = DriveApp.getFoldersByName(MAIN_FOLDER_NAME);
  let mainFolder = mainFolders.hasNext() ? mainFolders.next() : DriveApp.createFolder(MAIN_FOLDER_NAME);
  
  const customerFolderName = `${customerId} - ${customerName}`;
  let customerFolders = mainFolder.getFoldersByName(customerFolderName);
  let customerFolder = customerFolders.hasNext() ? customerFolders.next() : mainFolder.createFolder(customerFolderName);

  try {
    customerFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch(e) {}
  
  const timestamp = new Date().toISOString();
  let uploadedDocs = [];

  const docsSheet = getDocumentsSheet(ss);
  let docIdCounter = 1;
  if (docsSheet) {
    const docsData = docsSheet.getDataRange().getValues();
    if (docsData.length > 1) {
      const docIdIdx = docsData[0].indexOf("DocumentID");
      if (docIdIdx !== -1) {
        const lastRow = docsData[docsData.length - 1];
        const match = String(lastRow[docIdIdx]).match(/\d+/);
        if (match) docIdCounter = parseInt(match[0], 10) + 1;
      }
    }
  }

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    
    const bytes = Utilities.base64Decode(doc.base64);
    const blob = Utilities.newBlob(bytes, doc.mimeType, doc.name);
    
    const driveFile = customerFolder.createFile(blob);
    try {
      driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch(e) {}
    
    const fileId = driveFile.getId();
    const docId = "DOC" + (docIdCounter + i).toString().padStart(5, '0');
    const driveUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
    
    const newDoc = {
      DocumentID: docId,
      CustomerID: customerId,
      DocumentType: doc.type || "Document",
      FileName: doc.name,
      DriveFileID: fileId,
      DriveURL: driveUrl,
      PreviewURL: `https://drive.google.com/file/d/${fileId}/preview`,
      DirectURL: `https://drive.google.com/uc?export=view&id=${fileId}`,
      MimeType: doc.mimeType,
      UploadedAt: timestamp
    };
    
    uploadedDocs.push(newDoc);

    if (docsSheet) {
      const headers = docsSheet.getDataRange().getValues()[0];
      let newRow = new Array(headers.length).fill("");
      headers.forEach((header, colIdx) => {
        if (header === "DocumentID") newRow[colIdx] = docId;
        if (header === "CustomerID") newRow[colIdx] = customerId;
        if (header === "DocumentType") newRow[colIdx] = doc.type || "Document";
        if (header === "FileName") newRow[colIdx] = doc.name;
        if (header === "DriveFileID") newRow[colIdx] = fileId;
        if (header === "DriveURL") newRow[colIdx] = driveUrl;
      });
      docsSheet.appendRow(newRow);
    }
  }

  const detailsSheet = ss.getSheetByName(CUSTOMER_DETAILS_SHEET_NAME);
  if (detailsSheet) {
    const detailsData = detailsSheet.getDataRange().getValues();
    if (detailsData.length > 1) {
      const headers = detailsData[0];
      const idIdx = headers.indexOf("CustomerID");
      const docsIdx = headers.indexOf("Documents");
      if (idIdx !== -1 && docsIdx !== -1) {
        for (let i = 1; i < detailsData.length; i++) {
          if (String(detailsData[i][idIdx]) === customerId) {
            let currentDocs = [];
            try { currentDocs = JSON.parse(detailsData[i][docsIdx] || "[]"); } catch(e) {}
            currentDocs = currentDocs.concat(uploadedDocs);
            detailsSheet.getRange(i + 1, docsIdx + 1).setValue(JSON.stringify(currentDocs));
            break;
          }
        }
      }
    }
  }

  return { success: true, documents: uploadedDocs };
}

function getCustomerDocuments(customerId) {
  if (!customerId) return { success: false, error: "No customerId provided." };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const docsSheet = getDocumentsSheet(ss);
  
  let documents = [];

  if (docsSheet) {
    const data = docsSheet.getDataRange().getValues();
    if (data.length > 1) {
      const headers = data[0];
      const custIdIdx = headers.indexOf("CustomerID");
      const docIdIdx = headers.indexOf("DocumentID");
      const docTypeIdx = headers.indexOf("DocumentType");
      const fileNameIdx = headers.indexOf("FileName");
      const driveFileIdIdx = headers.indexOf("DriveFileID");
      const driveUrlIdx = headers.indexOf("DriveURL");

      if (custIdIdx !== -1) {
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (String(row[custIdIdx]).trim().toLowerCase() === String(customerId).trim().toLowerCase()) {
            const fileId = driveFileIdIdx !== -1 ? String(row[driveFileIdIdx]) : "";
            const driveUrl = driveUrlIdx !== -1 ? String(row[driveUrlIdx]) : "";
            documents.push({
              DocumentID: docIdIdx !== -1 ? String(row[docIdIdx]) : ("DOC" + i),
              CustomerID: String(row[custIdIdx]),
              DocumentType: docTypeIdx !== -1 ? String(row[docTypeIdx]) : "Document",
              FileName: fileNameIdx !== -1 ? String(row[fileNameIdx]) : "Document",
              DriveFileID: fileId,
              DriveURL: driveUrl || (fileId ? `https://drive.google.com/file/d/${fileId}/view?usp=sharing` : ""),
              PreviewURL: fileId ? `https://drive.google.com/file/d/${fileId}/preview` : driveUrl,
              DirectURL: fileId ? `https://drive.google.com/uc?export=view&id=${fileId}` : driveUrl,
              MimeType: ""
            });
          }
        }
      }
    }
  }

  const detailsSheet = ss.getSheetByName(CUSTOMER_DETAILS_SHEET_NAME);
  if (detailsSheet) {
    const data = detailsSheet.getDataRange().getValues();
    if (data.length > 1) {
      const headers = data[0];
      const idIndex = headers.indexOf("CustomerID");
      const docsIndex = headers.indexOf("Documents");

      if (idIndex !== -1 && docsIndex !== -1) {
        for (let i = 1; i < data.length; i++) {
          if (String(data[i][idIndex]).trim().toLowerCase() === String(customerId).trim().toLowerCase()) {
            const docsStr = data[i][docsIndex] || "[]";
            try {
              const docsArray = JSON.parse(docsStr);
              docsArray.forEach(d => {
                const exists = documents.some(existing => 
                  (existing.DocumentID && existing.DocumentID === d.DocumentID) ||
                  (existing.DriveFileID && existing.DriveFileID === d.DriveFileID)
                );
                if (!exists) {
                  documents.push(d);
                }
              });
            } catch (e) {}
            break;
          }
        }
      }
    }
  }

  return { success: true, data: documents };
}

function updateCustomer(data) {
  if (!data || !data.customerId) return { success: false, error: "No customerId provided." };
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CUSTOMER_DETAILS_SHEET_NAME);
  if (!sheet) return { success: false, error: "Sheet not found." };
  
  const sheetData = sheet.getDataRange().getValues();
  if (sheetData.length <= 1) return { success: false, error: "No customers found." };
  
  const headers = sheetData[0];
  const idIndex = headers.indexOf("CustomerID");
  const aadhaarIndex = headers.indexOf("AadhaarNo");
  
  let rowIndex = -1;
  for (let i = 1; i < sheetData.length; i++) {
    if (String(sheetData[i][idIndex]) === String(data.customerId)) {
      rowIndex = i + 1; 
      break;
    }
  }
  
  if (rowIndex === -1) return { success: false, error: "Customer not found." };
  
  if (data.AadhaarNo && String(data.AadhaarNo) !== String(sheetData[rowIndex - 1][aadhaarIndex])) {
    for (let i = 1; i < sheetData.length; i++) {
      if (String(sheetData[i][aadhaarIndex]) === String(data.AadhaarNo)) {
        return { success: false, error: "Customer with this Aadhaar Number already exists." };
      }
    }
  }

  const timestamp = new Date().toISOString();
  
  headers.forEach((header, i) => {
    if (header !== "CustomerID" && header !== "Documents" && header !== "CreatedAt" && header !== "UpdatedAt") {
      if (data[header] !== undefined) {
        sheet.getRange(rowIndex, i + 1).setValue(data[header]);
      }
    }
    if (header === "UpdatedAt") {
      sheet.getRange(rowIndex, i + 1).setValue(timestamp);
    }
  });
  
  return { success: true };
}

function deleteCustomer(data) {
  if (!data || !data.customerId) return { success: false, error: "No customerId provided." };
  const customerId = String(data.customerId);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const detailsSheet = ss.getSheetByName(CUSTOMER_DETAILS_SHEET_NAME);
  if (detailsSheet) {
    const detailsData = detailsSheet.getDataRange().getValues();
    const headers = detailsData[0];
    const idIndex = headers.indexOf("CustomerID");
    
    for (let i = detailsData.length - 1; i >= 1; i--) {
      if (String(detailsData[i][idIndex]) === customerId) {
        detailsSheet.deleteRow(i + 1);
        break;
      }
    }
  }

  const docsSheet = getDocumentsSheet(ss);
  if (docsSheet) {
    const docsData = docsSheet.getDataRange().getValues();
    if (docsData.length > 1) {
      const headers = docsData[0];
      const custIdIdx = headers.indexOf("CustomerID");
      const driveFileIdIdx = headers.indexOf("DriveFileID");
      
      if (custIdIdx !== -1) {
        for (let i = docsData.length - 1; i >= 1; i--) {
          if (String(docsData[i][custIdIdx]) === customerId) {
            if (driveFileIdIdx !== -1 && docsData[i][driveFileIdIdx]) {
              try { DriveApp.getFileById(docsData[i][driveFileIdIdx]).setTrashed(true); } catch(e) {}
            }
            docsSheet.deleteRow(i + 1);
          }
        }
      }
    }
  }
  
  try {
    const folders = DriveApp.searchFolders(`title contains '${customerId} -'`);
    while (folders.hasNext()) {
      folders.next().setTrashed(true);
    }
  } catch(e) {}
  
  return { success: true };
}

function deleteDocument(data) {
  if (!data || !data.documentId) return { success: false, error: "No documentId provided." };
  const documentId = String(data.documentId);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let found = false;

  const docsSheet = getDocumentsSheet(ss);
  if (docsSheet) {
    const docsData = docsSheet.getDataRange().getValues();
    if (docsData.length > 1) {
      const headers = docsData[0];
      const docIdIdx = headers.indexOf("DocumentID");
      const driveFileIdIdx = headers.indexOf("DriveFileID");

      if (docIdIdx !== -1) {
        for (let i = docsData.length - 1; i >= 1; i--) {
          if (String(docsData[i][docIdIdx]) === documentId) {
            if (driveFileIdIdx !== -1 && docsData[i][driveFileIdIdx]) {
              try { DriveApp.getFileById(docsData[i][driveFileIdIdx]).setTrashed(true); } catch(e) {}
            }
            docsSheet.deleteRow(i + 1);
            found = true;
            break;
          }
        }
      }
    }
  }

  const detailsSheet = ss.getSheetByName(CUSTOMER_DETAILS_SHEET_NAME);
  if (detailsSheet) {
    const sheetData = detailsSheet.getDataRange().getValues();
    if (sheetData.length > 1) {
      const headers = sheetData[0];
      const docsIndex = headers.indexOf("Documents");
      if (docsIndex !== -1) {
        for (let i = 1; i < sheetData.length; i++) {
          let docs = [];
          try { docs = JSON.parse(sheetData[i][docsIndex] || "[]"); } catch(e) { continue; }
          const idx = docs.findIndex(d => String(d.DocumentID) === documentId || String(d.documentId) === documentId);
          if (idx !== -1) {
            const doc = docs[idx];
            if (doc.DriveFileID) {
              try { DriveApp.getFileById(doc.DriveFileID).setTrashed(true); } catch(e) {}
            }
            docs.splice(idx, 1);
            detailsSheet.getRange(i + 1, docsIndex + 1).setValue(JSON.stringify(docs));
            found = true;
            break;
          }
        }
      }
    }
  }

  if (!found) {
    return { success: false, error: "Document not found." };
  }
  
  return { success: true };
}

// -------------------------------------------------------------
// APPLICATION UPDATES & TRACKING FUNCTIONS
// -------------------------------------------------------------

function getUpdates() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = getUpdatesSheet(ss);
  if (!sheet) return { success: true, data: [] };
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, data: [] };

  const headers = data[0];
  const rows = data.slice(1);
  
  const updates = rows.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
  
  return { success: true, data: updates };
}

function addUpdate(data) {
  if (!data) return { success: false, error: "No data provided." };
  
  const aadhaar = String(data.AadhaarNo || '').trim();
  if (!aadhaar || !/^\d{12}$/.test(aadhaar)) {
    return { success: false, error: "Invalid Aadhaar Number. Must be exactly 12 digits." };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Ensure Application_Updates sheet
  let updatesSheet = getUpdatesSheet(ss);
  if (!updatesSheet) {
    updatesSheet = ss.insertSheet(APPLICATION_UPDATES_SHEET_NAME);
    updatesSheet.appendRow(["UpdateID", "CustomerID", "AadhaarNo", "Name", "PhoneNo", "Village", "Description", "Status", "CreatedAt", "UpdatedAt"]);
    updatesSheet.setFrozenRows(1);
  }

  let customerId = "";
  let customerName = data.Name || "";
  let phoneNo = data.PhoneNo || "";
  let village = data.Village || "";

  // Check existing customer in Customer_Details sheet
  let detailsSheet = ss.getSheetByName(CUSTOMER_DETAILS_SHEET_NAME);
  if (detailsSheet) {
    const detailsData = detailsSheet.getDataRange().getValues();
    if (detailsData.length > 1) {
      const headers = detailsData[0];
      const aadhaarIdx = headers.indexOf("AadhaarNo");
      const idIdx = headers.indexOf("CustomerID");
      const nameIdx = headers.indexOf("Name");
      const phoneIdx = headers.indexOf("PhoneNo");
      const villageIdx = headers.indexOf("Village");

      if (aadhaarIdx !== -1) {
        for (let i = 1; i < detailsData.length; i++) {
          if (String(detailsData[i][aadhaarIdx]).trim() === aadhaar) {
            customerId = String(detailsData[i][idIdx]);
            if (nameIdx !== -1 && detailsData[i][nameIdx] && !data.Name) customerName = String(detailsData[i][nameIdx]);
            if (phoneIdx !== -1 && detailsData[i][phoneIdx] && !data.PhoneNo) phoneNo = String(detailsData[i][phoneIdx]);
            if (villageIdx !== -1 && detailsData[i][villageIdx] && !data.Village) village = String(detailsData[i][villageIdx]);
            break;
          }
        }
      }
    }
  }

  // If new customer, add to Customer_Details
  if (!customerId) {
    const addCustRes = addCustomer({
      AadhaarNo: aadhaar,
      Name: customerName,
      PhoneNo: phoneNo,
      Village: village
    });
    if (addCustRes.success) {
      customerId = addCustRes.customerId;
    }
  }

  // Generate UpdateID
  const updatesData = updatesSheet.getDataRange().getValues();
  let nextUpdNum = 1;
  if (updatesData.length > 1) {
    const updHeaders = updatesData[0];
    const updIdIdx = updHeaders.indexOf("UpdateID");
    if (updIdIdx !== -1) {
      const lastRow = updatesData[updatesData.length - 1];
      const match = String(lastRow[updIdIdx]).match(/\d+/);
      if (match) {
        nextUpdNum = parseInt(match[0], 10) + 1;
      }
    }
  }
  const updateId = "UPD" + nextUpdNum.toString().padStart(5, '0');
  const timestamp = new Date().toISOString();
  const statusVal = data.Status === "Success" ? "Success" : "Pending";

  const headers = updatesData[0];
  let newRow = new Array(headers.length).fill("");
  headers.forEach((header, i) => {
    if (header === "UpdateID") newRow[i] = updateId;
    if (header === "CustomerID") newRow[i] = customerId;
    if (header === "AadhaarNo") newRow[i] = aadhaar;
    if (header === "Name") newRow[i] = customerName;
    if (header === "PhoneNo") newRow[i] = phoneNo;
    if (header === "Village") newRow[i] = village;
    if (header === "Description") newRow[i] = data.Description || "";
    if (header === "Status") newRow[i] = statusVal;
    if (header === "CreatedAt") newRow[i] = timestamp;
    if (header === "UpdatedAt") newRow[i] = timestamp;
  });

  updatesSheet.appendRow(newRow);

  return { 
    success: true, 
    updateId: updateId,
    customerId: customerId,
    data: {
      UpdateID: updateId,
      CustomerID: customerId,
      AadhaarNo: aadhaar,
      Name: customerName,
      PhoneNo: phoneNo,
      Village: village,
      Description: data.Description || "",
      Status: statusVal,
      CreatedAt: timestamp,
      UpdatedAt: timestamp
    }
  };
}

function updateUpdateStatus(data) {
  if (!data || !data.updateId) return { success: false, error: "No updateId provided." };
  const updateId = String(data.updateId);
  const status = data.Status === "Success" ? "Success" : "Pending";
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = getUpdatesSheet(ss);
  if (!sheet) return { success: false, error: "Updates sheet not found." };

  const sheetData = sheet.getDataRange().getValues();
  if (sheetData.length <= 1) return { success: false, error: "No updates found." };

  const headers = sheetData[0];
  const idIdx = headers.indexOf("UpdateID");
  const statusIdx = headers.indexOf("Status");
  const updatedIdx = headers.indexOf("UpdatedAt");

  if (idIdx === -1 || statusIdx === -1) return { success: false, error: "Invalid sheet structure." };

  let rowIndex = -1;
  for (let i = 1; i < sheetData.length; i++) {
    if (String(sheetData[i][idIdx]) === updateId) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) return { success: false, error: "Update not found." };

  sheet.getRange(rowIndex, statusIdx + 1).setValue(status);
  if (updatedIdx !== -1) {
    sheet.getRange(rowIndex, updatedIdx + 1).setValue(new Date().toISOString());
  }

  return { success: true };
}

function deleteUpdate(data) {
  let updateId = "";
  if (data) {
    updateId = String(data.updateId || data.UpdateID || data.id || "").trim();
  }
  if (!updateId) return { success: false, error: "No updateId provided." };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = getUpdatesSheet(ss);
  if (!sheet) return { success: false, error: "Updates sheet tab not found in spreadsheet." };

  const sheetData = sheet.getDataRange().getValues();
  if (sheetData.length <= 1) return { success: false, error: "No updates in sheet." };

  const headers = sheetData[0];
  let idIdx = headers.indexOf("UpdateID");
  if (idIdx === -1) idIdx = headers.indexOf("ID");
  if (idIdx === -1) idIdx = 0; // Fallback to first column if header not exact

  const cleanTargetId = updateId.toLowerCase();

  for (let i = sheetData.length - 1; i >= 1; i--) {
    const cellVal = String(sheetData[i][idIdx]).trim().toLowerCase();
    if (cellVal === cleanTargetId) {
      sheet.deleteRow(i + 1);
      return { success: true, message: "Update " + updateId + " deleted successfully." };
    }
  }

  // Soft fallback check (numeric match e.g. "1" matches "UPD00001")
  const targetNum = cleanTargetId.replace(/\D/g, '');
  if (targetNum) {
    for (let i = sheetData.length - 1; i >= 1; i--) {
      const cellVal = String(sheetData[i][idIdx]).trim().toLowerCase();
      const cellNum = cellVal.replace(/\D/g, '');
      if (cellNum && cellNum === targetNum) {
        sheet.deleteRow(i + 1);
        return { success: true, message: "Update deleted successfully." };
      }
    }
  }

  return { success: false, error: "UpdateID '" + updateId + "' not found in sheet." };
}

// ==========================================
// WEBSITES & CATEGORIES GOOGLE SHEET CRUD
// ==========================================

const WEBSITES_SHEET_NAME = "Websites";
const CATEGORIES_SHEET_NAME = "Categories";

function getWebsitesSheet(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(WEBSITES_SHEET_NAME) || 
         ss.getSheetByName("Websites") || 
         ss.getSheetByName("Web_Portals") ||
         ss.getSheetByName("Portals");
}

function getCategoriesSheet(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(CATEGORIES_SHEET_NAME) || 
         ss.getSheetByName("Categories") || 
         ss.getSheetByName("Portal_Categories");
}

function getWebsites() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = getWebsitesSheet(ss);
  if (!sheet) {
    sheet = ss.insertSheet(WEBSITES_SHEET_NAME);
    sheet.appendRow(["ID", "Name", "Category", "Description", "DocumentRequirements", "URLs", "PayFee", "Charges", "Notes", "CreatedAt", "UpdatedAt"]);
    sheet.setFrozenRows(1);
    return { success: true, data: [] };
  }

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, data: [] };

  const websites = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0] && !row[1]) continue;

    let docReqs = [];
    try {
      docReqs = typeof row[4] === 'string' && row[4].startsWith('[') ? JSON.parse(row[4]) : String(row[4] || '').split(',').map(s => s.trim()).filter(Boolean);
    } catch(e) {
      docReqs = String(row[4] || '').split(',').map(s => s.trim()).filter(Boolean);
    }

    let urls = [];
    try {
      urls = typeof row[5] === 'string' && row[5].startsWith('[') ? JSON.parse(row[5]) : [];
    } catch(e) {
      urls = [];
    }

    websites.push({
      id: String(row[0] || ''),
      name: String(row[1] || ''),
      category: String(row[2] || ''),
      description: String(row[3] || ''),
      documentRequirements: docReqs,
      urls: urls,
      payFee: String(row[6] || ''),
      charges: String(row[7] || ''),
      notes: String(row[8] || ''),
      createdAt: String(row[9] || ''),
      updatedAt: String(row[10] || '')
    });
  }

  return { success: true, data: websites };
}

function addWebsite(data) {
  if (!data) return { success: false, error: "No data provided." };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = getWebsitesSheet(ss);
  if (!sheet) {
    sheet = ss.insertSheet(WEBSITES_SHEET_NAME);
    sheet.appendRow(["ID", "Name", "Category", "Description", "DocumentRequirements", "URLs", "PayFee", "Charges", "Notes", "CreatedAt", "UpdatedAt"]);
    sheet.setFrozenRows(1);
  }

  const id = data.id || "web-" + new Date().getTime();
  const name = data.name || "";
  const category = data.category || "General";
  const description = data.description || "";
  const docReqs = JSON.stringify(Array.isArray(data.documentRequirements) ? data.documentRequirements : []);
  const urls = JSON.stringify(Array.isArray(data.urls) ? data.urls : []);
  const payFee = data.payFee || "";
  const charges = data.charges || "";
  const notes = data.notes || "";
  const createdAt = data.createdAt || new Date().toISOString();
  const updatedAt = new Date().toISOString();

  sheet.appendRow([id, name, category, description, docReqs, urls, payFee, charges, notes, createdAt, updatedAt]);
  return { success: true, data: { id, name, category, description, documentRequirements: data.documentRequirements, urls: data.urls, payFee, charges, notes, createdAt, updatedAt } };
}

function updateWebsite(data) {
  if (!data || (!data.id && !data.ID)) return { success: false, error: "No website id provided." };
  const targetId = String(data.id || data.ID).trim().toLowerCase();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = getWebsitesSheet(ss);
  if (!sheet) return { success: false, error: "Websites sheet tab not found." };

  const sheetData = sheet.getDataRange().getValues();
  if (sheetData.length <= 1) return { success: false, error: "No websites in sheet." };

  const headers = sheetData[0];
  let idIdx = headers.indexOf("ID");
  if (idIdx === -1) idIdx = 0;

  for (let i = 1; i < sheetData.length; i++) {
    if (String(sheetData[i][idIdx]).trim().toLowerCase() === targetId) {
      const rowIndex = i + 1;
      if (data.name !== undefined) sheet.getRange(rowIndex, 2).setValue(data.name);
      if (data.category !== undefined) sheet.getRange(rowIndex, 3).setValue(data.category);
      if (data.description !== undefined) sheet.getRange(rowIndex, 4).setValue(data.description);
      if (data.documentRequirements !== undefined) {
        const docReqs = JSON.stringify(Array.isArray(data.documentRequirements) ? data.documentRequirements : []);
        sheet.getRange(rowIndex, 5).setValue(docReqs);
      }
      if (data.urls !== undefined) {
        const urls = JSON.stringify(Array.isArray(data.urls) ? data.urls : []);
        sheet.getRange(rowIndex, 6).setValue(urls);
      }
      if (data.payFee !== undefined) sheet.getRange(rowIndex, 7).setValue(data.payFee);
      if (data.charges !== undefined) sheet.getRange(rowIndex, 8).setValue(data.charges);
      if (data.notes !== undefined) sheet.getRange(rowIndex, 9).setValue(data.notes);
      sheet.getRange(rowIndex, 11).setValue(new Date().toISOString());

      return { success: true };
    }
  }

  return { success: false, error: "Website ID '" + targetId + "' not found." };
}

function deleteWebsite(data) {
  const targetId = String((data && (data.id || data.ID)) || "").trim().toLowerCase();
  if (!targetId) return { success: false, error: "No website id provided." };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = getWebsitesSheet(ss);
  if (!sheet) return { success: false, error: "Websites sheet not found." };

  const sheetData = sheet.getDataRange().getValues();
  for (let i = sheetData.length - 1; i >= 1; i--) {
    if (String(sheetData[i][0]).trim().toLowerCase() === targetId) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: "Website ID not found." };
}

function getCategories() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = getCategoriesSheet(ss);
  if (!sheet) return { success: true, data: [] };

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, data: [] };

  const categories = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) categories.push(String(data[i][0]).trim());
  }
  return { success: true, data: categories };
}

function addCategory(data) {
  const catName = String((data && (data.name || data.CategoryName)) || "").trim();
  if (!catName) return { success: false, error: "No category name provided." };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = getCategoriesSheet(ss);
  if (!sheet) {
    sheet = ss.insertSheet(CATEGORIES_SHEET_NAME);
    sheet.appendRow(["CategoryName", "CreatedAt"]);
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([catName, new Date().toISOString()]);
  return { success: true, name: catName };
}

function deleteCategory(data) {
  const targetCat = String((data && (data.name || data.CategoryName)) || "").trim().toLowerCase();
  if (!targetCat) return { success: false, error: "No category name provided." };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = getCategoriesSheet(ss);
  if (!sheet) return { success: false, error: "Categories sheet not found." };

  const dataArr = sheet.getDataRange().getValues();
  for (let i = dataArr.length - 1; i >= 1; i--) {
    if (String(dataArr[i][0]).trim().toLowerCase() === targetCat) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: "Category not found." };
}

