import React, {useState} from "react";
import {useEffect} from "react";
import {View, StyleSheet, TextInput, Dimensions, Button, TouchableOpacity, Alert} from "react-native";
import MapView, {Marker, PROVIDER_GOOGLE} from "react-native-maps";
import {supabase} from "@/lib/supabase";
import {useNavigation} from "@react-navigation/native";
import {router} from "expo-router";
import * as Location from 'expo-location';
import {Icon} from "@rneui/base";
import {createDrawerNavigator} from "@react-navigation/drawer";

const MapScreen = () => {
    const navigation = useNavigation();
    const [markers, setMarkers] = useState<{
        productId: string;
        productName: string;
        description: string,
        productPrice: number,
        productImage: string;
        coordinate: { latitude: number; longitude: number; }
    }[]>([]);
    const [searchInput, setSearchInput] = useState('');
    const [region, setRegion] = useState({
        latitude: 52.237049,
        longitude: 19.017532,
        latitudeDelta: 8,
        longitudeDelta: 8,
    });

    type ProductComponents = {
        id: number;
        product_name: string;
        price: number;
        image_path: string;
        pickup_address: any;
        description: string;
    };

    const fetchMarkers = async (searchTerm: string = '') => {
        const response = await supabase.from('products').select('*');
        if (response.error) {
            console.error('Error fetching markers:', response.error);
            return;
        }
        const data = response.data;
        const markers = data?.map((product: ProductComponents) => {
            // console.log(product.image_path)
            const pickupAddress = product?.pickup_address ? JSON.parse(product.pickup_address) : null;

            return {
                productId: product?.id.toString(),
                productName: product?.product_name,
                productImage: product?.image_path,
                productPrice: product?.price,
                description: product?.description,
                coordinate: {
                    latitude: pickupAddress?.cords?.lat,
                    longitude: pickupAddress?.cords?.lng,
                },
            };
        }).filter(value => value.coordinate.latitude !== undefined) || [];

        const filteredMarkers = markers.filter((marker) => {
            return marker.productName.toLowerCase().includes(searchTerm.toLowerCase());
        });

        setMarkers(filteredMarkers);
    };

    useEffect(() => {
        fetchMarkers(searchInput);
    }, [navigation, markers]);

    useEffect(() => {
        const getPermissions = async () => {
            let {status} = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log("Please grant location permissions");
                return;
            }
        };
        getPermissions();
    }, []);

    function handleMarkerPress(marker: {
        productId: string;
        productName: string;
        description: string;
        productPrice: number;
        productImage: string;
        coordinate: { latitude: number; longitude: number }
    }) {
        const {data: image_url} = supabase.storage.from("product_images").getPublicUrl(marker.productImage);
        router.push({
            pathname: "/productDetails", params: {
                productId: marker.productId,
                productName: marker.productName,
                productPrice: marker.productPrice.toString(),
                productImage: image_url.publicUrl,
            }
        });
    }

    const goToCurrentLocation = () => {
        const getCurrentLocation = async () => {
            let {status} = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Location permissions not granted");
                return;
            }

            let currLocation = await Location.getCurrentPositionAsync({});
            console.log("Location:");
            setRegion({
                latitudeDelta: 0.5,
                longitudeDelta: 0.5,
                latitude: currLocation.coords.latitude,
                longitude: currLocation.coords.longitude,
            });
        }
        getCurrentLocation();
    };

    return (
        <View style={styles.container}>
            <MapView style={{...StyleSheet.absoluteFillObject}}
                     showsUserLocation={true}
                     showsMyLocationButton={true}
                     provider={PROVIDER_GOOGLE}
                     region={region}
            >
                {markers.map((marker) => (
                    <Marker
                        key={marker.productId}
                        coordinate={marker.coordinate}
                        title={marker.productName}
                        description={marker.description}
                        onCalloutPress={() => handleMarkerPress(marker)}
                    />
                ))}
            </MapView>
            <TouchableOpacity
                style={styles.button}
                onPress={goToCurrentLocation}
            >
                <Icon
                    type="material-community"
                    name="crosshairs-gps"
                    size={25}
                    color="white"
                />
            </TouchableOpacity>
            <View style={{position: 'absolute', top: 10, width: '100%'}}>
                <TextInput
                    style={{
                        borderRadius: 10,
                        marginLeft: 60,
                        marginRight: 10,
                        color: '#000',
                        borderColor: '#666',
                        backgroundColor: '#FFF',
                        borderWidth: 1,
                        height: 45,
                        paddingHorizontal: 10,
                        fontSize: 18,
                    }}
                    placeholder={'Search'}
                    placeholderTextColor={'#666'}
                    value={searchInput}
                    onChangeText={(value) => {
                        setSearchInput(value);
                        fetchMarkers(value);
                    }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        justifyContent: 'center',
        position: 'absolute',
        height: Dimensions.get("window").height,
        width: Dimensions.get("window").width
    },
    button: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#007AFF',
        borderRadius: 30,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 5,
    },
});

export default MapScreen;
