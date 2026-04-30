// import React, { useEffect, useRef } from 'react';
// import { View, ActivityIndicator, StyleSheet } from 'react-native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { useAuth } from '../context/AuthContext';

// // Auth screens
// import AuthChoiceScreen from '../screens/auth/AuthChoiceScreen';
// import LoginScreen from '../screens/auth/LoginScreen';
// import ProviderSignupScreen from '../screens/auth/ProviderSignupScreen';
// import CustomerSignupScreen from '../screens/auth/CustomerSignupScreen';
// import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
// import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
// import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
// import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';
// import WelcomeScreen from '../screens/auth/WelcomeScreen';

// // Main navigators
// import BottomTabNavigator from './BottomTabNavigator';
// import AdminDrawerNavigator from './AdminDrawerNavigator';
// import ProviderDrawerNavigator from './ProviderDrawerNavigator';

// // Shared screens
// import DetailsScreen from '../screens/DetailsScreen';
// import AdminJobDetailsScreen from '../screens/admin/AdminJobDetailsScreen';
// import AdminNotificationsScreen from '../screens/admin/AdminNotificationsScreen';
// import CustomerBookingDetailsScreen from '../screens/customer/CustomerBookingDetailsScreen';
// import ChatScreen from '../screens/ChatScreen';
// import LegalScreen from '../screens/LegalScreen';
// import DataDeletionScreen from '../screens/DataDeletionScreen';
// import NotificationSettingsScreen from '../screens/settings/NotificationSettingsScreen';

// // Provider onboarding
// import OnboardingIntroScreen from '../screens/contractor/OnboardingIntroScreen';
// import ProfileSetupScreen from '../screens/contractor/ProfileSetupScreen';
// import DocumentUploadScreen from '../screens/contractor/DocumentUploadScreen';
// import BankLinkScreen from '../screens/contractor/BankLinkScreen';
// import ReviewScreen from '../screens/contractor/ReviewScreen';
// import PendingApprovalScreen from '../screens/contractor/PendingApprovalScreen';
// import RejectedScreen from '../screens/contractor/RejectedScreen';
// import ProviderUpdateProfileScreen from '../screens/contractor/ProviderUpdateProfileScreen';

// // Provider job screens
// import ContractorJobsScreen from '../screens/contractor/ContractorJobsScreen';
// import JobDetailsScreen from '../screens/contractor/JobDetailsScreen';
// import MyJobsScreen from '../screens/contractor/MyJobsScreen';
// import StartJobScreen from '../screens/contractor/StartJobScreen';
// import FinishJobScreen from '../screens/contractor/FinishJobScreen';

// // Customer screens
// import JobReportScreen from '../screens/customer/JobReportScreen';
// import UpdateProfileScreen from '../screens/customer/UpdateProfileScreen';
// import CreateBookingScreen from '../screens/customer/CreateBookingScreen';
// import BookingSuccessScreen from '../screens/customer/BookingSuccessScreen';
// import SettingsScreen from '../screens/customer/SettingsScreen';
// import HelpSupportScreen from '../screens/customer/HelpSupportScreen';
// import ChangePasswordScreen from '../screens/customer/ChangePasswordScreen';
// import InvoicesScreen from '../screens/customer/InvoicesScreen';

// const Stack = createNativeStackNavigator();

// // ─────────────────────────────────────────────────────────────────────────────
// // resolveProviderScreen — mirrors web ProviderLayout checkAuth() exactly
// //
// // Web logic (in order):
// //   1. status === 'rejected'                        → /provider/rejected
// //   2. !email_verified && status !== 'active'       → /provider/verify-email-pending
// //   3. status === 'active'                          → /provider/dashboard (Main)
// //   4. !onboarding_completed                        → /provider/onboarding (resume step)
// //   5. onboarding_completed && status !== 'active'
// //        !documents_uploaded                        → /provider/onboarding?step=2  (re-upload)
// //        documents_uploaded                         → /provider/pending
// // ─────────────────────────────────────────────────────────────────────────────
// const resolveProviderScreen = (user) => {
//     // 1. Rejected
//     if (user.status === 'rejected') {
//         console.log('🔴 [Nav] rejected → RejectedScreen');
//         return { screen: 'Rejected', params: {} };
//     }

//     // 2. Email not verified
//     if (!user.email_verified && user.status !== 'active') {
//         console.log('🟡 [Nav] email unverified → EmailVerificationPending');
//         return { screen: 'EmailVerificationPending', params: {} };
//     }

