import React, { useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="%23f3f4f6" width="200" height="200"/><text x="100" y="108" text-anchor="middle" fill="%239ca3af" font-size="14" font-family="system-ui">No Image</text></svg>'

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, srcSet, ...rest } = props

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        {/* srcSet deliberately omitted — would re-trigger the broken load */}
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
      </div>
    </div>
  ) : (
    <img
      src={src}
      srcSet={srcSet}
      alt={alt}
      className={className}
      style={style}
      decoding="async"
      {...rest}
      onError={handleError}
    />
  )
}
