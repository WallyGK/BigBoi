import { SPACING } from "@/constants/Theme";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

type SwipeDeleteRightActionProps = {
  progress: SharedValue<number>;
  onPress: () => void;
  colors: {
    error: string;
    text: string;
  };
  label?: string;
};

export default function SwipeDeleteRightAction({
  progress,
  onPress,
  colors,
  label = "Delete",
}: SwipeDeleteRightActionProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0, 0.18, 0.7],
      [0, 0.55, 1],
      Extrapolation.CLAMP,
    );
    const translateX = interpolate(
      progress.value,
      [0, 0.7],
      [10, 0],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [{ translateX }],
    };
  });

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "flex-end",
        marginBottom: SPACING.xs,
      }}
    >
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={onPress}
          style={{
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.error,
            borderRadius: 7,
            width: 64,
            height: 32,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 11 }}>
            {label}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
