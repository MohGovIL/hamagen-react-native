import React, { MutableRefObject, ReactNode } from 'react';
import { AccessibilityState, TouchableOpacity as RNTouchableOpacity, TouchableOpacityProps } from 'react-native';

interface TouchableProps extends TouchableOpacityProps {
  children?: ReactNode,
  reference?: MutableRefObject <RNTouchableOpacity>,
  expanded?: boolean,
  checked?: boolean,
  selected?: boolean,
}

const TouchableOpacity = (props: TouchableProps) => {
  const { children, reference, disabled, accessibilityRole, expanded, checked, selected } = props;

  const accessibilityState: AccessibilityState = {};

  if (disabled !== undefined) {
    accessibilityState.disabled = disabled;
  }
  if (expanded !== undefined) {
    accessibilityState.expanded = expanded;
  }
  if (checked !== undefined) {
    accessibilityState.checked = checked;
  }
  if (selected !== undefined) {
    accessibilityState.selected = selected;
  }

  return (
    <RNTouchableOpacity
      {...props}
      ref={reference}
      activeOpacity={0.6}
      accessibilityRole={accessibilityRole || 'button'}
      accessibilityState={accessibilityState}
    >
      {children}
    </RNTouchableOpacity>
  );
};

export { TouchableOpacity };
