'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'
import { format } from 'date-fns'

export default function PostDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, profile } = useAuth()
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editCommentContent, setEditCommentContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchPost()
      fetchComments()
    }
  }, [params.id])

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts/${params.id}`)
      const data = await res.json()
      if (data.post) {
        setPost(data.post)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?post_id=${params.id}`)
      const data = await res.json()
      if (data.comments) {
        setComments(data.comments)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: params.id,
          content: newComment,
          parent_id: null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || '댓글 작성에 실패했습니다.')
        return
      }

      setNewComment('')
      fetchComments()
    } catch (error: any) {
      alert(error.message || '댓글 작성에 실패했습니다.')
    }
  }

  const handleReplySubmit = async (parentId: string) => {
    if (!user || !replyContent.trim()) return

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: params.id,
          content: replyContent,
          parent_id: parentId,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || '답글 작성에 실패했습니다.')
        return
      }

      setReplyingTo(null)
      setReplyContent('')
      fetchComments()
    } catch (error: any) {
      alert(error.message || '답글 작성에 실패했습니다.')
    }
  }

  const handleCommentEdit = async (commentId: string) => {
    if (!editCommentContent.trim()) return

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editCommentContent }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || '댓글 수정에 실패했습니다.')
        return
      }

      setEditingComment(null)
      setEditCommentContent('')
      fetchComments()
    } catch (error: any) {
      alert(error.message || '댓글 수정에 실패했습니다.')
    }
  }

  const handleCommentDelete = async (commentId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || '댓글 삭제에 실패했습니다.')
        return
      }

      fetchComments()
    } catch (error: any) {
      alert(error.message || '댓글 삭제에 실패했습니다.')
    }
  }

  const handlePostEdit = () => {
    router.push(`/posts/${params.id}/edit`)
  }

  const handlePostDelete = async () => {
    if (!confirm('게시글을 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/posts/${params.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || '게시글 삭제에 실패했습니다.')
        return
      }

      router.push('/')
    } catch (error: any) {
      alert(error.message || '게시글 삭제에 실패했습니다.')
    }
  }

  const canEditPost = () => {
    if (!user || !post) return false
    if (profile?.is_admin) return true
    if (post.author_id === user.id) {
      return true
    }
    return false
  }

  const canEditComment = (comment: any) => {
    if (!user) return false
    return comment.author_id === user.id
  }

  const canDeleteComment = (comment: any) => {
    if (!user) return false
    if (profile?.is_admin) return true
    return comment.author_id === user.id
  }

  const getReplies = (commentId: string) => {
    return comments.filter((c) => c.parent_id === commentId)
  }

  const getTopLevelComments = () => {
    return comments.filter((c) => !c.parent_id)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">게시글을 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-blue-600">
              게시판
            </Link>
            {user && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {profile?.username || user.email}
                </span>
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
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                {post.category_name || '일반'}
              </span>
              <span className="text-sm text-gray-500">
                {post.author_username || '익명'}
              </span>
              <span className="text-sm text-gray-400">
                {format(new Date(post.created_at), 'yyyy년 MM월 dd일 HH:mm')}
              </span>
            </div>
            {canEditPost() && (
              <div className="flex gap-2">
                <button
                  onClick={handlePostEdit}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  수정
                </button>
                {(profile?.is_admin || post.author_id === user?.id) && (
                  <button
                    onClick={handlePostDelete}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    삭제
                  </button>
                )}
              </div>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

          {post.thumbnail_url && (
            <img
              src={post.thumbnail_url}
              alt={post.title}
              className="w-full max-h-96 object-cover rounded mb-4"
            />
          )}

          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">댓글 ({comments.length})</h2>

          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 mb-2"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                댓글 작성
              </button>
            </form>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 rounded text-center">
              <Link href="/login" className="text-blue-600 hover:text-blue-700">
                로그인
              </Link>
              하여 댓글을 작성하세요.
            </div>
          )}

          <div className="space-y-4">
            {getTopLevelComments().map((comment) => (
              <div key={comment.id} className="border-l-2 border-gray-200 pl-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-semibold text-sm">
                      {comment.author_username || '익명'}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {format(new Date(comment.created_at), 'MM/dd HH:mm')}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {canEditComment(comment) && (
                      <button
                        onClick={() => {
                          setEditingComment(comment.id)
                          setEditCommentContent(comment.content)
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        수정
                      </button>
                    )}
                    {canDeleteComment(comment) && (
                      <button
                        onClick={() => handleCommentDelete(comment.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        삭제
                      </button>
                    )}
                    {user && (
                      <button
                        onClick={() => setReplyingTo(comment.id)}
                        className="text-xs text-gray-600 hover:text-gray-700"
                      >
                        답글
                      </button>
                    )}
                  </div>
                </div>

                {editingComment === comment.id ? (
                  <div className="mb-2">
                    <textarea
                      value={editCommentContent}
                      onChange={(e) => setEditCommentContent(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCommentEdit(comment.id)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => {
                          setEditingComment(null)
                          setEditCommentContent('')
                        }}
                        className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                )}

                {replyingTo === comment.id && (
                  <div className="ml-4 mt-2 p-3 bg-gray-50 rounded">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="답글을 입력하세요..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReplySubmit(comment.id)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded"
                      >
                        답글 작성
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(null)
                          setReplyContent('')
                        }}
                        className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                )}

                {/* 대댓글 표시 */}
                {getReplies(comment.id).map((reply) => (
                  <div key={reply.id} className="ml-4 mt-3 border-l-2 border-blue-200 pl-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-semibold text-sm">
                          {reply.author_username || '익명'}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          {format(new Date(reply.created_at), 'MM/dd HH:mm')}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {canEditComment(reply) && (
                          <button
                            onClick={() => {
                              setEditingComment(reply.id)
                              setEditCommentContent(reply.content)
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            수정
                          </button>
                        )}
                        {canDeleteComment(reply) && (
                          <button
                            onClick={() => handleCommentDelete(reply.id)}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </div>

                    {editingComment === reply.id ? (
                      <div className="mb-2">
                        <textarea
                          value={editCommentContent}
                          onChange={(e) => setEditCommentContent(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCommentEdit(reply.id)}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => {
                              setEditingComment(null)
                              setEditCommentContent('')
                            }}
                            className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700">{reply.content}</p>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {getTopLevelComments().length === 0 && (
              <div className="text-center text-gray-500 py-8">
                댓글이 없습니다.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

