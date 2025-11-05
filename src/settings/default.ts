export interface KleinPluginSettings {
	backgroundPrimary: { description: string, value: string};
	backgroundPrimaryAlt: { description: string, value: string};
	backgroundSecondary: { description: string, value: string};
	backgroundSecondaryAlt: { description: string, value: string};
	backgroundModifierHover: { description: string, value: string};
	backgroundModifierActiveHover: { description: string, value: string};
	backgroundModifierBorder: { description: string, value: string};
	backgroundModifierBorderHover: { description: string, value: string};
	backgroundModifierBorderFocus: { description: string, value: string};

	checkboxRadius: { description: string, value: string};
    checkboxSize: { description: string, value: string};
	checkboxMarkerColor: { description: string, value: string};
	checkboxColor: { description: string, value: string};
	checkboxColorHover: { description: string, value: string};
	checkboxBorderColor: { description: string, value: string};
	checkboxBorderColorHover: { description: string, value: string};
	checklistDoneDecoration: { description: string, value: string};
	checklistDoneColor: { description: string, value: string};
	checkboxMarginInlineStart: { description: string, value: string};

	dropdownBackground: { description: string, value: string};
    dropdownBackgroundBlendMode: { description: string, value: string};
	dropdownBackgroundHover: { description: string, value: string};

	textNormal: { description: string, value: string};
	textMuted: { description: string, value: string};
	textFaint: { description: string, value: string};
	textOnAccent: { description: string, value: string};
	textOnAccentInverted: { description: string, value: string};
	textSuccess: { description: string, value: string};
	textWarning: { description: string, value: string};
	textError: { description: string, value: string};
	textAccent: { description: string, value: string};
	textAccentHover: { description: string, value: string};

	textSelection: { description: string, value: string};
	textHighlightBg: { description: string, value: string};

	caretColor: { description: string, value: string};

	iconColor: { description: string, value: string};
	iconColorHover: { description: string, value: string};
	iconColorActive: { description: string, value: string};
	iconColorFocused: { description: string, value: string};
	iconOpacity: { description: string, value: string};
	iconOpacityHover: { description: string, value: string};
	iconOpacityActive: { description: string, value: string};

	fontTextSize: { description: string, value: string};
	fontSmallest: { description: string, value: string};
	fontSmaller: { description: string, value: string};
	fontSmall: { description: string, value: string};
	fontUiSmaller: { description: string, value: string};
	fontUiSmall: { description: string, value: string};
	fontUiMedium: { description: string, value: string};
	fontUiLarge: { description: string, value: string};

	ribbonBackground: { description: string, value: string};
	ribbonBackgroundCollapsed: { description: string, value: string};

	scrollbarBg: { description: string, value: string};
	scrollbarThumbBg: { description: string, value: string};
	scrollbarActiveThumbBg: { description: string, value: string};

	statusBarBackground: { description: string, value: string};
	statusBarBorderColor: { description: string, value: string};
	statusBarBorderWidth: { description: string, value: string};
	statusBarFontSize: { description: string, value: string};
	statusBarTextColor: { description: string, value: string};

	vaultProfileFontSize: { description: string, value: string};
	vaultProfileFontWeight: { description: string, value: string};
	vaultProfileColor: { description: string, value: string};
	vaultProfileColorHover: { description: string, value: string};

	titlebarBackground: { description: string, value: string};
	titlebarBackgroundFocused: { description: string, value: string};
	titlebarBorderWidth: { description: string, value: string};
	titlebarBorderColor	: { description: string, value: string};
	titlebarTextColor: { description: string, value: string};
	titlebarTextColorFocused: { description: string, value: string};

	tabBackgroundActive: { description: string, value: string};
	tabTextColor: { description: string, value: string};
	tabTextColorActive: { description: string, value: string};
	tabTextColorFocused: { description: string, value: string};
	tabTextColorFocusedActive: { description: string, value: string};
	tabTextColorFocusedHighlighted: { description: string, value: string};
	tabTextColorFocusedActiveCurrent: { description: string, value: string};
	tabFontSize: { description: string, value: string};
	tabFontWeight: { description: string, value: string};
	tabContainerBackground: { description: string, value: string};
	tabDividerColor: { description: string, value: string};
	tabOutlineColor: { description: string, value: string};
	tabOutlineWidth: { description: string, value: string};
	tabCurve: { description: string, value: string};
	tabRadius: { description: string, value: string};
	tabRadiusActive: { description: string, value: string};
	tabWidth: { description: string, value: string};
	tabMaxWidth: { description: string, value: string};

	otherMonthBackground: { description: string, value: string};
	currentDayBackground: { description: string, value: string};
}

