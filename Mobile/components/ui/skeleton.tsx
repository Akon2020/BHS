import { useEffect, useRef } from "react";
import { Animated, useColorScheme, type DimensionValue } from "react-native";
import { getColors } from "@/theme/colors";

interface SkeletonProps {
  height?: number;
  width?: DimensionValue;
  radius?: number;
}

/** Bloc de chargement pulsant (surface `muted`). Piloté par style (indépendant de NativeWind). */
export function Skeleton({ height = 20, width = "100%", radius = 8 }: SkeletonProps) {
  const scheme = useColorScheme();
  const muted = getColors(scheme).muted;
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{ height, width, borderRadius: radius, backgroundColor: muted, opacity }}
    />
  );
}
