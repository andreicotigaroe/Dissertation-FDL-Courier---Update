import React from 'react';
import {
  View,
  Alert,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Modal,
} from 'react-native';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {DotIndicator} from 'react-native-indicators';
import debounce from 'lodash/debounce';
import Icon from 'react-native-vector-icons/Ionicons';
import ActionSheet from 'react-native-actionsheet';
import {default as FontAwesome5} from 'react-native-vector-icons/FontAwesome5';
import Geolocation from 'react-native-geolocation-service';

import {AppColors, AppFonts, AppStyles} from '~/assets/styles';
import {consts} from '~/assets/values';
import ShipmentApi from '~/services/api/ShipmentApi';
import {sagaInitRoute, sagaSetStopStatus} from '~/redux/sagas/route';
import TouchableDebounce from '~/components/screens/common/TouchableDebounce';
import {isDeliveryOrder, isCollectionOrder, formatStopAddress} from '~/utils';
import {
  setRoute,
  setStopStatus,
  setStopStatusOffline,
} from '~/redux/actions/route';
import AuthApi from '~/services/api/AuthApi';

class ListTabScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchText: '',
      submitting: false,
      stops: this.props.route.stops,
      longPressMenuItems: ['Cancel'],
      refreshing: false,
    };
    this.stopActionSheet = React.createRef(null);
    this.visitedActionSheet = React.createRef(null);
    this.longPressStopID = null;
    this.stopList = null;

    this.filterStops = debounce(this.filterStops, 1000);
  }

  async componentDidMount() {}

  componentWillUnmount() {}

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.route.stops !== this.props.route.stops) {
      this.setState(
        {
          searchText: '',
          stops: nextProps.route.stops,
        },
        () => {
          if (this.stopList) {
            this.stopList.forceUpdate();
          }
        },
      );
    }
    return true;
  }

  onRefresh = () => {
    if (!this.props.network.isConnected) {
      return;
    }
    this.setState({
      refreshing: true,
    });
    ShipmentApi.getRoute(this.props.token)
      .then((response) => {
        this.setState({refreshing: false});
        this.props.setRoute(response.data);
      })
      .catch((error) => {
        Alert.alert('Error', 'Cannot refresh the data');
        this.setState({refreshing: false});
      });
  };

  changeSearchHandler = (val) => {
    this.setState({searchText: val}, () => {
      this.filterStops();
    });
  };

  filterStops = () => {
    const {searchText} = this.state;
    const stops = this.props.route.stops.filter(
      (stop) =>
        stop.address.address1 &&
        stop.address.address1.toLowerCase().includes(searchText.toLowerCase()),
    );
    this.setState({
      stops,
    });
  };

  onSelectStop = (stop) => {
    if (stop.type === consts.STOP_TYPES.PICKUP) {
      this.props.navigation.navigate('LoadParcel', {stop: stop});
      // if (stop.status === consts.STOP_STATUS.DEFAULT)
      //   this.props.navigation.navigate('StartTravel', {stop: stop});
      // else if (stop.status === consts.STOP_STATUS.IN_TRAVEL)
      //   this.props.navigation.navigate('Travel', {stop: stop});
      // else if (stop.status === consts.STOP_STATUS.ARRIVED)
      //   this.props.navigation.navigate('LoadParcel', {stop: stop});
    } else if (stop.type === consts.STOP_TYPES.CUSTOMER) {
      if (stop.status === consts.STOP_STATUS.DEFAULT)
        this.props.navigation.navigate('StartTravel', {stop: stop});
      else if (stop.status === consts.STOP_STATUS.IN_TRAVEL)
        this.props.navigation.navigate('Travel', {stop: stop});
      else if (stop.status === consts.STOP_STATUS.ARRIVED)
        this.props.navigation.navigate('OrdersAfterArrival', {stop: stop});
    }
  };

  cancelDelivery = () => {
    if (this.longPressStopID) {
      const longPressStopId = this.longPressStopID;
      Geolocation.getCurrentPosition(
        (position) => {
          console.log('[ListTabScreen] Geolocation: ', position);
          this.props.setStopStatusOffline(
            consts.STOP_STATUS.DEFAULT,
            longPressStopId,
          );
          this.props.setStopStatus(
            consts.STOP_STATUS.DEFAULT,
            {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            new Date(),
            longPressStopId,
          );
        },
        (error) => {
          console.log('[ListTabScreen] Geolocation Error: ', error.message);
          this.props.setStopStatusOffline(
            consts.STOP_STATUS.DEFAULT,
            longPressStopId,
          );
          this.props.setStopStatus(
            consts.STOP_STATUS.DEFAULT,
            null,
            new Date(),
            longPressStopId,
          );
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

  retryDelivery = () => {
    if (this.longPressStopID && this.props.route) {
      const stop = this.props.route.stops.find(
        (stop) => stop.id === this.longPressStopID,
      );
      if (stop) {
        if (this.props.route.currentStopId) {
          Alert.alert(
            'Error',
            'Cannot restart the delivery unless you finish or cancel current one.',
          );
          return;
        } else {
          this.props.navigation.navigate('StartTravel', {stop: stop});
        }
        this.longPressStopID = null;
      }
    }
  };

  onLongPressStop = (stop, route) => {
    // If stop is depot, ignore long press
    if (stop.type === consts.STOP_TYPES.PICKUP) return;

    let longPressMenuItems = ['Wrong address', 'Cancel'];
    if (route.currentStopId === stop.id) {
      longPressMenuItems = ['Cancel this travel', 'Wrong address', 'Cancel'];
    } else if (stop.status === consts.STOP_STATUS.FINISHED) {
      longPressMenuItems = ['Retry the delivery', 'Wrong address', 'Cancel'];
    }

    this.longPressStopID = stop.id;
    this.setState(
      {
        longPressMenuItems,
      },
      () => {
        this.stopActionSheet.current.show();
      },
    );
  };

  onPressActionSheet = (index) => {
    if (!this.longPressStopID && !this.props.route) return;
    const stop = this.props.route.stops.find(
      (stop) => stop.id === this.longPressStopID,
    );
    if (!stop) return;

    const {route} = this.props;
    if (route.currentStopId === stop.id) {
      if (index === 0) {
        this.cancelDelivery();
      } else if (index === 1) {
        this.props.navigation.navigate('WrongAddressCall', {
          stop,
        });
      }
    } else if (stop.status === consts.STOP_STATUS.FINISHED) {
      if (index === 0) {
        this.retryDelivery();
      } else if (index === 1) {
        this.props.navigation.navigate('WrongAddressCall', {
          stop,
        });
      }
    } else {
      if (index === 0) {
        this.props.navigation.navigate('WrongAddressCall', {
          stop,
        });
      }
    }
  };

  renderStops = (item) => {
    const stop = item.item;
    const {route} = this.props;
    const isActiveStop = stop.id === route.currentStopId;
    const nullActiveStop = route.currentStopId === null;
    if (stop.type === consts.STOP_TYPES.PICKUP) {
      var disabled = route.status !== consts.ROUTE_STATUS.CREATED;
      return (
        <TouchableDebounce
          onPress={() => this.onSelectStop(stop)}
          onLongPress={() => this.onLongPressStop(stop, route)}
          key={`${item.index}`}
          disabled={disabled}
          style={{opacity: disabled ? 0.6 : 1}}>
          <View style={styles.stopContainer}>
            <View
              style={{
                flexDirection: 'column',
                alignItems: 'center',
                marginRight: 10,
              }}>
              {/* <Text style={styles.stopIndex}># {stop.index + 1}</Text> */}
              <FontAwesome5
                name="warehouse"
                color={AppColors.grey2}
                size={14}
              />
            </View>
            <View style={{flex: 1, paddingLeft: 10}}>
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={styles.stopTitle}>{stop.depot.code}</Text>
                  {isActiveStop && (
                    <View style={AppStyles.badgePrimaryContainer}>
                      <Text style={AppStyles.badgePrimaryText}>CURRENT</Text>
                    </View>
                  )}
                  {(route.status === consts.ROUTE_STATUS.COLLECTED ||
                    route.status === consts.ROUTE_STATUS.FINISHED) && (
                    <View style={AppStyles.badgeSuccessContainer}>
                      <Text style={AppStyles.badgeSuccessText}>VISITED</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.stopAddress}>
                  {formatStopAddress(stop)}
                </Text>
                <Text style={styles.stopParcels}>
                  {stop.parcels.deliveries.length} Parcels to Pickup
                </Text>
              </View>
            </View>
            <View style={{justifyContent: 'center', paddingLeft: 5}}>
              <FontAwesome5
                name="angle-right"
                size={20}
                color={AppColors.grey2}
              />
            </View>
          </View>
        </TouchableDebounce>
      );
    } else if (stop.type === consts.STOP_TYPES.CUSTOMER) {
      const enabled =
        route.status === consts.ROUTE_STATUS.COLLECTED &&
        ((route.status === consts.ROUTE_STATUS.COLLECTED &&
          route.currentStopId === null) ||
          isActiveStop); //&& (stop.status !== consts.STOP_STATUS.FINISHED);
      const hasFailedOrders =
        stop.orders.filter(
          (order) =>
            order.status === consts.ORDER_STATUS.NOT_DELIVERED ||
            order.status === consts.ORDER_STATUS.NOT_COLLECTED,
        ).length > 0;
      const deliveryOrders = stop.orders.filter((order) =>
        isDeliveryOrder(order),
      );
      const collectionOrders = stop.orders.filter((order) =>
        isCollectionOrder(order),
      );
      return (
        <TouchableDebounce
          onPress={() => {
            this.onSelectStop(stop);
            // AuthApi.sendTestNotification(this.props.token);
          }}
          onLongPress={() => this.onLongPressStop(stop, route)}
          key={`${item.index}`}
          disabled={!enabled}
          style={{opacity: !enabled ? 0.6 : 1}}>
          <View style={styles.stopContainer}>
            <View
              style={{
                flexDirection: 'column',
                alignItems: 'center',
                marginRight: 10,
              }}>
              <Text style={styles.stopIndex}># {stop.index}</Text>
              <Icon name="location-sharp" color={AppColors.grey2} size={24} />
            </View>
            <View style={{flex: 1, paddingLeft: 10}}>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={styles.stopTitle}>
                  {stop.address.company_name}
                </Text>
                {stop.status === consts.STOP_STATUS.FINISHED ? (
                  <View
                    style={
                      hasFailedOrders
                        ? AppStyles.badgeDangerContainer
                        : AppStyles.badgeSuccessContainer
                    }>
                    <Text
                      style={
                        hasFailedOrders
                          ? AppStyles.badgeDangerText
                          : AppStyles.badgeSuccessText
                      }>
                      VISITED
                    </Text>
                  </View>
                ) : (
                  isActiveStop && (
                    <View style={AppStyles.badgePrimaryContainer}>
                      <Text style={AppStyles.badgePrimaryText}>CURRENT</Text>
                    </View>
                  )
                )}
              </View>
              <Text style={styles.stopAddress}>{formatStopAddress(stop)}</Text>
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.stopParcels}>
                  {deliveryOrders.length} &nbsp;Deliveries
                </Text>
                <Text style={styles.stopParcels}>
                  {collectionOrders.length} &nbsp;Collections
                </Text>
              </View>
            </View>
            <View style={{justifyContent: 'center', paddingLeft: 5}}>
              <FontAwesome5
                name="angle-right"
                size={20}
                color={AppColors.grey2}
              />
            </View>
          </View>
        </TouchableDebounce>
      );
    } else {
      return <View />;
    }
  };

  render() {
    const {route} = this.props;
    const {stops} = this.state;
    return (
      <View style={AppStyles.mainContainer}>
        <ActionSheet
          ref={this.stopActionSheet}
          options={this.state.longPressMenuItems}
          cancelButtonIndex={this.state.longPressMenuItems.length - 1}
          useNativeDriver={false}
          onPress={(index) => {
            this.onPressActionSheet(index);
            this.longPressStopID = null;
          }}
        />

        {/* <ActionSheet
          ref={this.visitedActionSheet}
          options={['Retry the delivery', 'Wrong address', 'Cancel']}
          cancelButtonIndex={2}
          useNativeDriver={false}
          onPress={(index) => {
            if (index === 0) {
              this.retryDelivery();
            } else if (index === 1) {
              if (this.longPressStopID && this.props.route) {
                const stop = this.props.route.stops.find(
                  (stop) => stop.id === this.longPressStopID,
                );
                if (stop) {
                  this.props.navigation.navigate('WrongAddressCall', {
                    stop,
                  });
                }
              }
            }
            this.longPressStopID = null;
          }}
        /> */}
        <Modal
          visible={this.state.submitting}
          transparent={true}
          animationType="fade">
          <View style={AppStyles.loadingContainer}>
            <DotIndicator color="white" size={8} />
          </View>
        </Modal>

        <View style={styles.searchSection}>
          <View style={styles.searchBoxContainer}>
            <Icon name="ios-search" color={AppColors.grey2} size={24} />
            <TextInput
              style={styles.searchBox}
              value={this.state.searchText}
              autoCapitalize="none"
              onChangeText={(val) => this.changeSearchHandler(val)}
              placeholder="Address"
              placeholderTextColor={AppColors.grey2}
            />
          </View>
        </View>

        <View style={{flex: 1}}>
          <FlatList
            // key={`${Math.floor(Math.random() * 10000)}`}
            ref={(r) => (this.stopList = r)}
            data={stops ? stops : []}
            renderItem={this.renderStops}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{paddingTop: 2, paddingBottom: 10}}
            onRefresh={() => this.onRefresh()}
            refreshing={this.state.refreshing}
          />
        </View>
      </View>
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
      setRoute: setRoute,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(ListTabScreen);

const styles = StyleSheet.create({
  searchSection: {
    backgroundColor: AppColors.white,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 2,
    flexDirection: 'row',
  },

  searchBoxContainer: {
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: AppColors.grey2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    paddingLeft: 10,
    flex: 1,
  },

  searchBox: {
    flex: 1,
    paddingLeft: 10,
    color: AppColors.text,
    fontFamily: AppFonts.main.regular,
    fontSize: 14,
    paddingVertical: 3,
  },

  stopContainer: {
    backgroundColor: AppColors.white,
    flexDirection: 'row',
    marginBottom: 2,
    paddingVertical: 10,
    paddingLeft: 20,
    paddingRight: 10,
  },

  stopIndex: {
    color: AppColors.textLight,
    textAlign: 'center',
    fontFamily: AppFonts.main.semibold,
    marginBottom: 5,
    fontSize: 14,
  },
  stopTitle: {
    color: AppColors.grey,
    fontFamily: AppFonts.main.medium,
    fontSize: 12,
    marginBottom: 7,
  },
  stopAddress: {
    color: AppColors.text,
    fontFamily: AppFonts.main.medium,
    fontSize: 14,
    marginBottom: 10,
  },
  stopParcels: {
    color: AppColors.text,
    fontFamily: AppFonts.main.medium,
    fontSize: 14,
    marginBottom: 7,
    flex: 1,
  },
});
