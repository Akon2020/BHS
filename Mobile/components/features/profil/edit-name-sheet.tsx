import { View } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ControlledInput } from "@/components/ui/controlled-input";
import { updateProfil } from "@/services/api/users";
import { useSession } from "@/stores/session";
import { getApiErrorMessage } from "@/services/api/client";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

const schema = z.object({
  nomComplet: z.string().trim().min(1, fr.auth.required),
});
type FormValues = z.infer<typeof schema>;

export function EditNameSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const user = useSession((s) => s.user);
  const refreshProfile = useSession((s) => s.refreshProfile);

  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nomComplet: user?.nomComplet ?? "" },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    try {
      await updateProfil(user.idUtilisateur, { nomComplet: values.nomComplet });
      await refreshProfile();
      toast.success(fr.profil.nameUpdated);
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={fr.profil.editName}>
      <View className="gap-4">
        <ControlledInput
          control={control}
          name="nomComplet"
          label={fr.auth.nomComplet}
          autoCapitalize="words"
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
