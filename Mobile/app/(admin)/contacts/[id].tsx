import { useEffect, useState } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Heading, Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getContact, replyContact } from "@/services/api/correspondance";
import { getApiErrorMessage } from "@/services/api/client";
import { formatDate } from "@/utils/format";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

export default function ContactDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const contactId = Number(id);
  const queryClient = useQueryClient();

  const { data: contact, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "contact", contactId],
    queryFn: () => getContact(contactId),
    enabled: !!contactId,
  });

  const [sujet, setSujet] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (contact) setSujet(`Re: ${contact.sujet}`);
  }, [contact]);

  const reply = useMutation({
    mutationFn: () =>
      replyContact(contactId, {
        sujetReponse: sujet.trim(),
        messageReponse: message.trim(),
      }),
    onSuccess: () => {
      toast.success(fr.correspondance.replySuccess);
      queryClient.invalidateQueries({ queryKey: ["admin", "contacts"] });
      router.back();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const submit = () => {
    if (!sujet.trim() || !message.trim()) return toast.error(fr.auth.required);
    reply.mutate();
  };

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: fr.correspondance.title }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {isLoading ? (
          <View className="gap-3 p-5">
            <Skeleton height={120} />
            <Skeleton height={120} />
          </View>
        ) : isError || !contact ? (
          <EmptyState
            title={fr.common.error}
            description={fr.correspondance.error}
            action={<Button label={fr.common.retry} variant="outline" onPress={() => refetch()} />}
          />
        ) : (
          <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
            <Card className="gap-2">
              <Heading level={3}>{contact.sujet}</Heading>
              <Text variant="small">
                {contact.nomComplet} · {contact.email}
              </Text>
              <Text variant="small">{formatDate(contact.createdAt?.slice(0, 10))}</Text>
              <Text className="mt-2 leading-6 text-foreground">{contact.message}</Text>
            </Card>

            <View className="gap-4">
              <Text variant="label">{fr.correspondance.reply}</Text>
              <Input
                label={fr.correspondance.replySubject}
                value={sujet}
                onChangeText={setSujet}
              />
              <Input
                label={fr.correspondance.replyMessage}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={5}
              />
              <Button
                label={fr.correspondance.send}
                loading={reply.isPending}
                onPress={submit}
              />
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}
