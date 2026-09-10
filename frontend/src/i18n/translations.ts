/**
 * SIH26002 — 6-Language Translation Dictionary
 * Supports: English, Hindi, Assamese, Bengali, Khasi, Bodo
 */

export type SupportedLanguage = 'en' | 'hi' | 'as' | 'bn' | 'kha' | 'brx';

export interface Translations {
  // Navigation
  nav: {
    commandCenter: string;
    fleetDeliveries: string;
    networkAccessibility: string;
    aiRouting: string;
    supplyContinuity: string;
    fieldOperations: string;
    alerts: string;
    analytics: string;
    administration: string;
    districtCommand: string;
    fleetConvoys: string;
    driverTelematics: string;
    fieldRecon: string;
    createReport: string;
    offlineQueue: string;
    supplyInventory: string;
    hospitalStockouts: string;
    safeHubs: string;
    userManagement: string;
    auditLogs: string;
    systemHealth: string;
  };
  // Route Planning
  route: {
    from: string;
    to: string;
    optimize: string;
    startNavigation: string;
    calculating: string;
    nextTurn: string;
    turnLeft: string;
    turnRight: string;
    continueStr: string;
    arrive: string;
    reroute: string;
    eta: string;
    distance: string;
    risk: string;
    reliability: string;
    aiRecommended: string;
    fastest: string;
    alternative: string;
    onlyFeasible: string;
    blocked: string;
    feasible: string;
    cargoType: string;
    priority: string;
    whyThisRoute: string;
    routeChanged: string;
    floodRisk: string;
    voiceGuidance: string;
    searchOrigin: string;
    searchDest: string;
  };
  // Field Operations
  field: {
    report: string;
    submit: string;
    photo: string;
    attachPhoto: string;
    offline: string;
    sync: string;
    syncing: string;
    synced: string;
    gps: string;
    captureGps: string;
    severity: string;
    critical: string;
    high: string;
    medium: string;
    low: string;
    verification: string;
    verify: string;
    verified: string;
    pending: string;
    incidentType: string;
    description: string;
    district: string;
    location: string;
    officer: string;
    department: string;
  };
  // Safe Hubs
  safeHub: {
    findNearest: string;
    routeToHub: string;
    highGround: string;
    risk: string;
    accessibility: string;
    capacity: string;
    distance: string;
    eta: string;
    status: string;
    open: string;
    full: string;
    recommended: string;
  };
  // Alerts
  alerts: {
    roadClosed: string;
    floodWarning: string;
    landslide: string;
    highRisk: string;
    criticalDelivery: string;
    active: string;
    resolved: string;
    broadcast: string;
    languages: string;
  };
  // Supply
  supply: {
    hospital: string;
    stockout: string;
    reserves: string;
    protected: string;
    critical: string;
    adequate: string;
    depot: string;
    medicine: string;
    food: string;
    equipment: string;
  };
  // Admin
  admin: {
    systemHealth: string;
    users: string;
    audit: string;
    status: string;
    activate: string;
    deactivate: string;
    changeRole: string;
    integrations: string;
    online: string;
    offline: string;
    degraded: string;
  };
  // Common
  common: {
    loading: string;
    error: string;
    retry: string;
    simulation: string;
    live: string;
    demo: string;
    cancel: string;
    close: string;
    save: string;
    confirm: string;
    search: string;
    refresh: string;
    noData: string;
    success: string;
    failed: string;
    switchRole: string;
    currentRole: string;
    online: string;
    offline: string;
    queue: string;
  };
}

