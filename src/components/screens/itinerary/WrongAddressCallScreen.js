import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Linking,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {default as Ionicon} from 'react-native-vector-icons/Ionicons';
import {default as AntDesign} from 'react-native-vector-icons/AntDesign';

import {AppColors, AppFonts} from '~/assets/styles';
import TouchableDebounce from '../common/TouchableDebounce';
import ListItem from '~/components/widgets/ListItem';
import BlockingModal from '~/components/widgets/BlockingModal';
import {useSelector, useDispatch} from 'react-redux';
import {
  reportWrongAddress,
  reportWrongAddressOffline,
} from '~/redux/actions/route';


const renderCustomerPhoneNumber = (name, phoneNumber) => {
  return (
    <View
      key={phoneNumber}
      style={{
        ...styles.callContainer,
      }}>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          paddingLeft: 15,
        }}>
        {name === 'Customer Service' ? (
          <AntDesign name="customerservice" size={24} color={AppColors.grey} />
        ) : (
          <Ionicon name="person" size={24} color={AppColors.grey} />
        )}
      </View>
      <View style={{paddingHorizontal: 20, flex: 1}}>
        <Text
          style={{
            fontFamily: AppFonts.main.medium,
            color: AppColors.text,
          }}>
          {name}
        </Text>
        <Text
          style={{
            fontFamily: AppFonts.main.medium,
            color: AppColors.grey,
            marginTop: 5,
          }}>
          {phoneNumber}
        </Text>
      </View>
      <TouchableDebounce
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          borderLeftColor: AppColors.grey3,
          borderLeftWidth: 1,
          paddingHorizontal: 10,
        }}
        onPress={() => Linking.openURL(`tel:${phoneNumber}`)}>
        <Ionicon
          name="ios-call"
          size={32}
          color={
            name === 'Customer Service' ? AppColors.danger : AppColors.success
          }
        />
      </TouchableDebounce>
    </View>
  );
};

const WrongAddressCallScreen = (props) => {
  const {
    auth: {token, user},
    network,
  } = useSelector((state) => state);

  const dispatch = useDispatch();
  const {stop} = props.navigation.state.params;
  // const [customerServicePhoneNo, setCustomerServicePhoneNo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    Geolocation.getCurrentPosition(
      (position) => {
        console.log('[Wrong Delivery] Geolocation Error: ', position);
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.log('[Wrong Delivery] Geolocation Error: ', error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
        forceRequestLocation: true,
      },
    );
  }, []);

  const requestWrongAddress = () => {
    Alert.alert(
      'Report wrong address',
      'Are you sure to report the wrong address?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            const payload = {
              address: null,
              choice: 'cannot_deliver',
              location: currentLocation,
            };
            props.reportWrongAddress(payload, new Date(), stop.id);
            props.reportWrongAddressOffline(payload, new Date(), stop.id);
            props.navigation.popToTop();
          },
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <BlockingModal
        visible={submitting}
        message={'Submitting the wrong address...'}
      />
      <View style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={{
            paddingVertical: 20,
          }}>
          <View
            style={{
              paddingHorizontal: 20,
            }}>
            {stop.orders.map((order) =>
              renderCustomerPhoneNumber(
                order.recipient_contact,
                order.recipient_phone_number,
              ),
            )}
          </View>

          <View style={{marginTop: 30}}>
            <ListItem
              title={'I have the new address'}
              onPress={() => {
                if (network.isConnected) {
                  props.navigation.navigate('SetRecipientLocation', {
                    // order: order,
                    stop: stop,
                  });
                } else {
                  Alert.alert(
                    'Error',
                    'You cannot submit the new address because you are offline and cannot verify the new location on the map',
                  );
                }
              }}
            />
            <ListItem
              title={'Customer not answered'}
              indicatorColor={AppColors.danger}
              onPress={() => requestWrongAddress()}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      reportWrongAddress: reportWrongAddress,
      reportWrongAddressOffline: reportWrongAddressOffline,
    },
    dispatch,
  );

export default connect(state => ({}), mapDispatchToProps)(WrongAddressCallScreen);

const styles = StyleSheet.create({
  // callContainer: {
  //   backgroundColor: 'white',
  //   borderRadius: 11,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   flex: 1
  // },
  callContainer: {
    backgroundColor: 'white',
    borderRadius: 11,
    flex: 1,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
});
