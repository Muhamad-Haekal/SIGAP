export const WA_NUMBER = '6285694079087'

export const DEFAULT_WA_MESSAGE =
  'Halo SIGAP Express, saya ingin bertanya tentang layanan antar & packing barang.'

export function buildWaLink(message = DEFAULT_WA_MESSAGE) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`
}