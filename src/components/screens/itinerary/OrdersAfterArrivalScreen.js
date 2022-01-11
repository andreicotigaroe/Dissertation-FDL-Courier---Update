import React from 'react';
import {View, Alert, Text, SafeAreaView, ScrollView} from 'react-native';
import {connect} from 'react-redux';
import {default as IonIcon} from 'react-native-vector-icons/Ionicons';
import {default as FontAwesomeIcon} from 'react-native-vector-icons/FontAwesome';
import SwipeButton from 'rn-swipe-button';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import {default as MaterialIcon} from 'react-native-vector-icons/MaterialIcons';
import Geolocation from 'react-native-geolocation-service';

import {AppColors, HeaderStyle, AppFonts, AppStyles} from '~/assets/styles';
import {consts} from '~/assets/values';
import {bindActionCreators} from 'redux';
import {formatStopAddress, groupOrdersByContacts} from '~/utils';
import CollectionItem from '~/components/widgets/CollectionWidget';
import DeliveryItem from '~/components/widgets/DeliveryWidget';
import ReturnItem from '~/components/widgets/ReturnWidget';
import {setStopStatus, setStopStatusOffline} from '~/redux/actions/route';

class OrdersAfterArrivalScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      ...HeaderStyle,
      title: 'ORDERS',
      headerRight: () => {
        return (
          <Menu onSelect={(value) => alert(`Selected number: ${value}`)}>
            <MenuTrigger style={{padding: 10}}>
              <MaterialIcon
                name="more-vert"
                color={AppColors.grey2}
                size={28}
              />
            </MenuTrigger>
            <MenuOptions optionsContainerStyle={{marginTop: 50}}>
              <MenuOption
                value={2}
                style={AppStyles.headerMenuItemContainer}
                onSelect={() => params.onWrongAddress()}>
                <Text style={AppStyles.headerMenuItemDangerText}>
                  Wrong Address?
                </Text>
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
    // this.stop = this.props.route.current_stop;
    this.state = {
      submitting: false,
      orders: this.stop.orders,
    };
  }

  async componentDidMount() {
    this.props.navigation.setParams({onWrongAddress: this.onWrongAddress});
  }

  onWrongAddress = () => {
    this.props.navigation.navigate('WrongAddressCall', {
      stop: this.stop,
    });
  };

  componentWillUnmount() {}

  onSubmit = () => {
    const {route} = this.props;
    const stop = route.stops.find((stop) => this.stop.id === stop.id);

    const unprocessedNum = stop.orders.filter(
      (order) =>
        order.status === consts.ORDER_STATUS.OUT_FOR_COLLECTION ||
        order.status === consts.ORDER_STATUS.OUT_FOR_DELIVERY,
    ).length;
    if (unprocessedNum === 0) {
      Geolocation.getCurrentPosition(
        (position) => {
          console.log('[OrdersAfterArrivalScreen] Geolocation: ', position);
          this.props.setStopStatusOffline(consts.STOP_STATUS.FINISHED, stop.id);
          this.props.setStopStatus(
            consts.STOP_STATUS.FINISHED,
            {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            new Date(),
            stop.id,
          );
          this.props.navigation.popToTop();
        },
        (error) => {
          console.log(
            '[OrdersAfterArrivalScreen] Geolocation Error: ',
            error.message,
          );
          this.props.setStopStatusOffline(consts.STOP_STATUS.FINISHED, stop.id);
          this.props.setStopStatus(
            consts.STOP_STATUS.FINISHED,
            null,
            new Date(),
            stop.id,
          );
          this.props.navigation.popToTop();
        },
        {
          enableHighAccuracy: true,
          timeout: 7000,
          maximumAge: 1000,
          forceRequestLocation: true,
        },
      );
    } else {
      Alert.alert(
        'Error',
        'Cannot perform the action. There are unprocessed orders.',
      );
    }
  };

  onPressMenu = () => {
    this.dropdownMenu.show();
  };

  render() {
    const {route} = this.props;
    const stop = route.stops.find((stop) => this.stop.id === stop.id);
    if (stop) {
      const contacts = groupOrdersByContacts(stop.orders);
      var disabled = false;
      return (
        <SafeAreaView style={{flex: 1}}>
          <View style={{marginBottom: 5, flex: 1}}>
            <View
              style={{
                flexDirection: 'row',
                marginVertical: 20,
                paddingHorizontal: 20,
                alignItems: 'center',
              }}>
              <IonIcon name="location-sharp" color={AppColors.grey} size={36} />
              <Text
                style={{
                  fontFamily: AppFonts.main.medium,
                  fontSize: 18,
                  // textAlign: 'center',
                  flex: 1,
                  lineHeight: 28,
                  paddingLeft: 10,
                }}>
                {formatStopAddress(stop)}
              </Text>
            </View>
            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: 10,
                paddingBottom: 20,
              }}>
              {contacts.map((contact, index) => {
                if (contact.type === 'collection')
                  return (
                    <CollectionItem
                      key={index}
                      data={contact}
                      renderButtons={true}
                      onPress={() => {
                        this.props.navigation.navigate('VerifyCollections', {
                          stop: this.stop,
                          orders: contact.orders,
                        });
                      }}
                    />
                  );
                else if (contact.type === 'delivery') {
                  return (
                    <DeliveryItem
                      key={index}
                      order={contact.order}
                      renderButtons={true}
                      onPress={() => {
                        this.props.navigation.navigate('VerifyParcel', {
                          stop: this.stop,
                          order: contact.order,
                        });
                      }}
                    />
                  );
                } else if (contact.type === 'return')
                  return (
                    <ReturnItem
                      key={index}
                      data={contact}
                      renderButtons={true}
                      onPress={() => {
                        this.props.navigation.navigate('VerifyReturns', {
                          stop: this.stop,
                          orders: contact.orders,
                        });
                      }}
                    />
                  );
              })}
            </ScrollView>
          </View>
          <View style={AppStyles.bottomContainer}>
            <View
              style={[AppStyles.bottomContainer, {paddingHorizontal: '12%'}]}>
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
                title="ALL FINISHED HERE"
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
          </View>
        </SafeAreaView>
      );
    } else {
      return null;
    }
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
      setStopStatus: setStopStatus,
      setStopStatusOffline: setStopStatusOffline,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(OrdersAfterArrivalScreen);
