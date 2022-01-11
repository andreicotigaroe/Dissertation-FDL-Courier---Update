import React from 'react';
import {View, Text, StyleSheet, ScrollView, SafeAreaView} from 'react-native';
import {connect} from 'react-redux';
import SwipeButton from 'rn-swipe-button';
import Geolocation from 'react-native-geolocation-service';

import {default as FontAwesomeIcon} from 'react-native-vector-icons/FontAwesome';
import {default as FontAwesome5} from 'react-native-vector-icons/FontAwesome5';
import {default as IonIcon} from 'react-native-vector-icons/Ionicons';

import {AppColors, HeaderStyle, AppFonts, AppStyles} from '~/assets/styles';
import {consts} from '~/assets/values';
import {bindActionCreators} from 'redux';
import {formatStopAddress, groupOrdersByContacts, requestLocationPermission} from '~/utils';
import CollectionItem from '~/components/widgets/CollectionWidget';
import DeliveryItem from '~/components/widgets/DeliveryWidget';
import ReturnItem from '~/components/widgets/ReturnWidget';
import {setCurrentStop, setCurrentStopOffline} from '~/redux/actions/route';

class StartTravelScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      ...HeaderStyle,
      title: navigation.getParam('customTitle', 'START TRAVEL'),
      headerRight: () => {
        return <View style={{marginRight: 10}} />;
      },
    };
  };

  constructor(props) {
    super(props);

    const {stop} = this.props.navigation.state.params;
    this.state = {
      stop: stop,
      parcelNum: stop.parcels.deliveries.length,
      endAddress: formatStopAddress(stop),
      location: null,
      submitting: false,
    };
  }

  async componentDidMount() {
    requestLocationPermission(() => {
      Geolocation.getCurrentPosition(
        (position) => {
          console.log('[Start Travel] Geolocation : ', position);
          this.setState({
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          });
        },
        (error) => {
          console.log('[Start Travel] Geolocation Error: ', error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 1000,
          forceRequestLocation: true,
        },
      );
    });
  }

  componentWillUnmount() {}

  onSubmit = () => {
    this.props.setCurrentStopOffline(this.state.stop.id);
    this.props.setCurrentStop(this.state.stop.id, this.state.location, new Date());
    this.props.navigation.replace('Travel', {stop: this.state.stop});
  };

  renderPickup = () => {
    const {stop, endAddress, parcelNum} = this.state;
    return (
      <View style={{flex: 1, paddingHorizontal: 30, paddingTop: 40}}>
        {/* Title */}
        <View style={{flexDirection: 'row', marginBottom: 30}}>
          <FontAwesome5 name="warehouse" color={AppColors.grey} size={24} />
          <Text style={[styles.titleText, {marginLeft: 20}]}>
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

  renderDelivery = () => {
    const {stop, endAddress} = this.state;
    const contacts = groupOrdersByContacts(stop.orders);
    return (
      <View style={{flex: 1, paddingTop: 30}}>
        {/* Address */}
        <View style={{paddingHorizontal: 30}}>
          <View style={{flexDirection: 'row', marginBottom: 30}}>
            <IonIcon name="location-sharp" color={AppColors.grey} size={36} />
            <Text style={[styles.addressText, {paddingLeft: 20, flex: 1}]}>
              {endAddress}
            </Text>
          </View>
        </View>

        {/* Orders */}
        <ScrollView
          contentContainerStyle={{paddingHorizontal: 10, paddingBottom: 20}}>
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
    );
  };

  render() {
    const {stop} = this.state;
    return (
      <SafeAreaView style={{flex: 1}}>
        {/* <Waiting visible={this.props.route.calling} title={"Selecting destination..."} /> */}
        {stop.type === consts.STOP_TYPES.PICKUP
          ? this.renderPickup()
          : this.renderDelivery()}

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
            title="START TRAVEL"
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
              this.forceResetLastButton = reset;
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
      setCurrentStop: setCurrentStop,
      setCurrentStopOffline: setCurrentStopOffline,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(StartTravelScreen);

const styles = StyleSheet.create({
  titleText: {
    color: AppColors.text,
    fontFamily: AppFonts.main.medium,
    fontSize: 20,
    justifyContent: 'center',
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
});
