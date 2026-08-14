// Add your Google Apps Script Web App URL here
const API_URL = import.meta.env.VITE_API_URL || "https://script.google.com/macros/s/AKfycbzKYBBk8NBh3jlLV1FlzOTlm2iNY5CxIxuEA-EwC7RRoWw_G5DSXxMIjY61N7fyS111CQ/exec";

// Default websites data for quick startup
const DEFAULT_WEBSITES = [
  {
    id: "web-1",
    name: "UIDAI - MyAadhaar Portal",
    category: "Identity & Governance",
    description: "Official Unique Identification Authority of India portal for downloading Aadhaar, checking update status, address update, PVC card order, and biometric lock.",
    documentRequirements: ["Aadhaar Number", "Registered Mobile No (for OTP)", "Proof of Address (for update)"],
    urls: [
      { label: "MyAadhaar Portal", url: "https://myaadhaar.uidai.gov.in/" },
      { label: "Check Status", url: "https://myaadhaar.uidai.gov.in/check-aadhaar-temp-id-status" },
      { label: "Order PVC Card", url: "https://myaadhaar.uidai.gov.in/genricDownloadAadhaar" }
    ],
    payFee: "₹50 (PVC Card Fee)",
    charges: "₹50 Service Charge",
    notes: "OTP will be sent to Aadhaar linked mobile number."
  },
  {
    id: "web-2",
    name: "Passport Seva Portal",
    category: "Travel & Identity",
    description: "Ministry of External Affairs portal for fresh passport application, passport renewal, PCC (Police Clearance Certificate), and appointment booking.",
    documentRequirements: ["Aadhaar Card", "PAN Card", "Bank Passbook / Electricity Bill", "10th Marksheet / Birth Certificate"],
    urls: [
      { label: "Official Home", url: "https://www.passportindia.gov.in/" },
      { label: "New Registration", url: "https://mypassport.passportindia.gov.in/AppOnlineProject/welcomeLink" },
      { label: "Track Application Status", url: "https://mypassport.passportindia.gov.in/AppOnlineProject/statusSearch/unAuthStatusSearch" }
    ],
    payFee: "₹1,500 (Normal) / ₹2,000 (Tatkaal)",
    charges: "₹200 Service Charge",
    notes: "Original documents required at Passport Seva Kendra during appointment."
  },
  {
    id: "web-3",
    name: "Parivahan Sewa (Sarathi & Vahan)",
    category: "Transport & Vehicles",
    description: "Ministry of Road Transport & Highways portal for Learner License, Driving License Renewal, RC Transfer, Vehicle Tax payment, and Duplicate DL.",
    documentRequirements: ["Aadhaar Card", "Blood Group Report", "Passport Photo", "Old DL / LL (if renewal)"],
    urls: [
      { label: "Parivahan Portal", url: "https://parivahan.gov.in/" },
      { label: "Sarathi DL Services", url: "https://sarathi.parivahan.gov.in/" },
      { label: "Vahan Vehicle Services", url: "https://vahan.parivahan.gov.in/" }
    ],
    payFee: "₹200 - ₹500 (Govt Fee)",
    charges: "₹100 Service Charge",
    notes: "Learner License slot booking requires physical appearance or online test depending on state."
  },
  {
    id: "web-4",
    name: "PAN Card Services (Protean NSDL)",
    category: "Banking & Tax",
    description: "Apply for new PAN card (Form 49A), PAN correction/update, Instant e-PAN, and reprint PAN card.",
    documentRequirements: ["Aadhaar Card", "Passport Photo", "Proof of Date of Birth"],
    urls: [
      { label: "NSDL PAN Portal", url: "https://www.tin-nsdl.com/" },
      { label: "Apply New PAN", url: "https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html" },
      { label: "Track PAN Status", url: "https://tin.tin.nsdl.com/pamtstatus/panStatus.html" }
    ],
    payFee: "₹107 (Physical Card) / ₹66 (e-PAN)",
    charges: "₹50 Service Charge",
    notes: "e-KYC via Aadhaar OTP allows paperless instant application."
  },
  {
    id: "web-5",
    name: "PM Kisan Samman Nidhi",
    category: "Government Schemes",
    description: "Direct Benefit Transfer portal for PM Kisan installment status, farmer e-KYC, new farmer registration, and beneficiary list.",
    documentRequirements: ["Aadhaar Card", "Bank Account Details", "Khata / Khatian Land Record", "Mobile Number"],
    urls: [
      { label: "PM Kisan Home", url: "https://pmkisan.gov.in/" },
      { label: "e-KYC Portal", url: "https://pmkisan.gov.in/aadharekyc.aspx" },
      { label: "Beneficiary Status", url: "https://pmkisan.gov.in/BeneficiaryStatus_New.aspx" }
    ],
    payFee: "Free (Govt)",
    charges: "₹50 Service Charge",
    notes: "Mandatory e-KYC must be completed for installment release."
  },
  {
    id: "web-6",
    name: "Voters Service Portal (ECI)",
    category: "Identity & Governance",
    description: "Election Commission of India portal for new voter registration (Form 6), voter ID download (e-EPIC), and address correction.",
    documentRequirements: ["Passport Photo", "Aadhaar Card", "Proof of Age", "Proof of Address"],
    urls: [
      { label: "Voters Portal Home", url: "https://voters.eci.gov.in/" },
      { label: "Search Voter List", url: "https://electoralsearch.eci.gov.in/" }
    ],
    payFee: "Free (Govt)",
    charges: "₹50 Service Charge",
    notes: "Track EPIC dispatch status using reference number."
  },
  {
    id: "web-7",
    name: "Income Tax India e-Filing",
    category: "Banking & Tax",
    description: "Income Tax return filing, Instant PAN via Aadhaar, Aadhaar-PAN linking, and tax refund status check.",
    documentRequirements: ["PAN Card", "Aadhaar Card", "Form 16 / Salary Slips", "Bank Statement"],
    urls: [
      { label: "e-Filing Home", url: "https://www.incometax.gov.in/iec/fosportal/" },
      { label: "Link Aadhaar to PAN", url: "https://eportal.incometax.gov.in/iec/foservices/#/pre-login/bl-link-aadhaar" }
    ],
    payFee: "Free / ₹1,000 (Late Link Fee)",
    charges: "₹300 Service Charge",
    notes: "Filing deadline for individuals is generally July 31st."
  }
];

