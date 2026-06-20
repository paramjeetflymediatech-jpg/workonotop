import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform, KeyboardAvoidingView, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import { API_BASE_URL } from '../../config';

const ProviderUpdateProfileScreen = ({ navigation }) => {
    const { user, updateUser, token } = useAuth();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [profileImage, setProfileImage] = useState(null);

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        specialty: '',
        experience_years: '',
        bio: '',
        location: '',
        city: '',
        service_cities: [],
        service_cities_names: [],
        skills: []
    });

    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedState, setSelectedState] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [availableSkills, setAvailableSkills] = useState([]);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            if (!refreshing) setLoading(true);
            // Using /api/provider/me which we verified supports mobile tokens and returns full data
            const res = await apiService.provider.me(token);
            if (res.success && res.provider) {
                const p = res.provider;
                setForm({
                    name: p.name || '',
                    email: p.email || '',
                    phone: p.phone || '',
                    specialty: p.specialty || '',
                    experience_years: p.experience_years ? String(p.experience_years) : '',
                    bio: p.bio || '',
                    location: p.location || '',
                    city: p.city || '',
                    service_cities: (() => {
                        if (!p.service_cities) return [];
                        try {
                            return typeof p.service_cities === 'string' ? JSON.parse(p.service_cities) : p.service_cities;
                        } catch (e) {
                            return [];
                        }
                    })(),
                    service_cities_names: p.service_cities_names || [],
                    skills: (() => {
                        if (!p.skills) return [];
                        try {
                            return typeof p.skills === 'string' ? JSON.parse(p.skills) : p.skills;
                        } catch (e) {
                            return [];
                        }
                    })()
                });
                if (p.avatar_url) {
                    setProfileImage(p.avatar_url.startsWith('http') ? p.avatar_url : `${API_BASE_URL}${p.avatar_url}`);
                }
            } else {
                Alert.alert('Error', res.message || 'Failed to load profile.');
            }
        } catch (error) {
            console.error('Error loading provider profile:', error);
            Alert.alert('Error', 'Failed to load profile.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const fetchStates = async () => {
            try {
                const res = await apiService.get('/api/locations', { type: 'states' }, token);
                if (res.success) setStates(res.data);
            } catch (err) {}
        };
        const fetchSkills = async () => {
            try {
                const res = await apiService.general.getSkills();
                if (res.success) setAvailableSkills(res.data.map(s => s.name));
            } catch (err) {}
        };
        fetchStates();
        fetchSkills();
    }, []);

    useEffect(() => {
        if (!selectedState) {
            setDistricts([]);
            setSelectedDistrict(null);
            return;
        }
        const fetchDistricts = async () => {
            try {
                const res = await apiService.get('/api/locations', { type: 'districts', parentId: selectedState }, token);
                if (res.success) setDistricts(res.data);
            } catch (err) {}
        };
        fetchDistricts();
    }, [selectedState]);

    useEffect(() => {
        if (!selectedDistrict) {
            setCities([]);
            return;
        }
        const fetchCities = async () => {
            try {
                const res = await apiService.get('/api/locations', { type: 'cities', parentId: selectedDistrict }, token);
                if (res.success) setCities(res.data);
            } catch (err) {}
        };
        fetchCities();
    }, [selectedDistrict]);

    const onRefresh = () => {
        setRefreshing(true);
        loadProfile();
    };

    const removeCityByIndex = (idx) => {
        setForm(prev => {
            const arr = [...(prev.service_cities || [])];
            const names = [...(prev.service_cities_names || [])];
            arr.splice(idx, 1);
            names.splice(idx, 1);
            return { ...prev, service_cities: arr, service_cities_names: names };
        });
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
            Alert.alert('Validation Error', 'Full name, email and phone are required.');
            return;
        }

        try {
            setSaving(true);

            let uploadedImageUrl = profileImage;

            // If profileImage is a local file uri (starts with file:// or content://), upload it first
            if (profileImage && (profileImage.startsWith('file://') || profileImage.startsWith('content://'))) {
                const formData = new FormData();
                const filename = profileImage.split('/').pop() || 'profile.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;
                formData.append('file', {
                    uri: profileImage,
                    name: filename,
                    type,
                });

                // Do not use apiService wrappers because we need a custom fetch for multipart to avoid Content-Type header issues on Android
                const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                });
                
                const uploadData = await uploadRes.json();
                if (uploadData.success) {
                    uploadedImageUrl = uploadData.url;
                } else {
                    Alert.alert('Upload Error', uploadData.message || 'Failed to upload profile picture.');
                    setSaving(false);
                    return;
                }
            }

            // We'll use /api/provider (PUT) which supports Bearer tokens as verified in Step 728
            const updateData = {
                name: form.name,
                email: form.email,
                phone: form.phone,
                specialty: form.specialty,
                experience_years: form.experience_years,
                bio: form.bio,
                location: form.location,
                city: form.city,
                service_cities: form.service_cities,
                skills: form.skills,
                avatar_url: uploadedImageUrl?.replace(API_BASE_URL, '') // send relative path
            };

            const res = await apiService.put('/api/provider', updateData, token);

            if (res.success) {
                updateUser({
                    ...user,
                    name: res.data.name,
                    first_name: res.data.name.split(' ')[0], // Compatibility with other screens
                    phone: res.data.phone,
                    image_url: res.data.avatar_url ? (res.data.avatar_url.startsWith('http') ? res.data.avatar_url : `${API_BASE_URL}${res.data.avatar_url}`) : uploadedImageUrl
                });
                Alert.alert('Success', 'Profile updated successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('Error', res.message || 'Failed to update profile.');
            }
        } catch (error) {
            console.error('Error saving provider profile:', error);
            Alert.alert('Error', 'Something went wrong while saving.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#115e59" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color="#0f172a" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Provider Profile</Text>
                    <View style={{ width: moderateScale(40) }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#115e59" />
                    }
                >

                    <View style={styles.imagePickerContainer}>
                        <TouchableOpacity onPress={pickImage} style={styles.imagePickerBubble}>
                            {profileImage ? (
                                <Image source={{ uri: profileImage }} style={styles.profileImage} />
                            ) : (
                                <View style={styles.profileImagePlaceholder}>
                                    <Ionicons name="person" size={moderateScale(40)} color="#cbd5e1" />
                                </View>
                            )}
                            <View style={styles.editIconBadge}>
                                <Ionicons name="camera" size={moderateScale(14)} color="#fff" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={form.name}
                            onChangeText={(text) => setForm({ ...form, name: text })}
                            placeholder="Ex: John Doe"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address *</Text>
                        <TextInput
                            style={styles.input}
                            value={form.email}
                            onChangeText={(text) => setForm({ ...form, email: text })}
                            placeholder="Ex: john@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number *</Text>
                        <TextInput
                            style={styles.input}
                            value={form.phone}
                            onChangeText={(text) => setForm({ ...form, phone: text })}
                            placeholder="+1 (403) 000-0000"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Primary Specialty</Text>
                        <TextInput
                            style={styles.input}
                            value={form.specialty}
                            onChangeText={(text) => setForm({ ...form, specialty: text })}
                            placeholder="e.g. Plumbing, HVAC"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Years of Experience</Text>
                        <TextInput
                            style={styles.input}
                            value={form.experience_years}
                            onChangeText={(text) => setForm({ ...form, experience_years: text })}
                            placeholder="e.g. 5"
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>City</Text>
                        <TextInput
                            style={styles.input}
                            value={form.city}
                            onChangeText={(text) => setForm({ ...form, city: text })}
                            placeholder="e.g. Toronto"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Professional Bio</Text>
                        <TextInput
                            style={[styles.input, styles.bioInput]}
                            value={form.bio}
                            onChangeText={(text) => setForm({ ...form, bio: text })}
                            placeholder="Tell customers about your expertise..."
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Service Cities</Text>
                        <Text style={styles.subLabel}>Which areas are you willing to work in?</Text>

                        {/* Currently Saved Cities Display */}
                        {form.service_cities_names?.length > 0 && (
                            <View style={{ marginBottom: verticalScale(15), backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' }}>
                                <Text style={[styles.subLabel, { color: '#0f172a', fontWeight: 'bold', marginBottom: 8 }]}>Your Saved Service Areas:</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                    {form.service_cities_names.map((cityName, idx) => (
                                        <View key={idx} style={[styles.chipItem, { flexDirection: 'row', alignItems: 'center', marginRight: 0, backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', paddingVertical: 6, paddingHorizontal: 12 }]}>
                                            <Text style={[styles.chipText, { color: '#166534', fontSize: 12, marginRight: 4 }]}>{cityName}</Text>
                                            <TouchableOpacity onPress={() => removeCityByIndex(idx)}>
                                                <Ionicons name="close-circle" size={16} color="#166534" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                        
                        {/* State Selection */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                            {states.map(s => (
                                <TouchableOpacity
                                    key={s.id}
                                    style={[styles.chipItem, selectedState === s.id && styles.chipItemActive]}
                                    onPress={() => setSelectedState(s.id)}
                                >
                                    <Text style={[styles.chipText, selectedState === s.id && styles.chipTextActive]}>{s.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* District Selection */}
                        {selectedState && (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.chipScroll, { marginTop: verticalScale(10) }]}>
                                {districts.length === 0 && <Text style={styles.subLabel}>No districts found.</Text>}
                                {districts.map(d => (
                                    <TouchableOpacity
                                        key={d.id}
                                        style={[styles.chipItem, selectedDistrict === d.id && styles.chipItemActive]}
                                        onPress={() => setSelectedDistrict(d.id)}
                                    >
                                        <Text style={[styles.chipText, selectedDistrict === d.id && styles.chipTextActive]}>{d.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}

                        {/* City Checkboxes */}
                        {selectedDistrict && (
                            <View style={[styles.checkboxContainer, { marginTop: verticalScale(15) }]}>
                                {cities.length === 0 && <Text style={styles.subLabel}>No active cities found in this district.</Text>}
                                {cities.map(clusterKey => {
                                    const isSelected = form.service_cities.includes(clusterKey.id);
                                    return (
                                        <TouchableOpacity 
                                            key={clusterKey.id} 
                                            style={[styles.checkboxItem, isSelected && styles.checkboxItemSelected]}
                                            onPress={() => {
                                                setForm(prev => {
                                                    const areas = prev.service_cities || [];
                                                    const names = prev.service_cities_names || [];
                                                    const isSelected = areas.includes(clusterKey.id);
                                                    
                                                    const newAreas = isSelected
                                                        ? areas.filter(a => a !== clusterKey.id)
                                                        : [...areas, clusterKey.id];
                                                        
                                                    const newNames = isSelected
                                                        ? names.filter(n => n !== clusterKey.name)
                                                        : [...names, clusterKey.name];
                                                        
                                                    return { ...prev, service_cities: newAreas, service_cities_names: newNames };
                                                });
                                            }}
                                        >
                                            <View style={[styles.checkboxBox, isSelected && styles.checkboxBoxSelected]}>
                                                {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                                            </View>
                                            <Text style={styles.checkboxLabel}>{clusterKey.name}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                        {form.service_cities.length > 0 && (
                            <Text style={[styles.subLabel, { marginTop: verticalScale(5), fontWeight: 'bold', color: '#115e59' }]}>
                                {form.service_cities.length} cities selected
                            </Text>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Skills</Text>
                        <Text style={styles.subLabel}>What are your professional skills?</Text>

                        {/* Currently Saved Skills Display */}
                        {form.skills?.length > 0 && (
                            <View style={{ marginBottom: verticalScale(15), backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' }}>
                                <Text style={[styles.subLabel, { color: '#0f172a', fontWeight: 'bold', marginBottom: 8 }]}>Your Saved Skills:</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                    {form.skills.map((skill, idx) => (
                                        <View key={idx} style={[styles.chipItem, { flexDirection: 'row', alignItems: 'center', marginRight: 0, backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', paddingVertical: 6, paddingHorizontal: 12 }]}>
                                            <Text style={[styles.chipText, { color: '#166534', fontSize: 12, marginRight: 4 }]}>{skill}</Text>
                                            <TouchableOpacity onPress={() => {
                                                setForm(prev => {
                                                    const skillsArr = prev.skills || [];
                                                    return { ...prev, skills: skillsArr.filter(s => s !== skill) };
                                                });
                                            }}>
                                                <Ionicons name="close-circle" size={16} color="#166534" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        <View style={styles.skillsScrollContainer}>
                            <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={true} style={styles.skillsScrollView}>
                                <View style={styles.checkboxContainer}>
                                    {availableSkills.map(skill => {
                                        const isSelected = form.skills.includes(skill);
                                        return (
                                            <TouchableOpacity 
                                                key={skill} 
                                                style={[styles.checkboxItem, isSelected && styles.checkboxItemSelected]}
                                                onPress={() => {
                                                    setForm(prev => {
                                                        const skillsArr = prev.skills || [];
                                                        const newSkills = skillsArr.includes(skill)
                                                            ? skillsArr.filter(s => s !== skill)
                                                            : [...skillsArr, skill];
                                                        return { ...prev, skills: newSkills };
                                                    });
                                                }}
                                            >
                                                <View style={[styles.checkboxBox, isSelected && styles.checkboxBoxSelected]}>
                                                    {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                                                </View>
                                                <Text style={styles.checkboxLabel}>{skill}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </ScrollView>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: moderateScale(20),
        paddingVertical: verticalScale(15),
        marginTop: verticalScale(25),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backButton: { width: moderateScale(40), height: moderateScale(40), justifyContent: 'center' },
    headerTitle: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#0f172a' },
    scrollContent: { padding: moderateScale(20) },
    imagePickerContainer: { alignItems: 'center', marginBottom: verticalScale(24) },
    imagePickerBubble: {
        position: 'relative', width: moderateScale(100), height: moderateScale(100),
        borderRadius: moderateScale(50), backgroundColor: '#f1f5f9', borderWidth: 2, borderColor: '#15843E'
    },
    profileImage: { width: '100%', height: '100%', borderRadius: moderateScale(50) },
    profileImagePlaceholder: { width: '100%', height: '100%', borderRadius: moderateScale(50), justifyContent: 'center', alignItems: 'center' },
    editIconBadge: {
        position: 'absolute', bottom: 0, right: 0, backgroundColor: '#115e59',
        width: moderateScale(30), height: moderateScale(30), borderRadius: moderateScale(15),
        justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff'
    },
    inputGroup: { marginBottom: verticalScale(16) },
    label: { fontSize: moderateScale(14), fontWeight: '600', color: '#475569', marginBottom: verticalScale(8) },
    input: {
        backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: moderateScale(12),
        paddingHorizontal: moderateScale(16), paddingVertical: verticalScale(12), fontSize: moderateScale(15), color: '#0f172a'
    },
    bioInput: { height: verticalScale(100), textAlignVertical: 'top' },
    saveButton: {
        backgroundColor: '#115e59', paddingVertical: verticalScale(16), borderRadius: moderateScale(14),
        alignItems: 'center', shadowColor: '#115e59', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, shadowRadius: 8, elevation: 4, marginBottom: verticalScale(40), marginTop: 10
    },
    saveButtonDisabled: { backgroundColor: '#94acab' },
    saveButtonText: { color: '#fff', fontSize: moderateScale(16), fontWeight: 'bold' },
    subLabel: { fontSize: moderateScale(12), color: '#64748b', marginBottom: verticalScale(10) },
    clusterGroup: { marginBottom: verticalScale(15) },
    clusterGroupTitle: { fontSize: moderateScale(14), fontWeight: 'bold', color: '#334155', marginBottom: verticalScale(8), borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: verticalScale(4) },
    skillsScrollContainer: {
        maxHeight: verticalScale(200),
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: moderateScale(12),
        backgroundColor: '#f8fafc',
        overflow: 'hidden'
    },
    skillsScrollView: {
        padding: moderateScale(10),
    },
    checkboxContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: moderateScale(8) },
    checkboxItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: moderateScale(8), paddingHorizontal: moderateScale(10), paddingVertical: verticalScale(8), marginBottom: verticalScale(8), marginRight: scale(8) },
    checkboxItemSelected: { borderColor: '#115e59', backgroundColor: '#f0fdf4' },
    checkboxBox: { width: moderateScale(20), height: moderateScale(20), borderRadius: moderateScale(4), borderWidth: 1, borderColor: '#cbd5e1', marginRight: scale(8), alignItems: 'center', justifyContent: 'center' },
    checkboxBoxSelected: { backgroundColor: '#115e59', borderColor: '#115e59' },
    checkboxLabel: { fontSize: moderateScale(13), color: '#475569' },
    chipScroll: {
        flexDirection: 'row',
    },
    chipItem: {
        paddingHorizontal: moderateScale(15),
        paddingVertical: verticalScale(8),
        borderRadius: moderateScale(20),
        backgroundColor: '#f1f5f9',
        marginRight: scale(10),
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    chipItemActive: {
        backgroundColor: '#115e59',
        borderColor: '#115e59',
    },
    chipText: {
        fontSize: moderateScale(13),
        color: '#475569',
        fontWeight: '600',
    },
    chipTextActive: {
        color: '#fff',
    },
});

export default ProviderUpdateProfileScreen;
