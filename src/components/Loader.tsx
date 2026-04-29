import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

const Loader = ({ size = 72, color = '#F4521E' }) => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    rotation.setValue(0);
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 360,        // 0 → 360 direct, no interpolation needed
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const r = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;

  const topX = cx;
  const topY = cy - r;

  // 90 degree slice (increased from 60)
  const angleRad = (90 * Math.PI) / 180;
  const endX = cx + r * Math.sin(angleRad);
  const endY = cy - r * Math.cos(angleRad);

  return (
    <View style={{ width: size, height: size }}>

      {/* Static gray circle */}
      <Svg width={size} height={size}>
        <Circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="#f0ebeb"
          strokeWidth={4.5}
        />
      </Svg>

      {/* Rotating slice */}
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          transform: [{ rotate }],   // direct deg string — full 360 guaranteed
        }}>
        <Svg width={size} height={size}>
          <Path
            d={`M${cx} ${cy} L${topX} ${topY} A${r} ${r} 0 0 1 ${endX} ${endY} Z`}
            fill={color}
          />
        </Svg>
      </Animated.View>

    </View>
  );
};

export default Loader;