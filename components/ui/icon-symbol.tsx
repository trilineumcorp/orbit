// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'safari.fill': 'explore',
  'square.grid.2x2.fill': 'apps',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.left': 'chevron-left',
  'chevron.right': 'chevron-right',
  'play.circle.fill': 'play-circle-filled',
  'play.rectangle.fill': 'play-circle-filled',
  'book.fill': 'book',
  'book.closed.fill': 'book',
  'doc.text.fill': 'description',
  'camera.fill': 'camera-alt',
  'questionmark.circle.fill': 'help',
  'chart.bar.fill': 'bar-chart',
  'chart.bar.xaxis': 'bar-chart',
  'chart.bar.doc.horizontal.fill': 'assessment',
  'plus.circle.fill': 'add-circle',
  'magnifyingglass': 'search',
  'xmark.circle.fill': 'cancel',
  'checkmark.circle.fill': 'check-circle',
  'person.fill': 'person',
  'number.circle.fill': 'looks-one',
  'list.bullet': 'list',
  'list.bullet.rectangle.fill': 'view-list',
  'percent': 'percent',
  'play.fill': 'play-arrow',
  'star.fill': 'star',
  'sparkles': 'auto-awesome',
  'arrow.right': 'arrow-forward',
  'arrow.right.circle.fill': 'arrow-forward',
  'clock.fill': 'schedule',
  'info.circle.fill': 'info',
  'checkmark': 'check',
  'xmark': 'close',
  'folder.fill': 'folder',
  'person.2.fill': 'people',
  'bell.fill': 'notifications',
  'gearshape.fill': 'settings',
  'arrow.right.square.fill': 'exit-to-app',
  'target': 'adjust',
  'slider.horizontal.3': 'tune',
  'video.fill': 'videocam',
  'headphones.fill': 'headset',
  'envelope.fill': 'email',
  'lock.fill': 'lock',
  'eye.fill': 'visibility',
  'eye.slash.fill': 'visibility-off',
  'line.3.horizontal.decrease.circle': 'filter-list',
  'exclamationmark.triangle.fill': 'warning',
  'xmark.circle.fill': 'cancel',
  'bell.slash.fill': 'notifications-off',
  'phone.fill': 'phone',
  'message.fill': 'message',
  'moon.fill': 'dark-mode',
  'lock.shield.fill': 'security',
  'chevron.right': 'chevron-right',
  'hand.raised.fill': 'pan-tool',
  'pencil': 'edit',
  'pencil.fill': 'edit',
  'pencil.circle.fill': 'edit',
  'trash.fill': 'delete',
  'number': 'looks-one',
  'graduationcap.fill': 'school',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
