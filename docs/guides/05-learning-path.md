# Lộ Trình Học Tập Chi Tiết

Tài liệu này cung cấp lộ trình học tập từng bước để hiểu và làm việc với project.

---

## Mục Lục

1. [Tổng quan lộ trình](#1-tổng-quan-lộ-trình)
2. [Giai đoạn 1: Nền tảng (Tuần 1-3)](#2-giai-đoạn-1-nền-tảng-tuần-1-3)
3. [Giai đoạn 2: Frontend (Tuần 4-6)](#3-giai-đoạn-2-frontend-tuần-4-6)
4. [Giai đoạn 3: Backend (Tuần 7-10)](#4-giai-đoạn-3-backend-tuần-7-10)
5. [Giai đoạn 4: Thực hành (Tuần 11-14)](#5-giai-đoạn-4-thực-hành-tuần-11-14)
6. [Giai đoạn 5: Nâng cao (Tuần 15+)](#6-giai-đoạn-5-nâng-cao-tuần-15)

---

## 1. Tổng quan lộ trình

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LỘ TRÌNH HỌC TẬP                              │
└─────────────────────────────────────────────────────────────────────┘

Giai đoạn 1: Nền tảng (3 tuần)
├── JavaScript ES6+
├── TypeScript cơ bản
├── HTML/CSS
└── Git cơ bản

Giai đoạn 2: Frontend (3 tuần)
├── React cơ bản
├── Next.js App Router
├── Tailwind CSS
├── Form handling
└── State management

Giai đoạn 3: Backend (4 tuần)
├── Node.js
├── NestJS framework
├── Prisma ORM
├── REST API
└── JWT Authentication

Giai đoạn 4: Thực hành (4 tuần)
├── Đọc codebase
├── Debug & Fix bugs
├── Thêm tính năng nhỏ
└── Code review

Giai đoạn 5: Nâng cao (tiếp tục)
├── Testing
├── DevOps
├── Performance
└── Security
```

---

## 2. Giai đoạn 1: Nền tảng (Tuần 1-3)

### Tuần 1: JavaScript ES6+

#### Ngày 1-2: Variables & Functions
```javascript
// Học về let, const, var
// Học về arrow functions
// Thực hành: Viết các function cơ bản

// Bài tập: Viết function tính tổng, trung bình, max, min của array
const sum = (arr) => arr.reduce((a, b) => a + b, 0);
const average = (arr) => sum(arr) / arr.length;
const max = (arr) => Math.max(...arr);
const min = (arr) => Math.min(...arr);
```

#### Ngày 3-4: Array Methods
```javascript
// Học: map, filter, reduce, find, some, every, forEach

// Bài tập: Xử lý array users
const users = [
  { id: 1, name: 'John', age: 25, active: true },
  { id: 2, name: 'Jane', age: 30, active: false },
  { id: 3, name: 'Bob', age: 20, active: true },
];

// 1. Lấy danh sách tên
const names = users.map(u => u.name);
// ['John', 'Jane', 'Bob']

// 2. Lọc users active
const activeUsers = users.filter(u => u.active);

// 3. Tìm user theo id
const user = users.find(u => u.id === 2);

// 4. Tính tổng tuổi
const totalAge = users.reduce((sum, u) => sum + u.age, 0);
```

#### Ngày 5-7: Async/Await
```javascript
// Học: Promise, async/await, try/catch

// Bài tập: Fetch data từ API giả lập
const fetchUser = async (id) => {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) throw new Error('User not found');
    return await response.json();
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
};

// Chạy song song nhiều requests
const fetchAllData = async () => {
  const [users, posts] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/posts').then(r => r.json())
  ]);
  return { users, posts };
};
```

### Tuần 2: TypeScript

#### Ngày 1-2: Basic Types
```typescript
// Học: string, number, boolean, array, object, any, unknown

// Bài tập: Định nghĩa types cho data
type User = {
  id: string;
  name: string;
  email: string;
  age?: number; // optional
  role: 'admin' | 'user'; // union type
};

const user: User = {
  id: '123',
  name: 'John',
  email: 'john@example.com',
  role: 'admin'
};
```

#### Ngày 3-4: Interfaces & Generics
```typescript
// Interface vs Type
interface Product {
  id: string;
  name: string;
  price: number;
}

// Generics
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}

const firstNumber = getFirst([1, 2, 3]); // number | undefined
const firstString = getFirst(['a', 'b']); // string | undefined

// API Response generic
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

const userResponse: ApiResponse<User> = {
  data: { id: '1', name: 'John', email: 'john@test.com', role: 'user' },
  status: 200,
  message: 'Success'
};
```

#### Ngày 5-7: Practical TypeScript
```typescript
// Bài tập: Tạo types cho một ứng dụng todo

type Priority = 'low' | 'medium' | 'high';
type Status = 'todo' | 'in-progress' | 'done';

interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

interface TodoList {
  todos: Todo[];
  addTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): void;
  updateTodo(id: string, updates: Partial<Todo>): void;
  deleteTodo(id: string): void;
  filterByStatus(status: Status): Todo[];
}
```

### Tuần 3: HTML/CSS & Git

#### Ngày 1-3: CSS Flexbox & Grid
```css
/* Flexbox */
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

/* Grid */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Responsive */
.card {
  padding: 1rem;
}

@media (min-width: 768px) {
  .card {
    padding: 2rem;
  }
}
```

#### Ngày 4-5: Git Workflow
```bash
# Bài tập: Thực hành git workflow

# 1. Tạo repo mới
git init
git add .
git commit -m "Initial commit"

# 2. Tạo branch cho feature
git checkout -b feature/add-todo

# 3. Commit changes
git add src/todo.ts
git commit -m "feat: add todo component"

# 4. Push và tạo PR
git push origin feature/add-todo

# 5. Merge sau khi review
git checkout main
git merge feature/add-todo
```

---

## 3. Giai đoạn 2: Frontend (Tuần 4-6)

### Tuần 4: React Cơ bản

#### Ngày 1-2: Components & Props
```tsx
// Functional Component
type ButtonProps = {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
};

const Button = ({ text, onClick, variant = 'primary' }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {text}
    </button>
  );
};

