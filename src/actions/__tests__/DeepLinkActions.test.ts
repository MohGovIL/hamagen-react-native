import {post} from 'axios'
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {shareUserLocations} from '../DeepLinkActions'
import { onError } from '../../services/ErrorService';

const mockStore = configureMockStore([thunk]);

jest.mock('../../services/DeepLinkService', () => ({
    getUserLocationsReadyForServer: jest.fn().mockResolvedValue()
}))

beforeAll(() => {
    onError.mockClear()
})

afterAll(() => {
    onError.mockClear()
})

describe('Deep link Actions', () => {
    describe('shareUserLocations', () => {
        const token = 'tokenTest'
        

        test('resolves data', async () => {
            const res = {data: {token}}    
            post.mockResolvedValueOnce(res)

            const store = mockStore({});

            await expect(store.dispatch(shareUserLocations(token))).resolves.toBe(res.data)
            expect(onError).toBeCalledTimes(0)
        })

        test('handles reject', async () => {
            post.mockRejectedValueOnce()
            const store = mockStore({});
            return expect(store.dispatch(shareUserLocations(token))).rejects.toBe(undefined)
            expect(onError).toBeCalledTimes(1)
        })
    })
});
