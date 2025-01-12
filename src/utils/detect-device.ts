export function detectDevice() {
  const userAgent =
    'opera' in window
      ? (window.opera as string)
      : navigator.userAgent || navigator.vendor

  if (/android/i.test(userAgent)) {
    return 'mobile'
  }

  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return 'mobile'
  }

  return 'desktop'
}
