import { useState } from 'react'
import type { ImgHTMLAttributes, SyntheticEvent } from 'react'

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string
}

export const SafeImage = ({
  src,
  alt,
  fallbackSrc = '/fallback-image.svg',
  loading = 'lazy',
  onError,
  ...rest
}: Props) => {
  const [hasError, setHasError] = useState(false)

  const handleError = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true)
    }

    onError?.(event)
  }

  return (
    <img
      {...rest}
      src={hasError ? fallbackSrc : src}
      alt={alt}
      loading={loading}
      onError={handleError}
    />
  )
}
