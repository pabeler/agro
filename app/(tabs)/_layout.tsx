import { Tabs } from 'expo-router';
import {FontAwesome} from "@expo/vector-icons";
import {StyleSheet, View} from "react-native";
import Slider from '@react-native-community/slider';

// const CustomHeader = () => (
//     <View style={styles.header}>
//         <Slider
//             style={{width: 200, height: 40}}
//             minimumValue={0}
//             maximumValue={1}
//             minimumTrackTintColor="#FFFFFF"
//             maximumTrackTintColor="#000000"
//         />
//     </View>
// );

const TabsLayout = () => {
  return (
      <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
          <Tabs.Screen name='homePage'
                       options={{
                           title: 'Home',
                           tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
                       }}/>
          <Tabs.Screen name='orders' options={{
              title: 'Orders',
              tabBarIcon: ({ color }) => <FontAwesome size={28} name="truck" color={color} />,
          }}/>
          <Tabs.Screen name="map" options={
              {
                  title: 'Map',
                  tabBarIcon: ({ color }) => <FontAwesome size={28} name="map" color={color} />,
              }
          }
          />
          <Tabs.Screen name='userProfile' options={
              {
                  title: 'Profile',
                  tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} />,
              }
          }/>
      </Tabs>
  );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        width: '100%',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    slider: {
        flex: 1,
        marginLeft: 10,
    },
});

export default TabsLayout;
