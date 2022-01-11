import React, {
    Component,
} from 'react';
import { Header } from 'react-navigation-stack';
import { StatusBar, Animated } from 'react-native';

import { StyleSheet, View, Image, Text, Modal } from 'react-native';
import { AppStyles, AppFonts, AppColors } from '../../assets/styles';
import { default as MaterialCommunityIcon } from 'react-native-vector-icons/MaterialCommunityIcons';
import { default as Ionicon } from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';


export default class OfflineMarker extends Component {
    constructor(props) {
        super(props);
        this.containerOpacity = new Animated.Value(0.5);
        this.state = {

        }
    }

    componentDidMount() {
        this.containerOpacity.setValue(0.5);
        Animated.loop(
            Animated.sequence([
                Animated.timing(this.containerOpacity, {
                    toValue: 0.8,
                    duration: 500,
                    useNativeDriver: false
                }),
                Animated.timing(this.containerOpacity, {
                    toValue: 0.5,
                    duration: 500,
                    useNativeDriver: false
                })
            ]), {
            iterations: -1
        }).start();
    }

    render() {
        return (
            <View>
                <Animated.View style={[styles.container, { opacity: this.containerOpacity }]}>
                    <MaterialCommunityIcon name="wifi-off" color={AppColors.white} size={16} />
                    <Text style={[styles.titleText]}>Offline</Text>
                </Animated.View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignSelf: "flex-start",
        backgroundColor: AppColors.danger,
        padding: 5,
        paddingHorizontal: 10,
        borderRadius: 30,
        position: "absolute",
        right: 10,
        opacity: 0.8,
        flexDirection: "row",
        bottom: 10,
    },
    titleText: {
        fontSize: 12,
        color: AppColors.white,
        fontFamily: AppFonts.main.medium,
        textAlignVertical: "center",
        textAlign: "center",
        marginLeft: 5
    },
});