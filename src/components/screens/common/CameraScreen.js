import React from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar, TouchableOpacity, PermissionsAndroid, Platform, Alert } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { RNCamera, FaceDetector } from 'react-native-camera';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/Ionicons';
import { default as MaterialCommunityIcon } from 'react-native-vector-icons/MaterialCommunityIcons';
import { withNavigationFocus } from "react-navigation";

import { AppColors, AppFonts } from '../../../assets/styles';
import TouchableDebounce from './TouchableDebounce';


class CameraScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerShown: false
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      flashMode: 0
    };
    this.camera = React.createRef(null);
    this.frame = null;
    this.cameraScreen = null;
  }

  componentDidMount() {
  }

  componentWillUnmount() {

  }

  takePicture = async () => {
    if (this.camera) {
      const { setPicture } = this.props.navigation.state.params;
      const options = { quality: 0.8, base64: true, width: 1024, orientation: "portrait", fixOrientation: true }; // MICHAEL
      const data = await this.camera.takePictureAsync(options);
      console.log("Width:", data.width, data.height, data.base64.length);
      setPicture(data.base64);
      this.props.navigation.pop();
    }
  };

  onDone = () => {

  }

  renderCamera = () => {
    const { isFocused } = this.props
    const { hasCameraPermission, flashMode } = this.state;

    const screenSize = Dimensions.get('screen');

    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else if (isFocused) {
      return (
        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          style={styles.preview, { width: screenSize.width, height: screenSize.width * 4 / 3 }}
          type={RNCamera.Constants.Type.back}
          flashMode={flashMode == 0 ? RNCamera.Constants.FlashMode.auto : flashMode == 1 ? RNCamera.Constants.FlashMode.on : RNCamera.Constants.FlashMode.off}
          captureAudio={false}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
        />
      );
    } else {
      return <View />;
    }
  }

  render() {
    const { docIndex, docType } = this.props.navigation.state.params;
    const { flashMode } = this.state;
    return (
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <View style={{ flexDirection: "column", alignItems: "flex-end", marginRight: 10, marginVertical: 10 }}>
          <TouchableDebounce style={{ padding: 10 }}
            onPress={() => this.setState({ flashMode: (flashMode + 1) % 3 })}>
            <MaterialCommunityIcon name={flashMode == 0 ? "flash-auto" : flashMode == 1 ? "flash" : "flash-off"} color={AppColors.grey2} size={24} />
          </TouchableDebounce>
        </View>

        {this.renderCamera()}

        <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'space-between', marginTop: "auto", marginBottom: "auto", paddingHorizontal: 50 }}>
          <TouchableDebounce onPress={() => { this.props.navigation.pop() }} style={styles.back}>
            <Icon name="ios-close-outline" color={AppColors.grey2} size={32} />
          </TouchableDebounce>
          <TouchableDebounce onPress={this.takePicture.bind(this)} style={styles.capture}>
            <FontAwesome name="camera" color={AppColors.grey2} size={32} />
          </TouchableDebounce>
        </View>
      </View>
    )
  }
};


export default withNavigationFocus(CameraScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
  },
  back: {
    flex: 0,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: 'white'
  },
  nullBack: {
    flex: 0,
    width: 60,
    height: 60,
  },
  frame: {
    borderColor: '#f00',
    borderWidth: 1,
  },
  typeActive: {
    fontFamily: AppFonts.main.semibold,
    fontSize: 14,
    color: AppColors.primary,
    opacity: 1.0
  },
  typeInactive: {
    fontFamily: AppFonts.main.regular,
    fontSize: 14,
    color: AppColors.white,
    opacity: 0.6
  }
});
