import fr from "./fr";
import en from "./en";

export const useTexts = (locale: "fr" | "en"): typeof fr => {
	if (locale === "fr") {
		return fr;
	}
	return en;
};
