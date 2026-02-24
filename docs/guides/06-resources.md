# Tài Nguyên Học Tập Chi Tiết

Tài liệu này tổng hợp các tài nguyên học tập cho từng công nghệ trong project.

---

## Mục Lục

1. [Tổng quan tài nguyên](#1-tổng-quan-tài-nguyên)
2. [JavaScript & TypeScript](#2-javascript--typescript)
3. [React & Next.js](#3-react--nextjs)
4. [Backend & NestJS](#4-backend--nestjs)
5. [Database & Prisma](#5-database--prisma)
6. [Styling & UI](#6-styling--ui)
7. [Tools & DevOps](#7-tools--devops)
8. [Video courses khuyến nghị](#8-video-courses-khuyến-nghị)

---

## 1. Tổng quan tài nguyên

### 1.1. Thứ tự ưu tiên học

```
Priority 1 (Bắt buộc):
├── JavaScript ES6+
├── TypeScript cơ bản
├── React Hooks
└── Git cơ bản

Priority 2 (Quan trọng):
├── Next.js App Router
├── NestJS
├── Prisma
└── Tailwind CSS

Priority 3 (Nên có):
├── Testing
├── Docker
└── CI/CD
```

### 1.2. Resources Format

| Format | Ưu điểm | Khi nào dùng |
|--------|---------|--------------|
| **Docs chính thức** | Chính xác nhất | Tham khảo, tra cứu |
| **Video courses** | Dễ hiểu | Học concepts mới |
| **Practice projects** | Thực hành | Củng cố kiến thức |
| **Stack Overflow** | Giải quyết vấn đề | Khi gặp lỗi |

---

## 2. JavaScript & TypeScript

### 2.1. JavaScript ES6+

#### Documentation
- 📖 [MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide) - Tham khảo đầy đủ nhất
- 📖 [JavaScript.info](https://javascript.info/) - Modern JavaScript tutorial
- 📖 [ES6 Features](https://es6-features.org/) - Tổng hợp ES6 features

#### Topics cần học
```javascript
// 1. Variables & Scoping
let, const, var           // Block vs Function scope
Temporal Dead Zone        // TDZ với let/const

// 2. Arrow Functions
const add = (a, b) => a + b;

// 3. Destructuring
const { name, age } = user;
const [first, ...rest] = array;

// 4. Spread/Rest
const newObj = { ...oldObj, newProp: value };
const newArr = [...oldArr, newItem];

// 5. Template Literals
const msg = `Hello, ${name}!`;

// 6. Classes
class User {
  constructor(name) { this.name = name; }
  greet() { return `Hi, ${this.name}`; }
}

// 7. Modules
import { something } from './module';
export const myFunc = () => {};

// 8. Promises & Async/Await
const data = await fetch(url);
const [users, posts] = await Promise.all([fetchUsers(), fetchPosts()]);

// 9. Array Methods
map, filter, reduce, find, some, every, includes

// 10. Object Methods
Object.keys(), Object.values(), Object.entries()
```

#### Practice Sites
- 🎯 [Codewars](https://www.codewars.com/) - Solve kata challenges
- 🎯 [LeetCode](https://leetcode.com/) - Algorithm practice

### 2.2. TypeScript

#### Documentation
- 📖 [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/) - Official guide
- 📖 [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/) - Comprehensive guide

#### Topics cần học
```typescript
// 1. Basic Types
let name: string = 'John';
let age: number = 25;
let isActive: boolean = true;
let list: number[] = [1, 2, 3];

// 2. Interfaces & Types
interface User {
  id: string;
  name: string;
  age?: number; // Optional
}

type Role = 'admin' | 'user' | 'guest'; // Union type

// 3. Functions
function greet(name: string): string {
  return `Hello, ${name}`;
}

const add = (a: number, b: number): number => a + b;

// 4. Generics
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}

// 5. Utility Types
Partial<T>     // All properties optional
Required<T>    // All properties required
Pick<T, K>     // Pick specific properties
Omit<T, K>     // Exclude specific properties
Record<K, T>   // Object type with K keys and T values

// 6. Type Guards
function isUser(obj: any): obj is User {
  return obj && typeof obj.name === 'string';
}

// 7. Declaration Merging
declare module 'my-library' {
  export interface MyInterface {
    customProperty: string;
  }
}
```

#### Practice
- 🎯 [TypeScript Playground](https://www.typescriptlang.org/play) - Online editor
- 🎯 [Type Challenges](https://github.com/type-challenges/type-challenges) - TypeScript puzzles

---

## 3. React & Next.js

### 3.1. React

#### Documentation
- 📖 [React Official Docs](https://react.dev/) - New docs với interactive examples
- 📖 [React Beta Docs](https://beta.reactjs.org/) - Latest features

#### Topics cần học
```tsx
// 1. JSX & Components
function Welcome({ name }: { name: string }) {
  return <h1>Hello, {name}</h1>;
}

// 2. Props & State
const [count, setCount] = useState(0);

// 3. useEffect
useEffect(() => {
  document.title = `Count: ${count}`;
}, [count]);

// 4. Custom Hooks
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    setStoredValue(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue] as const;
}

// 5. Context
const ThemeContext = createContext<'light' | 'dark'>('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Children />
    </ThemeContext.Provider>
  );
}

// 6. useCallback & useMemo
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// 7. React.memo
const MyComponent = React.memo(function MyComponent(props) {
  /* render */
});
```

#### Practice Projects
1. **Todo App** - CRUD operations
2. **Weather App** - API integration
3. **E-commerce Cart** - State management

### 3.2. Next.js

#### Documentation
- 📖 [Next.js Docs](https://nextjs.org/docs) - Official documentation
- 📖 [Next.js Learn](https://nextjs.org/learn) - Interactive course

#### Topics cần học
```tsx
// 1. App Router Structure
app/
├── layout.tsx      # Root layout
├── page.tsx        # Home page
├── about/
│   └── page.tsx    # /about
└── blog/
    └── [slug]/
        └── page.tsx  # /blog/:slug

// 2. Server vs Client Components
// Server Component (default)
async function ServerComponent() {
  const data = await fetchData(); // Can use async
  return <div>{data}</div>;
}

// Client Component
'use client';
import { useState } from 'react';

function ClientComponent() {
  const [count, setCount] = useState(0); // Can use hooks
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// 3. Data Fetching
async function Page() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'no-store', // Disable cache
  });
  return <div>{data}</div>;
}

// 4. Server Actions
async function submitForm(formData: FormData) {
  'use server';
  const name = formData.get('name');
  await saveToDatabase(name);
}

// 5. Metadata
export const metadata: Metadata = {
  title: 'My App',
  description: 'Description',
};

// 6. Dynamic Routes
function Page({ params }: { params: { id: string } }) {
  return <div>ID: {params.id}</div>;
}

// 7. Loading & Error States
// loading.tsx
export default function Loading() {
  return <div>Loading...</div>;
}

// error.tsx
'use client';
export default function Error({ error, reset }) {
  return (
    <div>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

---

## 4. Backend & NestJS

### 4.1. Node.js

#### Documentation
- 📖 [Node.js Docs](https://nodejs.org/docs/latest/api/) - API reference
- 📖 [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) - Best practices

### 4.2. NestJS

#### Documentation
- 📖 [NestJS Docs](https://docs.nestjs.com/) - Official documentation
- 📖 [NestJS GitHub](https://github.com/nestjs/nest) - Source code & examples

#### Topics cần học
```typescript
// 1. Modules
@Module({
  imports: [OtherModule],
  controllers: [MyController],
  providers: [MyService],
  exports: [MyService]
})
export class MyModule {}

// 2. Controllers
@Controller('users')
export class UsersController {
  @Get()
  findAll() {}

  @Get(':id')
  findOne(@Param('id') id: string) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {}

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {}

  @Delete(':id')
  remove(@Param('id') id: string) {}
}

// 3. Providers (Services)
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
}

// 4. Guards
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return validateRequest(request);
  }
}

// 5. Interceptors
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');
    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => console.log(`After... ${Date.now() - now}ms`))
      );
  }
}

// 6. Pipes (Validation)
@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // Validate and transform
    return value;
  }
}

// 7. Custom Decorators
export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  }
);

// 8. Exception Filters
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: exception.message
    });
  }
}
```

---

## 5. Database & Prisma

### 5.1. SQL Basics

#### Resources
- 📖 [SQLBolt](https://sqlbolt.com/) - Interactive SQL lessons
- 📖 [SQLZoo](https://sqlzoo.net/) - SQL tutorials

#### Topics cần học
```sql
-- SELECT
SELECT * FROM users WHERE age > 18;
SELECT name, email FROM users ORDER BY created_at DESC;

-- INSERT
INSERT INTO users (name, email) VALUES ('John', 'john@example.com');

-- UPDATE
UPDATE users SET name = 'Jane' WHERE id = 1;

-- DELETE
DELETE FROM users WHERE id = 1;

-- JOIN
SELECT u.name, d.title
FROM users u
JOIN documents d ON u.id = d.user_id;

-- Aggregation
SELECT COUNT(*) FROM users;
SELECT user_id, COUNT(*) as doc_count
FROM documents
GROUP BY user_id
HAVING COUNT(*) > 5;
```

### 5.2. Prisma

#### Documentation
- 📖 [Prisma Docs](https://www.prisma.io/docs) - Official documentation
- 📖 [Prisma Examples](https://github.com/prisma/prisma-examples) - Example projects

#### Topics cần học
```typescript
// 1. Schema Definition
model User {
  id        String     @id @default(uuid())
  email     String     @unique
  name      String
  posts     Post[]
  createdAt DateTime   @default(now())
}

model Post {
  id        String   @id @default(uuid())
  title     String
  content   String?
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
}

// 2. CRUD Operations
// Create
const user = await prisma.user.create({
  data: {
    email: 'john@example.com',
    name: 'John',
    posts: {
      create: { title: 'Hello World' }
    }
  }
});

// Read
const users = await prisma.user.findMany({
  where: { email: { contains: '@example.com' } },
  include: { posts: true },
  orderBy: { createdAt: 'desc' },
  take: 10
});

// Update
await prisma.user.update({
  where: { id: 'user-id' },
  data: { name: 'Jane' }
});

// Delete
await prisma.user.delete({
  where: { id: 'user-id' }
});

// 3. Transactions
await prisma.$transaction([
  prisma.post.deleteMany({ where: { authorId: 'user-id' } }),
  prisma.user.delete({ where: { id: 'user-id' } })
]);

// 4. Raw Queries
const result = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${email}
`;
```

---

## 6. Styling & UI

### 6.1. Tailwind CSS

#### Documentation
- 📖 [Tailwind Docs](https://tailwindcss.com/docs) - Official documentation
- 📖 [Tailwind UI](https://tailwindui.com/) - Component library (paid)
- 📖 [Headless UI](https://headlessui.com/) - Unstyled components

#### Common Patterns
```tsx
// Layout
<div className="flex items-center justify-between">
<div className="grid grid-cols-3 gap-4">
<div className="container mx-auto px-4">

// Typography
<h1 className="text-3xl font-bold text-gray-900">
<p className="text-sm text-gray-500">

// Spacing
<div className="p-4 m-2 gap-3">

// Colors
<button className="bg-blue-500 hover:bg-blue-600 text-white">

// Responsive
<div className="w-full md:w-1/2 lg:w-1/3">

// States
<button className="hover:bg-gray-100 focus:ring-2 disabled:opacity-50">
```

### 6.2. shadcn/ui

#### Documentation
- 📖 [shadcn/ui Docs](https://ui.shadcn.com/) - Component documentation

#### Usage
```bash
# Add component
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
```

---

## 7. Tools & DevOps

### 7.1. Git

#### Resources
- 📖 [Pro Git Book](https://git-scm.com/book/) - Comprehensive guide
- 📖 [GitHub Docs](https://docs.github.com/) - GitHub specific

### 7.2. Docker

#### Documentation
- 📖 [Docker Docs](https://docs.docker.com/) - Official documentation
- 📖 [Docker Hub](https://hub.docker.com/) - Image repository

### 7.3. VS Code

#### Extensions
```
ES7+ React/Redux/React-Native snippets
TypeScript Importer
Prisma
Tailwind CSS IntelliSense
Auto Rename Tag
Bracket Pair Colorizer
GitLens
Thunder Client
```

---

## 8. Video courses khuyến nghị

### 8.1. Tiếng Việt

| Channel | Topics | Quality |
|---------|--------|---------|
| **F8 Fullstack** | React, Node.js | ⭐⭐⭐⭐⭐ |
| **Hỏi Dân IT** | Next.js, NestJS | ⭐⭐⭐⭐ |
| **Tào Thancode** | JavaScript, React | ⭐⭐⭐⭐ |
| **Easy Frontend** | React, TypeScript | ⭐⭐⭐⭐ |

### 8.2. Tiếng Anh

| Channel | Topics | Quality |
|---------|--------|---------|
| **Fireship** | Short, high-quality tutorials | ⭐⭐⭐⭐⭐ |
| **Traversy Media** | Full courses | ⭐⭐⭐⭐⭐ |
| **Ben Awad** | React, Next.js, TypeScript | ⭐⭐⭐⭐ |
| **Theo - t3.gg** | TypeScript, Next.js | ⭐⭐⭐⭐ |

### 8.3. Udemy Courses

| Course | Instructor | Topics |
|--------|------------|--------|
| **React - The Complete Guide** | Maximilian Schwarzmüller | React, Next.js |
| **NestJS - The Complete Guide** | Maximilian Schwarzmüller | NestJS |
| **Complete TypeScript Developer** | Stephen Grider | TypeScript |

---

## Tiếp theo

Nếu có thắc mắc, xem:

- [07-faq.md](./07-faq.md) - Câu hỏi thường gặp
