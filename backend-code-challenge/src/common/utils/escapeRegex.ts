export const escapeRegExp = (string: string): string => {
	if (string == null) return '';
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // $& means the whole matched string
}
