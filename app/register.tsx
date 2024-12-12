import React, {useEffect, useState} from 'react'
import {Alert, StyleSheet, View, AppState, ScrollView} from 'react-native'
import {supabase} from '../lib/supabase'
import {Button, Card, Input} from '@rneui/themed'
import {router} from 'expo-router'
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import {useNavigation} from "@react-navigation/native";


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

    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            headerTitle: 'Sign up to expo app',
        });
    }, [navigation]);

    async function signUpWithEmail() {
        setLoading(true)
        const {
            data: {session, user},
            error,
        } = await supabase.auth.signUp({
            email: email,
            password: password,
        })
        const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
            alert('Project ID not found');
            throw new Error('Project ID not found');
        }
        const pushTokenString = (
            await Notifications.getExpoPushTokenAsync({
                projectId,
            })
        ).data;
        console.log(pushTokenString);


        if (error) {
            Alert.alert(error.message)
            setLoading(false)
            return
        }

        if (user) {
            const {data, error: insertError} = await supabase.from('user_profiles').insert([
                {
                    id: user.id, // This is the user ID from Supabase
                    expo_push_token: pushTokenString, // Push token
                },
            ]);

            if (insertError) {
                console.error('Error inserting user profile:', insertError);
                Alert.alert('Failed to save user profile data');
            } else {
                setLoading(false)
                console.log('User profile inserted:', data);
                Alert.alert('Registration complete! Redirecting to sign in.')
                router.push('/')
                return
            }
        }

        setLoading(false)
        if (!session) {
            Alert.alert('Registration complete! Redirecting to sign in.')
            router.push('/')
        }
    }

    return (
        <ScrollView style={styles.container}>
            <Card>
                <Input
                    label="Email"
                    leftIcon={{type: 'font-awesome', name: 'envelope'}}
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                    placeholder="email@address.com"
                    autoCapitalize={'none'}
                />
            </Card>
            <Card>
                <Input
                    label="Password"
                    leftIcon={{type: 'font-awesome', name: 'lock'}}
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                    secureTextEntry={true}
                    placeholder="Password"
                    autoCapitalize={'none'}
                />
            </Card>
            <Button title="Sign up" disabled={loading} onPress={() => signUpWithEmail()} buttonStyle={styles.button}/>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 40,
        padding: 12,
    },
    verticallySpaced: {
        paddingTop: 4,
        paddingBottom: 4,
        alignSelf: 'stretch',
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
