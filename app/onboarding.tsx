import React, {useState} from 'react';
import {View, Text, Alert, StyleSheet, ScrollView} from 'react-native';
import {Button, Input} from '@rneui/themed'
import {supabase} from '../lib/supabase';
import {router} from 'expo-router'
import {GooglePlaceDetail, GooglePlacesAutocomplete} from "react-native-google-places-autocomplete";
import 'react-native-get-random-values';
import handlePlaceSelect from "@/lib/maps";

const UserProfileForm = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [location, setLocation] = useState(JSON.stringify({}));

    const handleSubmit = async () => {
        // Get the current user session
        const {data: {session}} = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (!userId) {
            Alert.alert("Error", "User is not logged in.");
            return;
        }

        try {
            const {error} = await supabase
                .from('user_profiles')
                .update({
                    first_name: firstName,
                    last_name: lastName,
                    phone_number: phoneNumber,

                })
                .eq('id', userId);
            console.log(error);
            if (error) {
                throw error;
            } else {
                const locationObj = JSON.parse(location);
                const { city, street, houseNumber, postalCode, country, lat, lng } = locationObj;
                const {error: addressError} = await supabase
                    .from('user_addresses')
                    .insert([
                        {
                            profile_id: userId,
                            city: city,
                            postal_code: postalCode,
                            country: country,
                            address_line: street + ' ' + houseNumber,
                            cords: JSON.stringify({lat: `${lat}`, lng: `${lng}`}),
                        },
                    ]);
                if (addressError) {
                    throw addressError;
                }
            }

            Alert.alert("Success", "Profile added successfully!");

            router.push('/(tabs)/homePage');
        } catch (error) {
            Alert.alert("Error");
        }
    };

    const handleLocalization = (data: any, details: GooglePlaceDetail | null) => {
        if (!details) return;
        const res = handlePlaceSelect(data, details);
        if (res) {
            setLocation(JSON.stringify(res));
        } else {
            Alert.alert('Error', 'Sorry, we could not get your address. Please try again.');
        }
    }

    return (

        <ScrollView style={styles.container}>
            <Text style={styles.headerText}>
                Please fill your profile details
            </Text>
            <View style={[styles.verticallySpaced]}>
                <Input
                    label="First name"
                    onChangeText={setFirstName}
                    value={firstName}
                    autoCapitalize={'none'}
                />
            </View>
            <View style={[styles.verticallySpaced]}>
                <Input
                    label="Last name"
                    onChangeText={setLastName}
                    value={lastName}
                    autoCapitalize={'none'}
                />
            </View>
            <View style={[styles.verticallySpaced]}>
                <Input
                    label="Phone number"
                    onChangeText={setPhoneNumber}
                    value={phoneNumber}
                    autoCapitalize={'none'}
                    keyboardType="phone-pad"
                />
            </View>
            <View style={[styles.verticallySpaced, styles.mh10]}>
                <Text style={styles.localizationInputLabel}>Insert your address: </Text>
                <GooglePlacesAutocomplete placeholder={"Your address"} disableScroll={true}
                                          query={{key: "AIzaSyB3B8DlxEr1Ij1fVGeOv1mtF5N8JVDsti4", language: 'en'}}
                                          fetchDetails={true}
                                          onPress={handleLocalization}
                />
            </View>
            <View style={[styles.verticallySpaced, styles.mb20]}>
                <Button title="Save profile" onPress={handleSubmit} buttonStyle={styles.button}/>
            </View>
        </ScrollView>
    );
};
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
    mb20: {
        marginBottom: 20,
    },
    mh10: {
        marginHorizontal: 10,
    },
    button: {
        borderRadius: 20,
    },
    headerText: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 20,
    },
    localizationInputLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'rgb(119,136,153)',
        marginBottom: 8,
    },
})
export default UserProfileForm;
