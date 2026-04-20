/* eslint-disable */

// Global type overrides to satisfy core environment symbols
declare var __DEV__: boolean;
declare var process: any;
declare var console: any;
declare var fetch: any;
declare var setTimeout: any;
declare var setInterval: any;
declare var clearTimeout: any;
declare var clearInterval: any;
declare var requestAnimationFrame: any;
declare var cancelAnimationFrame: any;

// Global type aliases that are commonly imported from react-native
// These are defined globally as a fallback for the Master Shim.
declare type ViewStyle = any;
declare type TextStyle = any;
declare type ImageStyle = any;
declare type StyleProp<T> = any;
declare type ViewProps = any;
declare type TextProps = any;

// Agora specific types exported as any
declare type IRtcEngine = any;
declare type RtcConnection = any;
declare type IRtcEngineEventHandler = any;

// Navigation types
declare type NativeStackScreenProps<T, K = any> = any;
declare type BottomTabScreenProps<T, K = any> = any;
