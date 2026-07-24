import { useEffect, useState } from "react";
import { View, ScrollView, Switch, useColorScheme } from "react-native";
import { router, Stack } from "expo-router";

import { Screen } from "@/components/ui/screen";
import { Heading, Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Sheet } from "@/components/ui/sheet";
import { SettingsGroup, SettingsRow } from "@/components/ui/settings-row";
import { ThemeSelector } from "@/components/features/profil/theme-selector";
import { EditNameSheet } from "@/components/features/profil/edit-name-sheet";
import { ChangePasswordSheet } from "@/components/features/profil/change-password-sheet";
import { useSession } from "@/stores/session";
import { usePreferences } from "@/stores/preferences";
import { isBiometricAvailable, authenticateBiometric } from "@/lib/biometrics";
import { getApiErrorMessage } from "@/services/api/client";
import { getColors } from "@/theme/colors";
import { toast } from "@/stores/toast";
import { fr } from "@/i18n/fr";

const ROLE_LABEL: Record<string, string> = {
  admin: fr.profil.roleAdmin,
  editeur: fr.profil.roleEditeur,
  membre: fr.profil.roleMembre,
};

export default function Profil() {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const user = useSession((s) => s.user);
  const logout = useSession((s) => s.logout);
  const deleteAccount = useSession((s) => s.deleteAccount);
  const biometricEnabled = usePreferences((s) => s.biometricEnabled);
  const setBiometricEnabled = usePreferences((s) => s.setBiometricEnabled);

  const [editName, setEditName] = useState(false);
  const [changePwd, setChangePwd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(true);

  useEffect(() => {
    void isBiometricAvailable().then(setBioAvailable);
  }, []);

  if (!user) return null;

  const onToggleBiometric = async (value: boolean) => {
    if (!value) {
      setBiometricEnabled(false);
      return;
    }
    if (!bioAvailable) {
      toast.error(fr.profil.biometricUnavailable);
      return;
    }
    const ok = await authenticateBiometric();
    setBiometricEnabled(ok);
  };

  const onDelete = async () => {
    try {
      setDeleting(true);
      await deleteAccount();
      toast.success(fr.profil.deleted);
      router.replace("/(public)");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: fr.profil.title }} />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
        {/* En-tête */}
        <View className="items-center gap-3 py-2">
          <Avatar uri={user.avatar} name={user.nomComplet} size={80} />
          <View className="items-center gap-1">
            <Heading level={2}>{user.nomComplet}</Heading>
            <Text variant="muted">{user.email}</Text>
            <Badge label={ROLE_LABEL[user.role] ?? user.role} tone="primary" />
          </View>
        </View>

        {/* Compte */}
        <SettingsGroup title={fr.profil.account}>
          <SettingsRow
            label={fr.profil.editName}
            onPress={() => setEditName(true)}
          />
          <SettingsRow
            label={fr.profil.changePassword}
            onPress={() => setChangePwd(true)}
          />
        </SettingsGroup>

        {/* Préférences */}
        <View className="gap-2">
          <Text variant="label" className="px-1 uppercase text-muted-foreground">
            {fr.profil.preferences}
          </Text>
          <View className="gap-3 rounded-xl border border-border bg-card p-4">
            <Text variant="label">{fr.profil.theme}</Text>
            <ThemeSelector />
          </View>
          <View className="overflow-hidden rounded-xl border border-border bg-card">
            <SettingsRow
              label={fr.profil.biometric}
              description={!bioAvailable ? fr.profil.biometricUnavailable : undefined}
              right={
                <Switch
                  value={biometricEnabled}
                  onValueChange={onToggleBiometric}
                  disabled={!bioAvailable}
                  trackColor={{ false: colors.muted, true: colors.primary }}
                  thumbColor={colors.card}
                />
              }
            />
            <SettingsRow
              label={fr.profil.notifications}
              right={<Badge label={fr.profil.notificationsSoon} tone="muted" />}
            />
          </View>
        </View>

        {/* Déconnexion */}
        <Button
          label={fr.profil.logout}
          variant="outline"
          onPress={async () => {
            await logout();
            router.replace("/(public)");
          }}
        />

        {/* Zone sensible */}
        <SettingsGroup title={fr.profil.dangerZone}>
          <SettingsRow
            label={fr.profil.deleteAccount}
            destructive
            onPress={() => setConfirmDelete(true)}
          />
        </SettingsGroup>
      </ScrollView>

      <EditNameSheet visible={editName} onClose={() => setEditName(false)} />
      <ChangePasswordSheet
        visible={changePwd}
        onClose={() => setChangePwd(false)}
      />

      <Sheet
        visible={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={fr.profil.deleteConfirmTitle}
      >
        <View className="gap-4">
          <Text variant="muted">{fr.profil.deleteConfirmBody}</Text>
          <Button
            label={fr.profil.deleteConfirm}
            variant="destructive"
            loading={deleting}
            onPress={onDelete}
          />
          <Button
            label={fr.profil.cancel}
            variant="ghost"
            onPress={() => setConfirmDelete(false)}
          />
        </View>
      </Sheet>
    </Screen>
  );
}
