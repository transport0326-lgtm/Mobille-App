# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod *;
}

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Kotlin & Coroutines
-keep class kotlin.** { *; }
-dontwarn kotlin.**

# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# React Navigation
-keep class com.swmansion.** { *; }

# Vector Icons
-keep class com.oblador.vectoricons.** { *; }

# Geolocation
-keep class com.reactnativecommunity.geolocation.** { *; }

# Image Picker
-keep class com.imagepicker.** { *; }

# Contacts
-keep class com.rt2zz.reactnativecontacts.** { *; }

# Suppress notes from third-party libs
-dontnote com.google.**
-dontnote com.facebook.**
-dontnote androidx.**
