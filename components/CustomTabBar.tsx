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
    { key: 'home', label: 'Home', icon: 'house.fill', route: '/(tabs)/budgets' },
    { key: 'transactions', label: 'Transactions', icon: 'list.bullet', route: '/(tabs)/transactions' },
    // { key: 'add', label: 'Add', icon: 'plus', route: '/add-transaction' },
    // { key: 'stats', label: 'Stats', icon: 'chart.pie.fill', route: '/(tabs)/stats' },
    { key: 'settings', label: 'Settings', icon: 'gearshape.fill', route: '/(tabs)/explore' },
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
            {tabs.map((tab, index) => {
                const isActive = activeTab === tab.key;
                const isAddButton = tab.key === 'add';
                
                return (
                    <TouchableOpacity
                        key={tab.key}
                        style={[
                            styles.tabItem,
                            isAddButton && styles.addButtonTab
                        ]}
                        onPress={() => onTabPress(tab.key)}
                        activeOpacity={0.7}
                    >
                        <View style={[
                            styles.iconContainer,
                            isActive && !isAddButton && { backgroundColor: colors.activeBlue + '20' },
                            isAddButton && styles.addButtonContainer
                        ]}>
                            <IconSymbol
                                name={tab.icon as any}
                                size={isAddButton ? 24 : 20}
                                color={isAddButton ? '#FFFFFF' : (isActive ? colors.activeBlue : colors.inactiveGray)}
                            />
                        </View>
                        <Text style={[
                            styles.label,
                            { color: isAddButton ? colors.activeBlue : (isActive ? colors.activeBlue : colors.inactiveGray) }
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
    addButtonTab: {
        marginTop: -20, // Pop up effect
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    addButtonContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#4A9EFF',
        shadowColor: '#4A9EFF',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    label: {
        fontSize: 10,
        fontWeight: '500',
        textAlign: 'center',
    },
});

export { CustomTabBar, tabs };
export type { TabItem };