// Usage
<Button text="Click me" onClick={() => alert('Clicked!')} />
```

#### Ngày 3-4: useState & useEffect
```tsx
import { useState, useEffect } from 'react';

const UserProfile = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]); // Re-fetch when userId changes

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
};
```

#### Ngày 5-7: Custom Hooks
```tsx
// Custom hook để fetch data
const useFetch = <T>(url: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch');
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error, refetch: fetchData };
};

// Usage
const UserList = () => {
  const { data: users, loading, error } = useFetch<User[]>('/api/users');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};
```

### Tuần 5: Next.js & Tailwind

#### Ngày 1-3: Next.js App Router
```tsx
// app/layout.tsx - Root layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}

// app/users/page.tsx - Server Component (default)
async function UsersPage() {
  // Fetch on server
  const users = await fetchUsers();

  return (
    <div>
      <h1>Users</h1>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}

// app/users/[id]/page.tsx - Dynamic route
async function UserPage({ params }: { params: { id: string } }) {
  const user = await fetchUser(params.id);

  return <div>{user.name}</div>;
}

// components/UserForm.tsx - Client Component
'use client';

import { useState } from 'react';

export function UserForm() {
  const [name, setName] = useState('');

  return (
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  );
}
```

#### Ngày 4-7: Tailwind CSS
```tsx
// Card component với Tailwind
const Card = ({ title, description, image }: CardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  );
};

// Responsive grid
const CardGrid = ({ items }: { items: CardProps[] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item, index) => (
        <Card key={index} {...item} />
      ))}
    </div>
  );
};

