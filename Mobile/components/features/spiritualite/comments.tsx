import { View } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Heading, Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { ControlledInput } from "@/components/ui/controlled-input";
import { Avatar } from "@/components/ui/avatar";
import { createCommentaire } from "@/services/api/commentaires";
import type { CommentaireBlog } from "@/services/api/blog/types";
import { useSession } from "@/stores/session";
import { getApiErrorMessage } from "@/services/api/client";
import { formatDate } from "@/utils/format";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

const schema = z.object({
  nomComplet: z.string().trim().min(1, fr.auth.required),
  email: z.email(fr.auth.invalidEmail),
  contenu: z.string().trim().min(1, fr.auth.required),
});
type FormValues = z.infer<typeof schema>;

export function Comments({
  idBlog,
  commentaires,
}: {
  idBlog: number;
  commentaires: CommentaireBlog[];
}) {
  const user = useSession((s) => s.user);
  const { control, handleSubmit, formState, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nomComplet: user?.nomComplet ?? "",
      email: user?.email ?? "",
      contenu: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createCommentaire({ idBlog, ...values });
      toast.success(fr.spiritualite.commentPending);
      reset({
        nomComplet: user?.nomComplet ?? "",
        email: user?.email ?? "",
        contenu: "",
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <View className="gap-4">
      <Heading level={3}>{fr.spiritualite.comments}</Heading>

      {commentaires.length === 0 ? (
        <Text variant="muted">{fr.spiritualite.noComments}</Text>
      ) : (
        <View className="gap-4">
          {commentaires.map((c) => (
            <View key={c.idCommentaire} className="flex-row gap-3">
              <Avatar
                uri={c.utilisateur?.avatar}
                name={c.utilisateur?.nomComplet ?? c.nomComplet}
                size={36}
              />
              <View className="flex-1 gap-0.5">
                <View className="flex-row items-center justify-between">
                  <Text variant="label">
                    {c.utilisateur?.nomComplet ?? c.nomComplet}
                  </Text>
                  <Text variant="small">
                    {formatDate(c.dateCommentaire?.slice(0, 10))}
                  </Text>
                </View>
                <Text className="text-sm text-foreground">{c.contenu}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Formulaire */}
      <View className="gap-3 rounded-xl border border-border bg-card p-4">
        <Text variant="label">{fr.spiritualite.addComment}</Text>
        <ControlledInput
          control={control}
          name="nomComplet"
          label={fr.spiritualite.yourName}
          autoCapitalize="words"
        />
        <ControlledInput
          control={control}
          name="email"
          label={fr.spiritualite.yourEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <ControlledInput
          control={control}
          name="contenu"
          label={fr.spiritualite.yourComment}
          multiline
          numberOfLines={3}
        />
        <Button
          label={fr.spiritualite.send}
          loading={formState.isSubmitting}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </View>
  );
}
