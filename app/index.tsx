import React, {useEffect, useRef, useState} from 'react'
import {Alert, StyleSheet, View, AppState, Text, Platform, ScrollView, BackHandler} from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Card, Input } from '@rneui/themed'
import { Href, Link, router } from 'expo-router'
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import {useNavigation, useRoute} from "@react-navigation/native";

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
      undefined
  );
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const route = useRoute();
  const [currentRoute, setCurrentRoute] = useState(route.name);
  const navigation = useNavigation();

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })
    if (error)
    {
      Alert.alert(error.message)
    }
    else
    {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      const { data: existingProfile, error: selectError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();
      if (existingProfile.first_name != null) {
        router.push('/(tabs)/homePage');
      } else{
        router.push('/onboarding');
      }
    }
    setLoading(false)
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  function handleRegistrationError(errorMessage: string) {
    alert(errorMessage);
    throw new Error(errorMessage);
  }

  async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        handleRegistrationError('Permission not granted to get push token for push notification!');
        return;
      }
      const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        handleRegistrationError('Project ID not found');
      }
      try {
        const pushTokenString = (
            await Notifications.getExpoPushTokenAsync({
              projectId,
            })
        ).data;
        console.log(pushTokenString);
        return pushTokenString;
      } catch (e: unknown) {
        handleRegistrationError(`${e}`);
      }
    } else {
      handleRegistrationError('Must use physical device for push notifications');
    }
  }

  useEffect(() => {
    registerForPushNotificationsAsync()
        .then(token => setExpoPushToken(token ?? ''))
        .catch((error: any) => setExpoPushToken(`${error}`));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.current &&
      Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    return navigation.addListener('state', (e) => {
      const currentRouteName = e.data.state.routes[e.data.state.index].name;
      setCurrentRoute(currentRouteName);
    });
  }, [navigation]);

  useEffect(() => {
    const backAction = () => {
      console.log(currentRoute);
      if (currentRoute === 'index') {
        Alert.alert("Warning!", "Back button is disabled on the Sign in screen", [
          { text: "OK", onPress: () => null },
        ]);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [currentRoute]);

  return (
      <ScrollView style={styles.container}>
        <Card>
          <Input
              label="Email"
              leftIcon={{ type: 'font-awesome', name: 'envelope' }}
              onChangeText={(text) => setEmail(text)}
              value={email}
              placeholder="email@address.com"
              autoCapitalize={'none'}
          />
        </Card>
        <Card>
          <Input
                label="Password"
                leftIcon={{ type: 'font-awesome', name: 'lock' }}
                onChangeText={(text) => setPassword(text)}
                value={password}
                secureTextEntry={true}
                placeholder="Password"
                autoCapitalize={'none'}
          />
        </Card>
        <Button title="Sign in" disabled={loading} onPress={() => signInWithEmail()} buttonStyle={styles.button} />
        <View style={styles.inline}>
              <Text>Don't have an account? </Text>
              <Link href={'/register'} style={styles.linkText}>Click to sign up</Link>
        </View>
      </ScrollView>
    )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  inline: {
    paddingTop: 4,
    paddingBottom: 4,
    marginLeft: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  linkText: {
    textDecorationLine: 'underline',
    color: 'blue',
  },
  mt20: {
    marginTop: 20,
  },
  button: {
    borderRadius: 20,
    marginHorizontal: 15,
    marginTop: 20,
  },
})
