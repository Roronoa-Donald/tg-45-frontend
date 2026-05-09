import 'leaflet/dist/leaflet.css'
import { Box, Button, Heading, Input, SimpleGrid, Stack, Text, Textarea } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Polygon, TileLayer, useMapEvents } from 'react-leaflet'
import { createParcel, listParcels, updateParcel } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { StatusPill } from '../components/StatusPill'
import { patchLeafletDefaultIcon } from '../utils/leafletFix'
import type { ParcelRecord } from '../domain/types'

const DEFAULT_CENTER: [number, number] = [6.901, 0.629]

function MapClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng.lat, event.latlng.lng)
    },
  })

  return null
}

export function ParcelsPage() {
  const { token } = useAuth()
  const [parcels, setParcels] = useState<ParcelRecord[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [geoJsonText, setGeoJsonText] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    countryCode: 'TG',
    region: '',
    district: '',
    locality: '',
    geometryType: 'point' as 'point' | 'polygon',
    areaHa: '',
    lat: DEFAULT_CENTER[0],
    lng: DEFAULT_CENTER[1],
  })

  useEffect(() => {
    patchLeafletDefaultIcon()
  }, [])

  useEffect(() => {
    if (!token) {
      return
    }

    const load = async () => {
      const response = await listParcels(token)
      setParcels(response as unknown as ParcelRecord[])
    }

    void load()
  }, [token])

  const selectedParcel = useMemo(
    () => parcels.find((parcel) => parcel.id === selectedId) || null,
    [parcels, selectedId],
  )

  useEffect(() => {
    if (!selectedParcel) {
      return
    }

    setForm({
      name: selectedParcel.name || '',
      countryCode: selectedParcel.countryCode || 'TG',
      region: selectedParcel.region || '',
      district: selectedParcel.district || '',
      locality: selectedParcel.locality || '',
      geometryType: selectedParcel.geometryType,
      areaHa: selectedParcel.areaHa ? String(selectedParcel.areaHa) : '',
      lat: Array.isArray(selectedParcel.geometry?.coordinates) ? Number(selectedParcel.geometry?.coordinates?.[1] || DEFAULT_CENTER[0]) : DEFAULT_CENTER[0],
      lng: Array.isArray(selectedParcel.geometry?.coordinates) ? Number(selectedParcel.geometry?.coordinates?.[0] || DEFAULT_CENTER[1]) : DEFAULT_CENTER[1],
    })
    setGeoJsonText(selectedParcel.geometryType === 'polygon' ? JSON.stringify(selectedParcel.geometry, null, 2) : '')
  }, [selectedParcel])

  const geometryPreview = useMemo(() => {
    if (form.geometryType === 'point') {
      return { type: 'Point', coordinates: [form.lng, form.lat] }
    }

    if (!geoJsonText.trim()) {
      return null
    }

    try {
      return JSON.parse(geoJsonText)
    } catch {
      return null
    }
  }, [form.geometryType, form.lat, form.lng, geoJsonText])

  const handleSave = async () => {
    if (!token) {
      return
    }

    const geometry = geometryPreview
    if (!geometry) {
      return
    }

    setSaving(true)
    const payload = {
      name: form.name || undefined,
      countryCode: form.countryCode || undefined,
      region: form.region || undefined,
      district: form.district || undefined,
      locality: form.locality || undefined,
      geometryType: form.geometryType,
      geometry,
      areaHa: form.areaHa ? Number(form.areaHa) : undefined,
    }

    try {
      if (selectedId) {
        await updateParcel(token, selectedId, payload)
      } else {
        await createParcel(token, payload)
      }

      const refreshed = await listParcels(token)
      setParcels(refreshed as unknown as ParcelRecord[])
      setSelectedId(null)
      setGeoJsonText('')
      setForm((current) => ({
        ...current,
        name: '',
        region: '',
        district: '',
        locality: '',
        areaHa: '',
      }))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Stack gap="8">
      <Stack gap="2">
        <Text textTransform="uppercase" letterSpacing="0.1em" fontSize="xs" fontWeight="700" color="var(--cc-gold)">EUDR</Text>
        <Heading size="2xl" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Parcelles</Heading>
        <Text color="var(--cc-cocoa)" opacity="0.7">Capture et gestion parcellaire conforme EUDR.</Text>
        <StatusPill value="draft" label="EUDR parcelles" />
      </Stack>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="6">
        <Stack className="cc-surface" borderRadius="var(--cc-radius-lg)" p="6" gap="4">
          <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Créer / Modifier une parcelle</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
            <Stack gap="1">
              <Text fontWeight="600" color="var(--cc-cocoa)">Nom</Text>
              <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            </Stack>
            <Stack gap="1">
              <Text fontWeight="600" color="var(--cc-cocoa)">Pays</Text>
              <Input value={form.countryCode} onChange={(event) => setForm((current) => ({ ...current, countryCode: event.target.value }))} />
            </Stack>
            <Stack gap="1">
              <Text fontWeight="600" color="var(--cc-cocoa)">Région</Text>
              <Input value={form.region} onChange={(event) => setForm((current) => ({ ...current, region: event.target.value }))} />
            </Stack>
            <Stack gap="1">
              <Text fontWeight="600" color="var(--cc-cocoa)">District</Text>
              <Input value={form.district} onChange={(event) => setForm((current) => ({ ...current, district: event.target.value }))} />
            </Stack>
            <Stack gap="1">
              <Text fontWeight="600" color="var(--cc-cocoa)">Localité</Text>
              <Input value={form.locality} onChange={(event) => setForm((current) => ({ ...current, locality: event.target.value }))} />
            </Stack>
            <Stack gap="1">
              <Text fontWeight="600" color="var(--cc-cocoa)">Surface (ha)</Text>
              <Input type="number" value={form.areaHa} onChange={(event) => setForm((current) => ({ ...current, areaHa: event.target.value }))} />
            </Stack>
            <Stack gap="1">
              <Text fontWeight="600" color="var(--cc-cocoa)">Type</Text>
              <select className="cc-input" value={form.geometryType} onChange={(event) => setForm((current) => ({ ...current, geometryType: event.target.value as 'point' | 'polygon' }))}>
                <option value="point">Point</option>
                <option value="polygon">Polygone</option>
              </select>
            </Stack>
          </SimpleGrid>

          {form.geometryType === 'polygon' ? (
            <Stack gap="1">
              <Text fontWeight="600" color="var(--cc-cocoa)">GeoJSON (Polygon)</Text>
              <Textarea value={geoJsonText} onChange={(event) => setGeoJsonText(event.target.value)} minH="140px" placeholder='{"type":"Polygon","coordinates":[[[lng,lat],...]]}' />
            </Stack>
          ) : (
            <Stack gap="1">
              <Text fontWeight="600" color="var(--cc-cocoa)">Point (clic sur la carte)</Text>
              <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.7">Lat: {form.lat.toFixed(4)} · Lng: {form.lng.toFixed(4)}</Text>
            </Stack>
          )}

          <Button className="cc-btn-gold" onClick={handleSave} loading={saving}>
            {selectedId ? 'Mettre à jour' : 'Créer la parcelle'}
          </Button>
        </Stack>

        <Stack className="cc-surface" borderRadius="var(--cc-radius-lg)" p="6" gap="4">
          <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Prévisualisation</Heading>
          <Box borderRadius="var(--cc-radius-md)" overflow="hidden" border="1px solid var(--cc-line)" h="320px">
            <MapContainer center={DEFAULT_CENTER} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onSelect={(lat, lng) => setForm((current) => ({ ...current, lat, lng }))} />
              {geometryPreview?.type === 'Point' ? <Marker position={[form.lat, form.lng]} /> : null}
              {geometryPreview?.type === 'Polygon' && Array.isArray(geometryPreview.coordinates) ? (
                <Polygon positions={geometryPreview.coordinates[0].map((coord: number[]) => [coord[1], coord[0]])} />
              ) : null}
            </MapContainer>
          </Box>
          <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.7">Cliquez sur la carte pour positionner un point. Pour un polygone, collez un GeoJSON valide.</Text>
        </Stack>
      </SimpleGrid>

      <Stack className="cc-surface" borderRadius="var(--cc-radius-lg)" p="6" gap="4">
        <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Parcelles enregistrées</Heading>
        {parcels.length ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
            {parcels.map((parcel) => (
              <Box key={parcel.id} border="1px solid var(--cc-line)" borderRadius="var(--cc-radius-sm)" p="4">
                <Text fontWeight="700" color="var(--cc-cocoa-deep)">{parcel.name || parcel.id}</Text>
                <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.7">{parcel.region || '—'} · {parcel.areaHa ?? '—'} ha</Text>
                <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.7">Type: {parcel.geometryType}</Text>
                <Button size="sm" variant="outline" mt="3" onClick={() => setSelectedId(parcel.id)}>Modifier</Button>
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Text color="var(--cc-cocoa)" opacity="0.6">Aucune parcelle enregistrée.</Text>
        )}
      </Stack>
    </Stack>
  )
}
