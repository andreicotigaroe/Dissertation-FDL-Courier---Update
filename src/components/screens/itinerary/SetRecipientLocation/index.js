import React, {useEffect, useState, useCallback, useRef} from 'react';
import {useSelector, useDispatch, connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Alert,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import Geocoder from 'react-native-geocoding';
import Geolocation from 'react-native-geolocation-service';
import {default as AntDesign} from 'react-native-vector-icons/AntDesign';
import {default as Ionicon} from 'react-native-vector-icons/Ionicons';

import {AppColors, AppFonts, AppStyles} from '~/assets/styles';
import AppConfig from '~/config';

import BlockingModal from '~/components/widgets/BlockingModal';
import TouchableDebounce from '../../common/TouchableDebounce';
import PairListItem from '~/components/widgets/PairListItem';
import {firstCharUppercase, getAddressObject} from '~/utils';
import EditValueModal from '~/components/widgets/EditValueModal';
import ChoiceModal from './ChoiceModal';
import {
  sagaReportWrongAddress,
  sagaSubmitDeliveryFailure,
} from '~/redux/sagas/route';
import {consts} from '~/assets/values';
import {reportWrongAddress, reportWrongAddressOffline, setRoute} from '~/redux/actions/route';


const SetRecipientLocation = (props) => {
  const dispatch = useDispatch();
  const {auth: {token, user}, network} = useSelector((state) => state);

  const {stop} = props.navigation.state.params;

  const [submitting, setSubmitting] = useState(false);
  const [visibleEditModal, setVisibleEditModal] = useState(false);
  const [defaultValue, setDefaultValue] = useState('');
  const [editingKey, setEditingKey] = useState('');
  const [visibleChoiceModal, setVisibleChoiceModal] = useState(false);

  const mapView = useRef(null);
  const [address, setAddress] = useState({
    address1: stop.address.address1,
    address2: stop.address.address2,
    city: stop.address.city,
    state: stop.address.state,
    postcode: stop.address.postcode,
  });
  const [region, setRegion] = useState(
    stop.address.location
      ? {
          latitude: stop.address.location.latitude,
          longitude: stop.address.location.longitude,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        }
      : null,
  );

  const [location, setLocation] = useState(
    stop.address.location
      ? {
          latitude: stop.address.location.latitude,
          longitude: stop.address.location.longitude,
          place_id: stop.address.location.place_id,
        }
      : null,
  );

  const onSelectAddress = useCallback((data, addressDetails) => {
    if (addressDetails) {
      console.log(JSON.stringify(addressDetails, null, 2));
      const addressLocation = addressDetails.geometry.location;
      if (mapView.current)
        mapView.current.animateToRegion({
          latitude: addressLocation.lat,
          longitude: addressLocation.lng,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        });
      setLocation({
        latitude: addressLocation.lat,
        longitude: addressLocation.lng,
        place_id: addressDetails.place_id,
      });

      const addressComponents = getAddressObject(
        addressDetails.address_components,
      );
      setAddress({
        address1: `${addressComponents.street} ${addressComponents.home}`.trim(),
        address2: '',
        city: addressComponents.city,
        state: addressComponents.state,
        postcode: addressComponents.postal_code,
      });
    }
  }, []);

  const onMarkerDragEnd = useCallback((e) => {
    console.log('onMarkerDragEnd: ', e.nativeEvent.coordinate);
    const coord = e.nativeEvent.coordinate;
    Geocoder.from({...coord})
      .then((value) => {
        const results = value.results;
        if (results.length > 0) {
          const {location: geoLoc} = results[0].geometry;
          console.log('Marker:', geoLoc, results[0].place_id);
          setLocation({
            ...coord,
            place_id: results[0].place_id,
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const geocodeAddress = useCallback((addr) => {
    Geocoder.from(
      `${addr.address1}, ${addr.city}, ${addr.postcode}, United Kingdom`,
    )
      .then((value) => {
        const results = value.results;
        if (results.length > 0) {
          const {location: geoLoc} = results[0].geometry;
          console.log('Geocode:', geoLoc, results[0].place_id);
          setLocation({
            latitude: geoLoc.lat,
            longitude: geoLoc.lng,
            place_id: results[0].place_id,
          });
          if (mapView.current)
            mapView.current.animateToRegion({
              latitude: geoLoc.lat,
              longitude: geoLoc.lng,
              latitudeDelta: 0.002,
              longitudeDelta: 0.002,
            });
        }
      })
      .catch((error) => {
        console.log(error.response);
      });
  }, []);

  const onSubmit = useCallback(() => {
    if (!address.address1 || !address.city || !address.postcode) {
      Alert.alert(
        'Address Error',
        'One or more required fields are missing. Please make sure you filled all asterisk(*) fields.',
      );
      return;
    }
    if (!location) {
      Alert.alert(
        'Location Error',
        "You didn't verify your location. Please check your location on the map.",
      );
      return;
    }
    Alert.alert(
      'Are you sure?',
      "Are you really sure the location marked on the map is the recipient's location?",
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            setVisibleChoiceModal(true);
          },
        },
      ],
      {cancelable: false},
    );
  }, [address, location]);

  const onSelectChoice = (choice) => {
    setSubmitting(true);
    Geolocation.getCurrentPosition(
      (position) => {
        console.log('[SetRecipientLocation] Geolocation: ', position);
        const payload = {
          address: {
            ...address,
            address3: '',
            location: location,
            country: 'GB',
          },
          choice,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        };
        props.reportWrongAddress(payload, new Date(), stop.id);
        props.reportWrongAddressOffline(payload, new Date(), stop.id);
        props.navigation.popToTop();
      },
      (error) => {
        console.log(
          '[SetRecipientLocation] Geolocation Error: ',
          error.message,
        );
        const payload = {
          address: {
            ...address,
            address3: '',
            location: location,
            country: 'GB',
          },
          choice,
          location: null,
        };
        props.reportWrongAddress(payload, new Date(), stop.id);
        props.reportWrongAddressOffline(payload, new Date(), stop.id);
        props.navigation.popToTop();
      },
      {
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 1000,
        forceRequestLocation: true,
      },
    );
  };

  useEffect(() => {}, []);

  return (
    <SafeAreaView style={AppStyles.mainContainer}>
      <BlockingModal
        visible={submitting}
        message={'Submitting my location...'}
      />

      {visibleEditModal && (
        <EditValueModal
          visible={visibleEditModal}
          defaultValue={defaultValue}
          backdrop={true}
          onOk={(value) => {
            setAddress({
              ...address,
              [editingKey]: firstCharUppercase(value),
            });
            setVisibleEditModal(false);
            setEditingKey('');
          }}
          onCancel={() => {
            setVisibleEditModal(false);
          }}
        />
      )}

      {visibleChoiceModal && (
        <ChoiceModal
          visible={visibleChoiceModal}
          backdrop={true}
          onOk={(choice) => onSelectChoice(choice)}
          onCancel={() => {
            setVisibleChoiceModal(false);
          }}
        />
      )}

      <View style={{marginTop: 3, alignSelf: 'stretch'}}>
        <PairListItem
          label="Address 1*"
          placeholder="(Street and number)"
          value={address.address1}
          verticalPadding={10}
          onPress={() => {
            setEditingKey('address1');
            setDefaultValue(address.address1);
            setVisibleEditModal(true);
          }}
        />
        <PairListItem
          label="Address 2"
          placeholder="(Apartment, Suite, Floor, etc.)"
          value={address.address2}
          verticalPadding={10}
          onPress={() => {
            setEditingKey('address2');
            setDefaultValue(address.address2);
            setVisibleEditModal(true);
          }}
        />
        <PairListItem
          label="City*"
          value={address.city}
          verticalPadding={10}
          onPress={() => {
            setEditingKey('city');
            setDefaultValue(address.city);
            setVisibleEditModal(true);
          }}
        />
        <PairListItem
          label="State"
          value={address.state}
          verticalPadding={10}
          onPress={() => {
            setEditingKey('state');
            setDefaultValue(address.state);
            setVisibleEditModal(true);
          }}
        />
        <PairListItem
          label="Postcode*"
          value={address.postcode}
          verticalPadding={10}
          onPress={() => {
            setEditingKey('postcode');
            setDefaultValue(address.postcode);
            setVisibleEditModal(true);
          }}
        />
      </View>
      <View style={{flexGrow: 1, width: '100%'}}>
        <MapView
          ref={mapView}
          automaticallyAdjustContentInsets={false}
          initialRegion={
            region || {
              latitude: 19.524328,
              longitude: 78.547402,
              latitudeDelta: 20,
              longitudeDelta: 20,
            }
          }
          style={{flex: 1}}
          onMapReady={() => {}}>
          {location ? (
            <Marker
              draggable={true}
              onDragEnd={onMarkerDragEnd}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
            />
          ) : undefined}
        </MapView>

        <TouchableDebounce
          style={styles.geocodeButton}
          onPress={() => geocodeAddress(address)}>
          <AntDesign name="earth" size={32} color={AppColors.GRAY} />
        </TouchableDebounce>

        <TouchableDebounce style={styles.submitButton} onPress={onSubmit}>
          <Ionicon
            name="ios-arrow-forward-outline"
            size={32}
            color={AppColors.WHITE}
          />
        </TouchableDebounce>

        <GooglePlacesAutocomplete
          placeholder="Find the address here..."
          fetchDetails={true}
          onPress={onSelectAddress}
          filterReverseGeocodingByTypes={['address']}
          nearbyPlacesAPI="GooglePlacesSearch"
          query={{
            key: AppConfig.GOOGLE_API_KEY,
            language: 'en',
            components: 'country:gb',
          }}
          styles={{
            container: {
              position: 'absolute',
              top: 0,
              width: '100%',
              padding: 10,
            },
            listView: {backgroundColor: 'white', marginTop: 5},
            row: {fontFamily: AppFonts.main.regular, fontSize: 13},
            textInputContainer: {
              height: 40,
              borderRadius: 5,
              backgroundColor: 'white',
            },
            textInput: {
              fontFamily: AppFonts.main.regular,
              fontSize: 13,
              color: AppColors.TEXT,
              marginLeft: 0,
              borderRadius: 5,
            },
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  userDataContainer: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    paddingVertical: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    borderRadius: 40,
    borderWidth: 2,
    borderColor: AppColors.white,
    overflow: 'hidden',
  },
  avatar: {
    width: 72,
    height: 72,
    resizeMode: 'contain',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text,
  },
  userEmail: {marginTop: 3, color: AppColors.text},
  userPhoneNumber: {color: AppColors.grey},
  historyContainer: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    padding: 10,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 10,
  },
  historyItemContainer: {
    flex: 1,
    alignItems: 'center',
  },
  historyItemLabel: {
    color: AppColors.textLight,
  },
  historyItemValue: {
    fontSize: 28,
    fontFamily: AppFonts.main.bold,
    color: AppColors.text,
  },
  leftBorder: {
    borderRightWidth: 1,
    borderRightColor: AppColors.grayBackground,
  },

  locationContainer: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    padding: 10,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
  },
  address1: {color: AppColors.text, fontFamily: AppFonts.main.medium},
  allAddress: {
    color: AppColors.grey,
    fontFamily: AppFonts.main.regular,
    marginTop: 10,
  },
  geocodeButton: {
    backgroundColor: '#ffffffc0',
    position: 'absolute',
    width: 48,
    height: 48,
    bottom: 10,
    left: 10,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLocationButton: {
    backgroundColor: '#ffffffc0',
    position: 'absolute',
    width: 48,
    height: 48,
    bottom: 70,
    left: 10,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: AppColors.warning,
    position: 'absolute',
    width: 60,
    height: 60,
    bottom: 10,
    right: 10,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      reportWrongAddress: reportWrongAddress,
      reportWrongAddressOffline: reportWrongAddressOffline,
    },
    dispatch,
  );

export default connect(state => ({}), mapDispatchToProps)(SetRecipientLocation);