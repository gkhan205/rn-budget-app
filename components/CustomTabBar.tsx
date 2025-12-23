import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabBarProps {
    activeTab: string;
    onTabPress: (tab: string) => void;
}

interface TabItem {
    key: string;
    label: string;
    icon: string;
    route: string;
}

const tabs: TabItem[] = [
    { key: 'home', label: 'Home', icon: 'house.fill', route: '/budgets' },
    { key: 'stats', label: 'Stats', icon: 'chart.pie.fill', route: '/stats' },
    { key: 'transact', label: 'Transact', icon: 'arrow.left.arrow.right', route: '/add-transaction' },
    { key: 'analytics', label: 'Stats', icon: 'chart.bar.fill', route: '/analytics' },
    { key: 'settings', label: 'Settings', icon: 'gearshape.fill', route: '/settings' },
];

const CustomTabBar: React.FC<TabBarProps> = ({ activeTab, onTabPress }) => {
    const insets = useSafeAreaInsets();

    const colors = {
        background: '#1A1B1F',
        activeBlue: '#4A9EFF',
        inactiveGray: '#9BA1A6',
        border: '#404348',
    };

    return (
        <View style={[
            styles.container, 
            { 
                backgroundColor: colors.background,
                borderTopColor: colors.border,
                paddingBottom: insets.bottom,
            }
        ]}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                    <TouchableOpacity
                        key={tab.key}
                        style={styles.tabItem}
                        onPress={() => onTabPress(tab.key)}
                        activeOpacity={0.7}
                    >
                        <View style={[
                            styles.iconContainer,
                            isActive && { backgroundColor: colors.activeBlue + '20' }
                        ]}>
                            <IconSymbol
                                name={tab.icon as any}
                                size={20}
                                color={isActive ? colors.activeBlue : colors.inactiveGray}
                            />
                        </View>
                        <Text style={[
                            styles.label,
                            { color: isActive ? colors.activeBlue : colors.inactiveGray }
                        ]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        paddingTop: 10,
        paddingHorizontal: 8,
        borderTopWidth: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    label: {
        fontSize: 10,
        fontWeight: '500',
        textAlign: 'center',
    },
});

export { CustomTabBar, tabs };
export type { TabItem };

