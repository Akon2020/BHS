import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Input } from "./input";
import type { TextInputProps } from "react-native";

interface ControlledInputProps<T extends FieldValues> extends TextInputProps {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  hint?: string;
}

/** Champ de formulaire piloté par React Hook Form (Controller + Input). */
export function ControlledInput<T extends FieldValues>({
  control,
  name,
  label,
  hint,
  ...inputProps
}: ControlledInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <Input
          label={label}
          hint={hint}
          value={value as string}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          {...inputProps}
        />
      )}
    />
  );
}
