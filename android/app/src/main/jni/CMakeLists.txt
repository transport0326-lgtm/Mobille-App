cmake_minimum_required(VERSION 3.13)

project(appmodules)

# Suppress deprecated SharedImageManager warning from react-native-svg (incompatibility with RN 0.84.x)
add_compile_options(-Wno-deprecated-declarations)

include(${REACT_ANDROID_DIR}/cmake-utils/ReactNative-application.cmake)
