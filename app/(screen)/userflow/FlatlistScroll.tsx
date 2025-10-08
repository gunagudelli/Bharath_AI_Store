import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  FlatList,
  LayoutChangeEvent,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

import { ListRenderItem, ListRenderItemInfo } from 'react-native';

interface ColoredHorizontalScrollFlatListProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
}

const ColoredHorizontalScrollFlatList = <T,>({
  data,
  renderItem,
  keyExtractor,
}: ColoredHorizontalScrollFlatListProps<T>): React.ReactElement => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [contentWidth, setContentWidth] = useState<number>(1);
  const [layoutWidth, setLayoutWidth] = useState<number>(0);

  const indicatorWidth = layoutWidth * (layoutWidth / contentWidth);
  const translateX = scrollX.interpolate({
    inputRange: [0, contentWidth],
    outputRange: [0, layoutWidth],
    extrapolate: 'clamp',
  });

  const AnimatedFlatList = Animated.createAnimatedComponent(
    FlatList
  ) as React.ComponentType<React.ComponentProps<typeof FlatList<T>>>;

  const handleContentSizeChange = (width: number, height: number): void => {
    setContentWidth(width);
  };

  const handleLayout = (event: LayoutChangeEvent): void => {
    setLayoutWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={{ height: 120 }}>
      <AnimatedFlatList
        horizontal
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor as (item: unknown, index: number) => string}
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleLayout}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false} // hide default scrollbar
      />

      {/* Custom Horizontal Scroll Bar */}
      <View style={styles.scrollBarContainer}>
        <Animated.View
          style={[
            styles.scrollBar,
            {
              width: indicatorWidth,
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollBarContainer: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
  },
  scrollBar: {
    height: 4,
    backgroundColor: 'blue', // ✅ custom color
    borderRadius: 2,
  },
});

export default ColoredHorizontalScrollFlatList;