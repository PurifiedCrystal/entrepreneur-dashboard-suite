flowchart TD
    A[App] --> B[Authenticate]
    B -->|Yes| C[Dashboard]
    B -->|No| D[SignInUp]
    D --> B
    C --> E[Tasks\nModule]
    C --> F[Contacts\nModule]
    C --> G[Projects\nModule]
    E --> H[View\nTasks]
    E --> I[New\nTaskDialog]
    I --> J[POST\napi tasks]
    J --> K[DB\nTasks]
    K --> H
    F --> O[View\nContacts]
    F --> P[New\nContactDialog]
    P --> Q[POST\napi contacts]
    Q --> R[DB\nContacts]
    R --> O
    G --> S[View\nProjects]
    G --> T[New\nProjectDialog]
    T --> U[POST\napi projects]
    U --> V[DB\nProjects]
    V --> S
    C --> L[Global\nSearch]
    L --> M[GET\napi search]
    M --> N[Search\nResults]