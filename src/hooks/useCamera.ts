import { useMemo, useRef, useState } from 'react'

export function useCamera() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const cameraSupported = useMemo(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return Boolean(navigator.mediaDevices?.getUserMedia)
  }, [])

  const openPicker = () => {
    inputRef.current?.click()
  }

  const onSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] || null

    if (!selected) {
      return
    }

    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
  }

  const clear = () => {
    setFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return {
    inputRef,
    file,
    previewUrl,
    cameraSupported,
    openPicker,
    onSelectFile,
    clear,
  }
}
