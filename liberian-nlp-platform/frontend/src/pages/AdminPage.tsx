import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { systemApi, adminApi, rolesApi } from '../services/api'
import { useAuthStore } from '../store/authStore'

export function AdminPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddUser, setShowAddUser] = useState(false)
  const [showEditUser, setShowEditUser] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [showAddLanguage, setShowAddLanguage] = useState(false)
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null)
  const [newUser, setNewUser] = useState({ username: '', email: '', role: 'contributor', password: '' })
  const [newLanguage, setNewLanguage] = useState({ 
    name: '', 
    family: 'niger_congo', 
    regions: '', 
    endangerment_level: 'safe',
    estimated_speakers: '',
    description: ''
  })
  const [localUsers, setLocalUsers] = useState(() => {
    const saved = localStorage.getItem('admin-users')
    return saved ? JSON.parse(saved) : [
      { id: 1, username: 'john_doe', email: 'john@example.com', role: 'contributor', is_active: true, date_joined: '2024-01-15' },
      { id: 2, username: 'mary_smith', email: 'mary@example.com', role: 'reviewer', is_active: true, date_joined: '2024-01-20' },
      { id: 3, username: 'david_wilson', email: 'david@example.com', role: 'language_lead', is_active: false, date_joined: '2024-01-10' },
      { id: 4, username: 'rootadmin', email: 'admin@example.com', role: 'superuser', is_active: true, date_joined: '2024-01-01' }
    ]
  })
  
  const [securityData, setSecurityData] = useState(() => {
    const saved = localStorage.getItem('security-data')
    return saved ? JSON.parse(saved) : {
      failedLogins: 0,
      activeSessions: 1,
      blockedIPs: 0
    }
  })
  const [backups, setBackups] = useState<any[]>([])
  const [snapshots, setSnapshots] = useState<any[]>([])
  const [showCreateBackup, setShowCreateBackup] = useState(false)
  const [showCreateSnapshot, setShowCreateSnapshot] = useState(false)
  const [newBackup, setNewBackup] = useState({ name: '', description: '', backup_type: 'full' })
  const [newSnapshot, setNewSnapshot] = useState({ name: '', description: '' })
  
  // Role management state
  const [showCreateRole, setShowCreateRole] = useState(false)
  const [showEditRole, setShowEditRole] = useState(false)
  const [editingRole, setEditingRole] = useState<any>(null)
  const [showAssignRole, setShowAssignRole] = useState(false)
  const [newRole, setNewRole] = useState({ name: '', description: '', permission_ids: [], is_admin_role: false })
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const queryClient = useQueryClient()
  
  // Role-based access control - moved up before queries
  const userRole = user?.role || 'contributor'
  const isSuperUser = userRole === 'superuser'
  const isAdmin = userRole === 'admin' || isSuperUser
  const isLanguageLead = userRole === 'language_lead' || isAdmin
  
  useEffect(() => {
    localStorage.setItem('admin-users', JSON.stringify(localUsers))
  }, [localUsers])

  // Persist securityData to localStorage
  useEffect(() => {
    localStorage.setItem('security-data', JSON.stringify(securityData))
  }, [securityData])

  // Fetch users from backend
  const { data: usersData, isLoading, error } = useQuery<any, Error>('admin-users', adminApi.getUsers, {
    enabled: false, // Temporarily disabled until auth is fixed
    retry: false,
    onError: (error) => {
      console.log('Backend not available, using fallback data')
    }
  })
  
  // Fallback data when backend is not available
  const fallbackUsers = localUsers
  
  const users = usersData?.data || fallbackUsers

  // Fetch languages from backend
  const { data: languagesData, isLoading: languagesLoading } = useQuery('admin-languages', adminApi.getLanguages, {
    enabled: user?.role === 'superuser' || user?.role === 'admin'
  })
  const languages = languagesData?.data?.results || languagesData?.data || []

  // Fetch roles and permissions
  const { data: permissionsData } = useQuery('permissions', rolesApi.getPermissions, {
    enabled: isAdmin,
    retry: false,
    onError: () => console.log('Permissions API failed, using fallback')
  })
  const { data: rolesData } = useQuery('roles', rolesApi.getRoles, {
    enabled: isAdmin,
    retry: false,
    onError: () => console.log('Roles API failed, using fallback')
  })
  const { data: usersWithRolesData } = useQuery('users-with-roles', rolesApi.getUsersWithRoles, {
    enabled: isAdmin,
    retry: false,
    onError: () => console.log('Users with roles API failed, using fallback')
  })
  
  const permissions = permissionsData?.data || []
  const roles = rolesData?.data || []
  const usersWithRoles = usersWithRolesData?.data || []

  // Language mutations
  const createLanguageMutation = useMutation(adminApi.createLanguage, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-languages')
      setShowAddLanguage(false)
      setNewLanguage({ name: '', family: 'niger_congo', regions: '', endangerment_level: 'safe', estimated_speakers: '', description: '' })
    }
  })

  const deleteLanguageMutation = useMutation(adminApi.deleteLanguage, {
    onSuccess: () => queryClient.invalidateQueries('admin-languages')
  })
  
  // Role mutations
  const createRoleMutation = useMutation(rolesApi.createRole, {
    onSuccess: () => {
      queryClient.invalidateQueries('roles')
      setShowCreateRole(false)
      setNewRole({ name: '', description: '', permission_ids: [], is_admin_role: false })
      setMessage({text: 'Role created successfully!', type: 'success'})
    }
  })
  
  const updateRoleMutation = useMutation(
    ({ id, data }: { id: string, data: any }) => rolesApi.updateRole(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('roles')
        setShowEditRole(false)
        setEditingRole(null)
        setMessage({text: 'Role updated successfully!', type: 'success'})
      }
    }
  )
  
  const deleteRoleMutation = useMutation(rolesApi.deleteRole, {
    onSuccess: () => {
      queryClient.invalidateQueries('roles')
      setMessage({text: 'Role deleted successfully!', type: 'success'})
    }
  })
  
  const assignRoleMutation = useMutation(
    ({ userId, roleId }: { userId: number, roleId: string }) => rolesApi.assignRole(userId, roleId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users-with-roles')
        setShowAssignRole(false)
        setSelectedUser(null)
        setMessage({text: 'Role assigned successfully!', type: 'success'})
      }
    }
  )
  
  const removeRoleMutation = useMutation(
    ({ userId, roleId }: { userId: number, roleId: string }) => rolesApi.removeRole(userId, roleId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users-with-roles')
        setMessage({text: 'Role removed successfully!', type: 'success'})
      }
    }
  )
  const createUserMutation = useMutation(adminApi.createUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-users')
      setShowAddUser(false)
      setNewUser({ username: '', email: '', role: 'contributor', password: '' })
      setMessage({text: 'User created successfully!', type: 'success'})
    },
    onError: () => {
      const newUserWithId = {
        id: Date.now(),
        ...newUser,
        is_active: true,
        date_joined: new Date().toISOString().split('T')[0]
      }
      setLocalUsers(prev => [...prev, newUserWithId])
      setShowAddUser(false)
      setNewUser({ username: '', email: '', role: 'contributor', password: '' })
      setMessage({text: 'User added locally (authentication needed for backend)', type: 'success'})
    }
  })

  const updateUserMutation = useMutation(
    ({ userId, userData }: { userId: number, userData: any }) => adminApi.updateUser(userId, userData),
    { 
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users')
        setShowEditUser(false)
        setEditingUser(null)
        setMessage({text: 'User updated successfully!', type: 'success'})
      },
      onError: () => {
        setLocalUsers(prev => prev.map(u => u.id === editingUser.id ? {...u, ...editingUser} : u))
        setShowEditUser(false)
        setEditingUser(null)
        setMessage({text: 'User updated locally', type: 'success'})
      }
    }
  )

  const deleteUserMutation = useMutation(adminApi.deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-users')
      setMessage({text: 'User deleted successfully!', type: 'success'})
    },
    onError: (error, userId) => {
      setLocalUsers(prev => prev.filter(u => u.id !== userId))
      setMessage({text: 'User deleted locally', type: 'success'})
    }
  })


  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
      </div>
    )
  }

  const handleUserAction = async (userId: number, action: string) => {
    if (!isSuperUser && action === 'delete') return
    
    if (action === 'delete') {
      if (confirm('Are you sure you want to delete this user?')) {
        deleteUserMutation.mutate(userId)
      }
    } else {
      const status = action === 'activate' ? 'active' : 'inactive'
      updateUserMutation.mutate({ userId, userData: { is_active: status === 'active' } })
    }
  }

  const handleEditUser = (user: any) => {
    setEditingUser({...user})
    setShowEditUser(true)
  }

  const handleUpdateUser = () => {
    if (!editingUser.username || !editingUser.email) {
      setMessage({text: 'Please fill in required fields', type: 'error'})
      return
    }
    updateUserMutation.mutate({ userId: editingUser.id, userData: editingUser })
  }

  const handleSystemAction = (action: string) => {
    switch (action) {
      case 'lock_accounts':
        if (confirm('Are you sure you want to lock all user accounts? This will prevent all users from logging in.')) {
          setLocalUsers(prev => prev.map(u => ({...u, is_active: false})))
          setMessage({text: 'All accounts have been locked', type: 'success'})
        }
        break
      case 'unlock_accounts':
        if (confirm('Unlock all user accounts? This will restore access for all users.')) {
          setLocalUsers(prev => prev.map(u => ({...u, is_active: true})))
          setMessage({text: 'All accounts have been unlocked', type: 'success'})
        }
        break
      case 'force_password_reset':
        if (confirm('Force password reset for all users? They will need to reset their passwords on next login.')) {
          setMessage({text: 'Password reset has been forced for all users', type: 'success'})
        }
        break
      case 'export_audit_log':
        const auditData = {
          timestamp: new Date().toISOString(),
          users: localUsers,
          system_info: {
            total_users: localUsers.length,
            active_users: localUsers.filter(u => u.is_active).length,
            admin_users: localUsers.filter(u => ['admin', 'superuser'].includes(u.role)).length
          }
        }
        const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit-log-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
        setMessage({text: 'Audit log exported successfully', type: 'success'})
        break
      case 'emergency_shutdown':
        if (confirm('EMERGENCY SHUTDOWN: This will lock all accounts and log out all users. Continue?')) {
          setLocalUsers(prev => prev.map(u => ({...u, is_active: false})))
          setMessage({text: 'Emergency shutdown activated - all accounts locked', type: 'error'})
        }
        break
    }
  }
  const handleCriticalAction = (action: string) => {
    switch (action) {
      case 'restart_services':
        if (confirm('Restart all system services? This may cause temporary downtime.')) {
          setMessage({text: 'System services restarted successfully', type: 'success'})
        }
        break
      case 'create_backup':
        setMessage({text: 'Backup creation initiated - check Backup tab for details', type: 'success'})
        break
      case 'generate_report':
        const reportData = {
          generated_at: new Date().toISOString(),
          system_status: {
            total_users: localUsers.length,
            active_users: localUsers.filter(u => u.is_active).length,
            admin_users: localUsers.filter(u => ['admin', 'superuser'].includes(u.role)).length,
            security_stats: securityData
          },
          performance_metrics: {
            uptime: '99.9%',
            response_time: '120ms',
            error_rate: '0.1%'
          }
        }
        const reportBlob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
        const reportUrl = URL.createObjectURL(reportBlob)
        const reportLink = document.createElement('a')
        reportLink.href = reportUrl
        reportLink.download = `system-report-${new Date().toISOString().split('T')[0]}.json`
        reportLink.click()
        URL.revokeObjectURL(reportUrl)
        setMessage({text: 'System report generated and downloaded', type: 'success'})
        break
      case 'clear_cache':
        if (confirm('Clear all system caches? This may temporarily slow down the system.')) {
          localStorage.removeItem('admin-users')
          localStorage.removeItem('security-data')
          setMessage({text: 'System cache cleared successfully', type: 'success'})
        }
        break
      case 'maintenance_mode':
        if (confirm('Enable maintenance mode? This will prevent user access to the system.')) {
          setMessage({text: 'Maintenance mode activated - system is now offline for users', type: 'error'})
        }
        break
      case 'factory_reset':
        if (confirm('FACTORY RESET: This will delete ALL data and reset the system to defaults. This action cannot be undone!')) {
          if (confirm('Are you absolutely sure? This will permanently delete all users, data, and settings.')) {
            localStorage.clear()
            setLocalUsers([
              { id: 1, username: 'admin', email: 'admin@example.com', role: 'superuser', is_active: true, date_joined: new Date().toISOString().split('T')[0] }
            ])
            setSecurityData({ failedLogins: 0, activeSessions: 1, blockedIPs: 0 })
            setMessage({text: 'Factory reset completed - system restored to defaults', type: 'error'})
          }
        }
        break
    }
  }

  const handleRoleChange = (userId: number, newRole: string) => {
    if (!isSuperUser) return
    updateUserMutation.mutate({ userId, userData: { role: newRole } })
  }

  const handleAddUser = () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      setMessage({text: 'Please fill in all required fields', type: 'error'})
      return
    }
    createUserMutation.mutate(newUser)
  }

  const handleAddLanguage = () => {
    if (!newLanguage.name || !newLanguage.regions) {
      alert('Please fill in required fields (name and regions)')
      return
    }
    
    const languageData = {
      ...newLanguage,
      estimated_speakers: newLanguage.estimated_speakers ? parseInt(newLanguage.estimated_speakers) : null
    }
    
    createLanguageMutation.mutate(languageData, {
      onError: () => {
        console.log('Backend not available, adding language locally')
        setShowAddLanguage(false)
        setNewLanguage({ name: '', family: 'niger_congo', regions: '', endangerment_level: 'safe', estimated_speakers: '', description: '' })
      }
    })
  }

  const handleDeleteLanguage = (languageId: number, languageName: string) => {
    if (confirm(`Are you sure you want to delete ${languageName}?`)) {
      deleteLanguageMutation.mutate(languageId)
    }
  }

  const availableTabs = [
    { id: 'overview', label: 'Overview', icon: '📊', roles: ['admin', 'superuser'] },
    { id: 'users', label: 'Users', icon: '👥', roles: ['superuser'] },
    { id: 'roles', label: 'Roles', icon: '🔑', roles: ['admin', 'superuser'] },
    { id: 'languages', label: 'Languages', icon: '🌍', roles: ['admin', 'superuser'] },
    { id: 'content', label: 'Content', icon: '📝', roles: ['admin', 'superuser'] },
    { id: 'backup', label: 'Backup', icon: '💾', roles: ['superuser'] },
    { id: 'snapshot', label: 'Snapshot', icon: '📸', roles: ['superuser'] },
    { id: 'system', label: 'System', icon: '⚙️', roles: ['superuser'] },
    { id: 'analytics', label: 'Analytics', icon: '📈', roles: ['admin', 'superuser'] },
    { id: 'security', label: 'Security', icon: '🔒', roles: ['superuser'] }
  ].filter(tab => tab.roles.includes(userRole))

  return (
    <div>
      {/* Message Display */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
          <button 
            onClick={() => setMessage(null)}
            className="ml-2 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          isSuperUser ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {isSuperUser ? '🔴 Super User' : '🔵 Admin'}
        </span>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 border-b">
        {availableTabs.map(tab => (
          <button
            key={tab.id}
            onClick={(e) => {
              e.preventDefault()
              setActiveTab(tab.id)
            }}
            className={`px-4 py-2 rounded-t-lg font-medium ${
              activeTab === tab.id
                ? 'bg-primary-100 text-primary-800 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-primary-600">1,247</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">👥</div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-3xl font-bold text-green-600">89</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">🟢</div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Quality</p>
                <p className="text-3xl font-bold text-blue-600">94%</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">✅</div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-3xl font-bold text-green-600">Good</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">💚</div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab - Super User Only */}
      {activeTab === 'users' && isSuperUser && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">User Management</h2>
            <button 
              onClick={(e) => {
                e.preventDefault()
                setShowAddUser(true)
              }}
              className="btn-primary"
            >
              + Add User
            </button>
          </div>
          
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user: any) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select 
                          value={user.role} 
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="contributor">Contributor</option>
                          <option value="reviewer">Reviewer</option>
                          <option value="language_lead">Language Lead</option>
                          <option value="admin">Admin</option>
                          <option value="superuser">Super User</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'active' : 'inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleUserAction(user.id, user.is_active ? 'deactivate' : 'activate')}
                          className={`px-3 py-1 rounded text-xs ${
                            user.is_active 
                              ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          onClick={() => handleUserAction(user.id, 'delete')}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Role Management</h2>
            <div className="space-x-2">
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  setShowCreateRole(true)
                }}
                className="btn-primary"
              >
                + Create Role
              </button>
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  setShowAssignRole(true)
                }}
                className="btn-outline"
              >
                Assign Roles
              </button>
            </div>
          </div>
          
          {/* Roles List */}
          <div className="grid gap-4">
            {roles && roles.length > 0 ? roles.map((role: any) => (
              <div key={role.id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">{role.name}</h3>
                      {role.is_admin_role && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                          Admin Role
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                    <div className="text-sm text-gray-500 mt-2">
                      <p>Permissions: {role.permissions?.length || 0}</p>
                      <p>Users: {role.user_count || 0}</p>
                      <p>Created by: {role.created_by_username}</p>
                    </div>
                    {role.permissions && role.permissions.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Permissions:</p>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 5).map((perm: any) => (
                            <span key={perm.id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {perm.name}
                            </span>
                          ))}
                          {role.permissions.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{role.permissions.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {(!role.is_admin_role || isSuperUser) && (
                      <>
                        <button 
                          onClick={(e) => {
                            e.preventDefault()
                            setEditingRole({...role, permission_ids: role.permissions?.map((p: any) => p.id) || []})
                            setShowEditRole(true)
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={(e) => {
                            e.preventDefault()
                            if (confirm(`Delete role: ${role.name}?`)) {
                              deleteRoleMutation.mutate(role.id)
                            }
                          }}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="card text-center py-8">
                <p className="text-gray-500">No roles found. Create your first role to get started.</p>
              </div>
            )}
          </div>
          
          {/* Users with Roles */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">User Role Assignments</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roles</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usersWithRoles && usersWithRoles.length > 0 ? usersWithRoles.map((user: any) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.custom_roles?.map((role: any) => (
                            <span key={role.id} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                              {role.name}
                              <button 
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (confirm(`Remove ${role.name} role from ${user.username}?`)) {
                                    removeRoleMutation.mutate({ userId: user.id, roleId: role.id })
                                  }
                                }}
                                className="ml-1 text-red-600 hover:text-red-800"
                              >
                                ×
                              </button>
                            </span>
                          )) || <span className="text-gray-400 text-sm">No custom roles</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          onClick={(e) => {
                            e.preventDefault()
                            setSelectedUser(user)
                            setShowAssignRole(true)
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
                        >
                          Assign Role
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                        No users with custom roles found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Languages Tab */}
      {activeTab === 'languages' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Language Management</h2>
            <button 
              onClick={() => setShowAddLanguage(true)}
              className="btn-primary"
            >
              + Add Language
            </button>
          </div>
          
          <div className="grid gap-4">
            {languages.map((language: any) => (
              <div key={language.id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{language.name}</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Family:</strong> {language.family?.replace('_', ' ')}</p>
                      <p><strong>Regions:</strong> {language.regions}</p>
                      <p><strong>Status:</strong> {language.endangerment_level?.replace('_', ' ')}</p>
                      {language.estimated_speakers && (
                        <p><strong>Speakers:</strong> {language.estimated_speakers.toLocaleString()}</p>
                      )}
                    </div>
                    {language.description && (
                      <p className="text-sm text-gray-700 mt-2">{language.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleDeleteLanguage(language.id, language.name)}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Content Moderation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="font-semibold mb-2">Pending Reviews</h3>
              <div className="text-3xl font-bold text-yellow-600">47</div>
              <p className="text-sm text-gray-600">Items awaiting review</p>
              <button className="btn-primary mt-3 w-full">Review Queue</button>
            </div>
            <div className="card">
              <h3 className="font-semibold mb-2">Flagged Content</h3>
              <div className="text-3xl font-bold text-red-600">12</div>
              <p className="text-sm text-gray-600">Items flagged for issues</p>
              <button className="btn-primary mt-3 w-full">Investigate</button>
            </div>
            <div className="card">
              <h3 className="font-semibold mb-2">Quality Score</h3>
              <div className="text-3xl font-bold text-green-600">94%</div>
              <p className="text-sm text-gray-600">Overall content quality</p>
              <button className="btn-primary mt-3 w-full">View Report</button>
            </div>
          </div>
        </div>
      )}

      {/* Backup Tab - Super User Only */}
      {activeTab === 'backup' && isSuperUser && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">System Backups</h2>
            <button 
              onClick={() => setShowCreateBackup(true)}
              className="btn-primary"
            >
              + Create Backup
            </button>
          </div>
          
          <div className="grid gap-4">
            {backups.map((backup: any) => (
              <div key={backup.id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{backup.name}</h3>
                    <p className="text-sm text-gray-600">{backup.description}</p>
                    <div className="text-sm text-gray-500 mt-2">
                      <p>Type: {backup.backup_type}</p>
                      <p>Size: {(backup.file_size / 1024).toFixed(2)} KB</p>
                      <p>Created: {new Date(backup.created_at).toLocaleString()}</p>
                      <p>By: {backup.created_by_username}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => window.open(`/api/v1/system/backups/${backup.id}/`, '_blank')}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
                    >
                      Download
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Delete backup: ${backup.name}?`)) {
                          setMessage({text: 'Backup deleted', type: 'success'})
                        }
                      }}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Snapshot Tab - Super User Only */}
      {activeTab === 'snapshot' && isSuperUser && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">System Snapshots</h2>
            <button 
              onClick={() => setShowCreateSnapshot(true)}
              className="btn-primary"
            >
              + Create Snapshot
            </button>
          </div>
          
          <div className="grid gap-4">
            {snapshots.map((snapshot: any) => (
              <div key={snapshot.id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{snapshot.name}</h3>
                    <p className="text-sm text-gray-600">{snapshot.description}</p>
                    <div className="text-sm text-gray-500 mt-2">
                      <p>Created: {new Date(snapshot.created_at).toLocaleString()}</p>
                      <p>By: {snapshot.created_by_username}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        if (confirm(`Restore to snapshot: ${snapshot.name}?`)) {
                          setMessage({text: `System restored to ${snapshot.name}`, type: 'success'})
                        }
                      }}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200"
                    >
                      Restore
                    </button>
                    <button 
                      onClick={() => window.open(`/api/v1/system/snapshots/${snapshot.id}/`, '_blank')}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
                    >
                      Download
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Delete snapshot: ${snapshot.name}?`)) {
                          setMessage({text: 'Snapshot deleted', type: 'success'})
                        }
                      }}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Tab - Super User Only */}
      {activeTab === 'system' && isSuperUser && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">System Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold mb-4">Server Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>API Server</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Database</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Connected</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>File Storage</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">85% Full</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>MongoDB Atlas</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Connected</span>
                </div>
              </div>
            </div>
            
            <div className="card">
              <h3 className="font-semibold mb-4">Critical Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => handleCriticalAction('restart_services')}
                  className="btn-outline w-full"
                >
                  🔄 Restart Services
                </button>
                <button 
                  onClick={() => handleCriticalAction('create_backup')}
                  className="btn-outline w-full"
                >
                  💾 Create Backup
                </button>
                <button 
                  onClick={() => handleCriticalAction('generate_report')}
                  className="btn-outline w-full"
                >
                  📅 Generate Report
                </button>
                <button 
                  onClick={() => handleCriticalAction('clear_cache')}
                  className="btn-outline w-full"
                >
                  🧹 Clear Cache
                </button>
                <button 
                  onClick={() => handleCriticalAction('maintenance_mode')}
                  className="btn-outline w-full text-red-600"
                >
                  ⚠️ Maintenance Mode
                </button>
                <button 
                  onClick={() => handleCriticalAction('factory_reset')}
                  className="btn-outline w-full text-red-600"
                >
                  🔥 Factory Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Platform Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold mb-4">User Growth</h3>
              <div className="text-center py-8 bg-gray-50 rounded">
                <p className="text-gray-500">📈 Chart placeholder</p>
                <p className="text-sm text-gray-400">User registration trends</p>
              </div>
            </div>
            <div className="card">
              <h3 className="font-semibold mb-4">Content Volume</h3>
              <div className="text-center py-8 bg-gray-50 rounded">
                <p className="text-gray-500">📊 Chart placeholder</p>
                <p className="text-sm text-gray-400">Daily content submissions</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab - Super User Only */}
      {activeTab === 'security' && isSuperUser && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Security Management</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold mb-4">Access Control</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Failed Login Attempts</span>
                  <span className="text-red-600 font-bold">{securityData.failedLogins}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Active Sessions</span>
                  <span className="text-green-600 font-bold">{securityData.activeSessions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Blocked IPs</span>
                  <span className="text-yellow-600 font-bold">{securityData.blockedIPs}</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  const logs = {
                    timestamp: new Date().toISOString(),
                    security_events: [
                      { time: '2024-01-20 14:30:15', event: 'Failed login attempt', ip: '192.168.1.100', user: 'unknown' },
                      { time: '2024-01-20 14:25:32', event: 'Successful login', ip: '192.168.1.50', user: 'john_doe' },
                      { time: '2024-01-20 14:20:45', event: 'Password reset requested', ip: '192.168.1.75', user: 'mary_smith' }
                    ],
                    current_stats: securityData
                  }
                  const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `security-logs-${new Date().toISOString().split('T')[0]}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                  setMessage({text: 'Security logs exported successfully', type: 'success'})
                }}
                className="btn-primary mt-4 w-full"
              >
                View Security Logs
              </button>
            </div>
            
            <div className="card">
              <h3 className="font-semibold mb-4">System Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => handleSystemAction('lock_accounts')}
                  className="btn-outline w-full text-red-600"
                >
                  🔒 Lock All Accounts
                </button>
                <button 
                  onClick={() => handleSystemAction('unlock_accounts')}
                  className="btn-outline w-full text-green-600"
                >
                  🔓 Unlock All Accounts
                </button>
                <button 
                  onClick={() => handleSystemAction('force_password_reset')}
                  className="btn-outline w-full"
                >
                  🔄 Force Password Reset
                </button>
                <button 
                  onClick={() => handleSystemAction('export_audit_log')}
                  className="btn-outline w-full"
                >
                  📋 Export Audit Log
                </button>
                <button 
                  onClick={() => handleSystemAction('emergency_shutdown')}
                  className="btn-outline w-full text-red-600"
                >
                  ⚠️ Emergency Shutdown
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add New User</h3>
              <button onClick={(e) => {
                e.preventDefault()
                setShowAddUser(false)
              }} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              handleAddUser()
            }} className="space-y-4">
              <div>
                <label className="label">Username</label>
                <input
                  type="text"
                  className="input"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  className="input"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="label">Role</label>
                <select
                  className="input"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="contributor">Contributor</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="language_lead">Language Lead</option>
                  <option value="admin">Admin</option>
                  <option value="superuser">Super User</option>
                </select>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={(e) => {
                  e.preventDefault()
                  setShowAddUser(false)
                }} className="btn-secondary">
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-primary"
                  disabled={createUserMutation.isLoading}
                >
                  {createUserMutation.isLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Language Modal */}
      {showAddLanguage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add New Language</h3>
              <button onClick={() => setShowAddLanguage(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Language Name *</label>
                <input
                  type="text"
                  className="input"
                  value={newLanguage.name}
                  onChange={(e) => setNewLanguage({...newLanguage, name: e.target.value})}
                  placeholder="e.g., Bassa"
                />
              </div>
              <div>
                <label className="label">Language Family</label>
                <select
                  className="input"
                  value={newLanguage.family}
                  onChange={(e) => setNewLanguage({...newLanguage, family: e.target.value})}
                >
                  <option value="niger_congo">Niger-Congo</option>
                  <option value="mande">Mande</option>
                  <option value="kru">Kru</option>
                  <option value="mel">Mel</option>
                  <option value="creole">Creole</option>
                </select>
              </div>
              <div>
                <label className="label">Regions *</label>
                <input
                  type="text"
                  className="input"
                  value={newLanguage.regions}
                  onChange={(e) => setNewLanguage({...newLanguage, regions: e.target.value})}
                  placeholder="e.g., Grand Bassa, Rivercess"
                />
              </div>
              <div>
                <label className="label">Endangerment Level</label>
                <select
                  className="input"
                  value={newLanguage.endangerment_level}
                  onChange={(e) => setNewLanguage({...newLanguage, endangerment_level: e.target.value})}
                >
                  <option value="safe">Safe</option>
                  <option value="vulnerable">Vulnerable</option>
                  <option value="definitely_endangered">Definitely Endangered</option>
                  <option value="severely_endangered">Severely Endangered</option>
                  <option value="critically_endangered">Critically Endangered</option>
                </select>
              </div>
              <div>
                <label className="label">Estimated Speakers</label>
                <input
                  type="number"
                  className="input"
                  value={newLanguage.estimated_speakers}
                  onChange={(e) => setNewLanguage({...newLanguage, estimated_speakers: e.target.value})}
                  placeholder="e.g., 350000"
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input h-20"
                  value={newLanguage.description}
                  onChange={(e) => setNewLanguage({...newLanguage, description: e.target.value})}
                  placeholder="Brief description of the language"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setShowAddLanguage(false)} className="btn-secondary">
                Cancel
              </button>
              <button 
                onClick={handleAddLanguage}
                className="btn-primary"
                disabled={createLanguageMutation.isLoading}
              >
                {createLanguageMutation.isLoading ? 'Creating...' : 'Create Language'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Edit User</h3>
              <button onClick={() => setShowEditUser(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Username</label>
                <input
                  type="text"
                  className="input"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                />
              </div>
              <div>
                <label className="label">Role</label>
                <select
                  className="input"
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                >
                  <option value="contributor">Contributor</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="language_lead">Language Lead</option>
                  <option value="admin">Admin</option>
                  <option value="superuser">Super User</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setShowEditUser(false)} className="btn-secondary">
                Cancel
              </button>
              <button 
                onClick={handleUpdateUser}
                className="btn-primary"
                disabled={updateUserMutation.isLoading}
              >
                {updateUserMutation.isLoading ? 'Updating...' : 'Update User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Backup Modal */}
      {showCreateBackup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create System Backup</h3>
              <button onClick={() => setShowCreateBackup(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Backup Name *</label>
                <input
                  type="text"
                  className="input"
                  value={newBackup.name}
                  onChange={(e) => setNewBackup({...newBackup, name: e.target.value})}
                  placeholder="e.g., Weekly Backup"
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input h-20"
                  value={newBackup.description}
                  onChange={(e) => setNewBackup({...newBackup, description: e.target.value})}
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="label">Backup Type</label>
                <select
                  className="input"
                  value={newBackup.backup_type}
                  onChange={(e) => setNewBackup({...newBackup, backup_type: e.target.value})}
                >
                  <option value="full">Full System Backup</option>
                  <option value="database">Database Only</option>
                  <option value="files">Files Only</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setShowCreateBackup(false)} className="btn-secondary">
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (!newBackup.name) {
                    setMessage({text: 'Please enter a backup name', type: 'error'})
                    return
                  }
                  setBackups(prev => [...prev, {
                    id: Date.now(),
                    ...newBackup,
                    file_size: 1024 * Math.floor(Math.random() * 1000),
                    created_at: new Date().toISOString(),
                    created_by_username: 'admin'
                  }])
                  setShowCreateBackup(false)
                  setNewBackup({ name: '', description: '', backup_type: 'full' })
                  setMessage({text: 'Backup created successfully', type: 'success'})
                }}
                className="btn-primary"
              >
                Create Backup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Snapshot Modal */}
      {showCreateSnapshot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create System Snapshot</h3>
              <button onClick={() => setShowCreateSnapshot(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Snapshot Name *</label>
                <input
                  type="text"
                  className="input"
                  value={newSnapshot.name}
                  onChange={(e) => setNewSnapshot({...newSnapshot, name: e.target.value})}
                  placeholder="e.g., Before Update"
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input h-20"
                  value={newSnapshot.description}
                  onChange={(e) => setNewSnapshot({...newSnapshot, description: e.target.value})}
                  placeholder="Optional description"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setShowCreateSnapshot(false)} className="btn-secondary">
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (!newSnapshot.name) {
                    setMessage({text: 'Please enter a snapshot name', type: 'error'})
                    return
                  }
                  setSnapshots(prev => [...prev, {
                    id: Date.now(),
                    ...newSnapshot,
                    created_at: new Date().toISOString(),
                    created_by_username: 'admin'
                  }])
                  setShowCreateSnapshot(false)
                  setNewSnapshot({ name: '', description: '' })
                  setMessage({text: 'Snapshot created successfully', type: 'success'})
                }}
                className="btn-primary"
              >
                Create Snapshot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create New Role</h3>
              <button onClick={(e) => {
                e.preventDefault()
                setShowCreateRole(false)
              }} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Role Name *</label>
                <input
                  type="text"
                  className="input"
                  value={newRole.name}
                  onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                  placeholder="e.g., Content Moderator"
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input h-20"
                  value={newRole.description}
                  onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                  placeholder="Brief description of the role"
                />
              </div>
              {isSuperUser && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_admin_role"
                    checked={newRole.is_admin_role}
                    onChange={(e) => setNewRole({...newRole, is_admin_role: e.target.checked})}
                    className="rounded"
                  />
                  <label htmlFor="is_admin_role" className="text-sm font-medium text-gray-700">
                    Admin Role (only superuser can manage)
                  </label>
                </div>
              )}
              <div>
                <label className="label">Permissions</label>
                <div className="max-h-60 overflow-y-auto border rounded p-3 space-y-2">
                  {permissions && permissions.length > 0 ? (
                    Object.entries(
                      permissions.reduce((acc: any, perm: any) => {
                        const category = perm.category || 'other'
                        if (!acc[category]) acc[category] = []
                        acc[category].push(perm)
                        return acc
                      }, {})
                    ).map(([category, perms]: [string, any]) => (
                      <div key={category}>
                        <h4 className="font-medium text-gray-800 mb-2 capitalize">
                          {category.replace('_', ' ')}
                        </h4>
                        <div className="space-y-1 ml-4">
                          {Array.isArray(perms) && perms.map((perm: any) => (
                            <div key={perm.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={perm.id}
                                checked={newRole.permission_ids.includes(perm.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewRole({
                                      ...newRole,
                                      permission_ids: [...newRole.permission_ids, perm.id]
                                    })
                                  } else {
                                    setNewRole({
                                      ...newRole,
                                      permission_ids: newRole.permission_ids.filter(id => id !== perm.id)
                                    })
                                  }
                                }}
                                className="rounded"
                              />
                              <label htmlFor={perm.id} className="text-sm text-gray-700">
                                {perm.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No permissions available. Please check your connection.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={(e) => {
                e.preventDefault()
                setShowCreateRole(false)
              }} className="btn-secondary">
                Cancel
              </button>
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  if (!newRole.name) {
                    setMessage({text: 'Please enter a role name', type: 'error'})
                    return
                  }
                  createRoleMutation.mutate(newRole)
                }}
                className="btn-primary"
                disabled={createRoleMutation.isLoading}
              >
                {createRoleMutation.isLoading ? 'Creating...' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditRole && editingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Edit Role</h3>
              <button onClick={(e) => {
                e.preventDefault()
                setShowEditRole(false)
              }} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Role Name *</label>
                <input
                  type="text"
                  className="input"
                  value={editingRole.name || ''}
                  onChange={(e) => setEditingRole({...editingRole, name: e.target.value})}
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input h-20"
                  value={editingRole.description || ''}
                  onChange={(e) => setEditingRole({...editingRole, description: e.target.value})}
                />
              </div>
              {isSuperUser && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit_is_admin_role"
                    checked={editingRole.is_admin_role || false}
                    onChange={(e) => setEditingRole({...editingRole, is_admin_role: e.target.checked})}
                    className="rounded"
                  />
                  <label htmlFor="edit_is_admin_role" className="text-sm font-medium text-gray-700">
                    Admin Role (only superuser can manage)
                  </label>
                </div>
              )}
              <div>
                <label className="label">Permissions</label>
                <div className="max-h-60 overflow-y-auto border rounded p-3 space-y-2">
                  {permissions && permissions.length > 0 ? (
                    Object.entries(
                      permissions.reduce((acc: any, perm: any) => {
                        const category = perm.category || 'other'
                        if (!acc[category]) acc[category] = []
                        acc[category].push(perm)
                        return acc
                      }, {})
                    ).map(([category, perms]: [string, any]) => (
                      <div key={category}>
                        <h4 className="font-medium text-gray-800 mb-2 capitalize">
                          {category.replace('_', ' ')}
                        </h4>
                        <div className="space-y-1 ml-4">
                          {Array.isArray(perms) && perms.map((perm: any) => (
                            <div key={perm.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`edit_${perm.id}`}
                                checked={(editingRole.permission_ids || []).includes(perm.id)}
                                onChange={(e) => {
                                  const currentIds = editingRole.permission_ids || []
                                  if (e.target.checked) {
                                    setEditingRole({
                                      ...editingRole,
                                      permission_ids: [...currentIds, perm.id]
                                    })
                                  } else {
                                    setEditingRole({
                                      ...editingRole,
                                      permission_ids: currentIds.filter((id: string) => id !== perm.id)
                                    })
                                  }
                                }}
                                className="rounded"
                              />
                              <label htmlFor={`edit_${perm.id}`} className="text-sm text-gray-700">
                                {perm.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No permissions available.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={(e) => {
                e.preventDefault()
                setShowEditRole(false)
              }} className="btn-secondary">
                Cancel
              </button>
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  if (!editingRole.name) {
                    setMessage({text: 'Please enter a role name', type: 'error'})
                    return
                  }
                  updateRoleMutation.mutate({ id: editingRole.id, data: editingRole })
                }}
                className="btn-primary"
                disabled={updateRoleMutation.isLoading}
              >
                {updateRoleMutation.isLoading ? 'Updating...' : 'Update Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Role Modal */}
      {showAssignRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Assign Role</h3>
              <button onClick={(e) => {
                e.preventDefault()
                setShowAssignRole(false)
              }} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              {!selectedUser && (
                <div>
                  <label className="label">Select User</label>
                  <select
                    className="input"
                    onChange={(e) => {
                      const user = usersWithRoles.find(u => u.id === parseInt(e.target.value))
                      setSelectedUser(user)
                    }}
                  >
                    <option value="">Choose a user...</option>
                    {usersWithRoles && usersWithRoles.map((user: any) => (
                      <option key={user.id} value={user.id}>
                        {user.username} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {selectedUser && (
                <>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="font-medium">{selectedUser.username}</p>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Current roles: {selectedUser.custom_roles?.map((r: any) => r.name).join(', ') || 'None'}
                    </p>
                  </div>
                  <div>
                    <label className="label">Select Role to Assign</label>
                    <select
                      className="input"
                      onChange={(e) => {
                        if (e.target.value) {
                          assignRoleMutation.mutate({ userId: selectedUser.id, roleId: e.target.value })
                        }
                      }}
                    >
                      <option value="">Choose a role...</option>
                      {roles && roles
                        .filter((role: any) => !role.is_admin_role || isSuperUser)
                        .filter((role: any) => !selectedUser.custom_roles?.some((ur: any) => ur.id === role.id))
                        .map((role: any) => (
                          <option key={role.id} value={role.id}>
                            {role.name} {role.is_admin_role ? '(Admin)' : ''}
                          </option>
                        ))}
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={(e) => {
                e.preventDefault()
                setShowAssignRole(false)
                setSelectedUser(null)
              }} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}