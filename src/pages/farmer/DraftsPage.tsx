import React from 'react'
import { Box, Button, Flex, Heading, HStack, Spinner, Stack, Text, VStack } from '@chakra-ui/react'
import { AlertCircle, Loader, Trash2, Upload } from 'lucide-react'
import type { LotDraft, OfflineMutation } from '../../domain/types'
import { useLots } from '../../hooks/useLots'
import { useSync } from '../../hooks/useSync'
import { useToast } from '../../context/ToastContext'

export function DraftsPage() {
  const { draftLots, removeDraft, submitDraft } = useLots()
  const { queue, retrySingleMutation, removeMutation, syncStatus } = useSync()
  const { showToast } = useToast()

  const pendingMutations = queue.filter((m) => m.status === 'pending')
  const failedMutations = queue.filter((m) => m.status === 'failed')

  const handleRetryMutation = async (id: string) => {
    try {
      await retrySingleMutation(id)
      showToast('Enregistrement relancé', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur lors du relancé', 'error')
    }
  }

  const handleRemoveMutation = async (id: string) => {
    try {
      await removeMutation(id)
      showToast('Enregistrement supprimé', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de la suppression', 'error')
    }
  }

  const handleSubmitDraft = async (draft: LotDraft) => {
    try {
      await submitDraft(draft)
      showToast('Brouillon enregistré et mis en file', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement', 'error')
    }
  }

  const handleRemoveDraft = async (draft: LotDraft) => {
    try {
      await removeDraft(draft.id)
      showToast('Brouillon supprimé', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de la suppression', 'error')
    }
  }

  return (
    <VStack gap={8} p={6} maxW="1200px" mx="auto">
      <Heading as="h1" size="lg">
        Enregistrements locaux
      </Heading>

      {/* Brouillons Section */}
      <Box width="100%">
        <Heading as="h2" size="md" mb={4}>
          Brouillons ({draftLots.length})
        </Heading>
        {draftLots.length === 0 ? (
          <Box py={8} textAlign="center">
            <Text color="gray.500">Aucun brouillon</Text>
          </Box>
        ) : (
          <Stack gap={3}>
            {draftLots.map((draft) => (
              <DraftCard key={draft.id} draft={draft} onSubmit={handleSubmitDraft} onDelete={handleRemoveDraft} />
            ))}
          </Stack>
        )}
      </Box>

      {/* En file Section */}
      <Box width="100%">
        <Heading as="h2" size="md" mb={4}>
          En file ({pendingMutations.length})
        </Heading>
        {pendingMutations.length === 0 ? (
          <Box py={8} textAlign="center">
            <Text color="gray.500">Aucun enregistrement en file</Text>
          </Box>
        ) : (
          <Stack gap={3}>
            {pendingMutations.map((mutation) => (
              <MutationCard
                key={mutation.id}
                mutation={mutation}
                syncStatus={syncStatus}
                onRetry={handleRetryMutation}
                onRemove={handleRemoveMutation}
              />
            ))}
          </Stack>
        )}
      </Box>

      {/* Échoués Section */}
      <Box width="100%">
        <Heading as="h2" size="md" mb={4}>
          Échoués ({failedMutations.length})
        </Heading>
        {failedMutations.length === 0 ? (
          <Box py={8} textAlign="center">
            <Text color="gray.500">Aucun enregistrement échoué</Text>
          </Box>
        ) : (
          <Stack gap={3}>
            {failedMutations.map((mutation) => (
              <FailedMutationCard
                key={mutation.id}
                mutation={mutation}
                syncStatus={syncStatus}
                onRetry={handleRetryMutation}
                onRemove={handleRemoveMutation}
              />
            ))}
          </Stack>
        )}
      </Box>
    </VStack>
  )
}

interface DraftCardProps {
  draft: LotDraft
  onSubmit: (draft: LotDraft) => Promise<void>
  onDelete: (draft: LotDraft) => Promise<void>
}

function DraftCard({ draft, onSubmit, onDelete }: DraftCardProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit(draft)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(draft)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Box borderWidth={1} borderRadius="lg" p={4} borderColor="gray.200" _hover={{ borderColor: 'gray.300' }}>
      <Flex justify="space-between" align="flex-start" mb={3}>
        <VStack align="flex-start" gap={1}>
          <Text fontWeight="bold">Lot - {draft.title || 'Sans titre'}</Text>
          <Text fontSize="sm" color="gray.600">
            Poids: {draft.weightKg} kg | Produit: {draft.product}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {new Date(draft.createdAt).toLocaleString('fr-FR')}
          </Text>
        </VStack>
        <HStack gap={2}>
          <Button
            size="sm"
            colorPalette="green"
            loading={isSubmitting}
            onClick={handleSubmit}
          >
            <Upload size={16} />
            Enregistrer
          </Button>
          <Button
            size="sm"
            colorPalette="red"
            variant="ghost"
            loading={isDeleting}
            onClick={handleDelete}
          >
            <Trash2 size={16} />
          </Button>
        </HStack>
      </Flex>
      {draft.notes && (
        <Text fontSize="xs" color="gray.600" mt={2}>
          Notes: {draft.notes}
        </Text>
      )}
    </Box>
  )
}

interface MutationCardProps {
  mutation: OfflineMutation
  syncStatus: string
  onRetry: (id: string) => Promise<void>
  onRemove: (id: string) => Promise<void>
}

function MutationCard({ mutation, syncStatus, onRetry, onRemove }: MutationCardProps) {
  const [isRetrying, setIsRetrying] = React.useState(false)
  const [isRemoving, setIsRemoving] = React.useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await onRetry(mutation.id)
    } finally {
      setIsRetrying(false)
    }
  }

  const handleRemove = async () => {
    setIsRemoving(true)
    try {
      await onRemove(mutation.id)
    } finally {
      setIsRemoving(false)
    }
  }

  const isProcessing = syncStatus === 'syncing'

  return (
    <Box borderWidth={1} borderRadius="lg" p={4} borderColor="blue.200" bg="blue.50" _hover={{ borderColor: 'blue.300' }}>
      <Flex justify="space-between" align="flex-start" mb={3}>
        <VStack align="flex-start" gap={1}>
          <HStack>
            <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
            <Text fontWeight="bold">
              {mutation.type === 'registerLot' ? 'Enregistrement lot' : mutation.type}
            </Text>
          </HStack>
          <Text fontSize="sm" color="gray.600">
            Tentatives: {mutation.attempts} • {new Date(mutation.createdAt).toLocaleString('fr-FR')}
          </Text>
        </VStack>
        <HStack gap={2}>
          {isProcessing ? (
            <Spinner size="sm" />
          ) : (
            <>
              <Button
                size="sm"
                colorPalette="blue"
                variant="outline"
                loading={isRetrying}
                onClick={handleRetry}
              >
                Relancer
              </Button>
              <Button
                size="sm"
                colorPalette="red"
                variant="ghost"
                loading={isRemoving}
                onClick={handleRemove}
              >
                <Trash2 size={16} />
              </Button>
            </>
          )}
        </HStack>
      </Flex>
      <Box fontSize="xs" color="gray.600" p={2} bg="white" borderRadius="md">
        <Text>Clé: {mutation.idempotencyKey.slice(0, 8)}...</Text>
      </Box>
    </Box>
  )
}

interface FailedMutationCardProps {
  mutation: OfflineMutation
  syncStatus: string
  onRetry: (id: string) => Promise<void>
  onRemove: (id: string) => Promise<void>
}

function FailedMutationCard({ mutation, syncStatus, onRetry, onRemove }: FailedMutationCardProps) {
  const [isRetrying, setIsRetrying] = React.useState(false)
  const [isRemoving, setIsRemoving] = React.useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await onRetry(mutation.id)
    } finally {
      setIsRetrying(false)
    }
  }

  const handleRemove = async () => {
    setIsRemoving(true)
    try {
      await onRemove(mutation.id)
    } finally {
      setIsRemoving(false)
    }
  }

  const isProcessing = syncStatus === 'syncing'

  return (
    <Box borderWidth={1} borderRadius="lg" p={4} borderColor="red.200" bg="red.50" _hover={{ borderColor: 'red.300' }}>
      <Flex justify="space-between" align="flex-start" mb={3}>
        <VStack align="flex-start" gap={1}>
          <HStack>
            <AlertCircle size={16} color="red" />
            <Text fontWeight="bold" color="red.700">
              {mutation.type === 'registerLot' ? 'Enregistrement lot' : mutation.type}
            </Text>
          </HStack>
          <Text fontSize="sm" color="gray.600">
            Tentatives: {mutation.attempts} • {new Date(mutation.createdAt).toLocaleString('fr-FR')}
          </Text>
          {mutation.lastError && (
            <Text fontSize="xs" color="red.600" fontWeight="500">
              {mutation.lastError}
            </Text>
          )}
        </VStack>
        <HStack gap={2}>
          {isProcessing ? (
            <Spinner size="sm" />
          ) : (
            <>
              <Button
                size="sm"
                colorPalette="orange"
                loading={isRetrying}
                onClick={handleRetry}
              >
                <Upload size={16} />
                Relancer
              </Button>
              <Button
                size="sm"
                colorPalette="red"
                variant="ghost"
                loading={isRemoving}
                onClick={handleRemove}
              >
                <Trash2 size={16} />
              </Button>
            </>
          )}
        </HStack>
      </Flex>
      <Box fontSize="xs" color="gray.600" p={2} bg="white" borderRadius="md">
        <Text>Clé: {mutation.idempotencyKey.slice(0, 8)}...</Text>
      </Box>
    </Box>
  )
}
