import React from "react";
import { View, Alert, Text, Image, Modal, TouchableOpacity, Dimensions, StyleSheet, SafeAreaView, FlatList, ScrollView } from "react-native";
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import { default as MaterialIcon } from 'react-native-vector-icons/MaterialIcons';
import { default as Ionicon } from 'react-native-vector-icons/Ionicons';
import SwipeButton from 'rn-swipe-button';
import { default as FontAwesomeIcon } from 'react-native-vector-icons/FontAwesome';
import { default as MaterialCommunityIcon } from 'react-native-vector-icons/MaterialCommunityIcons';
import { default as Octicons } from 'react-native-vector-icons/Octicons';

import { DotIndicator } from 'react-native-indicators';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { RNCamera, FaceDetector } from 'react-native-camera';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';

import { AppColors, HeaderStyle, AppFonts, AppStyles } from "../../../assets/styles";
import ListTabScreen from "./tabs/ListTabScreen";
import { consts } from "../../../assets/values";
import MapTabScreen from "./tabs/MapTabScreen";
import SummaryTabScreen from "./tabs/SummaryTabScreen";
import ShipmentApi from "../../../services/api/ShipmentApi";
import AuthApi from "../../../services/api/AuthApi";
import { setUserData } from "../../../redux/reducers/auth";
import TouchableDebounce from "../common/TouchableDebounce";


class ParcelStateScreen extends React.Component {
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
            ...HeaderStyle,
            title: 'PARCEL STATE',
            headerRight: () => {
                return (
                    // <Menu onSelect={value => alert(`Selected number: ${value}`)} >
                    //     <MenuTrigger style={{ padding: 10 }}>
                    //         <MaterialIcon name="more-vert" color={AppColors.grey2} size={28} />
                    //     </MenuTrigger>
                    //     <MenuOptions optionsContainerStyle={{ marginTop: 50 }}>
                    //         <MenuOption value={2} style={AppStyles.headerMenuItemContainer}>
                    //             <Text style={AppStyles.headerMenuItemText}>Verify Manually</Text>
                    //         </MenuOption>
                    //     </MenuOptions>
                    // </Menu>
                    <View />
                );
            },
        }
    };

    constructor(props) {
        super(props);

        this.stop = this.props.navigation.state.params.stop;
        this.parcel = this.props.navigation.state.params.parcel;
        this.state = {
            submitting: false,
        };
    }

    async componentDidMount() {
        this.props.navigation.setParams({ onPressMenu: this.onPressMenu });
    }

    componentWillUnmount() {
    }

    onPressMenu = () => {
        this.dropdownMenu.show();
    }

    onStatePressed = (state) => {
        const {parent} = this.props.navigation.state.params;
        parent.changeParcelState(this.parcel, state);
        this.props.navigation.pop();
    }

    renderButtons = () => {
        return (
            <>
                <TouchableDebounce style={[AppStyles.primaryButtonContainer, { marginVertical: 10 }]} activeOpacity={0.6} 
                    onPress={() => this.onStatePressed(consts.PARCEL_STATE.NORMAL)}>
                    <Text style={AppStyles.primaryButtonText}>Normal</Text>
                </TouchableDebounce>
                <TouchableDebounce style={[AppStyles.warningButtonContainer, { marginVertical: 10, marginTop: 30 }]} activeOpacity={0.6}
                    onPress={() => this.onStatePressed(consts.PARCEL_STATE.MISSING)}>
                    <Text style={AppStyles.warningButtonText}>Missing</Text>
                </TouchableDebounce>
                <TouchableDebounce style={[AppStyles.warningButtonContainer, { marginVertical: 10 }]} activeOpacity={0.6}
                    onPress={() => this.onStatePressed(consts.PARCEL_STATE.DAMAGED_IN_LOADING)}>
                    <Text style={AppStyles.warningButtonText}>Damaged in loading</Text>
                </TouchableDebounce>
                {this.stop.type === consts.STOP_TYPES.DELIVERY && <>
                    <TouchableDebounce style={[AppStyles.warningButtonContainer, { marginVertical: 10 }]} activeOpacity={0.6}
                        onPress={() => this.onStatePressed(consts.PARCEL_STATE.DAMAGED_IN_UNLOADING)}>
                        <Text style={AppStyles.warningButtonText}>Damaged in unloading</Text>
                    </TouchableDebounce>
                    <TouchableDebounce style={[AppStyles.warningButtonContainer, { marginVertical: 10 }]} activeOpacity={0.6}
                        onPress={() => this.onStatePressed(consts.PARCEL_STATE.DAMAGED_IN_TRANSIT)}>
                        <Text style={AppStyles.warningButtonText}>Damaged in transit</Text>
                    </TouchableDebounce>
                    <TouchableDebounce style={[AppStyles.warningButtonContainer, { marginVertical: 10 }]} activeOpacity={0.6}
                        onPress={() => this.onStatePressed(consts.PARCEL_STATE.CUSTOMER_REFUSED)}>
                        <Text style={AppStyles.warningButtonText}>Customer refused the parcel</Text>
                    </TouchableDebounce>
                </>}
            </>
        )
    }

    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <Modal
                    visible={this.state.submitting}
                    transparent={true}
                    animationType="fade"
                >
                    <View style={AppStyles.loadingContainer}>
                        <DotIndicator color='white' size={8} />
                    </View>
                </Modal>

                <View style={{ flexDirection: 'row', paddingVertical: 10, backgroundColor: 'white', paddingTop: 20 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.summaryLabel}>Parcel</Text>
                        <Text style={styles.summaryValue}>{this.parcel.id}</Text>
                    </View>
                </View>
                <View style={{ padding: 10, paddingTop: 10 }}>
                    {this.renderButtons()}
                </View>
            </SafeAreaView>
        );
    }
}

const mapStateToProps = state => ({
    token: state.auth.token,
    user: state.auth.user,
    route: state.route,
});

export default connect(mapStateToProps, { setUserData })(ParcelStateScreen);

const styles = StyleSheet.create({
    summaryLabel: {
        color: AppColors.grey,
        fontFamily: AppFonts.main.medium,
        textAlign: 'center',
        fontSize: 14,
        marginBottom: 10,
    },
    summaryValue: {
        color: AppColors.text,
        fontFamily: AppFonts.main.medium,
        textAlign: 'center',
        fontSize: 20,
    },
});