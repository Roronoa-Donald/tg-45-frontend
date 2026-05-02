import { Box, Button, Heading, Stack, Text } from '@chakra-ui/react'

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <Box className="cc-surface" borderRadius="2xl" p="6" textAlign="center">
      <Stack gap="3" align="center">
        <Heading size="md">{title}</Heading>
        <Text color="fg.muted">{description}</Text>
        {actionLabel ? (
          <Button colorPalette="olive" onClick={onAction} size="lg">
            {actionLabel}
          </Button>
        ) : null}
      </Stack>
    </Box>
  )
}
