# Hướng dẫn đóng góp

Cảm ơn bạn quan tâm đến việc đóng góp cho dự án Kho Học Liệu Số!

## Quy trình đóng góp

### 1. Fork và Clone

```bash
# Fork repository trên GitHub
# Sau đó clone fork của bạn
git clone https://github.com/YOUR_USERNAME/learning-repository.git
cd learning-repository
```

### 2. Tạo Branch

```bash
# Tạo branch mới cho feature/fix
git checkout -b feature/ten-feature
# hoặc
git checkout -b fix/ten-bug
```

### 3. Cài đặt Dependencies

```bash
pnpm install
```

### 4. Phát triển

```bash
# Chạy development servers
pnpm dev

# Chạy tests
pnpm test

# Kiểm tra code style
pnpm lint
```

### 5. Commit Changes

Chúng tôi sử dụng [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: thêm tính năng upload nhiều file
fix: sửa lỗi pagination
docs: cập nhật README
style: format code
refactor: tái cấu trúc auth module
test: thêm tests cho documents service
chore: cập nhật dependencies
```

### 6. Push và tạo Pull Request

```bash
git push origin feature/ten-feature
```

Sau đó tạo Pull Request trên GitHub.

## Coding Standards

### TypeScript

- Sử dụng TypeScript strict mode
- Định nghĩa types/interfaces rõ ràng
- Tránh sử dụng `any` trừ khi thực sự cần thiết

### NestJS Backend

```typescript
// ✅ Good - Sử dụng dependency injection
@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}
}

// ✅ Good - Sử dụng DTOs
export class CreateDocumentDto {
  @IsString()
  title: string;
}

// ❌ Bad - Hardcode values
const token = jwt.sign({ id: 1 }, 'secret');
```

### Next.js Frontend

```tsx
// ✅ Good - Sử dụng hooks
export function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  useEffect(() => { ... }, []);
}

// ✅ Good - Client component directive
'use client';

// ❌ Bad - Sử dụng class component
class DocumentList extends React.Component { ... }
```

### File Naming

- Components: PascalCase - `DocumentCard.tsx`
- Services: camelCase - `documents.service.ts`
- Modules: kebab-case - `documents.module.ts`
- Types: PascalCase - `Document.ts`

### Comments

```typescript
/**
 * JSDoc style cho public APIs
 *
 * @param id - Document ID
 * @returns Document details
 */
async findOne(id: string): Promise<Document> {
  // Inline comments giải thích logic phức tạp
  const doc = await this.prisma.document.findUnique({ where: { id } });
  return doc;
}
```

## Cấu trúc Pull Request

### Title

```
feat: thêm tính năng tìm kiếm nâng cao
```

### Description

```markdown
## Mô tả
Mô tả ngắn gọn về thay đổi

## Thay đổi
- [ ] Thêm API endpoint /search/advanced
- [ ] Cập nhật UI search form
- [ ] Thêm tests

## Screenshots
(Nếu có)

## Checklist
- [ ] Code đã được test
- [ ] Documentation đã cập nhật
- [ ] Không có console errors
```

## Running Tests

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## Cần giúp đỡ?

Nếu bạn có câu hỏi, hãy tạo [Discussion](https://github.com/repo/discussions) hoặc liên hệ qua email.

## License

Bằng cách đóng góp, bạn đồng ý rằng contributions của bạn sẽ được cấp phép dưới MIT License.