//     // 3. Active — go straight to dashboard
//     if (user.status === 'active') {
//         console.log('🟢 [Nav] active → Main');
//         return { screen: 'Main', params: {} };
//     }

//     // 4. Onboarding not complete — resume from DB step
//     if (Number(user.onboarding_completed) !== 1) {
//         const step = Number(user.onboarding_step) || 1;
//         console.log('🔵 [Nav] onboarding incomplete, step:', step);
//         // Web maps DB step to URL step:
//         //   step 1 = intro / profile  → ProfileSetup (Intro auto-redirects to ProfileSetup)
//         //   step 2 = profile done     → DocumentUpload
//         //   step 3 = docs done        → BankLink
//         //   step 4 = bank done        → Review
//         if (step >= 4) return { screen: 'Review',             params: {} };
//         if (step >= 3) return { screen: 'BankLink',           params: {} };
//         if (step >= 2) return { screen: 'DocumentUpload',     params: {} };
//         return               { screen: 'ProviderOnboarding',  params: {} }; // intro (step 1)
//     }

//     // 5. Onboarding complete but not active yet
//     if (Number(user.documents_uploaded) !== 1) {
//         // Admin reset documents_uploaded = 0 → must re-upload
//         console.log('🟠 [Nav] docs reset → DocumentUpload (entry point)');
//         return { screen: 'DocumentUpload', params: { isEntryPoint: true } };
//     }

//     // Docs uploaded, waiting for admin review
//     console.log('🟡 [Nav] pending approval → PendingApproval');
//     return { screen: 'PendingApproval', params: {} };
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // RootNavigator
// // ─────────────────────────────────────────────────────────────────────────────
// const RootNavigator = () => {
//     const { user, loading } = useAuth();

//     useEffect(() => {
//         if (user) {
//             console.log('🛡️ [RootNavigator] user changed:', {
//                 role: user.role,
//                 status: user.status,
//                 email_verified: user.email_verified,
//                 onboarding_completed: user.onboarding_completed,
//                 onboarding_step: user.onboarding_step,
//                 documents_uploaded: user.documents_uploaded,
//                 stripe_onboarding_complete: user.stripe_onboarding_complete,
//             });
//         }
//     }, [user]);

//     if (loading) {
//         return (
//             <View style={styles.loader}>
//                 <ActivityIndicator size="large" color="#15843E" />
//             </View>
//         );
//     }

//     // ── Unauthenticated ──────────────────────────────────────────────────────
//     if (!user) {
//         return (
//             <Stack.Navigator screenOptions={{ headerShown: false }}>
//                 <Stack.Screen name="Welcome"           component={WelcomeScreen} />
//                 <Stack.Screen name="AuthChoice"        component={AuthChoiceScreen} />
//                 <Stack.Screen name="Login"             component={LoginScreen} />
//                 <Stack.Screen name="ProviderSignup"    component={ProviderSignupScreen} />
//                 <Stack.Screen name="CustomerSignup"    component={CustomerSignupScreen} />
//                 <Stack.Screen name="ForgotPassword"    component={ForgotPasswordScreen} />
//                 <Stack.Screen name="OtpVerification"   component={OtpVerificationScreen} />
//                 <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
//                 <Stack.Screen name="ResetPassword"     component={ResetPasswordScreen} />
//             </Stack.Navigator>
//         );
//     }

//     // ── Admin ────────────────────────────────────────────────────────────────
//     if (user.role === 'admin') {
//         return (
//             <Stack.Navigator screenOptions={{ headerShown: false }}>
//                 <Stack.Screen name="Main"               component={AdminDrawerNavigator} />
//                 <Stack.Screen name="AdminJobDetails"    component={AdminJobDetailsScreen} />
//                 <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
//                 <Stack.Screen name="Chat"               component={ChatScreen} />
//             </Stack.Navigator>
//         );
//     }

