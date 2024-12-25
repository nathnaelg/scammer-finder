declare const firebase: {
    initializeApp: (config: object) => void;
    messaging: () => {
      onBackgroundMessage: (callback: (payload: any) => void) => void;
    };
  };
  