export const DEFAULT_SETTINGS: KleinPluginSettings = {

	backgroundPrimary: { description: "Primary background", value: "#BEBBBB" },
	backgroundPrimaryAlt: { description: "Background for surfaces on top of primary background", value: "#D9D9D9" },
	backgroundSecondary: { description: "Secondary background", value: "#D9D9D9" },
	backgroundSecondaryAlt: { description: "Background for surfaces on top of secondary background", value: "#D9D9D9" },
	backgroundModifierHover: { description: "Hovered elements", value: "#D9D9D9" },
	backgroundModifierActiveHover: { description: "Active hovered elements", value: "#D9D9D9" },
	backgroundModifierBorder: { description: "Border color", value: "#000000" },
	backgroundModifierBorderHover: { description: "Border color (hover)", value: "#000000" },
	backgroundModifierBorderFocus: { description: "Border color (focus)", value: "#000000" },

	checkboxRadius: { description: "Checkbox radius", value: "0px" },
    checkboxSize: { description: "Checkbox height and width", value: "20px" },
	checkboxMarkerColor: { description: "Checkbox marker color for the check itself", value: "#E14343" },
	checkboxColor: { description: "Checkbox background color", value: "#E14343" },
	checkboxColorHover: { description: "Checkbox background color (hover)", value: "#E14343" },
	checkboxBorderColor: { description: "Checkbox unchecked border color", value: "#E14343" },
	checkboxBorderColorHover: { description: "Checkbox unchecked border color (hover)", value: "#E14343" },
	checklistDoneDecoration: { description: "Checkbox checked text decoration", value: "none" },
	checklistDoneColor: { description: "Checkbox checked text color", value: "#E14343" },
	checkboxMarginInlineStart: { description: "Checkbox start margin", value: "0px" }, 

	dropdownBackground: { description: "Background color", value: "#BEBBBB" },
    dropdownBackgroundBlendMode: { description: "Background blend mode", value: "#BEBBBB" },
	dropdownBackgroundHover: { description: "Background color (hover)", value: "#BEBBBB" },

	textNormal: { description: "Normal text", value: "#000000" },
	textMuted: { description: "Muted text", value: "#6F6F6F" },
	textFaint: { description: "Faint text", value: "#6F6F6F" },
	textOnAccent: { description: "Text on accent background when accent is dark", value: "#000000" },
	textOnAccentInverted: { description: "Text on accent background when accent is light", value: "#ffffff" },
	textSuccess: { description: "Success text", value: "#000000" },
	textWarning: { description: "Warning text", value: "#000000" },
	textError: { description: "Error text", value: "#ff0000" },
	textAccent: { description: "Accent text", value: "#000000" },
	textAccentHover: { description: "Accent text (hover)", value: "#000000" },

	textSelection: { description: "Selected text background color", value: "#000000" },
	textHighlightBg: { description: "Highlighted text background color", value: "#D9D9D9" },

	caretColor: { description: "Caret color", value: "#000000" },

	iconColor: { description: "Icon color", value: "#000000" },
	iconColorHover: { description: "Icon color (hovered)", value: "#000000" },
	iconColorActive: { description: "Icon color (active)", value: "#000000" },
	iconColorFocused: { description: "Icon color (focused)", value: "#000000" },
	iconOpacity: { description: "Icon opacity", value: "1" },
	iconOpacityHover: { description: "Icon opacity (hovered)", value: "1" },
	iconOpacityActive: { description: "Icon opacity (active)", value: "1" },

	fontTextSize: { description: "Editor font size. Defined by the user under Appearance settings.", value: "16px" },
	fontSmallest: { description: "Smallest editor font size.", value: "0.8em" },
	fontSmaller: { description: "Smaller editor font size.", value: "0.875em" },
	fontSmall: { description: "Small editor font size.", value: "0.933em" },
	fontUiSmaller: { description: "Smallest UI font size.", value: "12px" },
	fontUiSmall: { description: "Smaller UI font size.", value: "13px" },
	fontUiMedium: { description: "Medium UI font size.", value: "15px" },
	fontUiLarge: { description: "Large UI font size.", value: "20px" },

	ribbonBackground: { description: "Ribbon background color", value: "#D9D9D9" },
	ribbonBackgroundCollapsed: { description: "Ribbon background color (collapsed sidebar)", value: "#D9D9D9" },

	scrollbarBg: { description: "Scrollbar background color", value: "#BEBBBB" },
	scrollbarThumbBg: { description: "Scrollbar thumb background color", value: "#D9D9D9" },
	scrollbarActiveThumbBg: { description: "Scrollbar thumb background color (active)", value: "#D9D9D9" },

	statusBarBackground: { description: "Status bar background color", value: "#D9D9D9" },
	statusBarBorderColor: { description: "Status bar border color", value: "#000000" },
	statusBarBorderWidth: { description: "Status bar border width", value: "1px" },
	statusBarFontSize: { description: "Status bar font size", value: "16px" },
	statusBarTextColor: { description: "Status bar text color", value: "#000000" },

	vaultProfileFontSize: { description: "Vault profile font size", value: "16px" },
	vaultProfileFontWeight: { description: "Vault profile font weight", value: "500" },
	vaultProfileColor: { description: "Vault profile text color", value: "#000000" },
	vaultProfileColorHover: { description: "Vault profile text color(hover)", value: "#000000" },

	tabBackgroundActive: { description: "Tab background color (active tab)", value: "#E14343"},				
	tabTextColor: { description: "Tab text color", value: "#000000"},				
	tabTextColorActive: { description: "Tab text color (non-focused window, active)", value: "#000000"},				
	tabTextColorFocused: { description: "Tab text color (focused window)", value: "#000000"},				
	tabTextColorFocusedActive: { description: "Tab text color (focused window, active)", value: "#000000"},		
	tabTextColorFocusedHighlighted: { description: "Tab text color (focused window, highlighted)", value: "#000000"},	
	tabTextColorFocusedActiveCurrent: { description: "Tab text color (focused window, current tab)", value: "#000000"},
	tabFontSize: { description: "Tab font size", value: "15px"},						
	tabFontWeight: { description: "Tab font weight", value: "500"},					
	tabContainerBackground: { description: "Tab container background color", value: "#BEBBBB"},			
	tabDividerColor: { description: "Tab divider color", value: "#BEBBBB"},					
	tabOutlineColor: { description: "Tab outline color", value: "#BEBBBB"},					
	tabOutlineWidth: { description: "Tab outline width", value: "0px"},					
	tabCurve: { description: "Tab curve radius", value: "6px"},						
	tabRadius: { description: "Tab outer radius", value: "4px"},						
	tabRadiusActive: { description: "Tab outer radius (active tab)", value: "6px 6px 0 0"},					
	tabWidth: { description: "Tab default width", value: "200px"},						
	tabMaxWidth: { description: "Tab maximum width", value: "320px"},						

	titlebarBackground: { description: "Titlebar background color", value: "#BEBBBB" },
	titlebarBackgroundFocused: { description: "Titlebar background color (focused window)", value: "#E14343" },
	titlebarBorderWidth: { description: "Titlebar border width", value: "0px" },
	titlebarBorderColor: { description: "Titlebar border color", value: "#BEBBBB" },
	titlebarTextColor: { description: "Titlebar text color", value: "#000000" },
	titlebarTextColorFocused: { description: "Titlebar text color (focused window)", value: "#000000" },

	otherMonthBackground: { description: "Other month background", value: "#E5B9B9" },
	currentDayBackground: { description: "Current day background", value: "#E14343"},
} 