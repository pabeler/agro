import { Tab } from '@rneui/themed';
import { View, Text } from 'react-native';
import { Tabs } from 'expo-router';
import React from 'react';

const TabsLayout = () => {
  return (
    <Tabs>
        <Tabs.Screen name='homePage'/>
        <Tabs.Screen name='test'/>
        <Tabs.Screen name='userProfile'/>
        <Tabs.Screen name='userCart'/>
    </Tabs>
  );
};

export default TabsLayout;