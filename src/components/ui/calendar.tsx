"use client";

import {
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from "lucide-react";
import type { ComponentProps } from "react";
import { useEffect, useRef } from "react";
import {
	type DayButton,
	DayPicker,
	getDefaultClassNames,
} from "react-day-picker";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DayPickerProps = ComponentProps<typeof DayPicker>;
type CalendarProps = DayPickerProps & {
	buttonVariant?: ComponentProps<typeof Button>["variant"];
};
type DayPickerComponents = NonNullable<DayPickerProps["components"]>;

const DAY_PICKER_CLASS_KEYS = {
	buttonNext: "button_next",
	buttonPrevious: "button_previous",
	captionLabel: "caption_label",
	dropdownRoot: "dropdown_root",
	monthCaption: "month_caption",
	rangeEnd: "range_end",
	rangeMiddle: "range_middle",
	rangeStart: "range_start",
	weekNumber: "week_number",
	weekNumberHeader: "week_number_header",
} as const;

const DAY_PICKER_COMPONENT_KEYS = {
	chevron: "Chevron",
	dayButton: "DayButton",
	root: "Root",
	weekNumber: "WeekNumber",
} as const;

const CalendarChevron: DayPickerComponents["Chevron"] = ({
	className,
	orientation,
	...props
}) => {
	if (orientation === "left") {
		return <ChevronLeftIcon className={cn("size-4", className)} {...props} />;
	}

	if (orientation === "right") {
		return <ChevronRightIcon className={cn("size-4", className)} {...props} />;
	}

	return <ChevronDownIcon className={cn("size-4", className)} {...props} />;
};

const CalendarRoot: DayPickerComponents["Root"] = ({
	className,
	rootRef,
	...props
}) => (
	<div
		className={cn(className)}
		data-slot="calendar"
		ref={rootRef}
		{...props}
	/>
);

const CalendarWeekNumber: DayPickerComponents["WeekNumber"] = ({
	children,
	...props
}) => (
	<td {...props}>
		<div className="flex size-(--cell-size) items-center justify-center text-center">
			{children}
		</div>
	</td>
);

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	captionLayout = "label",
	buttonVariant = "ghost",
	formatters,
	components,
	...props
}: CalendarProps) {
	const defaultClassNames = getDefaultClassNames();

	const classNameOverrides = {
		[DAY_PICKER_CLASS_KEYS.buttonNext]: cn(
			buttonVariants({ variant: buttonVariant }),
			"size-(--cell-size) select-none p-0 aria-disabled:opacity-50",
			defaultClassNames.button_next,
		),
		[DAY_PICKER_CLASS_KEYS.buttonPrevious]: cn(
			buttonVariants({ variant: buttonVariant }),
			"size-(--cell-size) select-none p-0 aria-disabled:opacity-50",
			defaultClassNames.button_previous,
		),
		[DAY_PICKER_CLASS_KEYS.captionLabel]: cn(
			"select-none font-medium",
			captionLayout === "label"
				? "text-sm"
				: "flex h-8 items-center gap-1 rounded-md pr-1 pl-2 text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground",
			defaultClassNames.caption_label,
		),
		day: cn(
			"group/day relative aspect-square h-full w-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
			defaultClassNames.day,
		),
		disabled: cn(
			"text-muted-foreground opacity-50",
			defaultClassNames.disabled,
		),
		dropdown: cn(
			"absolute inset-0 bg-popover opacity-0",
			defaultClassNames.dropdown,
		),
		[DAY_PICKER_CLASS_KEYS.dropdownRoot]: cn(
			"relative rounded-md border border-input shadow-xs has-focus:border-ring has-focus:ring-[3px] has-focus:ring-ring/50",
			defaultClassNames.dropdown_root,
		),
		dropdowns: cn(
			"flex h-(--cell-size) w-full items-center justify-center gap-1.5 font-medium text-sm",
			defaultClassNames.dropdowns,
		),
		hidden: cn("invisible", defaultClassNames.hidden),
		month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
		[DAY_PICKER_CLASS_KEYS.monthCaption]: cn(
			"flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
			defaultClassNames.month_caption,
		),
		months: cn(
			"relative flex flex-col gap-4 md:flex-row",
			defaultClassNames.months,
		),
		nav: cn(
			"absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
			defaultClassNames.nav,
		),
		outside: cn(
			"text-muted-foreground aria-selected:text-muted-foreground",
			defaultClassNames.outside,
		),
		[DAY_PICKER_CLASS_KEYS.rangeEnd]: cn(
			"rounded-r-md bg-accent",
			defaultClassNames.range_end,
		),
		[DAY_PICKER_CLASS_KEYS.rangeMiddle]: cn(
			"rounded-none",
			defaultClassNames.range_middle,
		),
		[DAY_PICKER_CLASS_KEYS.rangeStart]: cn(
			"rounded-l-md bg-accent",
			defaultClassNames.range_start,
		),
		root: cn("w-fit", defaultClassNames.root),
		table: "w-full border-collapse",
		today: cn(
			"rounded-md bg-accent text-accent-foreground data-[selected=true]:rounded-none",
			defaultClassNames.today,
		),
		week: cn("mt-2 flex w-full", defaultClassNames.week),
		[DAY_PICKER_CLASS_KEYS.weekNumber]: cn(
			"select-none text-[0.8rem] text-muted-foreground",
			defaultClassNames.week_number,
		),
		[DAY_PICKER_CLASS_KEYS.weekNumberHeader]: cn(
			"w-(--cell-size) select-none",
			defaultClassNames.week_number_header,
		),
		weekday: cn(
			"flex-1 select-none rounded-md font-normal text-[0.8rem] text-muted-foreground",
			defaultClassNames.weekday,
		),
		weekdays: cn("flex", defaultClassNames.weekdays),
	} satisfies DayPickerProps["classNames"];

	const componentOverrides = {
		[DAY_PICKER_COMPONENT_KEYS.chevron]: CalendarChevron,
		[DAY_PICKER_COMPONENT_KEYS.dayButton]: CalendarDayButton,
		[DAY_PICKER_COMPONENT_KEYS.root]: CalendarRoot,
		[DAY_PICKER_COMPONENT_KEYS.weekNumber]: CalendarWeekNumber,
	} satisfies DayPickerComponents;

	return (
		<DayPicker
			captionLayout={captionLayout}
			className={cn(
				"group/calendar bg-background p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
				String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
				String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
				className,
			)}
			classNames={{
				...classNameOverrides,
				...classNames,
			}}
			components={{
				...componentOverrides,
				...components,
			}}
			formatters={{
				formatMonthDropdown: (date) =>
					date.toLocaleString("default", { month: "short" }),
				...formatters,
			}}
			showOutsideDays={showOutsideDays}
			{...props}
		/>
	);
}

