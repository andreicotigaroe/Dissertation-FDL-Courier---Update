import React from 'react';
import {View, StyleSheet, Modal, Text} from 'react-native';
import {BallIndicator} from 'react-native-indicators';

export default props => {
  const {visible, message} = props;
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.loadingContainer}>
        {/* <ActivityIndicator animating={visible} color="#fff" size="large" /> */}
        <View style={{height: 50}}>
          <BallIndicator color="white" size={36} />
        </View>
        {message ? <Text style={{color: 'white', marginTop: 20}}>{message}</Text> : null}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
