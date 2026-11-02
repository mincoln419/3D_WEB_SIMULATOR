export interface CharacterLook {
  hair: string
  skin: string
  clothes: string
  eye: string
  cheek: string
}

export const DEFAULT_LOOK: CharacterLook = {
  hair: '#5c4033',
  skin: '#f5d0b5',
  clothes: '#7eb8da',
  eye: '#2d3748',
  cheek: '#f5a8a8',
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

function averageRegion(data: Uint8ClampedArray, w: number, h: number, y0: number, y1: number): [number, number, number] {
  let r = 0
  let g = 0
  let b = 0
  let count = 0
  const x0 = Math.floor(w * 0.2)
  const x1 = Math.floor(w * 0.8)
  for (let y = Math.floor(h * y0); y < Math.floor(h * y1); y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * w + x) * 4
      const a = data[i + 3]
      if (a < 128) continue
      r += data[i]
      g += data[i + 1]
      b += data[i + 2]
      count++
    }
  }
  if (count === 0) return [200, 180, 160]
  return [r / count, g / count, b / count]
}

function luminance(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function shadeRgb(r: number, g: number, b: number, factor: number): string {
  return rgbToHex(r * factor, g * factor, b * factor)
}

export function sampleCharacterLookFromImage(image: HTMLImageElement): CharacterLook {
  const canvas = document.createElement('canvas')
  const size = 64
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return DEFAULT_LOOK

  const scale = Math.min(size / image.width, size / image.height)
  const dw = image.width * scale
  const dh = image.height * scale
  ctx.drawImage(image, (size - dw) / 2, (size - dh) / 2, dw, dh)
  const img = ctx.getImageData(0, 0, size, size)

  const [hr, hg, hb] = averageRegion(img.data, size, size, 0, 0.28)
  const [sr, sg, sb] = averageRegion(img.data, size, size, 0.32, 0.62)
  const [cr, cg, cb] = averageRegion(img.data, size, size, 0.62, 1)

  const hairL = luminance(hr, hg, hb)
  const eyeFactor = hairL > 140 ? 0.35 : 0.55

  return {
    hair: rgbToHex(hr, hg, hb),
    skin: rgbToHex(sr, sg, sb),
    clothes: rgbToHex(cr, cg, cb),
    eye: shadeRgb(hr * 0.3 + sr * 0.2, hg * 0.3 + sg * 0.2, hb * 0.3 + sb * 0.2, eyeFactor),
    cheek: rgbToHex(Math.min(255, sr + 25), Math.min(255, sg + 10), sb),
  }
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('이미지를 불러올 수 없습니다'))
    }
    img.src = url
  })
}
