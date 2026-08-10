# Variables UI

## Summary

Add a variable management panel and variable binding to the editor. Variables are typed, named values organized into collections with mode-based values (like Figma's variable system). Users can create and edit variable collections, define variables with per-mode values, and bind node properties to variables so they update automatically when the mode changes.

## Behavior

### Variable Panel

1. A new "Variables" section appears in the left panel's file tab, below the Component Editor. It is a collapsible panel with a section header "Variables" and an add button.

2. Clicking the add button creates a new variable collection with a default name "Collection 1" (or "Collection N" where N increments from the highest existing collection number). The collection appears in the panel with its name, the number of variables it contains, and a chevron to expand/collapse it.

3. Clicking a collection's name enters an inline rename mode — the name becomes an editable text input. Pressing Enter or blurring the input commits the new name. Pressing Escape cancels the edit and reverts to the previous name.

4. Expanding a collection reveals:
   - A modes row showing each mode as a tab button, with the active mode highlighted.
   - A list of variables in the collection, each showing its name, type icon, and current value for the active mode.
   - An "Add variable" button at the bottom of the list.

5. The collection always has at least one mode named "Default". Clicking an "Add mode" button (visible in the modes row) adds a new mode with a default name "Mode 1" (or "Mode N" where N increments). Mode names are inline editable the same way as collection names.

6. Clicking a mode tab selects it and the variable list updates to show each variable's value for that mode.

7. Clicking "Add variable" shows a form with:
   - A name input (text, required).
   - A type selector with options: Color, Number, String, Boolean.
   - A "Create" button.
   The default value for the new variable is set to the type's default (color: `#6366f1`, number: `0`, string: `""`, boolean: `false`) across all existing modes.

8. Each variable in the list shows:
   - A type icon (color swatch, number `#`, text `T`, boolean toggle).
   - The variable name.
   - An editable value input appropriate for the type:
     - Color: a color picker input and hex text field.
     - Number: a number input.
     - String: a text input.
     - Boolean: a toggle button.
   Changing the value updates the variable's value for the currently active mode only.

9. Each variable row has a delete button (trash icon) that appears on hover. Clicking it removes the variable from all modes and the collection. A confirmation is not required.

10. Each collection has a delete button in its header area. Clicking it removes the collection and all its variables. A confirmation is not required.

11. When a collection has no variables, the variable list shows an empty state message: "No variables yet" with a brief hint.

### Variable Binding in the Inspector

12. In the Inspector panel, property inputs that support variable binding (Fill color, Stroke color, Text content, Font size, Opacity, Gap, Padding, Corner radius, X/Y/W/H position, Shadow, Layer blur) show a small "V" (variable) icon button next to the property input.

13. Clicking the "V" icon opens a variable picker dropdown listing all variables from all collections, grouped by collection. Each entry shows the variable name, type icon, and current value for the active mode.

14. Selecting a variable from the picker binds the property to that variable. The property input is replaced by a variable badge showing the variable name in blue (`#0d99ff`) with a "V" prefix. The badge is clickable — clicking it reopens the variable picker.

15. When a property is bound to a variable, its value is driven by the current mode's value for that variable. Changing the mode in the Variables panel updates all bound properties on the canvas in real time.

16. The variable badge has a small "×" button to unbind the property. Unbinding restores the property input to its previous local value (the value that was set before binding, not the variable's resolved value).

17. When a variable's value changes (via the Variables panel), all nodes with properties bound to that variable update immediately on the canvas.

18. Variables are document-scoped: they persist across page switches within the same document and are saved and loaded with the document.

19. The variable picker shows a "Create variable" option at the bottom. Selecting it opens the create-variable form from the variable panel without leaving the inspector — the user can name and type the variable, and it is immediately available for binding.