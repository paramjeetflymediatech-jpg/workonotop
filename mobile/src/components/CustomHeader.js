import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CustomHeader = ({ title }) => {
    return (
        <SafeAreaView edges={['top']} style={styles.container}>
            <View style={styles.headerContent}>
                <Image
                    source={require('../../assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.title}>{title}</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#15843E',
    },
    headerContent: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    logo: {
        width: 40,
        height: 40,
        marginRight: 10,
        borderRadius: 8,
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default CustomHeader;
