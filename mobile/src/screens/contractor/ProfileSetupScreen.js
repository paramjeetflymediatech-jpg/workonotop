import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, SafeAreaView, Alert, ActivityIndicator,
    Platform, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale, verticalScale, scale } from '../../utils/responsive';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PremiumAlert from '../../components/PremiumAlert';

const SERVICE_AREAS = [
    'Toronto', 'North York', 'Scarborough', 'Etobicoke', 'East York', 'York',
    'Mississauga', 'Brampton', 'Vaughan', 'Markham', 'Richmond Hill',
    'Aurora', 'Newmarket', 'King', 'East Gwillimbury', 'Georgina',
    'Whitchurch-Stouffville', 'Oakville', 'Burlington', 'Halton Hills',
    'Milton', 'Caledon', 'Pickering', 'Ajax', 'Whitby', 'Oshawa'
];

const SKILLS = [
    'Cleaning (regular, deep, move out)',
    'Exterior cleaning (pressure washing, gutters, windows)',
    'Handyman',
    'Furniture assembly',
    'Movers',
    'Junk removal',
    'Yard work',
    'Carpet wash'
];

const ProfileSetupScreen = ({ navigation }) => {
    const [profile, setProfile] = useState({
        bio: '',
        primarySpecialty: '',
        yearsExperience: '',
        businessAddress: '',
        city: '',
        serviceAreas: [],
        skills: []
    });
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'error' });
    const { token, updateUser } = useAuth();

    const showPremiumAlert = (message, title = '', type = 'error') => {
        setAlert({ visible: true, title, message, type });
    };

    const toggleSelection = (key, value) => {
        setProfile(prev => {
            const current = prev[key];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [key]: updated };
        });
    };

    const handleNext = async () => {
        const { bio, primarySpecialty, yearsExperience, businessAddress, city, serviceAreas, skills } = profile;

        // 1. Basic empty check
        if (!bio || !primarySpecialty || !yearsExperience || !businessAddress || !city) {
            showPremiumAlert('Please fill in all required fields.', 'Missing Info');
            return;
        }

        // 2. Bio length validation (50-500)
        const bioLength = bio.trim().length;
        if (bioLength < 50) {
            showPremiumAlert(`Professional bio must be at least 50 characters. Current: ${bioLength}`, 'Invalid Bio');
            return;
        }

        // 3. Experience range validation (0-50)
        const exp = Number(yearsExperience);
        if (isNaN(exp) || exp < 0 || exp > 50) {
            showPremiumAlert('Years of experience must be between 0 and 50.', 'Invalid Experience');
            return;
        }

        // 4. Service Areas (at least one)
        if (serviceAreas.length === 0) {
            showPremiumAlert('Please select at least one service area.', 'Service Areas');
            return;
        }

        // 5. Skills (at least one)
        if (skills.length === 0) {
            showPremiumAlert('Please select at least one skill.', 'Skills');
            return;
        }

        setLoading(true);
        try {
            const data = {
                bio: bio.trim(),
                specialty: primarySpecialty,
                experience_years: exp,
                location: businessAddress,
                city: city,
                service_areas: serviceAreas,
                skills: skills
            };

            const response = await apiService.provider.onboarding.updateProfile(data, token);

            if (response.success) {
                // Update local user state so RootNavigator/IntroScreen knows we've progressed
                await updateUser({ onboarding_step: 2 });
                navigation.navigate('DocumentUpload', {
                    profile: { ...profile, ...data }
                });
            } else {
                showPremiumAlert(response.message || 'Failed to save profile. Please try again.');
            }
        } catch (error) {
            console.error('Profile save error:', error);
            showPremiumAlert('Connection error. Please check your internet.');
        } finally {
            setLoading(false);
        }
    };

    const Stepper = () => (
        <View style={styles.stepperContainer}>
            <View style={styles.stepGroup}>
                <View style={[styles.stepCircle, styles.stepActive]}>
                    <Text style={styles.stepTextActive}>1</Text>
                </View>
                <Text style={styles.stepLabelActive}>Profile</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepGroup}>
                <View style={styles.stepCircle}>
                    <Text style={styles.stepText}>2</Text>
                </View>
                <Text style={styles.stepLabel}>Documents</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepGroup}>
                <View style={styles.stepCircle}>
                    <Text style={styles.stepText}>3</Text>
                </View>
                <Text style={styles.stepLabel}>Payment</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepGroup}>
                <View style={styles.stepCircle}>
                    <Text style={styles.stepText}>4</Text>
                </View>
                <Text style={styles.stepLabel}>Review</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <Stepper />

                <View style={styles.contentCard}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={moderateScale(24)} color="#1e293b" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Profile Setup</Text>
                        <View style={{ width: moderateScale(40) }} />
                    </View>

                    {/* Bio */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Professional Bio <Text style={styles.req}>*</Text></Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            multiline
                            maxLength={500}
                            placeholder="Tell us about your experience..."
                            placeholderTextColor="#94a3b8"
                            value={profile.bio}
                            onChangeText={(t) => setProfile({ ...profile, bio: t })}
                        />
                        <Text style={styles.charCount}>{profile.bio.length}/500 characters</Text>
                    </View>

                    {/* Specialty & Experience */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: scale(10) }]}>
                            <Text style={styles.label}>Primary Specialty <Text style={styles.req}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="plumber"
                                placeholderTextColor="#94a3b8"
                                value={profile.primarySpecialty}
                                onChangeText={(t) => setProfile({ ...profile, primarySpecialty: t })}
                            />
                        </View>
                        <View style={[styles.inputGroup, { width: scale(150) }]}>
                            <Text style={styles.label}>Experience <Text style={styles.req}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0-10"
                                placeholderTextColor="#94a3b8"
                                keyboardType="numeric"
                                value={profile.yearsExperience}
                                onChangeText={(t) => setProfile({ ...profile, yearsExperience: t })}
                            />
                        </View>
                    </View>

                    {/* Business Address */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Business Address <Text style={styles.req}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="123 Main St"
                            placeholderTextColor="#94a3b8"
                            value={profile.businessAddress}
                            onChangeText={(t) => setProfile({ ...profile, businessAddress: t })}
                        />
                    </View>

                    {/* City */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>City <Text style={styles.req}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Toronto"
                            placeholderTextColor="#94a3b8"
                            value={profile.city}
                            onChangeText={(t) => setProfile({ ...profile, city: t })}
                        />
                        <Text style={styles.inputHint}>Enter the city where your business is located - this helps customers find you in local searches</Text>
                    </View>

                    {/* Service Areas */}
                    <View style={styles.selectionSection}>
                        <Text style={styles.label}>Service Areas <Text style={styles.req}>*</Text></Text>
                        <View style={styles.checkboxGrid}>
                            {SERVICE_AREAS.map(area => {
                                const isSelected = profile.serviceAreas.includes(area);
                                return (
                                    <TouchableOpacity
                                        key={area}
                                        style={[
                                            styles.checkboxItem,
                                            isSelected && styles.checkboxItemActive
                                        ]}
                                        onPress={() => toggleSelection('serviceAreas', area)}
                                    >
                                        <View style={styles.checkboxRow}>
                                            <Ionicons
                                                name={isSelected ? "checkbox" : "square-outline"}
                                                size={moderateScale(22)}
                                                color={isSelected ? "#0d9488" : "#94a3b8"}
                                            />
                                            <Text style={[
                                                styles.checkboxLabel,
                                                isSelected && styles.checkboxLabelActive
                                            ]}>{area}</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Skills */}
                    <View style={styles.selectionSection}>
                        <Text style={styles.label}>Skills <Text style={styles.req}>*</Text></Text>
                        <View style={styles.checkboxGrid}>
                            {SKILLS.map(skill => {
                                const isSelected = profile.skills.includes(skill);
                                return (
                                    <TouchableOpacity
                                        key={skill}
                                        style={[
                                            styles.checkboxItem,
                                            isSelected && styles.checkboxItemActive
                                        ]}
                                        onPress={() => toggleSelection('skills', skill)}
                                    >
                                        <View style={styles.checkboxRow}>
                                            <Ionicons
                                                name={isSelected ? "checkbox" : "square-outline"}
                                                size={moderateScale(22)}
                                                color={isSelected ? "#0d9488" : "#94a3b8"}
                                            />
                                            <Text style={[
                                                styles.checkboxLabel,
                                                isSelected && styles.checkboxLabelActive
                                            ]}>{skill}</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.nextBtn, loading && { opacity: 0.7 }]}
                        onPress={handleNext}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.nextBtnText}>Continue to Documents</Text>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.stepFooter}>Step 1 of 4</Text>
                </View>
            </ScrollView>

            <PremiumAlert
                visible={alert.visible}
                title={alert.title}
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert({ ...alert, visible: false })}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    scroll: { padding: moderateScale(15) },

    /* Stepper */
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(20),
        marginBottom: verticalScale(10),
    },
    stepGroup: { alignItems: 'center', width: scale(70) },
    stepCircle: {
        width: moderateScale(30),
        height: moderateScale(30),
        borderRadius: moderateScale(15),
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(5),
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    stepActive: { backgroundColor: '#0d9488', borderColor: '#0d9488' },
    stepText: { color: '#64748b', fontSize: moderateScale(12), fontWeight: 'bold' },
    stepTextActive: { color: '#fff', fontSize: moderateScale(12), fontWeight: 'bold' },
    stepLabel: { fontSize: moderateScale(10), color: '#64748b' },
    stepLabelActive: { fontSize: moderateScale(10), color: '#0d9488', fontWeight: 'bold' },
    stepLine: { width: scale(40), height: 1, backgroundColor: '#e2e8f0', marginHorizontal: -scale(10), zIndex: -1, alignSelf: 'center', marginTop: -verticalScale(20) },

    /* Content Card */
    contentCard: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(16),
        padding: moderateScale(20),
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: verticalScale(20),
    },
    backButton: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(20),
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#0f172a',
    },
    mainTitle: {
        fontSize: moderateScale(24),
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: verticalScale(20),
        textAlign: 'center',
    },
    inputGroup: { marginBottom: verticalScale(15) },
    row: { flexDirection: 'row', marginBottom: verticalScale(5) },
    label: {
        fontSize: moderateScale(13),
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: verticalScale(8),
    },
    req: { color: '#ef4444' },
    input: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: moderateScale(8),
        padding: moderateScale(12),
        fontSize: moderateScale(14),
        color: '#0f172a',
    },
    textArea: { height: verticalScale(120), textAlignVertical: 'top' },
    charCount: {
        textAlign: 'right',
        fontSize: moderateScale(11),
        color: '#94a3b8',
        marginTop: verticalScale(4),
    },
    inputHint: {
        fontSize: moderateScale(11),
        color: '#94a3b8',
        marginTop: verticalScale(4),
        lineHeight: moderateScale(16),
    },
    selectionSection: { marginBottom: verticalScale(20) },
    checkboxGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    checkboxItem: {
        width: '100%',
        marginBottom: verticalScale(10),
        padding: moderateScale(12),
        borderRadius: moderateScale(10),
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#fff',
    },
    checkboxItemActive: {
        borderColor: '#0d9488',
        backgroundColor: '#f0fdfa',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxLabel: {
        fontSize: moderateScale(13),
        color: '#475569',
        marginLeft: scale(10),
        flex: 1,
    },
    checkboxLabelActive: {
        color: '#0d9488',
        fontWeight: '600',
    },
    nextBtn: {
        backgroundColor: '#0d9488',
        padding: moderateScale(15),
        borderRadius: moderateScale(8),
        alignItems: 'center',
        marginTop: verticalScale(10),
    },
    nextBtnText: { color: '#fff', fontSize: moderateScale(15), fontWeight: 'bold' },
    stepFooter: {
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: moderateScale(12),
        marginTop: verticalScale(20),
    }
});

export default ProfileSetupScreen;