const en: Translations = {
  nav: {
    commandCenter: 'Command Center',
    fleetDeliveries: 'Fleet & Deliveries',
    networkAccessibility: 'Network Accessibility',
    aiRouting: 'AI Routing',
    supplyContinuity: 'Supply Continuity',
    fieldOperations: 'Field Operations',
    alerts: 'Alerts',
    analytics: 'Analytics',
    administration: 'Administration',
    districtCommand: 'District Command',
    fleetConvoys: 'Fleet & Convoys',
    driverTelematics: 'Driver Telematics',
    fieldRecon: 'Field Reconnaissance',
    createReport: 'Create Report',
    offlineQueue: 'Offline Queue',
    supplyInventory: 'Supply Inventory',
    hospitalStockouts: 'Hospital Stockouts',
    safeHubs: 'Safe Hubs',
    userManagement: 'User Management',
    auditLogs: 'Audit Logs',
    systemHealth: 'System Health',
  },
  route: {
    from: 'From',
    to: 'To',
    optimize: 'Optimize Smart Route',
    startNavigation: 'Start Navigation',
    calculating: 'Calculating…',
    nextTurn: 'Next Turn',
    turnLeft: 'Turn Left',
    turnRight: 'Turn Right',
    continueStr: 'Continue Straight',
    arrive: 'Arrive',
    reroute: 'Rerouting…',
    eta: 'ETA',
    distance: 'Distance',
    risk: 'Risk',
    reliability: 'Reliability',
    aiRecommended: 'AI Recommended',
    fastest: 'Fastest Baseline',
    alternative: 'Safer Alternative',
    onlyFeasible: 'Only Feasible Route',
    blocked: 'Blocked',
    feasible: 'Feasible',
    cargoType: 'Cargo Type',
    priority: 'Priority',
    whyThisRoute: 'Why This Route?',
    routeChanged: 'Route Change Detected',
    floodRisk: 'Flood Risk Increased',
    voiceGuidance: 'Voice Guidance',
    searchOrigin: 'Search origin location…',
    searchDest: 'Search destination…',
  },
  field: {
    report: 'Report',
    submit: 'Submit Report',
    photo: 'Photo',
    attachPhoto: 'Attach Photo',
    offline: 'Offline',
    sync: 'Sync Now',
    syncing: 'Syncing…',
    synced: 'Synced',
    gps: 'GPS',
    captureGps: 'Capture GPS Location',
    severity: 'Severity',
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    verification: 'Verification',
    verify: 'Verify',
    verified: 'Verified',
    pending: 'Pending',
    incidentType: 'Incident Type',
    description: 'Description',
    district: 'District',
    location: 'Location',
    officer: 'Officer',
    department: 'Department',
  },
  safeHub: {
    findNearest: 'Find Nearest Safe Hub',
    routeToHub: 'Route to Hub',
    highGround: 'High Ground',
    risk: 'Risk Score',
    accessibility: 'Accessibility',
    capacity: 'Capacity',
    distance: 'Distance',
    eta: 'ETA',
    status: 'Status',
    open: 'Open',
    full: 'Full',
    recommended: 'Recommended',
  },
  alerts: {
    roadClosed: 'Road Closed',
    floodWarning: 'Flood Warning',
    landslide: 'Landslide Alert',
    highRisk: 'High Risk',
    criticalDelivery: 'Critical Delivery',
    active: 'Active',
    resolved: 'Resolved',
    broadcast: 'Broadcast',
    languages: 'Languages',
  },
  supply: {
    hospital: 'Hospital',
    stockout: 'Stockout',
    reserves: 'Reserves',
    protected: 'Protected',
    critical: 'Critical',
    adequate: 'Adequate',
    depot: 'Depot',
    medicine: 'Medicine',
    food: 'Food',
    equipment: 'Equipment',
  },
  admin: {
    systemHealth: 'System Health',
    users: 'Users',
    audit: 'Audit',
    status: 'Status',
    activate: 'Activate',
    deactivate: 'Deactivate',
    changeRole: 'Change Role',
    integrations: 'Integrations',
    online: 'Online',
    offline: 'Offline',
    degraded: 'Degraded',
  },
  common: {
    loading: 'Loading…',
    error: 'Error',
    retry: 'Retry',
    simulation: 'Simulation',
    live: 'Live',
    demo: 'Demo',
    cancel: 'Cancel',
    close: 'Close',
    save: 'Save',
    confirm: 'Confirm',
    search: 'Search',
    refresh: 'Refresh',
    noData: 'No data available',
    success: 'Success',
    failed: 'Failed',
    switchRole: 'Switch Role',
    currentRole: 'Current Role',
    online: 'Online',
    offline: 'Offline',
    queue: 'Queue',
  },
};

