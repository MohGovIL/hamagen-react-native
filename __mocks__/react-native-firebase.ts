export const logEvent = jest.fn();

const firebase = {
  messaging: jest.fn(() => {
    return {
      hasPermission: jest.fn(() => Promise.resolve(true)),
      subscribeToTopic: jest.fn(),
      unsubscribeFromTopic: jest.fn(),
      requestPermission: jest.fn(() => Promise.resolve(true)),
      getToken: jest.fn(() => Promise.resolve('myMockToken'))
    };
  }),
  notifications: jest.fn(() => {
    return {
      onNotification: jest.fn(),
      onNotificationDisplayed: jest.fn()
    };
  })
};

firebase.notifications.Android = {
  Channel: jest.fn(() => ({
    setDescription: jest.fn(),
    setSound: jest.fn(),
    enableVibration: jest.fn(),
    setVibrationPattern: jest.fn()
  })),
  Importance: {
    Max: {}
  }
};


export default firebase;
