import React, {useEffect, useState} from 'react'
import {Alert, AppState, BackHandler, ScrollView, StyleSheet, Text, View} from 'react-native'
import {supabase} from '../lib/supabase'
import {Button, Card, Input} from '@rneui/themed'
import {Link, router} from 'expo-router'
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

  const route = useRoute();
  const [currentRoute, setCurrentRoute] = useState(route.name);
  const navigation = useNavigation();

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

      /*if (selectError && selectError.code !== 'PGRST116') {
        console.log('PGRST116');
      }*/

      if (existingProfile.first_name != null) {
        router.push('/(tabs)/homePage');
      }else{
        router.push('/onboarding');
      }
      //router.push('/(tabs)/homePage');
      //router.push('/onboarding');


    }
    setLoading(false)
  }


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
