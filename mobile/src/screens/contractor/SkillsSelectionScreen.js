import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, SafeAreaView, Alert, ActivityIndicator
} from 'react-native';
import { api } from '../../utils/api';
import { moderateScale, verticalScale } from '../../utils/responsive';

const DEFAULT_SKILLS = [
    { id: 'plumbing', name: 'Plumbing', icon: '🔧' },
    { id: 'electrical', name: 'Electrical', icon: '⚡' },
    { id: 'cleaning', name: 'Cleaning', icon: '🧹' },
    { id: 'painting', name: 'Painting', icon: '🎨' },
    { id: 'carpentry', name: 'Carpentry', icon: '🪑' },
    { id: 'hvac', name: 'HVAC / AC Repair', icon: '❄️' },
    { id: 'landscaping', name: 'Landscaping', icon: '🌿' },
    { id: 'roofing', name: 'Roofing', icon: '🏠' },
    { id: 'flooring', name: 'Flooring', icon: '🪵' },
    { id: 'appliance', name: 'Appliance Repair', icon: '🍳' },
    { id: 'locksmith', name: 'Locksmith', icon: '🔑' },
    { id: 'pest_control', name: 'Pest Control', icon: '🐛' },
];

const SkillsSelectionScreen = ({ navigation, route }) => {
    const { profile, profilePhoto } = route.params || {};
    const [skills, setSkills] = useState(DEFAULT_SKILLS);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Try to load categories from backend to supplement defaults
        const loadCategories = async () => {
            try {
                const res = await api.get('/api/categories');
                if (res.data && res.data.length > 0) {
                    setSkills(res.data.map(c => ({ id: c.id, name: c.name, icon: c.icon || '🛠️' })));
                }
            } catch (e) {
                // Use defaults if API fails
            }
        };
        loadCategories();
    }, []);

    const toggleSkill = (id) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleNext = () => {
        if (selected.length === 0) {
            Alert.alert('Select Skills', 'Please select at least one skill.');
            return;
        }
        navigation.navigate('DocumentUpload', { profile, profilePhoto, skills: selected });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Select Your Skills</Text>
                <Text style={styles.subtitle}>Step 1 of 4 — Choose all that apply</Text>

                <View style={styles.grid}>
                    {skills.map((skill) => {
                        const isSelected = selected.includes(skill.id);
                        return (
                            <TouchableOpacity
                                key={skill.id}
                                style={[styles.skillCard, isSelected && styles.skillCardSelected]}
                                onPress={() => toggleSkill(skill.id)}
                            >
                                <Text style={styles.skillIcon}>{skill.icon}</Text>
                                <Text style={[styles.skillName, isSelected && styles.skillNameSelected]}>
                                    {skill.name}
                                </Text>
                                {isSelected && <Text style={styles.checkmark}>✓</Text>}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <Text style={styles.selectedCount}>
                    {selected.length} skill{selected.length !== 1 ? 's' : ''} selected
                </Text>

                <TouchableOpacity
                    style={[styles.nextBtn, selected.length === 0 && styles.nextBtnDisabled]}
                    onPress={handleNext}
                    disabled={selected.length === 0}
                >
                    <Text style={styles.nextBtnText}>Next: Upload Documents →</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scroll: { padding: moderateScale(24), paddingBottom: 40 },
    backBtn: {
        width: moderateScale(40), height: moderateScale(40),
        borderRadius: moderateScale(20), backgroundColor: '#f1f5f9',
        justifyContent: 'center', alignItems: 'center', marginBottom: verticalScale(16),
    },
    backIcon: { fontSize: moderateScale(20), color: '#0f172a', fontWeight: 'bold' },
    title: { fontSize: moderateScale(28), fontWeight: 'bold', color: '#0f172a' },
    subtitle: { fontSize: moderateScale(14), color: '#64748b', marginTop: verticalScale(4), marginBottom: verticalScale(24) },
    grid: {
        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
    },
    skillCard: {
        width: '47%', backgroundColor: '#f8fafc', borderRadius: moderateScale(16),
        padding: moderateScale(16), marginBottom: verticalScale(12),
        alignItems: 'center', borderWidth: 2, borderColor: '#e2e8f0',
    },
    skillCardSelected: {
        backgroundColor: '#f0fdfa', borderColor: '#14b8a6',
    },
    skillIcon: { fontSize: moderateScale(32), marginBottom: verticalScale(8) },
    skillName: { fontSize: moderateScale(13), fontWeight: '600', color: '#475569', textAlign: 'center' },
    skillNameSelected: { color: '#14b8a6' },
    checkmark: {
        position: 'absolute', top: 8, right: 10,
        fontSize: moderateScale(16), color: '#14b8a6', fontWeight: 'bold',
    },
    selectedCount: {
        textAlign: 'center', color: '#64748b', fontSize: moderateScale(14),
        marginTop: verticalScale(12), marginBottom: verticalScale(8),
    },
    nextBtn: {
        backgroundColor: '#14b8a6', padding: moderateScale(18),
        borderRadius: moderateScale(16), alignItems: 'center', marginTop: verticalScale(8),
    },
    nextBtnDisabled: { backgroundColor: '#cbd5e1' },
    nextBtnText: { color: '#fff', fontSize: moderateScale(17), fontWeight: 'bold' },
});

export default SkillsSelectionScreen;
