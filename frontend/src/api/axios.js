import axios from 'axios'

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 15000
})

async function fetchAllAssets(perPage = 200) {
  const all = []
  let page = 1

  while (true) {
    const res = await api.get('/assets', { params: { page, per_page: perPage } })
    const payload = res.data || {}
    const items = payload.data || []
    all.push(...items)
    const current = payload.current_page || 1
    const pages = payload.pages || 1
    if (current >= pages) break
    page += 1
  }

  return all
}

export default api
export { fetchAllAssets }
