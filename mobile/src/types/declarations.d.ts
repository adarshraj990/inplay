declare module 'react-native-linear-gradient' {
  import * as React from 'react';
  import { ViewProps } from 'react-native';

  export interface LinearGradientProps extends ViewProps {
    colors: (string | number)[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    locations?: number[];
    useAngle?: boolean;
    angleCenter?: { x: number; y: number };
    angle?: number;
    children?: React.ReactNode;
  }

  export default class LinearGradient extends React.Component<LinearGradientProps> {}
}

declare module 'react-native-vector-icons/Ionicons' {
  const Ionicons: any;
  export default Ionicons;
}

declare module 'react-native-haptic-feedback' {
  export type HapticFeedbackTypes =
    | 'selection'
    | 'impactLight'
    | 'impactMedium'
    | 'impactHeavy'
    | 'rigid'
    | 'soft'
    | 'notificationSuccess'
    | 'notificationWarning'
    | 'notificationError';

  export interface HapticOptions {
    enableVibrateFallback?: boolean;
    ignoreAndroidSystemSettings?: boolean;
  }

  export default class ReactNativeHapticFeedback {
    static trigger(type: HapticFeedbackTypes, options?: HapticOptions): void;
  }
}

declare module '@react-native-community/blur' {
  import * as React from 'react';
  import { ViewProps } from 'react-native';
  
  export interface BlurViewProps extends ViewProps {
    blurType?: 'xlight' | 'light' | 'dark' | 'extraDark' | 'regular' | 'prominent';
    blurAmount?: number;
    reducedTransparencyFallbackColor?: string;
    children?: React.ReactNode;
  }

  export class BlurView extends React.Component<BlurViewProps> {}
}