const hi: Translations = {
  nav: {
    commandCenter: 'कमांड सेंटर',
    fleetDeliveries: 'वाहन और डिलीवरी',
    networkAccessibility: 'नेटवर्क पहुंच',
    aiRouting: 'एआई रूटिंग',
    supplyContinuity: 'आपूर्ति निरंतरता',
    fieldOperations: 'फील्ड ऑपरेशन',
    alerts: 'अलर्ट',
    analytics: 'विश्लेषण',
    administration: 'प्रशासन',
    districtCommand: 'जिला कमांड',
    fleetConvoys: 'वाहन काफिला',
    driverTelematics: 'चालक टेलीमैटिक्स',
    fieldRecon: 'फील्ड टोह',
    createReport: 'रिपोर्ट बनाएं',
    offlineQueue: 'ऑफलाइन कतार',
    supplyInventory: 'आपूर्ति सूची',
    hospitalStockouts: 'अस्पताल स्टॉकआउट',
    safeHubs: 'सुरक्षित केंद्र',
    userManagement: 'उपयोगकर्ता प्रबंधन',
    auditLogs: 'ऑडिट लॉग',
    systemHealth: 'सिस्टम स्वास्थ्य',
  },
  route: {
    from: 'से',
    to: 'तक',
    optimize: 'स्मार्ट मार्ग अनुकूलित करें',
    startNavigation: 'नेविगेशन शुरू करें',
    calculating: 'गणना हो रही है…',
    nextTurn: 'अगला मोड़',
    turnLeft: 'बायें मुड़ें',
    turnRight: 'दायें मुड़ें',
    continueStr: 'सीधे जारी रखें',
    arrive: 'पहुंचें',
    reroute: 'मार्ग बदला जा रहा है…',
    eta: 'अनुमानित समय',
    distance: 'दूरी',
    risk: 'जोखिम',
    reliability: 'विश्वसनीयता',
    aiRecommended: 'एआई अनुशंसित',
    fastest: 'सबसे तेज़',
    alternative: 'सुरक्षित विकल्प',
    onlyFeasible: 'एकमात्र व्यवहार्य मार्ग',
    blocked: 'अवरुद्ध',
    feasible: 'व्यवहार्य',
    cargoType: 'माल प्रकार',
    priority: 'प्राथमिकता',
    whyThisRoute: 'यह मार्ग क्यों?',
    routeChanged: 'मार्ग परिवर्तन पहचाना',
    floodRisk: 'बाढ़ जोखिम बढ़ा',
    voiceGuidance: 'ध्वनि मार्गदर्शन',
    searchOrigin: 'मूल स्थान खोजें…',
    searchDest: 'गंतव्य खोजें…',
  },
  field: {
    report: 'रिपोर्ट',
    submit: 'रिपोर्ट सबमिट करें',
    photo: 'फ़ोटो',
    attachPhoto: 'फ़ोटो संलग्न करें',
    offline: 'ऑफलाइन',
    sync: 'अभी सिंक करें',
    syncing: 'सिंक हो रहा है…',
    synced: 'सिंक हो गया',
    gps: 'जीपीएस',
    captureGps: 'जीपीएस स्थान कैप्चर करें',
    severity: 'गंभीरता',
    critical: 'अत्यंत गंभीर',
    high: 'उच्च',
    medium: 'मध्यम',
    low: 'कम',
    verification: 'सत्यापन',
    verify: 'सत्यापित करें',
    verified: 'सत्यापित',
    pending: 'लंबित',
    incidentType: 'घटना प्रकार',
    description: 'विवरण',
    district: 'जिला',
    location: 'स्थान',
    officer: 'अधिकारी',
    department: 'विभाग',
  },
  safeHub: {
    findNearest: 'निकटतम सुरक्षित केंद्र खोजें',
    routeToHub: 'केंद्र तक मार्ग',
    highGround: 'उच्च भूमि',
    risk: 'जोखिम स्कोर',
    accessibility: 'पहुंच',
    capacity: 'क्षमता',
    distance: 'दूरी',
    eta: 'अनुमानित समय',
    status: 'स्थिति',
    open: 'खुला',
    full: 'भरा हुआ',
    recommended: 'अनुशंसित',
  },
  alerts: {
    roadClosed: 'सड़क बंद',
    floodWarning: 'बाढ़ चेतावनी',
    landslide: 'भूस्खलन अलर्ट',
    highRisk: 'उच्च जोखिम',
    criticalDelivery: 'महत्वपूर्ण डिलीवरी',
    active: 'सक्रिय',
    resolved: 'समाधान',
    broadcast: 'प्रसारण',
    languages: 'भाषाएं',
  },
  supply: {
    hospital: 'अस्पताल',
    stockout: 'स्टॉक समाप्त',
    reserves: 'भंडार',
    protected: 'सुरक्षित',
    critical: 'महत्वपूर्ण',
    adequate: 'पर्याप्त',
    depot: 'डिपो',
    medicine: 'दवाइयां',
    food: 'खाद्य',
    equipment: 'उपकरण',
  },
  admin: {
    systemHealth: 'सिस्टम स्वास्थ्य',
    users: 'उपयोगकर्ता',
    audit: 'ऑडिट',
    status: 'स्थिति',
    activate: 'सक्रिय करें',
    deactivate: 'निष्क्रिय करें',
    changeRole: 'भूमिका बदलें',
    integrations: 'एकीकरण',
    online: 'ऑनलाइन',
    offline: 'ऑफलाइन',
    degraded: 'निम्नीकृत',
  },
  common: {
    loading: 'लोड हो रहा है…',
    error: 'त्रुटि',
    retry: 'पुनः प्रयास',
    simulation: 'सिमुलेशन',
    live: 'लाइव',
    demo: 'डेमो',
    cancel: 'रद्द करें',
    close: 'बंद करें',
    save: 'सहेजें',
    confirm: 'पुष्टि करें',
    search: 'खोजें',
    refresh: 'ताज़ा करें',
    noData: 'कोई डेटा उपलब्ध नहीं',
    success: 'सफल',
    failed: 'विफल',
    switchRole: 'भूमिका बदलें',
    currentRole: 'वर्तमान भूमिका',
    online: 'ऑनलाइन',
    offline: 'ऑफलाइन',
    queue: 'कतार',
  },
};

