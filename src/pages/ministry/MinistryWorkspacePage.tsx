import { Box, Badge, Button, Flex, Heading, Stack, Text, SimpleGrid } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../context/ToastContext'
import { loadMinistryKpis, loadPendingMinistryApprovals, approveUserAsMinistry, rejectUserAsMinistry } from '../../lib/api'

export function MinistryWorkspacePage() {
  const { token } = useAuth()
  const { showToast } = useToast()
  
  const [kpis, setKpis] = useState<any>(null)
  const [pendingUsers, setPendingUsers] = useState<any[]>([])
  const [loadingKpis, setLoadingKpis] = useState(false)
  const [loadingApprovals, setLoadingApprovals] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const fetchKpis = async () => {
    if (!token) return
    setLoadingKpis(true)
    try {
      setKpis(await loadMinistryKpis(token))
    } catch {
      showToast('Erreur KPI', 'error')
    } finally {
      setLoadingKpis(false)
    }
  }

  const fetchApprovals = async () => {
    if (!token) return
    setLoadingApprovals(true)
    try {
      setPendingUsers(await loadPendingMinistryApprovals(token))
    } catch {
      showToast('Erreur approbations', 'error')
    } finally {
      setLoadingApprovals(false)
    }
  }

  useEffect(() => {
    fetchKpis()
    fetchApprovals()
  }, [token])

  const handleApprove = async (userId: string) => {
    if (!token) return
    setLoadingId(userId)
    try {
      await approveUserAsMinistry(token, userId)
      showToast('Acteur approuvé', 'success')
      fetchApprovals()
      fetchKpis()
    } catch (err: any) {
      showToast(err?.message || "Erreur lors de l'approbation", 'error')
    } finally {
      setLoadingId(null)
    }
  }

  const handleReject = async (userId: string) => {
    if (!token) return
    setLoadingId(userId)
    try {
      await rejectUserAsMinistry(token, userId)
      showToast('Acteur refusé', 'info')
      fetchApprovals()
      fetchKpis()
    } catch (err: any) {
      showToast(err?.message || "Erreur lors du refus", 'error')
    } finally {
      setLoadingId(null)
    }
  }

  const roleMap: Record<string, string> = {
    cooperative: 'Coopérative',
    verifier: 'Validateur / Certificateur',
    exporter: 'Exportateur'
  }

  return (
    <Stack gap="8">
      {/* ─── Header ─── */}
      <Flex justify="space-between" align="flex-end" wrap="wrap" gap="4">
        <Stack gap="2">
          <Text textTransform="uppercase" letterSpacing="0.1em" fontSize="xs" fontWeight="700" color="var(--cc-gold)">Espace National</Text>
          <Heading size="2xl" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Ministère & Régulation</Heading>
          <Text color="var(--cc-cocoa)" opacity="0.7">Pilotez l'activité nationale et approuvez les acteurs de la filière.</Text>
        </Stack>
      </Flex>

      {/* ─── KPIs ─── */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap="4">
        <Box className="cc-surface" p="6" borderRadius="var(--cc-radius-lg)" borderTop="3px solid var(--cc-gold)">
          <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">Lots Certifiés</Text>
          <Heading size="2xl" color="var(--cc-cocoa-deep)" mt="2">{kpis?.certifiedLotsCount || 0}</Heading>
        </Box>
        <Box className="cc-surface" p="6" borderRadius="var(--cc-radius-lg)" borderTop="3px solid var(--cc-olive)">
          <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">Tonnes Certifiées/Exportées</Text>
          <Heading size="2xl" color="var(--cc-cocoa-deep)" mt="2">{kpis?.totalWeightTonnes?.toFixed(1) || 0} T</Heading>
        </Box>
        <Box className="cc-surface" p="6" borderRadius="var(--cc-radius-lg)" borderTop="3px solid var(--cc-cocoa-deep)">
          <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">Lots Exportés</Text>
          <Heading size="2xl" color="var(--cc-cocoa-deep)" mt="2">{kpis?.exportedLotsCount || 0}</Heading>
        </Box>
        <Box className="cc-surface" p="6" borderRadius="var(--cc-radius-lg)" borderTop="3px solid var(--cc-danger)">
          <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">Lots Refusés (Taux)</Text>
          <Heading size="2xl" color="var(--cc-cocoa-deep)" mt="2">{kpis?.rejectedLotsCount || 0}</Heading>
        </Box>
      </SimpleGrid>

      {/* ─── Approvals ─── */}
      <Box className="cc-surface" p={{ base: '6', md: '8' }} borderRadius="var(--cc-radius-xl)" border="1px solid var(--cc-line)">
        <Flex justify="space-between" align="center" mb="6">
          <Heading size="lg" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">En attente d'approbation</Heading>
          <Badge bg="var(--cc-gold)" color="white" fontSize="sm" px="3" py="1" borderRadius="full">{pendingUsers.length}</Badge>
        </Flex>

        {pendingUsers.length === 0 ? (
          <Box p="8" textAlign="center" border="1px dashed var(--cc-line)" borderRadius="var(--cc-radius-md)">
            <Text color="var(--cc-cocoa)" opacity="0.5">Aucun acteur en attente.</Text>
          </Box>
        ) : (
          <Stack gap="4">
            {pendingUsers.map(u => (
              <Flex key={u.id} p="5" borderRadius="var(--cc-radius-md)" justify="space-between" align="center" border="1px solid var(--cc-line)" bg="rgba(250,246,240,0.5)">
                <Stack gap="1">
                  <Flex gap="3" align="center">
                    <Heading size="sm" color="var(--cc-cocoa-deep)">{u.name || 'Sans nom'}</Heading>
                    <Badge fontSize="xs" bg="var(--cc-cocoa-deep)" color="white" borderRadius="sm" px="2">{roleMap[u.role] || u.role}</Badge>
                  </Flex>
                  <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.8">Contact: {u.phone || u.email || 'N/A'}</Text>
                  <Text fontSize="xs" color="var(--cc-cocoa)" opacity="0.6">Inscrit le {new Date(u.createdAt).toLocaleDateString()}</Text>
                </Stack>
                <Flex gap="2">
                  <Button 
                    onClick={() => handleReject(u.id)} 
                    loading={loadingId === u.id}
                    variant="outline"
                    colorScheme="red"
                    _hover={{ bg: 'red.50' }}
                  >
                    Refuser
                  </Button>
                  <Button 
                    onClick={() => handleApprove(u.id)} 
                    loading={loadingId === u.id}
                    bg="linear-gradient(135deg, var(--cc-olive), #205c41)" 
                    color="white" 
                    _hover={{ transform: 'translateY(-1px)', boxShadow: 'var(--cc-shadow-md)' }}
                  >
                    Approuver & Activer
                  </Button>
                </Flex>
              </Flex>
            ))}
          </Stack>
        )}
      </Box>

    </Stack>
  )
}
