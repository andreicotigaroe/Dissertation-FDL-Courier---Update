import React from 'react';
import {
  View,
  Alert,
  Text,
  AppState,
  Platform,
  PermissionsAndroid,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import {connect} from 'react-redux';
import {createOpenLink} from 'react-native-open-maps';
import {default as FontAwesome5} from 'react-native-vector-icons/FontAwesome5';

import Geolocation from 'react-native-geolocation-service';
import SwipeButton from 'rn-swipe-button';
import {default as FontAwesomeIcon} from 'react-native-vector-icons/FontAwesome';

import {
  AppColors,
  HeaderStyle,
  AppFonts,
  AppStyles,
} from '../../../assets/styles';
import {consts} from '../../../assets/values';
import {distance, formatStopAddress, groupOrdersByContacts} from '../../../utils';
import Waiting from '../../widgets/Waiting';
import {bindActionCreators} from 'redux';
import ShipmentApi from '../../../services/api/ShipmentApi';
import CollectionItem from '../../widgets/CollectionWidget';
import DeliveryItem from '../../widgets/DeliveryWidget';
import ReturnItem from '../../widgets/ReturnWidget';
import {setStopStatus, setStopStatusOffline} from '~/redux/actions/route';

class TravelScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      ...HeaderStyle,
      title: 'TRAVEL',
      headerRight: () => {
        return <View style={{marginRight: 10}} />;
      },
    };
  };

  constructor(props) {
    super(props);

    const {stop} = this.props.navigation.state.params;
    this.stop = stop;
    this.state = {
      stop: stop,
      parcelNum: stop.parcels.deliveries.length,
      endAddress: formatStopAddress(stop),
      destLocation: stop.address,
    };
    this.resetSwipeButton = null;
    this.watchID = null;
  }

  // handleAppStateChange = (nextAppState) => {
  //   console.log("[LoadScreen::handleAppStateChange] States:", this.state.appState, nextAppState);
  //   if (nextAppState === 'active') {
  //     this.getLocation();
  //   }
  // }

  openNavigationMap = (destLocation) => {
    if (this.props.network.isConnected) {
      const openNavigation = createOpenLink({
        end: `${destLocation.location.latitude},${destLocation.location.longitude}`,
        zoom: 18,
      });
      openNavigation()
        .then(() => {})
        .catch(() => {});
    }
  };

  async componentDidMount() {
    var self = this;
    const {destLocation} = this.state;
    if (Platform.OS === 'ios') {
      // self.runLocationTracking();
      setTimeout(() => {
        self.openNavigationMap(destLocation);
      }, 1000);
    } else {
      async function requestLocationPermission() {
        console.log('Geolocation requested!');
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Access Required',
              message: 'This App needs to Access your location',
            },
          );
          console.log('Granted:', granted);
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            setTimeout(() => {
              self.openNavigationMap(destLocation);
            }, 1000);
            //  self.runLocationTracking();
          } else {
            console.log('Permission Denied');
          }
        } catch (err) {
          console.log('Geolocation Error: ', err);
        }
      }
      requestLocationPermission();
    }

    this.props.navigation.addListener('willBlur', () => {
      console.log('Blurred');
      if (this.watchID) Geolocation.clearWatch(this.watchID);
    });
  }

  runLocationTracking = () => {
    if (this.watchID) {
      Geolocation.clearWatch(this.watchID);
    }
    this.watchID = Geolocation.watchPosition(
      (position) => {
        console.log(position);
        const {latitude, longitude} = position.coords;
        // database()
        //   .ref(`/driver_locations/${this.props.user.id}`)
        //   .set({ latitude, longitude });
        ShipmentApi.setDriverLocation(
          {latitude, longitude},
          this.props.route.id,
          this.props.token,
        );
      },
      (error) => console.log(error),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
        forceRequestLocation: true,
        useSignificantChanges: true,
      },
    );
  };

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);

    console.log('componentWillUnmount', this.watchID);
    if (this.watchID) Geolocation.clearWatch(this.watchID);
    Geolocation.stopObserving();
  }

  submitArrival = (stop, location) => {
    this.props.setStopStatusOffline(consts.STOP_STATUS.ARRIVED, stop.id);
    this.props.setStopStatus(
      consts.STOP_STATUS.ARRIVED,
      location,
      new Date(),
      stop.id,
    );
    this.props.navigation.replace('OrdersAfterArrival', {
      stop: this.stop,
    });
  };

  onSubmit = () => {
    const {stop, destLocation} = this.state;

    // If the device is offline, do not perform distance check.
    if (!this.props.network.isConnected) {
      this.submitArrival(stop, null);
      return;
    }

    if (stop.type === consts.STOP_TYPES.RETURN) {
      this.submitArrival(stop, null);
      return;
    } else {
      Geolocation.getCurrentPosition(
        (position) => {
          console.log('Current Position:', position);
          const dist = distance(
            position.coords.latitude,
            position.coords.longitude,
            destLocation.location.latitude,
            destLocation.location.longitude,
          );
          if (dist < 0.5) {
            // MICHAEL
            this.submitArrival(stop, {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          } else {
            Alert.alert(
              'Error',
              'You are still far from the destination. Please swipe only when you arrive.',
              [
                {
                  text: 'OK',
                  onPress: () => console.log('Ask me later pressed'),
                },
              ],
            );
            if (this.resetSwipeButton) {
              this.resetSwipeButton();
            }
          }
        },
        (error) => {
          console.log('Geolocation Error: ', error.message);
          this.submitArrival(stop, null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000,
          forceRequestLocation: true,
        },
      );
    }
  };

  renderPickup = () => {
    const {stop, endAddress, parcelNum} = this.state;
    return (
      <View style={{flex: 1, paddingHorizontal: 30, paddingTop: 40}}>
        <Text style={[styles.titleText, {marginBottom: 40}]}>
          You are now in travel.
        </Text>
        {/* Title */}
        <View style={{flexDirection: 'row', marginBottom: 30}}>
          <FontAwesome5 name="warehouse" color={AppColors.grey} size={24} />
          <Text style={[styles.depotText, {marginLeft: 20}]}>
            {stop.depot ? stop.depot.code : ''}
          </Text>
        </View>

        {/* Address */}
        <View style={{flexDirection: 'row', marginBottom: 30}}>
          <Text style={styles.addressText}>{endAddress}</Text>
        </View>

        {/* Address */}
        <View style={{flexDirection: 'row', marginBottom: 20}}>
          <Text style={styles.labelText}>
            <Text style={styles.numberText}>{parcelNum}</Text> Parcels to pick
            up
          </Text>
        </View>
      </View>
    );
  };

  renderReturn = () => {
    const {stop, endAddress} = this.state;
    return (
      <View style={{flex: 1, paddingHorizontal: 30, paddingTop: 40}}>
        <Text style={[styles.titleText, {marginBottom: 40}]}>
          You are now in travel.
        </Text>

        {/* Title */}
        <View style={{flexDirection: 'row', marginBottom: 30}}>
          <FontAwesome5 name="warehouse" color={AppColors.grey} size={24} />
          <Text style={[styles.depotText, {marginLeft: 20}]}>
            {stop.depot ? stop.depot.code : ''}
          </Text>
        </View>

        {/* Address */}
        <View style={{flexDirection: 'row', marginBottom: 30}}>
          <Text style={styles.addressText}>{endAddress}</Text>
        </View>

        {/* Address */}
        <View style={{flexDirection: 'row', marginBottom: 20}}>
          <Text style={styles.labelText}>
            Return to the depot to finish work
          </Text>
        </View>
      </View>
    );
  };

  render() {
    const {stop} = this.state;
    const contacts = groupOrdersByContacts(stop.orders);

    return (
      <SafeAreaView style={{flex: 1}}>
        <Waiting
          visible={this.props.route.calling}
          title={'Submitting arrival...'}
        />

        <View style={{flex: 1}}>
          <View style={AppStyles.subheaderContainer}>
            <Text style={AppStyles.subheaderTitle}>
              {stop.address.address1}
            </Text>
          </View>

          {stop.type === consts.STOP_TYPES.PICKUP ? (
            this.renderPickup()
          ) : stop.type === consts.STOP_TYPES.RETURN ? (
            this.renderReturn()
          ) : (
            <View style={{flex: 1}}>
              <Text style={[styles.titleText, {marginVertical: 20}]}>
                You are now in travel.
              </Text>
              {/* Orders */}
              <ScrollView
                contentContainerStyle={{
                  paddingHorizontal: 10,
                  paddingBottom: 20,
                }}>
                {contacts.map((contact, index) => {
                  if (contact.type === 'collection')
                    return <CollectionItem key={index} data={contact} />;
                  else if (contact.type === 'delivery')
                    return <DeliveryItem key={index} order={contact.order} />;
                  else if (contact.type === 'return')
                    return <ReturnItem key={index} data={contact} />;
                })}
              </ScrollView>
            </View>
          )}
        </View>
        <View style={[AppStyles.bottomContainer, {paddingHorizontal: '12%'}]}>
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
            title="I'VE ARRIVED"
            onSwipeSuccess={() => this.onSubmit()}
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
      setStopStatus: setStopStatus,
      setStopStatusOffline: setStopStatusOffline,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(TravelScreen);

const styles = StyleSheet.create({
  locationButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  fitButton: {
    position: 'absolute',
    right: 12,
    bottom: 62,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  titleText: {
    color: AppColors.danger,
    fontFamily: AppFonts.main.medium,
    fontSize: 20,
    textAlign: 'center',
  },
  addressText: {
    color: AppColors.text,
    fontFamily: AppFonts.main.medium,
    fontSize: 16,
    justifyContent: 'center',
    lineHeight: 24,
  },
  labelText: {
    color: AppColors.grey,
    fontFamily: AppFonts.main.medium,
    fontSize: 16,
    justifyContent: 'center',
  },
  numberText: {
    color: AppColors.grey,
    fontFamily: AppFonts.main.medium,
    fontSize: 20,
    justifyContent: 'center',
  },
  depotText: {
    color: AppColors.text,
    fontFamily: AppFonts.main.medium,
    fontSize: 20,
    textAlign: 'center',
  },
});