function CalendarDayButton({
	className,
	day,
	modifiers,
	...props
}: ComponentProps<typeof DayButton>) {
	const defaultClassNames = getDefaultClassNames();

	const ref = useRef<HTMLButtonElement>(null);
	useEffect(() => {
		if (modifiers.focused) {
			ref.current?.focus();
		}
	}, [modifiers.focused]);

	return (
		<Button
			className={cn(
				"flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 font-normal leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-start=true]:rounded-l-md data-[range-end=true]:bg-primary data-[range-middle=true]:bg-accent data-[range-start=true]:bg-primary data-[selected-single=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:text-accent-foreground data-[range-start=true]:text-primary-foreground data-[selected-single=true]:text-primary-foreground group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground [&>span]:text-xs [&>span]:opacity-70",
				defaultClassNames.day,
				className,
			)}
			data-day={day.date.toLocaleDateString()}
			data-range-end={modifiers.range_end}
			data-range-middle={modifiers.range_middle}
			data-range-start={modifiers.range_start}
			data-selected-single={
				modifiers.selected &&
				!modifiers.range_start &&
				!modifiers.range_end &&
				!modifiers.range_middle
			}
			ref={ref}
			size="icon"
			variant="ghost"
			{...props}
		/>
	);
}

export { Calendar, CalendarDayButton };
