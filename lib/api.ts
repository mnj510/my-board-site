// API 호출 헬퍼 함수들

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const res = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || '요청에 실패했습니다.')
  }

  return data
}

