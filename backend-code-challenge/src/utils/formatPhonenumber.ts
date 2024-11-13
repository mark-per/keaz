import parsePhoneNumberFromString from "libphonenumber-js"

export const formatFon = (fon: string) => {
	const parsed = parsePhoneNumberFromString(fon.includes("+") ? fon : `+${fon}`)
	return parsed?.formatInternational()
}