//     // ── Customer ─────────────────────────────────────────────────────────────
//     if (user.role === 'customer') {
//         return (
//             <Stack.Navigator
//                 screenOptions={{
//                     headerStyle: { backgroundColor: '#15843E' },
//                     headerTintColor: '#fff',
//                     headerTitleStyle: { fontWeight: 'bold' },
//                 }}
//             >
//                 <Stack.Screen name="Main"                   component={BottomTabNavigator}          options={{ headerShown: false }} />
//                 <Stack.Screen name="CreateBooking"          component={CreateBookingScreen}         options={{ title: 'Book Service' }} />
//                 <Stack.Screen name="BookingSuccess"         component={BookingSuccessScreen}        options={{ headerShown: false }} />
//                 <Stack.Screen name="CustomerBookingDetails" component={CustomerBookingDetailsScreen} options={{ headerShown: false }} />
//                 <Stack.Screen name="JobReport"              component={JobReportScreen}             options={{ title: 'Job Report' }} />
//                 <Stack.Screen name="UpdateProfile"          component={UpdateProfileScreen}         options={{ headerShown: false }} />
//                 <Stack.Screen name="Settings"               component={SettingsScreen}              options={{ headerShown: false }} />
//                 <Stack.Screen name="NotificationSettings"   component={NotificationSettingsScreen}  options={{ headerShown: false }} />
//                 <Stack.Screen name="HelpSupport"            component={HelpSupportScreen}           options={{ headerShown: false }} />
//                 <Stack.Screen name="ChangePassword"         component={ChangePasswordScreen}        options={{ headerShown: false }} />
//                 <Stack.Screen name="Invoices"               component={InvoicesScreen}              options={{ headerShown: false }} />
//                 <Stack.Screen name="Legal"                  component={LegalScreen}                 options={{ headerShown: false }} />
//                 <Stack.Screen name="DataDeletion"           component={DataDeletionScreen}          options={{ headerShown: false }} />
//                 <Stack.Screen name="Chat"                   component={ChatScreen}                  options={{ headerShown: false }} />
//                 <Stack.Screen name="Details"                component={DetailsScreen} />
//             </Stack.Navigator>
//         );
//     }

//     // ── Provider ─────────────────────────────────────────────────────────────
//     // resolveProviderScreen() is called on every render — so whenever AuthContext
//     // calls updateUser() (e.g. status: 'pending' → 'active'), React re-renders
//     // this component, resolveProviderScreen returns 'Main', and initialRouteName
//     // changes. Because we return a *new* Stack.Navigator instance when the initial
//     // screen changes (key prop forces remount), the stack resets cleanly to the
//     // correct first screen — identical to web's router.replace() behaviour.
//     const { screen: initialScreen, params: initialParams } = resolveProviderScreen(user);

//     return (
//         // key = initialScreen forces the navigator to fully remount when the
//         // resolved screen changes (e.g. PendingApproval → Main after approval).
//         // This mirrors web's router.replace() — no stale history, clean stack.
//         <Stack.Navigator
//             key={initialScreen}
//             initialRouteName={initialScreen}
//             screenOptions={{
//                 headerStyle: { backgroundColor: '#15843E' },
//                 headerTintColor: '#fff',
//                 headerTitleStyle: { fontWeight: 'bold' },
//             }}
//         >
//             {/* ── Onboarding screens ───────────────────────────────────── */}
//             <Stack.Screen
//                 name="ProviderOnboarding"
//                 component={OnboardingIntroScreen}
//                 options={{ headerShown: false }}
//             />
//             <Stack.Screen
//                 name="ProfileSetup"
//                 component={ProfileSetupScreen}
//                 options={{ headerShown: false }}
//             />
//             <Stack.Screen
//                 name="DocumentUpload"
//                 component={DocumentUploadScreen}
//                 // Pass isEntryPoint when this IS the initial screen and admin reset docs
//                 initialParams={initialScreen === 'DocumentUpload' ? initialParams : undefined}
//                 options={{ headerShown: false }}
//             />
//             <Stack.Screen
//                 name="BankLink"
//                 component={BankLinkScreen}
//                 options={{ headerShown: false }}
//             />
//             <Stack.Screen
//                 name="Review"
//                 component={ReviewScreen}
//                 options={{ headerShown: false }}
//             />

//             {/* ── Status / gate screens ─────────────────────────────────── */}
//             <Stack.Screen
//                 name="PendingApproval"
//                 component={PendingApprovalScreen}
//                 options={{ headerShown: false }}
//             />
//             <Stack.Screen
//                 name="Rejected"
//                 component={RejectedScreen}
//                 options={{ headerShown: false }}
//             />
//             <Stack.Screen
//                 name="EmailVerificationPending"
//                 component={EmailVerificationScreen}
//                 options={{ headerShown: false }}
//             />

//             {/* ── Main app (active provider) ────────────────────────────── */}
//             <Stack.Screen
//                 name="Main"
//                 component={ProviderDrawerNavigator}
//                 options={{ headerShown: false }}
//             />

