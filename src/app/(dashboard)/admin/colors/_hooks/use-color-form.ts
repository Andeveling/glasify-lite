import { zodResolver } from "@hookform/resolvers/zod";
import type { UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import {
	type ColorCreateInput,
	type ColorUpdateInput,
	colorCreateSchema,
} from "@/lib/validations/color";
import { useColorMutations } from "./use-color-mutations";

type UseColorFormOptions = {
	mode: "create" | "edit";
	defaultValues?: ColorUpdateInput & { id: string };
	onSuccessCallback?: () => void;
};

type FormValues = ColorCreateInput;

/**
 * Main form hook - orchestrates form state, validation and mutations
 *
 * @param options - Form configuration (mode, defaultValues, callbacks)
 * @returns Form instance, submit handler, and loading state
 */
export function useColorForm({
	mode,
	defaultValues,
	onSuccessCallback,
}: UseColorFormOptions): {
	form: UseFormReturn<FormValues>;
	onSubmit: (data: FormValues) => void;
	isLoading: boolean;
} {
	const { createMutation, updateMutation, isLoading } = useColorMutations({
		onSuccessCallback,
	});

	const form = useForm<FormValues>({
		defaultValues: (defaultValues ?? {
			hexCode: "#000000",
			isActive: true,
			name: "",
			ralCode: null,
		}) as FormValues,
		mode: "onChange",
		resolver: zodResolver(colorCreateSchema) as never,
	});

	const onSubmit = (data: FormValues) => {
		if (mode === "create") {
			createMutation.mutate(data);
		} else if (defaultValues) {
			updateMutation.mutate({
				...data,
				id: defaultValues.id,
			});
		}
	};

	return {
		form,
		isLoading,
		onSubmit,
	};
}
