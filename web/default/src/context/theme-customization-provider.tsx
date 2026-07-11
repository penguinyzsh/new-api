/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'

import { getCookie, removeCookie, setCookie } from '@/lib/cookies'
import {
  DEFAULT_THEME_CUSTOMIZATION,
  resolveThemeFont,
  THEME_COOKIE_KEYS,
  THEME_RADIUS_VALUES,
  type ThemeCustomization,
  type ThemeFont,
  type ThemePreset,
  type ThemeRadius,
} from '@/lib/theme-customization'

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

function readCookie<T extends string>(
  name: string,
  allowed: ReadonlySet<T>,
  fallback: T
): T {
  const value = getCookie(name)
  return value && allowed.has(value as T) ? (value as T) : fallback
}

function applyAttribute(name: string, value: string | null) {
  if (typeof document === 'undefined') return
  const body = document.body
  if (!body) return
  if (value === null) {
    body.removeAttribute(name)
  } else {
    body.setAttribute(name, value)
  }
}

type ThemeCustomizationContextType = {
  defaults: ThemeCustomization
  customization: ThemeCustomization
  setPreset: (preset: ThemePreset) => void
  setFont: (font: ThemeFont) => void
  setRadius: (radius: ThemeRadius) => void
  resetCustomization: () => void
}

// Fallback used when a consumer renders outside the provider (e.g. an error
// route mounted before providers are ready, or stale HMR boundaries). Keeping
// it permissive prevents the whole tree from crashing — the UI just behaves
// like the defaults until the real provider re-mounts.
const FALLBACK_CONTEXT: ThemeCustomizationContextType = {
  defaults: DEFAULT_THEME_CUSTOMIZATION,
  customization: DEFAULT_THEME_CUSTOMIZATION,
  setPreset: () => {},
  setFont: () => {},
  setRadius: () => {},
  resetCustomization: () => {},
}

const ThemeCustomizationContext =
  createContext<ThemeCustomizationContextType>(FALLBACK_CONTEXT)

export function ThemeCustomizationProvider(props: {
  children: React.ReactNode
}) {
  const [preset, _setPreset] = useState<ThemePreset>(
    DEFAULT_THEME_CUSTOMIZATION.preset
  )
  const [font, _setFont] = useState<ThemeFont>(
    DEFAULT_THEME_CUSTOMIZATION.font
  )
  const [radius, _setRadius] = useState<ThemeRadius>(() =>
    readCookie<ThemeRadius>(
      THEME_COOKIE_KEYS.radius,
      THEME_RADIUS_VALUES,
      DEFAULT_THEME_CUSTOMIZATION.radius
    )
  )

  useEffect(() => {
    removeCookie(THEME_COOKIE_KEYS.preset)
    removeCookie(THEME_COOKIE_KEYS.font)
    _setPreset(DEFAULT_THEME_CUSTOMIZATION.preset)
    _setFont(DEFAULT_THEME_CUSTOMIZATION.font)
  }, [])

  // Mirror state to <body> via data-* attributes before paint so theme-
  // presets.css can override CSS variables without a one-frame size/font flash.
  // useLayoutEffect (not useEffect) is required: useEffect runs after paint,
  // which is exactly when users see text jump from default → cookie scale/font.
  useLayoutEffect(() => {
    applyAttribute(
      'data-theme-preset',
      preset === DEFAULT_THEME_CUSTOMIZATION.preset ? null : preset
    )
  }, [preset])

  // Font is the one axis where we resolve before writing the attribute:
  // the persisted preference may be `default`, but CSS works in terms of
  // the concrete `sans`/`serif` choice that should drive the cascade.
  // Resolving here (instead of in CSS via `:not()` selectors) keeps the
  // stylesheet to one simple `[data-theme-font='serif']` selector and lets
  // future presets opt into typography via `PRESET_DEFAULT_FONT` alone.
  useLayoutEffect(() => {
    applyAttribute('data-theme-font', resolveThemeFont(font, preset))
  }, [font, preset])

  useLayoutEffect(() => {
    applyAttribute(
      'data-theme-radius',
      radius === DEFAULT_THEME_CUSTOMIZATION.radius ? null : radius
    )
  }, [radius])

  const setPreset = useCallback((_value: ThemePreset) => {
    _setPreset(DEFAULT_THEME_CUSTOMIZATION.preset)
    removeCookie(THEME_COOKIE_KEYS.preset)
  }, [])

  const setFont = useCallback((_value: ThemeFont) => {
    _setFont(DEFAULT_THEME_CUSTOMIZATION.font)
    removeCookie(THEME_COOKIE_KEYS.font)
  }, [])

  const setRadius = useCallback((value: ThemeRadius) => {
    _setRadius(value)
    if (value === DEFAULT_THEME_CUSTOMIZATION.radius) {
      removeCookie(THEME_COOKIE_KEYS.radius)
    } else {
      setCookie(THEME_COOKIE_KEYS.radius, value, COOKIE_MAX_AGE)
    }
  }, [])

  const resetCustomization = useCallback(() => {
    setPreset(DEFAULT_THEME_CUSTOMIZATION.preset)
    setFont(DEFAULT_THEME_CUSTOMIZATION.font)
    setRadius(DEFAULT_THEME_CUSTOMIZATION.radius)
  }, [setPreset, setFont, setRadius])

  const value = useMemo<ThemeCustomizationContextType>(
    () => ({
      defaults: DEFAULT_THEME_CUSTOMIZATION,
      customization: { preset, font, radius },
      setPreset,
      setFont,
      setRadius,
      resetCustomization,
    }),
    [
      preset,
      font,
      radius,
      setPreset,
      setFont,
      setRadius,
      resetCustomization,
    ]
  )

  return (
    <ThemeCustomizationContext.Provider value={value}>
      {props.children}
    </ThemeCustomizationContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useThemeCustomization() {
  return useContext(ThemeCustomizationContext)
}
