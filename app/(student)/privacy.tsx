import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Dimensions, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemeColors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

export default function PrivacySettingsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [profileVisibility, setProfileVisibility] = useState(true);
    const [emailVisibility, setEmailVisibility] = useState(false);
    const [activityTracking, setActivityTracking] = useState(true);
    const [dataSharing, setDataSharing] = useState(false);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ThemedView style={styles.container}>
                {/* Header */}
                <View style={[styles.header, isDark && styles.headerDark]}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <IconSymbol
                            name="chevron.left"
                            size={24}
                            color={isDark ? ThemeColors.lightNeutral : ThemeColors.deepBlue}
                        />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>Privacy Settings</ThemedText>
                    <View style={styles.backButton} />
                </View>

                <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                    {/* Profile Privacy */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Profile Privacy</ThemedText>

                        <View style={[styles.settingItem, isDark && styles.settingItemDark]}>
                            <View style={styles.settingLeft}>
                                <IconSymbol name="person.fill" size={20} color={ThemeColors.orange} />
                                <View style={styles.settingTextContainer}>
                                    <ThemedText style={styles.settingLabel}>Profile Visibility</ThemedText>
                                    <ThemedText style={styles.settingDescription}>
                                        Allow others to view your profile
                                    </ThemedText>
                                </View>
                            </View>
                            <Switch
                                value={profileVisibility}
                                onValueChange={setProfileVisibility}
                                trackColor={{ false: '#E0E0E0', true: ThemeColors.orange + '80' }}
                                thumbColor={profileVisibility ? ThemeColors.orange : '#FFFFFF'}
                            />
                        </View>

                        <View style={[styles.settingItem, isDark && styles.settingItemDark]}>
                            <View style={styles.settingLeft}>
                                <IconSymbol name="envelope.fill" size={20} color={ThemeColors.deepBlue} />
                                <View style={styles.settingTextContainer}>
                                    <ThemedText style={styles.settingLabel}>Email Visibility</ThemedText>
                                    <ThemedText style={styles.settingDescription}>
                                        Show email address to other users
                                    </ThemedText>
                                </View>
                            </View>
                            <Switch
                                value={emailVisibility}
                                onValueChange={setEmailVisibility}
                                trackColor={{ false: '#E0E0E0', true: ThemeColors.deepBlue + '80' }}
                                thumbColor={emailVisibility ? ThemeColors.deepBlue : '#FFFFFF'}
                            />
                        </View>
                    </View>

                    {/* Data & Tracking */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Data & Tracking</ThemedText>

                        <View style={[styles.settingItem, isDark && styles.settingItemDark]}>
                            <View style={styles.settingLeft}>
                                <IconSymbol name="chart.bar.fill" size={20} color={ThemeColors.orange} />
                                <View style={styles.settingTextContainer}>
                                    <ThemedText style={styles.settingLabel}>Activity Tracking</ThemedText>
                                    <ThemedText style={styles.settingDescription}>
                                        Track your learning progress and activity
                                    </ThemedText>
                                </View>
                            </View>
                            <Switch
                                value={activityTracking}
                                onValueChange={setActivityTracking}
                                trackColor={{ false: '#E0E0E0', true: ThemeColors.orange + '80' }}
                                thumbColor={activityTracking ? ThemeColors.orange : '#FFFFFF'}
                            />
                        </View>

                        <View style={[styles.settingItem, isDark && styles.settingItemDark]}>
                            <View style={styles.settingLeft}>
                                <IconSymbol name="hand.raised.fill" size={20} color={ThemeColors.deepBlue} />
                                <View style={styles.settingTextContainer}>
                                    <ThemedText style={styles.settingLabel}>Data Sharing</ThemedText>
                                    <ThemedText style={styles.settingDescription}>
                                        Share anonymized data for app improvement
                                    </ThemedText>
                                </View>
                            </View>
                            <Switch
                                value={dataSharing}
                                onValueChange={setDataSharing}
                                trackColor={{ false: '#E0E0E0', true: ThemeColors.deepBlue + '80' }}
                                thumbColor={dataSharing ? ThemeColors.deepBlue : '#FFFFFF'}
                            />
                        </View>
                    </View>

                    {/* Account Actions */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Account Actions</ThemedText>

                        <TouchableOpacity style={[styles.actionItem, isDark && styles.actionItemDark]}>
                            <IconSymbol name="trash.fill" size={20} color="#FF3B30" />
                            <ThemedText style={[styles.actionText, { color: '#FF3B30' }]}>
                                Delete Account
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? (isTablet ? 20 : 16) : (isTablet ? 16 : 12),
        paddingBottom: 16,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    headerDark: {
        backgroundColor: '#1A3D4D',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: isTablet ? 24 : 20,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
        opacity: 0.7,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        marginBottom: 12,
    },
    settingItemDark: {
        backgroundColor: '#2A4D5D',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    settingTextContainer: {
        flex: 1,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 13,
        opacity: 0.7,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        gap: 12,
    },
    actionItemDark: {
        backgroundColor: '#2A4D5D',
    },
    actionText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

