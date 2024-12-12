import { Tabs } from 'expo-router';
import React from 'react';
import {FontAwesome} from "@expo/vector-icons";

const TabsLayout = () => {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
        <Tabs.Screen name='homePage'
                     options={{
                         title: 'Home',
                         tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
                     }}/>
        <Tabs.Screen name='test' options={{
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
		<Tabs.Screen name='userCart'/>
    </Tabs>
  );
};

export default TabsLayout;
