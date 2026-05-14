"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileCheckScreen } from "@/components/auth/profile-check-screen";
import { HeroSection } from "@/components/landing/hero-section";
import { useAuth } from "@/src/context/AuthContext";
import { resolvePostAuthRedirectPath } from "@/src/lib/progress/tutorial-progress-service";

export function HomeAuthGate() {
  const router = useRouter();
  const { loading, user } = useAuth();
  const [checkingProgress, setCheckingProgress] = useState(true);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      setCheckingProgress(false);
      return;
    }

    let cancelled = false;
    setCheckingProgress(true);

    void resolvePostAuthRedirectPath(user.uid)
      .then((path) => {
        if (!cancelled) {
          router.replace(path);
        }
      })
      .catch(() => {
        if (!cancelled) {
          router.replace("/tutorial");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [loading, router, user]);

  if (loading || checkingProgress) {
    return <ProfileCheckScreen />;
  }

  return <HeroSection />;
}