const as: Translations = {
  nav: {
    commandCenter: 'কমান্ড চেন্টাৰ',
    fleetDeliveries: 'ফ্লিট আৰু ডেলিভাৰী',
    networkAccessibility: 'নেটৱৰ্ক প্ৰৱেশযোগ্যতা',
    aiRouting: 'এআই ৰাউটিং',
    supplyContinuity: 'যোগান অব্যাহততা',
    fieldOperations: 'ফিল্ড অপাৰেচন',
    alerts: 'সতৰ্কতা',
    analytics: 'বিশ্লেষণ',
    administration: 'প্ৰশাসন',
    districtCommand: 'জিলা কমান্ড',
    fleetConvoys: 'ফ্লিট কনভয়',
    driverTelematics: 'চালক টেলিমেটিক্স',
    fieldRecon: 'ফিল্ড পৰিদৰ্শন',
    createReport: 'প্ৰতিবেদন তৈয়াৰ',
    offlineQueue: 'অফলাইন লাইন',
    supplyInventory: 'যোগান তালিকা',
    hospitalStockouts: 'চিকিৎসালয় ষ্টকআউট',
    safeHubs: 'নিৰাপদ কেন্দ্ৰ',
    userManagement: 'ব্যৱহাৰকাৰী ব্যৱস্থাপনা',
    auditLogs: 'অডিট লগ',
    systemHealth: 'চিষ্টেম স্বাস্থ্য',
  },
  route: {
    from: 'পৰা',
    to: 'লৈ',
    optimize: 'স্মাৰ্ট পথ অনুকূল কৰক',
    startNavigation: 'নেভিগেচন আৰম্ভ কৰক',
    calculating: 'গণনা হৈছে…',
    nextTurn: 'পৰৱৰ্তী বাক',
    turnLeft: 'বাওঁফালে বাক লওক',
    turnRight: 'সোঁফালে বাক লওক',
    continueStr: 'পোনে আগবাঢ়ক',
    arrive: 'উপস্থিত হওক',
    reroute: 'পথ সলনি হৈছে…',
    eta: 'আনুমানিক সময়',
    distance: 'দূৰত্ব',
    risk: 'বিপদ',
    reliability: 'নিৰ্ভৰযোগ্যতা',
    aiRecommended: 'এআই পৰামৰ্শিত',
    fastest: 'দ্ৰুততম',
    alternative: 'নিৰাপদ বিকল্প',
    onlyFeasible: 'একমাত্ৰ সম্ভৱ পথ',
    blocked: 'অৱৰুদ্ধ',
    feasible: 'সম্ভৱ',
    cargoType: 'মাল প্ৰকাৰ',
    priority: 'অগ্ৰাধিকাৰ',
    whyThisRoute: 'এই পথ কিয়?',
    routeChanged: 'পথ পৰিৱৰ্তন ধৰা পৰিছে',
    floodRisk: 'বানপানীৰ বিপদ বাঢ়িছে',
    voiceGuidance: 'কণ্ঠ পথনিৰ্দেশ',
    searchOrigin: 'আৰম্ভণি স্থান বিচাৰক…',
    searchDest: 'গন্তব্য বিচাৰক…',
  },
  field: {
    report: 'প্ৰতিবেদন',
    submit: 'প্ৰতিবেদন দাখিল কৰক',
    photo: 'ফটো',
    attachPhoto: 'ফটো সংলগ্ন কৰক',
    offline: 'অফলাইন',
    sync: 'এতিয়াই সিংক কৰক',
    syncing: 'সিংক হৈছে…',
    synced: 'সিংক হ\'ল',
    gps: 'জিপিএছ',
    captureGps: 'জিপিএছ অৱস্থান ধৰক',
    severity: 'গুৰুত্ব',
    critical: 'অতি গুৰুতৰ',
    high: 'উচ্চ',
    medium: 'মধ্যম',
    low: 'কম',
    verification: 'যাচাইকৰণ',
    verify: 'যাচাই কৰক',
    verified: 'যাচাই কৰা হ\'ল',
    pending: 'বাকী',
    incidentType: 'ঘটনাৰ প্ৰকাৰ',
    description: 'বিৱৰণ',
    district: 'জিলা',
    location: 'স্থান',
    officer: 'বিষয়া',
    department: 'বিভাগ',
  },
  safeHub: {
    findNearest: 'নিকটতম নিৰাপদ কেন্দ্ৰ বিচাৰক',
    routeToHub: 'কেন্দ্ৰলৈ পথ',
    highGround: 'উচ্চ ভূমি',
    risk: 'বিপদ স্ক\'ৰ',
    accessibility: 'প্ৰৱেশযোগ্যতা',
    capacity: 'ধাৰণ ক্ষমতা',
    distance: 'দূৰত্ব',
    eta: 'আনুমানিক সময়',
    status: 'অৱস্থা',
    open: 'খোলা',
    full: 'ভৰি গৈছে',
    recommended: 'পৰামৰ্শিত',
  },
  alerts: { roadClosed: 'ৰাস্তা বন্ধ', floodWarning: 'বানপানী সতৰ্কতা', landslide: 'মাটিধস সতৰ্কতা', highRisk: 'উচ্চ বিপদ', criticalDelivery: 'গুৰুত্বপূৰ্ণ ডেলিভাৰী', active: 'সক্ৰিয়', resolved: 'সমাধান', broadcast: 'সম্প্ৰচাৰ', languages: 'ভাষাসমূহ' },
  supply: { hospital: 'চিকিৎসালয়', stockout: 'ষ্টক শেষ', reserves: 'মজুত', protected: 'সুৰক্ষিত', critical: 'গুৰুত্বপূৰ্ণ', adequate: 'যথেষ্ট', depot: 'ডিপো', medicine: 'দৰব', food: 'খাদ্য', equipment: 'সঁজুলি' },
  admin: { systemHealth: 'চিষ্টেম স্বাস্থ্য', users: 'ব্যৱহাৰকাৰী', audit: 'অডিট', status: 'অৱস্থা', activate: 'সক্ৰিয় কৰক', deactivate: 'নিষ্ক্ৰিয় কৰক', changeRole: 'ভূমিকা সলনি কৰক', integrations: 'সংহতি', online: 'অনলাইন', offline: 'অফলাইন', degraded: 'হ্ৰাসপ্ৰাপ্ত' },
  common: { loading: 'লোড হৈছে…', error: 'ত্ৰুটি', retry: 'পুনৰ চেষ্টা', simulation: 'অনুকৰণ', live: 'লাইভ', demo: 'ডেমো', cancel: 'বাতিল', close: 'বন্ধ', save: 'সংৰক্ষণ', confirm: 'নিশ্চিত', search: 'বিচাৰক', refresh: 'তাজা কৰক', noData: 'কোনো তথ্য নাই', success: 'সফল', failed: 'বিফল', switchRole: 'ভূমিকা সলনি কৰক', currentRole: 'বৰ্তমান ভূমিকা', online: 'অনলাইন', offline: 'অফলাইন', queue: 'শাৰী' },
};

