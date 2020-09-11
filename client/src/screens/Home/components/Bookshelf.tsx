import React, {useState, useEffect} from 'react';
import {
  View,
  ColorValue,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {
  useValue,
  mix,
  onGestureEvent,
  withTransition,
  withSpringTransition,
} from 'react-native-redash';
import Animated, {
  useCode,
  cond,
  eq,
  set,
  not,
  interpolate,
  call,
  onChange,
  Extrapolate,
  block,
} from 'react-native-reanimated';
import {TapGestureHandler, State} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';

import {Book} from '../../../types';

import BookCover from '../../../components/BookCover';

import theme, {Text} from '../../../theme';

export const BOOKSHELF_HEIGHT = 320;
export const TITLE_HEIGHT = 35;

const styles = StyleSheet.create({
  container: {
    height: BOOKSHELF_HEIGHT,
    padding: 10,
    borderRadius: theme.borderRadii.m,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  image: {
    marginVertical: 10,
    width: 100,
    height: 120,
    ...theme.shadows.medium,
  },
});

interface BookshelfProps {
  books: Book[];
  title: string;
  backgroundColor: ColorValue;
  name: string;
  showAll: Animated.Node<0 | 1>;
  index: number;
  last: boolean;
  y: Animated.Node<number>;
}

const INACTIVE_MARGIN = -BOOKSHELF_HEIGHT + 25;

const Bookshelf = ({
  title,
  backgroundColor,
  showAll,
  index,
  books,
  last,
  name,
  y,
}: BookshelfProps) => {
  const [snapToInterval, setSnapToInterval] = useState(0);
  const [booksArray, setBooksArray] = useState<Book[][]>([]);
  const navigation = useNavigation();
  const [gestureHandleActive, setGestureHandlerActive] = useState(true);
  const open = useValue<0 | 1>(0);
  const state = useValue(State.UNDETERMINED);
  const gestureHandler = onGestureEvent({state});

  const transition = withTransition(open);
  const marginBottom = useValue(0);
  const marginBottomInterpolation = mix(
    transition,
    -BOOKSHELF_HEIGHT + TITLE_HEIGHT,
    5,
  );

  const translateY = useValue(0);
  const translateYInterpolation = withSpringTransition(
    interpolate(y, {
      inputRange: [0, 1],
      outputRange: [0, -0.2 * index],
      extrapolateRight: Extrapolate.CLAMP,
    }),
  );

  const scale = useValue(0);
  const scaleInterpolation = interpolate(index, {
    inputRange: [0, 1, 2],
    outputRange: [0.8, 0.9, 1],
    extrapolate: Extrapolate.CLAMP,
  });

  useEffect(() => {
    setBooksArray(handleBooks(books));
  }, [books.length]);

  useCode(() => [cond(eq(state, State.END), set(open, not(open)))], [
    open,
    state,
    showAll,
  ]);

  useCode(
    () =>
      block([
        onChange(
          showAll,
          call([showAll], ([showAllBool]) => {
            setGestureHandlerActive(!!showAllBool);
          }),
        ),
        cond(eq(showAll, 1), [
          set(scale, 1),
          set(marginBottom, marginBottomInterpolation),
          set(translateY, 0),
        ]),
        cond(eq(showAll, 0), [
          set(scale, scaleInterpolation),
          set(marginBottom, INACTIVE_MARGIN),
          set(translateY, translateYInterpolation),
        ]),
      ]),
    [showAll],
  );

  const renderBook = (item: Book[]) => {
    return (
      <View style={{alignSelf: 'flex-start'}}>
        {item[0] && (
          <View key={item[0]._id} style={styles.image}>
            <BookCover uri={item[0].thumbnail!} />
          </View>
        )}
        {item[1] && (
          <View key={item[1]._id} style={styles.image}>
            <BookCover uri={item[1].thumbnail!} />
          </View>
        )}
      </View>
    );
  };

  const handleBooks = (books: Book[]) => {
    const bookArrays: Book[][] = [];

    for (var i = 0; i < books.length; i += 2) {
      bookArrays.push(books.slice(i, i + 2));
    }
    return bookArrays;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          marginBottom: !last ? marginBottom : 0,
          transform: [{scale, translateY}],
        },
      ]}>
      <View style={styles.row}>
        <TapGestureHandler {...gestureHandler} enabled={gestureHandleActive}>
          <Animated.View>
            <Text color="foreground" variant="body" style={styles.title}>
              {title}
            </Text>
          </Animated.View>
        </TapGestureHandler>
        <TouchableOpacity
          onPress={() => navigation.navigate('List', {shelf: name})}>
          <Text color="foreground" variant="body">
            Show all books
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        onLayout={(e) => setSnapToInterval(e.nativeEvent.layout.width)}
        data={booksArray}
        keyExtractor={(item) => item.map((i) => i._id).join('')}
        horizontal
        // style={{flex: 1}}
        snapToInterval={snapToInterval}
        contentContainerStyle={{
          width: snapToInterval * (booksArray.length / 3),
          justifyContent: 'space-evenly',
        }}
        decelerationRate="fast"
        scrollEventThrottle={1}
        renderItem={({item}) => renderBook(item)}
      />
    </Animated.View>
  );
};

export default Bookshelf;
