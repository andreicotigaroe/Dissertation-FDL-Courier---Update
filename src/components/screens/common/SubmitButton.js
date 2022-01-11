import React, {} from 'react';
import PropTypes from 'prop-types';
import {View, Text} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  MaterialIndicator,
} from 'react-native-indicators';

import TouchableDebounce from './TouchableDebounce';
import { AppFonts } from '~/assets/styles';

const SubmitButton = props => {
  const {
    caption,
    onPress,
    disabled,
    gradientColors,
    captionColor,
    submitting,
  } = props;
  const buttonHeight = props.style.height || 50;

  return (
    <TouchableDebounce
      activeOpacity={0.6}
      onPress={onPress}
      disabled={disabled}
      style={[props.style, {height: buttonHeight}]}>
      <LinearGradient
        colors={gradientColors}
        useAngle={true}
        angle={70}
        angleCenter={{x: 0.5, y: 0.5}}
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          flex: 1,
          borderRadius: buttonHeight / 2,
          paddingHorizontal: 15,
          opacity: disabled ? 0.6 : 1,
        }}>
        <View style={{marginRight: 12, display: submitting ? 'flex' : 'none'}}>
          <MaterialIndicator color="white" size={20} />
        </View>
        <Text style={{color: captionColor, fontSize: 15, fontFamily: AppFonts.main.regular}}>{caption}</Text>
      </LinearGradient>
    </TouchableDebounce>
  );
};

SubmitButton.defaultProps = {
  disabled: false,
  submitting: false,
  gradientColors: ['#24abb1', '#24abd7'],
  captionColor: 'white',
  style: {},
};

SubmitButton.propTypes = {
  onPress: PropTypes.func.isRequired,
  caption: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  submitting: PropTypes.bool,
  gradientColors: PropTypes.array,
  captionColor: PropTypes.string,
};

export default SubmitButton;
