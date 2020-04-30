import * as constants from './Constants'

describe('Constants', () => {
    test('PADDING_TOP', () => {
        const {PADDING_TOP} = constants
        expect(PADDING_TOP()).toBe(20)
        expect(PADDING_TOP(20)).toBe(40)
    })
    
    test('PADDING_BOTTOM', () => {
        const {PADDING_BOTTOM} = constants
        expect(PADDING_BOTTOM()).toBe(0)
        expect(PADDING_BOTTOM(20)).toBe(20)
    })
})