"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/connexion");
    }

    if (
      user &&
      allowedRoles &&
      !allowedRoles.includes(user.role)
    ) {
      router.push("/403");
    }
  }, [user, loading]);

  if (loading) return null;
  if (!user) return null;

  return <>{children}</>;
}
