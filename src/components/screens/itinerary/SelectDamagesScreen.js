import React from "react";
import { View, Alert, Text, Image, Modal, TouchableOpacity, Dimensions, StyleSheet, SafeAreaView, FlatList, ScrollView, TextInput } from "react-native";
import { connect } from 'react-redux';
import debounce from "lodash/debounce";
import AsyncStorage from '@react-native-community/async-storage';
import SwipeButton from 'rn-swipe-button';
import { default as MaterialIcon } from 'react-native-vector-icons/MaterialIcons';
import { default as FontAwesomeIcon } from 'react-native-vector-icons/FontAwesome';
import { default as MaterialCommunityIcon } from 'react-native-vector-icons/MaterialCommunityIcons';
import { default as Ionicon } from 'react-native-vector-icons/Ionicons';
import { default as Octicon } from 'react-native-vector-icons/Octicons';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

import QRCodeScanner from 'react-native-qrcode-scanner';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';

import { AppColors, HeaderStyle, AppFonts, AppStyles } from "../../../assets/styles";
import { consts } from "../../../assets/values";
import ShipmentApi from "../../../services/api/ShipmentApi";
import AuthApi from "../../../services/api/AuthApi";
import { bindActionCreators } from "redux";
import { sagaSubmitLoadingFinished } from "../../../redux/sagas/route";
import Waiting from "../../widgets/Waiting";
import CommonTabView from "../../widgets/CommonTabView";
import { isDelivery } from "../../../utils";
import TouchableDebounce from "../common/TouchableDebounce";


class SelectDamagesScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      ...HeaderStyle,
      title: 'SELECT DAMAGES',
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
    this.order = this.props.navigation.state.params.order;
    const parcels = this.props.navigation.state.params.parcels;
    this.parcels = parcels; // parcels.map(parcel => parcel.scanned ? { ...parcel, state: consts.PARCEL_STATE.NORMAL } : { ...parcel, state: consts.PARCEL_STATE.MISSING });

    this.state = {
      tabIndex: 0,
      parcels: this.parcels,
      submitting: false,

      flashOn: false,
      foundParcel: false,

      searchText: "",

      showParcelState: false,
      currentParcel: null,
    };

    this.filterParcels = debounce(this.filterParcels, 1000);
  }

  async componentDidMount() {
    this.props.navigation.setParams({ onPressMenu: this.onPressMenu });
  }

  componentWillUnmount() {

  }

  onPressMenu = () => {
    this.dropdownMenu.show();
  }

  changeSearchHandler = (val) => {
    this.setState({ searchText: val });
    this.filterParcels();
  }

  filterParcels = () => {
    const { searchText } = this.state;
    const parcels = this.parcels.filter(parcel => parcel.id.includes(searchText.toUpperCase()));
    this.setState({
      parcels
    });
  }

  onChangeParcelState = (parcelId) => {
    // const parcel = this.state.parcels[index];
    // this.props.navigation.navigate('ParcelState', { parcel: parcel, stop: this.stop, parent: this });
    const parcel = this.parcels.find(parcel => parcel.id === parcelId);
    if (parcel) {
      this.setState({ currentParcel: parcel, showParcelState: true });
    }
  }

  changeParcelState = (parcelId, state) => {
    const index = this.parcels.findIndex(parcel => parcelId === parcel.id);
    if (index >= 0) {
      this.parcels[index].state = state;
      const parcels = this.parcels.filter(parcel => parcel.id.includes(this.state.searchText.toUpperCase()));
      this.setState({
        parcels,
        currentParcel: null,
        showParcelState: false,
      });
    }
    else {
      this.setState({ currentParcel: null, showParcelState: false });
    }
  }

  renderParcel = (item) => {
    const parcel = item.item;
    const disabled = !parcel.scanned;
    const volume = parcel.w * parcel.h * parcel.l;
    return (
      <TouchableDebounce key={`${Math.floor(Math.random() * 100000)}`} onPress={() => this.onChangeParcelState(parcel.id)}
        disabled={disabled}
        style={{ opacity: disabled ? 0.8 : 1 }}>
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
              <View style={{ flexDirection: "row" }}>
                <View style={{ flexDirection: "row", flex: 2 }}>
                  <Octicon name="package" color={AppColors.grey2} size={24} />
                  <Text style={[styles.parcelAddress, { marginLeft: 5 }]}>{volume > 0 ? `${parcel.l.toFixed(1)} × ${parcel.w.toFixed(1)} × ${parcel.h.toFixed(1)}` : "---"}</Text>
                </View>
                <View style={{ flexDirection: "row", flex: 1 }}>
                  <MaterialCommunityIcon name="weight-kilogram" color={AppColors.grey2} size={24} />
                  <Text style={[styles.parcelAddress, { marginLeft: 5 }]}>{parcel.weight > 0 ? `${parcel.weight.toFixed(2)} kg` : "---"}</Text>
                </View>
              </View>
              {/* <Text style={styles.parcelAddress}>{parcel.product.name}</Text> */}
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
        contentContainerStyle={{ paddingBottom: 5 }}
      />
    );
  }

  renderScannedParcels = () => {
    const { parcels } = this.state;
    return <>
      <View style={styles.searchSection}>
        <View style={styles.searchBoxContainer}>
          <Ionicon name="ios-search" color={AppColors.grey2} size={20} />
          <TextInput
            style={styles.searchBox}
            value={this.state.searchText}
            autoCapitalize="none"
            onChangeText={(val) => this.changeSearchHandler(val)}
            placeholder="Search with"
            placeholderTextColor={AppColors.grey2}
          />
        </View>
      </View>
      {this.renderTabPane(parcels, parcel => parcel.scanned)}
    </>;
  }

  renderUnscannedParcels = () => {
    const { parcels } = this.state;
    return this.renderTabPane(parcels, parcel => !parcel.scanned)
  }

  onFinish = () => {
    const { parcels } = this.state;
    if (this.props.navigation.state.params.onFinish) {
      this.props.navigation.state.params.onFinish(parcels);
      this.props.navigation.pop();
    }
  }

  render() {
    const { currentParcel, showParcelState, parcels } = this.state;
    const scannedNum = parcels.filter(parcel => parcel.scanned).length;
    const unscannedNum = parcels.filter(parcel => !parcel.scanned).length;

    return (
      <SafeAreaView style={{ flex: 1 }}>
        {showParcelState && <Modal
          visible={showParcelState}
          transparent={true}
          animationType="fade"
        >
          <TouchableDebounce activeOpacity={1} style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: "center", alignItems: "center", }}
            onPress={() => {
              this.setState({ showParcelState: false, currentParcel: null });
            }}>
            <View style={{ width: "80%", backgroundColor: AppColors.grey4 }}>
              <View style={{ paddingVertical: 10 }}>
                <Text style={styles.summaryValue}>{currentParcel.id}</Text>
              </View>
              <TouchableDebounce style={styles.actionItemContainer} onPress={() => this.changeParcelState(currentParcel.id, consts.PARCEL_STATE.NORMAL)}>
                <Text style={[styles.actionItemText, { color: AppColors.text }]}>NORMAL</Text>
              </TouchableDebounce>
              {isDelivery(this.stop) ?
                <>
                  <TouchableDebounce style={styles.actionItemContainer} onPress={() => this.changeParcelState(currentParcel.id, consts.PARCEL_STATE.DAMAGED_IN_UNLOADING)}>
                    <Text style={[styles.actionItemText, { color: AppColors.danger }]}>DAMAGED IN UNLOADING</Text>
                  </TouchableDebounce>
                  <TouchableDebounce style={styles.actionItemContainer} onPress={() => this.changeParcelState(currentParcel.id, consts.PARCEL_STATE.DAMAGED_IN_TRANSIT)}>
                    <Text style={[styles.actionItemText, { color: AppColors.danger }]}>DAMAGED IN TRANSIT</Text>
                  </TouchableDebounce>
                  <TouchableDebounce style={styles.actionItemContainer} onPress={() => this.changeParcelState(currentParcel.id, consts.PARCEL_STATE.CUSTOMER_REFUSED)}>
                    <Text style={[styles.actionItemText, { color: AppColors.danger }]}>CUSTOMER REFUSED</Text>
                  </TouchableDebounce>
                </> :
                <>
                  <TouchableDebounce style={styles.actionItemContainer} onPress={() => this.changeParcelState(currentParcel.id, consts.PARCEL_STATE.DAMAGED_IN_LOADING)}>
                    <Text style={[styles.actionItemText, { color: AppColors.danger }]}>DAMAGED IN LOADING</Text>
                  </TouchableDebounce>
                  {/* <TouchableDebounce style={styles.actionItemContainer} onPress={() => this.changeParcelState(currentParcel.id, consts.PARCEL_STATE.MISSING)}>
                    <Text style={[styles.actionItemText, { color: AppColors.danger }]}>PARCEL IS MISSING</Text>
                  </TouchableDebounce> */}
                </>}
            </View>
          </TouchableDebounce>
        </Modal>}
        <CommonTabView tabs={
          [{
            title: `SCANNED (${scannedNum})`,
            render: this.renderScannedParcels
          }, {
            title: `MISSING (${unscannedNum})`,
            render: this.renderUnscannedParcels
          }]
        } />
        <View style={[AppStyles.bottomContainer]}>
          <TouchableDebounce style={AppStyles.bottomButtonContainer} activeOpacity={0.6}
            onPress={() => this.onFinish()}>
            <Text style={AppStyles.bottomButtonText}>{"FINISH"}</Text>
          </TouchableDebounce>
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
    submitLoadingFinished: sagaSubmitLoadingFinished,
  }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(SelectDamagesScreen);

