import { Box, Flex, Heading, SimpleGrid, Stack, Text, Tabs } from '@chakra-ui/react'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../context/ToastContext'
import { StatusPill } from '../../components/StatusPill'
import { Shield, Users, Activity, MapPin, Clock, User } from 'lucide-react'
import { fetchLogs, createUser, listUsers } from '../../lib/api'

// ─── Helper: format action labels ───
function formatAction(action: string) {
  const labels: Record<string, string> = {
    verify_status: 'Changement de statut',
    certify_lot: 'Certification',
    register_lot: 'Enregistrement',
    upload_image: 'Upload image',
    transfer_lot: 'Transfert',
    create_user: 'Création utilisateur',
  }
  return labels[action] || action
}

// ─── Helper: render metadata as pretty tags ───
function MetaTags({ details }: { details: Record<string, unknown> | null }) {
  if (!details || Object.keys(details).length === 0) {
    return <Text fontSize="xs" color="var(--cc-cocoa)" opacity="0.4">—</Text>
  }

  return (
    <Flex gap="2" wrap="wrap">
      {Object.entries(details).map(([key, val]) => {
        if (key === 'gps' && val && typeof val === 'object') {
          const gps = val as { lat?: number; lng?: number }
          return (
            <span key={key} className="cc-admin-meta-tag">
              <MapPin size={11} /> {gps.lat?.toFixed(4)}, {gps.lng?.toFixed(4)}
            </span>
          )
        }
        if (key === 'status') {
          return <StatusPill key={key} value={String(val)} />
        }
        if (key === 'reason' && val) {
          return <span key={key} className="cc-admin-meta-tag">{String(val)}</span>
        }
        if (key === 'imageId' || key === 'requestId') {
          return null // skip noisy IDs
        }
        return (
          <span key={key} className="cc-admin-meta-tag">
            {key}: {String(val)}
          </span>
        )
      })}
    </Flex>
  )
}

// ─── Helper: role badge ───
function RoleBadge({ role }: { role: string }) {
  return <span className={`cc-admin-badge cc-admin-badge--${role}`}>{role}</span>
}

