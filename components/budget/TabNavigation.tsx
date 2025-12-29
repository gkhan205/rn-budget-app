import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type TabType = 'Overview' | 'Recurring' | 'History';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  colors: {
    background: string;
    text: string;
    primaryBlue: string;
    tabInactive: string;
  };
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  colors,
}) => {
  const tabs: TabType[] = ['Overview', 'Recurring', 'History'];

  return (
    <View style={[styles.tabContainer, { backgroundColor: colors.background }]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tab,
            activeTab === tab && { borderBottomColor: colors.primaryBlue },
          ]}
          onPress={() => onTabChange(tab)}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === tab ? colors.text : colors.tabInactive,
              },
            ]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
