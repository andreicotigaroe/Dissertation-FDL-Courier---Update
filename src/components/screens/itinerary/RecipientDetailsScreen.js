import React from 'react';
import {
  View,
  Alert,
  Text,
  Image,
  Modal,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import {connect} from 'react-redux';
import {default as Ionicon} from 'react-native-vector-icons/Ionicons';
import {default as MaterialCommunityIcon} from 'react-native-vector-icons/MaterialCommunityIcons';
import SignaturePad from 'react-native-signature-pad';
import Geolocation from 'react-native-geolocation-service';
import Moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';

import {DotIndicator} from 'react-native-indicators';

import {
  AppColors,
  HeaderStyle,
  AppFonts,
  AppStyles,
} from '../../../assets/styles';
import {consts} from '../../../assets/values';
import {bindActionCreators} from 'redux';
import {calculate_age} from '../../../utils';
import TouchableDebounce from '../common/TouchableDebounce';
import { submitDeliverySuccess, submitDeliverySuccessOffline } from '~/redux/actions/route';

class RecipientDetailsScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      ...HeaderStyle,
      title: 'FINISH DELIVERY',
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
    };
  };

  constructor(props) {
    super(props);

    const {
      recipientName,
      signature,
      houseNumber,
    } = this.props.navigation.state.params;

    this.order = this.props.navigation.state.params.order;
    this.parcels = this.props.navigation.state.params.parcels;
    this.leave_place = this.props.navigation.state.params.leave_place;
    this.requireHouseNumber = this.leave_place === consts.LEAVE_PLACE.NEIGHBOR;

    this.state = {
      submitting: false,
      recipientName: recipientName || '',
      houseNumber: houseNumber || '',
      showSignature: false,
      signatureKey: Math.floor(Math.random(100) * 100),
      signature: signature,
      enableScrollView: true,
      parcelsPicture: null,
      deliveredLocation: null,

      visibleDOBPicker: false,
      recipientDOB: null, // Only for age restricted orders
      cashReceived: this.order.cod ? '0.00' : null, // Only for COD orders
    };

    this.scrollView = null;
  }

  async componentDidMount() {
    this.props.navigation.setParams({onPressMenu: this.onPressMenu});
    setTimeout(() => {
      this.setState({showSignature: true});
    }, 100);

    Geolocation.getCurrentPosition(
      (position) => {
        console.log('[Finish Delivery] Geolocation Error: ', position);
        this.setState({
          deliveredLocation: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      },
      (error) => {
        console.log('[Finish Delivery] Geolocation Error: ', error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
        forceRequestLocation: true,
      },
    );
  }

  componentWillUnmount() {}

  signaturePadChange = ({base64DataUrl}) => {
    this.setState({
      ...this.state,
      signature: base64DataUrl,
    });
  };

  onClearSignature = () => {
    this.setState({
      signatureKey: Math.floor(Math.random(10000) * 10000),
      signature: null,
      showSignature: false,
    });
    setTimeout(() => {
      this.setState({showSignature: true});
    }, 100);
  };

  onPressTakePicture = () => {
    this.props.navigation.navigate('Camera', {
      setPicture: (base64) => {
        console.log(base64.substr(0, 100));
        this.setState({parcelsPicture: base64});
      },
    });
  };

  onPressMenu = () => {
    this.dropdownMenu.show();
  };

  onSubmit = () => {
    const {
      recipientName,
      houseNumber,
      parcelsPicture,
      signature,
      deliveredLocation,
      recipientDOB,
      cashReceived,
    } = this.state;

    if (!recipientName) {
      Alert.alert(
        'Error',
        "Recipient's name is required to finish the delivery.",
      );
      return;
    }
    if (this.order.age_restricted) {
      if (!recipientDOB) {
        Alert.alert(
          'Error',
          "Recipient's DOB is required to deliver the shipments.",
        );
        return;
      }
      if (calculate_age(recipientDOB) < 18) {
        Alert.alert(
          'Cannot Deliver',
          'The shipments cannot be delivered to the receiver because he is under 18.',
        );
        return;
      }
    }
    if (this.leave_place === consts.LEAVE_PLACE.NEIGHBOR) {
      if (!houseNumber) {
        Alert.alert(
          'Error',
          "Recipient's house number is required to finish the delivery.",
        );
        return;
      }
    }
    if (!parcelsPicture) {
      Alert.alert(
        'Error',
        'A picture of the delivery are required to finish the delivery.',
      );
      return;
    }
    if (!signature) {
      Alert.alert(
        'Error',
        "Recipient's signature is required to finish the delivery.",
      );
      return;
    }

    const cashAmount = parseFloat(cashReceived);
    if (this.order.cod && (cashAmount <= 0 || Number.isNaN(cashAmount))) {
      Alert.alert(
        'Error',
        "Amount of received cash must be greater than 0.00.",
      );
      return;
    }

    const payload =  {
      recipient_name: recipientName,
      recipient_signature: signature,
      leave_place: this.leave_place,
      recipient_house_number: houseNumber || null,
      leave_picture: parcelsPicture,
      parcels: this.parcels,
      delivered_location: deliveredLocation,
      recipient_dob: recipientDOB
        ? Moment(recipientDOB).format('YYYY-MM-DD')
        : null,
      cash_received: this.order.cod ? cashAmount : null,
      routeId: this.props.route.id
    };

    this.props.submitDeliverySuccessOffline(payload, this.order.id);
    this.props.submitDeliverySuccess(payload, new Date(), this.order.id);
    this.props.navigation.pop(2);
  };

  render() {
    const {
      recipientName,
      houseNumber,
      signature,
      parcelsPicture,
      visibleDOBPicker,
      recipientDOB,
    } = this.state;
    return (
      <SafeAreaView style={{flex: 1}}>
        {visibleDOBPicker && (
          <DateTimePicker
            value={this.state.recipientDOB || new Date()}
            mode={'date'}
            display="spinner"
            onChange={(event, selDate) => {
              console.log('Date Changed:', selDate);
              if (selDate)
                this.setState({recipientDOB: selDate, visibleDOBPicker: false});
            }}
          />
        )}
        <View
          style={{flex: 1}}
          onStartShouldSetResponderCapture={() => {
            if (this.scrollView) {
              this.scrollView.setNativeProps({scrollEnabled: true});
              return false;
            }
            return true;
          }}>
          <Modal
            visible={this.state.submitting}
            transparent={true}
            animationType="fade">
            <View style={AppStyles.loadingContainer}>
              <DotIndicator color="white" size={8} />
            </View>
          </Modal>
          <ScrollView
            contentContainerStyle={{paddingHorizontal: 10, paddingVertical: 20}}
            nestedScrollEnabled={true}
            ref={(r) => {
              this.scrollView = r;
            }}>
            <View style={AppStyles.roundSection}>
              <View style={AppStyles.formGroup}>
                <Text style={AppStyles.label}>Name of the Recipient</Text>
                <TextInput
                  style={[AppStyles.textInput]}
                  value={this.state.recipientName}
                  autoCapitalize="words"
                  onChangeText={(val) => this.setState({recipientName: val})}
                />
              </View>

              {this.order.age_restricted && (
                <View style={{flex: 1}}>
                  <View style={AppStyles.formGroup}>
                    <Text style={AppStyles.label}>Recipient's DOB</Text>
                    <TouchableDebounce
                      style={[AppStyles.textInput, {justifyContent: 'center'}]}
                      onPress={() => this.setState({visibleDOBPicker: true})}>
                      {recipientDOB && (
                        <Text style={styles.timeText}>
                          {Moment(recipientDOB).format('DD/MM/YYYY')}
                        </Text>
                      )}
                    </TouchableDebounce>
                  </View>
                </View>
              )}

              {this.order.cod && (
                <View style={{flex: 1}}>
                  <View style={AppStyles.formGroup}>
                    <Text style={AppStyles.label}>
                      Amount of Cash Received({this.order.cod_amount ? '£ ' + this.order.cod_amount.toFixed(2) : "£"})
                    </Text>
                    <TextInput
                      style={[AppStyles.textInput]}
                      value={this.state.cashReceived}
                      keyboardType={'numeric'}
                      onBlur={(e) => {
                        var cashReceived = parseFloat(this.state.cashReceived);
                        if (Number.isNaN(cashReceived))
                          cashReceived = 0;
                        this.setState({cashReceived: cashReceived.toFixed(2)});
                      }}
                      onChangeText={(val) =>
                        this.setState({cashReceived: val})
                      }
                    />
                  </View>
                </View>
              )}

              {this.requireHouseNumber && (
                <View style={{flex: 1}}>
                  <View style={AppStyles.formGroup}>
                    <Text style={AppStyles.label}>House Number</Text>
                    <TextInput
                      style={[AppStyles.textInput]}
                      value={houseNumber}
                      autoCapitalize="words"
                      onChangeText={(val) => this.setState({houseNumber: val})}
                    />
                  </View>
                </View>
              )}

              <View style={AppStyles.formGroup}>
                <Text style={AppStyles.label}>Picture of the Delivery</Text>
                <View style={{paddingVertical: 10}}>
                  <TouchableDebounce
                    onPress={() => this.onPressTakePicture()}
                    activeOpacity={0.6}>
                    <View
                      style={{
                        width: '100%',
                        height: 240,
                        backgroundColor: AppColors.grey3,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      {parcelsPicture ? (
                        <Image
                          source={{
                            uri: `data:image/jpeg;base64,${parcelsPicture}`,
                          }}
                          resizeMode="contain"
                          style={{width: '100%', height: 240}}
                        />
                      ) : (
                        <Ionicon
                          name="camera"
                          color={AppColors.white}
                          size={96}
                        />
                      )}
                    </View>
                  </TouchableDebounce>
                </View>
              </View>
            </View>

            <Text
              style={[
                AppStyles.sectionTitle,
                {color: AppColors.grey, textAlign: 'center'},
              ]}>
              RECIPIENT'S SIGNATURE
            </Text>

            {this.state.showSignature && (
              <View>
                <View
                  style={[styles.signatureContainer, {paddingHorizontal: 0}]}
                  onStartShouldSetResponderCapture={() => {
                    if (this.scrollView) {
                      this.scrollView.setNativeProps({scrollEnabled: false});
                      return false;
                    }
                    return true;
                  }}>
                  <SignaturePad
                    key={this.state.signatureKey}
                    onError={(error) => console.log(error)}
                    onChange={this.signaturePadChange}
                    style={{flex: 1, backgroundColor: '#fff', height: 160}}
                  />
                </View>
                <View style={{alignItems: 'flex-end'}}>
                  <TouchableDebounce
                    style={styles.eraseButtonContainer}
                    activeOpacity={0.6}
                    onPress={() => this.onClearSignature()}>
                    <MaterialCommunityIcon
                      name="eraser"
                      size={24}
                      color={AppColors.white}
                    />
                    <Text
                      style={[AppStyles.bottomButtonText, {marginLeft: 10}]}>
                      CLEAR
                    </Text>
                  </TouchableDebounce>
                </View>
              </View>
            )}
          </ScrollView>
          <View style={AppStyles.bottomContainer}>
            <TouchableDebounce
              style={AppStyles.bottomButtonContainer}
              activeOpacity={0.6}
              onPress={() => this.onSubmit()}>
              <Text style={AppStyles.bottomButtonText}>COMPLETE</Text>
            </TouchableDebounce>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = (state) => ({
  token: state.auth.token,
  user: state.auth.user,
  route: state.route,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      submitDeliverySuccess: submitDeliverySuccess,
      submitDeliverySuccessOffline: submitDeliverySuccessOffline,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RecipientDetailsScreen);

const styles = StyleSheet.create({
  eraseButtonContainer: {
    width: '100%',
    height: 45,
    backgroundColor: AppColors.warning,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
  },
  signatureContainer: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 5,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: AppColors.grey,
  },
  timeText: {
    fontFamily: AppFonts.main.regular,
    fontSize: 13,
    color: AppColors.text,
  },
});
