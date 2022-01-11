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

import {DotIndicator} from 'react-native-indicators';

import {
  AppColors,
  HeaderStyle,
  AppFonts,
  AppStyles,
} from '../../../assets/styles';
import {sagaSubmitReturnSuccess} from '../../../redux/sagas/route';
import {bindActionCreators} from 'redux';
import TouchableDebounce from '../common/TouchableDebounce';

class ReturnDetailsScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      ...HeaderStyle,
      title: 'FINISH RETURN',
      headerRight: () => {
        return (
          <View />
        );
      },
    };
  };

  constructor(props) {
    super(props);

    this.stop = this.props.navigation.state.params.stop;
    this.orders = this.props.navigation.state.params.orders;
    this.parcels = this.props.navigation.state.params.parcels;
    this.leave_place = this.props.navigation.state.params.leave_place;

    this.state = {
      submitting: false,
      recipientName: '',
      showSignature: false,
      signatureKey: Math.floor(Math.random(100) * 100),
      signature: null,
      enableScrollView: true,
      parcelsPicture: null,
      deliveredLocation: null,
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
        console.log('[Finish Collection] Geolocation: ', position);
        this.setState({
          deliveredLocation: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      },
      (error) => {
        console.log('[Finish Collection] Geolocation Error: ', error.message);
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
      parcelsPicture,
      signature,
      deliveredLocation,
    } = this.state;

    if (!recipientName) {
      Alert.alert(
        'Error',
        "Recipient's name is required to finish the delivery.",
      );
      return;
    }
    if (!parcelsPicture) {
      Alert.alert(
        'Error',
        'A picture of collected parcels are required to finish the delivery.',
      );
      return;
    }
    if (!signature) {
      Alert.alert(
        'Error',
        "Recipient's signature is required to finish this collection.",
      );
      return;
    }

    this.props.submitReturnSuccess(
      {
        recipient_name: recipientName,
        signature: signature,
        leave_place: this.leave_place,
        leave_picture: parcelsPicture,
        delivered_location: deliveredLocation,
        orders: this.orders,
        parcels: this.parcels,
      },
      this.stop.id,
      {
        onSuccess: () => {
          this.props.navigation.pop(2);
        },
        onFailure: () => {
          Alert.alert('Action Failed', 'Finishing delivery was failed.');
        },
      },
    );
  };

  render() {
    const {
      parcelsPicture,
    } = this.state;
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
              <View style={AppStyles.formGroup}>
                <Text style={AppStyles.label}>Name of the Recipient</Text>
                <TextInput
                  style={[AppStyles.textInput]}
                  value={this.state.recipientName}
                  autoCapitalize="words"
                  onChangeText={(val) => this.setState({recipientName: val})}
                />
              </View>

              <View style={AppStyles.formGroup}>
                <Text style={AppStyles.label}>Picture of Returned Parcels</Text>
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
      submitReturnSuccess: sagaSubmitReturnSuccess,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ReturnDetailsScreen);

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
