import { Box, Button, Heading, Input, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import {
  addDdrDocument,
  approveDdr,
  createDeforestationCheck,
  createDdr,
  createLegalityCheck,
  generateDeclaration,
  getDdr,
  submitDeclaration,
  updateDdr,
} from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'
import { useLots } from '../../hooks/useLots'
import { StatusPill } from '../../components/StatusPill'
import type { EudrDueDiligence } from '../../domain/types'

const toIsoDateTime = (value: string) => {
  if (!value) {
    return undefined
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

export function ComplianceWorkspacePage() {
  const { token } = useAuth()
  const { loadLot } = useLots()
  const [lotQuery, setLotQuery] = useState('')
  const [lot, setLot] = useState<Awaited<ReturnType<typeof loadLot>> | null>(null)
  const [ddr, setDdr] = useState<EudrDueDiligence | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const [docForm, setDocForm] = useState({ docType: '', url: '', issuedAt: '' })
  const [deforestationForm, setDeforestationForm] = useState({ parcelId: '', source: 'manual', checkDate: '', result: 'unknown' })
  const [legalityForm, setLegalityForm] = useState({ checkType: '', status: 'unknown' })
  const [declarationRef, setDeclarationRef] = useState('')

  const refreshDdr = async (ddId: string) => {
    if (!token) {
      return
    }
    const response = await getDdr(token, ddId)
    setDdr(response as unknown as EudrDueDiligence)
  }

  const handleSearch = async () => {
    if (!lotQuery.trim()) {
      return
    }
    const nextLot = await loadLot(lotQuery.trim())
    setLot(nextLot)
    if (nextLot?.eudrDueDiligence?.id && token) {
      await refreshDdr(nextLot.eudrDueDiligence.id)
    } else {
      setDdr(null)
    }
  }

  const handleCreateDdr = async () => {
    if (!token || !lot) {
      return
    }
    setIsBusy(true)
    try {
      const created = await createDdr(token, { lotId: lot.id })
      await refreshDdr(String((created as unknown as EudrDueDiligence).id))
    } finally {
      setIsBusy(false)
    }
  }

  const handleUpdateDdr = async () => {
    if (!token || !ddr) {
      return
    }
    setIsBusy(true)
    try {
      const updated = await updateDdr(token, ddr.id, {
        riskLevel: ddr.riskLevel,
        assessmentSummary: ddr.assessmentSummary,
        mitigationSummary: ddr.mitigationSummary,
      })
      setDdr(updated as unknown as EudrDueDiligence)
    } finally {
      setIsBusy(false)
    }
  }

  const handleApprove = async (approved: boolean) => {
    if (!token || !ddr) {
      return
    }
    setIsBusy(true)
    try {
      await approveDdr(token, ddr.id, { approved })
      await refreshDdr(ddr.id)
    } finally {
      setIsBusy(false)
    }
  }

  const handleAddDocument = async () => {
    if (!token || !ddr) {
      return
    }
    await addDdrDocument(token, ddr.id, {
      ...docForm,
      issuedAt: toIsoDateTime(docForm.issuedAt),
    })
    await refreshDdr(ddr.id)
    setDocForm({ docType: '', url: '', issuedAt: '' })
  }

  const handleDeforestationCheck = async () => {
    if (!token) {
      return
    }
    await createDeforestationCheck(token, {
      ...deforestationForm,
      checkDate: toIsoDateTime(deforestationForm.checkDate) || new Date().toISOString(),
    })
    setDeforestationForm({ parcelId: '', source: 'manual', checkDate: '', result: 'unknown' })
  }

  const handleLegalityCheck = async () => {
    if (!token || !ddr) {
      return
    }
    await createLegalityCheck(token, {
      ddId: ddr.id,
      ...legalityForm,
    })
    await refreshDdr(ddr.id)
    setLegalityForm({ checkType: '', status: 'unknown' })
  }

  const handleGenerateDeclaration = async () => {
    if (!token || !ddr) {
      return
    }
    await generateDeclaration(token, ddr.id)
    await refreshDdr(ddr.id)
  }

  const handleSubmitDeclaration = async () => {
    if (!token || !ddr || !declarationRef.trim()) {
      return
    }
    await submitDeclaration(token, ddr.id, declarationRef.trim())
    await refreshDdr(ddr.id)
    setDeclarationRef('')
  }

  return (
    <Stack gap="8">
      <Stack gap="2">
        <Text textTransform="uppercase" letterSpacing="0.1em" fontSize="xs" fontWeight="700" color="var(--cc-gold)">EUDR</Text>
        <Heading size="2xl" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Conformité EUDR</Heading>
        <Text color="var(--cc-cocoa)" opacity="0.7">Supervision des dossiers, vérifications et soumissions.</Text>
        <StatusPill value="in_review" label="Centre de contrôle" />
      </Stack>

      <Stack className="cc-surface" borderRadius="var(--cc-radius-lg)" p="6" gap="4">
        <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Rechercher un lot</Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
          <Input placeholder="LOT-2026-001" value={lotQuery} onChange={(event) => setLotQuery(event.target.value)} />
          <Button className="cc-btn-gold" onClick={handleSearch}>Charger</Button>
        </SimpleGrid>
        {lot ? (
          <Stack gap="1">
            <Text fontWeight="600" color="var(--cc-cocoa-deep)">{lot.lotCode || lot.id}</Text>
            <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.7">EUDR: {lot.eudrStatus || 'non démarré'}</Text>
          </Stack>
        ) : null}
      </Stack>

      <Stack className="cc-surface" borderRadius="var(--cc-radius-lg)" p="6" gap="4">
        <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Dossier DDR</Heading>
        {!ddr ? (
          <Button className="cc-btn-gold" onClick={handleCreateDdr} loading={isBusy}>Créer le DDR</Button>
        ) : (
          <Stack gap="4">
            <Text fontSize="sm" color="var(--cc-cocoa)">DDR ID: {ddr.id}</Text>
            <StatusPill value={ddr.status} label={`Statut: ${ddr.status}`} />
            <SimpleGrid columns={{ base: 1, md: 3 }} gap="3">
              <select className="cc-input" value={ddr.riskLevel || ''} onChange={(event) => setDdr((current) => current ? { ...current, riskLevel: event.target.value } : current)}>
                <option value="">Niveau de risque</option>
                <option value="low">Low</option>
                <option value="standard">Standard</option>
                <option value="high">High</option>
              </select>
              <Input placeholder="Résumé évaluation" value={ddr.assessmentSummary || ''} onChange={(event) => setDdr((current) => current ? { ...current, assessmentSummary: event.target.value } : current)} />
              <Input placeholder="Mitigation" value={ddr.mitigationSummary || ''} onChange={(event) => setDdr((current) => current ? { ...current, mitigationSummary: event.target.value } : current)} />
            </SimpleGrid>
            <Button variant="outline" onClick={handleUpdateDdr} loading={isBusy}>Mettre à jour</Button>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
              <Button className="cc-btn-gold" onClick={() => handleApprove(true)} loading={isBusy}>Approuver</Button>
              <Button variant="outline" onClick={() => handleApprove(false)} loading={isBusy}>Rejeter</Button>
            </SimpleGrid>
          </Stack>
        )}
      </Stack>

      <Stack className="cc-surface" borderRadius="var(--cc-radius-lg)" p="6" gap="4">
        <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Documents DDR</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap="3">
          <Input placeholder="Type" value={docForm.docType} onChange={(event) => setDocForm((current) => ({ ...current, docType: event.target.value }))} />
          <Input placeholder="URL" value={docForm.url} onChange={(event) => setDocForm((current) => ({ ...current, url: event.target.value }))} />
          <Input placeholder="Date" type="date" value={docForm.issuedAt} onChange={(event) => setDocForm((current) => ({ ...current, issuedAt: event.target.value }))} />
        </SimpleGrid>
        <Button variant="outline" onClick={handleAddDocument} disabled={!docForm.docType || !docForm.url}>Ajouter document</Button>
      </Stack>

      {ddr ? (
        <Stack className="cc-surface" borderRadius="var(--cc-radius-lg)" p="6" gap="4">
          <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Historique DDR</Heading>
          <Stack gap="3">
            <Text fontWeight="600" color="var(--cc-cocoa)">Documents</Text>
            {ddr.documents?.length ? (
              ddr.documents.map((doc) => (
                <Box key={doc.id} className="cc-surface" p="4" borderRadius="var(--cc-radius-sm)">
                  <Text fontWeight="700" color="var(--cc-cocoa-deep)">{doc.docType}</Text>
                  <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.7">{doc.url}</Text>
                </Box>
              ))
            ) : (
              <Text color="var(--cc-cocoa)" opacity="0.6">Aucun document enregistré.</Text>
            )}
          </Stack>
          <Stack gap="3">
            <Text fontWeight="600" color="var(--cc-cocoa)">Checks légalité</Text>
            {ddr.legalityChecks?.length ? (
              ddr.legalityChecks.map((check) => (
                <Box key={check.id} className="cc-surface" p="4" borderRadius="var(--cc-radius-sm)">
                  <Text fontWeight="700" color="var(--cc-cocoa-deep)">{check.checkType}</Text>
                  <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.7">Statut: {check.status}</Text>
                </Box>
              ))
            ) : (
              <Text color="var(--cc-cocoa)" opacity="0.6">Aucun check de légalité.</Text>
            )}
          </Stack>
          <Stack gap="3">
            <Text fontWeight="600" color="var(--cc-cocoa)">Déclarations</Text>
            {ddr.declarations?.length ? (
              ddr.declarations.map((declaration) => (
                <Box key={declaration.id} className="cc-surface" p="4" borderRadius="var(--cc-radius-sm)">
                  <Text fontWeight="700" color="var(--cc-cocoa-deep)">Ref: {declaration.referenceNo || 'brouillon'}</Text>
                  <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.7">Statut: {declaration.status || '—'}</Text>
                </Box>
              ))
            ) : (
              <Text color="var(--cc-cocoa)" opacity="0.6">Aucune déclaration générée.</Text>
            )}
          </Stack>
        </Stack>
      ) : null}

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="6">
        <Stack className="cc-surface" borderRadius="var(--cc-radius-lg)" p="6" gap="3">
          <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Check déforestation</Heading>
          <Input placeholder="Parcel ID" value={deforestationForm.parcelId} onChange={(event) => setDeforestationForm((current) => ({ ...current, parcelId: event.target.value }))} />
          <Input placeholder="Source" value={deforestationForm.source} onChange={(event) => setDeforestationForm((current) => ({ ...current, source: event.target.value }))} />
          <Input type="date" value={deforestationForm.checkDate} onChange={(event) => setDeforestationForm((current) => ({ ...current, checkDate: event.target.value }))} />
          <select className="cc-input" value={deforestationForm.result} onChange={(event) => setDeforestationForm((current) => ({ ...current, result: event.target.value }))}>
            <option value="pass">Pass</option>
            <option value="fail">Fail</option>
            <option value="unknown">Unknown</option>
          </select>
          <Button variant="outline" onClick={handleDeforestationCheck}>Ajouter check</Button>
        </Stack>

        <Stack className="cc-surface" borderRadius="var(--cc-radius-lg)" p="6" gap="3">
          <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Check légalité</Heading>
          <Input placeholder="Type de check" value={legalityForm.checkType} onChange={(event) => setLegalityForm((current) => ({ ...current, checkType: event.target.value }))} />
          <select className="cc-input" value={legalityForm.status} onChange={(event) => setLegalityForm((current) => ({ ...current, status: event.target.value }))}>
            <option value="pass">Pass</option>
            <option value="fail">Fail</option>
            <option value="unknown">Unknown</option>
          </select>
          <Button variant="outline" onClick={handleLegalityCheck}>Ajouter check</Button>
        </Stack>
      </SimpleGrid>

      <Stack className="cc-surface" borderRadius="var(--cc-radius-lg)" p="6" gap="3">
        <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Déclaration EUDR</Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
          <Button variant="outline" onClick={handleGenerateDeclaration} disabled={!ddr}>Générer déclaration</Button>
          <Input placeholder="Référence officielle" value={declarationRef} onChange={(event) => setDeclarationRef(event.target.value)} />
        </SimpleGrid>
        <Button className="cc-btn-gold" onClick={handleSubmitDeclaration} disabled={!ddr || !declarationRef.trim()}>Soumettre</Button>
      </Stack>
    </Stack>
  )
}
