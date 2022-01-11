import React from 'react';
import {
  View,
  Alert,
  Text,
  Image,
  AppRegistry,
  AppState,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import {DotIndicator} from 'react-native-indicators';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import {default as MaterialCommunityIcon} from 'react-native-vector-icons/MaterialCommunityIcons';
import {default as Ionicon} from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';
import {setUserData} from '../../../redux/actions/auth';

import {
  AppColors,
  HeaderStyle,
  AppFonts,
  AppStyles,
} from '../../../assets/styles';
import ShipmentApi from '../../../services/api/ShipmentApi';
import {bindActionCreators} from 'redux';
import {
  sagaSetStopStatus,
  sagaFinishWork,
  sagaSubmitLoadingFinished,
  sagaSetRoute,
} from '../../../redux/sagas/route';
import Waiting from '../../widgets/Waiting';
import TouchableDebounce from '../common/TouchableDebounce';
import {clearPickupScans} from '~/redux/actions/pickup';
import {setRoute} from '~/redux/actions/route';

class FinishLoadingScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      ...HeaderStyle,
      title: 'START WORK',
      headerRight: () => {
        return <View style={{marginRight: 10}} />;
      },
    };
  };

  constructor(props) {
    super(props);

    // const {route} = this.props;
    // this.stop = route.stops.find(stop => stop.id === route.currentStopId);
    this.parcels = this.props.navigation.state.params.parcels;
    this.state = {
      submitting: false,
      mileage: '0.0',
      odometerPicture: null,
      startedLocation: null,
      submitting: false,
    };
  }

  async componentDidMount() {
    Geolocation.getCurrentPosition(
      (position) => {
        console.log('[Finish Delivery] Geolocation Error: ', position);
        this.setState({
          startedLocation: {
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

  onFinish = () => {
    if (!this.props.network.isConnected) {
      Alert.alert('Error', "You cannot finish the work when you're offline.");
      return;
    }

    const mileage = parseFloat(this.state.mileage);
    if (mileage < 0) {
      Alert.alert('Error', 'The mileage is invalid. Please check again.');
      return;
    }
    if (!this.state.odometerPicture) {
      Alert.alert(
        'Error',
        'The picture of the odometer is required to start work.',
      );
      return;
    }

    this.setState({submitting: true});
    ShipmentApi.submitLoadingFinished(
      {
        mileage: mileage,
        odometer_picture: this.state.odometerPicture,
        parcels: this.parcels,
        started_location: this.state.startedLocation,
      },
      this.props.route.id,
      this.props.token,
    )
      .then((response) => {
        this.props.setRoute(response.data);
        this.setState({submitting: false});
        this.props.clearPickupScans();
        this.props.navigation.popToTop();
      })
      .catch((error) => {
        this.setState({submitting: false});
        Alert.alert(
          'Action Failed',
          'Submitting loading data has been failed.',
        );
      });
  };

  onPressTakePicture = () => {
    this.props.navigation.navigate('Camera', {
      setPicture: (base64) => {
        console.log(base64.substr(0, 100));
        this.setState({odometerPicture: base64});
      },
    });
  };

  onMileageBlur = () => {
    const {mileage} = this.state;
    if (Number.isNaN(parseFloat(mileage))) {
      this.setState({mileage: '0.0'});
    }
  };

  render() {
    const {odometerPicture, mileage} = this.state;
    return (
      <SafeAreaView style={{flex: 1}}>
        <Waiting
          visible={this.state.submitting}
          title={'Submitting loading data...'}
        />

        <View style={{flex: 1}}>
          <ScrollView
            contentContainerStyle={{paddingHorizontal: 10, paddingVertical: 20}}
            nestedScrollEnabled={true}>
            <View style={AppStyles.roundSection}>
              <View style={AppStyles.formGroup}>
                <Text style={AppStyles.label}>Mileage</Text>
                <TextInput
                  style={[AppStyles.textInput]}
                  value={this.state.mileage}
                  keyboardType={'numeric'}
                  onChangeText={(val) => this.setState({mileage: val})}
                  onBlur={() => this.onMileageBlur()}
                />
              </View>

              <View style={AppStyles.formGroup}>
                <Text style={AppStyles.label}>Picture of the Odometer</Text>
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
                      {odometerPicture ? (
                        <Image
                          source={{
                            uri: `data:image/jpeg;base64,${odometerPicture}`,
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
            onPress={() => this.onFinish()}>
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
  network: state.network,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setStopStatus: sagaSetStopStatus,
      finishLoading: sagaSubmitLoadingFinished,
      setRoute: setRoute,
      clearPickupScans: clearPickupScans,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(FinishLoadingScreen);

const styles = StyleSheet.create({
  label: {
    color: AppColors.textLight,
    fontFamily: AppFonts.main.medium,
    fontSize: 18,
  },
  info: {
    color: AppColors.grey,
    fontFamily: AppFonts.main.medium,
    fontSize: 14,
  },
  address: {
    color: AppColors.text,
    fontFamily: AppFonts.main.medium,
    fontSize: 15,
    marginBottom: 22,
  },
  parcels: {
    color: AppColors.text,
    fontFamily: AppFonts.main.medium,
    fontSize: 14,
  },
});
