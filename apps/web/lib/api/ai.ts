/**
 * AI Assistant API Client
 *
 * Placeholder client với mock data. Sẵn sàng thay thế bằng backend thật.
 *
 * TODO: Wire up với Rust backend khi AI endpoints sẵn sàng:
 * - POST /v2/ai/chat        → Hỏi đáp tài liệu (RAG)
 * - POST /v2/ai/search      → Tìm kiếm ngữ nghĩa
 * - POST /v2/ai/write       → Viết bài thông minh
 * - POST /v2/ai/summarize   → Tóm tắt tài liệu
 */

// ─── Types ───────────────────────────────────────────────────────────

export type AITab = 'qa' | 'search' | 'write' | 'summarize'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  /** Tab context - mỗi tab có message history riêng */
  tab: AITab
}

export interface AIResponse {
  message: string
  /** Source tài liệu (cho RAG/Q&A) */
  sources?: Array<{
    documentId: string
    title: string
    page?: number
  }>
}

export interface AITabConfig {
  id: AITab
  label: string
  icon: string
  placeholder: string
  welcomeMessage: string
}

// ─── Tab Configs ─────────────────────────────────────────────────────

export const AI_TABS: AITabConfig[] = [
  {
    id: 'qa',
    label: 'Hỏi đáp',
    icon: 'MessageCircle',
    placeholder: 'Hỏi về nội dung tài liệu...',
    welcomeMessage:
      'Xin chào! Tôi có thể trả lời câu hỏi về tài liệu bạn đã upload. Hãy thử hỏi tôi nhé!',
  },
  {
    id: 'search',
    label: 'Tìm kiếm',
    icon: 'Search',
    placeholder: 'Mô tả nội dung bạn muốn tìm...',
    welcomeMessage:
      'Tìm kiếm thông minh! Mô tả nội dung bạn cần, tôi sẽ tìm tài liệu phù hợp nhất.',
  },
  {
    id: 'write',
    label: 'Viết bài',
    icon: 'PenTool',
    placeholder: 'Mô tả bài viết bạn muốn tạo...',
    welcomeMessage:
      'Tôi có thể giúp bạn viết bài, gợi ý tiêu đề, tóm tắt hoặc chỉnh sửa văn phong. Hãy cho tôi biết bạn cần gì!',
  },
  {
    id: 'summarize',
    label: 'Tóm tắt',
    icon: 'FileText',
    placeholder: 'Nhập tiêu đề tài liệu hoặc dán nội dung...',
    welcomeMessage:
      'Dán nội dung hoặc cho tôi biết tài liệu cần tóm tắt. Tôi sẽ tạo bản tóm tắt ngắn gọn cho bạn.',
  },
]

// ─── Mock Data ───────────────────────────────────────────────────────

const MOCK_RESPONSES: Record<AITab, string[]> = {
  qa: [
    'Dựa trên tài liệu "Giới thiệu Machine Learning" bạn đã upload, chương 3 nói về các thuật toán phân loại cơ bản bao gồm Decision Tree, Naive Bayes và K-Nearest Neighbors.\n\n**Nguồn:** Trang 45-52',
    'Tài liệu "Cơ sở dữ liệu" đề cập đến normalization ở chương 2. Có 3 dạng normal form được giải thích chi tiết: 1NF, 2NF và 3NF.\n\n**Nguồn:** Trang 23-31',
    'Tôi không tìm thấy thông tin về chủ đề này trong tài liệu của bạn. Bạn có thể upload thêm tài liệu liên quan không?',
  ],
  search: [
    'Tôi tìm thấy **3 tài liệu** liên quan:\n\n1. **"Giới thiệu Machine Learning"** - Khớp 92%\n2. **"Thống kê ứng dụng"** - Khớp 78%\n3. **"Python cho Data Science"** - Khớp 65%\n\nBạn muốn xem chi tiết tài liệu nào?',
    'Không tìm thấy tài liệu phù hợp. Thử mô tả cụ thể hơn? Ví dụ: "bài toán phân loại hình ảnh"',
  ],
  write: [
    'Đây là bản draft cho bạn:\n\n# Tiêu đề gợi ý: [Title]\n\n## Mở đầu\nNội dung mở đầu bài viết...\n\n## Nội dung chính\n- Điểm 1\n- Điểm 2\n- Điểm 3\n\n## Kết luận\nTóm tắt và nhận định...\n\nBạn muốn chỉnh sửa phần nào?',
    'Tôi đã cải thiện văn phong bài viết của bạn:\n\n- Thay "rất tốt" → "hiệu quả đáng kể"\n- Thay "nhiều" → "đa dạng"\n- Thêm đoạn chuyển ý giữa phần 2 và 3\n\nBạn muốn tôi giải thích thay đổi nào không?',
  ],
  summarize: [
    '## Tóm tắt tài liệu\n\n**Chủ đề chính:** [Topic]\n\n**Các điểm chính:**\n1. Điểm chính 1\n2. Điểm chính 2\n3. Điểm chính 3\n\n**Kết luận:** [Summary conclusion]\n\nĐộ dài gốc: ~2,000 từ → Tóm tắt: ~150 từ',
    'Tài liệu này chứa **4 chương chính**:\n\n1. Tổng quan về chủ đề\n2. Phương pháp nghiên cứu\n3. Kết quả thực nghiệm\n4. Đề xuất và kết luận\n\nBạn muốn tôi tóm tắt chi tiết từng chương không?',
  ],
}

// ─── Mock API Functions ──────────────────────────────────────────────

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Simulate AI response với delay */
export async function sendChatMessage(
  tab: AITab,
  _message: string
): Promise<AIResponse> {
  // Giả lập network delay (1-2 giây)
  const delay = 1000 + Math.random() * 1000
  await new Promise((resolve) => setTimeout(resolve, delay))

  const message = getRandomItem(MOCK_RESPONSES[tab])

  // Thêm sources cho Q&A tab
  if (tab === 'qa' && !message.includes('không tìm thấy')) {
    return {
      message,
      sources: [
        {
          documentId: 'doc-1',
          title: 'Giới thiệu Machine Learning',
          page: Math.floor(Math.random() * 50) + 1,
        },
      ],
    }
  }

  return { message }
}
