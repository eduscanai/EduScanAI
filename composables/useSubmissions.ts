interface Submission {
  id: string
  assignment_id: string
  student_id: string
  content: string | null
  attachments: { name: string; url: string }[]
  submitted_at: string
  score: number | null
  feedback: string | null
  graded_at: string | null
  graded_by: string | null
  profiles?: { id: string; full_name: string; email: string; avatar_url: string | null }
}

export const useSubmissions = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const submissions = ref<Submission[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getSubmissionsForAssignment = async (assignmentId: string) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('submissions')
        .select('*, profiles(id, full_name, email, avatar_url)')
        .eq('assignment_id', assignmentId)
        .order('submitted_at', { ascending: false })
      if (err) throw err
      submissions.value = (data || []) as Submission[]
      return submissions.value
    } catch (e: any) {
      error.value = e.message
      return []
    } finally {
      loading.value = false
    }
  }

  const getSubmission = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('submissions')
        .select('*, profiles(id, full_name, email, avatar_url)')
        .eq('id', id)
        .single()
      if (err) throw err
      return data as Submission
    } catch (e: any) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  const getMySubmission = async (assignmentId: string) => {
    try {
      const { data, error: err } = await supabase
        .from('submissions')
        .select('*')
        .eq('assignment_id', assignmentId)
        .eq('student_id', user.value!.id)
        .maybeSingle()
      if (err) throw err
      return data as Submission | null
    } catch {
      return null
    }
  }

  const submitWork = async (assignmentId: string, content: string, attachments: { name: string; url: string }[] = []) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('submissions')
        .upsert({
          assignment_id: assignmentId,
          student_id: user.value!.id,
          content,
          attachments,
          submitted_at: new Date().toISOString()
        }, { onConflict: 'assignment_id,student_id' })
        .select()
        .single()
      if (err) throw err
      return data as Submission
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const gradeSubmission = async (submissionId: string, score: number, feedback: string) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('submissions')
        .update({
          score,
          feedback,
          graded_at: new Date().toISOString(),
          graded_by: user.value!.id
        })
        .eq('id', submissionId)
        .select('*, profiles(id, full_name, email, avatar_url)')
        .single()
      if (err) throw err
      return data as Submission
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    submissions, loading, error,
    getSubmissionsForAssignment, getSubmission, getMySubmission,
    submitWork, gradeSubmission
  }
}
