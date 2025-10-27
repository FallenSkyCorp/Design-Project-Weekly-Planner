export interface KleinPluginSettings {
	primaryBackground: string;
	secondaryBackground: string;


	tabBackgroundActive: string;
	selectedDayBorderColor: string;

	otherMonthBackground: string;
	currDayBackground: string;


	textColor: string;
	descriptionTextColor: string;
	caretColor: string;
	iconColor: string;
	checkboxColor: string;
	scrollbarColor: string;
	
	headerTextSize: number;
	taskTextSize: number;
}

export const DEFAULT_SETTINGS: KleinPluginSettings = {
    primaryBackground: "#BEBBBB",
	secondaryBackground: "#D9D9D9",

	tabBackgroundActive: "#E14343",
	selectedDayBorderColor: "#000000",

	otherMonthBackground: "#E5B9B9",
	currDayBackground: "#E14343",


	textColor: "#000000",
	descriptionTextColor: "#6F6F6F",
	caretColor: "#000000",
	iconColor: "#000000",
	checkboxColor: "#E14343",
	scrollbarColor: "#D9D9D9",
	
	headerTextSize: 24,
	taskTextSize: 18,
} 