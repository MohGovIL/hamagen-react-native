const onLocation = jest.fn().mockImplementation(() => ({}));

const ready = jest.fn().mockImplementation(() => {
  return jest.fn().mockResolvedValue(true);
});

export default {
  onLocation,
  ready
};