//             {/* ── Provider job & profile screens ────────────────────────── */}
//             <Stack.Screen name="MyJobs"                component={MyJobsScreen}                options={{ headerShown: false }} />
//             <Stack.Screen name="JobDetails"            component={JobDetailsScreen}            options={{ headerShown: false }} />
//             <Stack.Screen name="StartJob"              component={StartJobScreen}              options={{ headerShown: false }} />
//             <Stack.Screen name="FinishJob"             component={FinishJobScreen}             options={{ headerShown: false }} />
//             <Stack.Screen name="JobReport"             component={JobReportScreen}             options={{ title: 'Job Report' }} />
//             <Stack.Screen name="ProviderUpdateProfile" component={ProviderUpdateProfileScreen} options={{ headerShown: false }} />

//             {/* ── Shared screens (also needed inside provider app) ──────── */}
//             <Stack.Screen name="AdminJobDetails"        component={AdminJobDetailsScreen}        options={{ headerShown: false }} />
//             <Stack.Screen name="AdminNotifications"     component={AdminNotificationsScreen}     options={{ headerShown: false }} />
//             <Stack.Screen name="CustomerBookingDetails" component={CustomerBookingDetailsScreen} options={{ headerShown: false }} />
//             <Stack.Screen name="UpdateProfile"          component={UpdateProfileScreen}          options={{ headerShown: false }} />
//             <Stack.Screen name="Settings"               component={SettingsScreen}               options={{ headerShown: false }} />
//             <Stack.Screen name="NotificationSettings"   component={NotificationSettingsScreen}   options={{ headerShown: false }} />
//             <Stack.Screen name="HelpSupport"            component={HelpSupportScreen}            options={{ headerShown: false }} />
//             <Stack.Screen name="ChangePassword"         component={ChangePasswordScreen}         options={{ headerShown: false }} />
//             <Stack.Screen name="Invoices"               component={InvoicesScreen}               options={{ headerShown: false }} />
//             <Stack.Screen name="Legal"                  component={LegalScreen}                  options={{ headerShown: false }} />
//             <Stack.Screen name="DataDeletion"           component={DataDeletionScreen}           options={{ headerShown: false }} />
//             <Stack.Screen name="Chat"                   component={ChatScreen}                   options={{ headerShown: false }} />
//             <Stack.Screen name="Details"                component={DetailsScreen} />
//         </Stack.Navigator>
//     );
// };

// const styles = StyleSheet.create({
//     loader: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: '#fff',
//     },
// });

// export default RootNavigator;













import React, { useEffect, useRef } from 'react';
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
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import GuestPlaceholderScreen from '../screens/auth/GuestPlaceholderScreen';

// Main navigators
import BottomTabNavigator from './BottomTabNavigator';
import AdminDrawerNavigator from './AdminDrawerNavigator';
import ProviderDrawerNavigator from './ProviderDrawerNavigator';

// Shared screens
import DetailsScreen from '../screens/DetailsScreen';
import AdminJobDetailsScreen from '../screens/admin/AdminJobDetailsScreen';
import AdminNotificationsScreen from '../screens/admin/AdminNotificationsScreen';
import CustomerBookingDetailsScreen from '../screens/customer/CustomerBookingDetailsScreen';
import ChatScreen from '../screens/ChatScreen';
import LegalScreen from '../screens/LegalScreen';
import DataDeletionScreen from '../screens/DataDeletionScreen';
import NotificationSettingsScreen from '../screens/settings/NotificationSettingsScreen';

// Provider onboarding
import OnboardingIntroScreen from '../screens/contractor/OnboardingIntroScreen';
import ProfileSetupScreen from '../screens/contractor/ProfileSetupScreen';
import DocumentUploadScreen from '../screens/contractor/DocumentUploadScreen';
import BankLinkScreen from '../screens/contractor/BankLinkScreen';
import ReviewScreen from '../screens/contractor/ReviewScreen';
import PendingApprovalScreen from '../screens/contractor/PendingApprovalScreen';
import RejectedScreen from '../screens/contractor/RejectedScreen';
import ProviderUpdateProfileScreen from '../screens/contractor/ProviderUpdateProfileScreen';

// Provider job screens
import ContractorJobsScreen from '../screens/contractor/ContractorJobsScreen';
import JobDetailsScreen from '../screens/contractor/JobDetailsScreen';
import MyJobsScreen from '../screens/contractor/MyJobsScreen';
import StartJobScreen from '../screens/contractor/StartJobScreen';
import FinishJobScreen from '../screens/contractor/FinishJobScreen';

