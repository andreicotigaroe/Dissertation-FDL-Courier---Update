import React from 'react';
import {
  View,
  Alert,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {connect} from 'react-redux';
import Geolocation from 'react-native-geolocation-service';
import {default as Ionicon} from 'react-native-vector-icons/Ionicons';

import {AppColors, HeaderStyle, AppFonts, AppStyles} from '~/assets/styles';
import {consts} from '~/assets/values';
import {bindActionCreators} from 'redux';
import {sagaSubmitDeliveryFailure} from '~/redux/sagas/route';
import TouchableDebounce from '../common/TouchableDebounce';
import {
  submitDeliveryFailure,
  submitDeliveryFailureOffline,
} from '~/redux/actions/route';

class FailureFinishScreen extends React.Component {
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

    this.order = this.props.navigation.state.params.order;
    this.failure_reason = this.props.navigation.state.params.failure_reason;
    this.parcels = this.props.navigation.state.params.parcels;
    this.state = {
      submitting: false,
      parcelsPicture: null,
    };
  }

  async componentDidMount() {
    this.props.navigation.setParams({onPressMenu: this.onPressMenu});
  }

  componentWillUnmount() {}

  onPressMenu = () => {
    this.dropdownMenu.show();
  };

  onPressTakePicture = () => {
    this.props.navigation.navigate('Camera', {
      setPicture: (base64) => {
        console.log(base64.substr(0, 100));
        this.setState({parcelsPicture: base64});
      },
    });
  };

  onSubmit = () => {
    if (!this.state.parcelsPicture) {
      Alert.alert('Error', 'Please take a picture of the destination.');
      return;
    }

    Geolocation.getCurrentPosition(
      (position) => {
        const payload = {
          reason: this.failure_reason,
          leave_picture: this.state.parcelsPicture,
          parcels: this.parcels,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          routeId: this.props.route.id,
        };

        this.props.submitDeliveryFailureOffline(payload, this.order.id);
        this.props.submitDeliveryFailure(payload, new Date(), this.order.id);
        this.props.navigation.pop(2);
      },
      (error) => {
        const payload = {
          reason: this.failure_reason,
          leave_picture: this.state.parcelsPicture,
          parcels: this.parcels,
          location: null,
          routeId: this.props.route.id,
        };

        this.props.submitDeliveryFailureOffline(payload, this.order.id);
        this.props.submitDeliveryFailure(payload, new Date(), this.order.id);
        this.props.navigation.pop(2);
      },
      {
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 1000,
        forceRequestLocation: true,
      },
    );
  };

  render() {
    const {parcelsPicture} = this.state;
    return (
      <SafeAreaView style={{flex: 1}}>
        <View style={{flex: 1, padding: 20}}>
          <ScrollView>
            {this.failure_reason ===
              consts.DELIVERY_FAILURE_TYPES.NO_CUSTOMER && (
              <Text
                style={[
                  AppStyles.text,
                  {
                    color: AppColors.danger,
                    fontSize: 18,
                    lineHeight: 24,
                    textAlign: 'center',
                  },
                ]}>
                The delivery of the order was failed because the customer is not
                available in the destination.
              </Text>
            )}
            {this.failure_reason === consts.DELIVERY_FAILURE_TYPES.REJECTED && (
              <Text
                style={[
                  AppStyles.text,
                  {
                    color: AppColors.danger,
                    fontSize: 18,
                    lineHeight: 24,
                    textAlign: 'center',
                  },
                ]}>
                The delivery of the order was failed because customer rejected
                it.
              </Text>
            )}
            {this.failure_reason ===
              consts.DELIVERY_FAILURE_TYPES.SHOP_CLOSED && (
              <Text
                style={[
                  AppStyles.text,
                  {
                    color: AppColors.danger,
                    fontSize: 18,
                    lineHeight: 24,
                    textAlign: 'center',
                  },
                ]}>
                The delivery of the order was failed because the shop was
                closed.
              </Text>
            )}
            {this.failure_reason ===
              consts.DELIVERY_FAILURE_TYPES.DAMAGED_IN_TRANSIT && (
              <Text
                style={[
                  AppStyles.text,
                  {
                    color: AppColors.danger,
                    fontSize: 18,
                    lineHeight: 24,
                    textAlign: 'center',
                  },
                ]}>
                The delivery of the order was failed because it was damaged in
                transit.
              </Text>
            )}
            <View style={[AppStyles.roundSection, {marginTop: 10}]}>
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
          </ScrollView>
        </View>

        <View style={AppStyles.bottomContainer}>
          <TouchableDebounce
            style={AppStyles.bottomButtonContainer}
            activeOpacity={0.6}
            onPress={() => this.onSubmit()}>
            <Text style={AppStyles.bottomButtonText}>COMPLETE</Text>
          </TouchableDebounce>
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
      submitDeliveryFailure: submitDeliveryFailure,
      submitDeliveryFailureOffline: submitDeliveryFailureOffline,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(FailureFinishScreen);
