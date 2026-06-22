/** Bilder komprimieren — Firestore-Dokumente max. ~1 MB */
export async function compressImageFile(
  file: File,
  maxWidth = 1280,
  quality = 0.82
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    return readFileAsDataUrl(file)
  }

  const source = await loadImageFromFile(file)
  const scale = Math.min(1, maxWidth / Math.max(source.width, source.height))
  const width = Math.round(source.width * scale)
  const height = Math.round(source.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) return readFileAsDataUrl(file)

  ctx.drawImage(source, 0, 0, width, height)

  const dataUrl = canvas.toDataURL('image/jpeg', quality)
  URL.revokeObjectURL(source.src)
  return dataUrl
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => resolve(img)
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Bild konnte nicht geladen werden'))
    }
    img.src = url
  })
}
