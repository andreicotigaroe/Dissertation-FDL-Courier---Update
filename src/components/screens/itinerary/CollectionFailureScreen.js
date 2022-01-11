import React from 'react';
import {
  View,
  Alert,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {connect} from 'react-redux';
import {default as Ionicon} from 'react-native-vector-icons/Ionicons';

import {
  AppColors,
  HeaderStyle,
  AppFonts,
  AppStyles,
} from '../../../assets/styles';
import {consts} from '../../../assets/values';
import {bindActionCreators} from 'redux';
import {sagaSubmitCollectionFailure} from '../../../redux/sagas/route';
import TouchableDebounce from '../common/TouchableDebounce';

class CollectionFailureScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      ...HeaderStyle,
      title: 'FINISH COLLECTION',
      headerRight: () => {
        return <View />;
      },
    };
  };

  constructor(props) {
    super(props);

    this.stop = this.props.navigation.state.params.stop;
    this.orders = this.props.navigation.state.params.orders;
    this.failure_reason = this.props.navigation.state.params.failure_reason;
    this.state = {
      submitting: false,
      parcelsPicture: null,
    };
  }

  async componentDidMount() {
    this.props.navigation.setParams({onPressMenu: this.onPressMenu});
  }

  componentWillUnmount() {}

  onPressMenu = () => {
    this.dropdownMenu.show();
  };

  onPressTakePicture = () => {
    this.props.navigation.navigate('Camera', {
      setPicture: (base64) => {
        this.setState({parcelsPicture: base64});
      },
    });
  };

  onSubmit = () => {
    if (!this.state.parcelsPicture) {
      Alert.alert('Error', 'Please take a picture of the collection place.');
      return;
    }

    this.props.submitCollectionFailure(
      {
        reason: this.failure_reason,
        collection_picture: this.state.parcelsPicture,
        orders: this.orders.map((order) => order.id),
      },
      this.stop.id,
      {
        onSuccess: () => {
          this.props.navigation.pop(2);
        },
        onFailure: () => {
          Alert.alert('Action Failed', 'Finishing collection was failed.');
        },
      },
    );
  };

  render() {
    const {parcelsPicture} = this.state;
    return (
      <SafeAreaView style={{flex: 1}}>
        <View style={{flex: 1, padding: 20}}>
          <ScrollView>
            {this.failure_reason ===
              consts.COLLECTION_FAILURE_TYPES.NO_CUSTOMER && (
              <Text
                style={[
                  AppStyles.text,
                  {
                    color: AppColors.danger,
                    fontSize: 18,
                    lineHeight: 24,
                    textAlign: 'center',
                  },
                ]}>
                Collecting parcels has been failed because the customer is not
                available in the destination.
              </Text>
            )}
            {this.failure_reason === consts.COLLECTION_FAILURE_TYPES.BUSINESS_CLOSED && (
              <Text
                style={[
                  AppStyles.text,
                  {
                    color: AppColors.danger,
                    fontSize: 18,
                    lineHeight: 24,
                    textAlign: 'center',
                  },
                ]}>
                Collecting parcels has been failed because the business was
                closed.
              </Text>
            )}
            {this.failure_reason ===
              consts.COLLECTION_FAILURE_TYPES.NO_PARCEL && (
              <Text
                style={[
                  AppStyles.text,
                  {
                    color: AppColors.danger,
                    fontSize: 18,
                    lineHeight: 24,
                    textAlign: 'center',
                  },
                ]}>
                Collecting parcels has been failed because there is no parcels to collect in collection place.
              </Text>
            )}
            <View style={[AppStyles.roundSection, {marginTop: 10}]}>
              <View style={AppStyles.formGroup}>
                <Text style={AppStyles.label}>
                  Picture of the Collection Place
                </Text>
                <View style={{paddingVertical: 10}}>
                  <TouchableDebounce
                    onPress={() => this.onPressTakePicture()}
                    activeOpacity={0.6}>
                    <View
                      style={{
                        width: '100%',
                        height: 240,
                        backgroundColor: AppColors.grey3,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      {parcelsPicture ? (
                        <Image
                          source={{
                            uri: `data:image/jpeg;base64,${parcelsPicture}`,
                          }}
                          resizeMode="contain"
                          style={{width: '100%', height: 240}}
                        />
                      ) : (
                        <Ionicon
                          name="camera"
                          color={AppColors.white}
                          size={96}
                        />
                      )}
                    </View>
                  </TouchableDebounce>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>

        <View style={AppStyles.bottomContainer}>
          <TouchableDebounce
            style={AppStyles.bottomButtonContainer}
            activeOpacity={0.6}
            onPress={() => this.onSubmit()}>
            <Text style={AppStyles.bottomButtonText}>COMPLETE</Text>
          </TouchableDebounce>
        </View>
      </SafeAreaView>
    );
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
      submitCollectionFailure: sagaSubmitCollectionFailure,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CollectionFailureScreen);
