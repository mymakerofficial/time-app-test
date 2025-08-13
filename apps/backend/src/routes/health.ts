import { app } from '@/index.ts'

app.get('/api/health', async () => {
  return { success: true }
})
