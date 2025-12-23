import { CustomTabBar } from '@/components/CustomTabBar';
import { useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    View,
} from 'react-native';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const router = useRouter();
    const segments = useSegments();
    const [activeTab, setActiveTab] = useState('home');

    const colors = {
        background: '#1A1B1F',
    };

    // Determine active tab based on current route
    useEffect(() => {
        const currentPath = segments.join('/');
        
        if (currentPath === '' || currentPath === 'index') {
            setActiveTab('home');
        } else if (currentPath.includes('stats') || currentPath === '(tabs)/stats') {
            setActiveTab('stats');
        } else if (currentPath.includes('add-transaction')) {
            setActiveTab('transact');
        } else if (currentPath.includes('analytics')) {
            setActiveTab('analytics');
        } else if (currentPath.includes('settings') || currentPath.includes('explore')) {
            setActiveTab('settings');
        }
    }, [segments]);

    const handleTabPress = (tab: string) => {
        setActiveTab(tab);
        
        switch (tab) {
            case 'home':
                router.push('/');
                break;
            case 'stats':
                router.push('/(tabs)/stats');
                break;
            case 'transact':
                router.push('/add-transaction');
                break;
            case 'analytics':
                router.push('/(tabs)/transactions');
                break;
            case 'settings':
                router.push('/(tabs)/explore');
                break;
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
            <View style={styles.content}>
                {children}
            </View>
            <CustomTabBar activeTab={activeTab} onTabPress={handleTabPress} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingBottom: 90, // Space for tab bar
    },
});

export default MainLayout;
