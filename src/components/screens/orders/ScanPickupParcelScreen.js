import React from "react";
import { View, Alert, Text, Image, Modal, TouchableOpacity, Dimensions, StyleSheet, SafeAreaView, FlatList, ScrollView, Vibration } from "react-native";
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import SwipeButton from 'rn-swipe-button';
import { default as MaterialIcon } from 'react-native-vector-icons/MaterialIcons';
import { default as FontAwesomeIcon } from 'react-native-vector-icons/FontAwesome';
import { default as MaterialCommunityIcon } from 'react-native-vector-icons/MaterialCommunityIcons';
import { default as Ionicon } from 'react-native-vector-icons/Ionicons';
import { default as Octicon } from 'react-native-vector-icons/Octicons';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Geolocation from 'react-native-geolocation-service';

import QRCodeScanner from 'react-native-qrcode-scanner';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';

import { AppColors, HeaderStyle, AppFonts, AppStyles } from "../../../assets/styles";
import { consts } from "../../../assets/values";
import ShipmentApi from "../../../services/api/ShipmentApi";
import AuthApi from "../../../services/api/AuthApi";
import { bindActionCreators } from "redux";
import { sagaSubmitLoadingFinished, sagaSetRoute } from "../../../redux/sagas/route";
import Waiting from "../../widgets/Waiting";
import CommonTabView from "../../widgets/CommonTabView";
import { TextInput } from "react-native-gesture-handler";
import { setUserData } from "../../../redux/actions/auth";
import TouchableDebounce from "../common/TouchableDebounce";


class ScanPickupParcelScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      ...HeaderStyle,
      title: 'SCAN PARCELS',
      headerRight: () => {
        return (
          <Menu onSelect={value => params.onPressMenu(value)} >
            <MenuTrigger style={{ padding: 10 }}>
              <MaterialIcon name="more-vert" color={AppColors.grey2} size={28} />
            </MenuTrigger>
            <MenuOptions optionsContainerStyle={{ marginTop: 50 }}>
              <MenuOption value={"manual_input"} style={AppStyles.headerMenuItemContainer}>
                <Text style={AppStyles.headerMenuItemText}>Cannot Scan?</Text>
              </MenuOption>
              <MenuOption value={"mark_damages"} style={AppStyles.headerMenuItemContainer}>
                <Text style={AppStyles.headerMenuItemText}>Mark Damages</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        );
      },
    }
  };

  constructor(props) {
    super(props);

    this.state = {
      tabIndex: 0,
      parcels: [],
      submitting: false,

      inputParcelID: "",

      flashOn: false,
      foundParcel: false,
      visibleParcelInputModal: false,

      currentLocation: null,
    };

    this.scanner = null;
    this.dropdownMenu = null;
    this.camera = null;
    this.resetSwipeButton = null;
  }

  async componentDidMount() {
    this.props.navigation.setParams({ onPressMenu: this.onPressMenu });
    Geolocation.getCurrentPosition(
      (position) => {
        console.log('[Finish Delivery] Geolocation Error: ', position)
        this.setState({
          currentLocation: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        });
      },
      (error) => {
        console.log('[Finish Delivery] Geolocation Error: ', error.message)
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000, forceRequestLocation: true });
  }

  componentWillUnmount() {

  }

  addParcelHandler = () => {
    const { inputParcelID, parcels } = this.state;
    if (inputParcelID.substr(0, 3) === "FDL") {
      parcels.push({
        id: inputParcelID,
        state: consts.PARCEL_STATE.NORMAL,
      });
      this.setState({
        parcels, 
        visibleParcelInputModal: false,
        inputParcelID: ""
      });
    } else {
      Alert.alert("Error", "Please check number of the parcel again."); 
    }
  }

  onReadCode = (e) => {
    if (this.scanner) {
      if (e.data.substr(0, 3) === "FDL") {
        const parcels = [...this.state.parcels];
        const parcel = parcels.find(parcel => parcel.id === e.data);
        if (!parcel) {
          parcels.push({
            id: e.data,
            state: consts.PARCEL_STATE.NORMAL,
          });
          this.setState({parcels, foundParcel: true});
          Vibration.vibrate(500);
        } 
      }
      setTimeout(() => {
        try {
          this.setState({
            foundParcel: false,
          });
          this.scanner.reactivate();
        }
        catch (err) {
        }
      }, 1500);
    }
  }

  onFinishMarkingDamages = (_parcels) => {
    const { parcels } = this.state;
    _parcels.forEach(_parcel => {
      const parcel = parcels.find(parcel => parcel.id === _parcel.id);
      if (parcel) {
        parcel.state = _parcel.state;
      }
    });
    this.setState({ parcels });
  }

  onPressMenu = (value) => {
    if (value === "manual_input") {
      this.setState({ visibleParcelInputModal: true, inputParcelID: "" })
    } else if (value === "mark_damages") {
      const { parcels } = this.state;
      this.props.navigation.push("SelectPickupDamages", {
        parcels: parcels,
        onFinish: this.onFinishMarkingDamages
      });
    }
  }

  onSubmit = (reroute) => {
    const {parcels, currentLocation} = this.state;
    this.setState({submitting: true});
    ShipmentApi.addOrderToRoute(parcels, currentLocation, reroute, this.props.route.id, this.props.token).then(response => {
      this.props.setRoute({
        onSuccess: () => {
          this.setState({ submitting: false });
          this.props.navigation.popToTop();
        },
        onFailure: (err) => {
          this.setState({ submitting: false });
        }
      })
    }).catch(error => {
      this.setState({ submitting: false });
      Alert.alert("Action Failed", "Adding orders to the route was failed.");
    })
  }

  onFinishScan = () => {
    const {parcels} = this.state;
    if (parcels.length === 0) {
      this.props.navigation.pop();
    } else {
      Alert.alert("Routing Confirmation", "Do you want to re-route all your remaining and picked orders? Please choose [No] if you want to just add new orders to the end.", [{
        text: 'Cancel',
        style: "cancel",
        onPress: () => {
          if (this.resetSwipeButton)
            this.resetSwipeButton();
        }
      }, {
        text: 'NO',
        onPress: () => this.onSubmit(false)
      }, {
        text: 'YES',
        onPress: () => this.onSubmit(true)
      }]);
    }
  }

  renderParcel = (item) => {
    const parcel = item.item;
    return (
      <TouchableDebounce key={`${Math.floor(Math.random() * 100000)}`}>
        <View style={styles.parcelContainer}>
          <View style={{ flexDirection: "column", alignItems: "center", marginRight: 10 }}>
            <Text style={styles.parcelIndex}># {item.index + 1}</Text>
          </View>
          <View style={{ flex: 1, paddingLeft: 10 }}>
            <View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={styles.parcelTitle}>{parcel.id}</Text>
                {parcel.state == consts.PARCEL_STATE.NOT_VERIFIED && (
                  <View style={AppStyles.badgeInactiveContainer}>
                    <Text style={AppStyles.badgeInactiveText}>NOT VERIFIED</Text>
                  </View>)}
                {parcel.state == consts.PARCEL_STATE.MISSING && (
                  <View style={AppStyles.badgeDangerContainer}>
                    <Text style={AppStyles.badgeDangerText}>MISSING</Text>
                  </View>)}
                {parcel.state == consts.PARCEL_STATE.DAMAGED_IN_LOADING && (
                  <View style={AppStyles.badgeDangerContainer}>
                    <Text style={AppStyles.badgeDangerText}>DAMAGED IN LOADING</Text>
                  </View>)}
                {parcel.state == consts.PARCEL_STATE.DAMAGED_IN_UNLOADING && (
                  <View style={AppStyles.badgeDangerContainer}>
                    <Text style={AppStyles.badgeDangerText}>DAMAGED IN UNLOADING</Text>
                  </View>)}
                {parcel.state == consts.PARCEL_STATE.DAMAGED_IN_TRANSIT && (
                  <View style={AppStyles.badgeDangerContainer}>
                    <Text style={AppStyles.badgeDangerText}>DAMAGED IN TRANSIT</Text>
                  </View>)}
                {parcel.state == consts.PARCEL_STATE.CUSTOMER_REFUSED && (
                  <View style={AppStyles.badgeDangerContainer}>
                    <Text style={AppStyles.badgeDangerText}>CUSTOMER REFUSED</Text>
                  </View>)}
                {parcel.state == consts.PARCEL_STATE.NOT_RECEIVED && (
                  <View style={AppStyles.badgeDangerContainer}>
                    <Text style={AppStyles.badgeDangerText}>NOT RECEIVED</Text>
                  </View>)}
              </View>
            </View>
          </View>
        </View>
      </TouchableDebounce>
    );
  }

  renderTabPane = (_parcels, cb) => {
    const parcels = _parcels.filter(parcel => cb(parcel));
    return (
      <FlatList
        data={parcels}
        renderItem={this.renderParcel}
        // keyExtractor={(item, index) => `${index}`}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    );
  }

  renderScanned = () => {
    const { parcels } = this.state;
    return this.renderTabPane(parcels, parcel => true);
  }

  render() {
    const { flashOn, parcels, foundParcel, visibleParcelInputModal, inputParcelID } = this.state;

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Waiting visible={this.state.submitting} title={"Submitting pickup data..."} />

        {visibleParcelInputModal && <Modal
          visible={visibleParcelInputModal}
          transparent={true}
          animationType="fade"
        >
          <TouchableDebounce activeOpacity={1} disabled={false}
            style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: "center", alignItems: "center", }}
            onPress={() => {
              this.setState({ visibleParcelInputModal: false, currentParcel: null });
            }}>
            <View style={{ width: "80%", backgroundColor: AppColors.grey4 }}>
              <View style={{ paddingVertical: 10 }}>
                <Text style={styles.summaryValue}>MANUAL INPUT</Text>
              </View>
              <View style={{ backgroundColor: "white", flexDirection: "row", paddingHorizontal: 10 }}>
                <View style={[AppStyles.formGroup, { paddingVertical: 20 }]}>
                  <Text style={AppStyles.label}>Parcel No</Text>
                  <TextInput
                    style={[AppStyles.textInput]}
                    value={inputParcelID}
                    autoCapitalize="characters"
                    onChangeText={(val) => this.setState({ inputParcelID: val })}
                  />
                </View>
              </View>
              <TouchableDebounce style={AppStyles.bottomButtonContainer} activeOpacity={0.6} onPress={() => this.addParcelHandler()}>
                <Text style={AppStyles.bottomButtonText}>ADD</Text>
              </TouchableDebounce>
            </View>
          </TouchableDebounce>
        </Modal>}

        <View style={{ height: 250, justifyContent: "center", overflow: "hidden", alignItems: "center" }}>
          <QRCodeScanner
            ref={(r) => { this.scanner = r }}
            showMarker={true}
            reactivate={false}
            // reactivateTimeout={2000}
            markerStyle={{ borderWidth: foundParcel ? 0 : 1, width: 180, height: 180, marginTop: -40 }}
            cameraStyle={{ height: 250 }}
            cameraProps={{ flashMode: flashOn ? "torch" : "off" }}
            onRead={this.onReadCode}
            vibrate={false}
          />
          {foundParcel && <View style={{ position: "absolute", width: "100%", height: "100%", backgroundColor: "#00ff0060", justifyContent: "center", alignItems: "center" }}>
            <Ionicon name="checkmark-circle-outline" color={"#ffffff"} size={120} />
          </View>}
        </View>

        <View style={styles.bottomBar}>
          <View style={styles.bottomBarRow}>
            <TouchableDebounce style={[styles.flashButtonContainer, { marginLeft: 10 }]} activeOpacity={0.6} onPress={() => this.setState({ flashOn: !flashOn })}>
              <MaterialCommunityIcon name={flashOn ? "flashlight-off" : "flashlight"} color={AppColors.white} size={24} />
            </TouchableDebounce>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: AppFonts.main.medium, width: "100%", fontSize: 16, textAlign: "center", paddingVertical: 10 }}>{this.state.parcels.length} Parcels Scanned</Text>
          {this.renderScanned()}
        </View>
        <View style={[AppStyles.bottomContainer, {paddingHorizontal: "12%"}]}>
          {/* <TouchableDebounce style={AppStyles.bottomButtonContainer} activeOpacity={0.6} onPress={() => this.onFinishScan()}>
            <Text style={AppStyles.bottomButtonText}>SCAN FINISHED >></Text>
          </TouchableDebounce> */}
          <SwipeButton
            thumbIconBackgroundColor={AppColors.primary}
            thumbIconComponent={() => <FontAwesomeIcon name="angle-double-right" color={AppColors.white} size={32} style={{ opacity: 0.6 }} />}
            title="PICKING-UP FINISHED"
            onSwipeSuccess={() => this.onFinishScan()}
            containerStyles={{
              // borderRadius: 0,
              borderWidth: 1,
            }}
            railBackgroundColor={AppColors.white}
            railBorderColor={AppColors.primary}
            railFillBackgroundColor={'#27acb180'}
            railFillBorderColor={AppColors.white}
            swipeSuccessThreshold={98}
            railStyles={{
              borderColor: AppColors.primary,
              borderWidth: 0
            }}
            thumbIconStyles={{
              // borderRadius: 0,
              borderWidth: 0
            }}
            titleStyles={{
              fontFamily: AppFonts.main.medium,
              fontSize: 14              
            }}
            titleColor={AppColors.text}
            titleFontSize={16}
            // shouldResetAfterSuccess={true}
            forceReset={reset => {
              this.resetSwipeButton = reset;
            }}
          />
        </View>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({
  token: state.auth.token,
  user: state.auth.user,
  route: state.route,
  network: state.network
});

