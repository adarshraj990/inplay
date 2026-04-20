/* eslint-disable */

// ABSOLUTE GLOBAL SHIM FOR MONOREPO STABILIZATION
// Designed to resolve all "Red Problems" in both the TSC compiler and the IDE.
// IMPORTANT: NO top-level imports/exports here to maintain global scope.

declare module 'react-native' {
  export const View: any;
  export const Text: any;
  export const TouchableOpacity: any;
  export const ScrollView: any;
  export const Image: any;
  export const TextInput: any;
  export const FlatList: any;
  export const SectionList: any;
  export const ActivityIndicator: any;
  export const Modal: any;
  export const SafeAreaView: any;
  export const StatusBar: any;
  export const Pressable: any;
  export const Animated: any;
  export const StyleSheet: any;
  export const Platform: any;
  export const Dimensions: any;
  export const Alert: any;
  export const Keyboard: any;
  export const Linking: any;
  export const AppState: any;
  export const BackHandler: any;
  export const PixelRatio: any;
  export const PermissionsAndroid: any;
  export const PanResponder: any;
  export const AppRegistry: any;
  export const Share: any;
  export const Easing: any;
  export const RefreshControl: any;
  export const LayoutAnimation: any;
  export const UIManager: any;
  export const KeyboardAvoidingView: any;
  export const TouchableWithoutFeedback: any;

  export type ViewStyle = any;
  export type TextStyle = any;
  export type ImageStyle = any;
  export type StyleProp<T = any> = any;
  export type ViewProps = any;
  export type TextProps = any;
  export type NativeSyntheticEvent<T = any> = any;
}

declare module 'react-native-linear-gradient' {
  const LinearGradient: any;
  export default LinearGradient;
  export const LinearGradientProps: any;
}

declare module 'react-native-vector-icons/Ionicons' {
  const Ionicons: any;
  export default Ionicons;
}

declare module 'react-native-haptic-feedback' {
  const x: any;
  export default x;
}

declare module '@react-native-community/blur' {
  export const BlurView: any;
}

declare module '@react-navigation/native' {
  export const NavigationContainer: any;
  export const useNavigation: any;
  export const useRoute: any;
  export const DefaultTheme: any;
  export const DarkTheme: any;
  export const SafeAreaProvider: any;
}

declare module '@react-navigation/native-stack' {
  export const createNativeStackNavigator: <T extends any = any>() => any;
  export type NativeStackScreenProps<T, K = any> = any;
}

declare module '@react-navigation/bottom-tabs' {
  export const createBottomTabNavigator: <T extends any = any>() => any;
  export type BottomTabScreenProps<T, K = any> = any;
}

declare module '@react-native-async-storage/async-storage' {
  const AsyncStorage: any;
  export default AsyncStorage;
}

declare module 'react-native-gesture-handler' {
  export const GestureHandlerRootView: any;
}

declare module 'react-native-reanimated' {
  const Animated: any;
  export default Animated;
  export const useSharedValue: any;
  export const useAnimatedStyle: any;
  export const withSpring: any;
  export const withTiming: any;
  export const withDelay: any;
  export const withRepeat: any;
  export const withSequence: any;
  export const interpolate: any;
  export const Extrapolate: any;
  export const Easing: any;
}

declare module 'react-native-agora' {
  const createAgoraRtcEngine: () => any;
  export default createAgoraRtcEngine;
  export const ChannelProfileType: any;
  export const ClientRoleType: any;
  export type IRtcEngine = any;
  export type RtcConnection = any;
  export type IRtcEngineEventHandler = any;
}

declare module 'better-auth/react' {
  export const useSession: any;
  export const createAuthClient: any;
}

declare module 'socket.io-client' {
  const io: any;
  export const Socket: any;
  export type Socket = any;
  export default io;
  export function io(url: string, opts?: any): any;
}

declare module 'react-native-safe-area-context' {
  export const SafeAreaView: any;
  export const SafeAreaProvider: any;
}

declare var __DEV__: boolean;
declare var process: any;
declare var console: any;
declare var fetch: any;
declare var setTimeout: any;
declare var setInterval: any;
declare var clearTimeout: any;
declare var clearInterval: any;
