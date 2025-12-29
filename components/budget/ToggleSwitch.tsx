import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface ToggleSwitchProps {
  isOn: boolean;
  onToggle: () => void;
  colors: {
    primaryBlue: string;
    inputBackground: string;
  };
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  isOn,
  onToggle,
  colors,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.toggle,
        {
          backgroundColor: isOn ? colors.primaryBlue : colors.inputBackground,
        }
      ]}
      onPress={onToggle}
    >
      <View
        style={[
          styles.toggleThumb,
          {
            backgroundColor: '#FFFFFF',
            transform: [{ translateX: isOn ? 20 : 2 }],
          }
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    position: 'relative',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
  },
});
