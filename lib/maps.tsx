import {GooglePlaceDetail} from "react-native-google-places-autocomplete";

type AddressComponents = {
    long_name: string;
    short_name: string;
    types: string[];
};

const handlePlaceSelect = (data: any, details: GooglePlaceDetail | null) => {
    if (!details) return;

    const addressComponents: AddressComponents[] = details.address_components;

    const getComponent = (type: string): string => {
        const component = addressComponents.find((comp) => comp.types.includes(type));
        return component ? component.long_name : '';
    };

    if (getComponent('street_number') === '' || getComponent('route') === '' || getComponent('locality') === '' || getComponent('postal_code') === '' || getComponent('country') === '') {
        return null;
    }

    return {
        city: getComponent('locality'),
        street: getComponent('route'),
        houseNumber: getComponent('street_number'),
        postalCode: getComponent('postal_code'),
        country: getComponent('country'),
        lat: details.geometry.location.lat,
        lng: details.geometry.location.lng
    };
};

export default handlePlaceSelect;
