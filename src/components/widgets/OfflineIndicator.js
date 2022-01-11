import React, {
    Component,
} from 'react';

import { StyleSheet, View, Image, Text, Modal, Animated } from 'react-native';
import { AppStyles, AppFonts, AppColors } from '../../assets/styles';
import { SkypeIndicator } from 'react-native-indicators';
import { default as Ionicon } from 'react-native-vector-icons/Ionicons';


export default class OfflineIndicator extends Component {
    constructor(props) {
        super(props);
        
    }
    
    render() {
        return (
            <View style={styles.container}>
                <Ionicon name="cloud-offline-outline" color={AppColors.grey2} size={128} />
                <Text style={styles.titleText}>{this.props.title}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center", 
        alignItems: "center", 
        flex: 1, 
        // backgroundColor: AppColors.grey, 
        padding: 20
    },
    titleText: {
        fontSize: 16,
        paddingTop: 10,
        color: AppColors.grey,
        fontFamily: AppFonts.main.medium,
        textAlignVertical: "center",
        lineHeight: 25,
        textAlign: "center"
    },
});