// import mockAxios from 'jest-mock-axios';
const axios = {
    get: jest.fn(),
    post: jest.fn()
}

axios.mockClear = function() {
    for(const key in axios) {
        axios[key]?.mockClear?.()
    }
}
export default axios;