// Customer screens
import JobReportScreen from '../screens/customer/JobReportScreen';
import UpdateProfileScreen from '../screens/customer/UpdateProfileScreen';
import CreateBookingScreen from '../screens/customer/CreateBookingScreen';
import BookingSuccessScreen from '../screens/customer/BookingSuccessScreen';
import SettingsScreen from '../screens/customer/SettingsScreen';
import HelpSupportScreen from '../screens/customer/HelpSupportScreen';
import ChangePasswordScreen from '../screens/customer/ChangePasswordScreen';
import InvoicesScreen from '../screens/customer/InvoicesScreen';

const Stack = createNativeStackNavigator();

// ─────────────────────────────────────────────────────────────────────────────
// resolveProviderScreen
//
// RULE: Provider can NEVER access Main (dashboard) unless status === 'active'.
//       Every other state has a hard redirect.
//
// Order of checks:
//   1. rejected                                     → RejectedScreen
//   2. email not verified                           → EmailVerificationPending
//   3. status !== 'active'  (pending/inactive/etc)
//        !onboarding_completed                      → resume onboarding step
//        onboarding_completed && !documents_uploaded→ DocumentUpload (re-upload)
//        onboarding_completed && documents_uploaded → PendingApproval
//   4. status === 'active'                          → Main (dashboard) ✅ ONLY HERE
// ─────────────────────────────────────────────────────────────────────────────
const resolveProviderScreen = (user) => {
    console.log('🔍 [resolveProviderScreen] Checking user status/onboarding:', {
        status: user.status,
        onboarding_completed: user.onboarding_completed,
        documents_uploaded: user.documents_uploaded
    });

    // 1. Rejected — hard stop
    if (user.status === 'rejected') {
        console.log('🔴 [Nav] rejected → RejectedScreen');
        return { screen: 'Rejected', params: {} };
    }

    // 2. Email not verified — hard stop
    if (!user.email_verified && user.status !== 'active') {
        console.log('🟡 [Nav] email unverified → EmailVerificationPending');
        return { screen: 'EmailVerificationPending', params: {} };
    }

    // 3. Onboarding check — CRITICAL for new providers
    // If onboarding_completed is 0, false, null, undefined, or "0", they MUST go to onboarding.
    const onboardingComplete = user.onboarding_completed == 1 || user.onboarding_completed === true;
    
    if (!onboardingComplete) {
        console.log('🔵 [Nav] onboarding incomplete → OnboardingIntro');
        return { screen: 'OnboardingIntro', params: {} };
    }

    // 4. status === 'active' — Grant dashboard access ONLY if onboarding is finished
    if (user.status === 'active') {
        console.log('🟢 [Nav] active → Main');
        return { screen: 'Main', params: {} };
    }

    // 5. Onboarding complete but not active yet (pending or documents reset)
    if (user.documents_uploaded == 0 || user.documents_uploaded === false) {
        console.log('🟠 [Nav] docs missing/reset → DocumentUpload');
        return { screen: 'DocumentUpload', params: { isEntryPoint: true } };
    }

    // Docs uploaded, waiting for admin approval
    console.log('🟡 [Nav] pending approval → PendingApproval');
    return { screen: 'PendingApproval', params: {} };
};



