import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (!+bytes) {
    return "0 Bytes"
  }

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function formatBits(bits: number, decimals = 2): string {
  if (!+bits) {
    return "0 Bits"
  }

  const k = 1000
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"]

  const i = Math.floor(Math.log(bits) / Math.log(k))

  return `${Number.parseFloat((bits / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function calculatePercentage(available: number, total: number): number {
  if (!total) return 0;
  return Math.round((available / total) * 100)
}