const styles = StyleSheet.create({
  value: {
    textAlign: 'right',
    color: AppColors.text,
    fontFamily: AppFonts.main.medium,
    fontSize: 14,
    width: 80,
  },

  deliveryListItem: {
    borderBottomColor: AppColors.grey3,
    borderBottomWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  label: {
    color: AppColors.text,
    fontFamily: AppFonts.main.regular,
    fontSize: 13,
    flex: 1
  },

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
  summaryLabel: {
    color: AppColors.grey,
    fontFamily: AppFonts.main.medium,
    textAlign: 'center',
    fontSize: 14,
  },
  summaryValue: {
    color: AppColors.text,
    fontFamily: AppFonts.main.medium,
    textAlign: 'center',
    fontSize: 20,
  },
  bottomBar: {
    marginTop: -40,
    backgroundColor: "#00000080"
  },
  bottomBarRow: {
    flexDirection: "row",
    marginHorizontal: 10,
    alignItems: "center"
  },
  flashButtonContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    backgroundColor: AppColors.danger,
    alignItems: "center"
  },
  textSummary: {
    color: AppColors.white,
    fontFamily: AppFonts.main.medium,
    fontSize: 14,
    flex: 1
  },
  actionItemContainer: {
    backgroundColor: AppColors.white,
    flexDirection: 'row',
    marginBottom: 1,
    paddingVertical: 15,
    paddingLeft: 20,
    paddingRight: 10
  },
  actionItemText: {
    color: AppColors.text,
    fontFamily: AppFonts.main.medium,
    fontSize: 16,
    justifyContent: "center",
  },

  searchSection: {
    backgroundColor: AppColors.white,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 2,
  },

  searchBoxContainer: {
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: AppColors.grey2,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    paddingLeft: 10,
  },

  searchBox: {
    flex: 1,
    paddingLeft: 10,
    color: AppColors.text,
    fontFamily: AppFonts.main.regular,
    fontSize: 14,
    paddingVertical: 3
  },
});