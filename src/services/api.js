import { parseDocumentList } from '../utils/documentUtils';

// Add your Google Apps Script Web App URL here
const API_URL = import.meta.env.VITE_API_URL || "https://script.google.com/macros/s/AKfycbzKYBBk8NBh3jlLV1FlzOTlm2iNY5CxIxuEA-EwC7RRoWw_G5DSXxMIjY61N7fyS111CQ/exec";

// Default websites data for quick startup
const DEFAULT_WEBSITES = [
  {
    id: "web-1",
    name: "UIDAI - MyAadhaar Portal",
    category: "Identity & Governance",
    description: "H1: UIDAI - MyAadhaar Portal\nH2: Citizen Identification Services\nH3: Official Overview\nOfficial Unique Identification Authority of India (UIDAI) portal for Aadhaar download, PVC order, and demographic updates.\n---\ntable:\nService$Fee\nAadhaar PVC Card$₹50 (Delivered via Speed Post)\nAddress Update$₹50 (Online proof verification)\nBiometric Lock/Unlock$Free (Instant online)\nOfficial Portal$*LINK(Link)->https://myaadhaar.uidai.gov.in/",
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
    category: "Vehicle & Transport Services",
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
  },
  {
    id: "web-esevai-1",
    name: "1.1. வருமானச் சான்றிதழ் (Income Certificate)",
    category: "E-Sevai",
    description: "H1: 1.1. வருமானச் சான்றிதழ் (Income Certificate)\nH2: TNeGA e-Sevai Service\n* விளக்கம் (Desc): விண்ணப்பதாரர் அல்லது குடும்பத்தின் ஆண்டு வருமானத்தை முறைப்படி உறுதிப்படுத்தும் ஆவணம்.\n* தகுதி (Eligible): தமிழ்நாட்டில் வசிக்கும் அனைத்துக் குடிமக்கள்.\n* பயன்கள் (Benefit): கல்வி உதவித்தொகை (Scholarships), கல்விக் கட்டணச் சலுகை மற்றும் அரசு நலத்திட்டங்கள் பெற.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(TNeGA e-Sevai Portal)->https://www.tnesevai.tn.gov.in/\nஅரசு கட்டணம்$₹60\nவழங்கும் அலுவலர்$வட்டாட்சியர் (Tahsildar)",
    documentRequirements: [
      "புகைப்படம் (Photo)",
      "ஆதார் அட்டை (Aadhaar Card)",
      "குடும்ப அட்டை (Ration Card)",
      "சம்பளச் சான்று / IT Return / VAO அறிக்கை (Salary Slip / VAO Report)"
    ],
    urls: [
      { label: "TNeGA e-Sevai Portal", url: "https://www.tnesevai.tn.gov.in/" }
    ],
    payFee: "₹60 (Govt Fee)",
    charges: "₹50 Service Charge",
    notes: "குடும்பத்தின் மொத்த ஆண்டு வருமானம் கணக்கிடப்பட்டு வட்டாட்சியரால் வழங்கப்படும்."
  },
  {
    id: "web-esevai-2",
    name: "1.2. சாதிச் சான்றிதழ் (Community Certificate)",
    category: "E-Sevai",
    description: "H1: 1.2. சாதிச் சான்றிதழ் (Community Certificate)\nH2: TNeGA e-Sevai Service\n* விளக்கம் (Desc): விண்ணப்பதாரர் சார்ந்திருக்கும் குறிப்பிட்ட சாதி மற்றும் சமூகப் பிரிவை (BC/MBC/SC/ST) முறைப்படி உறுதிப்படுத்தும் ஆவணம்.\n* தகுதி (Eligible): தமிழ்நாட்டைப் பூர்வீகமாகக் கொண்டவர்கள்.\n* பயன்கள் (Benefit): கல்வி மற்றும் வேலைவாய்ப்புகளில் இடஒதுக்கீடு பெற.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(TNeGA e-Sevai Portal)->https://www.tnesevai.tn.gov.in/\nஅரசு கட்டணம்$₹60\nவழங்கும் அதிகாரி$மண்டல துணை வட்டாட்சியர் / வட்டாட்சியர்",
    documentRequirements: [
      "புகைப்படம்",
      "ஆதார் அட்டை",
      "குடும்ப அட்டை",
      "பெற்றோரின் சாதிச் சான்றிதழ் அல்லது பள்ளி மாற்றுச் சான்றிதழ் (TC)"
    ],
    urls: [
      { label: "TNeGA e-Sevai Portal", url: "https://www.tnesevai.tn.gov.in/" }
    ],
    payFee: "₹60 (Govt Fee)",
    charges: "₹50 Service Charge",
    notes: "விண்ணப்பதாரர் சார்ந்திருக்கும் சாதிப் பிரிவை உறுதிப்படுத்தும் ஆவணம். பெற்றோர் சாதிச் சான்று அல்லது TC தேவை."
  },
  {
    id: "web-esevai-3",
    name: "1.3. இருப்பிடச் சான்றிதழ் (Nativity Certificate)",
    category: "E-Sevai",
    description: "H1: 1.3. இருப்பிடச் சான்றிதழ் (Nativity Certificate)\nH2: TNeGA e-Sevai Service\n* விளக்கம் (Desc): விண்ணப்பதாரர் தமிழ்நாட்டில் குறிப்பிட்ட முகவரியில் நிரந்தரமாக வசித்து வருகிறார் என்பதை உறுதி செய்யும் சான்றிதழ்.\n* தகுதி (Eligible): தமிழ்நாட்டில் நிரந்தரமாக வசிப்பவர்கள்.\n* பயன்கள் (Benefit): மாநில அரசு வேலைவாய்ப்பு மற்றும் கல்விச் சேர்க்கையில் முன்னுரிமை பெற.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(TNeGA e-Sevai Portal)->https://www.tnesevai.tn.gov.in/\nஅரசு கட்டணம்$₹60\nகுடியிருப்பு காலம்$குறைந்தது 5 ஆண்டுகள் நிரூபிக்க வேண்டும்",
    documentRequirements: [
      "புகைப்படம்",
      "ஆதார் அட்டை",
      "குடும்ப அட்டை / வாக்காளர் அடையாள அட்டை",
      "பிறப்புச் சான்றிதழ் அல்லது பள்ளி மாற்றுச் சான்றிதழ்",
      "5 வருட குடியிருப்பு சான்று (Property tax / Voter ID / Gas bill)"
    ],
    urls: [
      { label: "TNeGA e-Sevai Portal", url: "https://www.tnesevai.tn.gov.in/" }
    ],
    payFee: "₹60 (Govt Fee)",
    charges: "₹50 Service Charge",
    notes: "குறைந்தது 5 வருடங்கள் தமிழ்நாட்டில் வசித்து வருவதற்கான ஆவணச் சான்று தேவை."
  },
  {
    id: "web-esevai-4",
    name: "1.4. OBC சான்றிதழ் (OBC Certificate)",
    category: "E-Sevai",
    description: "H1: 1.4. OBC சான்றிதழ் (OBC Certificate)\nH2: Central Govt OBC Reservation Portal\n* விளக்கம் (Desc): மத்திய அரசின் கல்வி மற்றும் வேலைவாய்ப்புகளில் இதர பிற்படுத்தப்பட்ட வகுப்பினர் (OBC) இடஒதுக்கீட்டைப் பெற வழங்கப்படும் சான்றிதழ்.\n* தகுதி (Eligible): மத்திய அரசின் OBC பட்டியலில் உள்ள, கிரீமிலேயர் (Creamy Layer) வரம்பிற்குள் வராதவர்கள் (ஆண்டு வருமானம் ₹8 லட்சத்திற்குள்).\n* பயன்கள் (Benefit): மத்திய அரசு வேலைகள் மற்றும் மத்திய கல்வி நிறுவனங்களில் (IIT, IIM, Central Universities) 27% இடஒதுக்கீடு.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(TNeGA e-Sevai Portal)->https://www.tnesevai.tn.gov.in/\nஅரசு கட்டணம்$₹60\nவருமான வரம்பு$ஆண்டு வருமானம் ₹8 லட்சத்திற்குள் (Non-Creamy Layer)",
    documentRequirements: [
      "புகைப்படம்",
      "மாநில சாதிச் சான்றிதழ்",
      "ஆதார் அட்டை",
      "குடும்ப அட்டை",
      "கடந்த 3 ஆண்டுகளுக்கான வருமானச் சான்றிதழ் / IT Return / Pay Slip"
    ],
    urls: [
      { label: "TNeGA e-Sevai Portal", url: "https://www.tnesevai.tn.gov.in/" }
    ],
    payFee: "₹60 (Govt Fee)",
    charges: "₹50 Service Charge",
    notes: "மத்திய அரசின் OBC இடஒதுக்கீடு பெற கிரீமிலேயர் வரம்பிற்குள் வரக்கூடாது (ஆண்டு வருமானம் ₹8 லட்சத்திற்குள்)."
  },
  {
    id: "web-esevai-5",
    name: "1.5. முதல் தலைமுறை பட்டதாரி சான்றிதழ் (First Graduate Certificate)",
    category: "E-Sevai",
    description: "H1: 1.5. முதல் தலைமுறை பட்டதாரி சான்றிதழ் (First Graduate Certificate)\nH2: TNeGA e-Sevai Service\n* விளக்கம் (Desc): ஒரு குடும்பத்தில் முதன்முறையாக பட்டப்படிப்பு படிக்கச் செல்லும் மாணவருக்கு வழங்கப்படும் சான்றிதழ்.\n* தகுதி (Eligible): குடும்பத்தில் வேறு யாரும் பட்டதாரி (Degree holder) இருக்கக் கூடாது.\n* பயன்கள் (Benefit): தொழில்முறைக் கல்விச் சேர்க்கையில் (Engineering/Medical) அரசு வழங்கும் கட்டணச் சலுகை.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(TNeGA e-Sevai Portal)->https://www.tnesevai.tn.gov.in/\nஅரசு கட்டணம்$₹60\nபயன்$இன்ஜினியரிங் / மெடிக்கல் படிப்புகளுக்கான கல்விக் கட்டண சலுகை",
    documentRequirements: [
      "மாணவரின் புகைப்படம், ஆதார், குடும்ப அட்டை",
      "பள்ளி மாற்றுச் சான்றிதழ் (TC)",
      "பெற்றோர் மற்றும் உடன் பிறந்தவர்களின் கல்விச் சான்றுகள் அல்லது படிக்கவில்லை என்பதற்கான சுயவிவர வாக்குமூலம் (Self-Declaration)"
    ],
    urls: [
      { label: "TNeGA e-Sevai Portal", url: "https://www.tnesevai.tn.gov.in/" }
    ],
    payFee: "₹60 (Govt Fee)",
    charges: "₹50 Service Charge",
    notes: "குடும்பத்தில் வேறு யாரும் பட்டதாரி இல்லை என்பதை உறுதிப்படுத்தும் சுய வாக்குமூலம் தேவை."
  },
  {
    id: "web-esevai-6",
    name: "1.6. வாரிசுச் சான்றிதழ் (Legal Heir Certificate)",
    category: "E-Sevai",
    description: "H1: 1.6. வாரிசுச் சான்றிதழ் (Legal Heir Certificate)\nH2: TNeGA e-Sevai Service\n* விளக்கம் (Desc): இறந்த நபரின் சட்டப்பூர்வமான வாரிசுகள் யார் என்பதை உறுதிப்படுத்தும் அதிகாரப்பூர்வ ஆவணம்.\n* தகுதி (Eligible): இறந்த நபரின் நெருங்கிய சட்டப்பூர்வ வாரிசுகள் (மனைவி, பிள்ளைகள், பெற்றோர்).\n* பயன்கள் (Benefit): இறந்தவரின் சொத்து மாற்று, வங்கி இருப்புப் பெறுதல், ஓய்வூதியம் மற்றும் காப்பீட்டுத் தொகை பெற.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(TNeGA e-Sevai Portal)->https://www.tnesevai.tn.gov.in/\nஅரசு கட்டணம்$₹60\nபயன்கள்$சொத்து மாற்றம், வங்கி இருப்பு, பென்ஷன் மற்றும் காப்பீடு பெற",
    documentRequirements: [
      "இறந்தவரின் இறப்புச் சான்றிதழ்",
      "அனைத்து வாரிசுதாரர்களின் ஆதார் அட்டை, புகைப்படம்",
      "இறந்தவருடனான உறவுமுறைச் சான்று (வாரிசுகளின் TC/ஆதார்)",
      "திருமணச் சான்றிதழ் (மனைவிக்கு)"
    ],
    urls: [
      { label: "TNeGA e-Sevai Portal", url: "https://www.tnesevai.tn.gov.in/" }
    ],
    payFee: "₹60 (Govt Fee)",
    charges: "₹100 Service Charge",
    notes: "அனைத்து சட்டப்பூர்வ வாரிசுகளின் விவரங்களும் ஆவணங்களும் இணைக்கப்பட வேண்டும்."
  },
  {
    id: "web-esevai-7",
    name: "1.7. விதவைச் சான்றிதழ் (Widow Certificate)",
    category: "E-Sevai",
    description: "H1: 1.7. விதவைச் சான்றிதழ் (Widow Certificate)\nH2: TNeGA e-Sevai Service\n* விளக்கம் (Desc): கணவரை இழந்த பெண்மணிக்கு வழங்கப்படும் அதிகாரப்பூர்வ சான்றிதழ்.\n* தகுதி (Eligible): கணவனை இழந்த மற்றும் மறுமணம் செய்யாத பெண்கள்.\n* பயன்கள் (Benefit): அரசு நலத்திட்டங்கள், இலவச தையல் இயந்திரம் மற்றும் முன்னுரிமை அடிப்படையிலான வேலைவாய்ப்புகள் பெற.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(TNeGA e-Sevai Portal)->https://www.tnesevai.tn.gov.in/\nஅரசு கட்டணம்$₹60\nதகுதி$மறுமணம் செய்யாத பெண்கள்",
    documentRequirements: [
      "விண்ணப்பதாரரின் புகைப்படம், ஆதார், குடும்ப அட்டை",
      "கணவரின் இறப்புச் சான்றிதழ்",
      "திருமணச் சான்று அல்லது VAO அறிக்கை"
    ],
    urls: [
      { label: "TNeGA e-Sevai Portal", url: "https://www.tnesevai.tn.gov.in/" }
    ],
    payFee: "₹60 (Govt Fee)",
    charges: "₹50 Service Charge",
    notes: "கணவனை இழந்த மற்றும் மறுமணம் செய்யாத பெண்கள் மட்டுமே விண்ணப்பிக்கலாம்."
  },
  {
    id: "web-esevai-8",
    name: "1.8. கலப்புத் திருமணச் சான்றிதழ் (Inter-caste Marriage Certificate)",
    category: "E-Sevai",
    description: "H1: 1.8. கலப்புத் திருமணச் சான்றிதழ் (Inter-caste Marriage Certificate)\nH2: TNeGA e-Sevai Service\n* விளக்கம் (Desc): வெவ்வேறு சமூகத்தைச் சேர்ந்த தம்பதியினர் திருமணம் செய்து கொண்டதைச் சான்றளிக்கும் ஆவணம்.\n* தகுதி (Eligible): கணவன்/மனைவி இருவரில் ஒருவர் SC/ST பிரிவாகவும், மற்றொருவர் மாற்றுப் பிரிவாகவும் அல்லது இருவேறு சாதியினராகவும் இருத்தல் வேண்டும்.\n* பயன்கள் (Benefit): அரசு வேலைவாய்ப்புகளில் முன்னுரிமை மற்றும் கலப்புத் திருமண நிதி உதவித் திட்டங்கள்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(TNeGA e-Sevai Portal)->https://www.tnesevai.tn.gov.in/\nஅரசு கட்டணம்$₹60\nபயன்$அரசு வேலைவாய்ப்பு முன்னுரிமை மற்றும் நிதி உதவி",
    documentRequirements: [
      "தம்பதியரின் கூட்டுப் புகைப்படம்",
      "இருவரின் ஆதார், குடும்ப அட்டை",
      "இருவரின் சாதிச் சான்றிதழ்கள்",
      "பதிவு செய்யப்பட்ட திருமணச் சான்றிதழ் (Marriage Certificate)"
    ],
    urls: [
      { label: "TNeGA e-Sevai Portal", url: "https://www.tnesevai.tn.gov.in/" }
    ],
    payFee: "₹60 (Govt Fee)",
    charges: "₹50 Service Charge",
    notes: "பதிவு செய்யப்பட்ட திருமணச் சான்றிதழ் மற்றும் இருவரின் தனித்தனி சாதிச் சான்றிதழ்கள் அவசியம்."
  },
  {
    id: "web-esevai-9",
    name: "1.9. குழந்தையின்மைச் சான்று (Childless Certificate)",
    category: "E-Sevai",
    description: "H1: 1.9. குழந்தையின்மைச் சான்று (Childless Certificate)\nH2: TNeGA e-Sevai Service\n* விளக்கம் (Desc): தம்பதியருக்குக் குழந்தைகள் இல்லை என்பதை அரசு ரீதியாக உறுதி செய்யும் சான்று.\n* தகுதி (Eligible): திருமணம் ஆகி பல வருடங்களாகக் குழந்தை இல்லாத தம்பதியர்.\n* பயன்கள் (Benefit): வாரிசு தத்தெடுப்பு (Adoption) மற்றும் சில குறிப்பிட்ட துறைசார் சலுகைகள் பெற.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(TNeGA e-Sevai Portal)->https://www.tnesevai.tn.gov.in/\nஅரசு கட்டணம்$₹60\nவிசாரணை$VAO மற்றும் வருவாய்த்துறை அறிக்கை",
    documentRequirements: [
      "தம்பதியரின் புகைப்படம், ஆதார், குடும்ப அட்டை",
      "VAO மற்றும் வருவாய்த்துறை விசாரணை அறிக்கை",
      "மருத்துவப் பரிசோதனை ஆவணங்கள் (தேவைப்படின்)"
    ],
    urls: [
      { label: "TNeGA e-Sevai Portal", url: "https://www.tnesevai.tn.gov.in/" }
    ],
    payFee: "₹60 (Govt Fee)",
    charges: "₹50 Service Charge",
    notes: "வாரிசு தத்தெடுப்பு (Adoption) பணிகளுக்கு இந்த சான்றிதழ் பயன்படுகிறது."
  },
  {
    id: "web-esevai-10",
    name: "1.10. திருமணமாகாதவர் சான்றிதழ் (Unmarried Certificate)",
    category: "E-Sevai",
    description: "H1: 1.10. திருமணமாகாதவர் சான்றிதழ் (Unmarried Certificate)\nH2: TNeGA e-Sevai Service\n* விளக்கம் (Desc): விண்ணப்பதாரருக்கு இதுவரை திருமணம் ஆகவில்லை என்பதைச் சான்றளிக்கும் ஆவணம்.\n* தகுதி (Eligible): மணமாகாத எந்தவொரு தனிநபரும்.\n* பயன்கள் (Benefit): ராணுவச் சேர்க்கை, வெளிநாட்டு வேலைவாய்ப்பு மற்றும் கல்வி உதவித்தொகை விண்ணப்பங்களுக்கு.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(TNeGA e-Sevai Portal)->https://www.tnesevai.tn.gov.in/\nஅரசு கட்டணம்$₹60\nபயன்பாடுகள்$ராணுவச் சேர்க்கை, வெளிநாட்டு வேலை மற்றும் விசா",
    documentRequirements: [
      "புகைப்படம்",
      "ஆதார் அட்டை, குடும்ப அட்டை",
      "பள்ளி மாற்றுச் சான்றிதழ் (TC)",
      "சுய வாக்குமூலப் பத்திரம் (Self-Declaration Document)"
    ],
    urls: [
      { label: "TNeGA e-Sevai Portal", url: "https://www.tnesevai.tn.gov.in/" }
    ],
    payFee: "₹60 (Govt Fee)",
    charges: "₹50 Service Charge",
    notes: "ராணுவ ஆள்சேர்ப்பு, மத்திய அரசு வேலை மற்றும் வெளிநாட்டு விசா விண்ணப்பங்களுக்கு தேவை."
  },
  {
    id: "web-esevai-11",
    name: "1.11. குடியிருப்புச் சான்று (Residence Certificate)",
    category: "E-Sevai",
    description: "H1: 1.11. குடியிருப்புச் சான்று (Residence Certificate)\nH2: TNeGA e-Sevai Service\n* விளக்கம் (Desc): ஒரு நபர் தற்சமயம் ஒரு குறிப்பிட்ட முகவரியில் வசித்து வருகிறார் என்பதற்கான தற்காலிக/நிரந்தரச் சான்று.\n* தகுதி (Eligible): குறிப்பிட்ட பகுதியில் வசிக்கும் நபர்.\n* பயன்கள் (Benefit): புதிய வங்கி கணக்கு தொடங்க, முகவரிச் சான்றாகப் பயன்படுத்த.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(TNeGA e-Sevai Portal)->https://www.tnesevai.tn.gov.in/\nஅரசு கட்டணம்$₹60\nபயன்$வங்கி கணக்கு தொடங்குதல், முகவரிச் சான்று",
    documentRequirements: [
      "புகைப்படம், ஆதார் அட்டை",
      "வாடகை ஒப்பந்தப் பத்திரம் அல்லது சொத்து வரி ரசீது",
      "வங்கி கணக்கு புத்தகம் / கேஸ் பில்"
    ],
    urls: [
      { label: "TNeGA e-Sevai Portal", url: "https://www.tnesevai.tn.gov.in/" }
    ],
    payFee: "₹60 (Govt Fee)",
    charges: "₹50 Service Charge",
    notes: "தற்போதைய குடியிருப்பு முகவரியை அதிகாரப்பூர்வமாக நிரூபிக்க பயன்படுகிறது."
  },
  {
    id: "web-esevai-12",
    name: "1.12. வேலையின்மைச் சான்று (Unemployment Certificate)",
    category: "E-Sevai",
    description: "H1: 1.12. வேலையின்மைச் சான்று (Unemployment Certificate)\nH2: TNeGA e-Sevai Service\n* விளக்கம் (Desc): விண்ணப்பதாரர் தற்சமயம் எந்தவொரு ஊதியம் பெறும் வேலையிலும் இல்லை என்பதை உறுதிப்படுத்தும் சான்று.\n* தகுதி (Eligible): படித்து முடித்து வேலை தேடிக் கொண்டிருக்கும் இளைஞர்கள்.\n* பயன்கள் (Benefit): அரசு வழங்கும் வேலையின்மை உதவித்தொகை பெற மற்றும் சுயதொழில் கடன் சலுகைகள் பெற.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(TNeGA e-Sevai Portal)->https://www.tnesevai.tn.gov.in/\nஅரசு கட்டணம்$₹60\nபயன்கள்$வேலையின்மை உதவித்தொகை மற்றும் மானியக் கடன்கள்",
    documentRequirements: [
      "புகைப்படம், ஆதார் அட்டை, குடும்ப அட்டை",
      "கல்வித் தகுதிச் சான்றிதழ்கள்",
      "வேலைவாய்ப்பு அலுவலகப் பதிவு அட்டை (Employment Card - இருந்தால்)"
    ],
    urls: [
      { label: "TNeGA e-Sevai Portal", url: "https://www.tnesevai.tn.gov.in/" }
    ],
    payFee: "₹60 (Govt Fee)",
    charges: "₹50 Service Charge",
    notes: "படிப்பு முடித்து வேலைவாய்ப்பகம் பதிவு செய்த இளைஞர்களுக்கு அரசு நலத்திட்டங்களுக்கு பயன்படும்."
  },
  {
    id: "web-esevai-13",
    name: "1.13. கைவிடப்பட்ட பெண்களுக்கான சான்று (Deserted Woman Certificate)",
    category: "E-Sevai",
    description: "H1: 1.13. கைவிடப்பட்ட பெண்களுக்கான சான்று (Deserted Woman Certificate)\nH2: TNeGA e-Sevai Service\n* விளக்கம் (Desc): கணவனால் கைவிடப்பட்டு ஆதரவின்றி வாழும் பெண்களுக்கு வழங்கப்படும் சான்றிதழ்.\n* தகுதி (Eligible): கணவனால் சட்டப்பூர்வமாகவோ அல்லது முறைப்படியோ பிரிந்து குறைந்தது 5 ஆண்டுகளுக்கு மேல் வாழும் பெண்கள்.\n* பயன்கள் (Benefit): மாதாந்திர ஓய்வூதியம், அரசு இலவச திட்டங்கள் மற்றும் முன்னுரிமை இடஒதுக்கீடுகள்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(TNeGA e-Sevai Portal)->https://www.tnesevai.tn.gov.in/\nஅரசு கட்டணம்$₹60\nபிரிந்த காலம்$குறைந்தது 5 ஆண்டுகள்",
    documentRequirements: [
      "புகைப்படம், ஆதார், குடும்ப அட்டை",
      "கணவர் பிரிந்து வாழ்வதற்கான சான்றுகள் (காவல் நிலையப் புகார் நகல் / நீதிமன்ற ஆவணங்கள் / VAO அறிக்கை)"
    ],
    urls: [
      { label: "TNeGA e-Sevai Portal", url: "https://www.tnesevai.tn.gov.in/" }
    ],
    payFee: "₹60 (Govt Fee)",
    charges: "₹50 Service Charge",
    notes: "கணவரைப் பிரிந்து குறைந்தது 5 ஆண்டுகள் தனியாக வாழ்ந்து வருவது உறுதி செய்யப்பட வேண்டும்."
  },
  {
    id: "web-esevai-14",
    name: "1.14. ஆதரவற்ற விதவைச் சான்று (Destitute Widow Certificate)",
    category: "E-Sevai",
    description: "H1: 1.14. ஆதரவற்ற விதவைச் சான்று (Destitute Widow Certificate)\nH2: TN Revenue & TNeGA Service\n* விளக்கம் (Desc): கணவனை இழந்து, எவ்வித வருமான ஆதாரமும் இல்லாத ஏழைப் பெண்களுக்கு வழங்கப்படும் மிக முக்கிய முன்னுரிமைச் சான்று.\n* தகுதி (Eligible): ஆதரவற்ற, மிகக் குறைந்த வருமானம் கொண்ட மறுமணம் செய்யாத விதவைகள்.\n* பயன்கள் (Benefit): TNPSC மற்றும் அரசு வேலைவாய்ப்புகளில் சிறப்பு இடஒதுக்கீடு (Destitute Widow Quota).\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(TNeGA e-Sevai Portal)->https://www.tnesevai.tn.gov.in/\nஅரசு கட்டணம்$₹60\nமுக்கிய பயன்$TNPSC அரசு தேர்வுகளில் Destitute Widow Quota இடஒதுக்கீடு",
    documentRequirements: [
      "விண்ணப்பதாரரின் புகைப்படம், ஆதார், குடும்ப அட்டை",
      "கணவரின் இறப்புச் சான்றிதழ்",
      "வருமானச் சான்றிதழ் (மிகக் குறைந்த வருவாய் இருக்க வேண்டும்)"
    ],
    urls: [
      { label: "TNeGA e-Sevai Portal", url: "https://www.tnesevai.tn.gov.in/" }
    ],
    payFee: "₹60 (Govt Fee)",
    charges: "₹50 Service Charge",
    notes: "வருவாய்க் கோட்டாட்சியர் (RDO) அல்லது சார் ஆட்சியரால் ஆய்வு செய்யப்பட்டு சான்றளிக்கப்படும்."
  },
  {
    id: "web-esevai-15",
    name: "1.15. சிறு / குறு விவசாயி சான்றிதழ் (Small / Marginal Farmer Certificate)",
    category: "E-Sevai",
    description: "H1: 1.15. சிறு / குறு விவசாயி சான்றிதழ் (Small / Marginal Farmer Certificate)\nH2: TNeGA e-Sevai Service\n* விளக்கம் (Desc): ஒரு விவசாயி வைத்திருக்கும் நிலத்தின் பரப்பளவைக் கணக்கிட்டு வழங்கப்படும் சான்றிதழ்.\n* தகுதி (Eligible): குறு விவசாயி (Marginal): 2.5 ஏக்கர் வரை நன்செய் அல்லது 5 ஏக்கர் வரை புன்செய் நிலம். சிறு விவசாயி (Small): 5 ஏக்கர் வரை நன்செய் அல்லது 10 ஏக்கர் வரை புன்செய் நிலம் உடையவர்கள்.\n* பயன்கள் (Benefit): அரசு மானியங்கள், இலவச விவசாய மின்சாரம், பயிர்க்கடன் தள்ளுபடி சலுகைகள்.\n---\ntable:\nவிவசாயி வகை$நில வரம்பு\nகுறு விவசாயி (Marginal)$2.5 ஏக்கர் வரை நன்செய் அல்லது 5 ஏக்கர் புன்செய்\nசிறு விவசாயி (Small)$5 ஏக்கர் வரை நன்செய் அல்லது 10 ஏக்கர் புன்செய்\nஇணைய இணைப்பு$*LINK(TNeGA e-Sevai Portal)->https://www.tnesevai.tn.gov.in/\nஅரசு கட்டணம்$₹60",
    documentRequirements: [
      "ஆதார் அட்டை, குடும்ப அட்டை",
      "நிலத்தின் பட்டா, சிட்டா, அடங்கல் நகல்",
      "VAO சான்றிதழ்"
    ],
    urls: [
      { label: "TNeGA e-Sevai Portal", url: "https://www.tnesevai.tn.gov.in/" }
    ],
    payFee: "₹60 (Govt Fee)",
    charges: "₹50 Service Charge",
    notes: "இலவச விவசாய மின்சாரம், நுண்ணீர்ப் பாசன மானியம் மற்றும் பயிர்க்கடன்களுக்கு அவசியம்."
  },
  {
    id: "web-esevai-16",
    name: "1.16. விவசாய வருமானச் சான்றிதழ் (Agricultural Income Certificate)",
    category: "E-Sevai",
    description: "H1: 1.16. விவசாய வருமானச் சான்றிதழ் (Agricultural Income Certificate)\nH2: TNeGA e-Sevai Service\n* விளக்கம் (Desc): விவசாயத் தொழில் மூலம் மட்டுமே ஈட்டப்படும் வருமானத்தை சான்றளிக்கும் ஆவணம்.\n* தகுதி (Eligible): சொந்தமாக விவசாய நிலம் வைத்து விவசாயம் செய்பவர்கள்.\n* பயன்கள் (Benefit): வருமான வரி விலக்கு பெற மற்றும் விவசாயக் கடன்களுக்கு விண்ணப்பிக்க.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(TNeGA e-Sevai Portal)->https://www.tnesevai.tn.gov.in/\nஅரசு கட்டணம்$₹60\nவரி விலக்கு$வருமான வரிச் சட்டம் பிரிவு 10(1)ன் கீழ் விலக்கு",
    documentRequirements: [
      "ஆதார், குடும்ப அட்டை",
      "நில ஆவணங்கள் (பட்டா/சிட்டா)",
      "VAO வழங்கும் பயிர் சாகுபடி மற்றும் வருமான அறிக்கை"
    ],
    urls: [
      { label: "TNeGA e-Sevai Portal", url: "https://www.tnesevai.tn.gov.in/" }
    ],
    payFee: "₹60 (Govt Fee)",
    charges: "₹50 Service Charge",
    notes: "வருமான வரி விலக்கு பெற மற்றும் விவசாயக் கடன்களுக்கு விண்ணப்பிக்க சமர்ப்பிக்க வேண்டும்."
  },
  {
    id: "web-esevai-17",
    name: "1.17. பிறப்புச் சான்றிதழ் (Birth Certificate)",
    category: "E-Sevai",
    description: "H1: 1.17. பிறப்புச் சான்றிதழ் (Birth Certificate)\nH2: Civil Registration System (CRSTN)\n* விளக்கம் (Desc): ஒரு குழந்தையின் பிறப்பை அதிகாரப்பூர்வமாகப் பதிவு செய்து வழங்கப்படும் சான்றிதழ்.\n* தகுதி (Eligible): தமிழ்நாட்டில் பிறக்கும் அனைத்துக் குழந்தைகள்.\n* பயன்கள் (Benefit): பள்ளிச் சேர்க்கை, ஆதார் அட்டை எடுத்தல், பாஸ்போர்ட் விண்ணப்பித்தல் போன்ற அனைத்துக்கும் அடிப்படை ஆவணம்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(CRSTN பிறப்பு பதிவு போர்டல்)->https://crstn.org/cecondline/\nபதிவு கட்டணம்$21 நாட்களுக்குள் இலவசம் / தாமதப் பதிவுக்கு அபராதம் உண்டு\nஅடிப்படை ஆவணம்$பள்ளி சேர்க்கை, ஆதார் & பாஸ்போர்ட்",
    documentRequirements: [
      "மருத்துவமனை பிறப்பு அறிக்கை (Discharge Summary)",
      "பெற்றோரின் ஆதார் அட்டை மற்றும் குடும்ப அட்டை"
    ],
    urls: [
      { label: "TN Birth & Death Portal / CRSTN", url: "https://crstn.org/cecondline/" }
    ],
    payFee: "பதிவு செய்யப்பட்ட காலத்திற்குள் இலவசம் / தாமதப் பதிவுக்கு அபராதம் உண்டு",
    charges: "₹50 Service Charge",
    notes: "பிறந்த 21 நாட்களுக்குள் உள்ளாட்சி / மருத்துவமனை மூலம் இலவசமாக பதிவு செய்து பெறலாம்."
  },
  {
    id: "web-esevai-18",
    name: "1.18. இறப்புச் சான்றிதழ் (Death Certificate)",
    category: "E-Sevai",
    description: "H1: 1.18. இறப்புச் சான்றிதழ் (Death Certificate)\nH2: Civil Registration System (CRSTN)\n* விளக்கம் (Desc): ஒரு நபரின் மரணத்தை அதிகாரப்பூர்வமாகப் பதிவு செய்து வழங்கப்படும் சான்றிதழ்.\n* தகுதி (Eligible): இறந்த நபரின் குடும்ப உறுப்பினர்கள் விண்ணப்பிக்கலாம்.\n* பயன்கள் (Benefit): வாரிசுச் சான்றிதழ் பெற, காப்பீடு பெற, சொத்துகளை மாற்ற.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(CRSTN Portal)->https://crstn.org/cecondline/\nஅரசு கட்டணம்$அரசு கட்டணம் இல்லை (குறிப்பிட்ட நாட்களுக்குள்)\nபயன்கள்$வாரிசுச் சான்றிதழ், இன்சூரன்ஸ் கிளைம் & சொத்து மாற்றம்",
    documentRequirements: [
      "மருத்துவமனை இறப்பு அறிக்கை அல்லது மயான ரசீது",
      "இறந்தவரின் ஆதார் அட்டை, குடும்ப அட்டை",
      "விண்ணப்பதாரரின் அடையாள அட்டை"
    ],
    urls: [
      { label: "CRSTN Portal", url: "https://crstn.org/cecondline/" }
    ],
    payFee: "அரசு கட்டணம் இல்லை (குறிப்பிட்ட நாட்களுக்குள்)",
    charges: "₹50 Service Charge",
    notes: "இறந்த 21 நாட்களுக்குள் பதிவு செய்தால் இலவசம். தாமதப் பதிவுக்கு சார் ஆட்சியர் ஒப்புதல் தேவை."
  },
  {
    id: "web-esevai-19",
    name: "1.19. பட்டாசு உரிமம் (தற்காலிகம் - Temporary Firecrackers License)",
    category: "E-Sevai",
    description: "H1: 1.19. பட்டாசு உரிமம் (தற்காலிகம் - Temporary Firecrackers License)\nH2: TNeGA e-Sevai Service\n* விளக்கம் (Desc): தீபாவளி போன்ற பண்டிகை காலங்களில் தற்காலிகமாகப் பட்டாசு கடை வைக்க வழங்கப்படும் உரிமம்.\n* தகுதி (Eligible): பாதுகாப்பான வணிக இடத்தை வைத்திருக்கும் 18 வயது நிரம்பியவர்கள்.\n* பயன்கள் (Benefit): பண்டிகைக் காலங்களில் சட்டப்பூர்வமாகப் பட்டாசு விற்பனை செய்ய அனுமதி.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(TNeGA e-Sevai Portal)->https://www.tnesevai.tn.gov.in/\nஅரசு கட்டணம்$அரசு நிர்ணயிக்கும் உரிமக் கட்டணம் (ஆண்டுக்கு ஆண்டு மாறுபடும்)\nகட்டாய ஆவணம்$தீயணைப்பு & காவல் துறை NOC",
    documentRequirements: [
      "விண்ணப்பதாரரின் புகைப்படம், ஆதார், PAN அட்டை",
      "கடை அமைய உள்ள இடத்தின் வரைபடம் மற்றும் நில உரிமையாளர் சம்மதக் கடிதம் (NOC)",
      "தீயணைப்புத் துறை மற்றும் காவல் துறை NOC"
    ],
    urls: [
      { label: "TNeGA e-Sevai Portal", url: "https://www.tnesevai.tn.gov.in/" }
    ],
    payFee: "அரசு நிர்ணயிக்கும் உரிமக் கட்டணம் (ஆண்டுக்கு ஆண்டு மாறுபடும்)",
    charges: "₹150 Service Charge",
    notes: "பண்டிகைக் காலங்களில் தற்காலிகமாக பட்டாசு கடை வைக்க தீயணைப்பு மற்றும் காவல் துறையின் தடையில்லா சான்றிதழ் (NOC) அவசியம்."
  },
  {
    id: "pension-ignoaps",
    name: "2.1. முதியோர் ஓய்வூதியம் (Indira Gandhi National Old Age Pension Scheme - IGNOAPS)",
    category: "Pension Services",
    description: "H1: 2.1. முதியோர் ஓய்வூதியம் (Old Age Pension - IGNOAPS)\nH2: சமூகப் பாதுகாப்புத் திட்டங்கள் (Social Security Schemes)\n* விளக்கம் (Desc): வறுமைக் கோட்டிற்கு கீழ் உள்ள முதியோர்களுக்கு அரசு வழங்கும் மாதாந்திர நிதியுதவி.\n* தகுதி (Eligible): வயது 60 அல்லது அதற்கு மேல் இருக்க வேண்டும். வறுமைக் கோட்டிற்கு கீழ் இருக்க வேண்டும். ஆதரவற்றவராக இருத்தல் வேண்டும்.\n* பயன்கள் (Benefit): மாதாந்திர ஓய்வூதியம் (தற்போது ₹1,200 வரை) நேரடியாக வங்கி கணக்கில் செலுத்தப்படும் + இலவச அரிசி/வேட்டி/சேலை.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(TNeGA e-Sevai Portal)->https://www.tnesevai.tn.gov.in/\nவிண்ணப்பக் கட்டணம்$அரசு கட்டணம் ₹60\nஓய்வூதிய தொகை$மாதம் ₹1,200 (வங்கி கணக்கில் வரவு)\nகூடுதல் சலுகை$இலவச அரிசி, வேட்டி மற்றும் சேலை",
    documentRequirements: [
      "புகைப்படம் (Applicant Photo)",
      "ஆதார் அட்டை (Aadhaar Card)",
      "குடும்ப அட்டை (Ration Card)",
      "வங்கி கணக்கு புத்தகம் (Bank Passbook)",
      "வருமானச் சான்று (Income Certificate)",
      "வயதுச் சான்று (ஆதார் / வாக்காளர் அட்டை / பள்ளிச் சான்று)"
    ],
    urls: [
      { label: "TNeGA e-Sevai Portal", url: "https://www.tnesevai.tn.gov.in/" }
    ],
    payFee: "₹60 (Govt Fee)",
    charges: "₹50 Service Charge",
    notes: "வயது 60 அல்லது அதற்கு மேல் இருக்க வேண்டும். வறுமைக் கோட்டிற்கு கீழ் உள்ள ஆதரவற்ற முதியோர்களுக்கு மாதாந்திர ஓய்வூதியம் நேரடியாக வங்கிக் கணக்கில் வரவு வைக்கப்படும்."
  },
  {
    id: "pension-dwps",
    name: "2.2. ஆதரவற்ற விதவை ஓய்வூதியம் (Destitute Widow Pension Scheme - DWPS)",
    category: "Pension Services",
    description: "H1: 2.2. ஆதரவற்ற விதவை ஓய்வூதியம் (Destitute Widow Pension - DWPS)\nH2: சமூகப் பாதுகாப்புத் திட்டங்கள் (Social Security Schemes)\n* விளக்கம் (Desc): கணவனை இழந்து தவிக்கும் ஏழை மற்றும் ஆதரவற்ற விதவைப் பெண்களுக்கு வழங்கப்படும் மாதாந்திர நிதியுதவி.\n* தகுதி (Eligible): குறைந்தபட்ச வயது 18. மறுமணம் செய்யாத ஆதரவற்ற பெண்களாக இருக்க வேண்டும்.\n* பயன்கள் (Benefit): மாதாந்திர நிதியுதவி மற்றும் இதர அரசு சலுகைகள்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(TNeGA e-Sevai Portal)->https://www.tnesevai.tn.gov.in/\nசேவைக் கட்டணம்$அரசு கட்டணம் ₹60\nதகுதி வயது$குறைந்தபட்சம் 18 வயது\nமுக்கிய நிபந்தனை$மறுமணம் செய்யாத ஆதரவற்ற பெண்",
    documentRequirements: [
      "புகைப்படம் (Photo)",
      "ஆதார் அட்டை (Aadhaar Card)",
      "குடும்ப அட்டை (Ration Card)",
      "வங்கி கணக்கு புத்தகம் (Bank Passbook)",
      "கணவரின் இறப்புச் சான்றிதழ் (Husband's Death Certificate)",
      "ஆதரவற்ற விதவைச் சான்றிதழ் (Destitute Widow Certificate)"
    ],
    urls: [
      { label: "TNeGA e-Sevai Portal", url: "https://www.tnesevai.tn.gov.in/" }
    ],
    payFee: "₹60 (Govt Fee)",
    charges: "₹50 Service Charge",
    notes: "குறைந்தபட்ச வயது 18. மறுமணம் செய்யாத ஆதரவற்ற விதவைப் பெண்கள் விண்ணப்பிக்கலாம்."
  },
  {
    id: "pension-ddwps",
    name: "2.3. கணவனால் கைவிடப்பட்ட பெண்கள் ஓய்வூதியம் (Destitute Deserted Wives Pension Scheme - DDWPS)",
    category: "Pension Services",
    description: "H1: 2.3. கணவனால் கைவிடப்பட்ட பெண்கள் ஓய்வூதியம் (Deserted Wives Pension - DDWPS)\nH2: சமூகப் பாதுகாப்புத் திட்டங்கள் (Social Security Schemes)\n* விளக்கம் (Desc): கணவனால் கைவிடப்பட்டு, வாழ்வாதாரமின்றி வாழும் பெண்களுக்கு வழங்கப்படும் சமூகப் பாதுகாப்பு ஓய்வூதியம்.\n* தகுதி (Eligible): குறைந்தபட்ச வயது 30. கணவனால் கைவிடப்பட்டு தனியாகக் குறைந்தது 5 ஆண்டுகள் வாழ்ந்திருக்க வேண்டும்.\n* பயன்கள் (Benefit): மாதாந்திர நிதியுதவி மூலம் பொருளாதாரப் பாதுகாப்பு.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(TNeGA e-Sevai Portal)->https://www.tnesevai.tn.gov.in/\nசேவைக் கட்டணம்$அரசு கட்டணம் ₹60\nதகுதி வயது$குறைந்தபட்சம் 30 வயது\nபிரிந்த காலம்$குறைந்தது 5 ஆண்டுகள் பிரிந்து வாழ்ந்திருக்க வேண்டும்",
    documentRequirements: [
      "புகைப்படம் (Photo)",
      "ஆதார் அட்டை (Aadhaar Card)",
      "குடும்ப அட்டை (Ration Card)",
      "வங்கி கணக்கு புத்தகம் (Bank Passbook)",
      "கைவிடப்பட்டதற்கான சான்று (நீதிமன்ற ஆணை / VAO மற்றும் வருவாய்த்துறை சான்று)"
    ],
    urls: [
      { label: "TNeGA e-Sevai Portal", url: "https://www.tnesevai.tn.gov.in/" }
    ],
    payFee: "₹60 (Govt Fee)",
    charges: "₹50 Service Charge",
    notes: "குறைந்தபட்ச வயது 30. கணவனால் கைவிடப்பட்டு தனியாகக் குறைந்தது 5 ஆண்டுகள் வாழ்ந்திருப்பது உறுதி செய்யப்பட வேண்டும்."
  },
  {
    id: "pension-unmarried-women",
    name: "2.4. திருமணமாகாத பெண்கள் ஓய்வூதியம் (Destitute Unmarried Women Pension Scheme)",
    category: "Pension Services",
    description: "H1: 2.4. திருமணமாகாத பெண்கள் ஓய்வூதியம் (Destitute Unmarried Women Pension)\nH2: சமூகப் பாதுகாப்புத் திட்டங்கள் (Social Security Schemes)\n* விளக்கம் (Desc): வயது முதிர்ந்தும் திருமணம் ஆகாமல், ஆதரவற்ற நிலையில் வாழும் ஏழைப் பெண்களுக்கான மாதாந்திர ஓய்வூதியம்.\n* தகுதி (Eligible): வயது 50 அல்லது அதற்கு மேல் இருக்க வேண்டும். ஆதரவற்ற ஏழைப் பெண்களாக இருத்தல் அவசியம்.\n* பயன்கள் (Benefit): மாதாந்திர வாழ்வாதார நிதியுதவி நேரடியாக வங்கி கணக்கில் வரவு வைக்கப்படும்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(TNeGA e-Sevai Portal)->https://www.tnesevai.tn.gov.in/\nசேவைக் கட்டணம்$அரசு கட்டணம் ₹60\nதகுதி வயது$50 அல்லது அதற்கு மேல்\nவாழ்வாதாரம்$ஆதரவற்ற ஏழைப் பெண்கள்",
    documentRequirements: [
      "புகைப்படம் (Photo)",
      "ஆதார் அட்டை (Aadhaar Card)",
      "குடும்ப அட்டை (Ration Card)",
      "வங்கி கணக்கு புத்தகம் (Bank Passbook)",
      "திருமணமாகாதவர் சான்றிதழ் (Unmarried Certificate)"
    ],
    urls: [
      { label: "TNeGA e-Sevai Portal", url: "https://www.tnesevai.tn.gov.in/" }
    ],
    payFee: "₹60 (Govt Fee)",
    charges: "₹50 Service Charge",
    notes: "வயது 50 அல்லது அதற்கு மேல் உள்ள ஆதரவற்ற திருமணமாகாத ஏழைப் பெண்கள் விண்ணப்பிக்கலாம்."
  },
  {
    id: "pension-differently-abled",
    name: "2.5. மாற்றுத்திறனாளிகளுக்கான ஓய்வூதியம் (Differently Abled Pension Scheme)",
    category: "Pension Services",
    description: "H1: 2.5. மாற்றுத்திறனாளிகளுக்கான ஓய்வூதியம் (Differently Abled Pension Scheme)\nH2: சமூகப் பாதுகாப்புத் திட்டங்கள் (Social Security Schemes)\n* விளக்கம் (Desc): உடல் அல்லது மன ரீதியான மாற்றுத்திறனாளிகளுக்கு வழங்கப்படும் மாதாந்திர உதவித்தொகை.\n* தகுதி (Eligible): 40% அல்லது அதற்கு மேற்பட்ட ஊனம் உடைய எந்தவொரு வயதினரும்.\n* பயன்கள் (Benefit): மாதாந்திர சிறப்பு நிதியுதவி (ஊனத்தின் சதவீதத்திற்கு ஏற்ப ₹1,500 முதல் ₹2,000 வரை).\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(TNeGA e-Sevai Portal)->https://www.tnesevai.tn.gov.in/\nசேவைக் கட்டணம்$அரசு கட்டணம் ₹60\nஊனம் சதவீதம்$40% அல்லது அதற்கு மேல்\nஉதவித்தொகை$மாதம் ₹1,500 முதல் ₹2,000 வரை",
    documentRequirements: [
      "மாற்றுத்திறனாளி அடையாள அட்டை (UDID Card)",
      "புகைப்படம் (Photo)",
      "ஆதார் அட்டை (Aadhaar Card)",
      "குடும்ப அட்டை (Ration Card)",
      "வங்கி கணக்கு புத்தகம் (Bank Passbook)",
      "மருத்துவக் குழு வழங்கிய ஊனத்தின் சதவீதச் சான்று (Medical Certificate)"
    ],
    urls: [
      { label: "TNeGA e-Sevai Portal", url: "https://www.tnesevai.tn.gov.in/" }
    ],
    payFee: "₹60 (Govt Fee)",
    charges: "₹50 Service Charge",
    notes: "40% அல்லது அதற்கு மேற்பட்ட ஊனம் உடையவர்கள் மருத்துவக் குழுவின் சான்றுடன் விண்ணப்பிக்கலாம்."
  },
  {
    id: "pension-cmupt",
    name: "2.6. முதலமைச்சர் உழவர் பாதுகாப்புத் திட்டம் (Chief Minister's Uzhavar Padukappu Thittam - CMUPT)",
    category: "Pension Services",
    description: "H1: 2.6. முதலமைச்சர் உழவர் பாதுகாப்புத் திட்டம் (CM Uzhavar Padukappu Thittam)\nH2: விவசாயிகள் சமூகப் பாதுகாப்புத் திட்டம் (Farmers Social Security)\n* விளக்கம் (Desc): விவசாயத் தொழிலாளர்கள் மற்றும் சிறு விவசாயிகளின் குடும்பங்களுக்கு வழங்கப்படும் சமூகப் பாதுகாப்புத் திட்டம்.\n* தகுதி (Eligible): உழவர் பாதுகாப்புத் திட்டத்தில் பதிவு செய்துள்ள விவசாயிகள் மற்றும் விவசாயத் தொழிலாளர்கள் (வயது 18 முதல் 65 வரை).\n* பயன்கள் (Benefit): உறுப்பினர்களின் குழந்தைகளுக்குக் கல்வி/திருமண நிதியுதவி, இயற்கை மரணம் அல்லது விபத்து மரணத்திற்கு நிதியுதவி, முதியோர் ஓய்வூதியம்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(TN Revenue Department Portal)->https://www.tnesevai.tn.gov.in/\nவிண்ணப்பக் கட்டணம்$அரசு கட்டணம் ₹60\nதகுதி வயது$18 முதல் 65 வயது வரை\nமுக்கிய அட்டை$உழவர் பாதுகாப்பு அட்டை (CMUPT Card)\nபயன்கள்$கல்வி/திருமண உதவி, விபத்து நிவாரணம், ஓய்வூதியம்",
    documentRequirements: [
      "உழவர் பாதுகாப்புத் திட்ட உறுப்பினர் அட்டை (CMUPT Card)",
      "புகைப்படம் (Photo)",
      "ஆதார் அட்டை (Aadhaar Card)",
      "குடும்ப அட்டை (Ration Card)",
      "வங்கி கணக்கு புத்தகம் (Bank Passbook)",
      "திட்டத்தின் கீழ் கோரப்படும் உதவிக்கான ஆவணங்கள் (திருமணப் பத்திரிகை / கல்விச் சான்று / இறப்புச் சான்று)"
    ],
    urls: [
      { label: "TN Revenue Department Portal", url: "https://www.tnesevai.tn.gov.in/" }
    ],
    payFee: "₹60 (Govt Fee)",
    charges: "₹50 Service Charge",
    notes: "உழவர் பாதுகாப்பு அட்டை (CMUPT Card) வைத்துள்ள உறுப்பினர்கள் பல்வேறு நலத்திட்ட உதவிகளுக்கு விண்ணப்பிக்கலாம்."
  },
  {
    id: "pan-form-49a",
    name: "4.1. புதிய PAN Card விண்ணப்பம் (New PAN Card Application - Form 49A)",
    category: "PAN Card Services",
    description: "H1: 4.1. புதிய PAN Card விண்ணப்பம் (New PAN Card Application - Form 49A)\nH2: வருமான வரித் துறை & Protean / UTIITSL சேவைகள்\n* விளக்கம் (Desc): வருமான வரித் துறையிடமிருந்து புதிய நிரந்தரக் கணக்கு எண் (PAN) அட்டை பெறுதல்.\n* தகுதி (Eligible): 18 வயது நிரம்பியவர்கள் அல்லது மைனர் (பெற்றோர் / பாதுகாவலருடன்).\n* பயன்கள் (Benefit): வருமான வரித் தாக்கல் செய்ய, ₹50,000-க்கு மேல் வங்கி பரிவர்த்தனை செய்ய, புதிய வங்கி கணக்கு மற்றும் லோன் பெற கட்டாயம் தேவை.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Protean / NSDL)$*LINK(Protean PAN Portal)->https://www.onlineservices.nsdl.com/\nஇணைய இணைப்பு (UTIITSL)$*LINK(UTIITSL PAN Portal)->https://www.utiitsl.com/\nகட்டணம் (இந்திய முகவரிக்கு)$₹107 (Physical PAN Card)\nகட்டணம் (e-PAN மட்டும்)$₹72 (டிஜிட்டல் மின்னணு பான் அட்டை)\nவிண்ணப்ப முறை$e-KYC (ஆதார் OTP வழி) அல்லது ஆப்லைன்",
    documentRequirements: [
      "ஆதார் அட்டை (கட்டாயம் மொபைல் எண் இணைக்கப்பட்டிருக்க வேண்டும் - e-KYC செய்ய)",
      "இரண்டு பாஸ்போர்ட் அளவு புகைப்படங்கள் (ஆப்லைன் விண்ணப்பத்திற்கு)",
      "முகவரி & பிறந்த தேதி சான்று (ஆதார் அட்டை போதுமானது)"
    ],
    urls: [
      { label: "Protean / NSDL PAN Portal", url: "https://www.onlineservices.nsdl.com/" },
      { label: "UTIITSL PAN Portal", url: "https://www.utiitsl.com/" }
    ],
    payFee: "₹107 (Physical) / ₹72 (e-PAN)",
    charges: "₹50 Service Charge",
    notes: "ஆதார் அட்டையுடன் மொபைல் எண் இணைக்கப்பட்டிருந்தால் e-KYC மூலம் பேப்பர்லெஸ் முறையில் எளிதாக விண்ணப்பிக்கலாம். 18 வயது நிரம்பியவர்கள் மற்றும் மைனர்கள் (பெற்றோர் வழிகாட்டுதலுடன்) விண்ணப்பிக்கலாம்."
  },
  {
    id: "pan-correction-csf",
    name: "4.2. PAN Card திருத்தம் (PAN Card Correction - CSF Form)",
    category: "PAN Card Services",
    description: "H1: 4.2. PAN Card திருத்தம் (PAN Card Correction - CSF Form)\nH2: வருமான வரித் துறை & Protean / UTIITSL சேவைகள்\n* விளக்கம் (Desc): பான் கார்டில் உள்ள தவறான பெயர், தந்தையின் பெயர், பிறந்த தேதி அல்லது புகைப்படத்தை மாற்றுதல்.\n* தகுதி (Eligible): பான் கார்டில் பிழைகள் உள்ள அல்லது திருத்தம் செய்ய விரும்பும் அனைவரும்.\n* பயன்கள் (Benefit): பான் மற்றும் ஆதார் தடையின்றி இணைவதற்கும் (PAN-Aadhaar Linking) வங்கி ஆவணங்கள் சரியாக இருப்பதற்கும் உதவும்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Protean Correction)$*LINK(Protean PAN Correction)->https://www.onlineservices.nsdl.com/\nஇணைய இணைப்பு (UTIITSL Correction)$*LINK(UTIITSL Portal)->https://www.utiitsl.com/\nவிண்ணப்பக் கட்டணம்$₹107 (அரசு கட்டணம்)\nமுக்கிய பலன்$PAN-Aadhaar Linking தடையின்றி முடிவடைய உதவும்\nதேவையான முக்கிய ஆவணம்$தற்போதுள்ள பான் கார்டு நகல் & சரியான ஆதார் அட்டை",
    documentRequirements: [
      "தற்போதுள்ள பான் கார்டு நகல் (Existing PAN Card Copy)",
      "சரியான விவரங்கள் கொண்ட ஆதார் அட்டை (Correct Aadhaar Card)",
      "பெயர் மாற்றத்திற்கு தகுந்த அரசு ஆவணம் (Gazette notification / Marriage certificate - தேவைப்படின்)",
      "இரண்டு பாஸ்போர்ட் அளவு புகைப்படங்கள் (Passport Photos)"
    ],
    urls: [
      { label: "Protean PAN Correction", url: "https://www.onlineservices.nsdl.com/" },
      { label: "UTIITSL PAN Portal", url: "https://www.utiitsl.com/" }
    ],
    payFee: "₹107 (Govt Fee)",
    charges: "₹50 Service Charge",
    notes: "பான் கார்டில் பெயர், பிறந்த தேதி, தந்தை பெயர் அல்லது புகைப்படம் திருத்தம் செய்ய CSF படிவம் பயன்படுத்தப்படுகிறது. ஆதார்-பான் இணைப்புக்கு இரண்டு ஆவணங்களிலும் பெயர் மற்றும் பிறந்த தேதி சரியாக பொருந்த வேண்டும்."
  },
  {
    id: "transport-dl-new",
    name: "5.1. Driving Licence விண்ணப்பம் (LLR & New DL)",
    category: "Vehicle & Transport Services",
    description: "H1: 5.1. Driving Licence விண்ணப்பம் (LLR & New DL)\nH2: பரிவாஹன் சாரதி - ஓட்டுநர் உரிமம் சேவைகள் (MoRTH Sarathi)\n* விளக்கம் (Desc): பழகுநர் உரிமம் (LLR) மற்றும் நிரந்தர ஓட்டுநர் உரிமம் (DL) பெற விண்ணப்பித்தல்.\n* தகுதி (Eligible): 18 வயது பூர்த்தியடைந்தவர்கள் (50cc-க்குட்பட்ட கியர் இல்லாத வாகனத்திற்கு 16 வயது).\n* பயன்கள் (Benefit): சட்டப்பூர்வமாக இந்தியாவில் இருசக்கர மற்றும் நான்கு சக்கர வாகனங்களை ஓட்ட தகுதி பெறலாம்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Sarathi Portal)$*LINK(Parivahan Sarathi Portal)->https://sarathi.parivahan.gov.in/\nவிண்ணப்பக் கட்டணம்$LLR-க்கு சுமார் ₹230+; ஓட்டுநர் உரிமத்திற்கு வாகன வகையைப் பொறுத்து மாறும்\nதகுதி வயது$18 வயது பூர்த்தி (கியர் இல்லாத 50cc வாகனத்திற்கு 16 வயது)\nமுக்கிய ஆவணம்$ஆதார் அட்டை, கையொப்பம் & Form 1A மருத்துவச் சான்று",
    documentRequirements: [
      "ஆதார் அட்டை (வயது மற்றும் முகவரிச் சான்றாக)",
      "புகைப்படம் மற்றும் கையொப்பம் (Photo & Signature)",
      "மருத்துவச் சான்றிதழ் (Form 1A - 40 வயதுக்கு மேற்பட்டவர்கள் / வணிக வாகனங்களுக்கு)",
      "இரத்தப் பிரிவு அறிக்கை (Blood Group Report)"
    ],
    urls: [
      { label: "Parivahan Sarathi Portal", url: "https://sarathi.parivahan.gov.in/" },
      { label: "Parivahan Sewa Home", url: "https://parivahan.gov.in/" }
    ],
    payFee: "LLR ₹230+ / DL அரசு கட்டணம் வாகன வகையைப் பொறுத்து மாறும்",
    charges: "₹100 Service Charge",
    notes: "ஆதார் e-KYC மூலம் LLR தேர்வு ஆன்லைனில் வீட்டிலிருந்தே எழுதலாம். நிரந்தர DL பெற RTO அலுவலகத்தில் டிரைவிங் டெஸ்ட் கொடுக்க வேண்டும்."
  },
  {
    id: "transport-dl-renewal-correction",
    name: "5.2. Driving Licence Renewal / Correction (உரிமம் புதுப்பித்தல் / திருத்தம்)",
    category: "Vehicle & Transport Services",
    description: "H1: 5.2. Driving Licence Renewal / Correction (உரிமம் புதுப்பித்தல் / திருத்தம்)\nH2: பரிவாஹன் சாரதி - ஓட்டுநர் உரிமம் சேவைகள் (MoRTH Sarathi)\n* விளக்கம் (Desc): ஓட்டுநர் உரிமத்தின் காலாவதி தேதியை நீட்டித்தல் அல்லது முகவரி/பெயர் திருத்தம் செய்தல்.\n* தகுதி (Eligible): உரிமம் காலாவதியாகும் நிலையில் உள்ளவர்கள் அல்லது திருத்தம் தேவைப்படுவோர்.\n* பயன்கள் (Benefit): உரிமம் ரத்தாகாமல் தொடர்ந்து வாகனங்களை இயக்கலாம் மற்றும் அபராதங்களை தவிர்க்கலாம்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Sarathi Portal)$*LINK(Parivahan Sarathi Portal)->https://sarathi.parivahan.gov.in/\nகட்டணம்$காலாவதியாகி புதுப்பிக்கும் காலத்தைப் பொறுத்து அரசு கட்டணம் + தாமத அபராதம்\nதேவையான முக்கிய ஆவணம்$அசல் ஓட்டுநர் உரிமம் (Original DL) & ஆதார் அட்டை\nமருத்துவச் சான்றிதழ்$Form 1A (40 வயதுக்கு மேற்பட்டவர்கள் அல்லது Transport வாகனங்களுக்கு)",
    documentRequirements: [
      "அசல் ஓட்டுநர் உரிமம் (Original DL)",
      "ஆதார் அட்டை (Aadhaar Card)",
      "மருத்துவச் சான்றிதழ் (Form 1A - தேவைப்படின்)",
      "பாஸ்போர்ட் அளவு புகைப்படம் (Passport Photo)"
    ],
    urls: [
      { label: "Sarathi DL Portal", url: "https://sarathi.parivahan.gov.in/" },
      { label: "DL Services Online", url: "https://sarathi.parivahan.gov.in/sarathiservice/dlServicesDet.do" }
    ],
    payFee: "அரசு கட்டணம் + தாமத அபராதம் (காலத்தைப் பொறுத்து மாறும்)",
    charges: "₹100 Service Charge",
    notes: "உரிமம் காலாவதியாவதற்கு 1 வருடம் முன்பே புதுப்பிக்கலாம். காலாவதியாகி 1 ஆண்டுக்கு மேல் தாமதமானால் அபராதத்துடன் மறுதேர்வு எழுத நேரிடலாம்."
  },
  {
    id: "transport-vehicle-insurance",
    name: "5.3. Vehicle Insurance (வாகனக் காப்பீடு)",
    category: "Vehicle & Transport Services",
    description: "H1: 5.3. Vehicle Insurance (வாகனக் காப்பீடு)\nH2: IRDAI அங்கீகரிக்கப்பட்ட காப்பீட்டுத் தளங்கள் (General Insurance)\n* விளக்கம் (Desc): இருசக்கர வாகனம் அல்லது நான்கு சக்கர வாகனங்களுக்கு ஆன்லைனில் காப்பீடு (Insurance) செய்தல் அல்லது புதுப்பித்தல்.\n* தகுதி (Eligible): அனைத்து இருசக்கர, நான்கு சக்கர மற்றும் வணிக வாகன உரிமையாளர்கள்.\n* பயன்கள் (Benefit): விபத்து கால இழப்பீடு, மூன்றாம் நபர் சேதப் பாதுகாப்பு (Third Party Insurance), மற்றும் போக்குவரத்து போலீஸ் அபராதத்திலிருந்து தப்பித்தல்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (IRDAI Portal)$*LINK(IRDAI Official Portal)->https://www.irda.gov.in/\nஇணைய இணைப்பு (PolicyBazaar)$*LINK(PolicyBazaar Vehicle Insurance)->https://www.policybazaar.com/\nகட்டணம் / பிரீமியம்$வாகனத்தின் CC, வகை மற்றும் மாடலைப் பொறுத்து மாறும்\nமுக்கிய நன்மை$Third Party சேதப் பாதுகாப்பு மற்றும் ₹2,000+ RTO அபராதத் தவிர்ப்பு",
    documentRequirements: [
      "வாகனப் பதிவுப் புத்தகம் (RC Book நகல்)",
      "பழைய இன்சூரன்ஸ் பாலிசி நகல் (இருந்தால் - Previous Policy Copy)",
      "வாகன உரிமையாளர் ஆதார் / PAN நகல்"
    ],
    urls: [
      { label: "IRDAI Portal", url: "https://www.irda.gov.in/" },
      { label: "Vahan Insurance Check", url: "https://vahan.parivahan.gov.in/" },
      { label: "PolicyBazaar Insurance", url: "https://www.policybazaar.com/" }
    ],
    payFee: "வாகனத்தின் CC மற்றும் மாடலைப் பொறுத்து பிரீமியம் கணக்கிடப்படும்",
    charges: "₹50 Service Charge",
    notes: "வாகனங்களுக்கு குறைந்தபட்சம் மூன்றாம் நபர் காப்பீடு (Third Party Insurance) இருப்பது சட்டப்படி கட்டாயமாகும். Comprehensive பாலிசி சொந்த வாகன சேதத்திற்கும் இழப்பீடு தரும்."
  },
  {
    id: "transport-ticket-booking",
    name: "5.4. Bus / Train / Flight Ticket Booking (பயணச் சீட்டு முன்பதிவு)",
    category: "Vehicle & Transport Services",
    description: "H1: 5.4. Bus / Train / Flight Ticket Booking (பயணச் சீட்டு முன்பதிவு)\nH2: இரயில், பேருந்து மற்றும் விமான முன்பதிவு தளங்கள் (Travel Bookings)\n* விளக்கம் (Desc): பேருந்து, இரயில் மற்றும் விமானப் பயணங்களுக்கான டிக்கெட்டுகளை ஆன்லைனில் முன்பதிவு செய்தல்.\n* தகுதி (Eligible): பயணம் செய்ய விரும்பும் அனைத்துப் பொதுமக்கள்.\n* பயன்கள் (Benefit): வரிசையில் நிற்காமல், தங்கு தடையின்றி இருக்கைகளை உறுதி செய்து எளிதாகப் பயணிக்கலாம்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (IRCTC இரயில்)$*LINK(IRCTC Next Gen Portal)->https://www.irctc.co.in/\nஇணைய இணைப்பு (TNSTC அரசு பேருந்து)$*LINK(TNSTC Official Booking)->https://www.tnstc.in/\nஇணைய இணைப்பு (RedBus தனியார் பேருந்து)$*LINK(RedBus Booking Portal)->https://www.redbus.in/\nடிக்கெட் கட்டணம்$பயண தூரம், வகுப்பு (Sleeper/AC) மற்றும் தேதிக்கு ஏற்ப நிர்ணயிக்கப்படும்",
    documentRequirements: [
      "பயணிகளின் விவரங்கள் (பெயர், வயது, பாலினம், பெர்த் விருப்பம்)",
      "ஆதார் / வாக்காளர் அடையாள அட்டை நகல்",
      "தொடர்பு மொபைல் எண் (SMS டிக்கெட் பெற)"
    ],
    urls: [
      { label: "IRCTC Train Booking", url: "https://www.irctc.co.in/" },
      { label: "TNSTC Bus Booking", url: "https://www.tnstc.in/" },
      { label: "RedBus Online", url: "https://www.redbus.in/" }
    ],
    payFee: "டிக்கெட் கட்டணம் + IRCTC/போர்டல் கட்டணம்",
    charges: "₹30 - ₹50 Service Charge",
    notes: "IRCTC தட்கல் (Tatkal) முன்பதிவு AC வகுப்பிற்கு காலை 10:00 மணிக்கும், நான்-ஏசி (Sleeper) வகுப்பிற்கு காலை 11:00 மணிக்கும் துவங்கும்."
  },
  {
    id: "land-view-patta-chitta",
    name: "1. பட்டா / சிட்டா பார்வையிடுதல் & பதிவிறக்கம் (View Patta / Chitta)",
    category: "Land & Property Services",
    description: "H1: 1. பட்டா / சிட்டா பார்வையிடுதல் & பதிவிறக்கம் (View Patta / Chitta)\nH2: தமிழ்நாடு நில நிர்வாகத் துறை (Anytime Anywhere e-Services)\n* விளக்கம் (Desc): ஒரு குறிப்பிட்ட நிலத்தின் தற்போதைய சட்டப்பூர்வ உரிமையாளர் யார் (பட்டா) மற்றும் நிலத்தின் வகைப்பாடு (நஞ்சை/புஞ்சை/நத்தம்), பரப்பளவு, அரசு தீர்வை (சிட்டா) ஆகிய விவரங்களை ஆன்லைனில் சரிபார்த்து அதிகாரப்பூர்வ நகலை பதிவிறக்கம் செய்யும் சேவை.\n* தகுதி (Eligible): நிலத்தின் சர்வே எண் அல்லது பட்டா எண் தெரிந்த பொதுமக்கள் மற்றும் நில உரிமையாளர்கள்.\n* பயன்கள் (Benefit): நிலத்தின் தற்போதைய உரிமை நிலை மற்றும் பரப்பளவை உடனடியாக அறியலாம்; வங்கி கடன், நிலம் வாங்குதல் மற்றும் விற்பனைக்கு முதன்மை ஆவணமாகப் பயன்படுகிறது.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(e-Services Patta/Chitta)->https://eservices.tn.gov.in/eservicesnew/land/chitta.html\nஅரசு கட்டணம்$முற்றிலும் இலவசம் (Free)\nதேவைப்படும் விவரங்கள்$மாவட்டம், வட்டம், கிராமம், சர்வே / உட்பிரிவு எண் அல்லது பட்டா எண்\nபதிவிறக்க ஆவணம்$அரசு முத்திரையிடப்பட்ட டிஜிட்டல் பட்டா / சிட்டா நகல்",
    documentRequirements: [
      "ஆவணங்கள் எதுவும் தேவையில்லை (மாவட்டம், வட்டம், கிராமம், சர்வே/உட்பிரிவு எண் அல்லது பட்டா எண் மட்டும் தேவை)"
    ],
    urls: [
      { label: "TN e-Services Patta/Chitta", url: "https://eservices.tn.gov.in/eservicesnew/land/chitta.html" },
      { label: "e-Services Portal Home", url: "https://eservices.tn.gov.in/" }
    ],
    payFee: "முற்றிலும் இலவசம் (Free)",
    charges: "₹30 Service Charge",
    notes: "நிலத்தின் சர்வே எண் மற்றும் உட்பிரிவு எண் கொண்டு ஆன்லைனில் 24/7 இலவசமாக பட்டா மற்றும் சிட்டா பதிவிறக்கம் செய்து கொள்ளலாம்."
  },
  {
    id: "land-fmb-sketch",
    name: "2. புல வரைபடம் / எப்.எம்.பி பதிவிறக்கம் (FMB Sketch Download)",
    category: "Land & Property Services",
    description: "H1: 2. புல வரைபடம் / எப்.எம்.பி பதிவிறக்கம் (FMB Sketch Download)\nH2: தமிழ்நாடு நில அளவை மற்றும் நிலவரித் திட்டம் (Survey and Settlement)\n* விளக்கம் (Desc): குறிப்பிட்ட சர்வே எண்ணின் எல்லைக் கோடுகள், முக்கோண அளவீடுகள் (Measurements), வழிப்பாதை மற்றும் சுற்றியுள்ள நிலங்களின் அமைப்பைக் காட்டும் அரசு நில அளவை வரைபடம்.\n* தகுதி (Eligible): சர்வே எண் விவரம் அறிந்த பொதுமக்கள் மற்றும் நில உரிமையாளர்கள்.\n* பயன்கள் (Benefit): நிலத்தின் சரியான எல்லைகளைக் கண்டறியவும், சர்வேயர் அளவீடு செய்து எல்லைக்கல் நடுவதற்கும், அண்டை நிலத்துடனான எல்லைத் தகராறுகளைத் தீர்க்கவும் பயன்படுகிறது.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(FMB Sketch Portal)->https://eservices.tn.gov.in/eservicesnew/land/fmb.html\nஅரசு கட்டணம்$முற்றிலும் இலவசம் (Free)\nதேவைப்படும் விவரங்கள்$மாவட்டம், வட்டம், கிராமம், சர்வே எண் & உட்பிரிவு எண்\nமுக்கிய பயன்$நில எல்லைகள், முக்கோண அளவீடுகள் மற்றும் வழிப்பாதை சரிபார்ப்பு",
    documentRequirements: [
      "ஆவணங்கள் தேவையில்லை (மாவட்டம், வட்டம், கிராமம், சர்வே எண் மற்றும் உட்பிரிவு எண் போதுமானது)"
    ],
    urls: [
      { label: "FMB Sketch Download", url: "https://eservices.tn.gov.in/eservicesnew/land/fmb.html" },
      { label: "TN e-Services Home", url: "https://eservices.tn.gov.in/" }
    ],
    payFee: "முற்றிலும் இலவசம் (Free)",
    charges: "₹30 Service Charge",
    notes: "புல வரைபடம் (FMB) மூலம் சர்வே எண்ணின் வடிவம் மற்றும் துல்லியமான அளவீடுகளை சரிபார்க்கலாம்."
  },
  {
    id: "land-patta-transfer-full",
    name: "3. பட்டா மாறுதல் - உட்பிரிவு இல்லாதது (Patta Transfer - Full Field)",
    category: "Land & Property Services",
    description: "H1: 3. பட்டா மாறுதல் - உட்பிரிவு இல்லாதது (Patta Transfer - Full Field)\nH2: தமிழ்நாடு வருவாய்த் துறை (Tamil Nadu Revenue Department)\n* விளக்கம் (Desc): ஒரு முழு சர்வே எண்ணும் விற்பனை செய்யப்பட்டாலோ அல்லது வாரிசுரிமை மூலம் கைமாறும் போதோ, புதிய உரிமையாளரின் பெயருக்கு பட்டா மாற்றம் செய்யும் சேவை.\n* தகுதி (Eligible): முழு சர்வே எண்ணையும் வாங்கிய புதிய உரிமையாளர் அல்லது சட்டப்பூர்வ வாரிசுகள்.\n* பயன்கள் (Benefit): வருவாய்த்துறை ஆவணங்களில் உங்கள் பெயர் நேரடியாகப் பதிவாகும்; நிலத்தின் மீது முழு சட்டப்பூர்வ உரிமை உறுதி செய்யப்பட்டு அரசு நலத்திட்டங்கள் மற்றும் இழப்பீடுகள் பெற வழிவகுக்கும்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(Patta Transfer Portal)->https://eservices.tn.gov.in/\nஇணைய இணைப்பு (Tamil Nilam)$*LINK(Tamil Nilam Citizen Portal)->https://tamilnilam.tn.gov.in/citizen/\nஅரசு கட்டணம்$₹60 (அரசு கட்டணம்)\nமுக்கிய ஆவணங்கள்$கிரயப் பத்திரம், தாய் பத்திரம், முந்தைய பட்டா, EC & ஆதார்\nசெயல்முறை$உட்பிரிவு இல்லாததால் வட்டாட்சியர் ஒப்புதல் மூலம் விரைவாக பெயர் மாறும்",
    documentRequirements: [
      "பதிவு செய்யப்பட்ட கிரயப் பத்திரம் / ஆவணம் (Registered Sale Deed)",
      "முந்தைய பட்டா நகல் (Previous Patta Copy)",
      "தாய் பத்திரம் (Parent Document)",
      "வில்லங்கச் சான்றிதழ் (Encumbrance Certificate - EC)",
      "விண்ணப்பதாரரின் ஆதார் அட்டை நகல் (Aadhaar Card)"
    ],
    urls: [
      { label: "e-Services Patta Transfer", url: "https://eservices.tn.gov.in/" },
      { label: "Tamil Nilam Citizen Portal", url: "https://tamilnilam.tn.gov.in/citizen/" }
    ],
    payFee: "₹60 (Govt Fee)",
    charges: "₹100 Service Charge",
    notes: "முழு சர்வே எண்ணும் கைமாறும்போது உட்பிரிவு தேவைப்படாது. VAO, RI மற்றும் தலைமையிடத்து துணை வட்டாட்சியர் சரிபார்ப்பிற்குப் பின் புதிய பட்டா வழங்கப்படும்."
  },
  {
    id: "land-patta-transfer-subdivision",
    name: "4. பட்டா மாறுதல் - உட்பிரிவு உள்ளது (Patta Transfer - Sub-Division)",
    category: "Land & Property Services",
    description: "H1: 4. பட்டா மாறுதல் - உட்பிரிவு உள்ளது (Patta Transfer - Sub-Division)\nH2: தமிழ்நாடு வருவாய்த் துறை & நில அளவைத் துறை (Revenue & Survey)\n* விளக்கம் (Desc): ஒரு பெரிய நிலத்தில் அல்லது சர்வே எண்ணில் குறிப்பிட்ட சென்ட் / சதுர அடி மட்டும் விற்கப்படும்போது, நில அளவையர் நேரில் வந்து அளந்து, புதிய உட்பிரிவு எண் (Sub-division) ஒதுக்கி பெயர் மாற்றம் செய்யும் சேவை.\n* தகுதி (Eligible): ஒரு சர்வே எண்ணில் குறிப்பிட்ட பகுதியை மட்டும் வாங்கிய உரிமையாளர்கள்.\n* பயன்கள் (Benefit): வாங்கிய குறிப்பிட்ட மனையின் அளவுக்கு தனி சர்வே உட்பிரிவு எண் ஒதுக்கப்பட்டு தனி பட்டா கிடைக்கும்; எதிர்காலத்தில் ஏற்படும் எல்லைக் குழப்பங்கள் மற்றும் கூட்டுப் பட்டா சிக்கல்கள் முழுமையாகத் தவிர்க்கப்படும்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Tamil Nilam)$*LINK(Tamil Nilam Portal)->https://tamilnilam.tn.gov.in/citizen/\nஇணைய இணைப்பு (e-Services)$*LINK(TN e-Services)->https://eservices.tn.gov.in/\nஅரசு கட்டணம்$₹460 முதல் ₹800 வரை (நிலத்தின் வகைப்பாடு மற்றும் அளவைப் பொறுத்து மாறுபடும்)\nகள ஆய்வு$நில அளவையர் (Firka Surveyor) நேரில் ஆய்வு செய்து உட்பிரிவு செய்வார்\nமுக்கிய ஆவணங்கள்$கிரயப் பத்திரம், தாய் பத்திரம், மனை எல்லை வரைபடம், EC & ஆதார்",
    documentRequirements: [
      "பதிவு செய்யப்பட்ட கிரயப் பத்திரம் (Sale Deed)",
      "தாய் பத்திரம் (Parent Document)",
      "வில்லங்கச் சான்றிதழ் (EC)",
      "சொத்தின் வரைபடம் / மனை எல்லை விவரம் (Sketch / Layout Plan)",
      "விண்ணப்பதாரரின் ஆதார் அட்டை (Aadhaar Card)"
    ],
    urls: [
      { label: "Tamil Nilam Citizen Portal", url: "https://tamilnilam.tn.gov.in/citizen/" },
      { label: "TN e-Services Home", url: "https://eservices.tn.gov.in/" }
    ],
    payFee: "₹460 - ₹800 (உட்பிரிவுக் கட்டணம்)",
    charges: "₹150 Service Charge",
    notes: "நில அளவையர் (Surveyor) நேரில் வந்து நிலத்தை அளந்து உட்பிரிவு செய்த பிறகு தனி பட்டா எண் வழங்கப்படும்."
  },
  {
    id: "land-encumbrance-certificate-ec",
    name: "5. வில்லங்கச் சான்றிதழ் (Encumbrance Certificate - EC)",
    category: "Land & Property Services",
    description: "H1: 5. வில்லங்கச் சான்றிதழ் (Encumbrance Certificate - EC)\nH2: தமிழ்நாடு பதிவுத் துறை (Inspector General of Registration - TNReginet)\n* விளக்கம் (Desc): ஒரு குறிப்பிட்ட சொத்தின் மீது முந்தைய ஆண்டுகளில் பதிவு செய்யப்பட்ட விற்பனை, வங்கி அடமானம், குத்தகை, பாகப்பிரிவினை அல்லது நீதிமன்ற வழக்கு உத்தரவுகள் போன்ற வில்லங்கப் பரிவர்த்தனைகள் உள்ளதா என்பதைக் காட்டும் பதிவுத்துறை ஆவணம்.\n* தகுதி (Eligible): சொத்து வாங்குபவர்கள், விற்பவர்கள், உரிமையாளர்கள் மற்றும் பொதுமக்கள்.\n* பயன்கள் (Benefit): சொத்து வாங்குவதற்கு முன் அதன் மீது அடமானம் அல்லது சட்டரீதியான சிக்கல்கள் இல்லை என்பதை உறுதிப்படுத்தலாம்; வங்கி கடன் பெறவும், சொத்து விற்கவும் கட்டாய ஆவணமாகும்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (TNReginet EC)$*LINK(TNReginet EC Portal)->https://tnreginet.gov.in/portal/\nஇணையத்தில் பார்க்க$இலவசம் (View EC Free)\nடிஜிட்டல் கையொப்பமிட்ட நகல்$₹1 முதல் ₹100 வரை (தேடப்படும் ஆண்டுகளின் எண்ணிக்கைக்கு ஏற்ப)\nதேவைப்படும் விவரங்கள்$மண்டலம், மாவட்டம், சார்பதிவாளர் அலுவலகம், கிராமம் & சர்வே எண்",
    documentRequirements: [
      "ஆன்லைனில் பார்க்க: ஆவணங்கள் தேவையில்லை (சார்பதிவாளர் அலுவலகம், கிராமம், சர்வே எண் / மனை எண், காலம் போதுமானது)",
      "டிஜிட்டல் கையொப்பமிட்ட நகல் பெற: விண்ணப்பதாரரின் ஆதார் அட்டை விவரங்கள்"
    ],
    urls: [
      { label: "TNReginet Portal", url: "https://tnreginet.gov.in/portal/" },
      { label: "Search EC Online", url: "https://tnreginet.gov.in/portal/webHP?requestType=ApplicationRH&actionVal=viewEC&screenId=114" }
    ],
    payFee: "பார்வையிட இலவசம் / சான்றளிக்கப்பட்ட நகலுக்கு ₹1 - ₹100",
    charges: "₹30 - ₹50 Service Charge",
    notes: "குறைந்தது கடந்த 30 ஆண்டுகளுக்கான வில்லங்கச் சான்றிதழைப் பார்த்து வாங்குவது சொத்து பரிவர்த்தனைகளில் மிகவும் பாதுகாப்பானது."
  },
  {
    id: "land-certified-copy-cc",
    name: "6. சான்றளிக்கப்பட்ட பத்திர நகல் (Certified Copy - CC)",
    category: "Land & Property Services",
    description: "H1: 6. சான்றளிக்கப்பட்ட பத்திர நகல் (Certified Copy - CC)\nH2: தமிழ்நாடு பதிவுத் துறை (Inspector General of Registration - TNReginet)\n* விளக்கம் (Desc): சார்பதிவாளர் அலுவலகத்தில் பதிவு செய்யப்பட்ட அசல் பத்திரம் தொலைந்துவிட்டாலோ அல்லது சட்டரீதியான பயன்பாட்டிற்கோ அரசு சான்றளித்த அதிகாரப்பூர்வ நகலை (CC) பெறும் சேவை.\n* தகுதி (Eligible): பத்திரம் உரிமையாளர்கள் அல்லது சட்டப்பூர்வ ஆர்வமுள்ள பொதுமக்கள்.\n* பயன்கள் (Benefit): அசல் பத்திரம் தொலைந்தாலோ அல்லது பத்திரம் பிறரிடம் இருக்கும்போதோ, நீதிமன்ற வழக்குகள், சொத்து சரிபார்ப்பு மற்றும் வங்கி கடன்களுக்கு அசல் பத்திரத்திற்கு இணையான சட்ட மதிப்புடன் இதைப் பயன்படுத்தலாம்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (TNReginet CC)$*LINK(TNReginet CC Portal)->https://tnreginet.gov.in/portal/\nகட்டணம்$பக்கங்களின் எண்ணிக்கைக்கு ஏற்ப அரசு கட்டணம் வசூலிக்கப்படும் (சுமார் ₹100 முதல் ₹300 வரை)\nதேவைப்படும் விவரங்கள்$பத்திரம் எண் (Doc No), பதிவு செய்த ஆண்டு மற்றும் சார்பதிவாளர் அலுவலகப் பெயர்\nசட்ட மதிப்பு$அசல் பத்திரத்திற்கு இணையான சட்டபூர்வ அங்கீகாரம் பெற்றது",
    documentRequirements: [
      "பத்திரம் எண் (Document Number), பதிவு செய்த ஆண்டு மற்றும் சார்பதிவாளர் அலுவலகப் பெயர்",
      "விண்ணப்பதாரரின் அடையாளச் சான்று (ஆதார் அட்டை)"
    ],
    urls: [
      { label: "TNReginet CC Portal", url: "https://tnreginet.gov.in/portal/" },
      { label: "Search Certified Copy", url: "https://tnreginet.gov.in/portal/webHP?requestType=ApplicationRH&actionVal=viewCC&screenId=115" }
    ],
    payFee: "சுமார் ₹100 - ₹300 (பக்கங்களின் எண்ணிக்கைக்கு ஏற்ப)",
    charges: "₹50 Service Charge",
    notes: "சார்பதிவாளர் அலுவலகத்திற்கு செல்லாமலேயே டிஜிட்டல் கையொப்பமிட்ட சான்றளிக்கப்பட்ட பத்திர நகலை ஆன்லைனில் பதிவிறக்கம் செய்யலாம்."
  },
  {
    id: "land-guideline-value-search",
    name: "7. நில வழிகாட்டி மதிப்பு சரிபார்த்தல் (Guideline Value Search)",
    category: "Land & Property Services",
    description: "H1: 7. நில வழிகாட்டி மதிப்பு சரிபார்த்தல் (Guideline Value Search)\nH2: தமிழ்நாடு பதிவுத் துறை (Inspector General of Registration - TNReginet)\n* விளக்கம் (Desc): ஒரு குறிப்பிட்ட பகுதியில் உள்ள சர்வே எண் அல்லது தெருவிற்கு அரசு நிர்ணயித்துள்ள குறைந்தபட்ச சந்தை வழிகாட்டி மதிப்பை (Guideline Value) ஆன்லைனில் அறியும் சேவை.\n* தகுதி (Eligible): நிலம் வாங்குபவர்கள், விற்பவர்கள், பத்திர எழுத்தாளர்கள் மற்றும் பொதுமக்கள்.\n* பயன்கள் (Benefit): சொத்தை வாங்கும் போதும் விற்கும் போதும் செலுத்த வேண்டிய முத்திரைத் தீர்வை (Stamp Duty) மற்றும் பதிவுக் கட்டணத்தை முன்கூட்டியே துல்லியமாகக் கணக்கிடலாம்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Guideline Search)$*LINK(TNReginet Guideline Value)->https://tnreginet.gov.in/portal/\nகட்டணம்$முற்றிலும் இலவசம் (Free)\nதேவைப்படும் விவரங்கள்$மண்டலம், மாவட்டம், சார்பதிவாளர் அலுவலகம், கிராமம், சர்வே எண் / தெரு பெயர்\nபயன்$முத்திரைத் தீர்வை மற்றும் பதிவுக் கட்டணத்தை முன்கூட்டியே கணக்கிடுதல்",
    documentRequirements: [
      "எந்த ஆவணமும் தேவையில்லை (மண்டலம், மாவட்டம், சார்பதிவாளர் அலுவலகம், கிராமம், சர்வே எண் அல்லது தெரு பெயர் போதுமானது)"
    ],
    urls: [
      { label: "TNReginet Guideline Search", url: "https://tnreginet.gov.in/portal/" },
      { label: "Guideline Value Portal", url: "https://tnreginet.gov.in/portal/webHP?requestType=ApplicationRH&actionVal=guidelineValuation&screenId=116" }
    ],
    payFee: "முற்றிலும் இலவசம் (Free)",
    charges: "₹30 Service Charge",
    notes: "தமிழக அரசு நிர்ணயித்துள்ள நில வழிகாட்டி மதிப்பு அடிப்படையில் தான் பத்திரப் பதிவுக்கான முத்திரைத் தீர்வை கணக்கிடப்படுகிறது."
  },
  {
    id: "land-property-tax-mutation-payment",
    name: "8. சொத்து வரி பெயர் மாற்றம் & செலுத்துதல் (Property Tax Mutation & Payment)",
    category: "Land & Property Services",
    description: "H1: 8. சொத்து வரி பெயர் மாற்றம் & செலுத்துதல் (Property Tax Mutation & Payment)\nH2: தமிழ்நாடு நகராட்சி நிர்வாகம் மற்றும் குடிநீர் வழங்கல் துறை (TN Urban E-Pay)\n* விளக்கம் (Desc): நகராட்சி, மாநகராட்சி அல்லது பேரூராட்சி பதிவேடுகளில் உள்ள முந்தைய உரிமையாளர் பெயரை மாற்றி, சொத்து வரியை ஆன்லைனில் செலுத்தும் சேவை.\n* தகுதி (Eligible): புதிய சொத்து உரிமையாளர்கள் மற்றும் நகர்ப்புற நில/கட்டட உரிமையாளர்கள்.\n* பயன்கள் (Benefit): உள்ளாட்சி அமைப்பில் சட்டப்பூர்வ சொத்து உரிமையாளராக பதிவு செய்யப்படுவீர்கள்; புதிய மின்சார இணைப்பு, குடிநீர்-கழிவுநீர் இணைப்பு மற்றும் உள்ளாட்சி திட்டங்களைப் பெற இந்த வரி ரசீது முக்கிய சான்றாகும்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (TN Urban E-Pay)$*LINK(TN Urban E-Pay Portal)->https://tnurbanepay.tn.gov.in/\nஇணைய இணைப்பு (சென்னை மாநகராட்சி)$*LINK(Chennai Corporation Portal)->https://chennaicorporation.gov.in/\nவரி செலுத்துதல்$சொத்து வரி மதிப்பீட்டுத் தொகை (No extra fee)\nபெயர் மாற்றக் கட்டணம்$உள்ளாட்சி அமைப்புகளின் விதிமுறைகளுக்கு ஏற்ப மாறுபடும்\nமுக்கிய ஆவணங்கள்$கிரயப் பத்திரம், புதிய பட்டா, வில்லங்கச் சான்றிதழ், முந்தைய வரி ரசீது & ஆதார்",
    documentRequirements: [
      "பதிவு செய்யப்பட்ட கிரயப் பத்திரம் (Sale Deed)",
      "புதிய பட்டா நகல் (Updated Patta Copy)",
      "வில்லங்கச் சான்றிதழ் (Encumbrance Certificate - EC)",
      "முந்தைய சொத்து வரி செலுத்திய ரசீது (Previous Tax Receipt)",
      "விண்ணப்பதாரரின் ஆதார் அட்டை (Aadhaar Card)"
    ],
    urls: [
      { label: "TN Urban E-Pay", url: "https://tnurbanepay.tn.gov.in/" },
      { label: "Chennai Corporation Portal", url: "https://chennaicorporation.gov.in/" }
    ],
    payFee: "வரித் தொகை (மதிப்பீட்டின்படி) / பெயர் மாற்றக் கட்டணம்",
    charges: "₹100 Service Charge",
    notes: "சொத்து வாங்கியவுடன் உள்ளாட்சி பதிவேடுகளில் பெயர் மாற்றம் செய்வது மின் இணைப்பு, குடிநீர் இணைப்பு மற்றும் சட்டபூர்வ உரிமைக்கு இன்றியமையாதது."
  },
  {
    id: "business-fssai-food-licence",
    name: "7.1. FSSAI Food Licence (உணவுப் பாதுகாப்பு உரிமம்)",
    category: "Business Services",
    description: "H1: 7.1. FSSAI Food Licence (உணவுப் பாதுகாப்பு உரிமம்)\nH2: இந்திய உணவுப் பாதுகாப்பு மற்றும் தர நிர்ணய ஆணையம் (FSSAI FoSCoS)\n* விளக்கம் (Desc): உணவு வணிகம் செய்யும் நிறுவனங்கள், தயாரிப்பாளர்கள் மற்றும் உணவகங்கள் கட்டாயம் பெற வேண்டிய உணவுப் பாதுகாப்பு மற்றும் தர நிர்ணய ஆணையத்தின் சான்றிதழ்.\n* தகுதி (Eligible): பெட்டிக்கடை, ஹோட்டல், பேக்கரி, குளிர்பானக் கடை, ஹோம் மேட் உணவு தயாரிப்பாளர்கள் மற்றும் உணவு விநியோகஸ்தர்கள் வரை அனைவரும்.\n* பயன்கள் (Benefit): சட்டப்பூர்வ பாதுகாப்பு, வாடிக்கையாளர் நம்பிக்கை, ஆன்லைன் டெலிவரி (Swiggy / Zomato) தளங்களில் வணிகத்தை இணைக்க கட்டாயம் தேவை.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (FoSCoS)$*LINK(FSSAI FoSCoS Portal)->https://foscos.fssai.gov.in/\nஅரசு கட்டணம்$வணிகத்தின் அளவைப் பொறுத்து (பதிவு/உரிமம்) ஆண்டுக்கு ₹100 முதல் ₹7,500 வரை\nமுக்கிய ஆவணங்கள்$புகைப்படம், ஆதார், பான் அட்டை, வணிக முகவரிச் சான்று (EB Bill / வாடகை ஒப்பந்தம்)\nசெல்லுபடியாகும் காலம்$1 முதல் 5 ஆண்டுகள் வரை தேர்வு செய்து பெறலாம்",
    documentRequirements: [
      "உரிமையாளரின் புகைப்படம் (Owner Photo)",
      "ஆதார் அட்டை & பான் கார்டு (Aadhaar & PAN Card)",
      "வணிக இடத்தின் முகவரிச் சான்று (வாடகை ஒப்பந்தம் / மின்சார பில் / Property Tax)",
      "கடையின் பெயர் மற்றும் உணவு தயாரிப்பு/விற்பனை விவரங்கள்"
    ],
    urls: [
      { label: "FSSAI FoSCoS Portal", url: "https://foscos.fssai.gov.in/" },
      { label: "FSSAI Official Home", url: "https://www.fssai.gov.in/" }
    ],
    payFee: "ஆண்டுக்கு ₹100 (பதிவு) / ₹2,000 - ₹7,500 (மாநில/மத்திய உரிமம்)",
    charges: "₹150 - ₹300 Service Charge",
    notes: "ஆண்டு விற்றுமுதல் ₹12 லட்சத்திற்குள் உள்ள சிறு வணிகர்களுக்கு அடிப்படைப் பதிவு (Registration - ஆண்டுக்கு ₹100) போதுமானது. அதற்கு மேல் விற்றுமுதல் கொண்டவர்களுக்கு மாநில உரிமம் (State License) தேவை."
  },
  {
    id: "business-gst-registration-filing",
    name: "7.2. GST Registration & Return Filing (ஜிஎஸ்டி பதிவு மற்றும் கணக்குத் தாக்கல்)",
    category: "Business Services",
    description: "H1: 7.2. GST Registration & Return Filing (ஜிஎஸ்டி பதிவு மற்றும் கணக்குத் தாக்கல்)\nH2: சரக்கு மற்றும் சேவை வரி கவுன்சில் (GST Portal - Goods and Services Tax)\n* விளக்கம் (Desc): சரக்கு மற்றும் சேவை வரி (GST) சட்டத்தின் கீழ் வணிக நிறுவனங்களைப் பதிவு செய்து, மாதாந்திர / காலாண்டு வரிக் கணக்கைத் தாக்கல் செய்தல்.\n* தகுதி (Eligible): சரக்கு விற்றுமுதல் ₹40 லட்சத்திற்கு மேல் (சேவைகளுக்கு ₹20 லட்சம்) உள்ள வணிகர்கள் அல்லது மாநிலங்களுக்கு இடையே வர்த்தகம் செய்வோர்.\n* பயன்கள் (Benefit): மாநிலங்களுக்கு இடையே தடையின்றி வணிகம் செய்ய, கார்ப்பரேட் நிறுவனங்களுடன் வியாபாரம் செய்ய மற்றும் இன்புட் டேக்ஸ் கிரெடிட் (ITC) பெற.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (GST Portal)$*LINK(Official GST Portal)->https://www.gst.gov.in/\nஅரசு கட்டணம்$புதிய பதிவுக்கு அரசு கட்டணம் இல்லை (Free Registration)\nகணக்கு தாக்கல் (Filing)$மாதாந்திர / காலாண்டு GSTR-1, GSTR-3B தாக்கல்\nமுக்கிய ஆவணங்கள்$பான் கார்டு, ஆதார், வணிக முகவரிச் சான்று (EB Bill), வங்கி அறிக்கை",
    documentRequirements: [
      "பான் கார்டு (வணிகம் அல்லது உரிமையாளரின் PAN)",
      "ஆதார் அட்டை (Aadhaar Card)",
      "வணிக முகவரிச் சான்று (Electricity Bill / Property Tax / வாடகை ஒப்பந்தம்)",
      "வங்கி கணக்கு அறிக்கை அல்லது ரத்து செய்யப்பட்ட காசோலை (Bank Statement / Cancelled Cheque)",
      "புகைப்படம் & வணிகத்தின் பெயர் விவரம்"
    ],
    urls: [
      { label: "Official GST Portal", url: "https://www.gst.gov.in/" },
      { label: "New GST Registration", url: "https://reg.gst.gov.in/registration/" }
    ],
    payFee: "அரசு பதிவு கட்டணம் இலவசம் / ரிட்டர்ன் ஃபைலிங் வரி கணக்கீட்டின்படி",
    charges: "பதிவுக்கு ₹300 / மாதாந்திர கணக்குத் தாக்கலுக்கு ₹150 - ₹300",
    notes: "புதிய ஜிஎஸ்டி எண் பெற ஆதார் அங்கீகாரம் (Aadhaar Authentication) கட்டாயமாகும். பதிவு பெற்ற பிறகு குறித்த தேதிக்குள் தவறாமல் ரிட்டர்ன் தாக்கல் செய்ய வேண்டும்."
  },
  {
    id: "business-udyam-msme-registration",
    name: "7.3. Udyam (MSME) Registration (உத்யம் குறுந்தொழில் பதிவு)",
    category: "Business Services",
    description: "H1: 7.3. Udyam (MSME) Registration (உத்யம் குறுந்தொழில் பதிவு)\nH2: மத்திய குறு, சிறு மற்றும் நடுத்தரத் தொழில்கள் அமைச்சகம் (Ministry of MSME)\n* விளக்கம் (Desc): மத்திய அரசின் குறு, சிறு மற்றும் நடுத்தரத் தொழில்களுக்கான (MSME) அதிகாரப்பூர்வ இலவசப் பதிவுச் சான்றிதழ்.\n* தகுதி (Eligible): அனைத்து உற்பத்தி மற்றும் சேவை சார்ந்த குறு, சிறு, நடுத்தர வணிகங்கள் மற்றும் கடைகள்.\n* பயன்கள் (Benefit): பிணையில்லா வங்கி கடன்கள் (Collateral Free Loans), குறைந்த வட்டி விகிதம், மின்சாரக் கட்டணச் சலுகைகள் மற்றும் அரசு டெண்டர்களில் முன்னுரிமை.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Udyam Portal)$*LINK(Udyam Registration Portal)->https://udyamregistration.gov.in/\nஅரசு கட்டணம்$மத்திய அரசு கட்டணம் முற்றிலும் இலவசம் (Zero Govt Fee)\nமுக்கிய நன்மை$MUDRA மற்றும் பிணையில்லா குறுந்தொழில் கடன்கள் எளிதில் பெறலாம்\nதேவைப்படும் ஆவணங்கள்$ஆதார் அட்டை, பான் கார்டு, வங்கி கணக்கு எண் & வணிகத் தொடக்க தேதி",
    documentRequirements: [
      "உரிமையாளரின் ஆதார் அட்டை (மொபைல் எண் இணைக்கப்பட்டிருக்க வேண்டும்)",
      "பான் கார்டு (PAN Card)",
      "வங்கி கணக்கு எண் மற்றும் IFSC குறியீடு (Bank Account & IFSC)",
      "வணிகத் தொடக்க தேதி மற்றும் ஊழியர்களின் எண்ணிக்கை விவரம்"
    ],
    urls: [
      { label: "Udyam Registration Portal", url: "https://udyamregistration.gov.in/" },
      { label: "Print Udyam Certificate", url: "https://udyamregistration.gov.in/Udyam_Login.aspx" }
    ],
    payFee: "மத்திய அரசு கட்டணம் முற்றிலும் இலவசம் (Free)",
    charges: "₹50 - ₹100 Service Charge",
    notes: "உத்யம் பதிவு முற்றிலும் பேப்பர்லெஸ் முறையில் ஆதார் OTP மூலம் உடனடியாக சான்றிதழ் வழங்கப்படும். அரசு மானியங்கள் மற்றும் முத்ரா கடன் பெற இது இன்றியமையாதது."
  },
  {
    id: "eb-new-connection",
    name: "9.1. EB New Connection (புதிய மின் இணைப்பு விண்ணப்பம்)",
    category: "Electricity & EB Services",
    description: "H1: 9.1. EB New Connection (புதிய மின் இணைப்பு விண்ணப்பம்)\nH2: தமிழ்நாடு மின் உற்பத்தி மற்றும் பகிர்மானக் கழகம் (TANGEDCO New Service)\n* விளக்கம் (Desc): புதிய வீடு, வணிக வளாகம் அல்லது விவசாயப் பயன்பாட்டிற்கு புதிய மின்சார இணைப்பு பெற விண்ணப்பித்தல்.\n* தகுதி (Eligible): புதிய கட்டடம் அல்லது சொத்தின் சட்டப்பூர்வ உரிமையாளர் / வாடகைதாரர்.\n* பயன்கள் (Benefit): முறைப்படியான சட்டப்பூர்வ மின்சாரம் பெறலாம் மற்றும் அரசு மின் சலுகைகளைத் தொடர்ந்து பெறலாம்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (TANGEDCO Portal)$*LINK(TANGEDCO New Connection Portal)->https://www.tangedco.org/\nஅரசு கட்டணம்$அரசு நிர்ணயிக்கும் டெபாசிட் மற்றும் தேவைப்படும் KW அளவுக்கு ஏற்ப மாறும்\nமுக்கிய ஆவணங்கள்$பட்டா / சொத்து வரி ரசீது, கிரயப் பத்திரம், ஆதார் அட்டை & புகைப்படம்\nகள ஆய்வு$மின்வாரிய பொறியாளர் (AE) நேரில் ஆய்வு செய்து மதிப்பீடு வழங்குவார்",
    documentRequirements: [
      "நிலத்தின் பட்டா அல்லது சொத்து வரி ரசீது (Property Tax Receipt)",
      "உரிமையாளரின் ஆதார் அட்டை & புகைப்படம் (Aadhaar & Photo)",
      "விற்பனைப் பத்திரம் (Sale Deed) அல்லது பதிவு செய்யப்பட்ட வாடகை ஒப்பந்தம்",
      "மின் வயரிங் ஒப்பந்ததாரரின் பணி முடிவுச் சான்று (Wiring Completion Certificate)"
    ],
    urls: [
      { label: "TANGEDCO Online Portal", url: "https://www.tangedco.org/" },
      { label: "TNEB New Connection Portal", url: "https://nsc.tnebltd.gov.in/" }
    ],
    payFee: "தேவைப்படும் KW சுமை மற்றும் பயன்பாட்டு முறைக்கு ஏற்ப டெபாசிட்",
    charges: "₹150 - ₹250 Service Charge",
    notes: "வீட்டு உபயோக இணைப்புகளுக்கு (Domestic) முதல் 100 யூனிட் மின்சாரம் தமிழக அரசால் இலவசமாக வழங்கப்படுகிறது."
  },
  {
    id: "eb-name-transfer",
    name: "9.2. EB Name Transfer (மின் இணைப்பு பெயர் மாற்றம்)",
    category: "Electricity & EB Services",
    description: "H1: 9.2. EB Name Transfer (மின் இணைப்பு பெயர் மாற்றம்)\nH2: தமிழ்நாடு மின் உற்பத்தி மற்றும் பகிர்மானக் கழகம் (TANGEDCO Name Transfer)\n* விளக்கம் (Desc): ஏற்கனவே உள்ள மின் இணைப்பின் உரிமையாளர் பெயரைப் புதிய உரிமையாளரின் பெயருக்கு மாற்றுதல்.\n* தகுதி (Eligible): சொத்தை வாங்கிய புதிய உரிமையாளர் அல்லது சட்டப்பூர்வ வாரிசுகள்.\n* பயன்கள் (Benefit): மின் கட்டண ரசீது உங்கள் பெயருக்கு அதிகாரப்பூர்வமாக மாறும்; எதிர்காலத்தில் மின் இணைப்பு தொடர்பாக ஏதேனும் மாற்றம் செய்ய அல்லது மின் மானியம் பெற சட்டப்பூர்வ உரிமை உறுதி செய்யப்படும்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Name Transfer)$*LINK(TANGEDCO Name Transfer Portal)->https://www.tnebltd.gov.in/nametransfer/\nஅரசு கட்டணம்$₹725 (தாழ்வழுத்த வீட்டு உபயோக இணைப்புகளுக்கு - ஜிஎஸ்டி உட்பட)\nமுக்கிய ஆவணங்கள்$புதிய பட்டா / சொத்து வரி ரசீது, கிரயப் பத்திரம் & ஆதார் அட்டை\nவாரிசுரிமை எனில்$இறப்புச் சான்றிதழ், வாரிசுச் சான்றிதழ் மற்றும் இதர வாரிசுகளின் ஒப்புதல் (NOC)",
    documentRequirements: [
      "புதிய பட்டா நகல் அல்லது சமீபத்திய சொத்து வரி ரசீது (Updated Patta / Tax Receipt)",
      "பதிவு செய்யப்பட்ட விற்பனைப் பத்திரம் (Sale Deed) அல்லது செட்டில்மெண்ட் பத்திரம்",
      "விண்ணப்பதாரரின் ஆதார் அட்டை நகல் & பாஸ்போர்ட் அளவு புகைப்படம்",
      "வாரிசு அடிப்படையில் எனில்: இறப்புச் சான்றிதழ், வாரிசுச் சான்றிதழ் & இதர வாரிசுகளின் NOC",
      "முந்தைய உரிமையாளரின் சம்மதக் கடிதம் (Consent Letter - சாத்தியமென்றால்)"
    ],
    urls: [
      { label: "TANGEDCO Name Transfer", url: "https://www.tnebltd.gov.in/nametransfer/" },
      { label: "TANGEDCO Official Home", url: "https://www.tangedco.org/" }
    ],
    payFee: "₹725 (அரசு கட்டணம் - வீட்டு உபயோகத்திற்கு)",
    charges: "₹100 Service Charge",
    notes: "ஆன்லைனில் விண்ணப்பித்து ஆவணங்களை பதிவேற்றம் செய்தால், உதவி செயற்பொறியாளர் சரிபார்த்து பெயர் மாற்ற ஆணை பிறப்பிப்பார்."
  },
  {
    id: "eb-aadhaar-linking",
    name: "9.3. EB Aadhaar Linking (மின் இணைப்புடன் ஆதார் எண் இணைப்பு)",
    category: "Electricity & EB Services",
    description: "H1: 9.3. EB Aadhaar Linking (மின் இணைப்புடன் ஆதார் எண் இணைப்பு)\nH2: தமிழ்நாடு மின்சார வாரியம் - ஆதார் இணைப்பு சேவை (TNEB Aadhaar Seva)\n* விளக்கம் (Desc): அரசு வழங்கும் 100 யூனிட் இலவச மின்சாரம் மற்றும் மானியங்களைத் தடையின்றி பெற நுகர்வோர் மின் இணைப்பு எண்ணுடன் ஆதார் எண்ணை இணைத்தல்.\n* தகுதி (Eligible): மின் இணைப்பின் உரிமையாளர் அல்லது தற்போது வசித்து வரும் வாடகைதாரர்.\n* பயன்கள் (Benefit): தமிழக அரசின் 100 யூனிட் இலவச மின்சார மானியம் தொடர்ந்து கிடைக்கும்; மின் இணைப்பு துண்டிக்கப்படாமல் நுகர்வோர் கணக்கு பாதுகாப்பாக இருக்கும்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Aadhaar Link)$*LINK(TNEB Aadhaar Linking Portal)->https://nsc.tnebltd.gov.in/adharindia/\nஅரசு கட்டணம்$முற்றிலும் இலவசம் (Free)\nசரிபார்ப்பு முறை$ஆதார் இணைக்கப்பட்ட கைபேசி எண்ணிற்கு வரும் OTP வழி உடனடி இணைப்பு\nதேவைப்படும் விவரங்கள்$நுகர்வோர் எண் (Consumer No) & ஆதார் அட்டை",
    documentRequirements: [
      "நுகர்வோர் மின் இணைப்பு எண் (Consumer / Service Connection Number)",
      "மின் இணைப்பின் உரிமையாளர் அல்லது வாடகைதாரரின் ஆதார் அட்டை",
      "ஆதாருடன் இணைக்கப்பட்ட மொபைல் எண் (OTP சரிபார்ப்புக்கு)"
    ],
    urls: [
      { label: "TNEB Aadhaar Link Portal", url: "https://nsc.tnebltd.gov.in/adharindia/" },
      { label: "TANGEDCO Home", url: "https://www.tangedco.org/" }
    ],
    payFee: "முற்றிலும் இலவசம் (Free)",
    charges: "₹30 Service Charge",
    notes: "மின் இணைப்பு எண்ணுடன் பகுதி குறியீட்டை (Region Code) சரியாக சேர்த்து உள்ளீடு செய்து ஆதார் OTP மூலம் நொடிகளில் இணைக்கலாம்."
  },
  {
    id: "eb-mobile-number-updation",
    name: "9.4. EB Mobile Number Updation (கைபேசி எண் பதிவு / மாற்றம்)",
    category: "Electricity & EB Services",
    description: "H1: 9.4. EB Mobile Number Updation (கைபேசி எண் பதிவு / மாற்றம்)\nH2: TANGEDCO நுகர்வோர் தகவல் தொடர்பு சேவை (SMS Alert Service)\n* விளக்கம் (Desc): மாதாந்திர மின் நுகர்வு கணக்கீடு, மின் கட்டணத் தொகை, பணம் செலுத்திய ரசீது விவரம் மற்றும் திட்டமிட்ட மின்தடை அறிவிப்புகளை SMS மூலம் பெற கைபேசி எண்ணைப் பதிவு செய்தல் அல்லது மாற்றுதல்.\n* தகுதி (Eligible): அனைத்து மின் நுகர்வோர்கள் மற்றும் உரிமையாளர்கள்.\n* பயன்கள் (Benefit): மின் கட்டணம் கணக்கிடப்பட்ட உடனேயே SMS வழியாக பில் தொகை மற்றும் கடைசி தேதி தெரிந்து கொள்ளலாம்; அபராதக் கட்டணம் இன்றி சரியான நேரத்தில் கட்டணம் செலுத்த உதவும்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Mobile Update)$*LINK(TNEB Mobile Update Portal)->https://www.tnebltd.gov.in/upd_mob_no/\nஅரசு கட்டணம்$முற்றிலும் இலவசம் (Free)\nமுக்கிய வசதி$பில் தொகை, ரசீது & மின்தடை அறிவிப்புகள் SMS வழியே வரும்\nதேவைப்படும் விவரங்கள்$நுகர்வோர் மின் இணைப்பு எண் & புதிய கைபேசி எண் (OTP பெற)",
    documentRequirements: [
      "நுகர்வோர் மின் இணைப்பு எண் (Consumer Number)",
      "பதிவு செய்ய வேண்டிய புதிய கைபேசி எண் (OTP பெற)"
    ],
    urls: [
      { label: "TNEB Mobile Update Portal", url: "https://www.tnebltd.gov.in/upd_mob_no/" },
      { label: "TANGEDCO Home", url: "https://www.tangedco.org/" }
    ],
    payFee: "முற்றிலும் இலவசம் (Free)",
    charges: "₹30 Service Charge",
    notes: "மொபைல் எண் பதிவு செய்வதன் மூலம் மின் கட்டணத் தேதி மறக்காமல் சரியான நேரத்தில் செலுத்தலாம்."
  },
  {
    id: "eb-bill-payment-receipt",
    name: "9.5. EB Bill Payment & Receipt Download (மின் கட்டணம் செலுத்துதல் & ரசீது பதிவிறக்கம்)",
    category: "Electricity & EB Services",
    description: "H1: 9.5. EB Bill Payment & Receipt Download (மின் கட்டணம் & ரசீது)\nH2: TANGEDCO உடனடி கட்டண சேவை (Quick Pay & Bill Receipt)\n* விளக்கம் (Desc): மாதாந்திர / இருமாத மின் பயன்பாட்டுக் கட்டணத்தை இணையவழியில் செலுத்தி உடனடி அதிகாரப்பூர்வ டிஜிட்டல் ரசீது பெறுதல்.\n* தகுதி (Eligible): அனைத்து மின்சார நுகர்வோர்கள்.\n* பயன்கள் (Benefit): மின்வாரிய அலுவலகத்திற்கு நேரில் செல்லாமல் வீட்டில் இருந்தபடியே உடனுக்குடன் பில் செலுத்தலாம்; முந்தைய மாதங்களின் பில் மற்றும் பணம் செலுத்திய ரசீதுகளை எப்போது வேண்டுமானாலும் பதிவிறக்கம் செய்து கொள்ளலாம்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Quick Pay)$*LINK(TANGEDCO Quick Pay Portal)->https://www.tnebltd.gov.in/qpay/\nகட்டணம் (Amount)$உண்மையான பயன்பாட்டு பில் தொகை மட்டுமே (கூடுதல் கட்டணம் இல்லை)\nபணம் செலுத்தும் வழிகள்$UPI (GPay / PhonePe / Paytm), Net Banking, Debit / Credit Card\nபதிவிறக்க ஆவணம்$அதிகாரப்பூர்வ டிஜிட்டல் மின் கட்டண ரசீது (Payment Receipt)",
    documentRequirements: [
      "பகுதி குறியீட்டுடன் கூடிய நுகர்வோர் மின் இணைப்பு எண் (Consumer Number with Region Code)",
      "கட்டணம் செலுத்த Net Banking, UPI (GPay/PhonePe), அல்லது Debit/Credit கார்டு"
    ],
    urls: [
      { label: "TANGEDCO Quick Pay", url: "https://www.tnebltd.gov.in/qpay/" },
      { label: "TANGEDCO Bill Status", url: "https://www.tangedco.org/" }
    ],
    payFee: "உண்மையான பில் தொகை மட்டும் (No Extra Gateway Fee)",
    charges: "₹10 - ₹20 Service Charge",
    notes: "கட்டணம் செலுத்தியவுடன் கணினியிலோ அல்லது போனிலோ உடனடி ரசீதை PDF வடிவில் பதிவிறக்கம் செய்து கொள்ளலாம்."
  },
  {
    id: "eb-load-addition-reduction",
    name: "9.6. Additional Load / Load Reduction (கூடுதல் மின்சுமை பெறுதல் / குறைத்தல்)",
    category: "Electricity & EB Services",
    description: "H1: 9.6. Additional Load / Load Reduction (கூடுதல் மின்சுமை / குறைத்தல்)\nH2: தமிழ்நாடு மின்சார வாரியம் - சுமை மேலாண்மை (TANGEDCO Load Sanction)\n* விளக்கம் (Desc): வீட்டில் கூடுதல் மின்சாதனங்கள் (Air Conditioner, Heavy Motor) பொருத்துவதற்காக அனுமதிக்கப்பட்ட மின் சுமையை (Sanctioned Load - KW) அதிகரித்தல் அல்லது தேவையற்ற சுமையைக் குறைத்தல்.\n* தகுதி (Eligible): மின் இணைப்பின் பதிவு பெற்ற உரிமையாளர்கள்.\n* பயன்கள் (Benefit): குறைந்த மின்சுமையால் ஏற்படும் லோ-வோல்டேஜ் மற்றும் ஃப்யூஸ் கேரியர் பழுதுகள் தடுக்கப்படும்; மின்வாரிய ஆய்வு மற்றும் அபராதங்களில் இருந்து தப்பிக்கலாம்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (TANGEDCO)$*LINK(TANGEDCO Online Portal)->https://www.tangedco.org/\nகட்டணம்$கூடுதல் கிலோவாட் (KW) அளவுக்கு ஏற்ப கூடுதல் வைப்புத் தொகை (ASD) & பதிவுக் கட்டணம்\nமுக்கிய ஆவணங்கள்$சமீபத்திய பில், பட்டா/பத்திரம், ஒயரிங் முடிவுச் சான்று & ஆதார்\nபயன்$மின் அழுத்தக் குறைவு (Low Voltage) தவிர்ப்பு & சட்டபூர்வ மின்சுமை அனுமதி",
    documentRequirements: [
      "சமீபத்திய மின் கட்டண ரசீது (Latest EB Bill Receipt)",
      "சொத்து உரிமை ஆவணம் (பட்டா / விற்பனைப் பத்திரம்)",
      "அரசு உரிமம் பெற்ற மின் ஒப்பந்ததாரரின் பணி முடிவுச் சான்று (Wiring Completion / Safety Certificate)",
      "விண்ணப்பதாரரின் ஆதார் அட்டை (Aadhaar Card)"
    ],
    urls: [
      { label: "TANGEDCO Online Portal", url: "https://www.tangedco.org/" },
      { label: "TNEB Services Portal", url: "https://nsc.tnebltd.gov.in/" }
    ],
    payFee: "கூடுதல் KW-க்கு ஏற்ப கூடுதல் வைப்புத் தொகை (Security Deposit)",
    charges: "₹100 Service Charge",
    notes: "ஏசி, வாட்டர் ஹீட்டர் போன்ற கூடுதல் சாதனங்கள் பொருத்தும் போது மின்சுமையை அதிகரித்துக் கொள்வது மின் விபத்துகளைத் தவிர்க்கும்."
  },
  {
    id: "eb-tariff-change",
    name: "9.7. Tariff Change (மின் பயன்பாட்டு வகை மாற்றம்)",
    category: "Electricity & EB Services",
    description: "H1: 9.7. Tariff Change (மின் பயன்பாட்டு வகை மாற்றம்)\nH2: TANGEDCO மின் கட்டண வரிசை மாற்றம் (Tariff Classification)\n* விளக்கம் (Desc): மின் இணைப்பின் பயன்பாட்டு வகையை மாற்றுதல் (எ.கா. தற்காலிக கட்டடப் பயன்பாட்டிலிருந்து [Temporary] குடியிருப்பு பயன்பாட்டிற்கு [Domestic] மாற்றுதல், அல்லது வணிக நோக்கத்திற்கு [Commercial] மாற்றுதல்).\n* தகுதி (Eligible): பயன்பாட்டு முறை மாறிய கட்டடங்கள் மற்றும் வளாகங்களின் உரிமையாளர்கள்.\n* பயன்கள் (Benefit): வீடு கட்டி முடித்த பிறகு தற்காலிக வணிகக் கட்டண விகிதத்திற்குப் பதிலாக குறைந்த கட்டண விகிதமான வீட்டு உபயோக கட்டண வரிசைக்கு மாறி 100 யூனிட் இலவச மின்சார சலுகையைப் பெறலாம்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு$*LINK(TANGEDCO Online Portal)->https://www.tangedco.org/\nஅரசு கட்டணம்$மறுமதிப்பீட்டுக் கட்டணம் மற்றும் வைப்புத்தொகை வித்தியாசம்\nமுக்கிய ஆவணங்கள்$கட்டிட நிறைவுச் சான்று / வணிக உரிமம், சொத்து வரி ரசீது, பில் & ஆதார்\nமுக்கிய பயன்$குறைந்த கட்டண வரிசைக்கு மாறுதல் & 100 யூனிட் இலவச மின்சார சலுகை பெறுதல்",
    documentRequirements: [
      "உள்ளாட்சி அமைப்பின் கட்டிட நிறைவுச் சான்றிதழ் (Completion Certificate) அல்லது வணிக உரிமம்",
      "சொத்து வரி ரசீது / பட்டா நகல்",
      "உரிமையாளரின் ஆதார் அட்டை",
      "சமீபத்திய மின் கட்டண ரசீது"
    ],
    urls: [
      { label: "TANGEDCO Online Portal", url: "https://www.tangedco.org/" },
      { label: "TNEB Services", url: "https://nsc.tnebltd.gov.in/" }
    ],
    payFee: "மறுமதிப்பீட்டுக் கட்டணம் & வைப்புத் தொகை வித்தியாசம்",
    charges: "₹100 Service Charge",
    notes: "கட்டடம் கட்டி முடித்தவுடன் தற்காலிக இணைப்பிலிருந்து (Tariff V) வீட்டு உபயோக இணைப்பிற்கு (Tariff IA) மாற்றுவது மாத மின் கட்டணத்தை பெருமளவு குறைக்கும்."
  },
  {
    id: "eb-meter-replacement-shifting",
    name: "9.8. Defective Meter Replacement & Shifting (பழுதடைந்த மீட்டர் மாற்றம் & மீட்டர் இடமாற்றம்)",
    category: "Electricity & EB Services",
    description: "H1: 9.8. Defective Meter Replacement & Shifting (மீட்டர் மாற்றம் & இடமாற்றம்)\nH2: TANGEDCO மீட்டர் பராமரிப்பு மற்றும் புகார் சேவை (Meter Maintenance)\n* விளக்கம் (Desc): மின்சார மீட்டர் இயங்காமல் நின்றாலோ (Burnt / Stuck), அதிவேகமாக தவறாக இயங்கினாலோ அல்லது வீட்டின் முகப்பு/மறுசீரமைப்பின் போது மீட்டரை வேறு இடத்திற்கு மாற்றவோ விண்ணப்பித்தல்.\n* தகுதி (Eligible): மீட்டர் பழுது அல்லது இடமாற்றம் தேவைப்படும் அனைத்து மின் நுகர்வோர்கள்.\n* பயன்கள் (Benefit): தவறான மதிப்பீட்டு பில் மற்றும் சராசரி பில் (Average billing) சிக்கல்கள் தீர்க்கப்பட்டு, துல்லியமான பயன்பாட்டிற்கு மட்டுமே கட்டணம் செலுத்தலாம்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Complaint Portal)$*LINK(TANGEDCO Complaint Portal)->https://www.tangedco.org/\nஅவசர உதவி எண் (Helpline)$24x7 மின்வாரிய கட்டணமில்லா உதவி எண்: 1912\nகட்டணம் (இயற்கை பழுது)$இலவசம் (Free Replacement)\nகட்டணம் (விபத்து/இடமாற்றம்)$புதிய மீட்டர் கட்டணம் & களப்பணிக் கட்டணம் (சுமார் ₹500 முதல் ₹1,500 வரை)",
    documentRequirements: [
      "நுகர்வோர் எண் மற்றும் சமீபத்திய பில் ரசீது",
      "விண்ணப்பதாரரின் ஆதார் அட்டை",
      "மீட்டர் மாற்றம்/இடமாற்றத்திற்கான எழுத்துப்பூர்வ அல்லது ஆன்லைன் கோரிக்கை"
    ],
    urls: [
      { label: "TANGEDCO Complaint Portal", url: "https://www.tangedco.org/" },
      { label: "Consumer Grievance Redressal", url: "https://www.tnebltd.gov.in/cgrc/" }
    ],
    payFee: "இயற்கை பழுதெனில் இலவசம் / இடமாற்றத்திற்கு ₹500 - ₹1,500",
    charges: "₹50 Service Charge",
    notes: "மீட்டர் பழுதடைந்தால் உடனடியாக 1912 என்ற எண்ணிலோ அல்லது ஆன்லைனிலோ புகார் பதிவு செய்ய வேண்டும். தாமதித்தால் சராசரி கட்டணம் (Average Bill) உயர்த்தப்பட வாய்ப்புண்டு."
  },
  {
    id: "eb-rooftop-solar-net-metering",
    name: "9.9. Rooftop Solar Net Metering (சூரிய மின் உற்பத்தி கட்டமைப்பு இணைப்பு)",
    category: "Electricity & EB Services",
    description: "H1: 9.9. Rooftop Solar Net Metering (சூரிய மின் உற்பத்தி கட்டமைப்பு இணைப்பு)\nH2: தமிழ்நாடு மின்சார வாரியம் & PM சூர்ய கர் திட்டம் (Rooftop Solar & PM Surya Ghar)\n* விளக்கம் (Desc): வீட்டின் கூரையில் சூரிய ஒளி மின் தகடுகள் (Rooftop Solar) அமைத்து, உற்பத்தி செய்யப்படும் உபரி மின்சாரத்தை மின்வாரிய கட்டமைப்புக்கு (Grid) வழங்கி 'நெட் மீட்டரிங்' மூலம் கட்டணச் சலுகை பெற விண்ணப்பித்தல்.\n* தகுதி (Eligible): சொந்த வீட்டின் கூரை பரப்பளவு கொண்ட மின் நுகர்வோர்கள்.\n* பயன்கள் (Benefit): மின் கட்டணத்தை பெருமளவு அல்லது முழுமையாகக் குறைக்கலாம்; மத்திய/மாநில அரசு மானியம் (PM Surya Ghar) ₹78,000 வரை நேரடியாக வங்கி கணக்கில் பெறலாம்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (TANGEDCO Solar)$*LINK(TANGEDCO Rooftop Solar Portal)->https://www.tnebltd.gov.in/usrp/\nஇணைய இணைப்பு (PM Surya Ghar)$*LINK(PM Surya Ghar Portal)->https://pmsuryaghar.gov.in/\nஅரசு மானியம் (Subsidy)$மத்திய அரசு நேரடி மானியம் ₹78,000 வரை (3 KW திட்டத்திற்கு)\nதேவைப்படும் ஆவணங்கள்$மின் கட்டண ரசீது, ஆதார், வங்கி பாஸ்புக், பட்டா & சோலார் திட்ட மதிப்பீடு",
    documentRequirements: [
      "நுகர்வோர் மின் இணைப்பு எண் மற்றும் சமீபத்திய பில் ரசீது",
      "உரிமையாளரின் ஆதார் அட்டை மற்றும் வங்கி பாஸ்புக் நகல் (மானியத்திற்கு)",
      "சொத்து உரிமை ஆவணம் (பட்டா / சொத்து வரி ரசீது)",
      "அங்கீகரிக்கப்பட்ட சோலார் நிறுவனத்தின் திட்ட மதிப்பீடு மற்றும் உபகரண விவரம்"
    ],
    urls: [
      { label: "TANGEDCO Rooftop Solar Portal", url: "https://www.tnebltd.gov.in/usrp/" },
      { label: "PM Surya Ghar Portal", url: "https://pmsuryaghar.gov.in/" }
    ],
    payFee: "நெட்-மீட்டர் மற்றும் ஆய்வு கட்டணம் (மானியம் நேரடியாக வரவு வைக்கப்படும்)",
    charges: "₹150 Service Charge",
    notes: "PM சூர்ய கர் (PM Surya Ghar Muft Bijli Yojana) திட்டத்தின் கீழ் 3 KW சோலார் அமைப்பிற்கு ₹78,000 வரை நேரடி மத்திய அரசு மானியம் வழங்கப்படுகிறது."
  },
  {
    id: "fssai-new-registration-license",
    name: "1. புதிய உணவுப் பதிவு / உரிமம் (FSSAI New Registration & License)",
    category: "FSSAI Food Safety Services",
    description: "H1: 1. புதிய உணவுப் பதிவு / உரிமம் (FSSAI New Registration & License)\nH2: இந்திய உணவுப் பாதுகாப்பு மற்றும் தர நிர்ணய ஆணையம் (FSSAI FoSCoS)\n* விளக்கம் (Desc): புதிதாகத் தொடங்கப்படும் தள்ளுவண்டி கடைகள், மளிகைக் கடைகள், பேக்கரிகள், உணவகங்கள், மேனுஃபேக்ச்சரிங் யூனிட்கள் மற்றும் ஆன்லைன் உணவு வணிகங்களுக்கு புதிய 14 இலக்க FSSAI பதிவுச் சான்று அல்லது உரிமம் பெறுதல்.\n* தகுதி (Eligible): உணவு தயாரிப்பாளர்கள், விற்பனையாளர்கள், உணவகங்கள், பேக்கரி, ஹோம் பேக்கர் மற்றும் விநியோகஸ்தர்கள்.\n* பயன்கள் (Benefit): 14 இலக்க FSSAI பதிவு எண் கிடைக்கும்; Swiggy, Zomato போன்ற டெலிவரி தளங்களில் இணையலாம்; சட்டப்பூர்வ உணவு வணிக உரிமை உறுதி செய்யப்படும்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (FoSCoS New)$*LINK(FoSCoS New Application Portal)->https://foscos.fssai.gov.in/\nஅடிப்படைப் பதிவு (Basic)$₹100 / ஆண்டுக்கு (விற்றுமுதல் ₹12 லட்சத்திற்குள்)\nமாநில உரிமம் (State License)$₹2,000 முதல் ₹5,000 வரை / ஆண்டுக்கு (+ GST)\nமத்திய உரிமம் (Central License)$₹7,500 / ஆண்டுக்கு (+ GST)\nமுக்கிய ஆவணங்கள்$புகைப்படம், ஆதார்/பான், வணிக முகவரிச் சான்று & தயாரிப்பு விவரங்கள்",
    documentRequirements: [
      "உரிமையாளரின் பாஸ்போர்ட் அளவு புகைப்படம் (Passport Size Photo)",
      "அடையாளச் சான்று (ஆதார் அட்டை / வாக்காளர் அட்டை / பான் அட்டை)",
      "வணிக முகவரிச் சான்று (கடை வாடகை ஒப்பந்தம் / மின் கட்டண ரசீது / சொத்து வரி ரசீது)",
      "நிறுவன ஆவணங்கள் (GST / உத்யாம் பதிவு / பார்ட்னர்ஷிப் பத்திரம் - இருப்பின்)",
      "State/Central உரிமத்திற்கு: நீர் ஆய்வு அறிக்கை (Water Test Report) & மெஷினரி பட்டியல்"
    ],
    urls: [
      { label: "FoSCoS New Application", url: "https://foscos.fssai.gov.in/" },
      { label: "FSSAI Official Portal", url: "https://www.fssai.gov.in/" }
    ],
    payFee: "Basic: ₹100/ஆண்டு | State: ₹2,000-₹5,000/ஆண்டு | Central: ₹7,500/ஆண்டு",
    charges: "₹150 - ₹300 Service Charge",
    notes: "விற்றுமுதல் ₹12 லட்சத்திற்குள் இருந்தால் Basic Registration (ஆண்டுக்கு ₹100) போதுமானது. 1 முதல் 5 ஆண்டுகள் வரை தேர்வு செய்து ஒரே நேரத்தில் கட்டணம் செலுத்தி உரிமம் பெறலாம்."
  },
  {
    id: "fssai-license-renewal",
    name: "2. உணவு உரிமம் புதுப்பித்தல் (FSSAI License / Registration Renewal)",
    category: "FSSAI Food Safety Services",
    description: "H1: 2. உணவு உரிமம் புதுப்பித்தல் (FSSAI Renewal)\nH2: FoSCoS உரிமம் புதுப்பித்தல் சேவை (License / Registration Renewal)\n* விளக்கம் (Desc): ஏற்கனவே உள்ள FSSAI உரிமம் அல்லது பதிவின் காலாவதி முடிவதற்குள் (1 முதல் 5 ஆண்டுகள் வரை) அதன் செல்லுபடியாகும் காலத்தை மேலும் நீட்டிக்க விண்ணப்பித்தல்.\n* தகுதி (Eligible): காலாவதியாகும் நிலையில் உள்ள FSSAI உரிமம்/பதிவு வைத்துள்ள அனைத்து உணவு வணிகர்கள்.\n* பயன்கள் (Benefit): பழைய 14 இலக்க FSSAI எண்ணே தொடர்ந்து நீடிக்கும்; உரிமம் ரத்தாகாமல் வணிகம் தடையின்றி தொடர்ந்து செயல்பட உதவும்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (FoSCoS Renewal)$*LINK(FoSCoS Renewal Portal)->https://foscos.fssai.gov.in/\nவழக்கமான கட்டணம்$Basic: ₹100/ஆண்டு; State: ₹2,000–₹5,000/ஆண்டு\nதாமதக் கட்டணம் (Late Fee)$காலாவதியாகும் தேதிக்கு 30 நாட்களுக்குள் புதுப்பித்தால் நாள் ஒன்றுக்கு ₹100\nமுக்கிய ஆவணங்கள்$தற்போதைய உரிம நகல், ஆதார், ஆண்டு விற்றுமுதல் சுய அறிவிப்பு",
    documentRequirements: [
      "தற்போதைய FSSAI உரிம எண் / சான்றிதழ் நகல்",
      "உரிமையாளரின் ஆதார் அட்டை நகல்",
      "ஆண்டு விற்றுமுதல் சுய அறிவிப்பு (Annual Turnover Declaration)",
      "புதுப்பிக்கப்பட்ட கடை வாடகை ஒப்பந்தம் (வாடகை இடம் எனில்)"
    ],
    urls: [
      { label: "FoSCoS Renewal Portal", url: "https://foscos.fssai.gov.in/" },
      { label: "FSSAI Home", url: "https://www.fssai.gov.in/" }
    ],
    payFee: "வழக்கமான உரிமக் கட்டணம் (தாமதமானால் ₹100/நாள் அபராதம்)",
    charges: "₹100 - ₹200 Service Charge",
    notes: "காலாவதி ஆவதற்கு 120 நாட்களுக்கு முன்பிருந்தே புதுப்பிக்க விண்ணப்பிக்கலாம். காலாவதிக்கு 30 நாட்களுக்குள் விண்ணப்பித்தால் நாள் ஒன்றுக்கு ₹100 தாமதக் கட்டணம் வசூலிக்கப்படும்."
  },
  {
    id: "fssai-license-modification",
    name: "3. உரிமத்தில் திருத்தம் / விவர மாற்றம் (FSSAI License Modification)",
    category: "FSSAI Food Safety Services",
    description: "H1: 3. உரிமத்தில் திருத்தம் / விவர மாற்றம் (FSSAI License Modification)\nH2: FoSCoS உரிம திருத்த சேவை (Modification & Category Addition)\n* விளக்கம் (Desc): ஏற்கனவே உள்ள உணவு உரிமத்தில் கடையின் பெயர், முகவரி மாற்றம், புதிய உணவு வகைகளை சேர்த்தல் (Food Category Addition), உரிமையாளர் பெயர் மாற்றம் அல்லது விற்றுமுதல் அதிகரித்ததால் Basic-லிருந்து State License-க்கு தரம் உயர்த்துதல் (Conversion).\n* தகுதி (Eligible): வணிக விவரங்கள், இடம் அல்லது உணவு தயாரிப்பு முறையில் மாற்றம் செய்த உணவு நிறுவனங்கள்.\n* பயன்கள் (Benefit): தற்போதைய வணிக மாற்றங்கள் அரசுப் பதிவேட்டில் புதுப்பிக்கப்படும்; ஆய்வுகளின் போது ஏற்படும் சட்டரீதியான சிக்கல்கள் தவிர்க்கப்படும்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (FoSCoS Modification)$*LINK(FoSCoS Modification Portal)->https://foscos.fssai.gov.in/\nBasic Registration திருத்தம்$அரசு கட்டணம் ₹100\nState & Central License திருத்தம்$₹1,000 (விவர மாற்றம் மட்டும்) அல்லது கட்டண வித்தியாசம்\nமுக்கிய ஆவணங்கள்$தற்போதைய சான்றிதழ், புதிய முகவரி சான்று / பெயர் மாற்ற ஆவணம்",
    documentRequirements: [
      "தற்போதைய FSSAI சான்றிதழ் (Current FSSAI Certificate)",
      "மாற்றத்திற்கான ஆதரவு ஆவணங்கள் (புதிய முகவரிக்கு: புதிய வாடகை ஒப்பந்தம்/EB பில்; பெயர் மாற்றத்திற்கு: GST/உறுதிமொழி பத்திரம்)",
      "நிறுவனத்தின் ஒப்புதல் கடிதம் (Board Resolution / Partnership Deed Update - தேவைப்படின்)"
    ],
    urls: [
      { label: "FoSCoS Modification Portal", url: "https://foscos.fssai.gov.in/" },
      { label: "FSSAI FoSCoS Home", url: "https://foscos.fssai.gov.in/" }
    ],
    payFee: "Basic: ₹100 | State/Central: ₹1,000 அல்லது வகைப்பாட்டு வித்தியாசம்",
    charges: "₹150 Service Charge",
    notes: "முகவரி மாற்றம் அல்லது புதிய உணவு வகைகள் சேர்க்கும்போது திருத்தத்திற்கு விண்ணப்பித்து புதிய சான்றிதழ் பெற வேண்டும்."
  },
  {
    id: "fssai-annual-return-d1",
    name: "4. வருடாந்திர அறிக்கை தாக்கல் (FSSAI Annual Return Filing - Form D-1)",
    category: "FSSAI Food Safety Services",
    description: "H1: 4. வருடாந்திர அறிக்கை தாக்கல் (FSSAI Annual Return - Form D-1)\nH2: FoSCoS ஆன்லைன் வருடாந்திர ரிட்டர்ன் தாக்கல் (Online Annual Return)\n* விளக்கம் (Desc): FSSAI உரிமம் பெற்ற உணவு உற்பத்தியாளர்கள், பேக்கர்கள், மற்றும் இறக்குமதியாளர்கள் முந்தைய நிதியாண்டில் உற்பத்தி மற்றும் விற்பனை செய்த உணவுப் பொருட்களின் அளவை அரசுக்கு ஆண்டுதோறும் சமர்ப்பிக்கும் சேவை.\n* தகுதி (Eligible): FSSAI உற்பத்தி உரிமம் பெற்ற அனைத்து மேனுஃபேக்ச்சரர்கள், பேக்கர்கள் மற்றும் இறக்குமதியாளர்கள்.\n* பயன்கள் (Benefit): உணவு உரிமம் சஸ்பெண்ட் ஆகாமல் பாதுகாக்கப்படும்; அரசு ஆய்வுகளின் போது ஏற்படும் அபராதங்கள் முழுமையாகத் தவிர்க்கப்படும்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Form D-1)$*LINK(FoSCoS Annual Return Form D-1)->https://foscos.fssai.gov.in/\nஅரசு கட்டணம்$முற்றிலும் இலவசம் (Free)\nகடைசி தேதி$ஒவ்வொரு ஆண்டும் மே 31-ஆம் தேதிக்குள் தாக்கல் செய்ய வேண்டும்\nதாமத அபராதம்$மே 31-க்குப் பிறகு நாள் ஒன்றுக்கு ₹100 அபராதம்\nதேவைப்படும் விவரங்கள்$உணவுப் பொருட்களின் உற்பத்தி அளவு (MT/Litres), கொள்முதல் & விற்பனை மதிப்பு",
    documentRequirements: [
      "14 இலக்க FSSAI உரிம எண் மற்றும் FoSCoS லாகின் விவரங்கள்",
      "கையாளப்பட்ட உணவுப் பொருட்களின் பட்டியல் மற்றும் உற்பத்தி அளவு (MT / Litres)",
      "மொத்த கொள்முதல் மற்றும் விற்பனை மதிப்பு விவரங்கள்"
    ],
    urls: [
      { label: "FoSCoS Annual Return (Form D-1)", url: "https://foscos.fssai.gov.in/" },
      { label: "FSSAI Returns Portal", url: "https://foscos.fssai.gov.in/" }
    ],
    payFee: "அரசு கட்டணம் இலவசம் (தாமதமானால் நாள் ஒன்றுக்கு ₹100 அபராதம்)",
    charges: "₹150 - ₹250 Service Charge",
    notes: "ஒவ்வொரு நிதியாண்டும் முடிந்ததும் மே 31-க்குள் FoSCoS இணையதளத்தில் Form D-1 ஆன்லைனில் சமர்ப்பிக்க வேண்டும்."
  },
  {
    id: "fssai-download-certificate",
    name: "5. FSSAI சான்றிதழ் நகல் பதிவிறக்கம் (Download Certificate / Duplicate Copy)",
    category: "FSSAI Food Safety Services",
    description: "H1: 5. FSSAI சான்றிதழ் நகல் பதிவிறக்கம் (Download Certificate)\nH2: FoSCoS டிஜிட்டல் சான்றிதழ் பதிவிறக்கம் (Digital Certificate Download)\n* விளக்கம் (Desc): அங்கீகரிக்கப்பட்ட FSSAI பதிவு அல்லது உரிமத்தின் டிஜிட்டல் கையொப்பமிட்ட அதிகாரப்பூர்வ சான்றிதழை QR குறியீட்டுடன் ஆன்லைனில் பதிவிறக்கம் செய்தல்.\n* தகுதி (Eligible): FSSAI பதிவு/உரிமம் பெற்ற அனைத்து வணிகர்கள்.\n* பயன்கள் (Benefit): கடையில் காட்சிப்படுத்த வேண்டிய 'Food Safety Display Board' தயார் செய்யவும், வங்கி நடப்புக் கணக்கு (Current Account) தொடங்கவும் உடனடியாகப் பயன்படுத்தலாம்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Certificate Search)$*LINK(FoSCoS Certificate Search Portal)->https://foscos.fssai.gov.in/\nஅரசு கட்டணம்$முற்றிலும் இலவசம் (Free)\nதேவைப்படும் விவரங்கள்$14 இலக்க FSSAI எண் அல்லது விண்ணப்ப எண் (ARN) & பதிவு செய்யப்பட்ட மொபைல் எண்\nபதிவிறக்க வடிவம்$QR குறியீட்டுடன் கூடிய அதிகாரப்பூர்வ PDF சான்றிதழ்",
    documentRequirements: [
      "14 இலக்க FSSAI எண் அல்லது விண்ணப்ப குறிப்பு எண் (ARN Number)",
      "பதிவின் போது கொடுத்த மொபைல் எண் (OTP பெற)"
    ],
    urls: [
      { label: "FoSCoS Certificate Search", url: "https://foscos.fssai.gov.in/" },
      { label: "Track FSSAI Application", url: "https://foscos.fssai.gov.in/" }
    ],
    payFee: "முற்றிலும் இலவசம் (Free)",
    charges: "₹30 Service Charge",
    notes: "FSSAI சான்றிதழை எப்போது வேண்டுமானாலும் உங்கள் FoSCoS பயனர் கணக்கு அல்லது விண்ணப்ப எண் மூலம் பதிவிறக்கம் செய்து கொள்ளலாம்."
  },
  {
    id: "fssai-surrender-cancellation",
    name: "6. உணவு உரிமம் ரத்து / ஒப்படைத்தல் (Surrender / Cancellation of License)",
    category: "FSSAI Food Safety Services",
    description: "H1: 6. உணவு உரிமம் ரத்து / ஒப்படைத்தல் (Surrender / Cancellation)\nH2: FoSCoS உரிமம் ஒப்படைக்கும் சேவை (License Surrender Service)\n* விளக்கம் (Desc): உணவு வணிகத்தை நிரந்தரமாக மூடும்போதோ அல்லது ஒரு இடத்திலிருந்து வேறு பகுதிக்கு மாற்றும்போது பழைய இடத்தில் செயல்பட்ட உரிமத்தை சட்டப்பூர்வமாக ரத்து செய்தல்.\n* தகுதி (Eligible): கடையை மூடிய அல்லது வணிகத்தை நிறுத்திய உரிமையாளர்கள்.\n* பயன்கள் (Benefit): கடை மூடிய பிறகும் வரும் வருடாந்திர அறிக்கை நிலுவைகள், வரிகள் மற்றும் உணவுப் பாதுகாப்பு அதிகாரிகளின் நோட்டீஸ்களில் இருந்து விலக்கு பெறலாம்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Surrender Portal)$*LINK(FoSCoS Surrender Portal)->https://foscos.fssai.gov.in/\nஅரசு கட்டணம்$முற்றிலும் இலவசம் (Free)\nமுக்கிய நன்மை$வருடாந்திர ரிட்டர்ன் நிலுவை அபராதங்கள் மற்றும் நோட்டீஸ்களைத் தவிர்த்தல்\nதேவைப்படும் ஆவணங்கள்$தற்போதைய சான்றிதழ் நகல் & வணிகம் மூடப்பட்டதற்கான சுய உறுதிமொழி",
    documentRequirements: [
      "தற்போதைய FSSAI அசல் சான்றிதழ் நகல்",
      "வணிகம் மூடப்பட்டதற்கான காரணக் கடிதம் / சுய உறுதிமொழி ஆவணம்",
      "கடை வாடகை ஒப்பந்த ரத்து நகல் (இருப்பின்)"
    ],
    urls: [
      { label: "FoSCoS Surrender Portal", url: "https://foscos.fssai.gov.in/" },
      { label: "FSSAI Home", url: "https://www.fssai.gov.in/" }
    ],
    payFee: "முற்றிலும் இலவசம் (Free)",
    charges: "₹50 Service Charge",
    notes: "வணிகத்தை மூடிவிட்டால் உடனடியாக உரிமத்தை ஒப்படைப்பது (Surrender) எதிர்கால அபராத நோட்டீஸ்களில் இருந்து முழுப் பாதுகாப்பு அளிக்கும்."
  },
  {
    id: "fssai-food-safety-display-board",
    name: "7. உணவுப் பாதுகாப்பு அறிவிப்புப் பலகை (Food Safety Display Board - FSDB)",
    category: "FSSAI Food Safety Services",
    description: "H1: 7. உணவுப் பாதுகாப்பு அறிவிப்புப் பலகை (Food Safety Display Board - FSDB)\nH2: FSSAI நுகர்வோர் விழிப்புணர்வு மற்றும் அறிவிப்புப் பலகை (FSDB Display Board)\n* விளக்கம் (Desc): உணவகம், பேக்கரி, டீக்கடை போன்ற அனைத்து உணவு நிலையங்களின் முகப்பிலும் பொதுமக்கள் மற்றும் அதிகாரிகளின் பார்வைக்கு படும் வகையில் 14 இலக்க FSSAI எண்ணுடன் கூடிய வண்ண அறிவிப்புப் பலகையை பதிவிறக்குதல்.\n* தகுதி (Eligible): FSSAI உரிமம்/பதிவு வைத்துள்ள அனைத்து உணவகங்கள், பேக்கரி, மளிகை மற்றும் சில்லறை உணவு வணிகர்கள்.\n* பயன்கள் (Benefit): நுகர்வோரிடம் உணவு தரம் குறித்த நம்பகத்தன்மை அதிகரிக்கும்; உணவுப் பாதுகாப்பு ஆய்வின் போது விதிக்கப்படும் அபராதங்களைத் தவிர்க்கலாம்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (FSDB Portal)$*LINK(FSSAI FSDB Portal)->https://fssai.gov.in/\nஅரசு கட்டணம்$இணையதளத்தில் பதிவிறக்கம் செய்ய முற்றிலும் இலவசம்\nவண்ணக் குறியீடு (Color Code)$உணவகம் (Purple), பழம்/காய்கறி (Green), இறைச்சி (Red), பால் (Blue)\nகாட்சிப்படுத்த வேண்டிய விபரம்$14 இலக்க FSSAI எண் மற்றும் நுகர்வோர் புகார் எண்",
    documentRequirements: [
      "தற்போதைய 14 இலக்க FSSAI உரிம எண்",
      "வணிக வகைப்பாடு (Restaurant, Retail, Milk, Meat, Fruit & Veg, etc.)"
    ],
    urls: [
      { label: "FSSAI FSDB Portal", url: "https://fssai.gov.in/" },
      { label: "FoSCoS FoSTaC Portal", url: "https://foscos.fssai.gov.in/" }
    ],
    payFee: "முற்றிலும் இலவசம் (Free Download)",
    charges: "₹30 Service Charge",
    notes: "அனைத்து உணவு நிறுவனங்களும் FSSAI அறிவிப்புப் பலகையை (FSDB) கடையின் நுழைவாயிலில் வாடிக்கையாளர் பார்க்கும் வகையில் வைப்பது சட்டப்படி கட்டாயமாகும்."
  },
  {
    id: "police-verification-certificate",
    name: "1. காவல் சரிபார்ப்புச் சான்றிதழ் (Police Verification Certificate - PVC)",
    category: "Police Services",
    description: "H1: 1. காவல் சரிபார்ப்புச் சான்றிதழ் (Police Verification Certificate - PVC)\nH2: தமிழ்நாடு காவல்துறை நன்னடத்தை & குற்றப்பின்னணி சரிபார்ப்பு (TN Police PVC Service)\n* விளக்கம் (Desc): தனியார் வேலைவாய்ப்பு, வெளிநாட்டுப் பணி, பள்ளி/கல்லூரி சேர்க்கை, வாடகைதாரர் சரிபார்ப்பு (Tenant Verification) அல்லது வீட்டுப் பணியாளர் சரிபார்ப்பிற்கு குற்றப் பின்னணி ஏதுமில்லை என்பதை உறுதிப்படுத்தும் அரசு நன்னடத்தை சான்றிதழ் (Conduct / Character Certificate).\n* தகுதி (Eligible): புதிய வேலைக்குச் சேருபவர்கள், வெளிநாடு செல்பவர்கள், வாடகைக்கு குடியமர்த்துபவர்கள், பள்ளி/கல்லூரி சேர்க்கை கோருவோர்.\n* பயன்கள் (Benefit): காவல் நிலையத்திற்கு நேரில் அலையாமல், உள்ளூர் காவல் ஆய்விற்குப் பின் QR குறியீட்டுடன் கூடிய டிஜிட்டல் சான்றிதழை ஆன்லைனிலேயே பதிவிறக்கம் செய்து வேலை மற்றும் விசா தேவைகளுக்குப் பயன்படுத்தலாம்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (PVC Portal)$*LINK(TN Police Citizen Portal - PVC)->https://eservices.tnpolice.gov.in/\nதனிநபர் சரிபார்ப்பு கட்டணம்$₹500 (Self / Job Verification)\nநிறுவன சரிபார்ப்பு கட்டணம்$₹1,000 (Commercial Organizations / Agencies)\nசான்றிதழ் வடிவம்$QR குறியீட்டுடன் கூடிய டிஜிட்டல் கையொப்பமிட்ட சான்றிதழ் (Digital Signed Certificate)\nமுக்கிய ஆவணங்கள்$ஆதார்/வாக்காளர் அட்டை, பாஸ்போர்ட் போட்டோ, முகவரிச் சான்று, நிறுவனக் கடிதம்",
    documentRequirements: [
      "விண்ணப்பதாரரின் ஆதார் அட்டை / வாக்காளர் அட்டை நகல்",
      "பாஸ்போர்ட் அளவு வண்ணப் புகைப்படம் (Passport Photo)",
      "தற்போதைய இருப்பிட முகவரிச் சான்று (மின் கட்டண ரசீது / வாடகை ஒப்பந்தம்)",
      "நிறுவனக் கடிதம் / ஆஃபர் லெட்டர் (நிறுவனம் மூலம் சரிபார்ப்பு கோரப்பட்டால்)",
      "கைபேசி எண் (OTP சரிபார்ப்பு மற்றும் SMS தகவல்களுக்கு)"
    ],
    urls: [
      { label: "TN Police Citizen Portal - PVC", url: "https://eservices.tnpolice.gov.in/" },
      { label: "TN Police eServices Home", url: "https://eservices.tnpolice.gov.in/CCTNSNICSDC/Index?0" }
    ],
    payFee: "தனிநபர்: ₹500 | நிறுவனங்கள் / முகவர்: ₹1,000 (Online Payment)",
    charges: "₹100 - ₹150 Service Charge",
    notes: "விண்ணப்பித்த பின் சம்பந்தப்பட்ட காவல் நிலையத்திலிருந்து ஆய்வுக்கு அழைப்பார்கள் அல்லது வீடு தேடி வருவார்கள். சரிபார்ப்பு முடிந்தவுடன் QR கோடு சான்றிதழை ஆன்லைனிலேயே பதிவிறக்கலாம்."
  },
  {
    id: "police-lost-document-report",
    name: "2. காணாமல் போன ஆவண அறிக்கை (Lost Document Report - LDR)",
    category: "Police Services",
    description: "H1: 2. காணாமல் போன ஆவண அறிக்கை (Lost Document Report - LDR)\nH2: தொலைந்த ஆவணங்களுக்கான உடனடி போலீஸ் அறிக்கை (Online LDR Service)\n* விளக்கம் (Desc): ஓட்டுநர் உரிமம் (DL), வாகன ஆர்.சி புக் (RC Book), பாஸ்போர்ட், பள்ளி/கல்லூரி மதிப்பெண் சான்றிதழ்கள், நிலப் பத்திரங்கள் அல்லது மொபைல் போன் போன்றவை தொலைந்துவிட்டால், அவற்றின் நகல் பெற காவல் துறையிடம் பதிவு செய்யப்படும் அதிகாரப்பூர்வ சான்று.\n* தகுதி (Eligible): ஆவணங்கள், கல்வி சான்றிதழ்கள், நிலப் பத்திரம் அல்லது செல்போன் தொலைத்த அனைத்து பொதுமக்கள்.\n* பயன்கள் (Benefit): காவல் நிலையத்திற்குச் செல்லாமலேயே உடனுக்குடன் LDR சான்றிதழைப் பதிவிறக்கலாம்; போக்குவரத்து அலுவலகம் (RTO), பல்கலைக்கழகங்கள் அல்லது வங்கிகளில் நகல் ஆவணங்கள் (Duplicate Documents) பெற இது சட்டப்பூர்வ கட்டாய ஆவணமாகும்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (LDR Portal)$*LINK(TN Police - Lost Document Report)->https://eservices.tnpolice.gov.in/\nஅரசு கட்டணம்$முற்றிலும் இலவசம் (Free)\nபதிவிறக்க நேரம்$விண்ணப்பித்த உடனேயே (Instant LDR Download with Police Digital Seal)\nதேவைப்படும் தகவல்$பத்திரம்/RC/DL/IMEI எண், தொலைந்த இடம், தேதி மற்றும் நிகழ்வு சுருக்கம்\nமுக்கிய தேவை$விண்ணப்பதாரர் ஆதார் அட்டை மற்றும் மொபைல் எண் (OTP பெற)",
    documentRequirements: [
      "தொலைந்த ஆவணத்தின் விவரங்கள் (பத்திரம் எண், RC எண், DL எண், மொபைலின் IMEI எண்)",
      "ஆவணம் தொலைந்த இடம், தேதி மற்றும் நிகழ்வு பற்றிய சுருக்கமான தகவல்",
      "விண்ணப்பதாரரின் ஆதார் அட்டை நகல்",
      "பதிவு செய்யப்பட வேண்டிய கைபேசி எண் (OTP பெற)"
    ],
    urls: [
      { label: "TN Police Lost Document Report (LDR)", url: "https://eservices.tnpolice.gov.in/" },
      { label: "TN Police Official Portal", url: "https://eservices.tnpolice.gov.in/CCTNSNICSDC/Index?0" }
    ],
    payFee: "முற்றிலும் இலவசம் (Free - No Govt Fee)",
    charges: "₹50 Service Charge",
    notes: "LDR என்பது குற்றப் புகார் அல்ல; ஆவணம் தொலைந்துவிட்டது என்பதற்கான சான்று மட்டுமே. RTO-வில் Duplicate RC/DL விண்ணப்பிக்கவும், பத்திர நகல் பெறவும் இது இன்றியமையாதது."
  },
  {
    id: "police-online-complaint-petition",
    name: "3. ஆன்லைன் புகார் பதிவு (Online Complaint / Petition Registration)",
    category: "Police Services",
    description: "H1: 3. ஆன்லைன் புகார் பதிவு (Online Complaint / Petition Registration)\nH2: தமிழ்நாடு காவல்துறை இணையவழி புகார் மனு பதிவு (TN Police Petition Registration)\n* விளக்கம் (Desc): திருட்டு, பண மோசடி, சொத்து தகராறு, அச்சுறுத்தல், துன்புறுத்தல் உள்ளிட்ட குற்றங்கள் குறித்து காவல் நிலையத்திற்கு நேரடியாகச் செல்லாமல் இணையவழியில் அதிகாரப்பூர்வமாக புகார் மனு அளித்தல்.\n* தகுதி (Eligible): பாதிக்கப்பட்ட எந்தவொரு குடிமகனும் ஆன்லைனில் எந்நேரமும் புகார் மனு பதிவு செய்யலாம்.\n* பயன்கள் (Benefit): புகார் பதிவு செய்தவுடன் மனு எண் (Petition Reference Number / CSR Acknowledgement) உடனடியாக எஸ்.எம்.எஸ் மற்றும் இமெயில் மூலம் வரும்; புகார் தானாகவே சம்பந்தப்பட்ட காவல் நிலையத்திற்கு மாற்றப்பட்டு விசாரணை கண்காணிக்கப்படும்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Complaint Portal)$*LINK(TN Police - Register Complaint)->https://eservices.tnpolice.gov.in/\nஅரசு கட்டணம்$முற்றிலும் இலவசம் (Free)\nரசீது (Receipt)$உடனடி மனு ஒப்புகை எண் (Online Petition / CSR No via SMS & Email)\nவிசாரணை நிலை$ஆன்லைனிலேயே மனுவின் விசாரணை நிலையை (Status) கண்காணிக்கலாம்\nஆதாரங்கள்$புகைப்படங்கள், ஆடியோ/வீடியோ, வங்கிப் பணப் பரிவர்த்தனை நகல் (PDF/JPG)",
    documentRequirements: [
      "புகார்தாரரின் ஆதார் அட்டை, முகவரி மற்றும் தொடர்பு கைபேசி எண்",
      "புகாரின் முழுமையான விவரங்கள் (சம்பவ இடம், தேதி, நேரம், எதிர்மனுதாரர் விவரம்)",
      "ஆதரவு ஆவணங்கள் (புகைப்படங்கள், ஆடியோ/வீடியோ, வங்கி பரிவர்த்தனை ஆவணங்கள் - இருப்பின்)",
      "மின்னஞ்சல் முகவரி (Email ID - ரசீது நகல் பெற)"
    ],
    urls: [
      { label: "TN Police Register Complaint", url: "https://eservices.tnpolice.gov.in/" },
      { label: "TN Police eServices Portal", url: "https://eservices.tnpolice.gov.in/CCTNSNICSDC/Index?0" }
    ],
    payFee: "முற்றிலும் இலவசம் (Free - No Govt Fee)",
    charges: "₹60 - ₹100 Service Charge",
    notes: "புகார் சமர்ப்பித்தவுடன் பெறப்படும் மனு எண்ணை (Petition No) பத்திரமாக வைத்துக் கொள்ளவும். சம்பந்தப்பட்ட நிலைய அதிகாரி உங்களை விசாரணைக்கு அழைக்கும் போது நேரில் செல்ல வேண்டும்."
  },
  {
    id: "police-view-fir-csr-status",
    name: "4. முதல் தகவல் அறிக்கை & மனு நிலை சரிபார்த்தல் (View FIR / CSR Status & Download)",
    category: "Police Services",
    description: "H1: 4. முதல் தகவல் அறிக்கை & மனு நிலை (View FIR / CSR Status & Download)\nH2: காவல்துறை எஃப்.ஐ.ஆர் & சி.எஸ்.ஆர் ஆன்லைன் பார்வை மற்றும் பதிவிறக்கம்\n* விளக்கம் (Desc): கொடுக்கப்பட்ட புகார் மனுவின் தற்போதைய நிலை (CSR Status) மற்றும் காவல் நிலையத்தில் பதிவு செய்யப்பட்ட முதல் தகவல் அறிக்கையின் (FIR) விவரங்களை ஆன்லைனில் பார்வையிட்டு அசல் நகலைப் பதிவிறக்கம் செய்தல்.\n* தகுதி (Eligible): மனு அளித்த புகார்தாரர், எதிர்மனுதாரர், விபத்து/குற்ற வழக்குகளில் பாதிக்கப்பட்டோர் மற்றும் சட்ட வல்லுநர்கள்.\n* பயன்கள் (Benefit): வழக்கின் விசாரணை எந்த நிலையில் உள்ளது என்பதை வெளிப்படையாக அறியலாம்; நீதிமன்றம், இன்சூரன்ஸ் க்ளைம் (Insurance Claims) மற்றும் சட்டப் பணிகளுக்கு தேவையான அதிகாரப்பூர்வ FIR நகலை உடனடியாகப் பெறலாம்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (FIR / CSR Portal)$*LINK(TN Police - View FIR & Petition Status)->https://eservices.tnpolice.gov.in/\nஅரசு கட்டணம்$முற்றிலும் இலவசம் (Free)\nபதிவிறக்க வடிவம்$அதிகாரப்பூர்வ எஃப்.ஐ.ஆர் நகல் (Certified Digital Copy PDF)\nதேவைப்படும் விவரங்கள்$மாவட்டம், காவல் நிலையம், CSR / FIR எண் மற்றும் பதிவு செய்த ஆண்டு\nமொபைல் சரிபார்ப்பு$பதிவு செய்த புகார்தாரர் அல்லது சம்பந்தப்பட்ட நபரின் கைபேசி எண்",
    documentRequirements: [
      "மாவட்டம் (District) மற்றும் காவல் நிலையம் (Police Station) பெயர்",
      "மனு எண் (CSR No) அல்லது எஃப்.ஐ.ஆர் எண் (FIR No) மற்றும் பதிவு செய்யப்பட்ட ஆண்டு",
      "புகார்தாரர் அல்லது எதிர்தரப்பினரின் பெயர் மற்றும் கைபேசி எண் (OTP பெற)"
    ],
    urls: [
      { label: "TN Police View FIR & Petition Status", url: "https://eservices.tnpolice.gov.in/" },
      { label: "CCTNS Citizen Portal", url: "https://eservices.tnpolice.gov.in/CCTNSNICSDC/Index?0" }
    ],
    payFee: "முற்றிலும் இலவசம் (Free - No Govt Fee)",
    charges: "₹30 - ₹50 Service Charge",
    notes: "FIR பதிவு செய்யப்பட்ட 24 மணி நேரத்திற்குள் உச்சநீதிமன்ற வழிகாட்டுதலின்படி இணையதளத்தில் பதிவேற்றப்படுகிறது (பாலியல் மற்றும் ரகசிய வழக்குகள் தவிர்த்து)."
  },
  {
    id: "police-national-cyber-crime-reporting",
    name: "5. தேசிய சைபர் கிரைம் புகார் பதிவு (National Cyber Crime Reporting)",
    category: "Police Services",
    description: "H1: 5. தேசிய சைபர் கிரைம் புகார் பதிவு (National Cyber Crime Reporting)\nH2: இந்திய உள்துறை அமைச்சகம் - தேசிய இணையவழி குற்றப் புகார் போர்ட்டல் (CyberCrime.gov.in)\n* விளக்கம் (Desc): ஆன்லைன் வங்கி பண மோசடி (OTP, UPI, Task Fraud), போலி இணையதள முதலீட்டு மோசடி, பாலியல் அச்சுறுத்தல், அடையாளத் திருட்டு (Identity Theft) மற்றும் சமூக ஊடக மிரட்டல்கள் போன்ற இணையவழிக் குற்றங்கள் குறித்து ஆன்லைனில் புகார் பதிவு செய்தல்.\n* அவசர உதவி எண் (Helpline): 1930 (நிதி மோசடிக்கு உடனடி உதவிக்கு அழைக்கவும்)\n* பயன்கள் (Benefit): நிதி இழப்பு ஏற்பட்ட 24 மணி நேரத்திற்குள் (Golden Hours) 1930 எண் அல்லது இணையதளம் மூலம் புகார் செய்தால், மோசடி செய்யப்பட்ட பணம் குற்றவாளியின் வங்கிக் கணக்கிலிருந்து முடக்கப்பட்டு (Lien / Freeze) மீட்கப்பட அதிக வாய்ப்புள்ளது.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Cyber Crime Portal)$*LINK(National Cyber Crime Reporting Portal)->https://cybercrime.gov.in/\nஅவசர இலவச உதவி எண்$1930 (National Cyber Crime Financial Helpline - 24x7)\nஅரசு கட்டணம்$முற்றிலும் இலவசம் (Free)\nகுற்ற வகைகள்$வங்கி பண மோசடி, UPI/OTP மோசடி, சமூக வலைதள மிரட்டல், குழந்தைகள்/பெண்கள் மீதான குற்றங்கள்\nமுக்கிய ஆவணம்$வங்கி அறிக்கை (Bank Statement with UTR No), SMS/Chat ஸ்கிரீன்ஷாட்கள், மோசடி செய்தவரின் எண்",
    documentRequirements: [
      "புகார்தாரரின் அடையாள அட்டை (ஆதார் அட்டை / பான் கார்டு)",
      "வங்கி பரிவர்த்தனை அறிக்கை (Bank Statement / Transaction UTR No & Reference ID)",
      "மோசடி செய்தவரின் விவரங்கள் (கைபேசி எண், போலி இணையதள முகவரி, சமூக வலைதள ஐடி)",
      "சாட் ஸ்கிரீன்ஷாட்கள், குறுஞ்செய்தி நகல்கள் (SMS Screenshots) அல்லது மின்னஞ்சல் ஆதாரங்கள்"
    ],
    urls: [
      { label: "National Cyber Crime Reporting Portal", url: "https://cybercrime.gov.in/" },
      { label: "TN Police Cyber Wing", url: "https://eservices.tnpolice.gov.in/" }
    ],
    payFee: "முற்றிலும் இலவசம் (Free - No Govt Fee)",
    charges: "₹100 - ₹150 Service Charge",
    notes: "பண மோசடி நடந்தால் உடனடியாக 1930 என்ற எண்ணிற்கு அழைத்து வங்கி பரிவர்த்தனை UTR எண்ணை தெரிவிப்பது பணத்தை உடனடியாக முடக்க (Freeze) மிக அவசியமாகும்."
  },
  {
    id: "police-vehicle-verification",
    name: "6. திருடப்பட்ட / மீட்கப்பட்ட வாகனம் சரிபார்த்தல் (Vehicle Verification)",
    category: "Police Services",
    description: "H1: 6. திருடப்பட்ட / மீட்கப்பட்ட வாகனம் சரிபார்த்தல் (Vehicle Verification)\nH2: காவல்துறையின் தேடப்படும் வாகனங்கள் மற்றும் மீட்கப்பட்ட வாகனங்கள் சரிபார்ப்பு\n* விளக்கம் (Desc): செகண்ட் ஹேண்ட் வாகனம் வாங்கும்போது, அந்த வாகனம் காவல்துறையால் தேடப்படும் திருட்டு வாகனமா என்பதை அல்லது உங்கள் தொலைந்த வாகனம் காவல்துறையினரால் மீட்கப்பட்டுள்ளதா என்பதை ஆன்லைனில் சரிபார்த்தல்.\n* தகுதி (Eligible): பழைய வாகனம் வாங்குவோர், வாகன விற்பனையாளர்கள் மற்றும் வாகனம் தொலைத்த உரிமையாளர்கள்.\n* பயன்கள் (Benefit): திருட்டு வழக்கில் சிக்கியுள்ள வாகனங்களை தவறுதலாக வாங்குவதைத் தவிர்க்கலாம்; சட்டரீதியான சிக்கல்களில் இருந்து தப்பிக்க முன்கூட்டியே வாகனத்தின் நம்பகத்தன்மையை உறுதி செய்யலாம்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (TN Police Vehicle Check)$*LINK(TN Police Vehicle Verification)->https://eservices.tnpolice.gov.in/\nதேசிய போர்ட்டல் (Digital Police)$*LINK(Digital Police Portal)->https://digitalpolice.gov.in/\nஅரசு கட்டணம்$முற்றிலும் இலவசம் (Free)\nசரிபார்க்கும் முறை$வாகன எண் (Registration No), சேஸிஸ் எண் (Chassis No), என்ஜின் எண் (Engine No)\nபயன்$திருட்டு வாகன விபரம், வழக்கு நிலுவை மற்றும் மீட்கப்பட்ட வாகன விபரங்களை உடனே அறிதல்",
    documentRequirements: [
      "வாகனப் பதிவு எண் (Vehicle Registration Number)",
      "என்ஜின் எண் (Engine Number) அல்லது சேஸிஸ் எண் (Chassis Number)",
      "வாகன ஆர்.சி புக் நகல் (RC Book Copy - இருப்பின்)"
    ],
    urls: [
      { label: "TN Police Vehicle Verification", url: "https://eservices.tnpolice.gov.in/" },
      { label: "Digital Police Portal (MHA)", url: "https://digitalpolice.gov.in/" }
    ],
    payFee: "முற்றிலும் இலவசம் (Free - No Govt Fee)",
    charges: "₹30 - ₹50 Service Charge",
    notes: "செகண்ட் ஹேண்ட் வாகனம் வாங்கும் முன் காவல்துறையின் இந்த சரிபார்ப்பை மேற்கொள்வது பின்னாளில் ஏற்படும் குற்றவியல் வழக்கு சிக்கல்களில் இருந்து உங்களைப் பாதுகாக்கும்."
  },
  {
    id: "police-kaaval-uthavi-app",
    name: "7. 'காவல் உதவி' செயலி சேவைகள் (TN Police 'Kaaval Uthavi' App)",
    category: "Police Services",
    description: "H1: 7. 'காவல் உதவி' செயலி சேவைகள் (TN Police 'Kaaval Uthavi' App)\nH2: தமிழ்நாடு காவல்துறை பிரத்யேக அவசர பாதுகாப்பு மொபைல் செயலி\n* விளக்கம் (Desc): அவசர ஆபத்துக் காலங்களில் உடனடியாக காவல்துறை உதவி பெறவும் (SOS Alert), ரோந்து வாகனத்தை வரவழைக்கவும் மற்றும் 60-க்கும் மேற்பட்ட ஆன்லைன் காவல் சேவைகளைப் பெறவும் தமிழ்நாடு காவல்துறை உருவாக்கிய பிரத்யேக கைபேசி செயலி.\n* அவசர உதவி எண்கள்: 112 (Police Emergency), 100 (Police), 181 (Women Helpline)\n* பயன்கள் (Benefit): 'SOS' பட்டனை அழுத்தினால் உடனே ஜிபிஎஸ் (GPS) நேரடி இருப்பிடத்துடன் காவல்துறை கட்டுப்பாட்டு அறைக்கு எச்சரிக்கை செல்லும்; பெண்கள், முதியவர்கள் மற்றும் பயணிகளுக்கு 24x7 நேரடி பாதுகாப்பு உத்தரவாதம் அளிக்கிறது.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Play Store App)$*LINK(Google Play Store - Kaaval Uthavi App)->https://play.google.com/store/apps/details?id=com.police.kaavaluthavi\nஅவசர உதவி அழைப்பு$112 (TN Police Master Emergency Call)\nசெயலி கட்டணம்$முற்றிலும் இலவசம் (Free Download)\nமுக்கிய வசதிகள்$SOS அவசர பொத்தான், நேரடி GPS இருப்பிட பகிர்வு, காவல் நிலைய விவரங்கள், 60+ மின் சேவைகள்\nபதிவுத் தேவை$ஆண்ட்ராய்டு/ஆப்பிள் ஸ்மார்ட்போன் & அவசர தொடர்பு எண்கள் (2 குடும்ப உறுப்பினர்கள்)",
    documentRequirements: [
      "ஸ்மார்ட்போன் மற்றும் கைபேசி எண் (OTP பதிவு செய்வதற்கு)",
      "அவசர காலத்தில் தகவல் தெரிவிக்க 2 குடும்ப உறுப்பினர்களின் தொடர்பு எண்கள் (Emergency Contacts)",
      "இருப்பிட ஜிபிஎஸ் (GPS Location Access - கட்டாயம் இயக்கத்தில் இருக்க வேண்டும்)"
    ],
    urls: [
      { label: "Google Play Store - Kaaval Uthavi", url: "https://play.google.com/store/apps/details?id=com.police.kaavaluthavi" },
      { label: "TN Police Official Portal", url: "https://eservices.tnpolice.gov.in/" }
    ],
    payFee: "முற்றிலும் இலவசம் (Free Download)",
    charges: "இலவசம் / ஆப் நிறுவல் உதவி ₹20",
    notes: "அவசர காலத்தில் SOS பட்டனைத் தொட்டால், தானாகவே காவல் கட்டுப்பாட்டு அறைக்கும், நீங்கள் உள்ளிட்ட குடும்பத்தினர் எண்களுக்கும் உங்கள் நேரடி GPS இருப்பிடத்துடன் அவசர அழைப்பு செல்லும்."
  },
  {
    id: "exam-tnpsc-group-4-vao",
    name: "1.1. TNPSC Group 4 & VAO (கிராம நிர்வாக அலுவலர் & இளநிலை உதவியாளர்)",
    category: "Competitive Exams",
    description: "H1: 1.1. TNPSC Group 4 & VAO (கிராம நிர்வாக அலுவலர் & இளநிலை உதவியாளர்)\nH2: தமிழ்நாடு அரசுப் பணியாளர் தேர்வாணையம் (TNPSC Group-IV Services)\n* விளக்கம் (Desc): 10-ஆம் வகுப்பு முடித்தவர்களுக்கான தமிழகத்தின் மிகப்பெரிய நேரடி அரசுப் பணித் தேர்வு; நேர்முகத் தேர்வு (No Interview) இன்றி எழுத்துத் தேர்வு மதிப்பெண் மூலம் மட்டுமே பணி நியமனம் செய்யப்படுகிறது.\n* கல்வித் தகுதி (Eligibility): 10-ஆம் வகுப்பு (SSLC) தேர்ச்சி பெற்றிருக்க வேண்டும்.\n* பயன்கள் (Benefit): கிராம நிர்வாக அலுவலர் (VAO), இளநிலை உதவியாளர் (Junior Assistant), தட்டச்சர் (Typist), வரி வசூலிப்பாளர் (Bill Collector) போன்ற சொந்த மாவட்டத்திலேயே பணியாற்றக்கூடிய நிரந்தர அரசுப் பணி.\n---\ntable:\nதேர்வு விபரம்$தகவல்\nஇணைய இணைப்பு (Apply Portal)$*LINK(TNPSC Exams Portal)->https://www.tnpscexams.in/\nஅதிகாரப்பூர்வ தளம்$*LINK(TNPSC Official Website)->https://www.tnpsc.gov.in/\nநிரந்தரப் பதிவு (OTR)$₹150 (5 ஆண்டுகளுக்கு செல்லுபடியாகும்)\nதேர்வுக் கட்டணம்$₹100 (SC/ST/விதவை/மாற்றுத்திறனாளிகளுக்கு முழு விலக்கு; BC/MBC/BCM-க்கு 3 முறை இலவசம்)\nஇடஒதுக்கீடு சலுகை$PSTM (தமிழ் வழிக் கல்வி) சான்றிதழ் வைத்திருப்போருக்கு 20% முன்னுரிமை",
    documentRequirements: [
      "10-ஆம் வகுப்பு / 12-ஆம் வகுப்பு மதிப்பெண் சான்றிதழ்",
      "சாதிச் சான்றிதழ் (Community Certificate)",
      "தமிழ் வழியில் பயின்றதற்கான சான்றிதழ் (PSTM Certificate - 20% இடஒதுக்கீட்டிற்கு)",
      "தட்டச்சர் / சுருக்கெழுத்தர் பதவிக்கு: அரசு தட்டச்சு தொழில்நுட்ப தேர்வு சான்றிதழ் (Typist/Steno)",
      "ஆதார் அட்டை, பாஸ்போர்ட் அளவு புகைப்படம் மற்றும் கையொப்பம்"
    ],
    urls: [
      { label: "TNPSC Exams Apply Portal", url: "https://www.tnpscexams.in/" },
      { label: "TNPSC Official Portal", url: "https://www.tnpsc.gov.in/" }
    ],
    payFee: "OTR: ₹150 (5 ஆண்டுகள்) | தேர்வுக் கட்டணம்: ₹100 (விலக்கு பிரிவினருக்கு இலவசம்)",
    charges: "₹100 - ₹150 Service Charge",
    notes: "10-ஆம் வகுப்பு முடித்தவர்களுக்கான நேரடி அரசுப் பணி. நேர்முகத் தேர்வு கிடையாது (No Interview). PSTM சான்றிதழ் மூலம் 20% இடஒதுக்கீடு பெறலாம்."
  },
  {
    id: "exam-tnpsc-group-2-2a",
    name: "1.2. TNPSC Group 2 & 2A (Combined Civil Services-II)",
    category: "Competitive Exams",
    description: "H1: 1.2. TNPSC Group 2 & 2A (Combined Civil Services-II)\nH2: தமிழ்நாடு அரசு சார்நிலை பணிகள் தேர்வு (TNPSC Group-II & IIA)\n* விளக்கம் (Desc): ஏதேனும் ஒரு பட்டப்படிப்பு (Any Degree) முடித்தவர்களுக்கான மாநில அளவிலான நடுத்தர மற்றும் உயர்நிலை நிர்வாகப் பணிகளுக்கான இருநிலைத் தேர்வு (முதல்நிலை மற்றும் முதன்மைத் தேர்வு).\n* கல்வித் தகுதி (Eligibility): ஏதேனும் ஒரு அங்கீகரிக்கப்பட்ட பட்டப்படிப்பு (Any Bachelor Degree).\n* பயன்கள் (Benefit): சார்பதிவாளர் (Sub-Registrar), நகராட்சி ஆணையர் (Municipal Commissioner), தலைமைச் செயலக உதவிப் பிரிவு அலுவலர் (ASO), வருவாய் ஆய்வாளர் (RI), தணிக்கையாளர் (Auditor) போன்ற கெளரவமிக்க உயர் பதவிகள்.\n---\ntable:\nதேர்வு விபரம்$தகவல்\nஇணைய இணைப்பு (Apply Portal)$*LINK(TNPSC Application Portal)->https://www.tnpscexams.in/\nஅதிகாரப்பூர்வ தளம்$*LINK(TNPSC Official Website)->https://www.tnpsc.gov.in/\nமுதல்நிலைத் தேர்வு (Prelims)$₹100 (விதிவிலக்கு பிரிவினருக்கு விலக்கு உண்டு)\nமுதன்மைத் தேர்வு (Mains)$₹150 (முதல்நிலை தேர்வில் தேர்ச்சி பெற்றவர்களுக்கு மட்டும்)\nதேர்வு முறை$Group 2: Prelims + Mains + Interview | Group 2A: Prelims + Mains (Non-Interview)",
    documentRequirements: [
      "பட்டப்படிப்பு சான்றிதழ் (Provisional / Degree Certificate)",
      "10, 12-ஆம் வகுப்பு சான்றிதழ்கள் & சாதிச் சான்றிதழ்",
      "PSTM சான்றிதழ் (பள்ளி முதல் கல்லூரி வரை தமிழில் பயின்றிருந்தால்)",
      "ஆதார் அட்டை, பாஸ்போர்ட் அளவு புகைப்படம், கையொப்பம்"
    ],
    urls: [
      { label: "TNPSC Exams Apply Portal", url: "https://www.tnpscexams.in/" },
      { label: "TNPSC Official Portal", url: "https://www.tnpsc.gov.in/" }
    ],
    payFee: "Prelims: ₹100 | Mains: ₹150 (விதிவிலக்கு பிரிவினருக்கு இலவசம்)",
    charges: "₹100 - ₹150 Service Charge",
    notes: "சார்பதிவாளர் (Sub-Registrar), நகராட்சி ஆணையர், ASO, வருவாய் ஆய்வாளர் (RI) போன்ற கெளரவமிக்க பணிகளுக்கான தேர்வு."
  },
  {
    id: "exam-tnpsc-group-1",
    name: "1.3. TNPSC Group 1 (Combined Civil Services-I)",
    category: "Competitive Exams",
    description: "H1: 1.3. TNPSC Group 1 (Combined Civil Services-I)\nH2: தமிழக அரசின் முதன்மை தலைமை நிர்வாகப் பணிகள் தேர்வு\n* விளக்கம் (Desc): தமிழக அரசின் தலைமை நிர்வாகப் பணிகளுக்கான முதன்மையான குரூப்-1 தேர்வு (முதல்நிலைத் தேர்வு, முதன்மைத் தேர்வு மற்றும் நேர்முகத் தேர்வு கொண்டது).\n* கல்வித் தகுதி (Eligibility): ஏதேனும் ஒரு அங்கீகரிக்கப்பட்ட பல்கலைக்கழகத்தின் பட்டப்படிப்பு (Any Degree).\n* பயன்கள் (Benefit): துணை ஆட்சியர் (Deputy Collector - RDO), காவல் துணைக் கண்காணிப்பாளர் (DSP), வணிகவரி உதவி ஆணையர் (Commercial Tax Officer), மாவட்ட பதிவாளர் (District Registrar) ஆகிய உயர் அரசுப் பொறுப்புகள்; எதிர்காலத்தில் IAS / IPS பதவி உயர்வு வாய்ப்பு.\n---\ntable:\nதேர்வு விபரம்$தகவல்\nஇணைய இணைப்பு (Apply Portal)$*LINK(TNPSC Application Portal)->https://www.tnpscexams.in/\nமுதல்நிலைத் தேர்வு (Prelims)$₹100 (SC/ST/விதவை/மாற்றுத்திறனாளிகளுக்கு முழு விலக்கு)\nமுதன்மைத் தேர்வு (Mains)$₹200 (விரிவாக விடையளிக்கும் எழுத்துத் தேர்வு)\nநேர்முகத் தேர்வு (Interview)$100 மதிப்பெண்கள் (சென்னை TNPSC தலைமை அலுவலகத்தில்)\nமுக்கிய பதவிகள்$Deputy Collector (RDO), DSP, Assistant Commissioner (CT), District Registrar",
    documentRequirements: [
      "அங்கீகரிக்கப்பட்ட பல்கலைக்கழகத்தின் பட்டப்படிப்பு சான்றிதழ் (Degree Certificate)",
      "சாதிச் சான்றிதழ் மற்றும் 10th, 12th மதிப்பெண் சான்றிதழ்கள்",
      "PSTM சான்றிதழ் (பொருந்தினால்)",
      "அடையாளச் சான்று (ஆதார் அட்டை) மற்றும் பாஸ்போர்ட் புகைப்படங்கள்"
    ],
    urls: [
      { label: "TNPSC Exams Apply Portal", url: "https://www.tnpscexams.in/" },
      { label: "TNPSC Official Portal", url: "https://www.tnpsc.gov.in/" }
    ],
    payFee: "Prelims: ₹100 | Mains: ₹200 (விதிவிலக்கு பிரிவினருக்கு முழு விலக்கு)",
    charges: "₹150 - ₹200 Service Charge",
    notes: "துணை ஆட்சியர் (RDO), டி.எஸ்.பி (DSP) போன்ற தமிழகத்தின் உயரிய நிர்வாகப் பதவிகள். எதிர்காலத்தில் IAS, IPS கேடராக பதவி உயர்வு பெறலாம்."
  },
  {
    id: "exam-tnusrb-police-constable",
    name: "1.4. TNUSRB இரண்டாம் நிலை காவலர் (Police Constable / Jail Warder / Fireman)",
    category: "Competitive Exams",
    description: "H1: 1.4. TNUSRB இரண்டாம் நிலை காவலர் (Police Constable / Jail Warder / Fireman)\nH2: தமிழ்நாடு சீருடைப் பணியாளர் தேர்வு வாரியம் (TNUSRB Common Recruitment)\n* விளக்கம் (Desc): தமிழ்நாடு சீருடைப் பணியாளர் தேர்வு வாரியம் நடத்தும் 10-ஆம் வகுப்பு கல்வித் தகுதிக்கான ஆயுதப்படை, சிறைத்துறை மற்றும் தீயணைப்புத்துறை களப்பணித் தேர்வு.\n* கல்வித் தகுதி (Eligibility): 10-ஆம் வகுப்பு (SSLC) தேர்ச்சி பெற்றிருக்க வேண்டும்.\n* பயன்கள் (Benefit): இரண்டாம் நிலை காவலர் (PC), சிறைக் காவலர் (Jail Warder) மற்றும் தீயணைப்பாளர் (Fireman) போன்ற சீருடைப் பணிகள்; மருத்துவச் சலுகைகள் மற்றும் சீருடைப் படிகள்.\n---\ntable:\nதேர்வு விபரம்$தகவல்\nஇணைய இணைப்பு (TNUSRB Portal)$*LINK(TNUSRB Official Recruitment Portal)->https://www.tnusrb.tn.gov.in/\nவிண்ணப்பக் கட்டணம்$₹500 (அனைத்து பிரிவினருக்கும்)\nதேர்வு நிலைகள்$தமிழ் தகுதித் தேர்வு + முதன்மை எழுத்துத் தேர்வு + உடற்தகுதி தேர்வு (PET/PMT)\nகூடுதல் மதிப்பெண்கள்$NCC, NSS மற்றும் விளையாட்டுச் சான்றிதழ்களுக்கு சிறப்பு மதிப்பெண்கள் உண்டு",
    documentRequirements: [
      "10-ஆம் வகுப்பு மதிப்பெண் சான்றிதழ் (SSLC Marksheet)",
      "சாதிச் சான்றிதழ், இருப்பிடச் சான்றிதழ் (Nativity Certificate)",
      "உடற்தகுதி சான்றுகள் மற்றும் NCC/NSS/விளையாட்டுச் சான்றிதழ்கள் (சிறப்பு மதிப்பெண்களுக்கு)",
      "ஆதார் அட்டை மற்றும் புகைப்படம்"
    ],
    urls: [
      { label: "TNUSRB Official Portal", url: "https://www.tnusrb.tn.gov.in/" },
      { label: "TN Police eServices", url: "https://eservices.tnpolice.gov.in/" }
    ],
    payFee: "விண்ணப்பக் கட்டணம் ₹500 (அனைத்து பிரிவினருக்கும்)",
    charges: "₹100 - ₹150 Service Charge",
    notes: "ஆயுதப்படை, சிறப்பு காவல் படை (TSP), சிறைத்துறை மற்றும் தீயணைப்புத்துறை பணிகளுக்கான தேர்வு. எழுத்துத் தேர்வு மற்றும் உடற்தகுதி தேர்வு உண்டு."
  },
  {
    id: "exam-tnusrb-sub-inspector",
    name: "1.5. TNUSRB உதவி ஆய்வாளர் (Sub-Inspector of Police - Taluk, AR, TSP)",
    category: "Competitive Exams",
    description: "H1: 1.5. TNUSRB உதவி ஆய்வாளர் (Sub-Inspector of Police - Taluk, AR, TSP)\nH2: தமிழ்நாடு காவல் துறை சப்-இன்ஸ்பெக்டர் நேரடி நியமனத் தேர்வு\n* விளக்கம் (Desc): ஏதேனும் ஒரு பட்டப்படிப்பு முடித்தவர்களுக்கான தமிழ்நாடு காவல் துறையின் சப்-இன்ஸ்பெக்டர் நேரடி நியமனத் தேர்வு (எழுத்துத் தேர்வு + உடற்தகுதித் தேர்வு + நேர்முகத் தேர்வு).\n* கல்வித் தகுதி (Eligibility): அங்கீகரிக்கப்பட்ட பல்கலைக்கழகத்தில் ஏதேனும் ஒரு பட்டப்படிப்பு (Any Degree).\n* பயன்கள் (Benefit): காவல் நிலைய பொறுப்பு அதிகாரி (Sub-Inspector) பதவி; இன்ஸ்பெக்டர் மற்றும் DSP பதவி உயர்வு வாய்ப்புகள்.\n---\ntable:\nதேர்வு விபரம்$தகவல்\nஇணைய இணைப்பு (TNUSRB SI Portal)$*LINK(TNUSRB Portal)->https://www.tnusrb.tn.gov.in/\nதேர்வுக் கட்டணம்$₹500 (துறைசார் ஒதுக்கீடு இரண்டிற்கும் சேர்த்து விண்ணப்பித்தால் ₹1,000)\nதேர்வு முறைகள்$எழுத்துத் தேர்வு (முதன்மை) + உடல் அளவு சரிபார்ப்பு + உடற்தகுதி தேர்வு + நேர்முகத் தேர்வு\nபதவிப் பிரிவுகள்$காவல் உதவி ஆய்வாளர் (Taluk), ஆயுதப்படை (AR), தமிழ்நாடு சிறப்புக் காவல் படை (TSP)",
    documentRequirements: [
      "இளங்கலை பட்டப்படிப்பு சான்றிதழ் (Degree Certificate)",
      "10, 12-ஆம் வகுப்பு மற்றும் சாதிச் சான்றிதழ்கள்",
      "துறைசார்ந்த விண்ணப்பதாரர்களுக்கு (Departmental Quota): சேவைச் சான்றிதழ் (Service Certificate)",
      "PSTM சான்றிதழ் (பொருந்தினால்), ஆதார் அட்டை, புகைப்படம்"
    ],
    urls: [
      { label: "TNUSRB Official Portal", url: "https://www.tnusrb.tn.gov.in/" }
    ],
    payFee: "தேர்வுக் கட்டணம் ₹500 (துறைசார் + திறந்தவெளி இரண்டிற்கும் ₹1,000)",
    charges: "₹100 - ₹150 Service Charge",
    notes: "காவல் நிலைய பொறுப்பு அதிகாரி (Sub-Inspector) நேரடி நியமனம். எழுத்துத் தேர்வு, உடற்தகுதி தேர்வு (PET) மற்றும் நேர்முகத் தேர்வு கொண்டது."
  },
  {
    id: "exam-trb-teachers-recruitment",
    name: "1.6. TRB - ஆசிரியர் தகுதித் தேர்வு & நியமனம் (TNTET / PG TRB)",
    category: "Competitive Exams",
    description: "H1: 1.6. TRB - ஆசிரியர் தகுதித் தேர்வு & நியமனம் (TNTET / PG TRB)\nH2: தமிழ்நாடு ஆசிரியர் தேர்வு வாரியம் (Teachers Recruitment Board)\n* விளக்கம் (Desc): தமிழக அரசுப் பள்ளிகளில் இடைநிலை, பட்டதாரி மற்றும் முதுகலை ஆசிரியர்களாகப் பணியாற்ற ஆசிரியர் தேர்வு வாரியம் (TRB) நடத்தும் தகுதி மற்றும் போட்டித் தேர்வுகள்.\n* கல்வித் தகுதி (Eligibility): D.El.Ed / D.T.Ed (TNTET தாள்-1) | B.Ed (TNTET தாள்-2) | முதுகலை பட்டத்துடன் B.Ed (PG TRB).\n* பயன்கள் (Benefit): அரசுப் பள்ளி மற்றும் அரசு உதவிபெறும் பள்ளிகளில் நிரந்தர ஆசிரியர் பணி (SGT, B.T. Assistant, P.G. Assistant).\n---\ntable:\nதேர்வு விபரம்$தகவல்\nஇணைய இணைப்பு (TRB Portal)$*LINK(TRB Official Portal)->https://trb.tn.gov.in/\nகட்டணம் (பொதுப் பிரிவு)$₹500\nகட்டணம் (SC/ST/மாற்றுத்திறனாளிகள்)$₹250\nதேர்வுகள்$TNTET (ஆசிரியர் தகுதித் தேர்வு தாள் 1 & 2), PG TRB, வட்டாரக் கல்வி அலுவலர் (BEO)",
    documentRequirements: [
      "ஆசிரியர் பட்டயப்படிப்பு (D.El.Ed / D.T.Ed) அல்லது B.Ed / M.Ed சான்றிதழ்",
      "இளங்கலை அல்லது முதுகலை பட்டப்படிப்பு மதிப்பெண் சான்றிதழ்கள்",
      "சாதிச் சான்றிதழ், ஆதார் அட்டை மற்றும் புகைப்படம்"
    ],
    urls: [
      { label: "TRB Official Portal", url: "https://trb.tn.gov.in/" }
    ],
    payFee: "பொதுப் பிரிவு: ₹500 | SC/ST/மாற்றுத்திறனாளிகளுக்கு: ₹250",
    charges: "₹100 - ₹150 Service Charge",
    notes: "தமிழக அரசு மற்றும் அரசு உதவிபெறும் பள்ளிகளில் இடைநிலை, பட்டதாரி (BT Assistant) மற்றும் முதுகலை (PG Assistant) ஆசிரியர் பணிகளுக்கான அதிகாரப்பூர்வ தேர்வு."
  },
  {
    id: "exam-ssc-mts-havaldar",
    name: "2.1. SSC MTS & Havaldar (பல்நோக்கு பணியாளர் & ஹவில்தார்)",
    category: "Competitive Exams",
    description: "H1: 2.1. SSC MTS & Havaldar (பல்நோக்கு பணியாளர் & ஹவில்தார்)\nH2: மத்திய அரசு பணியாளர் தேர்வாணையம் - மல்டி டாஸ்கிங் ஸ்டாப் தேர்வு\n* விளக்கம் (Desc): 10-ஆம் வகுப்பு கல்வித் தகுதி கொண்டவர்களுக்கான மத்திய அரசு அமைச்சகங்கள் மற்றும் துறைகளில் காலியாக உள்ள அலுவலக உதவியாளர் மற்றும் சுங்கத்துறை ஹவில்தார் பணிகளுக்கான கணினி வழித் தேர்வு (CBT).\n* கல்வித் தகுதி (Eligibility): 10-ஆம் வகுப்பு (Matriculation) தேர்ச்சி.\n* பயன்கள் (Benefit): மத்திய அரசின் நேரடி அலுவலகப் பணி; தமிழ் மொழியிலும் இத்தேர்வை எழுதலாம்; பணிப் பாதுகாப்பும் வருடாந்திர ஊதிய உயர்வும் உண்டு.\n---\ntable:\nதேர்வு விபரம்$தகவல்\nஇணைய இணைப்பு (SSC Portal)$*LINK(SSC Official Portal)->https://ssc.gov.in/\nவிண்ணப்பக் கட்டணம்$₹100 (பெண்கள், SC, ST, PwD மற்றும் முன்னாள் ராணுவத்தினருக்கு முற்றிலும் இலவசம்)\nதேர்வு மொழி$தமிழ் உள்ளிட்ட 13 பிராந்திய மொழிகளில் கணினித் தேர்வு எழுதலாம்\nபதவிகள்$MTS (General Central Service Group 'C' Non-Gazetted), Havaldar in CBIC and CBN",
    documentRequirements: [
      "10-ஆம் வகுப்பு மதிப்பெண் பட்டியல் (Matriculation Marksheet)",
      "சாதிச் சான்றிதழ் (மத்திய அரசு OBC-NCL / SC / ST / EWS படிவத்தில்)",
      "ஆதார் அட்டை, நேரலை புகைப்படம் (Live Photo Web Capture), கையொப்பம்"
    ],
    urls: [
      { label: "SSC Official Portal", url: "https://ssc.gov.in/" }
    ],
    payFee: "₹100 (பெண்கள், SC, ST, மாற்றுத்திறனாளிகளுக்கு முற்றிலும் இலவசம்)",
    charges: "₹100 Service Charge",
    notes: "10-ஆம் வகுப்பு கல்வித் தகுதி. தமிழ் மொழியிலும் தேர்வு எழுதலாம். மத்திய அரசு அமைச்சகங்களில் நேரடி நிரந்தர அலுவலகப் பணி."
  },
  {
    id: "exam-ssc-chsl-10-plus-2",
    name: "2.2. SSC CHSL (10+2 Combined Higher Secondary Level)",
    category: "Competitive Exams",
    description: "H1: 2.2. SSC CHSL (10+2 Combined Higher Secondary Level)\nH2: மத்திய அரசு 12-ஆம் வகுப்பு தகுதிக்கான எழுத்தர் பணிகள் தேர்வு\n* விளக்கம் (Desc): 12-ஆம் வகுப்பு தேர்ச்சி பெற்றவர்களுக்கான மத்திய அரசின் எழுத்தர், கணினி இயக்குபவர் பணிகளுக்கான தேசிய அளவிலான தேர்வு (Tier 1 & Tier 2).\n* கல்வித் தகுதி (Eligibility): 12-ஆம் வகுப்பு (+2 Higher Secondary) தேர்ச்சி.\n* பயன்கள் (Benefit): கீழ்நிலை எழுத்தர் (LDC), இளநிலை செயலக உதவியாளர் (JSA), மற்றும் தரவு உள்ளீட்டாளர் (Data Entry Operator - DEO) பதவிகள்.\n---\ntable:\nதேர்வு விபரம்$தகவல்\nஇணைய இணைப்பு (SSC Portal)$*LINK(SSC Application Portal)->https://ssc.gov.in/\nவிண்ணப்பக் கட்டணம்$₹100 (பெண்கள் மற்றும் SC/ST பிரிவினருக்கு முழு விலக்கு)\nதேர்வு நிலைகள்$Tier-1 (கணினி வழித் தேர்வு - தமிழ் மொழியிலும் எழுதலாம்) & Tier-2\nபதவிகள்$LDC, Junior Secretariat Assistant (JSA), Data Entry Operator (DEO)",
    documentRequirements: [
      "12-ஆம் வகுப்பு மற்றும் 10-ஆம் வகுப்பு மதிப்பெண் சான்றிதழ்கள்",
      "சாதிச் சான்றிதழ் (Central Govt Format), ஆதார் அட்டை",
      "கணினி வழியே பதிவேற்றப்படும் பாஸ்போர்ட் அளவு புகைப்படம் மற்றும் கையொப்பம்"
    ],
    urls: [
      { label: "SSC Official Portal", url: "https://ssc.gov.in/" }
    ],
    payFee: "₹100 (பெண்கள் மற்றும் SC/ST பிரிவினருக்கு முழு விலக்கு)",
    charges: "₹100 Service Charge",
    notes: "LDC, Junior Secretariat Assistant (JSA), Data Entry Operator (DEO) பணிகளுக்கான தேசிய அளவிலான தேர்வு."
  },
  {
    id: "exam-ssc-cgl-graduate-level",
    name: "2.3. SSC CGL (Combined Graduate Level)",
    category: "Competitive Exams",
    description: "H1: 2.3. SSC CGL (Combined Graduate Level)\nH2: மத்திய அரசு பட்டதாரிகளுக்கான முதன்மை குரூப் 'B' மற்றும் 'C' பணிகள் தேர்வு\n* விளக்கம் (Desc): மத்திய அரசின் அமைச்சகங்கள், புலனாய்வு அமைப்புகள் மற்றும் வருவாய்த் துறைகளில் உள்ள குரூப் 'B' மற்றும் 'C' கெஜட்டட் அல்லாத முக்கிய பணிகளுக்கான முதன்மைத் தேர்வு.\n* கல்வித் தகுதி (Eligibility): அங்கீகரிக்கப்பட்ட ஏதேனும் ஒரு பட்டப்படிப்பு (Any Degree).\n* பயன்கள் (Benefit): வருமான வரி ஆய்வாளர் (Income Tax Inspector), ஜிஎஸ்டி & கலால் ஆய்வாளர் (GST/Excise Inspector), சிபிஐ எஸ்.ஐ (CBI Sub-Inspector), அமலாக்கத்துறை உதவி அதிகாரி (ED), தணிக்கை அதிகாரி (CAG Auditor) போன்ற மிக உயரிய மத்திய அரசுப் பதவிகள்.\n---\ntable:\nதேர்வு விபரம்$தகவல்\nஇணைய இணைப்பு (SSC Portal)$*LINK(SSC Official Portal)->https://ssc.gov.in/\nவிண்ணப்பக் கட்டணம்$₹100 (பெண்கள், SC/ST பிரிவினருக்கு இலவசம்)\nதேர்வு முறை$Tier-1 கணினி வழித் தேர்வு & Tier-2 விரிவான கணினி தேர்வு + தட்டச்சு\nமுக்கிய பதவிகள்$Income Tax Inspector, GST Inspector, Assistant Section Officer, CBI SI, CAG Auditor",
    documentRequirements: [
      "அங்கீகரிக்கப்பட்ட ஏதேனும் ஒரு பட்டப்படிப்பு சான்றிதழ் (Degree Certificate)",
      "பள்ளி மார்க்ஷீட்கள், சாதிச் சான்றிதழ், ஆதார் அட்டை, புகைப்படம்"
    ],
    urls: [
      { label: "SSC Official Portal", url: "https://ssc.gov.in/" }
    ],
    payFee: "₹100 (பெண்கள், SC/ST பிரிவினருக்கு இலவசம்)",
    charges: "₹100 Service Charge",
    notes: "வருமான வரி ஆய்வாளர் (Income Tax Inspector), GST/Excise Inspector, CBI Sub-Inspector, ED, CAG Auditor போன்ற மிக உயரிய மத்திய அரசு குரூப் B/C பதவிகள்."
  },
  {
    id: "exam-ssc-gd-constable",
    name: "2.4. SSC GD Constable (துணை ராணுவப் படை காவலர்)",
    category: "Competitive Exams",
    description: "H1: 2.4. SSC GD Constable (துணை ராணுவப் படை காவலர்)\nH2: மத்திய ஆயுத காவல் படைகள் (CAPFs) கான்ஸ்டபிள் பொதுப் பணி தேர்வு\n* விளக்கம் (Desc): 10-ஆம் வகுப்பு முடித்த இளைஞர்களுக்கான மத்திய ஆயுத காவல் படைகளில் (CAPF) உள்ள கான்ஸ்டபிள் பணியிடங்களுக்கான தேர்வு.\n* கல்வித் தகுதி (Eligibility): 10-ஆம் வகுப்பு (Matriculation) தேர்ச்சி.\n* பயன்கள் (Benefit): BSF, CISF, CRPF, ITBP, SSB, SSF மற்றும் அசாம் ரைபிள்ஸ் படைகளில் சீருடைப் பணி; தமிழ் மொழியிலும் தேர்வு எழுதலாம்.\n---\ntable:\nதேர்வு விபரம்$தகவல்\nஇணைய இணைப்பு (SSC Portal)$*LINK(SSC GD Application Portal)->https://ssc.gov.in/\nவிண்ணப்பக் கட்டணம்$₹100 (பெண்கள் மற்றும் SC/ST பிரிவினருக்கு இலவசம்)\nபடைகள்$BSF, CISF, CRPF, ITBP, SSB, SSF மற்றும் அசாம் ரைபிள்ஸ்\nதேர்வு நிலைகள்$கணினித் தேர்வு (CBT - தமிழில்) + உடற்தகுதி தேர்வு (PST/PET) + மருத்துவப் பரிசோதனை",
    documentRequirements: [
      "10-ஆம் வகுப்பு சான்றிதழ், சாதிச் சான்றிதழ், இருப்பிடச் சான்றிதழ் (Domicile Certificate)",
      "ஆதார் அட்டை, புகைப்படம், கையொப்பம்"
    ],
    urls: [
      { label: "SSC Official Portal", url: "https://ssc.gov.in/" }
    ],
    payFee: "₹100 (பெண்கள் மற்றும் SC/ST பிரிவினருக்கு இலவசம்)",
    charges: "₹100 Service Charge",
    notes: "BSF, CISF, CRPF, ITBP, SSB, SSF, அசாம் ரைபிள்ஸ் படைகளில் கான்ஸ்டபிள் பணி. தமிழ் மொழியிலும் கணினித் தேர்வு எழுதலாம்."
  },
  {
    id: "exam-rrb-ntpc-graduate-undergraduate",
    name: "3.1. RRB NTPC (Graduate & Undergraduate Posts)",
    category: "Competitive Exams",
    description: "H1: 3.1. RRB NTPC (Graduate & Undergraduate Posts)\nH2: இந்திய ரயில்வே பணியாளர் தேர்வு வாரியம் - நான்-டெக்னிக்கல் பாப்புலர் கேட்டகரி\n* விளக்கம் (Desc): இந்திய ரயில்வேயில் தொழில்நுட்பம் அல்லாத மக்கள் தொடர்பு, நிர்வாகம் மற்றும் வர்த்தகப் பணிகளுக்கான அகில இந்திய அளவிலான கணினித் தேர்வு (CBT 1 & CBT 2).\n* கல்வித் தகுதி (Eligibility): 12-ஆம் வகுப்பு (Undergraduate) அல்லது ஏதேனும் ஒரு பட்டப்படிப்பு (Graduate).\n* பயன்கள் (Benefit): ஸ்டேஷன் மாஸ்டர் (Station Master), சரக்கு ரயில் கார்டு (Goods Train Manager), பயணச்சீட்டு எழுத்தர் (Commercial Ticket Clerk), அலுவலக எழுத்தர் (Junior Clerk) போன்ற ரயில்வே பணிகள்.\n---\ntable:\nதேர்வு விபரம்$தகவல்\nஇணைய இணைப்பு (RRB Apply)$*LINK(RRB Centralized Apply Portal)->https://rrbapply.gov.in/\nசென்னை மண்டல தளம்$*LINK(RRB Chennai Official Website)->https://www.rrbchennai.gov.in/\nகட்டணம் (பொதுப் பிரிவு)$₹500 (CBT-1 தேர்வு எழுதிய பின் ₹400 வங்கிக் கணக்கிற்கு ரீஃபண்ட் செய்யப்படும்)\nகட்டணம் (SC/ST/பெண்கள்/PwBD)$₹250 (CBT-1 தேர்வுக்குப் பின் ₹250 முழுமையாக ரீஃபண்ட் செய்யப்படும்)\nதேர்வு முறை$CBT-1, CBT-2, கணினி திறன் தேர்வு / தட்டச்சு (பதவிக்கு ஏற்ப) & ஆவண சரிபார்ப்பு",
    documentRequirements: [
      "12-ஆம் வகுப்பு சான்றிதழ் (Undergraduate பணிகளுக்கு) அல்லது பட்டப்படிப்பு சான்றிதழ் (Graduate பணிகளுக்கு)",
      "10-ஆம் வகுப்பு சான்றிதழ் (பிறந்த தேதி சான்றாக)",
      "சாதிச் சான்றிதழ் (ரயில் பயண பாஸ் பெற SC/ST பிரிவினருக்கு அவசியம்)",
      "வங்கி பாஸ்புக் விவரம் (தேர்வு எழுதிய பின் கட்டணம் ரீஃபண்ட் செய்யப்பட)",
      "ஆதார் அட்டை, புகைப்படம், கையொப்பம்"
    ],
    urls: [
      { label: "RRB Centralized Apply Portal", url: "https://rrbapply.gov.in/" },
      { label: "RRB Chennai Portal", url: "https://www.rrbchennai.gov.in/" }
    ],
    payFee: "₹500 (ரீஃபண்ட் ₹400) | ₹250 (SC/ST/பெண்கள் - முழு ரீஃபண்ட்)",
    charges: "₹100 Service Charge",
    notes: "ஸ்டேஷன் மாஸ்டர், சரக்கு ரயில் கார்டு (Goods Train Manager), கமர்ஷியல் டிக்கெட் கிளார்க், ஜூனியர் கிளார்க் போன்ற ரயில்வே பணிகள்."
  },
  {
    id: "exam-rrb-group-d-level-1",
    name: "3.2. RRB Group D / Level 1 (தொழில்நுட்ப மற்றும் களப்பணியாளர்கள்)",
    category: "Competitive Exams",
    description: "H1: 3.2. RRB Group D / Level 1 (தொழில்நுட்ப மற்றும் களப்பணியாளர்கள்)\nH2: ரயில்வே லெவல்-1 களப்பணியாளர் நேரடி நியமனத் தேர்வு\n* விளக்கம் (Desc): இந்திய ரயில்வேயின் ரயில் பாதைகள் மற்றும் பணிமனைகளைப் பராமரிக்கும் அடிப்படை களப்பணிகளுக்கான தேர்வு.\n* கல்வித் தகுதி (Eligibility): 10-ஆம் வகுப்பு தேர்ச்சி அல்லது ITI / NCVT சான்றிதழ்.\n* பயன்கள் (Benefit): டிராக்மேன் (Track Maintainer), அசிஸ்டெண்ட் பாயிண்ட்ஸ்மேன் (Pointsman), பணிமனை உதவியாளர் (Helper/Assistant) நிரந்தர மத்திய அரசுப் பணிகள்.\n---\ntable:\nதேர்வு விபரம்$தகவல்\nஇணைய இணைப்பு (RRB Apply)$*LINK(RRB Centralized Apply Portal)->https://rrbapply.gov.in/\nபொதுப் பிரிவு கட்டணம்$₹500 (தேர்வு எழுதிய பின் ₹400 வங்கி கணக்கிற்கு ரீஃபண்ட் செய்யப்படும்)\nசலுகைப் பிரிவு கட்டணம்$₹250 (தேர்வு எழுதிய பின் ₹250 முழுமையாக திருப்பித் தரப்படும்)\nதேர்வு நிலைகள்$கணினி வழித் தேர்வு (CBT - தமிழில்) + உடற்தகுதி தேர்வு (PET - எடை தூக்குதல் & ஓட்டம்)",
    documentRequirements: [
      "10-ஆம் வகுப்பு தேர்ச்சி அல்லது ITI / NCVT சான்றிதழ்",
      "சாதிச் சான்றிதழ், ஆதார் அட்டை, வங்கி பாஸ்புக் விவரம், புகைப்படம்"
    ],
    urls: [
      { label: "RRB Centralized Apply Portal", url: "https://rrbapply.gov.in/" },
      { label: "RRB Chennai Portal", url: "https://www.rrbchennai.gov.in/" }
    ],
    payFee: "₹500 (தேர்வுக்குப் பின் ₹400 ரீஃபண்ட்) | எளிய பிரிவினருக்கு ₹250 (முழு ரீஃபண்ட்)",
    charges: "₹100 Service Charge",
    notes: "டிராக்மேன் (Track Maintainer), அசிஸ்டெண்ட் பாயிண்ட்ஸ்மேன், பணிமனை உதவியாளர் போன்ற இந்திய ரயில்வேயின் நிரந்தர மத்திய அரசுப் பணிகள்."
  },
  {
    id: "exam-rrb-alp-technician",
    name: "3.3. RRB ALP & Technician (உதவி லோகோ பைலட் & டெக்னீசியன்)",
    category: "Competitive Exams",
    description: "H1: 3.3. RRB ALP & Technician (உதவி லோகோ பைலட் & டெக்னீசியன்)\nH2: ரயில் இன்ஜின் ஓட்டுநர் மற்றும் தொழில்நுட்ப வல்லுநர்கள் தேர்வு\n* விளக்கம் (Desc): ரயில் இன்ஜின் இயக்குநர்கள் மற்றும் பல்வேறு தொழில்நுட்ப பிரிவுகளுக்கான ஐ.டி.ஐ / டிப்ளமோ / பொறியியல் தகுதி கொண்டவர்களுக்கான தேர்வு.\n* கல்வித் தகுதி (Eligibility): 10-ஆம் வகுப்பு + ITI அல்லது மெக்கானிக்கல், எலக்ட்ரிக்கல், எலக்ட்ரானிக்ஸ், ஆட்டோமொபைல் பிரிவுகளில் Diploma / B.E.\n* பயன்கள் (Benefit): ரயில் ஓட்டுநர் (Assistant Loco Pilot - ALP) மற்றும் சிக்னல், கேரேஜ், எலக்ட்ரிக்கல் டெக்னீசியன் பதவிகள்; அதிகப்படியான கிலோமீட்டர் படிகள் (Running Allowances).\n---\ntable:\nதேர்வு விபரம்$தகவல்\nஇணைய இணைப்பு (RRB Apply)$*LINK(RRB Centralized Apply Portal)->https://rrbapply.gov.in/\nதேர்வுக் கட்டணம்$₹500 (ரீஃபண்ட் ₹400) | சிறப்பு பிரிவினருக்கு ₹250 (முழு ரீஃபண்ட்)\nகண் பார்வைத் தகுதி$ALP பதவிக்கு: Distance Vision 6/6 without glasses (கண்ணாடி அணியாத தெளிவான பார்வை கட்டாயம்)\nதேர்வு முறை$CBT-1, CBT-2, உளவியல் திறன் தேர்வு (CBAT - ALP பதவிக்கு மட்டும்) & ஆவண சரிபார்ப்பு",
    documentRequirements: [
      "10-ஆம் வகுப்பு சான்றிதழ் + ITI சான்றிதழ் அல்லது Diploma / B.E (Mechanical, Electrical, Electronics, Automobile)",
      "கண் பார்வை தகுதி சான்று (Distance Vision 6/6 without glasses - ALP பதவிக்கு)",
      "சாதிச் சான்றிதழ், வங்கி பாஸ்புக் விவரம், ஆதார் அட்டை"
    ],
    urls: [
      { label: "RRB Centralized Apply Portal", url: "https://rrbapply.gov.in/" },
      { label: "RRB Chennai Portal", url: "https://www.rrbchennai.gov.in/" }
    ],
    payFee: "₹500 (ரீஃபண்ட் ₹400) | சிறப்பு பிரிவினருக்கு ₹250 (முழு ரீஃபண்ட்)",
    charges: "₹100 Service Charge",
    notes: "ரயில் ஓட்டுநர் (Assistant Loco Pilot) மற்றும் எலக்ட்ரிக்கல்/சிக்னல் டெக்னீசியன் பதவிகள். கூடுதல் கிலோமீட்டர் அலவன்ஸ் உண்டு."
  },
  {
    id: "exam-ibps-rrb-grama-bank",
    name: "4.1. IBPS RRB (தமிழ்நாடு கிராம வங்கி - Office Assistant & Officer)",
    category: "Competitive Exams",
    description: "H1: 4.1. IBPS RRB (தமிழ்நாடு கிராம வங்கி - Office Assistant & Officer)\nH2: மண்டல ஊரக வங்கிகள் எழுத்தர் மற்றும் உதவி மேலாளர் தேர்வு\n* விளக்கம் (Desc): தமிழ்நாடு கிராம வங்கி (Tamil Nadu Grama Bank) உள்ளிட்ட மண்டல ஊரக வங்கிகளில் உதவியாளர் (Clerk) மற்றும் உதவி மேலாளர் (Scale I Officer) பணிகளுக்கான தேர்வு.\n* கல்வித் தகுதி (Eligibility): ஏதேனும் ஒரு பட்டப்படிப்பு (Any Degree) மற்றும் பள்ளியில் தமிழ் படித்த தேர்ச்சி.\n* பயன்கள் (Benefit): தமிழக எல்லைக்குள்ளேயே (கிராமப்புற மற்றும் நகர்ப்புற கிளைகளில்) பணியாற்றலாம்; தமிழ் மொழியிலேயே இத்தேர்வை எழுதலாம்.\n---\ntable:\nதேர்வு விபரம்$தகவல்\nஇணைய இணைப்பு (IBPS Portal)$*LINK(IBPS Official Application Portal)->https://www.ibps.in/\nகட்டணம் (பொது / OBC / EWS)$₹850\nகட்டணம் (SC / ST / PwBD)$₹175\nதேர்வு மொழி$தமிழ் மற்றும் ஆங்கிலம்\nபதவிகள்$Office Assistant (Multipurpose) & Officer Scale-I (Assistant Manager)",
    documentRequirements: [
      "ஏதேனும் ஒரு பட்டப்படிப்பு சான்றிதழ் (Any Degree)",
      "உள்ளூர் மொழித் தேர்ச்சி (பள்ளியில் தமிழ் மொழி படித்திருக்க வேண்டும்)",
      "சாதிச் சான்றிதழ் (Central OBC-NCL / SC / ST / EWS)",
      "ஆதார் அட்டை, புகைப்படம், கையொப்பம், இடது கை பெருவிரல் ரேகை (Thumb Impression) மற்றும் கைப்பட எழுதிய உறுதிமொழிப் படிவம் (Handwritten Declaration)"
    ],
    urls: [
      { label: "IBPS Official Portal", url: "https://www.ibps.in/" }
    ],
    payFee: "₹850 (பொது / OBC / EWS) | ₹175 (SC / ST / PwBD)",
    charges: "₹100 - ₹150 Service Charge",
    notes: "தமிழ்நாடு கிராம வங்கியில் அலுவலக உதவியாளர் (Clerk) மற்றும் உதவி மேலாளர் (Scale I Officer) பணி. தமிழகத்திற்குள்ளேயே பணியாற்றலாம்; தேர்வையும் தமிழிலேயே எழுதலாம்."
  },
  {
    id: "exam-ibps-clerk-po",
    name: "4.2. IBPS Clerk & PO (பொதுத்துறை வங்கிகள்)",
    category: "Competitive Exams",
    description: "H1: 4.2. IBPS Clerk & PO (பொதுத்துறை வங்கிகள்)\nH2: தேசியமயமாக்கப்பட்ட வங்கிகள் எழுத்தர் & தகுதிகாண் அதிகாரி தேர்வு\n* விளக்கம் (Desc): இந்தியன் வங்கி, கனரா வங்கி, பஞ்சாப் நேஷனல் வங்கி உள்ளிட்ட 11 பொதுத்துறை வங்கிகளுக்கான எழுத்தர் (Clerk) மற்றும் தகுதிகாண் அதிகாரி (Probationary Officer) நேரடித் தேர்வு.\n* கல்வித் தகுதி (Eligibility): ஏதேனும் ஒரு பட்டப்படிப்பு (Any Degree) மற்றும் கணினி இயக்க அறிவு.\n* பயன்கள் (Benefit): பொதுத்துறை வங்கிகளில் நிரந்தரப் பணி, குறைந்த வட்டியில் வீட்டுக் கடன், வாகனக் கடன் உள்ளிட்ட வங்கி ஊழியர்களுக்கான சலுகைகள்.\n---\ntable:\nதேர்வு விபரம்$தகவல்\nஇணைய இணைப்பு (IBPS Portal)$*LINK(IBPS Official Portal)->https://www.ibps.in/\nவிண்ணப்பக் கட்டணம்$₹850 (பொதுப் பிரிவு) | ₹175 (SC/ST/மாற்றுத்திறனாளிகள்)\nபங்கேற்கும் வங்கிகள்$Indian Bank, Canara Bank, PNB, Bank of Baroda, Union Bank உள்ளிட்ட 11 வங்கிகள்\nதேர்வு நிலைகள்$Clerk: Prelims + Mains (தமிழ் மொழியிலும் தேர்வு) | PO: Prelims + Mains + Interview",
    documentRequirements: [
      "ஏதேனும் ஒரு பட்டப்படிப்பு சான்றிதழ் (Degree Certificate)",
      "கணினி இயக்க அறிவு சான்றிதழ் (Computer Certificate)",
      "சாதிச் சான்றிதழ், ஆதார் அட்டை, புகைப்படம், கையொப்பம், பெருவிரல் ரேகை, கைப்பட எழுதிய உறுதிமொழி"
    ],
    urls: [
      { label: "IBPS Official Portal", url: "https://www.ibps.in/" }
    ],
    payFee: "₹850 (பொதுப் பிரிவு) | ₹175 (SC/ST/மாற்றுத்திறனாளிகள்)",
    charges: "₹100 - ₹150 Service Charge",
    notes: "இந்தியன் வங்கி, கனரா வங்கி, PNB உள்ளிட்ட 11 தேசியமயமாக்கப்பட்ட பொதுத்துறை வங்கிகளுக்கான கிளார்க் மற்றும் PO தேர்வு."
  },
  {
    id: "exam-sbi-clerk-po",
    name: "4.3. SBI Clerk & PO (ஸ்டேட் பாங்க் ஆப் இந்தியா)",
    category: "Competitive Exams",
    description: "H1: 4.3. SBI Clerk & PO (ஸ்டேட் பாங்க் ஆப் இந்தியா)\nH2: பாரத ஸ்டேட் வங்கி ஜூனியர் அசோசியேட் & புரொபேஷனரி ஆபீசர் தேர்வு\n* விளக்கம் (Desc): இந்தியாவின் மிகப்பெரிய வணிக வங்கியான ஸ்டேட் பாங்க் ஆப் இந்தியாவின் கிளைகளில் ஜூனியர் அசோசியேட் (Junior Associate - Clerk) மற்றும் புரொபேஷனரி ஆபீசர் (PO) நியமனத் தேர்வு.\n* கல்வித் தகுதி (Eligibility): ஏதேனும் ஒரு அங்கீகரிக்கப்பட்ட பட்டப்படிப்பு (Any Degree).\n* பயன்கள் (Benefit): பிற பொதுத்துறை வங்கிகளை விட கூடுதல் அடிப்படை ஊதியம் மற்றும் படிகள்; வெளிநாட்டுக் கிளைகளில் பணிபுரியும் வாய்ப்புகள்.\n---\ntable:\nதேர்வு விபரம்$தகவல்\nஇணைய இணைப்பு (SBI Careers)$*LINK(SBI Careers Portal)->https://bank.sbi/careers\nவிண்ணப்பக் கட்டணம்$₹750 (பொது / OBC / EWS) | SC/ST/PwBD பிரிவினருக்கு கட்டணம் முற்றிலும் இலவசம்\nதேர்வு நிலைகள்$Clerk: Prelims + Mains | PO: Prelims + Mains + Interview & Group Exercise\nசலுகைகள்$அதிகப்படியான அடிப்படை சம்பளம், லீவ் டிராவல் சலுகை (LTC), மருத்துவக் காப்பீடு",
    documentRequirements: [
      "ஏதேனும் ஒரு பட்டப்படிப்பு சான்றிதழ் (Degree Certificate)",
      "சாதிச் சான்றிதழ், பான் கார்டு, ஆதார் அட்டை, புகைப்படம், கையொப்பம்"
    ],
    urls: [
      { label: "SBI Careers Portal", url: "https://bank.sbi/careers" }
    ],
    payFee: "₹750 (பொது / OBC / EWS) | SC/ST/PwBD பிரிவினருக்கு முற்றிலும் இலவசம்",
    charges: "₹100 - ₹150 Service Charge",
    notes: "SBI ஜூனியர் அசோசியேட் (Junior Associate - Clerk) & புரொபேஷனரி ஆபீசர் (PO) நியமனம். கூடுதல் அடிப்படை ஊதியம் மற்றும் வங்கி ஊழியர் சலுகைகள் உண்டு."
  },
  {
    id: "exam-upsc-civil-services",
    name: "5.1. UPSC Civil Services Examination (IAS / IPS / IFS)",
    category: "Competitive Exams",
    description: "H1: 5.1. UPSC Civil Services Examination (IAS / IPS / IFS)\nH2: மத்திய அரசுப் பணியாளர் தேர்வாணையம் - குடிமைப் பணிகள் தேர்வு (UPSC CSE)\n* விளக்கம் (Desc): இந்திய ஆட்சிப் பணி (IAS), இந்தியக் காவல் பணி (IPS), மற்றும் இந்திய வெளியுறவுப் பணி (IFS) ஆகிய உயரிய பொறுப்புகளுக்கான அகில இந்திய குடிமைப் பணிகள் தேர்வு.\n* கல்வித் தகுதி (Eligibility): ஏதேனும் ஒரு பட்டப்படிப்பு (Any Degree).\n* பயன்கள் (Benefit): மாவட்ட ஆட்சியர், மாவட்ட எஸ்பி உள்ளிட்ட நாட்டின் கொள்கை முடிவுகளை எடுக்கும் தலைமை நிர்வாகப் பதவிகள்.\n---\ntable:\nதேர்வு விபரம்$தகவல்\nஇணைய இணைப்பு (UPSC Online)$*LINK(UPSC Online Application Portal)->https://upsconline.nic.in/\nஅதிகாரப்பூர்வ தளம்$*LINK(UPSC Official Website)->https://www.upsc.gov.in/\nவிண்ணப்பக் கட்டணம்$₹100 (பெண்கள், SC, ST, மாற்றுத்திறனாளிகளுக்கு கட்டணம் முற்றிலும் இலவசம்)\nதேர்வு நிலைகள்$முதல்நிலைத் தேர்வு (Prelims - CSAT) + முதன்மைத் தேர்வு (Mains) + ஆளுமைத் தேர்வு (Personality Test/Interview)\nஉயரிய பதவிகள்$IAS, IPS, IFS, IRS, IA&AS, IDAS உள்ளிட்ட அகில இந்திய குடிமைப் பணிகள்",
    documentRequirements: [
      "ஏதேனும் ஒரு பட்டப்படிப்பு சான்றிதழ் (Degree Certificate)",
      "சாதிச் சான்றிதழ் (மத்திய அரசு படிவம்), ஆதார் அட்டை, புகைப்படம், கையொப்பம்"
    ],
    urls: [
      { label: "UPSC Online Portal", url: "https://upsconline.nic.in/" },
      { label: "UPSC Official Website", url: "https://www.upsc.gov.in/" }
    ],
    payFee: "₹100 (பெண்கள், SC, ST, மாற்றுத்திறனாளிகளுக்கு முற்றிலும் இலவசம்)",
    charges: "₹100 - ₹150 Service Charge",
    notes: "இந்திய ஆட்சிப் பணி (IAS), இந்தியக் காவல் பணி (IPS), மற்றும் இந்திய வெளியுறவுப் பணி (IFS) ஆகிய நாட்டின் உயரிய தலைமை நிர்வாகப் பதவிகள்."
  },
  {
    id: "exam-agniveer-defense-services",
    name: "5.2. இந்திய ராணுவம் - அக்னிவீர் (Indian Army / Navy / Air Force - Agnipath)",
    category: "Competitive Exams",
    description: "H1: 5.2. இந்திய ராணுவம் - அக்னிவீர் (Indian Army / Navy / Air Force - Agnipath)\nH2: முப்படைகளில் 4 ஆண்டு சேவை மற்றும் வீரர்களுக்கான அக்னிபத் திட்டம்\n* விளக்கம் (Desc): 17½ முதல் 21 வயது வரையிலான இளைஞர்கள் முப்படைகளில் (ராணுவம், கடற்படை, விமானப்படை) 4 ஆண்டுகள் சேவை செய்வதற்கான குறுகிய கால அக்னிவீர் தேர்வு (தகுதித் தேர்வுக்குப் பின் 25% பேர் நிரந்தர ராணுவ வீரர்களாக நியமிக்கப்படுவர்).\n* கல்வித் தகுதி (Eligibility): 10-ஆம் வகுப்பு / 12-ஆம் வகுப்பு தேர்ச்சி (படைப் பிரிவைப் பொறுத்து).\n* பயன்கள் (Benefit): ₹30,000 முதல் ₹40,000 வரை மாத ஊதியம்; 4 ஆண்டுகள் முடிவில் வரிவிலக்கு அளிக்கப்பட்ட ₹11.71 லட்சம் 'சேவா நிதி' (Seva Nidhi Package); மத்திய ஆயுதப் படைகள் (CAPF) மற்றும் மாநில காவல் துறையில் 10% இடஒதுக்கீடு முன்னுரிமை.\n---\ntable:\nதேர்வு விபரம்$தகவல்\nராணுவ இணைப்பு (Army)$*LINK(Join Indian Army Portal)->https://joinindianarmy.nic.in/\nவிமானப்படை இணைப்பு (Air Force)$*LINK(Agnipath Vayu Portal)->https://agnipathvayu.cdac.in/\nகடற்படை இணைப்பு (Navy)$*LINK(Join Indian Navy Portal)->https://www.joinindiannavy.gov.in/\nதேர்வுக் கட்டணம்$சுமார் ₹250 முதல் ₹550 வரை (படைப் பிரிவைப் பொறுத்து)\nபயிற்சி காலம் & பணி$4 ஆண்டுகள் சேவை (25% சிறந்த வீரர்களுக்கு நிரந்தர பணி வாய்ப்பு)",
    documentRequirements: [
      "10-ஆம் வகுப்பு / 12-ஆம் வகுப்பு மதிப்பெண் பட்டியல்",
      "இருப்பிடச் சான்றிதழ் (Nativity / Domicile Certificate)",
      "சாதிச் சான்றிதழ், திருமணமாகாததற்கான சான்றிதழ் (Unmarried Certificate - VAO/கவுன்சிலர் கையொப்பத்துடன்)",
      "நன்னடத்தை சான்றிதழ், ஆதார் அட்டை, 20 பாஸ்போர்ட் அளவு புகைப்படங்கள்"
    ],
    urls: [
      { label: "Join Indian Army", url: "https://joinindianarmy.nic.in/" },
      { label: "Agnipath Vayu", url: "https://agnipathvayu.cdac.in/" },
      { label: "Join Indian Navy", url: "https://www.joinindiannavy.gov.in/" }
    ],
    payFee: "கணினி வழித் தேர்வுக் கட்டணம் சுமார் ₹250 முதல் ₹550 வரை",
    charges: "₹100 - ₹150 Service Charge",
    notes: "முப்படைகளில் 4 ஆண்டுகள் சேவை; 4 ஆண்டுகள் முடிவில் வரிவிலக்கு அளிக்கப்பட்ட ₹11.71 லட்சம் 'சேவா நிதி' (Seva Nidhi Package); 25% பேருக்கு நிரந்தர ராணுவ பணி உத்தரவாதம்."
  },
  {
    id: "passport-fresh-application",
    name: "1. புதிய பாஸ்போர்ட் விண்ணப்பம் (Fresh Passport Application)",
    category: "Passport Services",
    description: "H1: 1. புதிய பாஸ்போர்ட் விண்ணப்பம் (Fresh Passport Application)\nH2: இந்திய வெளியுறவு அமைச்சகம் - புதிய பாஸ்போர்ட் விண்ணப்ப சேவை (Passport Seva)\n* விளக்கம் (Desc): முதன்முறையாக சர்வதேச பயண ஆவணம் பெற விரும்பும் இந்தியக் குடிமக்களுக்கான 36 பக்கங்கள் அல்லது 60 பக்கங்கள் கொண்ட சாதாரண (Ordinary - Blue) பாஸ்போர்ட் விண்ணப்ப சேவை.\n* தகுதி (Eligibility): அனைத்து இந்தியக் குடிமக்கள் (குழந்தைகள் முதல் பெரியவர்கள் வரை).\n* பயன்கள் (Benefit): சர்வதேச பயணங்களுக்கான முதன்மை அடையாள ஆவணம்; வெளிநாட்டு வேலை, சுற்றுலா, கல்வி மற்றும் விசா அனுமதிகளை சட்டப்பூர்வமாகப் பெறலாம். 18 வயதிற்கு மேற்பட்டோருக்கு 10 ஆண்டுகள் வரை செல்லுபடியாகும்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Passport Portal)$*LINK(Passport Seva Online Portal)->https://www.passportindia.gov.in/\nசாதாரண முறை (Normal - 36 பக்கங்கள்)$அரசு கட்டணம் ₹1,500\nசாதாரண முறை (Normal - 60 பக்கங்கள்)$அரசு கட்டணம் ₹2,000\nதட்கல் முறை (Tatkaal - 36 பக்கங்கள்)$₹3,500 (சாதாரண கட்டணம் ₹1,500 + தட்கல் கட்டணம் ₹2,000)\nசெல்லுபடியாகும் காலம்$18 வயதுக்கு மேற்பட்டோருக்கு 10 ஆண்டுகள்\nஆவண சரிபார்ப்பு$பாஸ்போர்ட் சேவா கேந்திரா (PSK / POPSK) நேரில் செல்ல வேண்டும்",
    documentRequirements: [
      "பிறந்த தேதிச் சான்று (Date of Birth Proof): பிறப்புச் சான்றிதழ் அல்லது 10-ஆம் வகுப்பு மதிப்பெண் பட்டியல்",
      "தற்போதைய முகவரிச் சான்று (Present Address Proof): ஆதார் அட்டை, வாக்காளர் அட்டை, மின் கட்டண ரசீது அல்லது வங்கி பாஸ்புக்",
      "ECNR சான்று (Non-ECR Proof): 10-ஆம் வகுப்பு அல்லது அதற்கு மேற்பட்ட கல்வித் தகுதிச் சான்றிதழ்",
      "கைபேசி எண் மற்றும் மின்னஞ்சல் முகவரி (Appointment & OTP தகவல்களுக்கு)"
    ],
    urls: [
      { label: "Passport Seva Online Portal", url: "https://www.passportindia.gov.in/" },
      { label: "Track Passport Application", url: "https://www.passportindia.gov.in/psp/TrackStatus" }
    ],
    payFee: "Normal (36 pgs): ₹1,500 | Normal (60 pgs): ₹2,000 | Tatkaal: ₹3,500",
    charges: "₹200 - ₹300 Service Charge",
    notes: "விண்ணப்பித்து கட்டணம் செலுத்திய பின் பாஸ்போர்ட் சேவா கேந்திரா (PSK / POPSK) அலுவலகத்திற்கு நேரில் செல்வதற்கான அப்பாயின்ட்மென்ட் தேதி தேர்வு செய்யப்படும். காவல் ஆய்விற்குப் பின் பாஸ்போர்ட் தபாலில் வீடு தேடி வரும்."
  },
  {
    id: "passport-reissue-renewal",
    name: "2. பாஸ்போர்ட் புதுப்பித்தல் / மறுவழங்கல் (Re-issue / Renewal of Passport)",
    category: "Passport Services",
    description: "H1: 2. பாஸ்போர்ட் புதுப்பித்தல் / மறுவழங்கல் (Re-issue / Renewal of Passport)\nH2: பாஸ்போர்ட் காலாவதி நீட்டிப்பு & புதிய புத்தகம் மறுவழங்கல் சேவை\n* விளக்கம் (Desc): ஏற்கனவே உள்ள பாஸ்போர்ட்டின் 10 ஆண்டு கால அவகாசம் முடிவடைவதற்கு முன்னரோ (காலாவதியாகும் 1 வருடத்திற்குள்), காலாவதியான பின்னரோ, பக்கங்கள் தீர்ந்துவிட்டாலோ அல்லது சேதமடைந்தாலோ புதிய பாஸ்போர்ட் பெறுதல்.\n* தகுதி (Eligibility): பாஸ்போர்ட் வைத்துள்ளவர்கள் (காலாவதி தேதிக்கு 1 வருடத்திற்கு முன்பிருந்தே விண்ணப்பிக்கலாம்).\n* பயன்கள் (Benefit): பழைய பாஸ்போர்ட் எண்ணுடன் இணைக்கப்பட்டு புதிய செல்லுபடியாகும் காலத்துடன் (10 ஆண்டுகள்) புதிய பாஸ்போர்ட் உடனடியாகக் கிடைக்கும். பழைய விசாக்கள் செல்லுபடியாகும்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Re-issue Portal)$*LINK(Passport Seva Re-issue Portal)->https://www.passportindia.gov.in/\nவழக்கமான புதுப்பித்தல் (Normal)$₹1,500 (36 பக்கங்கள்) / ₹2,000 (60 பக்கங்கள்)\nதட்கல் புதுப்பித்தல் (Tatkaal)$₹3,500 (36 பக்கங்கள்)\nதொலைந்த / சேதமடைந்த பாஸ்போர்ட்$₹3,000 (Normal) / ₹5,000 (Tatkaal)\nமுக்கிய தேவை$பழைய அசல் பாஸ்போர்ட் மற்றும் முதல்/கடைசி 2 பக்கங்களின் சுய சான்றொப்ப நகல்கள்",
    documentRequirements: [
      "பழைய அசல் பாஸ்போர்ட் (Old Passport in Original)",
      "பழைய பாஸ்போர்ட்டின் முதல் 2 மற்றும் கடைசி 2 பக்கங்களின் சுய சான்றொப்பமிட்ட நகல்கள்",
      "ECR / Non-ECR பக்கத்தின் நகல்",
      "முகவரியில் மாற்றம் இருந்தால்: புதிய தற்போதைய முகவரிச் சான்று (ஆதார் / வாக்காளர் அட்டை)",
      "பாஸ்போர்ட் தொலைந்துவிட்டால்: காவல் துறை காணாமல் போன ஆவண அறிக்கை (LDR / FIR)"
    ],
    urls: [
      { label: "Passport Seva Re-issue Portal", url: "https://www.passportindia.gov.in/" },
      { label: "Locate PSK / POPSK Centre", url: "https://www.passportindia.gov.in/psp/LocatePSK" }
    ],
    payFee: "Normal Renewal: ₹1,500 | Tatkaal: ₹3,500 | Lost/Damaged: ₹3,000 - ₹5,000",
    charges: "₹200 - ₹300 Service Charge",
    notes: "பழைய பாஸ்போர்ட்டில் ஏதேனும் செல்லுபடியாகும் விசாக்கள் இருந்தால், அந்த விசாக்கள் ரத்தாகாது. புதிய பாஸ்போர்ட்டுடன் சேர்த்து பழைய பாஸ்போர்ட்டையும் பாதுகாப்பாக வைத்திருக்க வேண்டும்."
  },
  {
    id: "passport-change-personal-particulars",
    name: "3. பாஸ்போர்ட்டில் விவர மாற்றங்கள் (Change in Existing Personal Particulars)",
    category: "Passport Services",
    description: "H1: 3. பாஸ்போர்ட்டில் விவர மாற்றங்கள் (Change in Existing Personal Particulars)\nH2: பெயர் மாற்றம், முகவரி திருத்தம் & துணைவர் பெயர் சேர்த்தல் (Passport Miscellaneous Services)\n* விளக்கம் (Desc): திருமணத்திற்குப் பின் பெயர் மாற்றம், கணவர்/மனைவி பெயர் சேர்த்தல் அல்லது நீக்குதல், முகவரி மாற்றம், பிறந்த தேதி திருத்தம் போன்றவற்றுக்காக பாஸ்போர்ட்டை மாற்றியமைத்தல்.\n* தகுதி (Eligibility): சட்டப்பூர்வ ஆவணங்களின் அடிப்படையில் பாஸ்போர்ட் விவரங்களை மாற்ற விரும்பும் அனைத்து பாஸ்போர்ட் உரிமையாளர்கள்.\n* பயன்கள் (Benefit): அரசு ஆவணங்களில் உள்ள தற்போதைய விவரங்கள் சர்வதேச பாஸ்போர்ட்டிலும் துல்லியமாகப் புதுப்பிக்கப்பட்டு விசா விண்ணப்ப முரண்பாடுகள் தவிர்க்கப்படும்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Passport Changes)$*LINK(Passport Seva Miscellaneous Services)->https://www.passportindia.gov.in/\nஅரசு கட்டணம் (Normal)$₹1,500 (36 பக்கங்கள்) / ₹2,000 (60 பக்கங்கள்)\nதட்கல் முறை (Tatkaal)$₹3,500\nமாற்ற வகைகள்$பெயர் மாற்றம், முகவரி மாற்றம், துணைவர் (Spouse) பெயர் சேர்த்தல்/நீக்குதல், ECR-லிருந்து Non-ECR மாற்றம்\nமுக்கிய ஆவணம்$பழைய அசல் பாஸ்போர்ட் & மாற்றத்திற்கான ஆதரவு சான்றுகள் (Gazette / Marriage Certificate / Aadhaar)",
    documentRequirements: [
      "பழைய அசல் பாஸ்போர்ட் மற்றும் நகல்கள்",
      "பெயர் மாற்றத்திற்கு: அரசிதழ் பதிவு நகல் (Gazette Notification) அல்லது நாளிதழ் விளம்பர நகல்",
      "கணவர்/மனைவி பெயர் சேர்க்க: திருமணப் பதிவுச் சான்றிதழ் (Marriage Certificate) அல்லது பாஸ்போர்ட் நகல்",
      "முகவரி மாற்றத்திற்கு: புதிய முகவரிக்கான ஆதார் அட்டை / வங்கி பாஸ்புக்",
      "Non-ECR மாற்றத்திற்கு: 10-ஆம் வகுப்பு / பட்டப்படிப்பு சான்றிதழ்"
    ],
    urls: [
      { label: "Passport Miscellaneous Services", url: "https://www.passportindia.gov.in/" },
      { label: "Document Advisor for Re-issue", url: "https://www.passportindia.gov.in/" }
    ],
    payFee: "Normal: ₹1,500 (36 pgs) | Tatkaal: ₹3,500",
    charges: "₹200 - ₹300 Service Charge",
    notes: "பெயர் மாற்றம் செய்த பிறகு அனைத்து அரசு ஆவணங்களிலும் ஒரே மாதிரியான பெயர் இருப்பதை உறுதிசெய்து கொண்டு பாஸ்போர்ட் திருத்தத்திற்கு விண்ணப்பிப்பது சிறந்தது."
  },
  {
    id: "passport-police-clearance-certificate",
    name: "4. காவல் நன்னடத்தை சான்றிதழ் (Police Clearance Certificate - PCC)",
    category: "Passport Services",
    description: "H1: 4. காவல் நன்னடத்தை சான்றிதழ் (Police Clearance Certificate - PCC)\nH2: இந்திய பாஸ்போர்ட் அலுவலக சர்வதேச நன்னடத்தை சான்றிதழ் (Passport Office PCC)\n* விளக்கம் (Desc): வெளிநாட்டு வேலை வாய்ப்பு, நீண்ட கால குடியிருப்பு விசா (PR / Permanent Residency) அல்லது வெளிநாட்டுக் குடியுரிமை பெறுவதற்காக, இந்திய பாஸ்போர்ட் அலுவலகம் வழியாக வழங்கப்படும் குற்றப்பின்னணி அற்ற சான்றிதழ்.\n* தகுதி (Eligibility): செல்லுபடியாகும் இந்திய பாஸ்போர்ட் வைத்துள்ள மற்றும் வெளிநாட்டு விசா/வேலை வாய்ப்பு பெற்றுள்ள நபர்கள்.\n* பயன்கள் (Benefit): வெளிநாட்டு தூதரகங்கள் மற்றும் விசா வழங்கும் அமைப்புகளால் அதிகாரப்பூர்வமாக ஏற்றுக்கொள்ளப்படும் ஒரே சர்வதேச நன்னடத்தை சான்றாகும்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (PCC Portal)$*LINK(Passport Seva - Apply PCC)->https://www.passportindia.gov.in/\nஅரசு கட்டணம்$₹500\nசெல்லுபடியாகும் காலம்$வழக்கமாக 6 மாதங்கள் (விசா வழங்கும் நாட்டின் விதிகளைப் பொறுத்தது)\nஆய்வு முறை$பாஸ்போர்ட் கேந்திரா சரிபார்ப்பு + உள்ளூர் காவல் நிலைய விசாரணை (Police Verification)\nமுக்கிய ஆவணங்கள்$அசல் பாஸ்போர்ட், தற்போதைய முகவரிச் சான்று, வெளிநாட்டு வேலை/விசா அழைப்புக் கடிதம்",
    documentRequirements: [
      "அசல் பாஸ்போர்ட் மற்றும் அதன் சுய சான்றொப்பமிட்ட நகல்கள்",
      "தற்போதைய முகவரிச் சான்று (ஆதார் அட்டை / வாக்காளர் அட்டை)",
      "வெளிநாட்டு விசா / வேலைவாய்ப்பு நிறுவனத்தின் அழைப்புக் கடிதம் (Employment Offer Letter / Visa Copy)",
      "கைபேசி எண் (காவல் ஆய்விற்கான SMS தகவல்களுக்கு)"
    ],
    urls: [
      { label: "Passport Seva Apply PCC", url: "https://www.passportindia.gov.in/" },
      { label: "Track PCC Status", url: "https://www.passportindia.gov.in/psp/TrackStatus" }
    ],
    payFee: "அரசு கட்டணம்: ₹500",
    charges: "₹150 - ₹200 Service Charge",
    notes: "பாஸ்போர்ட் அலுவலகத்தில் விண்ணப்பித்த பின் உள்ளூர் காவல் நிலையத்திலிருந்து சரிபார்ப்பு செய்து அறிக்கை அனுப்பப்படும். அதன்பின் அதிகாரப்பூர்வ PCC சான்றிதழ் வழங்கப்படும்."
  },
  {
    id: "passport-minors-children",
    name: "5. மைனர் பாஸ்போர்ட் விண்ணப்பம் (Passport for Minors / Children)",
    category: "Passport Services",
    description: "H1: 5. மைனர் பாஸ்போர்ட் விண்ணப்பம் (Passport for Minors / Children)\nH2: குழந்தைகள் மற்றும் பச்சிளம் குழந்தைகளுக்கான பாஸ்போர்ட் சேவை (Minor Passport)\n* விளக்கம் (Desc): 18 வயதுக்குட்பட்ட குழந்தைகள் மற்றும் பச்சிளம் குழந்தைகளுக்கு வழங்கப்படும் பாஸ்போர்ட் (5 ஆண்டுகள் அல்லது குழந்தை 18 வயதை அடையும் வரை மட்டுமே செல்லுபடியாகும்).\n* தகுதி (Eligibility): 18 வயது பூர்த்தியாகாத அனைத்து குழந்தைகள் மற்றும் பிறந்த பச்சிளம் குழந்தைகள்.\n* பயன்கள் (Benefit): பெற்றோருடன் குழந்தைகள் வெளிநாடு செல்வதற்கும், சர்வதேச கல்வி, சுற்றுலா மற்றும் வெளிநாட்டு விசா பெறுவதற்கும் கட்டாய ஆவணமாகும்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Minor Passport)$*LINK(Passport Seva Portal)->https://www.passportindia.gov.in/\nசாதாரண முறை (Normal)$₹1,000 (8 வயதுக்குட்பட்ட குழந்தைகளுக்கு 10% அரசு கட்டணச் சலுகை உண்டு)\nதட்கல் முறை (Tatkaal)$₹3,000 (சாதாரண கட்டணம் ₹1,000 + தட்கல் ₹2,000)\nசெல்லுபடியாகும் காலம்$5 ஆண்டுகள் அல்லது குழந்தை 18 வயதை அடையும் வரை\nமுக்கிய ஆவணங்கள்$அசல் பிறப்புச் சான்றிதழ், பெற்றோர் பாஸ்போர்ட், பெற்றோர் ஒப்புதல் படிவம் (Annexure 'D')",
    documentRequirements: [
      "குழந்தையின் அசல் பிறப்புச் சான்றிதழ் (Municipal Birth Certificate)",
      "பெற்றோரின் அசல் பாஸ்போர்ட்டுகள் மற்றும் முகவரிச் சான்று (Aadhaar / Voter ID)",
      "பெற்றோர் இருவரின் ஒப்புதல் கடிதம் (Annexure 'D' படிவம்)",
      "குழந்தை 4 வயதுக்குட்பட்டது எனில்: வெள்ளைப் பின்னணியில் எடுக்கப்பட்ட பாஸ்போர்ட் அளவு புகைப்படம் (4.5 x 3.5 cm)",
      "பள்ளி படிக்கும் குழந்தையெனில்: பள்ளியின் போனாஃபைட் சான்றிதழ் / பள்ளி அடையாள அட்டை"
    ],
    urls: [
      { label: "Passport Seva Portal", url: "https://www.passportindia.gov.in/" },
      { label: "Annexure Forms Download", url: "https://www.passportindia.gov.in/" }
    ],
    payFee: "Normal: ₹1,000 (8 வயதுக்குட்பட்டோருக்கு 10% தள்ளுபடி) | Tatkaal: ₹3,000",
    charges: "₹200 - ₹300 Service Charge",
    notes: "மைனர் குழந்தைக்கு பாஸ்போர்ட் விண்ணப்பிக்கும் போது பெற்றோர் இருவரின் பாஸ்போர்ட்டில் ஒருவருக்கொருவர் பெயர் (Spouse Name) இணைக்கப்பட்டிருப்பது நடைமுறையை எளிதாக்கும். PSK செல்லும்போது குழந்தை மற்றும் பெற்றோர் நேரில் செல்ல வேண்டும்."
  },
  {
    id: "nalavariyam-new-member-registration",
    name: "1. புதிய நல வாரிய உறுப்பினர் பதிவு (New Member Registration)",
    category: "Welfare Board (நல வாரியம்)",
    description: "H1: 1. புதிய நல வாரிய உறுப்பினர் பதிவு (New Member Registration)\nH2: தமிழ்நாடு அமைப்புசாரா தொழிலாளர் நல வாரியம் (TNUWWB Digital UWW Card)\n* விளக்கம் (Desc): 18 முதல் 60 வயதுக்குட்பட்ட அமைப்புசாரா உடலுழைப்புத் தொழிலாளர்கள், கட்டுமானத் தொழிலாளர்கள் மற்றும் ஓட்டுநர்கள் அரசு நல வாரியத்தில் உறுப்பினராக இணைந்து டிஜிட்டல் உறுப்பினர் அட்டை (UWW Card) பெறுதல்.\n* தகுதி (Eligibility): 18 முதல் 60 வயது வரை உள்ள உடலுழைப்பு, கட்டுமானம், ஆட்டோ ஓட்டுநர், தையல், சுமை தூக்குவோர் உள்ளிட்ட 17 நல வாரிய தொழிலாளர்கள்.\n* பயன்கள் (Benefit): அரசு அங்கீகாரம் பெற்ற நல வாரிய உறுப்பினர் எண் மற்றும் அடையாள அட்டை வழங்கப்படும்; கல்வி, திருமணம், மகப்பேறு, விபத்து மற்றும் ஓய்வூதியம் போன்ற அனைத்து அரசு நலத்திட்ட உதவிகளையும் பெற தகுதி கிடைக்கும்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (TNUWWB Portal)$*LINK(TNUWWB Official Portal)->https://tnuwwb.tn.gov.in/\nஅரசு பதிவுக் கட்டணம்$முற்றிலும் இலவசம் (Free - No Govt Fee)\nஅடையாள அட்டை வடிவம்$QR குறியீட்டுடன் கூடிய டிஜிட்டல் உறுப்பினர் அட்டை (UWW Smart Card)\nசெல்லுபடியாகும் காலம்$5 ஆண்டுகள் (அதன்பின் புதுப்பித்துக் கொள்ளலாம்)\nமுக்கிய ஆவணங்கள்$ஆதார், குடும்ப அட்டை, வயது சான்று, VAO தொழில் சான்று, வங்கி பாஸ்புக்",
    documentRequirements: [
      "விண்ணப்பதாரரின் ஆதார் அட்டை நகல்",
      "குடும்ப அட்டை (Ration Card) அல்லது ஸ்மார்ட் கார்டு நகல்",
      "வயதுச் சான்று (பள்ளி சான்றிதழ் / வாக்காளர் அட்டை / அரசு மருத்துவர் சான்று)",
      "தொழில் சான்று (கிராம நிர்வாக அலுவலர் [VAO] அல்லது தொழிலாளர் உதவி ஆணையர் சான்றொப்பம்)",
      "விண்ணப்பதாரரின் சேமிப்பு வங்கிக் கணக்கு புத்தகம் (Bank Passbook)",
      "பாஸ்போர்ட் அளவு புகைப்படம் (Passport Photo)",
      "ஆதாருடன் இணைக்கப்பட்ட கைபேசி எண் (OTP சரிபார்ப்புக்கு)"
    ],
    urls: [
      { label: "TNUWWB Registration Portal", url: "https://tnuwwb.tn.gov.in/" },
      { label: "TNUWWB Official Website", url: "https://tnuwwb.tn.gov.in/" }
    ],
    payFee: "முற்றிலும் இலவசம் (Free - No Govt Fee)",
    charges: "₹100 - ₹150 Service Charge",
    notes: "விண்ணப்பம் தொழிலாளர் உதவி ஆணையர் (சமூக பாதுகாப்பு திட்டம்) அலுவலகத்தால் சரிபார்க்கப்பட்டு ஒப்புதல் அளிக்கப்பட்டதும் UWW கார்டை ஆன்லைனிலேயே பதிவிறக்கம் செய்யலாம்."
  },
  {
    id: "nalavariyam-membership-renewal",
    name: "2. உறுப்பினர் அட்டை புதுப்பித்தல் (Membership Renewal)",
    category: "Welfare Board (நல வாரியம்)",
    description: "H1: 2. உறுப்பினர் அட்டை புதுப்பித்தல் (Membership Renewal)\nH2: நல வாரிய அடையாள அட்டை 5 ஆண்டு காலாவதி புதுப்பித்தல் சேவை\n* விளக்கம் (Desc): நல வாரியத்தில் பதிவு செய்யப்பட்ட உறுப்பினர் அட்டை காலாவதியாகாமல் இருக்க குறிப்பிட்ட காலத்திற்கு ஒருமுறை (5 ஆண்டுகளுக்கு ஒருமுறை) பதிவைப் புதுப்பிக்கும் சேவை.\n* தகுதி (Eligibility): நல வாரியத்தில் பதிவு செய்து 5 ஆண்டுகள் நிறைவடைந்த மற்றும் தொடர்ந்து தொழிலில் ஈடுபடும் தொழிலாளர்கள்.\n* பயன்கள் (Benefit): உறுப்பினர் பதிவு தொடர்ந்து செயலில் இருக்கும்; இடைநிறுத்தம் ஏதுமின்றி திட்ட நிதியுதவிகள் தடையின்றி தொடர்ந்து கிடைக்கும்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Renewal Portal)$*LINK(TNUWWB Renewal Portal)->https://tnuwwb.tn.gov.in/\nஅரசு கட்டணம்$முற்றிலும் இலவசம் (Free)\nபுதுப்பித்தல் இடைவெளி$5 ஆண்டுகளுக்கு ஒருமுறை கட்டாயம் புதுப்பிக்க வேண்டும்\nதேவைப்படும் தகவல்$பழைய உறுப்பினர் அட்டை எண் & ஆதாருடன் இணைந்த மொபைல் எண்\nமுக்கிய நன்மை$ஓய்வூதியம், மகப்பேறு மற்றும் விபத்து காப்பீட்டு பலன்கள் தடையின்றி நீடிக்கும்",
    documentRequirements: [
      "பழைய நல வாரிய அசல் பதிவு அட்டை / பதிவு எண்",
      "தொழிலாளி தற்போதும் அதே தொழிலில் ஈடுபடுவதற்கான சுய பிரகடனம் / VAO தொழில் சான்று",
      "குடும்ப அட்டை மற்றும் ஆதார் அட்டை நகல்",
      "விண்ணப்பதாரரின் வங்கி பாஸ்புக் நகல்"
    ],
    urls: [
      { label: "TNUWWB Renewal Portal", url: "https://tnuwwb.tn.gov.in/" }
    ],
    payFee: "முற்றிலும் இலவசம் (Free - No Govt Fee)",
    charges: "₹60 - ₹100 Service Charge",
    notes: "உறுப்பினர் அட்டை காலாவதியானால் நலத்திட்ட உதவிகளுக்கான விண்ணப்பங்கள் நிராகரிக்கப்படலாம்; எனவே 5 ஆண்டுகள் முடியும் முன்னரே புதுப்பிப்பது அவசியம்."
  },
  {
    id: "nalavariyam-educational-assistance-claim",
    name: "3. கல்வி உதவித்தொகை கோருதல் (Educational Assistance Claim)",
    category: "Welfare Board (நல வாரியம்)",
    description: "H1: 3. கல்வி உதவித்தொகை கோருதல் (Educational Assistance Claim)\nH2: தொழிலாளர்களின் குழந்தைகள் பள்ளி & கல்லூரி படிப்பிற்கான கல்வி நிதியுதவி\n* விளக்கம் (Desc): பதிவு பெற்ற தொழிலாளர்களின் மகன் மற்றும் மகள்களின் பள்ளி (10, 11, 12-ஆம் வகுப்பு), ஐடிஐ, பாலிடெக்னிக், பட்டப்படிப்பு, தொழிற்கல்வி மற்றும் முதுகலை படிப்புகளுக்கு வழங்கப்படும் வருடாந்திர கல்வி நிதியுதவி.\n* தகுதி (Eligibility): நல வாரியத்தில் பதிவு பெற்ற தொழிலாளர்களின் மகன் மற்றும் மகள்கள் (அதிகபட்சம் 2 குழந்தைகளுக்கு).\n* பயன்கள் (Benefit): படிக்கும் வகுப்பிற்கு ஏற்ப ஆண்டுக்கு ₹1,000 முதல் ₹8,000 வரையிலும், தொழிற்கல்வி (Engineering, Medical) மற்றும் விடுதியில் தங்கிப் படிக்கும் மாணவர்களுக்கு கூடுதல் நிதியுதவியும் நேரடியாக வங்கிக் கணக்கில் வழங்கப்படும்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Claims Portal)$*LINK(TNUWWB Claims Portal)->https://tnuwwb.tn.gov.in/\nஅரசு கட்டணம்$முற்றிலும் இலவசம் (Free)\n10-ஆம் வகுப்பு / 12-ஆம் வகுப்பு தேர்ச்சி$₹1,000 முதல் ₹1,500 வரை\nபட்டப்படிப்பு (Degree / ITI / Poly)$ஆண்டுக்கு ₹1,500 முதல் ₹4,000 வரை\nதொழிற்கல்வி (Engg / MBBS / Law)$ஆண்டுக்கு ₹4,000 முதல் ₹8,000 வரை (விடுதி மாணவர்களுக்கு கூடுதல் உதவி)",
    documentRequirements: [
      "நல வாரிய உறுப்பினர் அட்டை (அசல் நகல்)",
      "நடப்பு கல்வியாண்டு சேர்க்கை மற்றும் படிப்புச் சான்றிதழ் (Bonafide Certificate from School / College)",
      "முந்தைய ஆண்டின் தேர்ச்சி மதிப்பெண் பட்டியல் (Marksheet)",
      "மாணவர் மற்றும் பெற்றோரின் ஆதார் அட்டை",
      "தொழிலாளியின் வங்கிக் கணக்கு புத்தகம் மற்றும் குடும்ப அட்டை நகல்"
    ],
    urls: [
      { label: "TNUWWB Claims Portal", url: "https://tnuwwb.tn.gov.in/" }
    ],
    payFee: "முற்றிலும் இலவசம் (Free - No Govt Fee)",
    charges: "₹80 - ₹120 Service Charge",
    notes: "பள்ளியில் 10-ஆம் மற்றும் 12-ஆம் வகுப்பு பொதுத்தேர்வில் அதிக மதிப்பெண் பெறும் தொழிலாளர்களின் குழந்தைகளுக்கு மாவட்ட அளவில் சிறப்பு ஊக்கத்தொகையும் வழங்கப்படுகிறது."
  },
  {
    id: "nalavariyam-marriage-assistance-claim",
    name: "4. திருமண நிதியுதவி (Marriage Assistance Claim)",
    category: "Welfare Board (நல வாரியம்)",
    description: "H1: 4. திருமண நிதியுதவி (Marriage Assistance Claim)\nH2: தொழிலாளி அல்லது தொழிலாளியின் மகன்/மகள் திருமணத்திற்கான அரசு நிதியுதவி\n* விளக்கம் (Desc): நல வாரியத்தில் பதிவு செய்துள்ள பெண் தொழிலாளியின் திருமணத்திற்கோ அல்லது பதிவு பெற்ற ஆண்/பெண் தொழிலாளியின் மகன் அல்லது மகளின் திருமணத்திற்கோ வழங்கப்படும் ஒருமுறை அரசு நிதியுதவி.\n* தகுதி (Eligibility): நல வாரியத்தில் குறைந்தது 1 ஆண்டு தொடர்ந்து உறுப்பினராக உள்ள தொழிலாளர்கள் (மணமகனுக்கு 21 வயது, மணமகளுக்கு 18 வயது பூர்த்தியாகியிருக்க வேண்டும்).\n* பயன்கள் (Benefit): ஆண் உறுப்பினரின் திருமணத்திற்கு ₹3,000; பெண் உறுப்பினரின் திருமணத்திற்கு அல்லது உறுப்பினரின் மகள் திருமணத்திற்கு ₹5,000 நேரடியாக வங்கிக் கணக்கில் நிதியுதவியாக வழங்கப்படும் (கட்டுமான வாரியத்திற்கு ₹20,000 வரை சலுகை உண்டு).\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Marriage Claim)$*LINK(TNUWWB Marriage Claim)->https://tnuwwb.tn.gov.in/\nஅரசு கட்டணம்$முற்றிலும் இலவசம் (Free)\nஆண் உறுப்பினர் திருமண உதவி$₹3,000 (நேரடி வங்கி பரிமாற்றம்)\nபெண் உறுப்பினர் / மகள் திருமண உதவி$₹5,000 (கட்டுமான வாரியத்தில் ₹20,000 வரை)\nவிண்ணப்பிக்கும் கால அளவு$திருமணம் முடிந்த தேதியிலிருந்து 6 மாதங்களுக்குள் விண்ணப்பிக்க வேண்டும்",
    documentRequirements: [
      "நல வாரிய அடையாள அட்டை (குறைந்தது 1 ஆண்டு உறுப்பினராக இருந்திருக்க வேண்டும்)",
      "திருமணப் பதிவுச் சான்றிதழ் (Marriage Certificate) அல்லது VAO திருமண உறுதிச் சான்று",
      "திருமண அழைப்பிதழ் (Wedding Invitation Card)",
      "மணமகன் மற்றும் மணமகளின் வயதுச் சான்று (Age Proof)",
      "குடும்ப அட்டை, ஆதார் அட்டை மற்றும் வங்கி பாஸ்புக் நகல்"
    ],
    urls: [
      { label: "TNUWWB Portal", url: "https://tnuwwb.tn.gov.in/" }
    ],
    payFee: "முற்றிலும் இலவசம் (Free - No Govt Fee)",
    charges: "₹100 Service Charge",
    notes: "திருமணம் நடைபெற்ற தேதியிலிருந்து 6 மாத காலத்திற்குள் முறையான ஆவணங்களுடன் விண்ணப்பிக்க வேண்டும்."
  },
  {
    id: "nalavariyam-maternity-miscarriage-relief",
    name: "5. மகப்பேறு நிதியுதவி & கருச்சிதைவு நிவாரணம் (Maternity & Miscarriage Relief)",
    category: "Welfare Board (நல வாரியம்)",
    description: "H1: 5. மகப்பேறு நிதியுதவி & நிவாரணம் (Maternity & Miscarriage Relief)\nH2: பதிவு பெற்ற பெண் தொழிலாளர்களுக்கான பிரசவ கால அரசு நிதியுதவி\n* விளக்கம் (Desc): பதிவு பெற்ற பெண் தொழிலாளர்களுக்கு குழந்தை பிறப்பின் போது ஏற்படும் மருத்துவச் செலவுகளை ஈடுசெய்யவும் ஊட்டச்சத்து பராமரிப்பிற்காகவும் வழங்கப்படும் நிதியுதவி (அதிகபட்சம் 2 பிரசவங்களுக்கு).\n* தகுதி (Eligibility): நல வாரியத்தில் குறைந்தது 1 ஆண்டு பதிவு செய்துள்ள பெண் தொழிலாளர்கள் (அதிகபட்சம் 2 பிரசவங்களுக்கு).\n* பயன்கள் (Benefit): மகப்பேறு நிதியுதவியாக ₹6,000 (பிரசவத்திற்கு முன் ₹3,000, பின் ₹3,000); கருச்சிதைவு அல்லது கருக்கலைப்பு ஏற்பட்டால் ₹3,000 நிவாரணம் வழங்கப்படும்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Maternity Claim)$*LINK(TNUWWB Maternity Claim Portal)->https://tnuwwb.tn.gov.in/\nஅரசு கட்டணம்$முற்றிலும் இலவசம் (Free)\nமகப்பேறு நிதியுதவி தொகை$₹6,000 (பிரசவத்திற்கு முன் ₹3,000, பின் ₹3,000)\nகருச்சிதைவு / கருக்கலைப்பு நிவாரணம்$₹3,000\nமுக்கிய ஆவணம்$குழந்தையின் பிறப்புச் சான்றிதழ், RCH ID / PICME அட்டை & பிரசவ சான்றிதழ்",
    documentRequirements: [
      "நல வாரிய உறுப்பினர் அட்டை நகல்",
      "குழந்தையின் பிறப்புச் சான்றிதழ் (Birth Certificate)",
      "தாய்-சேய் நல அட்டை (RCH ID / PICME அட்டை நகல்)",
      "அரசு மருத்துவமனை பிரசவ சான்றிதழ் அல்லது கருச்சிதைவு மருத்துவ அறிக்கை",
      "ஆதார் அட்டை மற்றும் பெண் தொழிலாளியின் சொந்த வங்கிக் கணக்கு புத்தகம்"
    ],
    urls: [
      { label: "TNUWWB Maternity Claim", url: "https://tnuwwb.tn.gov.in/" }
    ],
    payFee: "முற்றிலும் இலவசம் (Free - No Govt Fee)",
    charges: "₹80 - ₹100 Service Charge",
    notes: "டாக்டர் முத்துலட்சுமி ரெட்டி மகப்பேறு நிதித் திட்டத்துடன் கூடுதலாக இந்த நல வாரிய மகப்பேறு உதவியையும் தொழிலாளர்கள் பெற்றுக் கொள்ளலாம்."
  },
  {
    id: "nalavariyam-natural-death-funeral-assistance",
    name: "6. இயற்கை மரணம் & ஈமச்சடங்கு உதவி (Natural Death & Funeral Assistance)",
    category: "Welfare Board (நல வாரியம்)",
    description: "H1: 6. இயற்கை மரணம் & ஈமச்சடங்கு உதவி (Natural Death & Funeral Assistance)\nH2: தொழிலாளி மறைவின் போது குடும்பத்தினருக்கு வழங்கப்படும் உடனடி நிதி & நிவாரணம்\n* விளக்கம் (Desc): பதிவு பெற்ற தொழிலாளி இயற்கையாக மரணமடைந்தால், அவரது குடும்பத்தினருக்கு வழங்கப்படும் ஈமச்சடங்கு உதவி மற்றும் வாழ்வாதார நிதி.\n* தகுதி (Eligibility): நல வாரியத்தில் உறுப்பினர் பதிவு செயலில் உள்ள தொழிலாளியின் சட்டப்பூர்வ வாரிசுதாரர் / நாமினி.\n* பயன்கள் (Benefit): உடனடி ஈமச்சடங்கு செலவிற்காக ₹5,000 மற்றும் இயற்கை மரண நிவாரணமாக ₹20,000 முதல் ₹50,000 வரை (வாரிய வாரியாக) நாமினியின் வங்கிக் கணக்கிற்கு நேரடியாக வழங்கப்படும்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Death Claim)$*LINK(TNUWWB Death Claim Portal)->https://tnuwwb.tn.gov.in/\nஅரசு கட்டணம்$முற்றிலும் இலவசம் (Free)\nஈமச்சடங்கு உடனடி உதவி$₹5,000 (நாமினிக்கு வழங்கப்படுகிறது)\nஇயற்கை மரண நிவாரணம்$₹20,000 முதல் ₹50,000 வரை (வாரிய வகைப்பாடு படி)\nமுக்கிய ஆவணங்கள்$இறப்புச் சான்றிதழ், வாரிசுச் சான்றிதழ், ஈமச்சடங்கு உள்ளாட்சி சான்று",
    documentRequirements: [
      "உறுப்பினரின் அசல் நல வாரிய அட்டை",
      "இறப்புச் சான்றிதழ் (Municipal / Panchayat Death Certificate)",
      "வாரிசுச் சான்றிதழ் (Legal Heir Certificate)",
      "நாமினி அல்லது வாரிசுதாரரின் ஆதார் அட்டை, புகைப்படம் மற்றும் வங்கிக் கணக்கு புத்தகம்",
      "ஈமச்சடங்கு செலவு செய்ததற்கான உள்ளாட்சி மன்ற சான்று / VAO சான்று"
    ],
    urls: [
      { label: "TNUWWB Death Claim", url: "https://tnuwwb.tn.gov.in/" }
    ],
    payFee: "முற்றிலும் இலவசம் (Free - No Govt Fee)",
    charges: "₹100 Service Charge",
    notes: "மரணம் நிகழ்ந்த தேதியிலிருந்து தாமதமின்றி உடனடியாக விண்ணப்பித்தால் ஈமச்சடங்கு நிதி விரைவாக நாமினியின் வங்கி கணக்கிற்கு வந்து சேரும்."
  },
  {
    id: "nalavariyam-accidental-death-disability-relief",
    name: "7. விபத்து மரணம் & விபத்து ஊனமுற்றோர் நிவாரணம் (Accidental Death & Disability Relief)",
    category: "Welfare Board (நல வாரியம்)",
    description: "H1: 7. விபத்து மரணம் & ஊனமுற்றோர் நிவாரணம் (Accidental Death & Disability)\nH2: விபத்தினால் ஏற்படும் உயிரிழப்பு அல்லது நிரந்தர ஊனத்திற்கான இழப்பீட்டு உதவி\n* விளக்கம் (Desc): பணியிடத்திலோ அல்லது வெளியிலோ ஏற்படும் விபத்து காரணமாக தொழிலாளி உயிரிழக்க நேரிட்டாலோ அல்லது நிரந்தர ஊனம் அடைந்தாலோ வழங்கப்படும் சிறப்பு இழப்பீட்டு உதவி.\n* தகுதி (Eligibility): நல வாரிய உறுப்பினர் விபத்தில் உயிரிழந்தால் அவரது குடும்பத்தினர்; விபத்தில் கை/கால் இழந்த தொழிலாளர்கள்.\n* பயன்கள் (Benefit): விபத்து மரணத்திற்கு ₹1,00,000 முதல் ₹5,00,000 வரை இழப்பீடு; முழு நிரந்தர ஊனத்திற்கு ₹1,00,000 வரை மற்றும் செயற்கை உபகரணங்கள்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Accidental Claim)$*LINK(TNUWWB Accidental Claim Portal)->https://tnuwwb.tn.gov.in/\nஅரசு கட்டணம்$முற்றிலும் இலவசம் (Free)\nவிபத்து மரண இழப்பீடு$₹1,00,000 முதல் ₹5,00,000 வரை (கட்டுமான வாரியத்திற்கு ₹5 லட்சம்)\nமுழு நிரந்தர ஊன நிவாரணம்$₹1,00,000 வரை (ஊன சதவீதத்திற்கு ஏற்ப)\nமுக்கிய ஆவணங்கள்$FIR நகல், பிரேத பரிசோதனை அறிக்கை (Post-Mortem Report), மருத்துவ ஊன சான்றிதழ்",
    documentRequirements: [
      "நல வாரிய அட்டை நகல்",
      "காவல் நிலைய முதல் தகவல் அறிக்கை (FIR Copy)",
      "பிரேத பரிசோதனை அறிக்கை (Post-Mortem Report - விபத்து மரணத்திற்கு)",
      "இறப்புச் சான்றிதழ் மற்றும் வாரிசுச் சான்றிதழ்",
      "ஊனம் எனில்: அரசு மருத்துவக் குழு வழங்கிய ஊனமுற்றோர் சதவீத சான்றிதழ் (Disability Certificate)",
      "வங்கி பாஸ்புக் மற்றும் குடும்ப அட்டை"
    ],
    urls: [
      { label: "TNUWWB Accidental Claim", url: "https://tnuwwb.tn.gov.in/" }
    ],
    payFee: "முற்றிலும் இலவசம் (Free - No Govt Fee)",
    charges: "₹100 - ₹150 Service Charge",
    notes: "விபத்து மரணத்திற்கு FIR மற்றும் Post-Mortem அறிக்கை கட்டாயமாகும். கட்டுமான பணியிட விபத்துகளுக்கு அதிகபட்ச இழப்பீடாக ₹5,00,000 வரை வழங்கப்படுகிறது."
  },
  {
    id: "nalavariyam-old-age-pension",
    name: "8. முதியோர் ஓய்வூதியம் (Old Age Pension - OAP for Registered Workers)",
    category: "Welfare Board (நல வாரியம்)",
    description: "H1: 8. முதியோர் ஓய்வூதியம் (Old Age Pension - OAP for Registered Workers)\nH2: 60 வயது நிறைவடைந்த மூத்த தொழிலாளர்களுக்கான மாதாந்திர அரசு ஓய்வூதியம்\n* விளக்கம் (Desc): வாரியத்தில் பதிவு செய்து 60 வயதை நிறைவு செய்த மூத்த தொழிலாளர்களுக்கு வாழ்நாள் முழுவதும் வழங்கப்படும் மாதாந்திர அரசு ஓய்வூதியம்.\n* தகுதி (Eligibility): நல வாரியத்தில் குறைந்தது 5 ஆண்டுகள் உறுப்பினராக இருந்து 60 வயதை நிறைவு செய்த அமைப்புசாரா தொழிலாளர்கள்.\n* பயன்கள் (Benefit): வாழ்நாள் முழுவதும் மாதந்தோறும் ₹1,000 ஓய்வூதியமாக தொழிலாளியின் வங்கிக் கணக்கில் நேரடியாக வரவு வைக்கப்படும்.\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Pension Portal)$*LINK(TNUWWB Pension Portal)->https://tnuwwb.tn.gov.in/\nஅரசு கட்டணம்$முற்றிலும் இலவசம் (Free)\nமாதாந்திர ஓய்வூதியம்$மாதந்தோறும் ₹1,000 தொழிலாளியின் சேமிப்பு வங்கிக் கணக்கில் வரவு வைக்கப்படும்\nதகுதி வயது$60 வயது பூர்த்தியடைந்திருக்க வேண்டும்\nஉறுப்பினர் காலம்$குறைந்தது 5 ஆண்டுகள் நல வாரியத்தில் உறுப்பினராக இருந்திருக்க வேண்டும்",
    documentRequirements: [
      "நல வாரிய அசல் உறுப்பினர் அட்டை (குறைந்தது 5 ஆண்டுகள் உறுப்பினராக இருந்திருக்க வேண்டும்)",
      "60 வயது பூர்த்தியடைந்ததற்கான வயதுச் சான்று (ஆதார் / பள்ளி சான்றிதழ் / வாக்காளர் அட்டை)",
      "ஆதார் அட்டை மற்றும் குடும்ப அட்டை நகல்",
      "ஓய்வூதியம் வரவு வைக்கப்பட வேண்டிய தனிக் கணக்கு வங்கி பாஸ்புக் (Single Account Only)",
      "நேரலை புகைப்படம் / வாழ்நாள் சான்று (Life Certificate)"
    ],
    urls: [
      { label: "TNUWWB Pension Portal", url: "https://tnuwwb.tn.gov.in/" }
    ],
    payFee: "முற்றிலும் இலவசம் (Free - No Govt Fee)",
    charges: "₹100 Service Charge",
    notes: "ஓய்வூதிய வங்கிக் கணக்கு தொழிலாளியின் பெயரில் மட்டுமே உள்ள தனிக் கணக்காக (Single Account) இருக்க வேண்டும். கூட்டு கணக்கு (Joint Account) ஏற்றுக்கொள்ளப்பட மாட்டாது."
  },
  {
    id: "nalavariyam-spectacles-assistance",
    name: "9. கண் கண்ணாடி உதவித்தொகை (Spectacles Assistance Scheme)",
    category: "Welfare Board (நல வாரியம்)",
    description: "H1: 9. கண் கண்ணாடி உதவித்தொகை (Spectacles Assistance Scheme)\nH2: பார்வைக் குறைபாடுள்ள தொழிலாளர்களுக்கு கண் கண்ணாடி வாங்குவதற்கான அரசு உதவி\n* விளக்கம் (Desc): பதிவு பெற்ற தொழிலாளர்கள் பார்வைக் குறைபாட்டினால் பாதிக்கப்படும் போது கண் கண்ணாடி வாங்குவதற்காக வழங்கப்படும் நிதியுதவி.\n* தகுதி (Eligibility): நல வாரியத்தில் உறுப்பினர் பதிவு செயலில் உள்ள அனைத்து அமைப்புசாரா தொழிலாளர்கள்.\n* பயன்கள் (Benefit): கண்ணாடி வாங்குவதற்காக அதிகபட்சமாக ₹500 வரை தொழிலாளியின் வங்கிக் கணக்கில் திருப்பிச் செலுத்தப்படும் (Reimbursement).\n---\ntable:\nசேவை விபரம்$தகவல்\nஇணைய இணைப்பு (Spectacles Claim)$*LINK(TNUWWB Spectacles Portal)->https://tnuwwb.tn.gov.in/\nஅரசு கட்டணம்$முற்றிலும் இலவசம் (Free)\nஉதவித்தொகை$அதிகபட்சம் ₹500 (கண்ணாடி வாங்கிய ரசீது படி திருப்பித் தரப்படும்)\nதேவைப்படும் ஆவணம்$மருத்துவரின் பரிந்துரைச் சீட்டு (Doctor's Prescription) & அசல் ஜிஎஸ்டி பில்",
    documentRequirements: [
      "நல வாரிய அடையாள அட்டை நகல்",
      "அரசு அங்கீகாரம் பெற்ற கண் மருத்துவர் வழங்கிய கண் பரிசோதனை மருந்துச் சீட்டு (Doctor Prescription)",
      "கண் கண்ணாடி வாங்கியதற்கான அசல் ஜிஎஸ்டி பில் (Original Bill / Receipt with GST)",
      "ஆதார் அட்டை மற்றும் வங்கி பாஸ்புக் நகல்"
    ],
    urls: [
      { label: "TNUWWB Portal", url: "https://tnuwwb.tn.gov.in/" }
    ],
    payFee: "முற்றிலும் இலவசம் (Free - No Govt Fee)",
    charges: "₹50 Service Charge",
    notes: "கண் கண்ணாடி வாங்கிய அசல் பில்லில் தொழிலாளியின் பெயர் மற்றும் தேதி தெளிவாகக் குறிப்பிடப்பட்டிருக்க வேண்டும்."
  }
];

