import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { View, StyleSheet } from 'react-native';

export function RoundedHapticTab(props: BottomTabBarButtonProps) {
  const focused = props.accessibilityState?.selected === true;

  return (
    <View style={[styles.container, focused && styles.focusedContainer]}>
      <PlatformPressable
        {...props}
        style={[styles.pressable]}
        onPressIn={ev => {
          if (process.env.EXPO_OS === 'ios') {
            // Add a soft haptic feedback when pressing down on the tabs.
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
          props.onPressIn?.(ev);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 4,
    marginVertical: 6,
    borderRadius: 32,
    backgroundColor: 'transparent',
    overflow: 'hidden', // This ensures the border radius is respected
  },
  focusedContainer: {
    backgroundColor: '#1e40af', // blue-800 background with border radius
  },
  pressable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 32,
  },
});
