# Kiến Thức Cần Có Trước Khi Bắt Đầu

Tài liệu này liệt kê các kiến thức bạn cần có để làm việc với project Kho Học Liệu Số.

---

## Mục Lục

1. [Kiến thức cơ bản (Bắt buộc)](#1-kiến-thức-cơ-bản-bắt-buộc)
2. [Kiến thức Frontend](#2-kiến-thức-frontend)
3. [Kiến thức Backend](#3-kiến-thức-backend)
4. [Công cụ cần cài đặt](#4-công-cụ-cần-cài-đặt)

---

## 1. Kiến thức cơ bản (Bắt buộc)

### 1.1. JavaScript ES6+

Bạn cần nắm vững các tính năng ES6+ sau:

#### Variables (let, const)
```javascript
// ❌ Tránh dùng var
var name = 'John'; // Function scope, có thể redeclare

// ✅ Dùng let cho biến thay đổi
let count = 0;
count = 1; // OK

// ✅ Dùng const cho biến không thay đổi
const PI = 3.14;
PI = 3; // ❌ Error: Cannot reassign
```

#### Arrow Functions
```javascript
// Function thường
function add(a, b) {
  return a + b;
}

// Arrow function
const add = (a, b) => a + b;

// Với body nhiều dòng
const calculate = (a, b) => {
  const sum = a + b;
  const product = a * b;
  return { sum, product };
};

// Lưu ý: Arrow function không có `this` riêng
const obj = {
  name: 'John',
  // ❌ Arrow function - this không trỏ đến obj
  greetArrow: () => console.log(this.name),
  // ✅ Function thường - this trỏ đến obj
  greet() {
    console.log(this.name);
  }
};
```

#### Destructuring
```javascript
// Object destructuring
const user = { name: 'John', age: 25, city: 'Hanoi' };
const { name, age } = user;
console.log(name, age); // 'John', 25

// Array destructuring
const colors = ['red', 'green', 'blue'];
const [first, second] = colors;
console.log(first, second); // 'red', 'green'

// Nested destructuring
const { address: { street } } = { address: { street: 'Main St' } };

// Default values
const { nickname = 'Anonymous' } = {};
```

#### Spread & Rest Operator
```javascript
// Spread - Mở rộng array/object
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5]; // [1, 2, 3, 4, 5]

const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 }; // { a: 1, b: 2, c: 3 }

// Rest - Gom phần còn lại
const [first, ...rest] = [1, 2, 3, 4];
console.log(first); // 1
console.log(rest);  // [2, 3, 4]

const { name, ...others } = { name: 'John', age: 25, city: 'Hanoi' };
console.log(others); // { age: 25, city: 'Hanoi' }
```

#### Template Literals
```javascript
const name = 'John';
const age = 25;

// ❌ String concatenation
const msg1 = 'Hello, ' + name + '! You are ' + age + ' years old.';

// ✅ Template literal
const msg2 = `Hello, ${name}! You are ${age} years old.`;

// Multi-line string
const html = `
  <div>
    <h1>${name}</h1>
    <p>Age: ${age}</p>
  </div>
`;
```

#### Array Methods
```javascript
const numbers = [1, 2, 3, 4, 5];

// map - Biến đổi mỗi phần tử
const doubled = numbers.map(n => n * 2);
// [2, 4, 6, 8, 10]

// filter - Lọc phần tử thỏa điều kiện
const evens = numbers.filter(n => n % 2 === 0);
// [2, 4]

// find - Tìm phần tử đầu tiên thỏa điều kiện
const found = numbers.find(n => n > 3);
// 4

// reduce - Gộp tất cả thành 1 giá trị
const sum = numbers.reduce((acc, n) => acc + n, 0);
// 15

// some - Kiểm tra có phần tử nào thỏa điều kiện không
const hasEven = numbers.some(n => n % 2 === 0);
// true

// every - Kiểm tra tất cả phần tử thỏa điều kiện
const allPositive = numbers.every(n => n > 0);
// true

// forEach - Lặp qua từng phần tử (không return)
numbers.forEach((n, index) => {
  console.log(`Index ${index}: ${n}`);
});
```

### 1.2. Async/Await & Promises

#### Promise Basics
```javascript
// Tạo Promise
const fetchData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = true;
      if (success) {
        resolve({ data: 'Hello World' });
      } else {
        reject(new Error('Failed to fetch'));
      }
    }, 1000);
  });
};

// Sử dụng .then/.catch
fetchData()
  .then(result => console.log(result))
  .catch(error => console.error(error))
  .finally(() => console.log('Done'));
```

#### Async/Await
```javascript
// ✅ Async/Await - Code dễ đọc hơn
const getData = async () => {
  try {
    const result = await fetchData();
    console.log(result);
  } catch (error) {
    console.error(error);
  } finally {
    console.log('Done');
  }
};

// Parallel execution
const getMultipleData = async () => {
  // Chạy song song (nhanh hơn)
  const [users, posts] = await Promise.all([
    fetchUsers(),
    fetchPosts()
  ]);

  // Chạy tuần tự (chậm hơn)
  // const users = await fetchUsers();
  // const posts = await fetchPosts();

  return { users, posts };
};
```

### 1.3. TypeScript Cơ bản

#### Types & Interfaces
```typescript
// Primitive types
const name: string = 'John';
const age: number = 25;
const isActive: boolean = true;

// Array
const numbers: number[] = [1, 2, 3];
const names: Array<string> = ['John', 'Jane'];

// Object với type
type User = {
  id: string;
  name: string;
  age?: number; // Optional
};

// Object với interface
interface Product {
  id: string;
  name: string;
  price: number;
}

// Function typing
const add = (a: number, b: number): number => {
  return a + b;
};

// Void - không return
const logMessage = (msg: string): void => {
  console.log(msg);
};

// Union type
type Status = 'active' | 'inactive' | 'pending';
const currentStatus: Status = 'active';

// Intersection type
type WithId = { id: string };
type WithTimestamps = { createdAt: Date; updatedAt: Date };
type Entity = WithId & WithTimestamps;
```

#### Generics
```typescript
// Generic function
const getFirst = <T>(arr: T[]): T | undefined => {
  return arr[0];
};

const firstNumber = getFirst([1, 2, 3]); // number | undefined
const firstString = getFirst(['a', 'b']); // string | undefined

// Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface User {
  id: string;
  name: string;
}

const response: ApiResponse<User> = {
  data: { id: '1', name: 'John' },
  status: 200,
  message: 'Success'
};
```

### 1.4. Git Cơ bản

```bash
# Clone repository
git clone <repository-url>

# Kiểm tra trạng thái
git status

# Thêm file vào staging
git add filename.txt      # Thêm file cụ thể
git add .                 # Thêm tất cả

# Commit changes
git commit -m "feat: add user authentication"

# Push lên remote
git push origin main

# Pull changes từ remote
git pull origin main

# Tạo branch mới
git checkout -b feature/new-feature

# Switch branch
git checkout main

# Merge branch
git merge feature/new-feature
```

---

## 2. Kiến thức Frontend

### 2.1. React Hooks

#### useState
```tsx
import { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
};

// Với object
const [user, setUser] = useState({ name: '', email: '' });

const updateName = (name: string) => {
  setUser(prev => ({ ...prev, name })); // Spread để giữ các field khác
};
```

#### useEffect
```tsx
import { useState, useEffect } from 'react';

const UserProfile = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Chạy khi userId thay đổi
    const fetchUser = async () => {
      setLoading(true);
      const data = await getUser(userId);
      setUser(data);
      setLoading(false);
    };

    fetchUser();

    // Cleanup function (optional)
    return () => {
      console.log('Cleanup on unmount or before next effect');
    };
  }, [userId]); // Dependency array

  if (loading) return <p>Loading...</p>;
  return <div>{user?.name}</div>;
};
```

#### useCallback & useMemo
```tsx
import { useCallback, useMemo } from 'react';

const ExpensiveComponent = ({ items, onItemClick }: Props) => {
  // useCallback - Memoize function
  const handleClick = useCallback((id: string) => {
    onItemClick(id);
  }, [onItemClick]);

  // useMemo - Memoize computed value
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  return (
    <ul>
      {sortedItems.map(item => (
        <li key={item.id} onClick={() => handleClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
};
```

### 2.2. React Hook Form + Zod

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Định nghĩa schema validation
const registerSchema = z.object({
  fullName: z.string().min(2, 'Tên ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string()
    .min(8, 'Mật khẩu ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Cần ít nhất 1 chữ hoa')
    .regex(/[0-9]/, 'Cần ít nhất 1 số'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword']
});

// 2. Tạo type từ schema
type RegisterForm = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  // 3. Setup form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  // 4. Handle submit
  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data);
      reset(); // Reset form sau khi submit thành công
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Full Name */}
      <div>
        <label>Họ tên</label>
        <input
          {...register('fullName')}
          className="w-full border rounded px-3 py-2"
        />
        {errors.fullName && (
          <p className="text-red-500 text-sm">{errors.fullName.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label>Email</label>
        <input
          type="email"
          {...register('email')}
          className="w-full border rounded px-3 py-2"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label>Mật khẩu</label>
        <input
          type="password"
          {...register('password')}
          className="w-full border rounded px-3 py-2"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label>Xác nhận mật khẩu</label>
        <input
          type="password"
          {...register('confirmPassword')}
          className="w-full border rounded px-3 py-2"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-500 text-white py-2 rounded"
      >
        {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
      </button>
    </form>
  );
};
```

### 2.3. Tailwind CSS

```tsx
// Layout cơ bản
<div className="flex items-center justify-between p-4 bg-white shadow-md">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
    Click me
  </button>
</div>

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
  {items.map(item => (
    <div key={item.id} className="p-4 bg-white rounded-lg shadow">
      {item.name}
    </div>
  ))}
</div>

// Conditional classes
const Button = ({ variant = 'primary', children }: ButtonProps) => {
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </button>
  );
};

// Sử dụng clsx hoặc cn utility
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const Button = ({ className, ...props }) => {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded font-medium',
        'bg-blue-500 text-white hover:bg-blue-600',
        className // Cho phép override
      )}
      {...props}
    />
  );
};
```

---

## 3. Kiến thức Backend

### 3.1. NestJS Cấu trúc Module

```typescript
// document.module.ts
import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { PrismaModule } from '../common/services/prisma.module';

@Module({
  imports: [PrismaModule],           // Import modules cần thiết
  controllers: [DocumentsController], // Đăng ký controllers
  providers: [DocumentsService],      // Đăng ký services
  exports: [DocumentsService]         // Export để module khác dùng
})
export class DocumentsModule {}
```

### 3.2. NestJS Controller

```typescript
// documents.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateDocumentDto, UpdateDocumentDto } from './dto';

@Controller('documents')
@UseGuards(JwtAuthGuard) // Bảo vệ tất cả endpoints
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  findAll(@CurrentUser() user, @Query('search') search?: string) {
    return this.documentsService.findAll(user.id, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.documentsService.findOne(id, user.id);
  }

  @Post()
  create(@Body() createDto: CreateDocumentDto, @CurrentUser() user) {
    return this.documentsService.create(createDto, user.id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDocumentDto,
    @CurrentUser() user
  ) {
    return this.documentsService.update(id, updateDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.documentsService.remove(id, user.id);
  }
}
```

### 3.3. NestJS Service

```typescript
// documents.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, search?: string) {
    const where = {
      OR: [
        { userId },                    // Tài liệu của user
        { isPublic: true }             // Hoặc tài liệu công khai
      ],
      status: 'ACTIVE',
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } }
        ]
      })
    };

    return this.prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, fullName: true } } }
    });
  }

  async findOne(id: string, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Kiểm tra quyền truy cập
    if (document.userId !== userId && !document.isPublic) {
      throw new ForbiddenException('Access denied');
    }

    return document;
  }

  async create(dto: CreateDocumentDto, userId: string) {
    return this.prisma.document.create({
      data: {
        ...dto,
        userId,
        keywords: JSON.stringify(dto.keywords || [])
      }
    });
  }

  async update(id: string, dto: UpdateDocumentDto, userId: string) {
    // Kiểm tra ownership
    const document = await this.prisma.document.findUnique({ where: { id } });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (document.userId !== userId) {
      throw new ForbiddenException('You can only update your own documents');
    }

    return this.prisma.document.update({
      where: { id },
      data: {
        ...dto,
        keywords: dto.keywords ? JSON.stringify(dto.keywords) : undefined
      }
    });
  }

  async remove(id: string, userId: string) {
    const document = await this.findOne(id, userId);

    // Soft delete
    return this.prisma.document.update({
      where: { id },
      data: { status: 'DELETED' }
    });
  }
}
```

### 3.4. Prisma Queries

```typescript
// Find many với pagination
const documents = await prisma.document.findMany({
  where: { status: 'ACTIVE' },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' }
});