const LOCAL_STORAGE_WEBSITES_KEY = "customer_app_websites_v2";
const LOCAL_STORAGE_CATEGORIES_KEY = "customer_app_categories_v1";

const DEFAULT_CATEGORIES = [
  "E-Sevai",
  "Pension Services",
  "PAN Card Services",
  "Vehicle & Transport Services",
  "Land & Property Services",
  "Business Services",
  "Electricity & EB Services",
  "FSSAI Food Safety Services",
  "Police Services",
  "Competitive Exams",
  "Passport Services",
  "Welfare Board (நல வாரியம்)",
  "Identity & Governance",
  "Banking & Tax",
  "Transport & Vehicles",
  "Travel & Identity",
  "Government Schemes",
  "Utilities & Bills"
];

const getLocalCategories = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const filtered = parsed.filter(c => c && c.trim().toLowerCase() !== 'other');
        // Merge with DEFAULT_CATEGORIES to ensure defaults like E-Sevai are present
        const merged = Array.from(new Set([...DEFAULT_CATEGORIES, ...filtered]));
        if (merged.length !== filtered.length) {
          saveLocalCategories(merged);
        }
        return merged;
      }
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
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Automatically merge newly added default websites (e.g. E-Sevai items) if missing
        const existingIds = new Set(parsed.map(site => site.id));
        const missingDefaults = DEFAULT_WEBSITES.filter(d => !existingIds.has(d.id));

        let currentList = parsed;
        if (missingDefaults.length > 0) {
          currentList = [...parsed, ...missingDefaults];
          try {
            localStorage.setItem(LOCAL_STORAGE_WEBSITES_KEY, JSON.stringify(currentList));
          } catch (e) {
            console.error("Error updating local websites with defaults:", e);
          }
        }

        return currentList.map(site => ({
          ...site,
          documentRequirements: parseDocumentList(site.documentRequirements)
        }));
      }
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
  return DEFAULT_WEBSITES.map(site => ({
    ...site,
    documentRequirements: parseDocumentList(site.documentRequirements)
  }));
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
          const existingIds = new Set(data.data.map(site => site.id));
          const missingDefaults = DEFAULT_WEBSITES.filter(d => !existingIds.has(d.id));
          const allWebsites = [...data.data, ...missingDefaults];
          const normalized = allWebsites.map(site => ({
            ...site,
            documentRequirements: parseDocumentList(site.documentRequirements)
          }));
          saveLocalWebsites(normalized);
          return { success: true, data: normalized };
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
      documentRequirements: parseDocumentList(websiteData.documentRequirements),
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

    if (websiteData.documentRequirements !== undefined) {
      updatedWebsite.documentRequirements = parseDocumentList(websiteData.documentRequirements);
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
          const cleanRemote = data.data.filter(c => c && String(c).trim().toLowerCase() !== 'other');
          const merged = Array.from(new Set([...localList, ...cleanRemote]));
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



