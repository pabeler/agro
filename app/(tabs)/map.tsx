import React, {useState} from "react";
import {useEffect} from "react";
import {View, StyleSheet, TextInput} from "react-native";
import MapView, {Marker, PROVIDER_GOOGLE} from "react-native-maps";
import {supabase} from "@/lib/supabase";
import {useNavigation} from "@react-navigation/native";
import {router} from "expo-router";

const MapScreen = () => {
    const navigation = useNavigation();
    const [markers, setMarkers] = useState<{ productId: string; productName: string; description: string, productPrice: number, productImage: string; coordinate: { latitude: number; longitude: number; } }[]>([]);
    const [searchInput, setSearchInput] = useState('');

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

    function handleMarkerPress(marker: {productId: string; productName: string; description: string; productPrice: number; productImage: string; coordinate: {latitude: number; longitude: number}}) {
        const {data:image_url} = supabase.storage.from("product_images").getPublicUrl(marker.productImage);
        router.push({ pathname: "/productDetails", params: {
            productId: marker.productId,
            productName: marker.productName,
            productPrice: marker.productPrice.toString(),
            productImage: image_url.publicUrl,
            }
        });
    }

    return (
        <View style={styles.container}>
            <MapView style={styles.map} initialRegion={
                {
                    latitude: 52.237049,
                    longitude: 19.017532,
                    latitudeDelta: 8,
                    longitudeDelta: 8,
                }
            }
            showsUserLocation={true}
            showsMyLocationButton={true}
            provider={PROVIDER_GOOGLE}

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
            <View style={{ position: 'absolute', top: 10, width: '100%' }}>
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
        width: '100%',
        height: '100%',
    },
});

export default MapScreen;
