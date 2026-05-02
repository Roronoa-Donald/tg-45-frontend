import ReactQrCodeModule from 'react-qr-code'

type QrProps = {
  value: string
  size?: number
  className?: string
}

const qrcodeModule = ReactQrCodeModule as unknown as {
  QRCode?: React.ComponentType<QrProps>
  default?: React.ComponentType<QrProps>
}

const QRCodeComponent = qrcodeModule.QRCode ?? qrcodeModule.default

export const SafeQrCode = ({ value, size = 128, className }: QrProps) => {
  if (!QRCodeComponent) {
    return null
  }

  return <QRCodeComponent value={value} size={size} className={className} />
}
