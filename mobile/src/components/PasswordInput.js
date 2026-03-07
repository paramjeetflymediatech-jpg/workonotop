import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from '../utils/responsive';

/**
 * A reusable password input with a show/hide eye button.
 */
const PasswordInput = ({
    value,
    onChangeText,
    placeholder = '•••••••••',
    label,
    containerStyle,
    inputStyle,
    labelStyle,
    placeholderTextColor = '#94a3b8',
    ...rest
}) => {
    const [visible, setVisible] = useState(false);

    return (
        <View style={[styles.wrapper, containerStyle]}>
            {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}
            <View style={styles.inputRow}>
                <TextInput
                    style={[styles.input, inputStyle]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={placeholderTextColor}
                    secureTextEntry={!visible}
                    autoCapitalize="none"
                    autoCorrect={false}
                    {...rest}
                />
                <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() => setVisible(v => !v)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.6}
                >
                    <Ionicons
                        name={visible ? 'eye-off' : 'eye'}
                        size={moderateScale(22)}
                        color="#64748b"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
    },
    label: {
        fontSize: moderateScale(13),
        fontWeight: '600',
        color: '#475569',
        marginBottom: moderateScale(6),
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: moderateScale(12),
        paddingRight: moderateScale(12),
    },
    input: {
        flex: 1,
        padding: moderateScale(14),
        fontSize: moderateScale(16),
        color: '#0f172a',
    },
    toggleButton: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: moderateScale(4),
    },
});

export default PasswordInput;
