import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Alert, Text, ScrollView, Modal, FlatList, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Button, Input, Card } from '@rneui/themed';
import { router } from 'expo-router';
import {GooglePlaceDetail, GooglePlacesAutocomplete} from "react-native-google-places-autocomplete";
import handlePlaceSelect from "@/lib/maps";


interface Address {
    id: number;
    address_line: string;
    city: string;
    postal_code: string;
    country: string;
}


const UserEmailScreen = () => {
    const [email, setEmail] = useState<string | null>(null);
    const [firstName, setFirstName] = useState<string | null>(null);
    const [lastName, setLastName] = useState<string | null>(null);
    const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [location, setLocation] = useState(JSON.stringify({}));
    const [newAddressModalVisible, setNewAddressModalVisible] = useState(false);

    const [editAddressModalVisible, setEditAddressModalVisible] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [addressModalVisible, setAddressModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const [updatedAddress, setUpdatedAddress] = useState<Address>({
        id: 0,
        address_line: '',
        city: '',
        postal_code: '',
        country: '',
    });


    useEffect(() => {
        const fetchUserData = async () => {
            const {
                data: { user },
                error: authError,
            } = await supabase.auth.getUser();

            if (authError) {
                console.error('Error fetching user:', authError);
            } else if (user) {
                setEmail(user.email ?? null);

                const { data: profileData, error: profileError } = await supabase
                    .from('user_profiles')
                    .select('first_name, last_name, phone_number')
                    .eq('id', user.id)
                    .single();

                if (profileError) {
                    console.error('Error fetching user profile:', profileError);
                } else if (profileData) {
                    setFirstName(profileData.first_name);
                    setLastName(profileData.last_name);
                    setPhoneNumber(profileData.phone_number);
                }

                await fetchUserAddresses(user.id);
            }
        };

        fetchUserData();
    }, []);

    const fetchUserAddresses = async (userId: string) => {
        const { data, error } = await supabase
            .from('user_addresses')
            .select('*')
            .eq('profile_id', userId);

        if (error) {
            console.error('Error fetching addresses:', error);
        } else {
            setAddresses(data || []);
        }
    };

    const handleSaveChanges = async () => {
        setLoading(true);
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('Error fetching user:', authError);
            setLoading(false);
            return;
        }

        const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
                first_name: firstName,
                last_name: lastName,
                phone_number: phoneNumber,
            })
            .eq('id', user.id);

        if (updateError) {
            console.error('Error updating profile:', updateError);
        } else {
            console.log('Profile updated successfully');
            setModalVisible(false);
        }

        setLoading(false);
    };

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error during sign out:', error);
        } else {
            setEmail(null);
            setFirstName(null);
            setLastName(null);
            router.push('/');
        }
    };
    const handleLocalization = (data: any, details: GooglePlaceDetail | null) => {
        console.log(data, details)
        if (!details) return;
        const res = handlePlaceSelect(data, details);
        console.log(res)
        if (res) {
            setLocation(JSON.stringify(res));
        } else {
            Alert.alert('Error', 'Sorry, we could not get your address. Please try again.');
        }
    };

    const handleSubmit = async () => {
        const {data: {session}} = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (!userId) {
            Alert.alert("Error", "User is not logged in.");
            return;
        }

        try {


            const locationObj = JSON.parse(location);
            const { city, street, houseNumber, postalCode, country, lat, lng } = locationObj;
            console.log(city, street, houseNumber, postalCode, country, lat, lng, locationObj)
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
            await fetchAddresses();
            Alert.alert("Success", "Adress added successfully!");

        } catch (error) {
            Alert.alert("Error");
        }
    };
    const handleUpdate = async (id: number) => {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (!userId) {
            Alert.alert("Error", "User is not logged in.");
            return;
        }

        try {
            const locationObj = JSON.parse(location);
            const { city, street, houseNumber, postalCode, country, lat, lng } = locationObj;

            console.log(city, street, houseNumber, postalCode, country, lat, lng, locationObj);

            const { error: addressError } = await supabase
                .from('user_addresses')
                .update({
                    city: city,
                    postal_code: postalCode,
                    country: country,
                    address_line: `${street} ${houseNumber}`,
                    cords: JSON.stringify({ lat: `${lat}`, lng: `${lng}` }),
                })
                .eq('id', id);

            if (addressError) {
                throw addressError;
            }
            await fetchAddresses();
            Alert.alert("Success", "Address updated successfully!");

        } catch (error) {
            Alert.alert("Error");
        }
    };
    const handleDelete = async (id: number) => {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (!userId) {
            Alert.alert("Error", "User is not logged in.");
            return;
        }

        try {
            const { error: addressError } = await supabase
                .from('user_addresses')
                .delete()
                .eq('id', id);

            if (addressError) {
                throw addressError;
            }
            await fetchAddresses();
            Alert.alert("Success", "Address deleted successfully!");
        } catch (error) {
            Alert.alert("Error", "Failed to delete the address.");
        }
        setEditAddressModalVisible(false);
    };
    const fetchAddresses = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (!userId) {
            Alert.alert("Error", "User is not logged in.");
            return;
        }

        try {
            const { data, error } = await supabase
                .from('user_addresses')
                .select('*')
                .eq('profile_id', userId);

            if (error) {
                throw error;
            }

            setAddresses(data || []);
        } catch (error) {
            Alert.alert("Error", "Failed to fetch addresses.");
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Card containerStyle={styles.card}>
                <Card.Title style={styles.cardTitle}>User Profile</Card.Title>
                <Card.Divider />
                {email ? (
                    <View style={styles.infoContainer}>
                        <Input label="Email" value={email} disabled />
                        <Input label="First Name" value={firstName ?? 'Loading...'} disabled />
                        <Input label="Last Name" value={lastName ?? 'Loading...'} disabled />
                        <Input label="Phone Number" value={phoneNumber ?? 'Loading...'} disabled />
                    </View>
                ) : (
                    <Text style={styles.loadingText}>Loading...</Text>
                )}
                <View style={styles.buttonContainer}>
                    <Button
                        title="Edit Profile Information"
                        onPress={() => setModalVisible(true)}
                        buttonStyle={styles.editButton}
                    />

                </View>
            </Card>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit User Info</Text>
                        <Input label="First Name" value={firstName || ''} onChangeText={setFirstName} />
                        <Input label="Last Name" value={lastName || ''} onChangeText={setLastName} />
                        <Input label="Phone Number" value={phoneNumber || ''} onChangeText={setPhoneNumber} />
                        <View style={styles.modalButtonContainer}>
                            <Button
                                title={loading ? 'Saving...' : 'Save Changes'}
                                onPress={handleSaveChanges}
                                disabled={loading}
                                buttonStyle={styles.saveButton}
                            />
                            <Button
                                title="Cancel"
                                onPress={() => setModalVisible(false)}
                                buttonStyle={styles.cancelButton}
                            />
                        </View>
                    </View>
                </View>
            </Modal>


            <Modal visible={newAddressModalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>

                        <Text style={styles.modalTitle}>Add New Address</Text>
                        <Card>
                            <Text style={styles.localizationInputLabel}>Insert your address</Text>
                            <GooglePlacesAutocomplete placeholder={"Your address"} disableScroll={true}
                                                      query={{key: "AIzaSyB3B8DlxEr1Ij1fVGeOv1mtF5N8JVDsti4", language: 'en'}}
                                                      fetchDetails={true}
                                                      onPress={handleLocalization}

                                                      styles={{
                                                          container: styles.googleAutocompleteContainer,
                                                          listView: styles.listView,
                                                      }}
                            />
                        </Card>
                        <View style={styles.modalButtonContainer}>
                            <Button
                                title={loading ? 'Saving...' : 'Save Address'}
                                onPress={handleSubmit}
                                disabled={loading}
                                buttonStyle={styles.saveButton}
                            />
                            <Button
                                title="Cancel"
                                onPress={() => setNewAddressModalVisible(false)}
                                buttonStyle={styles.cancelButton}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            <Card containerStyle={styles.card}>
                {
                    (addresses.length > 0) ? 
                    (
                        <Text style={styles.modalTitle}>User Addresses</Text>
                    ) : 
                    (
                        <Text style={styles.modalTitle}>You have no adresses</Text>
                    )
                }
                {addresses.length > 0 ? (
                    <FlatList
                        scrollEnabled={false}
                        data={addresses}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    setUpdatedAddress({ ...item });
                                    setEditAddressModalVisible(true);
                                }}
                            >
                                <View style={styles.addressItem}>
                                    <Text>{item.address_line}</Text>
                                    <Text>{item.city}, {item.postal_code}</Text>
                                    <Text>{item.country}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />

                ) : (
                    <Text></Text>
                )}
                <Button
                    title="Add New Address"
                    onPress={() => setNewAddressModalVisible(true)}
                    buttonStyle={styles.addressButton}
                />

            </Card>
            <Modal visible={editAddressModalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit your Address</Text>
                        <Card>
                            <Text style={styles.localizationInputLabel}>Change your address</Text>
                            <GooglePlacesAutocomplete
                                placeholder={
                                    `${updatedAddress.address_line || ''}${updatedAddress.city ? ', ' + updatedAddress.city : ''}${updatedAddress.country ? ', ' + updatedAddress.country : ''}`
                                }
                                disableScroll={true}
                                query={{key: "AIzaSyB3B8DlxEr1Ij1fVGeOv1mtF5N8JVDsti4", language: 'en'}}
                                fetchDetails={true}
                                onPress={
                                    (data, details) => console.log(data)
                                }
                                onFail={error => console.error(error)}
                                styles={{
                                    container: styles.googleAutocompleteContainer,
                                    listView: styles.listView,
                                }}
                            />
                        </Card>

                        <View style={styles.modalButtonContainer}>
                            <Button
                                title="Save Changes"
                                onPress={() => handleUpdate(updatedAddress.id)}
                                buttonStyle={styles.saveButton}
                            />
                            <Button
                                title="Remove Adress"
                                onPress={() => handleDelete(updatedAddress.id)}
                                buttonStyle={styles.removeButton}
                            />
                            <Button
                                title="Cancel"
                                onPress={() => setEditAddressModalVisible(false)}
                                buttonStyle={styles.cancelButton}
                            />
                        </View>
                    </View>
                </View>
            </Modal>


            <Card containerStyle={styles.card}>
                <View style={styles.buttonContainer}>
                    <Button
                        title="Add Product"
                        onPress={() => router.push('/addProduct')}
                        buttonStyle={styles.addButton}
                    />
                    <Button title="My products" onPress={() => router.push('/sellerPanel')} buttonStyle={styles.sellerPanelButton} />
                    <Button
                        title="Sign Out"
                        onPress={handleSignOut}
                        buttonStyle={styles.signOutButton}
                    />
                </View>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f4f4f4',
    },
    googleAutocompleteContainer: {
        flex: 0,
    },
    listView: {
        maxHeight: 200,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
    },

    card: {
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    infoContainer: {
        marginTop: 10,
    },
    loadingText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 10,
    },
    buttonContainer: {
        marginTop: 20,
    },
    sellerPanelButton: {   
        borderRadius: 20, 
        marginBottom: 10,
    },
    editButton: {
        backgroundColor: '#007bff',
        borderRadius: 20,
        marginBottom: 10,
    },
    removeButton: {
        backgroundColor: '#dc3545',
        borderRadius: 20,
        marginBottom: 10,
    },
    addressButton: {
        backgroundColor: '#17a2b8',
        borderRadius: 20,
        marginBottom: 10,
    },
    signOutButton: {
        backgroundColor: '#dc3545',
        borderRadius: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalButtonContainer: {
        marginTop: 20,
    },
    saveButton: {
        backgroundColor: '#007bff',
        borderRadius: 20,
        marginBottom: 10,
    },
    addButton: {
        backgroundColor: '#28a745',
        borderRadius: 20,
        marginBottom: 10,
    },
    cancelButton: {
        backgroundColor: '#6c757d',
        borderRadius: 20,
    },
    addressItem: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
        elevation: 2,
    },
    closeButton: {
        backgroundColor: '#6c757d',
        borderRadius: 20,
        marginTop: 10,
    },
    localizationInputLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'rgb(119,136,153)',
        marginBottom: 8,
        marginLeft: 10,
    },
});

export default UserEmailScreen;
