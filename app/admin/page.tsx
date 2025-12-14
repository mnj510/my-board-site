'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'

export default function AdminPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategorySlug, setNewCategorySlug] = useState('')
  const [activeTab, setActiveTab] = useState<'users' | 'categories'>('users')

  useEffect(() => {
    if (!authLoading) {
      if (!user || !profile?.is_admin) {
        router.push('/')
        return
      }
      fetchUsers()
      fetchCategories()
    }
  }, [user, profile, authLoading])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      if (data.users) {
        setUsers(data.users.map((u: any) => ({
          ...u,
          permission: { can_write: u.can_write !== 0 && u.can_write !== false },
        })))
      }
    } catch (error) {
      console.error('사용자 목록 로딩 실패:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (data.categories) setCategories(data.categories)
    } catch (error) {
      console.error('카테고리 로딩 실패:', error)
    }
  }

  const toggleUserPermission = async (userId: string, currentPermission: boolean) => {
    try {
      const res = await fetch(`/api/users/${userId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ can_write: !currentPermission }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || '권한 설정에 실패했습니다.')
        return
      }

      fetchUsers()
    } catch (error: any) {
      alert(error.message || '권한 설정에 실패했습니다.')
    }
  }

  const addCategory = async () => {
    if (!newCategoryName.trim() || !newCategorySlug.trim()) {
      alert('카테고리 이름과 슬러그를 입력하세요.')
      return
    }

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName,
          slug: newCategorySlug,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || '카테고리 추가에 실패했습니다.')
        return
      }

      setNewCategoryName('')
      setNewCategorySlug('')
      fetchCategories()
    } catch (error: any) {
      alert(error.message || '카테고리 추가에 실패했습니다.')
    }
  }

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('카테고리를 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || '카테고리 삭제에 실패했습니다.')
        return
      }

      fetchCategories()
    } catch (error: any) {
      alert(error.message || '카테고리 삭제에 실패했습니다.')
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  if (!user || !profile?.is_admin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-blue-600">
              게시판
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{profile.username}</span>
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' })
                  router.push('/')
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">관리자 페이지</h1>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'users'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                사용자 권한 관리
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'categories'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                카테고리 관리
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'users' && (
              <div>
                <h2 className="text-xl font-bold mb-4">사용자 목록</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          사용자명
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          관리자
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          글 작성 권한
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          가입일
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          작업
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.is_admin ? (
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                                관리자
                              </span>
                            ) : (
                              <span className="text-gray-400">일반</span>
                            )}
                          </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.permission?.can_write !== false ? (
                                <span className="text-green-600">가능</span>
                              ) : (
                                <span className="text-red-600">불가</span>
                              )}
                            </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString('ko-KR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {!user.is_admin && (
                                <button
                                  onClick={() =>
                                    toggleUserPermission(
                                      user.id,
                                      user.permission?.can_write !== false
                                    )
                                  }
                                  className={`px-3 py-1 rounded text-xs ${
                                    user.permission?.can_write !== false
                                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                                  }`}
                                >
                                  {user.permission?.can_write !== false ? '권한 제거' : '권한 부여'}
                                </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div>
                <h2 className="text-xl font-bold mb-4">카테고리 목록</h2>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-3">새 카테고리 추가</h3>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="카테고리 이름"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      value={newCategorySlug}
                      onChange={(e) => setNewCategorySlug(e.target.value)}
                      placeholder="슬러그 (예: notice)"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
                    />
                    <button
                      onClick={addCategory}
                      className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      추가
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <span className="font-medium">{category.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({category.slug})
                        </span>
                      </div>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