const bn: Translations = {
  nav: {
    commandCenter: 'কমান্ড সেন্টার',
    fleetDeliveries: 'যানবাহন ও ডেলিভারি',
    networkAccessibility: 'নেটওয়ার্ক অ্যাক্সেসযোগ্যতা',
    aiRouting: 'এআই রাউটিং',
    supplyContinuity: 'সরবরাহ ধারাবাহিকতা',
    fieldOperations: 'ফিল্ড অপারেশন',
    alerts: 'সতর্কতা',
    analytics: 'বিশ্লেষণ',
    administration: 'প্রশাসন',
    districtCommand: 'জেলা কমান্ড',
    fleetConvoys: 'বহর কাফেলা',
    driverTelematics: 'চালক টেলিমেটিক্স',
    fieldRecon: 'ফিল্ড পুনরুদ্ধার',
    createReport: 'রিপোর্ট তৈরি',
    offlineQueue: 'অফলাইন সারি',
    supplyInventory: 'সরবরাহ তালিকা',
    hospitalStockouts: 'হাসপাতাল স্টকআউট',
    safeHubs: 'নিরাপদ কেন্দ্র',
    userManagement: 'ব্যবহারকারী ব্যবস্থাপনা',
    auditLogs: 'অডিট লগ',
    systemHealth: 'সিস্টেম স্বাস্থ্য',
  },
  route: {
    from: 'থেকে',
    to: 'পর্যন্ত',
    optimize: 'স্মার্ট রুট অপ্টিমাইজ করুন',
    startNavigation: 'নেভিগেশন শুরু করুন',
    calculating: 'গণনা হচ্ছে…',
    nextTurn: 'পরবর্তী বাঁক',
    turnLeft: 'বামে বাঁক নিন',
    turnRight: 'ডানে বাঁক নিন',
    continueStr: 'সোজা চালিয়ে যান',
    arrive: 'পৌঁছান',
    reroute: 'রুট পরিবর্তন হচ্ছে…',
    eta: 'আনুমানিক সময়',
    distance: 'দূরত্ব',
    risk: 'ঝুঁকি',
    reliability: 'নির্ভরযোগ্যতা',
    aiRecommended: 'এআই প্রস্তাবিত',
    fastest: 'দ্রুততম',
    alternative: 'নিরাপদ বিকল্প',
    onlyFeasible: 'একমাত্র সম্ভাব্য রুট',
    blocked: 'অবরুদ্ধ',
    feasible: 'সম্ভাব্য',
    cargoType: 'পণ্যের ধরন',
    priority: 'অগ্রাধিকার',
    whyThisRoute: 'এই রুট কেন?',
    routeChanged: 'রুট পরিবর্তন শনাক্ত',
    floodRisk: 'বন্যার ঝুঁকি বেড়েছে',
    voiceGuidance: 'ভয়েস গাইডেন্স',
    searchOrigin: 'উৎপত্তি স্থান অনুসন্ধান…',
    searchDest: 'গন্তব্য অনুসন্ধান…',
  },
  field: {
    report: 'রিপোর্ট', submit: 'রিপোর্ট জমা দিন', photo: 'ফটো', attachPhoto: 'ফটো সংযুক্ত করুন',
    offline: 'অফলাইন', sync: 'এখনই সিঙ্ক করুন', syncing: 'সিঙ্ক হচ্ছে…', synced: 'সিঙ্ক হয়েছে',
    gps: 'জিপিএস', captureGps: 'জিপিএস অবস্থান ক্যাপচার করুন',
    severity: 'মাত্রা', critical: 'অতি গুরুতর', high: 'উচ্চ', medium: 'মধ্যম', low: 'নিম্ন',
    verification: 'যাচাইকরণ', verify: 'যাচাই করুন', verified: 'যাচাই হয়েছে', pending: 'অপেক্ষমাণ',
    incidentType: 'ঘটনার ধরন', description: 'বিবরণ', district: 'জেলা', location: 'অবস্থান', officer: 'কর্মকর্তা', department: 'বিভাগ',
  },
  safeHub: { findNearest: 'নিকটতম নিরাপদ কেন্দ্র খুঁজুন', routeToHub: 'কেন্দ্রে রুট', highGround: 'উঁচু ভূমি', risk: 'ঝুঁকি স্কোর', accessibility: 'অ্যাক্সেসযোগ্যতা', capacity: 'ধারণক্ষমতা', distance: 'দূরত্ব', eta: 'আনুমানিক সময়', status: 'অবস্থা', open: 'খোলা', full: 'পূর্ণ', recommended: 'প্রস্তাবিত' },
  alerts: { roadClosed: 'রাস্তা বন্ধ', floodWarning: 'বন্যা সতর্কতা', landslide: 'ভূমিধস সতর্কতা', highRisk: 'উচ্চ ঝুঁকি', criticalDelivery: 'জরুরি ডেলিভারি', active: 'সক্রিয়', resolved: 'সমাধান', broadcast: 'সম্প্রচার', languages: 'ভাষাসমূহ' },
  supply: { hospital: 'হাসপাতাল', stockout: 'স্টক শেষ', reserves: 'মজুত', protected: 'সুরক্ষিত', critical: 'জরুরি', adequate: 'পর্যাপ্ত', depot: 'ডিপো', medicine: 'ওষুধ', food: 'খাদ্য', equipment: 'সরঞ্জাম' },
  admin: { systemHealth: 'সিস্টেম স্বাস্থ্য', users: 'ব্যবহারকারী', audit: 'অডিট', status: 'অবস্থা', activate: 'সক্রিয় করুন', deactivate: 'নিষ্ক্রিয় করুন', changeRole: 'ভূমিকা পরিবর্তন', integrations: 'ইন্টিগ্রেশন', online: 'অনলাইন', offline: 'অফলাইন', degraded: 'নিম্নমানে' },
  common: { loading: 'লোড হচ্ছে…', error: 'ত্রুটি', retry: 'পুনরায় চেষ্টা', simulation: 'অনুকরণ', live: 'লাইভ', demo: 'ডেমো', cancel: 'বাতিল', close: 'বন্ধ', save: 'সংরক্ষণ', confirm: 'নিশ্চিত', search: 'অনুসন্ধান', refresh: 'রিফ্রেশ', noData: 'কোনো ডেটা নেই', success: 'সফল', failed: 'ব্যর্থ', switchRole: 'ভূমিকা বদলান', currentRole: 'বর্তমান ভূমিকা', online: 'অনলাইন', offline: 'অফলাইন', queue: 'সারি' },
};

