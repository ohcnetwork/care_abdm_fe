# CARE ABDM FE

CARE ABDM FE is a frontend plugin for CARE based on micro frontend architecture for ABDM Integration. This plugin adds UI components for:
- Creating and linking ABHA numbers to patients
- Raising data fetch requests over ABDM
- Viewing health information data

## Overview

The plugin integrates with the main CARE frontend application to provide ABDM (Ayushman Bharat Digital Mission) related functionality through various pluggable components, custom pages, and encounter tabs.

## Getting Started

### Prerequisites

- Node.js and npm _(refer care_fe repo for exact version required.)_

### Setup Instructions

1. Clone both repositories:
```bash
git clone git@github.com:ohcnetwork/care_fe.git
git clone git@github.com:ohcnetwork/care_abdm_fe.git
```

2. Install dependencies for CARE ABDM FE:
```bash
cd care_abdm_fe
npm install
```

3. Start the development server:
```bash
npm run start
```

4. Configure CARE FE:
```bash
cd ../care_fe
```
Update the `REACT_ENABLED_APPS` environment variable:
```
REACT_ENABLED_APPS="ohcnetwork/care_abdm_fe@localhost:5173"
```
Note: `localhost:5173` should point to where care_abdm_fe is being served

5. Setup and run CARE FE:
```bash
npm run setup
npm install
npm run dev
```

## Components

### Pluggable Components

1. **FacilityHomeActions**
   - Location: Facility Settings page dropdown menu
   - Function: Provides a dialog for editing Health Facility ID
   
2. **PatientDetailsTabDemographyGeneralInfo**
   - Location: Patient details demography tab
   - Function: Displays ABHA details card
   - Note: Returns null if no ABHA number is linked

3. **PatientHomeActions**
   - Location: Patient details page
   - Function: Provides ABHA linking functionality
   - Note: Returns null if ABHA number already linked

4. **PatientInfoCardActions**
   - Location: Encounter page dropdown menu
   - Function: Dialog for creating consent requests for data from 3rd party hospitals

5. **PatientRegistrationForm**
   - Location: Patient registration page
   - Function: ABHA linking with auto-fill capabilities
   - Features:
     - Auto-fills patient registration form with ABDM data upon successful linking
     - Shows disabled form with ABHA details if already linked

### Encounter Tab

**ABDM Records**
- Displays consent requests and artifacts
- Links to HealthInformation page when consent artifact is clicked

### Custom Pages

**HealthInformation Page**
- Purpose: Displays health information received from 3rd party hospitals via ABDM
- Rendering: Uses custom `hi-profiles` package ([GitHub Repository](https://github.com/ohcnetwork/hi-profiles))
