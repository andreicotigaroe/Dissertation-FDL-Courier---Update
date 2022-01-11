import React from 'react';
import {
  View,
  Alert,
  Text,
  Modal,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {connect} from 'react-redux';
import Geolocation from 'react-native-geolocation-service';

import {SkypeIndicator} from 'react-native-indicators';

import {
  AppColors,
  HeaderStyle,
  AppFonts,
  AppStyles,
} from '../../../assets/styles';
import {consts} from '../../../assets/values';
import {isCollectionOrder, distance} from '../../../utils';
import ListItem from '../../widgets/ListItem';

class FinishWorkLocationScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      ...HeaderStyle,
      title: 'FINISH WORK',
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      submitting: false,
      order: this.order,
      location: null,
      gettingLocation: false,
    };
  }

  async componentDidMount() {
    this.props.navigation.setParams({onPressMenu: this.onPressMenu});
  }

  componentWillUnmount() {}

  getDepotLocation = () => {
    const stops = this.props.route.stops || [];
    const stop = stops.find((stop) => stop.type === consts.STOP_TYPES.PICKUP);
    if (stop) {
      return {
        latitude: stop.address.location.latitude,
        longitude: stop.address.location.longitude,
      };
    } else {
      return null;
    }
  };

  onPressNext = (finishedPlace) => {
    if (!this.props.network.isConnected) {
      Alert.alert("Error", "You cannot finish work when you're offline.");
      return;
    }

    this.setState(
      {
        gettingLocation: true,
      },
      () => {
        Geolocation.getCurrentPosition(
          (position) => {
            console.log('Current Position:', position);
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            if (finishedPlace === consts.FINISH_WORK_PLACE.DEPOT) {
              const depotLocation = this.getDepotLocation();
              console.log(location, depotLocation);
              const dist = distance(
                location.latitude,
                location.longitude,
                depotLocation.latitude,
                depotLocation.longitude,
              );
              if (dist > 0.5) { // MICHAEL
                Alert.alert(
                  'Error',
                  'You are still far from the depot. Please try again when you arrive.',
                  [
                    {
                      text: 'OK',
                      onPress: () => console.log('Ask me later pressed'),
                    },
                  ],
                );
                this.setState({gettingLocation: false});
                return;
              }
            }

            this.setState(
              {
                gettingLocation: false,
              },
              () => {
                this.props.navigation.navigate('FinishWork', {
                  finishedPlace: finishedPlace,
                  location: location,
                });
              },
            );
          },
          (error) => {
            console.log('Geolocation Error: ', error.message);
            Alert.alert(
              'Error',
              'Failed to get your location. Are you sure to continue to anyway?',
              [{
                text: 'NO',
                style: "cancel",
              }, {
                text: 'YES',
                onPress: () => {
                  this.props.navigation.navigate('FinishWork', {
                    finishedPlace: finishedPlace,
                    location: null,
                  });
                }
              }]
            );
            this.setState({gettingLocation: false});
          },
          {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 1000,
            forceRequestLocation: true,
          },
        );
      },
    );
  };

  getCollectedParcels = () => {
    const stops = this.props.route ? this.props.route.stops : [];
    var numSuccessCollections = 0;
    for (var i = 0; i < stops.length; i++) {
      const stop = stops[i];
      for (var j = 0; j < stop.orders.length; j++) {
        const order = stop.orders[j];
        if (isCollectionOrder(order)) {
          numSuccessCollections += order.parcels.filter(
            (parcel) =>
              parcel.status === consts.PARCEL_STATUS.COLLECTED_BY_DRIVER,
          ).length;
        }
      }
    }
    return numSuccessCollections;
  };

  render() {
    const {gettingLocation} = this.state;
    const collectedParcelNum = this.getCollectedParcels();
    return (
      <SafeAreaView style={{flex: 1}}>
        <Modal
          visible={gettingLocation}
          transparent={true}
          animationType="fade">
          <View style={AppStyles.loadingContainer}>
            <SkypeIndicator
              color="white"
              size={84}
              style={{flex: null}}
              minScale={0.3}
              maxScale={0.3}
            />
            <Text style={styles.indicatorText}>
              Getting Current Location...
            </Text>
          </View>
        </Modal>
        <ScrollView contentContainerStyle={{paddingBottom: 20}}>
          <View style={{paddingVertical: 20}}>
            <Text style={[styles.valueText, {textAlign: 'center', color: collectedParcelNum > 0 ? AppColors.success : AppColors.grey}]}>
              {collectedParcelNum}
            </Text>
            <Text
              style={[
                styles.actionItemText,
                {textAlign: 'center', color: AppColors.grey},
              ]}>
              Collected Parcels
            </Text>
          </View>
          <View style={{paddingVertical: 20}}>
            <Text
              style={[
                styles.sectionTitleText,
                {textAlign: 'center', color: AppColors.grey},
              ]}>
              Where do you finish work today?
            </Text>
          </View>
          <ListItem title={'At the depot'} onPress={() => this.onPressNext(consts.FINISH_WORK_PLACE.DEPOT)} />
          <ListItem
            title={'Last stop location or 500m radius'}
            disabled={collectedParcelNum > 0}
            onPress={() => this.onPressNext(consts.FINISH_WORK_PLACE.LAST_STOP)}
          />
          <ListItem
            title={'Somewhere else'}
            disabled={collectedParcelNum > 0}
            onPress={() => this.onPressNext(consts.FINISH_WORK_PLACE.OTHER_PLACE)}
          />
        </ScrollView>
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

export default connect(mapStateToProps, {})(FinishWorkLocationScreen);

const styles = StyleSheet.create({
  actionItemContainer: {
    backgroundColor: AppColors.white,
    flexDirection: 'row',
    marginBottom: 2,
    paddingVertical: 15,
    paddingLeft: 20,
    paddingRight: 10,
  },
  actionItemText: {
    color: AppColors.text,
    fontFamily: AppFonts.main.medium,
    fontSize: 14,
    justifyContent: 'center',
  },
  valueText: {
    color: AppColors.success,
    fontFamily: AppFonts.main.medium,
    fontSize: 48,
    justifyContent: 'center',
  },
  sectionTitleText: {
    color: AppColors.text,
    fontFamily: AppFonts.main.medium,
    fontSize: 16,
    justifyContent: 'center',
  },
  actionItemDescription: {
    marginTop: 5,
    color: AppColors.textLight,
    fontFamily: AppFonts.main.regular,
    fontSize: 12,
    justifyContent: 'center',
  },
  indicatorText: {
    fontSize: 14,
    paddingTop: 10,
    color: 'white',
    fontFamily: AppFonts.main.medium,
    textAlignVertical: 'center',
    textAlign: 'center',
  },
});
