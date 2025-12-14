'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const { user, profile, loading, refresh } = useAuth()
  const [categories, setCategories] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    if (!loading) {
      fetchCategories()
      fetchPosts()
    }
  }, [loading])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (data.categories) setCategories(data.categories)
    } catch (error) {
      console.error('카테고리 로딩 실패:', error)
    }
  }

  const fetchPosts = async (categoryId?: string) => {
    try {
      const url = categoryId && categoryId !== 'all'
        ? `/api/posts?category_id=${categoryId}`
        : '/api/posts'
      const res = await fetch(url)
      const data = await res.json()
      if (data.posts) setPosts(data.posts)
    } catch (error) {
      console.error('게시글 로딩 실패:', error)
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    fetchPosts(categoryId === 'all' ? undefined : categoryId)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    await refresh()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-blue-600">
              게시판
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">
                    {profile?.username || user.email}
                  </span>
                  {profile?.is_admin && (
                    <Link
                      href="/admin"
                      className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                    >
                      관리자
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-blue-600 hover:text-blue-700"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <aside className="w-64">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-bold mb-4">카테고리</h2>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`w-full text-left px-3 py-2 rounded ${
                      selectedCategory === 'all'
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    전체
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded ${
                        selectedCategory === cat.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">게시글 목록</h1>
              {user && (
                <Link
                  href="/posts/new"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  글 작성
                </Link>
              )}
            </div>

            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                  게시글이 없습니다.
                </div>
              ) : (
                posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="block bg-white rounded-lg shadow hover:shadow-md transition p-6"
                  >
                    <div className="flex gap-4">
                      {post.thumbnail_url && (
                        <img
                          src={post.thumbnail_url}
                          alt={post.title}
                          className="w-32 h-32 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {post.category_name || '일반'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {post.author_username || '익명'}
                          </span>
                          <span className="text-sm text-gray-400">
                            {new Date(post.created_at).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 line-clamp-2">
                          {post.content}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

