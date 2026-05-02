import { Button, Flex, Text } from '@chakra-ui/react'
import { useSync } from '../hooks/useSync'
import { StatusPill } from './StatusPill'

export function SyncBanner() {
  const { isOnline, queueLength, failedCount, syncStatus, retryFailed, lastSyncedAt } = useSync()

  return (
    <Flex
      align="center"
      justify="space-between"
      gap="3"
      wrap="wrap"
      className="cc-surface"
      borderRadius="xl"
      px="4"
      py="3"
    >
      <Flex align="center" gap="3" wrap="wrap">
        <StatusPill value={isOnline ? 'online' : 'offline'} />
        <Text fontSize="sm">{queueLength} élément(s) en file</Text>
        {failedCount > 0 ? <Text fontSize="sm">{failedCount} en erreur</Text> : null}
        {lastSyncedAt ? <Text fontSize="sm">Dernière synchro: {new Date(lastSyncedAt).toLocaleTimeString('fr-FR')}</Text> : null}
      </Flex>
      {failedCount > 0 ? (
        <Button size="sm" variant="outline" colorPalette="olive" onClick={retryFailed}>
          Réessayer
        </Button>
      ) : (
        <StatusPill value={syncStatus} label={syncStatus === 'syncing' ? 'Synchronisation...' : 'Synchronisation'} />
      )}
    </Flex>
  )
}
