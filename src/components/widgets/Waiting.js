import React, {
    Component,
} from 'react';

import { StyleSheet, View, Image, Text, Modal } from 'react-native';
import { AppStyles, AppFonts } from '../../assets/styles';
import { SkypeIndicator } from 'react-native-indicators';


export default class Waiting extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Modal
                visible={this.props.visible}
                transparent={true}
                animationType="fade"
            >
                <View style={AppStyles.loadingContainer}>
                    {/* <ActivityIndicator animating={this.props.visible} color="#fff" size="large" /> */}
                    <SkypeIndicator color='white' size={84} style={{ flex: null }} minScale={0.3} maxScale={0.3} />
                    {this.props.title &&
                        <Text style={styles.titleText}>{this.props.title}</Text>}
                </View>
            </Modal>
        );
    }

}

const styles = StyleSheet.create({
    titleText: {
        fontSize: 14,
        paddingTop: 10,
        color: 'white',
        fontFamily: AppFonts.main.medium,
        textAlignVertical: "center",
        textAlign: "center"
    },
});