// ─────────────────────────────────────────────────────────────────────────────
// RootNavigator
// ─────────────────────────────────────────────────────────────────────────────
const RootNavigator = () => {
    const { user, loading } = useAuth();

    useEffect(() => {
        if (user) {
            console.log('🛡️ [RootNavigator] Session Active:', {
                id: user.id || 'no-id',
                role: user.role,
                status: user.status,
                onboarding: user.onboarding_completed,
            });
        } else {
            console.log('🛡️ [RootNavigator] Guest Mode');
        }
    }, [user]);

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#15843E" />
            </View>
        );
    }

    // ── Admin ────────────────────────────────────────────────────────────────
    if (user?.role === 'admin') {
        return (
            <Stack.Navigator
                key={`admin-${user.id || 'primary'}`}
                initialRouteName="Main"
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name="Main" component={AdminDrawerNavigator} />
                <Stack.Screen name="AdminJobDetails" component={AdminJobDetailsScreen} />
                <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
                <Stack.Screen name="Chat" component={ChatScreen} />
            </Stack.Navigator>
        );
    }

    // ── Provider ─────────────────────────────────────────────────────────────
    if (user?.role === 'provider' || user?.role === 'pro') {
        const { screen: initialScreen, params: initialParams } = resolveProviderScreen(user);

        return (
            <Stack.Navigator
                key={initialScreen}
                initialRouteName={initialScreen}
                screenOptions={{
                    headerStyle: { backgroundColor: '#15843E' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            >
                {/* ── Onboarding screens ───────────────────────────────────── */}
                <Stack.Screen
                    name="OnboardingIntro"
                    component={OnboardingIntroScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="ProfileSetup"
                    component={ProfileSetupScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="DocumentUpload"
                    component={DocumentUploadScreen}
                    initialParams={initialScreen === 'DocumentUpload' ? initialParams : undefined}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="BankLink"
                    component={BankLinkScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Review"
                    component={ReviewScreen}
                    options={{ headerShown: false }}
                />

                {/* ── Status / gate screens ─────────────────────────────────── */}
                <Stack.Screen
                    name="PendingApproval"
                    component={PendingApprovalScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Rejected"
                    component={RejectedScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="EmailVerificationPending"
                    component={EmailVerificationScreen}
                    options={{ headerShown: false }}
                />

                {/* ── Main app (active provider ONLY) ──────────────────────── */}
                <Stack.Screen
                    name="Main"
                    component={ProviderDrawerNavigator}
                    options={{ headerShown: false }}
                />

                {/* ── Provider job & profile screens ────────────────────────── */}
                <Stack.Screen name="MyJobs" component={MyJobsScreen} options={{ headerShown: false }} />
                <Stack.Screen name="JobDetails" component={JobDetailsScreen} options={{ headerShown: false }} />
                <Stack.Screen name="StartJob" component={StartJobScreen} options={{ headerShown: false }} />
                <Stack.Screen name="FinishJob" component={FinishJobScreen} options={{ headerShown: false }} />
                <Stack.Screen name="JobReport" component={JobReportScreen} options={{ title: 'Job Report' }} />
                <Stack.Screen name="ProviderUpdateProfile" component={ProviderUpdateProfileScreen} options={{ headerShown: false }} />

                {/* ── Shared screens ────────────────────────────────────────── */}
                <Stack.Screen name="AdminJobDetails" component={AdminJobDetailsScreen} options={{ headerShown: false }} />
                <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} options={{ headerShown: false }} />
                <Stack.Screen name="CustomerBookingDetails" component={CustomerBookingDetailsScreen} options={{ headerShown: false }} />
                <Stack.Screen name="UpdateProfile" component={UpdateProfileScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
                <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ headerShown: false }} />
                <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ headerShown: false }} />
                <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Invoices" component={InvoicesScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Legal" component={LegalScreen} options={{ headerShown: false }} />
                <Stack.Screen name="DataDeletion" component={DataDeletionScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Details" component={DetailsScreen} />
            </Stack.Navigator>
        );
    }

    // ── Customer / Guest ─────────────────────────────────────────────────────
    const stackKey = user ? `auth-customer-${user.id}` : 'guest';
    console.log(`🛡️ [RootNavigator] Mounting stack with key: ${stackKey}`);

    return (
        <Stack.Navigator
            key={stackKey}
            initialRouteName="Main"
            screenOptions={{
                headerStyle: { backgroundColor: '#115e59' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            <Stack.Screen name="Main" component={BottomTabNavigator} options={{ headerShown: false }} />

            {/* Auth flow (now accessible from everywhere) */}
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AuthChoice" component={AuthChoiceScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ProviderSignup" component={ProviderSignupScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CustomerSignup" component={CustomerSignupScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
            <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} options={{ headerShown: false }} />
            <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerShown: false }} />

            {/* Customer internal screens */}
            <Stack.Screen name="CreateBooking" component={CreateBookingScreen} options={{ title: 'Book Service' }} />
            <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CustomerBookingDetails" component={CustomerBookingDetailsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="JobReport" component={JobReportScreen} options={{ title: 'Job Report' }} />
            <Stack.Screen name="UpdateProfile" component={UpdateProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Invoices" component={InvoicesScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Legal" component={LegalScreen} options={{ headerShown: false }} />
            <Stack.Screen name="DataDeletion" component={DataDeletionScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Details" component={DetailsScreen} />
            <Stack.Screen name="GuestPlaceholder" component={GuestPlaceholderScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});

export default RootNavigator;