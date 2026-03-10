import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const DetailsScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Details Screen</Text>
            <Text style={styles.text}>This is where you can show more info.</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#14b8a6',
        marginBottom: 8,
    },
    text: {
        fontSize: 16,
        color: '#64748b',
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#64748b',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default DetailsScreen;
