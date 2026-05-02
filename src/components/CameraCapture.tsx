import { Button, HStack, Image, Stack, Text } from '@chakra-ui/react'
import { useCamera } from '../hooks/useCamera'

export function CameraCapture({
  value,
  onChange,
}: {
  value?: string | null
  onChange: (dataUrl: string | null) => void
}) {
  const { inputRef, previewUrl, openPicker, onSelectFile, clear } = useCamera()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] || null

    if (!selected) {
      return
    }

    onSelectFile(event)
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null
      onChange(result)
    }
    reader.readAsDataURL(selected)
  }

  const handleClear = () => {
    clear()
    onChange(null)
  }

  const activePreview = previewUrl || value || null

  return (
    <Stack gap="3" className="cc-surface" borderRadius="2xl" p="4">
      <input ref={inputRef} type="file" accept="image/*" capture="environment" hidden onChange={handleFileChange} />
      {activePreview ? (
        <Image src={activePreview} alt="Prévisualisation de la photo du lot" borderRadius="xl" maxH="260px" objectFit="cover" />
      ) : (
        <Stack border="1px dashed" borderColor="border" borderRadius="xl" minH="220px" align="center" justify="center" gap="2" bg="bg.muted" px="4" textAlign="center">
          <Text fontWeight="semibold">Ajouter une photo</Text>
          <Text fontSize="sm" color="fg.muted">Appuyez pour utiliser la caméra ou la galerie.</Text>
        </Stack>
      )}

      <HStack gap="3" wrap="wrap">
        <Button colorPalette="olive" onClick={openPicker} size="lg">Caméra / galerie</Button>
        <Button variant="outline" onClick={handleClear} size="lg">Supprimer</Button>
      </HStack>

      <Text fontSize="xs" color="fg.muted">
        Conseil: gardez le lot au centre du cadre et évitez les ombres fortes.
      </Text>
    </Stack>
  )
}
