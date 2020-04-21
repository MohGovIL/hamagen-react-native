const echoTest = jest.fn().mockResolvedValue();
const openDatabase = jest.fn();

const sqlite = {
  enablePromise: jest.fn(),
  echoTest,
  openDatabase
};

export default sqlite;
