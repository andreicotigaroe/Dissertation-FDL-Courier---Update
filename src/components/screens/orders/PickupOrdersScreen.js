import React from "react";
import { View, Alert, Text, Image, Modal, TouchableOpacity, Dimensions, StyleSheet, SafeAreaView, FlatList, ScrollView } from "react-native";
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import { default as MaterialIcon } from 'react-native-vector-icons/MaterialIcons';
import { default as Ionicon } from 'react-native-vector-icons/Ionicons';
import { default as FontAwesomeIcon } from 'react-native-vector-icons/FontAwesome';
import { default as MaterialCommunityIcon } from 'react-native-vector-icons/MaterialCommunityIcons';
import { default as Octicon } from 'react-native-vector-icons/Octicons';
import { DotIndicator } from 'react-native-indicators';

import { AppColors, HeaderStyle, AppFonts, AppStyles } from "../../../assets/styles";
import { consts } from "../../../assets/values";
import ShipmentApi from "../../../services/api/ShipmentApi";
import AuthApi from "../../../services/api/AuthApi";
import { setUserData } from "../../../redux/reducers/auth";
import TouchableDebounce from "../common/TouchableDebounce";


class PickupOrdersScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      ...HeaderStyle,
      headerLeft: () => {
        return (
          <View style={{ marginLeft: 10 }}>
            <TouchableDebounce activeOpacity={0.4} onPress={() => navigation.openDrawer()} style={{ opacity: 0.6 }}>
              <Image
                source={require('../../../assets/images/logo_sm_1.png')}
                style={{ width: 36, height: 36, resizeMode: "stretch" }}
              />
            </TouchableDebounce>
          </View>
        )
      },
      title: 'PICKUP ORDERS',
    }
  };

  constructor(props) {
    super(props);

    this.state = {
      submitting: false,
      loading: true,
      orders: []
    };

    
  }

  refresh = () => {

  }

  async componentDidMount() {

  }

  componentWillUnmount() {

  }

  onStart = () => {
    this.props.navigation.navigate("ScanPickupParcel");
  }

  render() {
    const { orders, loading } = this.state;
    if (!this.props.route || this.props.route.stops.length === 0) {
      return (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={styles.errorText}>
            You don't have an assigned work today.
                    </Text>
        </View>);
    }
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Modal
          visible={this.state.submitting}
          transparent={true}
          animationType="fade"
        >
          <View style={AppStyles.loadingContainer}>
            <DotIndicator color='white' size={8} />
          </View>
        </Modal>
        <View style={{flex: 1, justifyContent: "center", padding: 20}}>
          <TouchableDebounce style={styles.startButtonContainer} activeOpacity={0.6} onPress={() => this.onStart()}>
            <Text style={styles.startButtonText}>START PICKUP ORDERS&nbsp;&nbsp;&nbsp;{">>"}</Text>
          </TouchableDebounce>
        </View>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => ({
  token: state.auth.token,
  user: state.auth.user,
  route: state.route,
});

export default connect(mapStateToProps, { setUserData })(PickupOrdersScreen);

const styles = StyleSheet.create({
  errorText: {
    color: AppColors.grey,
    fontFamily: AppFonts.main.medium,
    fontSize: 14,
    textAlign: 'center'
  },
  
  startButtonContainer: {
    backgroundColor: AppColors.primary, 
    height: 50, 
    justifyContent: 'center'
  },
  startButtonText: {
    textAlign: 'center', 
    color: AppColors.white, 
    fontFamily: AppFonts.main.semibold, 
    fontSize: 15,
  },
});