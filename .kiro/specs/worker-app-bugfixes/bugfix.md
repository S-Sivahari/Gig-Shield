# Bugfix Requirements Document

## Introduction

This document addresses multiple critical bugs in the worker app (frontend/worker-app/) that prevent proper authentication, data persistence, UI visibility, and document upload functionality. These issues impact the core user registration and login flows, making the application difficult to use and test.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user enters any username and password on the login page THEN the system validates credentials and may reject login

1.2 WHEN a user completes registration steps and enters data (name, gender, email, income, etc.) THEN the data is not persisted to localStorage

1.3 WHEN a user enters an amount value in the income step THEN the value is not stored in localStorage

1.4 WHEN a user views input fields on login and registration pages THEN some fields are cut off or only partially visible

1.5 WHEN a user attempts to upload documents (Aadhaar, Driving License) THEN the upload logic may not work properly

### Expected Behavior (Correct)

2.1 WHEN a user enters any username and password on the login page THEN the system SHALL allow login without validation

2.2 WHEN a user completes registration steps and enters data (name, gender, email, income, etc.) THEN the system SHALL persist all user details to localStorage and the data SHALL survive page reloads

2.3 WHEN a user enters an amount value in the income step THEN the system SHALL store the value in localStorage and maintain proper GigScore calculation display

2.4 WHEN a user views input fields on login and registration pages THEN the system SHALL ensure all fields are fully visible with no content cutoff

2.5 WHEN a user attempts to upload documents (Aadhaar, Driving License) THEN the system SHALL properly handle file selection and store the filename (without storing the actual document file)

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user navigates through the registration flow THEN the system SHALL CONTINUE TO display the correct step progression and UI animations

3.2 WHEN a user views the GigScore page THEN the system SHALL CONTINUE TO display the hardcoded score of 78 correctly

3.3 WHEN a user completes registration THEN the system SHALL CONTINUE TO navigate to the dashboard

3.4 WHEN localStorage contains user data THEN the system SHALL CONTINUE TO use that data to populate forms and determine navigation flow

3.5 WHEN a user interacts with other app features (dashboard, policy, payouts, profile) THEN the system SHALL CONTINUE TO function as designed


## Bug Condition Analysis

### Bug 1: Login Authentication Bypass

**Bug Condition Function:**
```pascal
FUNCTION isBugCondition_Login(X)
  INPUT: X of type LoginCredentials { username: string, password: string }
  OUTPUT: boolean
  
  // Returns true when any credentials are entered
  RETURN X.username.length > 0 OR X.password.length > 0
END FUNCTION
```

**Property Specification:**
```pascal
// Property: Fix Checking - Allow All Logins
FOR ALL X WHERE isBugCondition_Login(X) DO
  result ← handleLogin'(X)
  ASSERT result.success = true AND result.navigateTo = '/dashboard'
END FOR
```

### Bug 2: LocalStorage Persistence

**Bug Condition Function:**
```pascal
FUNCTION isBugCondition_Storage(X)
  INPUT: X of type UserFormData { fullName, gender, email, weeklyIncome, ... }
  OUTPUT: boolean
  
  // Returns true when user data is entered during registration
  RETURN X has any non-empty field
END FUNCTION
```

**Property Specification:**
```pascal
// Property: Fix Checking - Data Persists Across Reloads
FOR ALL X WHERE isBugCondition_Storage(X) DO
  saveToLocalStorage(X)
  simulatePageReload()
  result ← loadFromLocalStorage()
  ASSERT result = X AND all_fields_preserved(result)
END FOR
```

### Bug 3: Field Visibility

**Bug Condition Function:**
```pascal
FUNCTION isBugCondition_Visibility(X)
  INPUT: X of type InputField { element, value, container }
  OUTPUT: boolean
  
  // Returns true when field content may overflow or be cut off
  RETURN X.value.length > 0 AND (X.element.scrollWidth > X.container.clientWidth)
END FUNCTION
```

**Property Specification:**
```pascal
// Property: Fix Checking - All Content Visible
FOR ALL X WHERE isBugCondition_Visibility(X) DO
  result ← renderField'(X)
  ASSERT result.isFullyVisible = true AND no_overflow(result)
END FOR
```

### Bug 4: Document Upload

**Bug Condition Function:**
```pascal
FUNCTION isBugCondition_Upload(X)
  INPUT: X of type FileUpload { file: File, fileType: string }
  OUTPUT: boolean
  
  // Returns true when user selects a document file
  RETURN X.file != null AND X.fileType IN ['aadhaar', 'drivingLicense']
END FUNCTION
```

**Property Specification:**
```pascal
// Property: Fix Checking - Upload Logic Works
FOR ALL X WHERE isBugCondition_Upload(X) DO
  result ← handleFileUpload'(X)
  ASSERT result.fileName = X.file.name AND 
         result.storedInLocalStorage = true AND
         result.fileNotStored = true
END FOR
```

### Preservation Goal

```pascal
// Property: Preservation Checking
FOR ALL X WHERE NOT (isBugCondition_Login(X) OR 
                     isBugCondition_Storage(X) OR 
                     isBugCondition_Visibility(X) OR 
                     isBugCondition_Upload(X)) DO
  ASSERT F(X) = F'(X)
END FOR
```

This ensures that for all non-buggy scenarios (e.g., navigation, UI animations, other features), the fixed code behaves identically to the original.
