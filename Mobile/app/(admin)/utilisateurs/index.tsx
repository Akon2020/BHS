import { View, Pressable, Alert, useColorScheme } from "react-native";
import { Stack, Redirect, router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { getUsers, updateUserRole, deleteUser } from "@/services/api/users";
import type { Utilisateur } from "@/services/api/auth/types";
import type { UserRole } from "@/lib/permissions";
import { getApiErrorMessage } from "@/services/api/client";
import { useSession } from "@/stores/session";
import { getColors } from "@/theme/colors";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

const ROLE: Record<UserRole, { label: string; tone: "primary" | "success" | "muted" }> = {
  admin: { label: fr.utilisateursAdmin.roleAdmin, tone: "primary" },
  editeur: { label: fr.utilisateursAdmin.roleEditeur, tone: "success" },
  membre: { label: fr.utilisateursAdmin.roleMembre, tone: "muted" },
};
const ROLES: UserRole[] = ["admin", "editeur", "membre"];

export default function UtilisateursAdmin() {
  const colors = getColors(useColorScheme());
  const queryClient = useQueryClient();
  const me = useSession((s) => s.user);
  const isAdmin = me?.role === "admin";

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["admin", "utilisateurs"],
    queryFn: getUsers,
    enabled: isAdmin,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "utilisateurs"] });

  const changeRole = useMutation({
    mutationFn: ({ id, role }: { id: number; role: UserRole }) => updateUserRole(id, role),
    onSuccess: () => {
      toast.success(fr.utilisateursAdmin.roleUpdated);
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const remove = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success(fr.utilisateursAdmin.deleted);
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const promptRole = (u: Utilisateur) =>
    Alert.alert(
      fr.utilisateursAdmin.changeRole,
      u.nomComplet,
      [
        ...ROLES.filter((r) => r !== u.role).map((r) => ({
          text: ROLE[r].label,
          onPress: () => changeRole.mutate({ id: u.idUtilisateur, role: r }),
        })),
        { text: fr.common.cancel, style: "cancel" as const },
      ],
    );

  const confirmDelete = (u: Utilisateur) =>
    Alert.alert(fr.common.delete, u.nomComplet, [
      { text: fr.common.cancel, style: "cancel" },
      { text: fr.common.delete, style: "destructive", onPress: () => remove.mutate(u.idUtilisateur) },
    ]);

  // Page réservée aux administrateurs (alignée sur la matrice web).
  if (me && !isAdmin) {
    return <Redirect href="/(admin)" />;
  }

  const list = data ?? [];

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerShown: true,
          title: fr.utilisateursAdmin.title,
          headerRight: () =>
            isAdmin ? (
              <Pressable
                onPress={() => router.push("/(admin)/utilisateurs/nouveau")}
                accessibilityLabel={fr.utilisateursAdmin.new}
                className="px-2"
              >
                <Ionicons name="person-add-outline" size={22} color={colors.primary} />
              </Pressable>
            ) : null,
        }}
      />

      {isLoading ? (
        <View className="gap-3 p-5">
          <Skeleton height={64} />
          <Skeleton height={64} />
        </View>
      ) : isError ? (
        <EmptyState
          title={fr.common.error}
          description={fr.utilisateursAdmin.error}
          action={<Button label={fr.common.retry} variant="outline" onPress={() => refetch()} />}
        />
      ) : list.length === 0 ? (
        <EmptyState title={fr.utilisateursAdmin.empty} />
      ) : (
        <FlashList
          data={list}
          keyExtractor={(u) => String(u.idUtilisateur)}
          renderItem={({ item }) => {
            const isMe = item.idUtilisateur === me?.idUtilisateur;
            return (
              <View className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-4">
                <Avatar uri={item.avatar} name={item.nomComplet} size={40} />
                <View className="min-w-0 flex-1 gap-0.5">
                  <Text className="font-semibold" numberOfLines={1}>
                    {item.nomComplet}
                    {isMe ? ` · ${fr.utilisateursAdmin.you}` : ""}
                  </Text>
                  <Text variant="small" numberOfLines={1}>{item.email}</Text>
                </View>
                <Pressable
                  disabled={!isAdmin || isMe}
                  onPress={() => promptRole(item)}
                  accessibilityLabel={fr.utilisateursAdmin.changeRole}
                >
                  <Badge label={ROLE[item.role].label} tone={ROLE[item.role].tone} />
                </Pressable>
                {isAdmin && !isMe ? (
                  <Pressable
                    onPress={() => confirmDelete(item)}
                    accessibilityLabel={fr.common.delete}
                    hitSlop={8}
                    className="p-1"
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.destructive} />
                  </Pressable>
                ) : null}
              </View>
            );
          }}
          contentContainerStyle={{ padding: 20 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          onRefresh={refetch}
          refreshing={isRefetching}
        />
      )}
    </Screen>
  );
}
