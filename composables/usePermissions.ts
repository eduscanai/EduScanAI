export const usePermissions = () => {
  const { usuario } = useUsuario()

  const role = computed(() => usuario.value.role)

  // Role checks
  const isAdmin = computed(() => role.value === 'admin')
  const isPedagogue = computed(() => role.value === 'pedagogue')
  const isTeacher = computed(() => role.value === 'teacher')
  const isStudent = computed(() => role.value === 'student')
  const isCollaborator = computed(() => role.value === 'collaborator')

  // Permission helpers
  const canManageUsers = computed(() => isAdmin.value)
  const canManageSchool = computed(() => isAdmin.value)
  const canManageAcademicYears = computed(() => isAdmin.value)
  const canManageSubjects = computed(() => isAdmin.value)
  const canManageClasses = computed(() => isAdmin.value)

  const canViewAllClasses = computed(() => isAdmin.value || isPedagogue.value || isCollaborator.value)
  const canViewAllStudents = computed(() => isAdmin.value || isPedagogue.value || isCollaborator.value)
  const canViewAllTeachers = computed(() => isAdmin.value || isPedagogue.value || isCollaborator.value)
  const canViewAssignments = computed(() => isAdmin.value || isPedagogue.value || isTeacher.value || isStudent.value || isCollaborator.value)
  const canViewReports = computed(() => isAdmin.value || isPedagogue.value || isCollaborator.value)
  const canViewSettings = computed(() => isAdmin.value)

  const canCreateAssignments = computed(() => isAdmin.value || isTeacher.value)
  const canGradeAssignments = computed(() => isAdmin.value || isTeacher.value)
  const canScanExams = computed(() => isAdmin.value || isTeacher.value)

  return {
    role,
    isAdmin,
    isPedagogue,
    isTeacher,
    isStudent,
    isCollaborator,
    canManageUsers,
    canManageSchool,
    canManageAcademicYears,
    canManageSubjects,
    canManageClasses,
    canViewAllClasses,
    canViewAllStudents,
    canViewAllTeachers,
    canViewAssignments,
    canViewReports,
    canViewSettings,
    canCreateAssignments,
    canGradeAssignments,
    canScanExams
  }
}