export function AdminWorkspacePage() {
  const { user, token } = useAuth()
  const { showToast } = useToast()
  
  // Logs state
  const [logs, setLogs] = useState<any[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [logFilters, setLogFilters] = useState({ date: '', search: '', role: '' })

  // Users state
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  // User form state
  const [userForm, setUserForm] = useState({ email: '', password: '', role: 'cooperative', name: '' })
  const [creatingUser, setCreatingUser] = useState(false)

  const loadLogs = useCallback(async () => {
    if (!token) return
    setLoadingLogs(true)
    try {
      const data = await fetchLogs(token, logFilters)
      setLogs(Array.isArray(data) ? data : (data as any).items || [])
    } catch {
      showToast('Erreur lors du chargement des logs.', 'error')
    } finally {
      setLoadingLogs(false)
    }
  }, [logFilters, showToast, token])

  const loadUsersList = useCallback(async () => {
    if (!token) return
    setLoadingUsers(true)
    try {
      const data = await listUsers(token)
      setUsers(Array.isArray(data) ? data : [])
    } catch {
      showToast('Erreur lors du chargement des utilisateurs.', 'error')
    } finally {
      setLoadingUsers(false)
    }
  }, [showToast, token])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  useEffect(() => {
    loadUsersList()
  }, [loadUsersList])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setCreatingUser(true)
    try {
      await createUser(token, userForm)
      showToast('Utilisateur créé avec succès.', 'success')
      setUserForm({ email: '', password: '', role: 'cooperative', name: '' })
      await loadUsersList() // Refresh list
    } catch {
      showToast('Erreur lors de la création de l\'utilisateur.', 'error')
    } finally {
      setCreatingUser(false)
    }
  }

  // Stats
  const totalUsers = users.length
  const totalLogs = logs.length
  const roleBreakdown = users.reduce((acc: Record<string, number>, u: any) => {
    acc[u.role] = (acc[u.role] || 0) + 1
    return acc
  }, {})

  return (
    <Stack gap="8" className="cc-admin-danger">
      {/* ─── Header ─── */}
      <Flex justify="space-between" align="flex-end" wrap="wrap" gap="4">
        <Stack gap="2">
          <Text textTransform="uppercase" letterSpacing="0.1em" fontSize="xs" fontWeight="700" color="var(--cc-cocoa)">Administration Globale</Text>
          <Heading size="2xl" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Superviseur</Heading>
          <Text color="var(--cc-cocoa)" opacity="0.7">Gérez les utilisateurs et consultez les logs d'audit métier.</Text>
        </Stack>
        <StatusPill value="online" label={`Admin: ${user?.displayName || 'Administrateur'}`} />
      </Flex>

      {/* ─── Quick Stats ─── */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap="4" className="cc-slide-up">
        <Box className="cc-surface" borderRadius="var(--cc-radius-md)" p="5" textAlign="center">
          <Text fontSize="3xl" fontWeight="800" className="cc-gold-text">{totalUsers}</Text>
          <Text fontSize="xs" fontWeight="600" color="var(--cc-cocoa)" textTransform="uppercase" letterSpacing="0.06em">Utilisateurs</Text>
        </Box>
        <Box className="cc-surface" borderRadius="var(--cc-radius-md)" p="5" textAlign="center">
          <Text fontSize="3xl" fontWeight="800" color="var(--cc-olive)">{totalLogs}</Text>
          <Text fontSize="xs" fontWeight="600" color="var(--cc-cocoa)" textTransform="uppercase" letterSpacing="0.06em">Événements</Text>
        </Box>
        <Box className="cc-surface" borderRadius="var(--cc-radius-md)" p="5" textAlign="center">
          <Text fontSize="3xl" fontWeight="800" color="var(--cc-cocoa-deep)">{roleBreakdown['farmer'] || 0}</Text>
          <Text fontSize="xs" fontWeight="600" color="var(--cc-cocoa)" textTransform="uppercase" letterSpacing="0.06em">Agriculteurs</Text>
        </Box>
        <Box className="cc-surface" borderRadius="var(--cc-radius-md)" p="5" textAlign="center">
          <Text fontSize="3xl" fontWeight="800" color="var(--cc-slate)">{roleBreakdown['cooperative'] || 0}</Text>
          <Text fontSize="xs" fontWeight="600" color="var(--cc-cocoa)" textTransform="uppercase" letterSpacing="0.06em">Coopératives</Text>
        </Box>
      </SimpleGrid>

      <Tabs.Root defaultValue="audit" variant="enclosed">
        <Tabs.List>
          <Tabs.Trigger value="audit"><Activity size={16} style={{ marginRight: '8px' }}/> Audit Métier</Tabs.Trigger>
          <Tabs.Trigger value="users"><Users size={16} style={{ marginRight: '8px' }}/> Utilisateurs ({totalUsers})</Tabs.Trigger>
          <Tabs.Trigger value="create"><Shield size={16} style={{ marginRight: '8px' }}/> Nouvel Utilisateur</Tabs.Trigger>
        </Tabs.List>

          {/* ═══ Tab 1: Audit ═══ */}
          <Tabs.Content value="audit" pt="6" px="0">
            <Stack gap="6">
              {/* Filters */}
              <Box className="cc-surface" borderRadius="var(--cc-radius-lg)" p="5">
                <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
                  <Stack gap="1">
                    <Text fontSize="xs" fontWeight="700" color="var(--cc-cocoa)" textTransform="uppercase" letterSpacing="0.06em">Date</Text>
                    <input 
                      className="cc-input" 
                      type="date" 
                      value={logFilters.date} 
                      onChange={(e) => setLogFilters({ ...logFilters, date: e.target.value })} 
                    />
                  </Stack>
                  <Stack gap="1">
                    <Text fontSize="xs" fontWeight="700" color="var(--cc-cocoa)" textTransform="uppercase" letterSpacing="0.06em">Nom / Email</Text>
                    <input 
                      className="cc-input" 
                      placeholder="Rechercher un acteur…" 
                      value={logFilters.search} 
                      onChange={(e) => setLogFilters({ ...logFilters, search: e.target.value })} 
                    />
                  </Stack>
                  <Stack gap="1">
                    <Text fontSize="xs" fontWeight="700" color="var(--cc-cocoa)" textTransform="uppercase" letterSpacing="0.06em">Rôle</Text>
                    <select 
                      className="cc-input" 
                      value={logFilters.role} 
                      onChange={(e) => setLogFilters({ ...logFilters, role: e.target.value })}
                    >
                      <option value="">Tous les rôles</option>
                      <option value="farmer">Agriculteur</option>
                      <option value="cooperative">Coopérative</option>
                      <option value="verifier">Vérificateur</option>
                      <option value="exporter">Exportateur</option>
                      <option value="admin">Admin</option>
                    </select>
                  </Stack>
                </SimpleGrid>
              </Box>

              {/* Logs List */}
              <Stack gap="3">
                {loadingLogs ? (
                  <Box p="8" textAlign="center">
                    <span className="cc-gps-spinner">Chargement des logs…</span>
                  </Box>
                ) : logs.length === 0 ? (
                  <Box p="8" textAlign="center" border="1px dashed var(--cc-line)" borderRadius="var(--cc-radius-md)">
                    <Text color="var(--cc-cocoa)" opacity="0.5">Aucun log trouvé pour ces filtres.</Text>
                  </Box>
                ) : (
                  logs.map((log) => (
                    <Box key={log.id} className="cc-surface cc-admin-log-row" borderRadius="var(--cc-radius-sm)" p="4">
                      <Flex align="flex-start" gap="4" wrap="wrap">
                        {/* Left: Action + Actor */}
                        <Stack gap="1" flex="1" minW="220px">
                          <Flex gap="2" align="center" wrap="wrap">
                            <Text fontWeight="700" fontSize="sm" color="var(--cc-cocoa-deep)">{formatAction(log.action)}</Text>
                            {log.actor?.role && <RoleBadge role={log.actor.role} />}
                          </Flex>
                          <Flex gap="1" align="center">
                            <User size={12} color="var(--cc-cocoa)" opacity={0.6} />
                            <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.8">
                              {log.actor?.name || 'Inconnu'} · {log.actor?.email || '—'}
                            </Text>
                          </Flex>
                        </Stack>

                        {/* Center: Target + Metadata */}
                        <Stack gap="1" flex="1" minW="200px">
                          <Text fontSize="xs" color="var(--cc-cocoa)" opacity="0.6">
                            Cible: <strong>{log.targetType}</strong>
                          </Text>
                          <MetaTags details={log.details} />
                        </Stack>

                        {/* Right: Timestamp */}
                        <Flex align="center" gap="1" minW="160px" justify="flex-end">
                          <Clock size={12} color="var(--cc-cocoa)" opacity={0.5} />
                          <Text fontSize="sm" color="var(--cc-cocoa)" fontWeight="600">
                            {new Date(log.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </Flex>
                      </Flex>
                    </Box>
                  ))
                )}
              </Stack>
            </Stack>
          </Tabs.Content>

          {/* ═══ Tab 2: Users List ═══ */}
          <Tabs.Content value="users" pt="6" px="0">
            <Box className="cc-surface" borderRadius="var(--cc-radius-lg)" overflow="hidden">
              {loadingUsers ? (
                <Box p="8" textAlign="center">
                  <span className="cc-gps-spinner">Chargement…</span>
                </Box>
              ) : (
                <Box overflowX="auto">
                  <table className="cc-table">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>Statut</th>
                        <th>Créé le</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>
                            Aucun utilisateur trouvé
                          </td>
                        </tr>
                      ) : (
                        users.map((u: any) => (
                          <tr key={u.id}>
                            <td>
                              <Text fontWeight="600" color="var(--cc-cocoa-deep)">{u.name || '—'}</Text>
                            </td>
                            <td>
                              <Text fontSize="sm" color="var(--cc-cocoa)">{u.email || u.phone || '—'}</Text>
                            </td>
                            <td><RoleBadge role={u.role} /></td>
                            <td>
                              <StatusPill value={u.status === 'active' ? 'validated' : 'rejected'} label={u.status} />
                            </td>
                            <td>
                              <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.7">
                                {new Date(u.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </Text>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </Box>
              )}
            </Box>
          </Tabs.Content>

          {/* ═══ Tab 3: Create User ═══ */}
          <Tabs.Content value="create" pt="6" px="0">
            <Box className="cc-surface" borderRadius="var(--cc-radius-lg)" p={{ base: '6', md: '8' }} maxW="xl">
              <form onSubmit={handleCreateUser}>
                <Stack gap="5">
                  <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif" display="flex" alignItems="center" gap="2">
                    <Shield size={20} /> Nouvel Utilisateur
                  </Heading>

                  <Stack gap="1">
                    <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">Nom complet</Text>
                    <input className="cc-input" required value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} placeholder="Ex: Jean Dupont" />
                  </Stack>

                  <Stack gap="1">
                    <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">Adresse Email</Text>
                    <input className="cc-input" type="email" required value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} placeholder="email@exemple.com" />
                  </Stack>

                  <Stack gap="1">
                    <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">Mot de passe</Text>
                    <input className="cc-input" type="password" required minLength={6} value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} placeholder="••••••" />
                  </Stack>

                  <Stack gap="1">
                    <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">Rôle</Text>
                    <select className="cc-input" value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                      <option value="cooperative">Coopérative</option>
                      <option value="verifier">Vérificateur</option>
                      <option value="exporter">Exportateur</option>
                      <option value="farmer">Agriculteur</option>
                    </select>
                  </Stack>

                  <button type="submit" className="cc-btn-gold" disabled={creatingUser}>
                    {creatingUser ? 'Création en cours...' : 'Créer l\'utilisateur'}
                  </button>
                  <Text fontSize="xs" color="var(--cc-cocoa)" opacity="0.6" textAlign="center">
                    Note : Aucun email ne sera envoyé automatiquement. Transmettez les identifiants manuellement.
                  </Text>
                </Stack>
              </form>
            </Box>
          </Tabs.Content>
      </Tabs.Root>
    </Stack>
  )
}
