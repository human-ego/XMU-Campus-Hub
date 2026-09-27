import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'

export function isNativePlatform(): boolean {
  return typeof window !== 'undefined' && Capacitor.isNativePlatform()
}

export function openExternalUrl(url: string): boolean {
  if (isNativePlatform()) {
    void Browser.open({ url })
    return true
  }

  const newWindow = window.open(url, '_blank', 'noopener,noreferrer')

  if (newWindow) {
    newWindow.opener = null
  }

  return Boolean(newWindow)
}
