import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";
import { colors } from "../../config/config";

interface LoadingModalProps {
    visible?: boolean
}

export default function LoadingModal(props: LoadingModalProps) {

    // default values
    props = {
        visible:true,
        ...props
    }

    return (
        <Modal
            animationType="fade"
            visible={props.visible}
            transparent
        >
            <View style={styles.background}>
                <ActivityIndicator
                    size={"large"}
                    color={colors.secondary}
                />
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    background: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor:"#0008", // transparent gray.
        justifyContent:"center",
        alignItems:"center"
    }
})