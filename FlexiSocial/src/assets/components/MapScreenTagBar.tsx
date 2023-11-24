import { ScrollView, StyleSheet, View } from "react-native"
import TagButton from "./TagButton"
import { useDispatch, useSelector } from "react-redux";
import { setMapScreenToggle } from "../../redux/actions";
import { colors } from "../../config/config";
import { State } from "../../redux/state";


interface MapScreenTagBarProps {
}


/**
 * Bar containing "This Month" / "This Week" / toggle buttons
 * @param props 
 * @returns 
 */
export default function MapScreenTagBar(props: MapScreenTagBarProps) {

    const dispatch = useDispatch();
    const { today, tomorrow, thisWeek, thisMonth } = useSelector((state: State) => state.persistent.mapScreen.toggles)

    /**
     * when the "All" toggle is pressed
     */
    function toggleAll() {
        if (today && tomorrow && thisWeek && thisMonth) {
            dispatch(setMapScreenToggle({
                today: false, tomorrow: false, thisWeek: false, thisMonth: false
            }));
        } else {
            dispatch(setMapScreenToggle({
                today: true, tomorrow: true, thisWeek: true, thisMonth: true
            }));
        }
    }

    return (
        <View>
            <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                decelerationRate={"fast"}
                style={{
                    alignSelf: 'flex-start',
                    flexDirection: "row",
                    paddingVertical: 10,
                    // backgroundColor:colors.secondary
                }}

            >
                <View style={{ flexDirection: "row", marginHorizontal: 20 }}>
                    <TagButton
                        style={styles.tagButton}
                        onToggle={() => dispatch(setMapScreenToggle({ today: !today }))}
                        enabled={today}
                        label="Today"
                    />
                    <TagButton
                        style={styles.tagButton}
                        onToggle={() => dispatch(setMapScreenToggle({ tomorrow: !tomorrow }))}
                        enabled={tomorrow}
                        label="Tomorrow"
                    />
                    <TagButton
                        style={styles.tagButton}
                        onToggle={() => dispatch(setMapScreenToggle({ thisWeek: !thisWeek }))}
                        enabled={thisWeek}
                        label="This week"
                    />
                    <TagButton
                        style={styles.tagButton}
                        onToggle={() => dispatch(setMapScreenToggle({ thisMonth: !thisMonth }))}
                        enabled={thisMonth}
                        label="This month"
                    />
                    <TagButton
                        style={styles.tagButton}
                        onToggle={toggleAll}
                        enabled={today && tomorrow && thisWeek && thisMonth}
                        label="All"
                    />
                </View>

            </ScrollView>
        </View >

    )
}

const styles = StyleSheet.create({
    tagButton: {
        marginHorizontal: 5
    }

})