const mapDispatchToProps = (dispatch) => (
  bindActionCreators({
    setRoute: sagaSetRoute
  }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(ScanPickupParcelScreen);

const styles = StyleSheet.create({
  parcelContainer: {
    backgroundColor: AppColors.white,
    flexDirection: 'row',
    marginBottom: 2,
    paddingVertical: 10,
    paddingLeft: 20,
    paddingRight: 10
  },

  parcelIndex: {
    color: AppColors.textLight, textAlign: 'center',
    fontFamily: AppFonts.main.semibold,
    marginBottom: 5,
    fontSize: 14,
  },
  orderTitle: {
    color: AppColors.grey,
    fontFamily: AppFonts.main.medium,
    fontSize: 14,
    paddingVertical: 10,
    textAlign: 'center'
  },
  parcelTitle: {
    color: AppColors.grey,
    fontFamily: AppFonts.main.medium,
    fontSize: 14,
    marginBottom: 7,
  },
  parcelAddress: {
    color: AppColors.text,
    fontFamily: AppFonts.main.medium,
    fontSize: 14,
    // marginBottom: 10,
  },
  parcelParcels: {
    color: AppColors.text,
    fontFamily: AppFonts.main.medium,
    fontSize: 12,
    marginBottom: 7,
  },
  bottomBar: {
    marginTop: -40,
    backgroundColor: "#00000080"
  },
  bottomBarRow: {
    flexDirection: "row",
    marginHorizontal: 10,
    alignItems: "flex-end",
    justifyContent: "flex-end"
  },
  flashButtonContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    backgroundColor: AppColors.danger,
    alignItems: "center"
  },
  summaryValue: {
    color: AppColors.text,
    fontFamily: AppFonts.main.medium,
    textAlign: 'center',
    fontSize: 20,
  },
});