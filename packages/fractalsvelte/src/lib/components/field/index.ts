import Field, { type FieldOrientation, type FieldProps } from './field.svelte';
import Set, { type FieldSetProps } from './field-set.svelte';
import Legend, { type FieldLegendProps, type FieldLegendVariant } from './field-legend.svelte';
import Group, { type FieldGroupGap, type FieldGroupProps } from './field-group.svelte';
import Content, { type FieldContentProps } from './field-content.svelte';
import Label, { type FieldLabelProps, type FieldLabelWeight } from './field-label.svelte';
import Title, { type FieldTitleProps } from './field-title.svelte';
import Description, { type FieldDescriptionProps } from './field-description.svelte';
import Separator, { type FieldSeparatorProps } from './field-separator.svelte';
import Error, { type FieldErrorItem, type FieldErrorProps } from './field-error.svelte';

export {
	Field,
	Set,
	Legend,
	Group,
	Content,
	Label,
	Title,
	Description,
	Separator,
	Error,
	//
	Field as Root,
	Field as FieldRoot,
	Set as FieldSet,
	Legend as FieldLegend,
	Group as FieldGroup,
	Content as FieldContent,
	Label as FieldLabel,
	Title as FieldTitle,
	Description as FieldDescription,
	Separator as FieldSeparator,
	Error as FieldError,
	type FieldContentProps,
	type FieldDescriptionProps,
	type FieldErrorItem,
	type FieldErrorProps,
	type FieldGroupGap,
	type FieldGroupProps,
	type FieldLabelProps,
	type FieldLabelWeight,
	type FieldLegendProps,
	type FieldLegendVariant,
	type FieldOrientation,
	type FieldProps,
	type FieldSeparatorProps,
	type FieldSetProps,
	type FieldTitleProps
};