const LOCAL_STORAGE_WEBSITES_KEY = "customer_app_websites_v1";
const LOCAL_STORAGE_CATEGORIES_KEY = "customer_app_categories_v1";

const DEFAULT_CATEGORIES = [
  "Identity & Governance",
  "Banking & Tax",
  "Transport & Vehicles",
  "Travel & Identity",
  "Government Schemes",
  "Utilities & Bills",
  "Other"
];

const getLocalCategories = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error("Error reading local categories storage:", err);
  }
  try {
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
  } catch (e) {
    console.error("Error writing default categories to storage:", e);
  }
  return DEFAULT_CATEGORIES;
};

const saveLocalCategories = (categories) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
  } catch (err) {
    console.error("Error saving local categories:", err);
  }
};

const getLocalWebsites = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_WEBSITES_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading local websites storage:", err);
  }
  // If no local storage data exists, set default websites
  try {
    localStorage.setItem(LOCAL_STORAGE_WEBSITES_KEY, JSON.stringify(DEFAULT_WEBSITES));
  } catch (e) {
    console.error("Error writing default websites to storage:", e);
  }
  return DEFAULT_WEBSITES;
};

const saveLocalWebsites = (websites) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_WEBSITES_KEY, JSON.stringify(websites));
  } catch (err) {
    console.error("Error saving local websites:", err);
  }
};


