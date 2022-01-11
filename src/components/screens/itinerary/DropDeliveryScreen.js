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
} from 'react-native';
import {connect} from 'react-redux';
import {default as Ionicon} from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';

import {DotIndicator} from 'react-native-indicators';

import {AppColors, HeaderStyle, AppStyles} from '~/assets/styles';
import {bindActionCreators} from 'redux';
import TouchableDebounce from '../common/TouchableDebounce';
import {
  submitDeliverySuccess,
  submitDeliverySuccessOffline,
} from '~/redux/actions/route';


class DropDeliveryScreen extends React.Component {
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
    this.parcels = this.props.navigation.state.params.parcels;
    this.leave_place = this.props.navigation.state.params.leave_place;
    this.state = {
      submitting: false,
      enableScrollView: true,
      parcelsPicture: null,
      deliveredLocation: null,
    };
  }

  async componentDidMount() {
    
    this.props.navigation.setParams({onPressMenu: this.onPressMenu});

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
    const {parcelsPicture, deliveredLocation} = this.state;

    if (!parcelsPicture) {
      Alert.alert(
        'Error',
        'A picture of the delivery are required to finish the delivery.',
      );
      return;
    }

    const payload = {
      recipient_name: null,
      recipient_signature: null,
      leave_place: this.leave_place,
      recipient_house_number: null,
      leave_picture: parcelsPicture,
      parcels: this.parcels,
      delivered_location: deliveredLocation,
      routeId: this.props.route.id
    };

    this.props.submitDeliverySuccessOffline(payload, this.order.id);
    this.props.submitDeliverySuccess(payload, new Date(), this.order.id);
    this.props.navigation.pop(2);
  };

  render() {
    const {parcelsPicture} = this.state;
    return (
      <SafeAreaView style={{flex: 1}}>
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
              <View style={{flex: 1}}>
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
            </View>
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
)(DropDeliveryScreen);

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
});
