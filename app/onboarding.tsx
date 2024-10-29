import React, { useState } from 'react';
import { View, TextInput, Text, Alert,StyleSheet } from 'react-native';
import { Button, Input } from '@rneui/themed'
import { supabase } from '../lib/supabase';
import { Href, Link, router } from 'expo-router'

const UserProfileForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = async () => {
    // Get the current user session
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      Alert.alert("Error", "User is not logged in.");
      return;
    }

    try {
      const { error } = await supabase.from('user_profiles').insert([
        {
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          id: userId,
        },
      ]);
      console.log(error);
      if (error) throw error;

      Alert.alert("Success", "Profile added successfully!");
      
      router.push('/(tabs)/homePage');
    } catch (error) {
      Alert.alert("Error");
    }
  };

  return (
    
<View style={styles.container}>
    <Text  style={styles.headerText}>Dokończ konfigurację konta</Text>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="First name" 
          onChangeText={setFirstName}
          value={firstName}
          autoCapitalize={'none'}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
            label="Last name"
            onChangeText={setLastName}
            value={lastName}
            autoCapitalize={'none'}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
            label="Phone number"
            onChangeText={setPhoneNumber}
            value={phoneNumber}
            autoCapitalize={'none'}
            keyboardType="phone-pad"
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button title="Save profile" onPress={handleSubmit} buttonStyle={styles.button} />
      </View>

    </View>
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
    mt20: {
      marginTop: 20,
    },
    button: {   
      borderRadius: 20,  
    },
    headerText: {   
        fontSize: 24,           
        textAlign: 'center',    
        marginBottom: 20,   
      },
  })
export default UserProfileForm;
