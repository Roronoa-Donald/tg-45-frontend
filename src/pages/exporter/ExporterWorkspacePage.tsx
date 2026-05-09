import { Box, Button, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../context/ToastContext'
import { loadIncomingExports, acceptExport, rejectExport } from '../../lib/api'
import { StatusPill } from '../../components/StatusPill'

type ExportLotItem = {
  lot?: { weightKg?: number }
}

type ExportRecord = {
  id: string
  status?: string
  cooperative?: { name?: string }
  lots: ExportLotItem[]
  eudrStatus?: string | null
  createdAt?: string
  updatedAt?: string
}

const getGpsLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('GPS non supporté'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};

export function ExporterWorkspacePage() {
  const { token } = useAuth()
  const { showToast } = useToast()
  const [exportsList, setExportsList] = useState<ExportRecord[]>([])
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [acquiringGps, setAcquiringGps] = useState(false)

  const load = useCallback(async () => {
    if (!token) return
    try {
      const data = await loadIncomingExports(token)
      setExportsList(data as ExportRecord[])
    } catch {
      showToast('Erreur lors du chargement des exportations', 'error')
    }
  }, [showToast, token])

  useEffect(() => { void load() }, [load])

  const handleAccept = async (exportId: string) => {
    if (!token) return
    setLoadingId(exportId)
    setAcquiringGps(true)
    
    try {
      const gps = await getGpsLocation().catch(() => null)
      if (!gps) {
        showToast("⚠️ GPS indisponible - l'acceptation continue sans le point final sur la carte.", 'warning')
      }

      await acceptExport(token, exportId, gps || undefined)
      showToast('Lots réceptionnés et acceptés avec succès !', 'success')
      load()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'acceptation"
      showToast(message, 'error')
    } finally {
      setLoadingId(null)
      setAcquiringGps(false)
    }
  }

  const handleReject = async (exportId: string) => {
    if (!token) return
    if (!window.confirm("Êtes-vous sûr de vouloir refuser cette cargaison ? Les lots retourneront à la coopérative.")) return

    setLoadingId(exportId)
    try {
      await rejectExport(token, exportId, "Refusé à la réception")
      showToast('Cargaison refusée.', 'info')
      load()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du refus'
      showToast(message, 'error')
    } finally {
      setLoadingId(null)
    }
  }

  const declaredExports = exportsList.filter(e => e.status === 'declared')
  const completedExports = exportsList.filter(e => e.status === 'delivered')

  return (
    <Stack gap="8">
      {/* ─── Header ─── */}
      <Flex justify="space-between" align="flex-end" wrap="wrap" gap="4">
        <Stack gap="2">
          <Text textTransform="uppercase" letterSpacing="0.1em" fontSize="xs" fontWeight="700" color="var(--cc-gold)">Espace de travail</Text>
          <Heading size="2xl" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Exportateur</Heading>
          <Text color="var(--cc-cocoa)" opacity="0.7">Réceptionnez les lots expédiés par les coopératives.</Text>
        </Stack>
        {acquiringGps && <span className="cc-gps-spinner">Acquisition satellite en cours…</span>}
      </Flex>

      <Stack gap="6">
        <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Cargaisons en attente de réception</Heading>
        
        {declaredExports.length === 0 ? (
          <Box p="8" textAlign="center" border="1px dashed var(--cc-line)" borderRadius="var(--cc-radius-md)">
            <Text color="var(--cc-cocoa)" opacity="0.5">Aucune cargaison en attente.</Text>
          </Box>
        ) : null}

        {declaredExports.map(exp => {
          const totalWeight = exp.lots.reduce((acc, curr) => acc + Number(curr.lot?.weightKg ?? 0), 0)
          return (
            <Flex key={exp.id} className="cc-surface" p="6" borderRadius="var(--cc-radius-lg)" border="1px solid var(--cc-line)" direction="column" gap="4">
              <Flex justify="space-between" align="center" wrap="wrap" gap="4">
                <Stack gap="1">
                  <Text fontSize="xs" fontWeight="700" color="var(--cc-gold)" textTransform="uppercase">Envoi #{exp.id.slice(0, 8)}</Text>
                  <Heading size="md" color="var(--cc-cocoa-deep)">{exp.cooperative?.name}</Heading>
                  <Text fontSize="sm" color="var(--cc-cocoa)">Date d'envoi : {exp.createdAt ? new Date(exp.createdAt).toLocaleDateString() : '—'}</Text>
                </Stack>
                {exp.eudrStatus ? <StatusPill value={String(exp.eudrStatus)} /> : null}
                
                <Flex gap="8" bg="rgba(250,246,240,0.5)" p="4" borderRadius="var(--cc-radius-md)">
                  <Stack align="center" gap="0">
                    <Text fontSize="xl" fontWeight="bold" color="var(--cc-cocoa-deep)">{exp.lots.length}</Text>
                    <Text fontSize="xs" color="var(--cc-cocoa)">Lots inclus</Text>
                  </Stack>
                  <Stack align="center" gap="0">
                    <Text fontSize="xl" fontWeight="bold" color="var(--cc-cocoa-deep)">{totalWeight.toFixed(2)}</Text>
                    <Text fontSize="xs" color="var(--cc-cocoa)">Tonnes / Kg</Text>
                  </Stack>
                </Flex>

                <Flex gap="3">
                  <button 
                    className="cc-btn-outline" 
                    onClick={() => handleReject(exp.id)} 
                    disabled={loadingId !== null}
                    style={{ borderColor: 'var(--cc-danger)', color: 'var(--cc-danger)' }}
                  >
                    Refuser
                  </button>
                  <Button 
                    onClick={() => handleAccept(exp.id)} 
                    loading={loadingId === exp.id}
                    bg="linear-gradient(135deg, var(--cc-gold), var(--cc-gold-light))" 
                    color="white" 
                    _hover={{ transform: 'translateY(-1px)', boxShadow: 'var(--cc-shadow-gold)' }}
                  >
                    Accepter la cargaison
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          )
        })}
      </Stack>

      {completedExports.length > 0 && (
        <Stack gap="4" mt="8">
          <Heading size="sm" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif" opacity="0.6">Dernières cargaisons réceptionnées</Heading>
          {completedExports.map(exp => (
            <Flex key={exp.id} className="cc-surface" p="4" borderRadius="var(--cc-radius-md)" border="1px solid var(--cc-line)" opacity="0.7" justify="space-between" align="center">
              <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">{exp.cooperative?.name}</Text>
              <Text fontSize="sm" color="var(--cc-olive)" fontWeight="bold">Accepé le {exp.updatedAt ? new Date(exp.updatedAt).toLocaleDateString() : '—'}</Text>
            </Flex>
          ))}
        </Stack>
      )}

    </Stack>
  )
}
