import React from "react";
import { View, Alert, Text, StyleSheet } from "react-native";
import { connect } from 'react-redux';
import { default as Fontisto } from 'react-native-vector-icons/Fontisto';

import { AppColors, HeaderStyle, AppFonts, AppStyles } from "../../../assets/styles";
import { consts } from "../../../assets/values";
import ShipmentApi from "../../../services/api/ShipmentApi";
import AuthApi from "../../../services/api/AuthApi";
import { setUserData } from "../../../redux/reducers/auth";
import { SafeAreaView } from "react-navigation";
// import Geolocation from "@react-native-community/geolocation";
import Waiting from "../../widgets/Waiting";
import TouchableDebounce from "../common/TouchableDebounce";


class PickupOrderDetailsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      ...HeaderStyle,
      title: "ORDER DETAILS",
      headerRight: () => {
        return (<View style={{ marginRight: 10 }} />);
      },
    }
  };

  constructor(props) {
    super(props);

    const { order } = this.props.navigation.state.params;
    var parcelNum = order.parcels.length;

    this.state = {
      order: order,
      parcelNum: parcelNum,
      submitting: false,
    };
    this.mapView = null;
    this.marker = null;
  }

  async componentDidMount() {
    
  }

  componentWillUnmount() {

  }

  renderOrder = (order) => {
    const parcelNum = order.parcels.length;
    const disabled = order.status === consts.ORDER_STATUS.PARTIALLY_DELIVERED || order.status === consts.ORDER_STATUS.NOT_DELIVERED || order.status === consts.ORDER_STATUS.DELIVERED;

    return <View key={`${order.id}`}
      disabled={disabled} style={{ opacity: disabled ? 0.7 : 1, marginHorizontal: 10, paddingHorizontal: 20, paddingVertical: 20, marginBottom: 5 }}>
      <View>
        <View style={{ flexDirection: "row", marginTop: 10, alignItems: "center" }}>
          <Fontisto name="person" color={AppColors.grey} size={20} />
          <Text style={{ marginLeft: 10, fontSize: 20, fontFamily: AppFonts.main.medium, color: AppColors.text }}>{order.recipient_contact}</Text>
        </View>
        <View style={{ flexDirection: "row", marginTop: 20, marginLeft: 20 }}>
          <Fontisto name="phone" color={AppColors.grey2} size={20} />
          <Text style={{ fontSize: 14, fontFamily: AppFonts.main.medium, marginLeft: 20, color: AppColors.grey }}>{order.recipient_phone_number}</Text>
        </View>
        <View style={{ flexDirection: "row", marginTop: 10, marginLeft: 20 }}>
          <Fontisto name="email" color={AppColors.grey2} size={20} />
          <Text style={{ fontSize: 14, fontFamily: AppFonts.main.medium, marginLeft: 20, color: AppColors.grey }}>{order.email || "- - -"}</Text>
        </View>
        {order.recipient_company_name ? <View style={{ flexDirection: "row", marginTop: 10, color: AppColors.grey2 }}>
          <Text style={{ fontSize: 14, fontFamily: AppFonts.main.medium }}>{order.recipient_company_name}</Text>
        </View> : null}
        <View style={[AppStyles.divider, { marginTop: 20 }]} />
        <View style={{ flexDirection: "row", marginTop: 20, color: AppColors.text }}>
          <Text style={{ fontSize: 16 }}>{parcelNum} Parcels</Text>
        </View>
      </View>
    </View>;
  }

  onSubmit = () => {
    this.setState({ submitting: true });
    ShipmentApi.addOrderToRoute(this.state.order.id, this.props.route.id, this.props.token).then(response => {
      AuthApi.getAuthUser(this.props.token).then(response => {
        this.setState({ submitting: false });
        console.log(response.data.route);
        this.props.navigation.popToTop();
        this.props.setUserData(response.data);
      });
    }).catch(error => {
      this.setState({ submitting: false });
      Alert.alert("Action Failed", "Adding orders to the route was failed.");
    })
  }

  render() {
    const { order, parcelNum } = this.state;
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Waiting visible={this.state.submitting} title={"Picking up the order..."} />
          <View style={{ paddingTop: 30 }}>
            <Text style={styles.orderTitle}>#{order.id}</Text>
          </View>
          {this.renderOrder(order)}
        </View>
        <View style={AppStyles.bottomContainer}>
          <TouchableDebounce style={AppStyles.bottomButtonContainer} activeOpacity={0.6} onPress={() => {
            Alert.alert(
              "Confirm",
              "Are you sure to add this order to your route?",
              [
                {
                  text: "No",
                  style: "cancel"
                },
                {
                  text: "Yes",
                  onPress: () => {
                    this.onSubmit();
                  }
                },
              ],
              { cancelable: false }
            );
          }}>
            <Text style={AppStyles.bottomButtonText}>ADD ORDER TO ROUTE</Text>
          </TouchableDebounce>
        </View>
      </SafeAreaView >
    );
  }
}

const mapStateToProps = state => ({
  token: state.auth.token,
  user: state.auth.user,
  route: state.route,
});

export default connect(mapStateToProps, { setUserData })(PickupOrderDetailsScreen);


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
    fontSize: 13,
    // marginBottom: 20,
    paddingLeft: 10,
    paddingVertical: 10,
    flex: 1,
  },
  parcels: {
    color: AppColors.text,
    fontFamily: AppFonts.main.medium,
    fontSize: 14,
  },
  locationButton: {
    position: "absolute",
    right: 12,
    bottom: 12,
    width: 40,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3
  },
  icon: {
    width: 30,
    textAlign: "center",
  },
  orderTitle: {
    color: AppColors.textLight,
    fontFamily: AppFonts.main.medium,
    fontSize: 18,
    textAlign: 'center'
  },
})