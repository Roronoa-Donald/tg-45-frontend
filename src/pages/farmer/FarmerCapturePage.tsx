import { Button, Heading, Input, SimpleGrid, Stack, Text, Textarea } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { CameraCapture } from '../../components/CameraCapture'
import { useAuth } from '../../hooks/useAuth'
import { useLots } from '../../hooks/useLots'
import { useToast } from '../../context/ToastContext'

function generateDraftIds() {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`
  return { draftId: `draft-${id}`, idempotencyKey: `idem-${id}` }
}

function createInitialForm() {
  return {
    title: `LOT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900 + 100))}`,
    product: 'Cacao',
    variety: 'Forastero',
    weightKg: 120,
    harvestDate: new Date().toISOString().slice(0, 10),
    gpsOriginLat: 6.901,
    gpsOriginLng: 0.629,
    gpsPrecisionM: 24,
    notes: '',
  }
}

export function FarmerCapturePage() {
  const { user } = useAuth()
  const { saveDraft, submitDraft } = useLots()
  const { showToast } = useToast()
  const [ids, setIds] = useState(() => generateDraftIds())
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const [form, setForm] = useState(createInitialForm)

  useEffect(() => {
    const draft = {
      id: ids.draftId,
      title: form.title,
      product: form.product,
      variety: form.variety,
      weightKg: form.weightKg,
      harvestDate: form.harvestDate,
      gpsOriginLat: form.gpsOriginLat,
      gpsOriginLng: form.gpsOriginLng,
      gpsPrecisionM: form.gpsPrecisionM,
      cooperativeId: user?.cooperativeId,
      photoDataUrl: photoDataUrl || undefined,
      notes: form.notes,
      idempotencyKey: ids.idempotencyKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    void saveDraft(draft)
  }, [form, ids.draftId, ids.idempotencyKey, photoDataUrl, saveDraft, user?.cooperativeId])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const draft = {
      id: ids.draftId,
      title: form.title,
      product: form.product,
      variety: form.variety,
      weightKg: form.weightKg,
      harvestDate: form.harvestDate,
      gpsOriginLat: form.gpsOriginLat,
      gpsOriginLng: form.gpsOriginLng,
      gpsPrecisionM: form.gpsPrecisionM,
      cooperativeId: user?.cooperativeId,
      photoDataUrl: photoDataUrl || undefined,
      notes: form.notes,
      idempotencyKey: ids.idempotencyKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      console.log('🚀 Soumission du lot:', { draftId: draft.id, title: draft.title })
      await submitDraft(draft)
      console.log('✅ Lot soumis avec succès')
      showToast(`Lot "${draft.title}" enregistré et mis en file d'attente de synchronisation.`, 'success')
      
      // Clear the form and generate new IDs for the next lot
      setForm(createInitialForm())
      setPhotoDataUrl(null)
      setIds(generateDraftIds())
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      console.error('❌ Erreur lors de la soumission:', errorMessage)
      showToast(`Erreur: ${errorMessage}`, 'error')
    }
  }

  return (
    <Stack gap="5">
      <Stack className="cc-surface" borderRadius="3xl" p="6" gap="2">
        <Heading size="xl">Créer un lot</Heading>
        <Text color="fg.muted">Flux photo-first, brouillon local automatique et reprise hors ligne.</Text>
      </Stack>

      <CameraCapture value={photoDataUrl} onChange={setPhotoDataUrl} />

      <form onSubmit={handleSubmit} className="cc-surface" style={{ borderRadius: '1.5rem', padding: '1.5rem' }}>
        <Stack gap="4">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
          <Stack gap="2">
            <Text as="label" fontWeight="semibold">Titre du lot</Text>
            <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
          </Stack>
          <Stack gap="2">
            <Text as="label" fontWeight="semibold">Produit</Text>
            <select value={form.product} onChange={(event) => setForm((current) => ({ ...current, product: event.target.value }))} className="cc-surface" style={{ minHeight: '3rem', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}>
              <option value="Cacao">Cacao</option>
              <option value="Café">Café</option>
            </select>
          </Stack>
          <Stack gap="2">
            <Text as="label" fontWeight="semibold">Variété</Text>
            <Input value={form.variety} onChange={(event) => setForm((current) => ({ ...current, variety: event.target.value }))} />
          </Stack>
          <Stack gap="2">
            <Text as="label" fontWeight="semibold">Poids (kg)</Text>
            <Input type="number" value={form.weightKg} onChange={(event) => setForm((current) => ({ ...current, weightKg: Number(event.target.value) || 0 }))} />
          </Stack>
          <Stack gap="2">
            <Text as="label" fontWeight="semibold">Date de récolte</Text>
            <Input type="date" value={form.harvestDate} onChange={(event) => setForm((current) => ({ ...current, harvestDate: event.target.value }))} />
          </Stack>
          <Stack gap="2">
            <Text as="label" fontWeight="semibold">Précision GPS (m)</Text>
            <Input type="number" value={form.gpsPrecisionM} onChange={(event) => setForm((current) => ({ ...current, gpsPrecisionM: Number(event.target.value) || 0 }))} />
          </Stack>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
          <Stack gap="2">
            <Text as="label" fontWeight="semibold">Latitude</Text>
            <Input type="number" step="0.0001" value={form.gpsOriginLat} onChange={(event) => setForm((current) => ({ ...current, gpsOriginLat: Number(event.target.value) || 0 }))} />
          </Stack>
          <Stack gap="2">
            <Text as="label" fontWeight="semibold">Longitude</Text>
            <Input type="number" step="0.0001" value={form.gpsOriginLng} onChange={(event) => setForm((current) => ({ ...current, gpsOriginLng: Number(event.target.value) || 0 }))} />
          </Stack>
        </SimpleGrid>

        <Stack gap="2">
          <Text as="label" fontWeight="semibold">Notes</Text>
          <Textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Observations terrain, qualité, sécheresse..." />
        </Stack>

        <Button type="submit" colorPalette="olive" size="lg" alignSelf="flex-start">Enregistrer et synchroniser</Button>
        </Stack>
      </form>
    </Stack>
  )
}
