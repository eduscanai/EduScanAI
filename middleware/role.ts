export default defineNuxtRouteMiddleware((to) => {
  const { role } = usePermissions()

  const requiredRole = to.meta.requiredRole as string | string[] | undefined

  if (!requiredRole) return

  const allowed = Array.isArray(requiredRole)
    ? requiredRole.includes(role.value)
    : role.value === requiredRole

  if (!allowed) {
    return navigateTo('/dashboard', { replace: true })
  }
})