export const api = {
  getCustomers: async () => {
    try {
      const response = await fetch(`${API_URL}?action=getCustomers`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching customers:", error);
      return { success: false, error: error.message };
    }
  },

  getCustomerDocuments: async (customerId) => {
    try {
      const response = await fetch(`${API_URL}?action=getCustomerDocuments&customerId=${customerId}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching documents:", error);
      return { success: false, error: error.message };
    }
  },

  addCustomer: async (customerData) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'addCustomer',
          ...customerData
        }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error adding customer:", error);
      return { success: false, error: error.message };
    }
  },

  uploadDocuments: async (customerId, documents, customerName) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'uploadDocuments',
          customerId,
          customerName,
          documents // Array of { name, type, mimeType, base64 }
        }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error uploading documents:", error);
      return { success: false, error: error.message };
    }
  },

  updateCustomer: async (customerId, customerData) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'updateCustomer',
          customerId,
          ...customerData
        }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating customer:", error);
      return { success: false, error: error.message };
    }
  },

  deleteCustomer: async (customerId) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'deleteCustomer',
          customerId
        }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error deleting customer:", error);
      return { success: false, error: error.message };
    }
  },

  deleteDocument: async (documentId) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'deleteDocument',
          documentId
        }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error deleting document:", error);
      return { success: false, error: error.message };
    }
  },

  getUpdates: async () => {
    try {
      const response = await fetch(`${API_URL}?action=getUpdates`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching updates:", error);
      return { success: false, error: error.message };
    }
  },

  addUpdate: async (updateData) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'addUpdate',
          ...updateData
        }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error adding update:", error);
      return { success: false, error: error.message };
    }
  },

  updateUpdateStatus: async (updateId, status) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'updateUpdateStatus',
          updateId,
          Status: status
        }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating update status:", error);
      return { success: false, error: error.message };
    }
  },

  deleteUpdate: async (updateId) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'deleteUpdate',
          updateId
        }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error deleting update:", error);
      return { success: false, error: error.message };
    }
  },

  // Websites API methods
  getWebsites: async () => {
    try {
      const response = await fetch(`${API_URL}?action=getWebsites`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          saveLocalWebsites(data.data);
          return data;
        }
      }
    } catch (error) {
      console.warn("Backend website fetch failed, falling back to local storage:", error.message);
    }
    const localData = getLocalWebsites();
    return { success: true, data: localData };
  },

  addWebsite: async (websiteData) => {
    const newWebsite = {
      id: websiteData.id || `web-${Date.now()}`,
      name: websiteData.name || 'Untitled Website',
      category: websiteData.category || 'General',
      description: websiteData.description || '',
      documentRequirements: Array.isArray(websiteData.documentRequirements)
        ? websiteData.documentRequirements
        : (websiteData.documentRequirements || '').split(',').map(s => s.trim()).filter(Boolean),
      urls: Array.isArray(websiteData.urls) ? websiteData.urls : [],
      payFee: websiteData.payFee || 'N/A',
      charges: websiteData.charges || 'N/A',
      notes: websiteData.notes || '',
      createdAt: new Date().toISOString()
    };

    // Save to local storage first
    const list = getLocalWebsites();
    const updatedList = [newWebsite, ...list];
    saveLocalWebsites(updatedList);

    // Sync to backend asynchronously if available
    try {
      fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'addWebsite',
          ...newWebsite
        })
      }).catch(err => console.warn("Backend addWebsite sync warning:", err));
    } catch (_e) {
      // ignore
    }

    return { success: true, data: newWebsite };
  },

  updateWebsite: async (id, websiteData) => {
    const list = getLocalWebsites();
    const index = list.findIndex(w => w.id === id);
    if (index === -1) {
      return { success: false, error: 'Website not found' };
    }

    const updatedWebsite = {
      ...list[index],
      ...websiteData,
      id,
      updatedAt: new Date().toISOString()
    };

    if (typeof websiteData.documentRequirements === 'string') {
      updatedWebsite.documentRequirements = websiteData.documentRequirements
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }

    list[index] = updatedWebsite;
    saveLocalWebsites(list);

    // Sync to backend asynchronously if available
    try {
      fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'updateWebsite',
          id,
          ...updatedWebsite
        })
      }).catch(err => console.warn("Backend updateWebsite sync warning:", err));
    } catch (_e) {
      // ignore
    }

    return { success: true, data: updatedWebsite };
  },

  deleteWebsite: async (id) => {
    const list = getLocalWebsites();
    const updatedList = list.filter(w => w.id !== id);
    saveLocalWebsites(updatedList);

    // Sync to backend asynchronously if available
    try {
      fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'deleteWebsite',
          id
        })
      }).catch(err => console.warn("Backend deleteWebsite sync warning:", err));
    } catch (_e) {
      // ignore
    }

    return { success: true };
  },

  getCategories: async () => {
    try {
      const response = await fetch(`${API_URL}?action=getCategories`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          const localList = getLocalCategories();
          const merged = Array.from(new Set([...localList, ...data.data]));
          saveLocalCategories(merged);
          return { success: true, data: merged };
        }
      }
    } catch (error) {
      console.warn("Backend category fetch warning, using local storage:", error.message);
    }
    const categories = getLocalCategories();
    return { success: true, data: categories };
  },


  addCategory: async (categoryName) => {
    const trimmed = (categoryName || '').trim();
    if (!trimmed) return { success: false, error: 'Category name cannot be empty' };
    const categories = getLocalCategories();
    if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      return { success: false, error: 'Category already exists' };
    }
    const updated = [...categories, trimmed];
    saveLocalCategories(updated);

    // Sync to backend if available
    try {
      fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'addCategory',
          name: trimmed
        })
      }).catch(err => console.warn("Backend addCategory sync warning:", err));
    } catch (_e) {
      // ignore
    }

    return { success: true, data: updated };
  },

  deleteCategory: async (categoryName) => {
    const categories = getLocalCategories();
    const updated = categories.filter(c => c.toLowerCase() !== categoryName.toLowerCase());
    saveLocalCategories(updated);

    // Sync to backend if available
    try {
      fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'deleteCategory',
          name: categoryName
        })
      }).catch(err => console.warn("Backend deleteCategory sync warning:", err));
    } catch (_e) {
      // ignore
    }

    return { success: true, data: updated };
  }
};



