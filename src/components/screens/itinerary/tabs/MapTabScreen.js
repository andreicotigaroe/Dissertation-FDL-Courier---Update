import React from "react";
import { View, Alert, Text, Image, AppRegistry, AppState, Platform, TouchableOpacity, StyleSheet, TextInput, FlatList, ScrollView } from "react-native";
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Icon from 'react-native-vector-icons/Ionicons';
import MapView, { Marker } from 'react-native-maps';
import { default as FontAwesome5 } from 'react-native-vector-icons/FontAwesome5';

import { AppColors, HeaderStyle, AppFonts, AppStyles } from "../../../../assets/styles";
import { consts } from "../../../../assets/values";
import OfflineIndicator from "../../../widgets/OfflineIndicator";

class MapTabScreen extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    };

    this.mapView = null;
  }

  async componentDidMount() {
    const { route } = this.props;
    if (this.props.network.isConnected && this.mapView && route) {
      const coordinates = route.stops.map((stop, index) => {
        return {
          latitude: stop.address.location.latitude,
          longitude: stop.address.location.longitude
        }
      });
      this.mapView.fitToCoordinates(coordinates, {
        edgePadding: {
          top: 50,
          right: 20,
          bottom: 20,
          left: 20,
        },
        animated: true,
      });
    }
  }

  componentWillUnmount() {
  }

  render() {
    if (!this.props.network.isConnected) {
      return <OfflineIndicator title={"Oops! Your mobile is now offline!\nYou cannot navigate the map."} />
    }

    const { route } = this.props;
    return (
      <View style={AppStyles.mainContainer}>
        <View style={{ flex: 1 }}>
          <MapView
            ref={ref => this.mapView = ref}
            automaticallyAdjustContentInsets={false}
            style={{ flex: 1 }}
            onMapReady={() => {
              const coordinates = route.stops.map((stop, index) => {
                return {
                  latitude: stop.address.location.latitude,
                  longitude: stop.address.location.longitude
                }
              });
              this.mapView.fitToCoordinates(coordinates, {
                edgePadding: {
                  top: 50,
                  right: 20,
                  bottom: 20,
                  left: 20,
                },
                animated: false,
              });
            }}
          >
            {
              route.stops.map((stop, index) => {
                if (index == route.stops.length - 1) {
                  return null;
                }
                const markerColor = stop.type === consts.STOP_TYPES.PICKUP ? AppColors.text :
                  stop.status === consts.STOP_STATUS.FINISHED ? AppColors.grey :
                    stop.status === consts.STOP_STATUS.DEFAULT ? AppColors.primary : AppColors.danger;
                return <Marker
                  coordinate={{
                    latitude: stop.address.location.latitude,
                    longitude: stop.address.location.longitude,
                  }}
                  key={`${index}`}
                >
                  <Icon name="location-sharp" color={markerColor} size={53} />
                  <View style={{ position: 'absolute', backgroundColor: "white", width: 28, height: 28, borderRadius: 14, left: 12.5, top: 7 }} />
                  {stop.depot ?
                    <FontAwesome5 name="warehouse" style={styles.markerDepot} size={14} /> :
                    <Text style={styles.markerNum}>{index}</Text>}
                </Marker>
              })
            }
          </MapView>
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  token: state.auth.token,
  user: state.auth.user,
  route: state.route,
  network: state.network
});

export default connect(mapStateToProps)(MapTabScreen);

const styles = StyleSheet.create({
  markerNum: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    top: 9,
    fontFamily: AppFonts.main.semibold,
    color: AppColors.text,
    fontSize: 14,
  },
  markerDepot: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    top: 12,
    fontFamily: AppFonts.main.semibold,
    color: AppColors.text,
    fontSize: 14,
  }
})