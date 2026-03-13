import React, { memo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

const { width } = Dimensions.get('window');

const CustomTabBar = memo(({ state, descriptors, navigation, role }) => {
    const insets = useSafeAreaInsets();

    // Adjust bottom padding based on device insets (handles gestures/keys)
    const bottomPadding = insets.bottom > 0 ? insets.bottom : verticalScale(10);
    const tabBarHeight = verticalScale(65) + bottomPadding;

    return (
        <View style={[styles.tabBarContainer, { height: tabBarHeight, paddingBottom: bottomPadding }]}>
            <View style={styles.tabBarContent}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label =
                        options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                                ? options.title
                                : route.name;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    // Define icons based on route name
                    let iconName;
                    if (route.name === 'Dashboard') {
                        iconName = isFocused ? 'grid' : 'grid-outline';
                    } else if (route.name === 'Services') {
                        iconName = isFocused ? 'construct' : 'construct-outline';
                    } else if (route.name === 'Profile') {
                        iconName = isFocused ? 'person' : 'person-outline';
                    } else if (route.name === 'Jobs' || route.name === 'Manage') {
                        iconName = isFocused ? 'briefcase' : 'briefcase-outline';
                    } else if (route.name === 'MyBookings') {
                        iconName = isFocused ? 'calendar' : 'calendar-outline';
                    }

                    return (
                        <TouchableOpacity
                            key={index}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarTestID}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={styles.tabButton}
                            activeOpacity={0.7}
                        >
                            <Animated.View style={[
                                styles.iconContainer,
                                isFocused && styles.activeIconContainer
                            ]}>
                                <Ionicons
                                    name={iconName}
                                    size={moderateScale(26)}
                                    color={isFocused ? '#fff' : '#64748b'}
                                />
                            </Animated.View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    tabBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        elevation: 0,
    },
    tabBarContent: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: scale(20),
        marginBottom: verticalScale(10),
        borderRadius: moderateScale(25),
        height: verticalScale(65),
        // Premium Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: scale(10),
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(12),
        borderRadius: moderateScale(20),
    },
    activeIconContainer: {
        backgroundColor: '#115e59',
        paddingHorizontal: scale(12),
    },
});

export default CustomTabBar;
