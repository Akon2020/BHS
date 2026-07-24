import { View } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ControlledInput } from "@/components/ui/controlled-input";
import { changePassword } from "@/services/api/users";
import { useSession } from "@/stores/session";
import { getApiErrorMessage } from "@/services/api/client";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

const schema = z
  .object({
    oldPassword: z.string().min(6, fr.auth.passwordTooShort),
    newPassword: z.string().min(6, fr.auth.passwordTooShort),
    confirmNewPassword: z.string().min(6, fr.auth.passwordTooShort),
  })
  .refine((v) => v.newPassword === v.confirmNewPassword, {
    message: fr.profil.passwordMismatch,
    path: ["confirmNewPassword"],
  });
type FormValues = z.infer<typeof schema>;

export function ChangePasswordSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const user = useSession((s) => s.user);
  const { control, handleSubmit, formState, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { oldPassword: "", newPassword: "", confirmNewPassword: "" },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    try {
      await changePassword(user.idUtilisateur, values);
      toast.success(fr.profil.passwordUpdated);
      reset();
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={fr.profil.changePassword}>
      <View className="gap-4">
        <ControlledInput
          control={control}
          name="oldPassword"
          label={fr.profil.currentPassword}
          secureTextEntry
        />
        <ControlledInput
          control={control}
          name="newPassword"
          label={fr.profil.newPassword}
          secureTextEntry
        />
        <ControlledInput
          control={control}
          name="confirmNewPassword"
          label={fr.profil.confirmPassword}
          secureTextEntry
        />
        <Button
          label={fr.profil.save}
          loading={formState.isSubmitting}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </Sheet>
  );
}