// Form styling
const Input = ({ label, error, ...props }: InputProps) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        className={`
          w-full px-3 py-2 border rounded-md
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
```

### Tuần 6: Form & State Management

#### Ngày 1-4: React Hook Form + Zod
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schema
const documentSchema = z.object({
  title: z.string().min(3, 'Tiêu đề ít nhất 3 ký tự'),
  description: z.string().optional(),
  author: z.string().min(1, 'Vui lòng nhập tác giả'),
  subject: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
});

type DocumentForm = z.infer<typeof documentSchema>;

const DocumentForm = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting }
  } = useForm<DocumentForm>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: '',
      description: '',
      author: '',
      keywords: [],
      isPublic: false
    }
  });

  const onSubmit = async (data: DocumentForm) => {
    try {
      await createDocument(data);
      // Success handling
    } catch (error) {
      // Error handling
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>Tiêu đề</label>
        <input {...register('title')} className="input" />
        {errors.title && (
          <span className="text-red-500">{errors.title.message}</span>
        )}
      </div>

      <div>
        <label>Mô tả</label>
        <textarea {...register('description')} className="input" />
      </div>

      <div>
        <label>Công khai</label>
        <input type="checkbox" {...register('isPublic')} />
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Đang lưu...' : 'Lưu'}
      </button>
    </form>
  );
};
```

#### Ngày 5-7: Zustand
```typescript
// stores/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => set({
        user,
        token,
        isAuthenticated: true
      }),

      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false
      }),

      updateUser: (userData) => set({
        user: get().user ? { ...get().user!, ...userData } : null
      })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token
      })
    }
  )
);

// Usage in component
const Header = () => {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header>
      {isAuthenticated ? (
        <div>
          <span>{user?.fullName}</span>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <Link href="/login">Login</Link>
      )}
    </header>
  );
};
```

---

## 4. Giai đoạn 3: Backend (Tuần 7-10)

### Tuần 7: Node.js & NestJS Cơ bản

#### Ngày 1-3: NestJS Structure
```typescript
// Tạo module mới
nest g module documents
nest g controller documents
nest g service documents

// documents.module.ts
@Module({
  imports: [PrismaModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService]
})
export class DocumentsModule {}

// documents.controller.ts
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  findAll() {
    return this.documentsService.findAll();
  }
}

// documents.service.ts
@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.document.findMany();
  }
}
```

#### Ngày 4-7: DTOs & Validation
```typescript
// dto/create-document.dto.ts
import { IsString, IsOptional, IsBoolean, MinLength, IsArray } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @MinLength(3, { message: 'Tiêu đề phải có ít nhất 3 ký tự' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsArray()
  keywords?: string[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

// documents.controller.ts
@Post()
create(@Body() createDto: CreateDocumentDto) {
  return this.documentsService.create(createDto);
}
```

### Tuần 8: Prisma ORM

#### Ngày 1-3: Prisma Schema
```prisma
// prisma/schema.prisma
model User {
  id        String     @id @default(uuid())
  email     String     @unique
  fullName  String
  role      String     @default("USER")
  documents Document[]

  @@map("users")
}

model Document {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  title       String
  description String?
  status      String   @default("ACTIVE")

  @@index([userId])
  @@map("documents")
}
```

#### Ngày 4-7: CRUD Operations
```typescript
// documents.service.ts
@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  // Create
  async create(dto: CreateDocumentDto, userId: string) {
    return this.prisma.document.create({
      data: {
        ...dto,
        userId
      }
    });
  }

  // Read - Find all
  async findAll(userId: string) {
    return this.prisma.document.findMany({
      where: {
        OR: [
          { userId },
          { isPublic: true }
        ],
        status: 'ACTIVE'
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, fullName: true }
        }
      }
    });
  }

  // Read - Find one
  async findOne(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  // Update
  async update(id: string, dto: UpdateDocumentDto, userId: string) {
    const document = await this.findOne(id);

    if (document.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.document.update({
      where: { id },
      data: dto
    });
  }

  // Delete (soft)
  async remove(id: string, userId: string) {
    await this.update(id, { status: 'DELETED' }, userId);
    return { message: 'Document deleted' };
  }
}
```

### Tuần 9: Authentication

#### Ngày 1-4: JWT Implementation
```typescript
// auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    // Check if email exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        passwordHash,
        role: 'USER'
      }
    });

    // Generate token
    const accessToken = this.generateToken(user);

    return { accessToken, user: this.sanitizeUser(user) };
  }

  async login(dto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const valid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate token
    const accessToken = this.generateToken(user);

    return { accessToken, user: this.sanitizeUser(user) };
  }

  private generateToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: User) {
    const { passwordHash, ...result } = user;
    return result;
  }
}
```

#### Ngày 5-7: Guards & Decorators
```typescript
// guards/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractToken(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}

