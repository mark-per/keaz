import { formatFon } from '../../src/common/utils/formatPhonenumber';
import parsePhoneNumberFromString from 'libphonenumber-js';

jest.mock('libphonenumber-js');

describe('formatFon', () => {
    // Reset mocks before each test
    beforeEach(() => {
        jest.clearAllMocks(); // Clear any previous mock states
    });

    it('should correctly format a valid phone number without "+"', () => {
        const phoneNumber = '491234567890';
        const formattedNumber = '+49 123 4567890';

        // Mock the parsePhoneNumberFromString function
        (parsePhoneNumberFromString as jest.Mock).mockReturnValue({
            formatInternational: jest.fn().mockReturnValue(formattedNumber),
        });

        const result = formatFon(phoneNumber);
        expect(result).toBe(formattedNumber);
        expect(parsePhoneNumberFromString).toHaveBeenCalledWith('+491234567890');
    });

    it('should correctly format a valid phone number with "+"', () => {
        const phoneNumber = '+491234567890';
        const formattedNumber = '+49 123 4567890';

        // Mock the parsePhoneNumberFromString function
        (parsePhoneNumberFromString as jest.Mock).mockReturnValue({
            formatInternational: jest.fn().mockReturnValue(formattedNumber),
        });

        const result = formatFon(phoneNumber);
        expect(result).toBe(formattedNumber);
        expect(parsePhoneNumberFromString).toHaveBeenCalledWith(phoneNumber);
    });

    it('should return null for an invalid phone number', () => {
        const phoneNumber = 'invalid-phone';

        // Mock the parsePhoneNumberFromString function to return null for invalid input
        (parsePhoneNumberFromString as jest.Mock).mockReturnValue(null);

        const result = formatFon(phoneNumber);
        expect(result).toBeUndefined();
        expect(parsePhoneNumberFromString).toHaveBeenCalledWith('+invalid-phone');
    });

    it('should add "+" to a phone number without it and format correctly', () => {
        const phoneNumber = '491234567890';
        const formattedNumber = '+49 123 4567890';

        // Mock the parsePhoneNumberFromString function
        (parsePhoneNumberFromString as jest.Mock).mockReturnValue({
            formatInternational: jest.fn().mockReturnValue(formattedNumber),
        });

        const result = formatFon(phoneNumber);
        expect(result).toBe(formattedNumber);
        expect(parsePhoneNumberFromString).toHaveBeenCalledWith('+491234567890');
    });

    it('should handle an empty string input gracefully', () => {
        const phoneNumber = '';

        // Mock the parsePhoneNumberFromString function to return null for empty input
        (parsePhoneNumberFromString as jest.Mock).mockReturnValue(null);

        const result = formatFon(phoneNumber);

        expect(result).toBeUndefined(); // Expect undefined for empty input
        expect(parsePhoneNumberFromString).not.toHaveBeenCalled(); // It should not be called for empty string
    });

    it('should handle null input gracefully', () => {
        const phoneNumber = null;

        // Mock the parsePhoneNumberFromString function
        (parsePhoneNumberFromString as jest.Mock).mockReturnValue(null);

        const result = formatFon(phoneNumber);
        expect(result).toBeUndefined();
    });

    it('should handle undefined input gracefully', () => {
        const phoneNumber = undefined;

        // Mock the parsePhoneNumberFromString function
        (parsePhoneNumberFromString as jest.Mock).mockReturnValue(null);

        const result = formatFon(phoneNumber);
        expect(result).toBeUndefined();
    });
});
