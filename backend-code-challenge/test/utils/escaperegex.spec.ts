import { escapeRegExp } from '../../src/common/utils/escapeRegex';

describe('escapeRegExp', () => {
    it('should escape special characters in the string', () => {
        const input = 'Hello. How are you?';
        const expected = 'Hello\\. How are you\\?';
        expect(escapeRegExp(input)).toBe(expected);
    });

    it('should return the same string if there are no special characters', () => {
        const input = 'Hello World';
        const expected = 'Hello World';
        expect(escapeRegExp(input)).toBe(expected);
    });

    it('should return an empty string when input is empty', () => {
        const input = '';
        const expected = '';
        expect(escapeRegExp(input)).toBe(expected);
    });

    it('should escape a single special character', () => {
        const input = '*';
        const expected = '\\*';
        expect(escapeRegExp(input)).toBe(expected);
    });

    it('should escape multiple special characters', () => {
        const input = 'Hello. *How? [are] you$';
        const expected = 'Hello\\. \\*How\\? \\[are\\] you\\$';
        expect(escapeRegExp(input)).toBe(expected);
    });

    it('should handle backslashes correctly', () => {
        const input = '\\';
        const expected = '\\\\';
        expect(escapeRegExp(input)).toBe(expected);
    });

    it('should escape all regex special characters', () => {
        const input = '.^$*+?{}[]|\\()';
        const expected = '\\.\\^\\$\\*\\+\\?\\{\\}\\[\\]\\|\\\\\\(\\)';
        expect(escapeRegExp(input)).toBe(expected);
    });
});
