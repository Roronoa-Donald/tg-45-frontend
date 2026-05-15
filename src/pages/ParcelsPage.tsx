import 'leaflet/dist/leaflet.css'
import { Box, Button, Flex, Heading, Input, SimpleGrid, Stack, Text, Textarea } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Polygon, Polyline, TileLayer, useMapEvents } from 'react-leaflet'
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
  const [polygonPoints, setPolygonPoints] = useState<Array<{ lat: number; lng: number }>>([])
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
      try {
        const response = await listParcels(token)
        const items = Array.isArray(response)
          ? response
          : Array.isArray((response as { items?: unknown })?.items)
            ? (response as { items: unknown[] }).items
            : Array.isArray((response as { data?: { items?: unknown } })?.data?.items)
              ? ((response as { data: { items: unknown[] } }).data.items)
              : []
        setParcels(items as ParcelRecord[])
      } catch (err) {
        console.error('Failed to load parcels:', err)
        setParcels([])
      }
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
    if (selectedParcel.geometryType === 'polygon') {
      const coords = Array.isArray(selectedParcel.geometry?.coordinates)
        ? (selectedParcel.geometry?.coordinates as unknown[])
        : []
      if (Array.isArray(coords[0])) {
        const points = (coords[0] as unknown[])
          .map((coord) => Array.isArray(coord) ? coord : [])
          .filter((coord) => coord.length >= 2)
          .map((coord) => ({ lat: Number(coord[1]), lng: Number(coord[0]) }))
          .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng))
        setPolygonPoints(points)
      } else {
        setPolygonPoints([])
      }
      setGeoJsonText(JSON.stringify(selectedParcel.geometry, null, 2))
    } else {
      setPolygonPoints([])
      setGeoJsonText('')
    }
  }, [selectedParcel])

  useEffect(() => {
    if (form.geometryType === 'point') {
      setPolygonPoints([])
    }
  }, [form.geometryType])

  const polygonGeometryFromPoints = useMemo(() => {
    if (polygonPoints.length < 3) {
      return null
    }

    const coordinates = polygonPoints.map((point) => [point.lng, point.lat])
    const [firstLng, firstLat] = coordinates[0]
    const [lastLng, lastLat] = coordinates[coordinates.length - 1]
    if (firstLng !== lastLng || firstLat !== lastLat) {
      coordinates.push([firstLng, firstLat])
    }

    return { type: 'Polygon', coordinates: [coordinates] }
  }, [polygonPoints])

  const geometryPreview = useMemo(() => {
    if (form.geometryType === 'point') {
      return { type: 'Point', coordinates: [form.lng, form.lat] }
    }

    if (polygonGeometryFromPoints) {
      return polygonGeometryFromPoints
    }

    if (!geoJsonText.trim()) {
      return null
    }

    try {
      return JSON.parse(geoJsonText)
    } catch {
      return null
    }
  }, [form.geometryType, form.lat, form.lng, geoJsonText, polygonGeometryFromPoints])

  useEffect(() => {
    if (form.geometryType !== 'polygon') {
      return
    }

    if (polygonPoints.length === 0) {
      return
    }

    const coordinates = polygonPoints.map((point) => [point.lng, point.lat])
    const [firstLng, firstLat] = coordinates[0]
    const [lastLng, lastLat] = coordinates[coordinates.length - 1]
    if (firstLng !== lastLng || firstLat !== lastLat) {
      coordinates.push([firstLng, firstLat])
    }

    setGeoJsonText(JSON.stringify({ type: 'Polygon', coordinates: [coordinates] }, null, 2))
  }, [form.geometryType, polygonPoints])

  const polygonLatLngs = useMemo(() => {
    if (form.geometryType !== 'polygon') {
      return [] as Array<[number, number]>
    }

    if (polygonPoints.length > 0) {
      return polygonPoints.map((point) => [point.lat, point.lng] as [number, number])
    }

    if (geometryPreview?.type === 'Polygon' && Array.isArray(geometryPreview.coordinates)) {
      const coords = geometryPreview.coordinates[0]
      if (Array.isArray(coords)) {
        return coords
          .filter((coord) => Array.isArray(coord) && coord.length >= 2)
          .map((coord) => [Number(coord[1]), Number(coord[0])] as [number, number])
      }
    }

    return [] as Array<[number, number]>
  }, [form.geometryType, polygonPoints, geometryPreview])

  const handleMapSelect = (lat: number, lng: number) => {
    if (form.geometryType === 'point') {
      setForm((current) => ({ ...current, lat, lng }))
      return
    }

    setPolygonPoints((current) => [...current, { lat, lng }])
  }

  const handleUndoPolygon = () => {
    setPolygonPoints((current) => current.slice(0, -1))
  }

  const handleClearPolygon = () => {
    setPolygonPoints([])
  }

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
      const items = Array.isArray(refreshed)
        ? refreshed
        : Array.isArray((refreshed as { items?: unknown })?.items)
          ? (refreshed as { items: unknown[] }).items
          : []
      setParcels(items as ParcelRecord[])
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
            <Stack gap="3">
              <Stack gap="1">
                <Text fontWeight="600" color="var(--cc-cocoa)">Mode polygone</Text>
                <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.7">1) Cliquez sur la carte pour poser le point 1. 2) Ajoutez 3 points minimum. 3) Enregistrez.</Text>
                <Text fontSize="sm" color="var(--cc-cocoa)">Points: {polygonPoints.length}</Text>
                {polygonPoints.length > 0 ? (
                  <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.7">Dernier point: {polygonPoints[polygonPoints.length - 1].lat.toFixed(4)}, {polygonPoints[polygonPoints.length - 1].lng.toFixed(4)}</Text>
                ) : null}
                <Flex gap="2" wrap="wrap">
                  <button className="cc-btn-outline" onClick={handleUndoPolygon} disabled={polygonPoints.length === 0}>
                    Retirer dernier
                  </button>
                  <button className="cc-btn-outline" onClick={handleClearPolygon} disabled={polygonPoints.length === 0}>
                    Effacer
                  </button>
                </Flex>
              </Stack>
              <Stack gap="1">
                <Text fontWeight="600" color="var(--cc-cocoa)">GeoJSON (Polygon)</Text>
                <Textarea value={geoJsonText} onChange={(event) => setGeoJsonText(event.target.value)} minH="140px" placeholder='{"type":"Polygon","coordinates":[[[lng,lat],...]]}' />
                <Text fontSize="xs" color="var(--cc-cocoa)" opacity="0.6">Le GeoJSON se met a jour automatiquement si vous cliquez sur la carte.</Text>
              </Stack>
            </Stack>
          ) : (
            <Stack gap="1">
              <Text fontWeight="600" color="var(--cc-cocoa)">Point (clic sur la carte)</Text>
              <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.7">Lat: {form.lat.toFixed(4)} · Lng: {form.lng.toFixed(4)}</Text>
            </Stack>
          )}

          <Button className="cc-btn-gold" onClick={handleSave} loading={saving} disabled={saving}>
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
              <MapClickHandler onSelect={handleMapSelect} />
              {geometryPreview?.type === 'Point' ? <Marker position={[form.lat, form.lng]} /> : null}
              {form.geometryType === 'polygon' && polygonLatLngs.length > 0 ? (
                polygonLatLngs.map((coord, index) => (
                  <Marker key={`polygon-point-${index}`} position={coord} />
                ))
              ) : null}
              {form.geometryType === 'polygon' && polygonLatLngs.length >= 2 ? (
                <Polyline positions={polygonLatLngs} pathOptions={{ color: '#2F855A', weight: 2, dashArray: '6 6' }} />
              ) : null}
              {form.geometryType === 'polygon' && polygonLatLngs.length >= 3 ? (
                <Polygon positions={polygonLatLngs} pathOptions={{ color: '#2F855A', fillColor: 'rgba(47, 133, 90, 0.2)' }} />
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
