import parsePhoneNumberFromString from "libphonenumber-js"

export const formatFon = (fon: string) => {
	if (!fon) return undefined;

	const parsed = parsePhoneNumberFromString(fon.includes("+") ? fon : `+${fon}`)
	return parsed?.formatInternational()
}


