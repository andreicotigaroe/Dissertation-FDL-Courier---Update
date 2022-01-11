import React, {PureComponent, useCallback} from 'react';
import {ViewPropTypes, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';

//PureComponent handles shouldComponentUpdate for you.
class TouchableDebounce extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handlePress = debounce(this.onPressButton, this.props.debounceTime, {leading: true, trailing: false});
  }

  onPressButton = () => {
    this.props.onPress();
  }

  render() {
    return (
      <TouchableOpacity
        {...this.props}
        onPress={this.handlePress}
        activeOpacity={0.6}
      >
        {this.props.children}
      </TouchableOpacity>
    );
  }
}

TouchableDebounce.propTypes = {
  onPress: PropTypes.func,
  handleFirstTap: PropTypes.bool,
  debounceTime: PropTypes.number,
};

TouchableDebounce.defaultProps = {
  style: {},
  debounceTime: 1000,
  onPress: () => {},
};

export default TouchableDebounce;