const kha: Translations = {
  nav: {
    commandCenter: 'Sentар Leit Jingñiuh',
    fleetDeliveries: 'Fleet & Deliveries',
    networkAccessibility: 'Network Accessibility',
    aiRouting: 'AI Routing',
    supplyContinuity: 'Supply Continuity',
    fieldOperations: 'Field Operations',
    alerts: 'Alerts',
    analytics: 'Analytics',
    administration: 'Jingpynbna',
    districtCommand: 'District Command',
    fleetConvoys: 'Fleet Convoys',
    driverTelematics: 'Driver Telematics',
    fieldRecon: 'Field Reconnaissance',
    createReport: 'Create Report',
    offlineQueue: 'Offline Queue',
    supplyInventory: 'Supply Inventory',
    hospitalStockouts: 'Hospital Stockouts',
    safeHubs: 'Safe Hubs',
    userManagement: 'User Management',
    auditLogs: 'Audit Logs',
    systemHealth: 'System Health',
  },
  route: {
    from: 'Ïa',
    to: 'Ha',
    optimize: 'Optimize Smart Route',
    startNavigation: 'Thong Navigation',
    calculating: 'Calculating…',
    nextTurn: 'Next Turn',
    turnLeft: 'Turn Left',
    turnRight: 'Turn Right',
    continueStr: 'Continue Straight',
    arrive: 'Arrive',
    reroute: 'Rerouting…',
    eta: 'ETA',
    distance: 'Lympung',
    risk: 'Risk',
    reliability: 'Reliability',
    aiRecommended: 'AI Recommended',
    fastest: 'Fastest',
    alternative: 'Safer Alternative',
    onlyFeasible: 'Only Feasible Route',
    blocked: 'Blocked',
    feasible: 'Feasible',
    cargoType: 'Cargo Type',
    priority: 'Priority',
    whyThisRoute: 'Why This Route?',
    routeChanged: 'Route Change Detected',
    floodRisk: 'Flood Risk Increased',
    voiceGuidance: 'Voice Guidance',
    searchOrigin: 'Search origin…',
    searchDest: 'Search destination…',
  },
  field: {
    report: 'Report', submit: 'Submit Report', photo: 'Photo', attachPhoto: 'Attach Photo',
    offline: 'Offline', sync: 'Sync Now', syncing: 'Syncing…', synced: 'Synced',
    gps: 'GPS', captureGps: 'Capture GPS Location',
    severity: 'Severity', critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low',
    verification: 'Verification', verify: 'Verify', verified: 'Verified', pending: 'Pending',
    incidentType: 'Incident Type', description: 'Description', district: 'District', location: 'Location', officer: 'Officer', department: 'Department',
  },
  safeHub: { findNearest: 'Find Nearest Safe Hub', routeToHub: 'Route to Hub', highGround: 'High Ground', risk: 'Risk Score', accessibility: 'Accessibility', capacity: 'Capacity', distance: 'Lympung', eta: 'ETA', status: 'Status', open: 'Open', full: 'Full', recommended: 'Recommended' },
  alerts: { roadClosed: 'Road Closed', floodWarning: 'Flood Warning', landslide: 'Landslide Alert', highRisk: 'High Risk', criticalDelivery: 'Critical Delivery', active: 'Active', resolved: 'Resolved', broadcast: 'Broadcast', languages: 'Languages' },
  supply: { hospital: 'Hospital', stockout: 'Stockout', reserves: 'Reserves', protected: 'Protected', critical: 'Critical', adequate: 'Adequate', depot: 'Depot', medicine: 'Medicine', food: 'Food', equipment: 'Equipment' },
  admin: { systemHealth: 'System Health', users: 'Users', audit: 'Audit', status: 'Status', activate: 'Activate', deactivate: 'Deactivate', changeRole: 'Change Role', integrations: 'Integrations', online: 'Online', offline: 'Offline', degraded: 'Degraded' },
  common: { loading: 'Loading…', error: 'Error', retry: 'Retry', simulation: 'Simulation', live: 'Live', demo: 'Demo', cancel: 'Cancel', close: 'Close', save: 'Save', confirm: 'Confirm', search: 'Search', refresh: 'Refresh', noData: 'No data', success: 'Success', failed: 'Failed', switchRole: 'Switch Role', currentRole: 'Current Role', online: 'Online', offline: 'Offline', queue: 'Queue' },
};

