export const subtract = jest.fn();
export const date = jest.fn();
export const month = jest.fn();
export const year = jest.fn();
export const valueOf = jest.fn();

const moment = jest.fn().mockImplementation(() => ({
  subtract,
  date,
  month,
  year,
  valueOf,
}));

moment.mockClear = function () {
  for (const element in moment) {
        moment[element]?.mockClear?.();
  }
};

export default moment;
