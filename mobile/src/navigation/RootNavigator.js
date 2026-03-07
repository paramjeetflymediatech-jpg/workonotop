import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Auth screens
import AuthChoiceScreen from '../screens/auth/AuthChoiceScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ProviderSignupScreen from '../screens/auth/ProviderSignupScreen';
import CustomerSignupScreen from '../screens/auth/CustomerSignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main
import BottomTabNavigator from './BottomTabNavigator';
import DetailsScreen from '../screens/DetailsScreen';

// Contractor Onboarding
import OnboardingIntroScreen from '../screens/contractor/OnboardingIntroScreen';
import ProfileSetupScreen from '../screens/contractor/ProfileSetupScreen';
import SkillsSelectionScreen from '../screens/contractor/SkillsSelectionScreen';
import DocumentUploadScreen from '../screens/contractor/DocumentUploadScreen';
import BankLinkScreen from '../screens/contractor/BankLinkScreen';
import PendingApprovalScreen from '../screens/contractor/PendingApprovalScreen';

// Contractor Job Screens
import ContractorJobsScreen from '../screens/contractor/ContractorJobsScreen';
import StartJobScreen from '../screens/contractor/StartJobScreen';
import FinishJobScreen from '../screens/contractor/FinishJobScreen';

// Customer Screens
import JobReportScreen from '../screens/customer/JobReportScreen';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#14b8a6" />
            </View>
        );
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: '#14b8a6' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            {user ? (
                <>
                    {/* Main App Stack - Order matters for standard navigation */}
                    {/* If provider is not onboarded, the onboarding screens come first */}
                    {user.role === 'provider' && !user.onboarding_completed ? (
                        <>
                            <Stack.Screen name="ProviderOnboarding" component={OnboardingIntroScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="SkillsSelection" component={SkillsSelectionScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="BankLink" component={BankLinkScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="Main" component={BottomTabNavigator} options={{ headerShown: false }} />
                        </>
                    ) : user.role === 'provider' && user.status === 'pending' ? (
                        <>
                            <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="Main" component={BottomTabNavigator} options={{ headerShown: false }} />
                            <Stack.Screen name="ProviderOnboarding" component={OnboardingIntroScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="SkillsSelection" component={SkillsSelectionScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="BankLink" component={BankLinkScreen} options={{ headerShown: false }} />
                        </>
                    ) : (
                        <>
                            <Stack.Screen name="Main" component={BottomTabNavigator} options={{ headerShown: false }} />
                            <Stack.Screen name="Details" component={DetailsScreen} />

                            {/* Contractor Onboarding (Still registered for deep links or manual re-entry if allowed) */}
                            <Stack.Screen name="ProviderOnboarding" component={OnboardingIntroScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="SkillsSelection" component={SkillsSelectionScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="BankLink" component={BankLinkScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} options={{ headerShown: false }} />
                        </>
                    )}

                    {/* Contractor Job Flow */}
                    <Stack.Screen name="ContractorJobs" component={ContractorJobsScreen} options={{ title: 'Jobs' }} />
                    <Stack.Screen name="StartJob" component={StartJobScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="FinishJob" component={FinishJobScreen} options={{ headerShown: false }} />

                    <Stack.Screen name="JobReport" component={JobReportScreen} options={{ title: 'Job Report' }} />
                </>
            ) : (
                <>
                    <Stack.Screen name="AuthChoice" component={AuthChoiceScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="ProviderSignup" component={ProviderSignupScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="CustomerSignup" component={CustomerSignupScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
                </>
            )}
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    loader: {
        flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff',
    },
});

export default RootNavigator;