const brx: Translations = {
  nav: {
    commandCenter: 'कमान्ड सेन्टार',
    fleetDeliveries: 'फ्लिट आरो डेलिभारि',
    networkAccessibility: 'नेटवर्क आक्सेसिबिलिटि',
    aiRouting: 'एआइ राउटिं',
    supplyContinuity: 'सायखालायनाय',
    fieldOperations: 'फिल्ड अपारेसन',
    alerts: 'अलार्ट',
    analytics: 'एनालिटिक्स',
    administration: 'प्रसासन',
    districtCommand: 'जिला कमान्ड',
    fleetConvoys: 'फ्लिट काफिला',
    driverTelematics: 'ड्राइभार टेलिमेटिक्स',
    fieldRecon: 'फिल्ड रेकोनेसन्स',
    createReport: 'रिपोर्ट हाबहायनाय',
    offlineQueue: 'अफलाइन कियु',
    supplyInventory: 'सायखालायनाय इन्भेन्टारि',
    hospitalStockouts: 'अस्पताल स्टकआउट',
    safeHubs: 'सुरक्षित हाब',
    userManagement: 'यूजार मेनेजमेन्ट',
    auditLogs: 'अडिट लग',
    systemHealth: 'सिस्टेम हेल्थ',
  },
  route: {
    from: 'सिनां',
    to: 'फारसे',
    optimize: 'स्मार्ट राउट अप्टिमाइज',
    startNavigation: 'नेभिगेसन थाखाय',
    calculating: 'हिसाब लायनाय…',
    nextTurn: 'पाछे घुमाय',
    turnLeft: 'दावगिया घुमाय',
    turnRight: 'नागिरगिया घुमाय',
    continueStr: 'थांखिनि नोंथाम',
    arrive: 'फैनाय',
    reroute: 'राउट सलायनाय…',
    eta: 'ETA',
    distance: 'फारसे',
    risk: 'रिस्क',
    reliability: 'भरसा',
    aiRecommended: 'एआइ सुपारिस',
    fastest: 'गुबुन जानगाव',
    alternative: 'सुरक्षित बिगोन',
    onlyFeasible: 'केवल सम्भव राउट',
    blocked: 'थांखि थाखो',
    feasible: 'सम्भव',
    cargoType: 'मालनि थाखनाय',
    priority: 'प्रायरिटि',
    whyThisRoute: 'बे राउट बायदि?',
    routeChanged: 'राउट सालायनाय',
    floodRisk: 'उदां रिस्क बाड़ाय',
    voiceGuidance: 'भोइस गाइडेन्स',
    searchOrigin: 'उत्पत्ति बिन्दु जोनोमाय…',
    searchDest: 'गन्तव्य जोनोमाय…',
  },
  field: {
    report: 'रिपोर्ट', submit: 'रिपोर्ट खामानाय', photo: 'फटो', attachPhoto: 'फटो लगायनाय',
    offline: 'अफलाइन', sync: 'अबहरनांगौ सिंक', syncing: 'सिंक लायनाय…', synced: 'सिंक जानाय',
    gps: 'जिपिएस', captureGps: 'जिपिएस थान कैप्चार',
    severity: 'गंभीरतानि', critical: 'जोंखारि', high: 'हाग्रा', medium: 'मद्ध', low: 'बोसोर',
    verification: 'सत्यापन', verify: 'सत्यापन लायनाय', verified: 'सत्यापन जानाय', pending: 'गोबां',
    incidentType: 'घटना थाखनाय', description: 'बिबरण', district: 'जिला', location: 'थान', officer: 'अफिसार', department: 'बिभाग',
  },
  safeHub: { findNearest: 'नाजासे सुरक्षित हाब जोनोमाय', routeToHub: 'हाबफारसे राउट', highGround: 'हाग्रा थान', risk: 'रिस्क स्कोर', accessibility: 'आक्सेसिबिलिटि', capacity: 'क्षमता', distance: 'फारसे', eta: 'ETA', status: 'स्तिति', open: 'खुलाय', full: 'पुरा', recommended: 'सुपारिस' },
  alerts: { roadClosed: 'रोड बन्द', floodWarning: 'उदांनि अलार्ट', landslide: 'माटि जोबोरनि अलार्ट', highRisk: 'हाग्रा रिस्क', criticalDelivery: 'जोंखारि डेलिभारि', active: 'सक्रिय', resolved: 'समाधान', broadcast: 'ब्रडकास्ट', languages: 'भाषा' },
  supply: { hospital: 'अस्पताल', stockout: 'स्टक शेस', reserves: 'रिजार्भ', protected: 'सुरक्षित', critical: 'जोंखारि', adequate: 'पुरायाव', depot: 'डिपो', medicine: 'दावदाय', food: 'जाखाम', equipment: 'औजार' },
  admin: { systemHealth: 'सिस्टेम हेल्थ', users: 'यूजार', audit: 'अडिट', status: 'स्तिति', activate: 'सक्रिय लायनाय', deactivate: 'सक्रिय थाखो', changeRole: 'रोल सलायनाय', integrations: 'इन्टिग्रेसन', online: 'अनलाइन', offline: 'अफलाइन', degraded: 'खाल थाखो' },
  common: { loading: 'लोड लायनाय…', error: 'गलती', retry: 'आव फोर्थायनाय', simulation: 'सिमुलेसन', live: 'लाइभ', demo: 'डेमो', cancel: 'रद्द', close: 'बन्द', save: 'सरिथाय', confirm: 'नियोरनाय', search: 'जोनोमाय', refresh: 'रिफ्रेस', noData: 'थानज दाथा नाय', success: 'सफल', failed: 'बिफल', switchRole: 'रोल सलायनाय', currentRole: 'अबहरनां रोल', online: 'अनलाइन', offline: 'अफलाइन', queue: 'कियु' },
};

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = { en, hi, as: as, bn, kha, brx };

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English (EN)',
  hi: 'हिंदी (Hindi)',
  as: 'অসমীয়া (Assamese)',
  bn: 'বাংলা (Bengali)',
  kha: 'Khasi',
  brx: 'Bodo',
};
