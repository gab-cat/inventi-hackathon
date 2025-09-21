import * as React from 'react';
import { View } from 'react-native';

// Minimal placeholder PortalHost to satisfy libraries expecting a portal root.
// If you later install a portal library, replace this with its PortalHost.
export function PortalHost() {
  return <View style={{ position: 'absolute', width: 0, height: 0 }} />;
}