// decorators/current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  }
);

// Usage in controller
@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  @Get()
  findAll(@CurrentUser() user) {
    console.log('Current user:', user);
    return this.documentsService.findAll(user.id);
  }
}
```

### Tuần 10: File Upload & API Docs

#### Ngày 1-4: File Upload
```typescript
// upload.controller.ts
@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, callback) => {
      const allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
      const ext = file.originalname.split('.').pop()?.toLowerCase();

      if (!allowedTypes.includes(ext || '')) {
        return callback(new Error('Invalid file type'), false);
      }

      callback(null, true);
    }
  }))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user
  ) {
    return this.uploadService.saveFile(file, user.id);
  }
}

// upload.service.ts
@Injectable()
export class UploadService {
  private uploadDir = './uploads';

  async saveFile(file: Express.Multer.File, userId: string) {
    const fileName = `${uuid()}${extname(file.originalname)}`;
    const filePath = join(this.uploadDir, fileName);

    // Ensure upload directory exists
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }

    // Write file
    await writeFile(filePath, file.buffer);

    return {
      fileName,
      filePath,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size
    };
  }
}
```

#### Ngày 5-7: Swagger Documentation
```typescript
// main.ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Kho Học Liệu Số API')
  .setDescription('API documentation for Learning Repository')
  .setVersion('1.0')
  .addBearerAuth()
  .addTag('auth', 'Authentication endpoints')
  .addTag('documents', 'Document management')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);

// documents.controller.ts
@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tài liệu' })
  @ApiResponse({ status: 200, description: 'Thành công', type: [Document] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@CurrentUser() user) {
    return this.documentsService.findAll(user.id);
  }
}
```

---

## 5. Giai đoạn 4: Thực hành (Tuần 11-14)

### Tuần 11-12: Đọc & Hiểu Codebase

#### Nhiệm vụ 1: Trace Request Flow
```
Request Flow:
1. User clicks "Login" button (Frontend)
   └─> apps/web/app/(auth)/login/page.tsx
   └─> handleSubmit() calls authApi.login()

2. API Request
   └─> lib/api.ts adds Authorization header
   └─> POST http://localhost:3001/api/auth/login

3. Backend Processing
   └─> AuthController.login()
   └─> AuthService.login()
   └─> PrismaService.user.findUnique()
   └─> bcrypt.compare()
   └─> jwtService.sign()

4. Response
   └─> { accessToken, user }

5. Frontend Handling
   └─> useAuthStore.login(user, token)
   └─> router.push('/dashboard')
```

#### Nhiệm vụ 2: Thêm tính năng đơn giản

**Thêm field `category` cho Document:**

1. Update Prisma Schema:
```prisma
model Document {
  // ... existing fields
  category   String?  // Thêm field mới

  @@map("documents")
}
```

2. Run migration:
```bash
pnpm db:push
```

3. Update DTO:
```typescript
export class CreateDocumentDto {
  // ... existing fields
  @IsOptional()
  @IsString()
  category?: string;
}
```

4. Update Frontend form:
```tsx
<select {...register('category')}>
  <option value="">Select category</option>
  <option value="math">Math</option>
  <option value="physics">Physics</option>
</select>
```

### Tuần 13-14: Mini Project

**Tạo tính năng Comments cho Documents:**

1. Database Schema
2. Backend Module
3. Frontend Component
4. Integration

---

## 6. Giai đoạn 5: Nâng cao (Tuần 15+)

### Topics để tiếp tục học

1. **Testing**
   - Jest unit tests
   - Integration tests
   - E2E tests với Playwright

2. **DevOps**
   - CI/CD với GitHub Actions
   - Docker deployment
   - AWS/Vercel deployment

3. **Performance**
   - Database indexing
   - Caching với Redis
   - Code splitting

4. **Security**
   - Rate limiting
   - Input sanitization
   - Security headers

---

## Tiếp theo

Xem thêm tài nguyên học tập tại:

- [06-resources.md](./06-resources.md) - Tài nguyên học tập chi tiết
