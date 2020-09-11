import React from 'react';
import {View, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaskedView from '@react-native-community/masked-view';

interface RatingProps {
  rating: number;
  size?: number;
}

const Rating = ({rating, size = 18}: RatingProps) => {
  return (
    <View style={{flexDirection: 'row', marginVertical: 8}}>
      <MaskedView
        maskElement={
          <View style={{flexDirection: 'row'}}>
            <Icon name="star" size={size} color="gray" />
            <Icon name="star" size={size} color="gray" />
            <Icon name="star" size={size} color="gray" />
            <Icon name="star" size={size} color="gray" />
            <Icon name="star" size={size} color="gray" />
          </View>
        }>
        <View
          style={{
            height: size,
            width: size * 5,
            backgroundColor: 'gray',
          }}>
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                width: size * rating,
                height: size,
                backgroundColor: 'orange',
              },
            ]}></View>
        </View>
      </MaskedView>
    </View>
  );
};

export default Rating;
