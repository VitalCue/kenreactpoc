// ═══════════════════════════════════════════════════════════════════════════════
// SERVICES - INDEX
// ═══════════════════════════════════════════════════════════════════════════════

// ── Health Services ────────────────────────────────────────────────────────────
export * from './health';

// Expo Router compatibility - prevent routing to this file
import React from 'react';
import { Redirect } from 'expo-router';

export default function ServicesIndex() {
  return <Redirect href="/dashboard" />;
}