import React from 'react';
import { ScrollView, ScrollViewProps, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SafeScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
}

export default function SafeScrollView({ children, ...props }: SafeScrollViewProps) {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <ScrollView
        {...props}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          { flexGrow: 1, paddingBottom: Platform.OS === 'ios' ? 0 : 16 },
          props.contentContainerStyle,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
