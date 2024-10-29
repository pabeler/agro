import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Button, Input } from '@rneui/themed';
import { Href, Link, router } from 'expo-router';

const UserEmailScreen = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null); 
  const [lastName, setLastName] = useState<string | null>(null);   
  const [phoneNUmber, setPhoneNUmber] = useState<string | null>(null);   

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error('Błąd przy pobieraniu użytkownika:', authError);
      } else if (user) {
        setEmail(user.email ?? null);

        console.log(user.id)
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('first_name, last_name, phone_number')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Błąd przy pobieraniu profilu użytkownika:', profileError);
        } else if (profileData) {
          setFirstName(profileData.first_name);
          setLastName(profileData.last_name);
          setPhoneNUmber(profileData.phone_number);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Błąd podczas wylogowywania:', error);
    } else {
      setEmail(null);
      setFirstName(null);
      setLastName(null);
      router.push('/');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>Zalogowany użytkownik:</Text>
      {email ? (
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Input label="Email" value={email} disabled />
          <Input label="Imię" value={firstName ?? 'Ładowanie...'} disabled />
          <Input label="Nazwisko" value={lastName ?? 'Ładowanie...'} disabled />
          <Input label="Numer telefonu" value={phoneNUmber ?? 'Ładowanie...'} disabled />
        </View>
      ) : (
        <Text style={{ fontSize: 18, marginTop: 10 }}>Ładowanie...</Text>
      )}

      <View style={styles.verticallySpaced}>
        <Button title="Sign Out" onPress={handleSignOut} buttonStyle={styles.button} />
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
});

export default UserEmailScreen;
