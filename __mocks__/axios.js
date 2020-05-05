
export const get = jest.fn();
export const post = jest.fn();

const axios = {
  get,
  post
};

axios.mockClear = function () {
  for (const key in axios) {
        axios[key]?.mockClear?.();
  }
};
export default axios;
