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
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

// Main
import BottomTabNavigator from './BottomTabNavigator';
import AdminDrawerNavigator from './AdminDrawerNavigator';
import ProviderDrawerNavigator from './ProviderDrawerNavigator';
import DetailsScreen from '../screens/DetailsScreen';
import AdminJobDetailsScreen from '../screens/admin/AdminJobDetailsScreen';
import AdminNotificationsScreen from '../screens/admin/AdminNotificationsScreen';
import CustomerBookingDetailsScreen from '../screens/customer/CustomerBookingDetailsScreen';

// Contractor Onboarding
import OnboardingIntroScreen from '../screens/contractor/OnboardingIntroScreen';
import ProfileSetupScreen from '../screens/contractor/ProfileSetupScreen';
import DocumentUploadScreen from '../screens/contractor/DocumentUploadScreen';
import BankLinkScreen from '../screens/contractor/BankLinkScreen';
import ReviewScreen from '../screens/contractor/ReviewScreen';
import PendingApprovalScreen from '../screens/contractor/PendingApprovalScreen';

// Contractor Job Screens
import ContractorJobsScreen from '../screens/contractor/ContractorJobsScreen';
import StartJobScreen from '../screens/contractor/StartJobScreen';
import FinishJobScreen from '../screens/contractor/FinishJobScreen';
import ProviderUpdateProfileScreen from '../screens/contractor/ProviderUpdateProfileScreen';

// Customer Screens
import JobReportScreen from '../screens/customer/JobReportScreen';
import UpdateProfileScreen from '../screens/customer/UpdateProfileScreen';
import CreateBookingScreen from '../screens/customer/CreateBookingScreen';
import BookingSuccessScreen from '../screens/customer/BookingSuccessScreen';
import SettingsScreen from '../screens/customer/SettingsScreen';
import HelpSupportScreen from '../screens/customer/HelpSupportScreen';
import ChangePasswordScreen from '../screens/customer/ChangePasswordScreen';
import SavedAddressesScreen from '../screens/customer/SavedAddressesScreen';
import InvoicesScreen from '../screens/customer/InvoicesScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import ChatScreen from '../screens/ChatScreen';


const Stack = createNativeStackNavigator();

const RootNavigator = () => {
    const { user, loading } = useAuth();

    React.useEffect(() => {
        if (user) {
            console.log('🛡️ [RootNavigator] User State:', {
                id: user.id,
                role: user.role,
                onboarding_completed: user.onboarding_completed,
                status: user.status
            });
        }
    }, [user]);

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
                    {(user.role === 'provider' && Number(user.onboarding_completed) !== 1) ? (
                        <>
                            <Stack.Screen name="ProviderOnboarding" component={OnboardingIntroScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="BankLink" component={BankLinkScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="Review" component={ReviewScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="Main" component={ProviderDrawerNavigator} options={{ headerShown: false }} />
                        </>
                    ) : user.role === 'provider' && user.status === 'pending' ? (
                        <>
                            <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="Main" component={ProviderDrawerNavigator} options={{ headerShown: false }} />
                        </>
                    ) : (
                        <>
                            {user.role === 'admin' ? (
                                <Stack.Screen name="Main" component={AdminDrawerNavigator} options={{ headerShown: false }} />
                            ) : user.role === 'provider' ? (
                                <Stack.Screen name="Main" component={ProviderDrawerNavigator} options={{ headerShown: false }} />
                            ) : (
                                <Stack.Screen name="Main" component={BottomTabNavigator} options={{ headerShown: false }} />
                            )}
                            <Stack.Screen name="AdminJobDetails" component={AdminJobDetailsScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="CustomerBookingDetails" component={CustomerBookingDetailsScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="Details" component={DetailsScreen} />
                            <Stack.Screen name="UpdateProfile" component={UpdateProfileScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="ProviderUpdateProfile" component={ProviderUpdateProfileScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="SavedAddresses" component={SavedAddressesScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="Invoices" component={InvoicesScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="CreateBooking" component={CreateBookingScreen} options={{ title: 'Book Service' }} />
                            <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} options={{ headerShown: false }} />

                            {/* Contractor Onboarding (Still registered for deep links or manual re-entry if allowed) */}
                            <Stack.Screen name="ProviderOnboarding" component={OnboardingIntroScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="BankLink" component={BankLinkScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="Review" component={ReviewScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} options={{ headerShown: false }} />
                        </>
                    )}

                    {/* Contractor Job Flow */}
                    <Stack.Screen name="ContractorJobs" component={ContractorJobsScreen} options={{ title: 'Jobs' }} />
                    <Stack.Screen name="StartJob" component={StartJobScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="FinishJob" component={FinishJobScreen} options={{ headerShown: false }} />

                    <Stack.Screen name="JobReport" component={JobReportScreen} options={{ title: 'Job Report' }} />

                    {/* Chat Screen - accessible by both Customer and Provider */}
                    <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />

                </>
            ) : (
                <>
                    <Stack.Screen name="AuthChoice" component={AuthChoiceScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="ProviderSignup" component={ProviderSignupScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="CustomerSignup" component={CustomerSignupScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerShown: false }} />
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
