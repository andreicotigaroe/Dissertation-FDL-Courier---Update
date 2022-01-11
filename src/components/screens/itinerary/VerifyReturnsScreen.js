import React from 'react';
import {
  View,
  Alert,
  Text,
  Modal,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Vibration,
} from 'react-native';
import {connect} from 'react-redux';
import SwipeButton from 'rn-swipe-button';
import {default as MaterialIcon} from 'react-native-vector-icons/MaterialIcons';
import {default as FontAwesomeIcon} from 'react-native-vector-icons/FontAwesome';
import {default as MaterialCommunityIcon} from 'react-native-vector-icons/MaterialCommunityIcons';
import {default as Ionicon} from 'react-native-vector-icons/Ionicons';
import {default as Octicon} from 'react-native-vector-icons/Octicons';

import QRCodeScanner from 'react-native-qrcode-scanner';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';

import {
  AppColors,
  HeaderStyle,
  AppFonts,
  AppStyles,
} from '../../../assets/styles';
import {consts} from '../../../assets/values';
import {bindActionCreators} from 'redux';
import {sagaSubmitLoadingFinished} from '../../../redux/sagas/route';
import Waiting from '../../widgets/Waiting';
import {TextInput} from 'react-native-gesture-handler';
import TouchableDebounce from '../common/TouchableDebounce';

class VerifyReturnsScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      ...HeaderStyle,
      title: 'VERIFY RETURNS',
      headerRight: () => {
        return (
          <Menu onSelect={(value) => params.onPressMenu(value)}>
            <MenuTrigger style={{padding: 10}}>
              <MaterialIcon
                name="more-vert"
                color={AppColors.grey2}
                size={28}
              />
            </MenuTrigger>
            <MenuOptions optionsContainerStyle={{marginTop: 50}}>
              <MenuOption
                value={'manual_input'}
                style={AppStyles.headerMenuItemContainer}>
                <Text style={AppStyles.headerMenuItemText}>Cannot Scan?</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        );
      },
    };
  };

  constructor(props) {
    super(props);

    this.stop = this.props.navigation.state.params.stop;
    this.orders = this.props.navigation.state.params.orders;
    var parcels = [];
    this.orders.forEach((order) => {
      parcels = parcels.concat(order.parcels);
    });
    parcels = parcels.map((parcel) => ({
      ...parcel,
      scanned: false,
    }));

    this.state = {
      tabIndex: 0,
      parcels: parcels,
      submitting: false,

      inputParcelID: '',

      flashOn: false,
      foundParcel: false,
      foundWrongParcel: false,
      visibleParcelInputModal: false,
    };

    this.scanner = null;
    this.dropdownMenu = null;
    this.camera = null;
    this.resetSwipeButton = null;
  }

  async componentDidMount() {
    this.props.navigation.setParams({onPressMenu: this.onPressMenu});
  }

  componentWillUnmount() {}

  addParcelHandler = () => {
    const {inputParcelID, parcels} = this.state;
    const parcel = parcels.find(
      (parcel) => parcel.id === inputParcelID.toUpperCase(),
    );
    if (parcel) {
      parcel.scanned = true;
      parcel.state = consts.PARCEL_STATE.NORMAL;
      this.setState({parcels, visibleParcelInputModal: false});
    } else {
      Alert.alert('Not Found', 'The parcel with that No does not exist.');
    }
  };

  onReadCode = (e) => {
    if (this.scanner) {
      const parcels = JSON.parse(JSON.stringify(this.state.parcels));
      const parcel = parcels.find((parcel) => parcel.id === e.data);
      if (parcel) {
        if (!parcel.scanned) {
          parcel.scanned = true;
          parcel.state = consts.PARCEL_STATE.NORMAL;
          this.setState({parcels, foundParcel: true});
          Vibration.vibrate(500);
        }
      } else if (e.data.substr(0, 3) === 'FDL') {
        this.setState({parcels, foundWrongParcel: true});
      }
      setTimeout(() => {
        try {
          this.setState({
            foundParcel: false,
            foundWrongParcel: false,
          });
          this.scanner.reactivate();
        } catch (err) {}
      }, 1500);
    }
  };

  onFinishMarkingDamages = (_parcels) => {
    const {parcels} = this.state;
    _parcels.forEach((_parcel) => {
      const parcel = parcels.find((parcel) => parcel.id === _parcel.id);
      if (parcel) {
        parcel.state = _parcel.state;
      }
    });
    this.setState({parcels});
  };

  onPressMenu = (value) => {
    if (value === 'manual_input') {
      this.setState({visibleParcelInputModal: true, inputParcelID: ''});
    }
  };

  onNext = () => {
    const parcels = JSON.parse(JSON.stringify(this.state.parcels));
    parcels.forEach((parcel) => {
      if (!parcel.scanned) parcel.state = consts.PARCEL_STATE.MISSING;
    });
    this.props.navigation.replace('ReturnStatus', {
      parcels: parcels,
      stop: this.stop,
      orders: this.orders,
    });
  };

  onFinishScan = () => {
    const {parcels} = this.state;
    const scannedNum = parcels.filter((parcel) => parcel.scanned).length;
    const parcelNum = parcels.length;

    if (scannedNum === parcelNum) {
      this.onNext();
    } else {
      Alert.alert(
        'Scan Confirmation',
        'Are you sure you scanned all the parcels to be collected? Not scanned parcels will be regarded as missing ones.',
        [
          {
            text: 'NO',
            style: 'cancel',
            onPress: () => {
              if (this.resetSwipeButton) this.resetSwipeButton();
            },
          },
          {
            text: 'YES',
            onPress: () => this.onNext(),
          },
        ],
      );
    }
  };

  renderParcel = (item) => {
    const parcel = item.item;
    const disabled = parcel.state === consts.PARCEL_STATE.NOT_RECEIVED;
    const volume = parcel.w * parcel.h * parcel.l;
    return (
      <TouchableDebounce
        key={`${Math.floor(Math.random() * 100000)}`}
        disabled={disabled}
        style={{opacity: disabled ? 0.8 : 1}}>
        <View style={styles.parcelContainer}>
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              marginRight: 10,
            }}>
            <Text style={styles.parcelIndex}># {item.index + 1}</Text>
          </View>
          <View style={{flex: 1, paddingLeft: 10}}>
            <View>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={styles.parcelTitle}>{parcel.id}</Text>
                {parcel.state == consts.PARCEL_STATE.MISSING && (
                  <View style={AppStyles.badgeDangerContainer}>
                    <Text style={AppStyles.badgeDangerText}>MISSING</Text>
                  </View>
                )}
              </View>
              <View style={{flexDirection: 'row'}}>
                <View style={{flexDirection: 'row', flex: 2}}>
                  <Octicon name="package" color={AppColors.grey2} size={24} />
                  <Text style={[styles.parcelAddress, {marginLeft: 5}]}>
                    {volume > 0
                      ? `${parcel.l.toFixed(1)} × ${parcel.w.toFixed(
                          1,
                        )} × ${parcel.h.toFixed(1)}`
                      : '---'}
                  </Text>
                </View>
                <View style={{flexDirection: 'row', flex: 1}}>
                  <MaterialCommunityIcon
                    name="weight-kilogram"
                    color={AppColors.grey2}
                    size={24}
                  />
                  <Text style={[styles.parcelAddress, {marginLeft: 5}]}>
                    {parcel.weight > 0
                      ? `${parcel.weight.toFixed(2)} kg`
                      : '---'}
                  </Text>
                </View>
              </View>
              {/* <Text style={styles.parcelAddress}>{parcel.product.name}</Text> */}
            </View>
          </View>
        </View>
      </TouchableDebounce>
    );
  };

  renderTabPane = (cb) => {
    const parcels = this.state.parcels.filter((parcel) => cb(parcel));
    return (
      <FlatList
        data={parcels}
        renderItem={this.renderParcel}
        // keyExtractor={(item, index) => `${index}`}
        contentContainerStyle={{paddingBottom: 20}}
      />
    );
  };

  renderScanned = () => {
    return this.renderTabPane((parcel) => parcel.scanned);
  };

  render() {
    const {
      flashOn,
      parcels,
      foundParcel,
      foundWrongParcel,
      visibleParcelInputModal,
      inputParcelID,
    } = this.state;
    const scannedParcels = parcels.filter((parcel) => parcel.scanned);

    return (
      <SafeAreaView style={{flex: 1}}>
        <Waiting
          visible={this.props.route.calling}
          title={'Submitting loading data...'}
        />

        {visibleParcelInputModal && (
          <Modal
            visible={visibleParcelInputModal}
            transparent={true}
            animationType="fade">
            <TouchableDebounce
              activeOpacity={1}
              disabled={false}
              style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => {
                this.setState({
                  visibleParcelInputModal: false,
                  currentParcel: null,
                });
              }}>
              <View style={{width: '80%', backgroundColor: AppColors.grey4}}>
                <View style={{paddingVertical: 10}}>
                  <Text style={styles.summaryValue}>MANUAL INPUT</Text>
                </View>
                <View
                  style={{
                    backgroundColor: 'white',
                    flexDirection: 'row',
                    paddingHorizontal: 10,
                  }}>
                  <View style={[AppStyles.formGroup, {paddingVertical: 20}]}>
                    <Text style={AppStyles.label}>Parcel No</Text>
                    <TextInput
                      style={[AppStyles.textInput]}
                      value={inputParcelID}
                      autoCapitalize="characters"
                      onChangeText={(val) =>
                        this.setState({inputParcelID: val})
                      }
                    />
                  </View>
                </View>
                <TouchableDebounce
                  style={AppStyles.bottomButtonContainer}
                  activeOpacity={0.6}
                  onPress={() => this.addParcelHandler()}>
                  <Text style={AppStyles.bottomButtonText}>ADD</Text>
                </TouchableDebounce>
              </View>
            </TouchableDebounce>
          </Modal>
        )}

        <View
          style={{
            height: 250,
            justifyContent: 'center',
            overflow: 'hidden',
            alignItems: 'center',
          }}>
          <QRCodeScanner
            ref={(r) => {
              this.scanner = r;
            }}
            showMarker={true}
            reactivate={false}
            // reactivateTimeout={2000}
            markerStyle={{
              borderWidth: foundParcel || foundWrongParcel ? 0 : 1,
              width: 180,
              height: 180,
              marginTop: -40,
            }}
            cameraStyle={{height: 250}}
            cameraProps={{flashMode: flashOn ? 'torch' : 'off'}}
            onRead={this.onReadCode}
            vibrate={false}
          />
          {foundParcel && (
            <View
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundColor: '#00ff0060',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Ionicon
                name="checkmark-circle-outline"
                color={'#ffffff'}
                size={120}
              />
            </View>
          )}
          {foundWrongParcel && (
            <View
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundColor: '#ff000060',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Ionicon
                name="close-circle-outline"
                color={'#ffffff'}
                size={120}
              />
            </View>
          )}
        </View>

        <View style={styles.bottomBar}>
          <View style={styles.bottomBarRow}>
            <Text style={styles.textSummary}>
              SCAN {this.state.parcels.length} PARCELS
            </Text>
            <TouchableDebounce
              style={[styles.flashButtonContainer, {marginLeft: 10}]}
              activeOpacity={0.6}
              onPress={() => this.setState({flashOn: !this.state.flashOn})}>
              <MaterialCommunityIcon
                name={flashOn ? 'flashlight-off' : 'flashlight'}
                color={AppColors.white}
                size={24}
              />
            </TouchableDebounce>
          </View>
        </View>

        <View style={{flex: 1}}>
          <Text
            style={{
              fontFamily: AppFonts.main.medium,
              width: '100%',
              fontSize: 16,
              textAlign: 'center',
              paddingVertical: 10,
            }}>
            {scannedParcels.length} / {this.state.parcels.length} Parcels
            Scanned
          </Text>
          {this.renderScanned()}
        </View>
        <View style={[AppStyles.bottomContainer, {paddingHorizontal: '12%'}]}>
          {/* <TouchableDebounce style={AppStyles.bottomButtonContainer} activeOpacity={0.6} onPress={() => this.onFinishScan()}>
            <Text style={AppStyles.bottomButtonText}>SCAN FINISHED >></Text>
          </TouchableDebounce> */}
          <SwipeButton
            thumbIconBackgroundColor={AppColors.primary}
            thumbIconComponent={() => (
              <FontAwesomeIcon
                name="angle-double-right"
                color={AppColors.white}
                size={32}
                style={{opacity: 0.6}}
              />
            )}
            title="VERIFICATION FINISHED"
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
              borderWidth: 0,
            }}
            thumbIconStyles={{
              // borderRadius: 0,
              borderWidth: 0,
            }}
            titleStyles={{
              fontFamily: AppFonts.main.medium,
              fontSize: 14,
            }}
            titleColor={AppColors.text}
            titleFontSize={16}
            // shouldResetAfterSuccess={true}
            forceReset={(reset) => {
              this.resetSwipeButton = reset;
            }}
          />
        </View>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = (state) => ({
  token: state.auth.token,
  user: state.auth.user,
  route: state.route,
  network: state.network,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      submitLoadingFinished: sagaSubmitLoadingFinished,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(VerifyReturnsScreen);

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
    justifyContent: 'center',
  },
  label: {
    color: AppColors.text,
    fontFamily: AppFonts.main.regular,
    fontSize: 13,
    flex: 1,
  },

  parcelContainer: {
    backgroundColor: AppColors.white,
    flexDirection: 'row',
    marginBottom: 2,
    paddingVertical: 10,
    paddingLeft: 20,
    paddingRight: 10,
  },

  parcelIndex: {
    color: AppColors.textLight,
    textAlign: 'center',
    fontFamily: AppFonts.main.semibold,
    marginBottom: 5,
    fontSize: 14,
  },
  orderTitle: {
    color: AppColors.grey,
    fontFamily: AppFonts.main.medium,
    fontSize: 14,
    paddingVertical: 10,
    textAlign: 'center',
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
    backgroundColor: '#00000080',
  },
  bottomBarRow: {
    flexDirection: 'row',
    marginHorizontal: 10,
    alignItems: 'center',
  },
  flashButtonContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    backgroundColor: AppColors.danger,
    alignItems: 'center',
  },
  addPackageContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textSummary: {
    color: AppColors.white,
    fontFamily: AppFonts.main.medium,
    fontSize: 14,
    flex: 1,
  },
  actionItemContainer: {
    backgroundColor: AppColors.white,
    flexDirection: 'row',
    marginBottom: 1,
    paddingVertical: 15,
    paddingLeft: 20,
    paddingRight: 10,
  },
  actionItemText: {
    color: AppColors.text,
    fontFamily: AppFonts.main.medium,
    fontSize: 16,
    justifyContent: 'center',
  },
});
