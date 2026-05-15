import { Box, Button, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../context/ToastContext'
import { loadActiveExporters, exportLots, listDueDiligence } from '../../lib/api'
import { LotCard } from '../../components/LotCard'
import type { LotRecord } from '../../domain/types'

type ExporterRecord = {
  id: string
  name?: string
  email?: string
}

type DdrRecord = {
  id: string
  status: string
  createdAt: string
  lot?: { id: string; lotCode?: string }
}

export function CooperativeExportTab({ certifiedLots, refreshLots }: { certifiedLots: LotRecord[]; refreshLots: () => void }) {
  const { token, user } = useAuth()
  const { showToast } = useToast()
  const [exporters, setExporters] = useState<ExporterRecord[]>([])
  const [ddrs, setDdrs] = useState<DdrRecord[]>([])
  const [selectedExporterId, setSelectedExporterId] = useState('')
  const [selectedLots, setSelectedLots] = useState<Record<string, boolean>>({})
  const [lotWeights, setLotWeights] = useState<Record<string, number>>({})
  const [ddId, setDdId] = useState('')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (!token) return
    loadActiveExporters(token)
      .then((data) => setExporters(data as ExporterRecord[]))
      .catch(() => showToast('Erreur lors du chargement des exportateurs', 'error'))

    if (user?.cooperativeId) {
      listDueDiligence(token, { cooperativeId: user.cooperativeId, status: 'approved' })
        .then((response) => setDdrs((response.items || []) as DdrRecord[]))
        .catch(() => showToast('Erreur lors du chargement des DDR', 'error'))
    }
  }, [token, user?.cooperativeId, showToast])

  const handleLotSelect = (lotId: string, isSelected: boolean, defaultWeight: number) => {
    setSelectedLots(prev => ({ ...prev, [lotId]: isSelected }))
    if (isSelected && !lotWeights[lotId]) {
      setLotWeights(prev => ({ ...prev, [lotId]: defaultWeight }))
    }
  }

  const handleWeightChange = (lotId: string, weight: number) => {
    setLotWeights(prev => ({ ...prev, [lotId]: weight }))
  }

  const eligibleLots = certifiedLots.filter((lot) => ['approved', 'submitted'].includes(String(lot.eudrStatus || '')))

  const handleExport = async () => {
    if (!selectedExporterId) return showToast("Veuillez sélectionner un exportateur", 'warning')
    
    const lotsToExport = Object.entries(selectedLots)
      .filter(([, isSelected]) => isSelected)
      .map(([lotId]) => ({
        id: lotId,
        weightKg: lotWeights[lotId]
      }))

    if (lotsToExport.length === 0) return showToast("Veuillez sélectionner au moins un lot", 'warning')
    
    if (!token || !user?.cooperativeId) return

    setExporting(true)
    try {
      await exportLots(token, user.cooperativeId, selectedExporterId, lotsToExport, ddId || undefined)
      showToast('Exportation réussie !', 'success')
      setSelectedLots({})
      setSelectedExporterId('')
      setDdId('')
      refreshLots()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'exportation"
      showToast(message, 'error')
    } finally {
      setExporting(false)
    }
  }

  const totalSelectedLots = Object.values(selectedLots).filter(Boolean).length
  const totalWeight = Object.entries(selectedLots)
    .filter(([, isSelected]) => isSelected)
    .reduce((sum, [lotId]) => sum + (lotWeights[lotId] || 0), 0)

  return (
    <Flex gap="6" direction={{ base: 'column', lg: 'row' }}>
      <Stack flex="2" gap="4">
        <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Lots disponibles pour l'exportation</Heading>
        
        {eligibleLots.length === 0 ? (
          <Box p="8" textAlign="center" border="1px dashed var(--cc-line)" borderRadius="var(--cc-radius-md)">
            <Text color="var(--cc-cocoa)" opacity="0.5">Aucun lot certifié EUDR approuvé.</Text>
          </Box>
        ) : null}

        {eligibleLots.map((lot) => (
          <Flex key={lot.id} className="cc-surface" p="4" borderRadius="var(--cc-radius-md)" gap="4" align="center" border="1px solid var(--cc-line)">
            <input 
              type="checkbox"
              style={{ width: '24px', height: '24px', cursor: 'pointer', accentColor: 'var(--cc-gold)' }}
              checked={selectedLots[lot.id] || false}
              onChange={(e) => handleLotSelect(lot.id, e.target.checked, lot.weightKg ?? 0)}
            />
            <Box flex="1">
              <LotCard lot={lot} detailHref={`/lots/${encodeURIComponent(lot.id)}`} />
            </Box>
            {selectedLots[lot.id] && (
              <Stack gap="1" w="120px">
                <Text fontSize="xs" color="var(--cc-cocoa)" fontWeight="bold">Poids (kg) confirmé</Text>
                <input 
                  type="number" 
                  className="cc-input" 
                  value={lotWeights[lot.id] || ''} 
                  onChange={(e) => handleWeightChange(lot.id, Number(e.target.value))}
                  style={{ padding: '6px', fontSize: '14px' }}
                />
              </Stack>
            )}
          </Flex>
        ))}
      </Stack>

      <Box flex="1" className="cc-surface" p="6" borderRadius="var(--cc-radius-lg)" border="1px solid var(--cc-line)" height="fit-content" position="sticky" top="6">
        <Stack gap="5">
          <Heading size="sm" color="var(--cc-cocoa-deep)">Paramètres d'exportation</Heading>
          
          <Stack gap="2">
            <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">Exportateur destinataire</Text>
            <select 
              className="cc-input" 
              value={selectedExporterId} 
              onChange={(e) => setSelectedExporterId(e.target.value)}
            >
              <option value="">-- Choisir un exportateur --</option>
              {exporters.map(exp => (
                <option key={exp.id} value={exp.id}>{exp.name} ({exp.email})</option>
              ))}
            </select>
          </Stack>

          <Stack gap="2">
            <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">Dossier DDR (optionnel)</Text>
            <select
              className="cc-input"
              value={ddId}
              onChange={(e) => setDdId(e.target.value)}
            >
              <option value="">-- Aucun dossier DDR --</option>
              {ddrs.map(ddr => (
                <option key={ddr.id} value={ddr.id}>
                  DDR-{new Date(ddr.createdAt).toLocaleDateString('fr-FR')} - {ddr.status} - {ddr.lot?.lotCode || ddr.lot?.id || 'Sans lot'}
                </option>
              ))}
            </select>
          </Stack>

          <Box p="4" bg="rgba(250,246,240,0.5)" borderRadius="var(--cc-radius-md)">
            <Flex justify="space-between" mb="2">
              <Text fontSize="sm" color="var(--cc-cocoa)">Lots sélectionnés :</Text>
              <Text fontWeight="bold">{totalSelectedLots}</Text>
            </Flex>
            <Flex justify="space-between">
              <Text fontSize="sm" color="var(--cc-cocoa)">Poids total :</Text>
              <Text fontWeight="bold">{totalWeight.toFixed(2)} kg</Text>
            </Flex>
          </Box>

          <Button 
            onClick={handleExport}
            loading={exporting}
            disabled={totalSelectedLots === 0 || !selectedExporterId}
            bg="linear-gradient(135deg, var(--cc-gold), var(--cc-gold-light))" 
            color="white" 
            size="lg"
            _hover={{ transform: 'translateY(-1px)', boxShadow: 'var(--cc-shadow-gold)' }}
          >
            Confirmer l'exportation
          </Button>
        </Stack>
      </Box>
    </Flex>
  )
}