// Find unique
const user = await prisma.user.findUnique({
  where: { email: 'test@example.com' }
});

// Create với relations
const document = await prisma.document.create({
  data: {
    title: 'New Document',
    user: {
      connect: { id: userId }
    }
  }
});

// Update
await prisma.document.update({
  where: { id: documentId },
  data: { title: 'Updated Title' }
});

// Delete
await prisma.document.delete({
  where: { id: documentId }
});

// Transaction
await prisma.$transaction([
  prisma.document.update({ where: { id: 1 }, data: { status: 'ARCHIVED' } }),
  prisma.log.create({ data: { action: 'archive', documentId: 1 } })
]);

// Aggregation
const stats = await prisma.document.aggregate({
  where: { userId },
  _count: { id: true },
  _sum: { fileSize: true }
});
```

---

## 4. Công cụ cần cài đặt

### 4.1. Bắt buộc

| Công cụ | Phiên bản | Cách cài đặt |
|---------|-----------|--------------|
| **Node.js** | >= 18.0.0 | [nodejs.org](https://nodejs.org/) |
| **pnpm** | >= 9.0.0 | `npm install -g pnpm` |
| **VS Code** | Latest | [code.visualstudio.com](https://code.visualstudio.com/) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |

### 4.2. VS Code Extensions (Khuyến nghị)

```
// Cài đặt qua Extensions Marketplace:
- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Prisma
- Tailwind CSS IntelliSense
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens
- Thunder Client (hoặc Postman)
```

### 4.3. Kiểm tra cài đặt

```bash
# Kiểm tra Node.js
node --version   # v18.x.x trở lên

# Kiểm tra pnpm
pnpm --version   # 9.x.x trở lên

# Kiểm tra Git
git --version
```

---

## Tiếp theo

Sau khi nắm vững các kiến thức trên, hãy đọc tiếp:

- [02-tech-stack.md](./02-tech-stack.md) - Chi tiết công nghệ sử dụng trong project
